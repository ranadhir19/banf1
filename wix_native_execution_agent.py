"""
Wix Native Execution Agent
==========================
Autonomous agent to execute end-to-end native Wix Home-page migration tasks
without iframe dependency.

What it does:
1) Preflight checks (CLI auth + required files)
2) Opens Wix Editor and enables Dev Mode
3) Attempts to open Home page code and apply src/pages_backup/Home.js
4) Publishes site
5) Runs post-publish smoke checks on target URL
6) Writes JSON run report

Notes:
- This script is automation-first. Wix Editor UI may change, so it uses fallbacks.
- Credentials are read from environment variables only.

Env vars:
- WIX_EMAIL
- WIX_PASSWORD

Usage:
  python wix_native_execution_agent.py --url https://banfwix.wixsite.com/banf1
  python wix_native_execution_agent.py --url https://banfwix.wixsite.com/banf1 --headless
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import subprocess
import time
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import List, Dict, Any, Optional

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

from wix_post_publish_matrix_agent import WixPostPublishMatrixAgent


ROOT = Path(__file__).resolve().parent
MAPPING_FILE = ROOT / "WIX_ELEMENT_ID_MAPPING.md"
HOME_CODE_FILE = ROOT / "src" / "pages_backup" / "Home.js"
WIX_CONFIG = ROOT / "wix.config.json"
REPORT_DIR = ROOT / "agent_reports"


@dataclass
class StepResult:
    step: str
    ok: bool
    message: str
    details: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentReport:
    started_at: float
    finished_at: float = 0.0
    site_id: str = ""
    site_url: str = ""
    steps: List[StepResult] = field(default_factory=list)
    discovered_ids: List[str] = field(default_factory=list)
    smoke: Dict[str, Any] = field(default_factory=dict)

    @property
    def duration_sec(self) -> float:
        if not self.finished_at:
            return 0.0
        return round(self.finished_at - self.started_at, 2)


class WixNativeExecutionAgent:
    def __init__(
        self,
        site_url: str,
        headless: bool = False,
        run_matrix: bool = True,
        site_id_override: str = "",
        editor_url_override: str = "",
    ):
        self.site_url = site_url.rstrip("/")
        self.headless = headless
        self.run_matrix = run_matrix
        self.report = AgentReport(started_at=time.time(), site_url=self.site_url)

        self.site_id = site_id_override.strip() or self._read_site_id()
        self.editor_url_override = editor_url_override.strip()
        self.report.site_id = self.site_id

        self.wix_email = os.getenv("WIX_EMAIL", "")
        self.wix_password = os.getenv("WIX_PASSWORD", "")

        self.browser = None
        self.context = None
        self.page = None

    def log(self, msg: str) -> None:
        print(msg, flush=True)

    def add_step(self, step: str, ok: bool, message: str, details: Optional[Dict[str, Any]] = None) -> None:
        self.report.steps.append(StepResult(step=step, ok=ok, message=message, details=details or {}))
        icon = "✅" if ok else "❌"
        self.log(f"{icon} {step}: {message}")

    def _read_site_id(self) -> str:
        if not WIX_CONFIG.exists():
            return ""
        try:
            data = json.loads(WIX_CONFIG.read_text(encoding="utf-8"))
            return str(data.get("siteId", ""))
        except Exception:
            return ""

    @staticmethod
    def _run_cmd(cmd: List[str], cwd: Path) -> subprocess.CompletedProcess:
        return subprocess.run(cmd, cwd=str(cwd), text=True, capture_output=True)

    def preflight(self) -> bool:
        ok = True

        if not self.site_id:
            self.add_step("preflight.site_id", False, "Missing siteId in wix.config.json")
            ok = False
        else:
            self.add_step("preflight.site_id", True, f"siteId={self.site_id}")

        for path_key, path in {
            "mapping": MAPPING_FILE,
            "home_code": HOME_CODE_FILE,
        }.items():
            if path.exists():
                self.add_step(f"preflight.file.{path_key}", True, str(path))
            else:
                self.add_step(f"preflight.file.{path_key}", False, f"Missing {path}")
                ok = False

        wix_cmd = ROOT / "node_modules" / ".bin" / "wix.cmd"
        if not wix_cmd.exists():
            self.add_step("preflight.wix_cli", False, f"Missing CLI binary: {wix_cmd}")
            ok = False
        else:
            whoami = self._run_cmd([str(wix_cmd), "whoami"], cwd=ROOT)
            whoami_ok = whoami.returncode == 0 and "Logged in as" in (whoami.stdout or "")
            self.add_step(
                "preflight.wix_auth",
                whoami_ok,
                (whoami.stdout or whoami.stderr).strip()[:220],
            )
            ok = ok and whoami_ok

        self.report.discovered_ids = self._extract_ids_from_mapping()
        if self.report.discovered_ids:
            self.add_step("preflight.id_inventory", True, f"{len(self.report.discovered_ids)} IDs discovered")
        else:
            self.add_step("preflight.id_inventory", False, "No IDs found in mapping file")
            ok = False

        return ok

    def _extract_ids_from_mapping(self) -> List[str]:
        text = MAPPING_FILE.read_text(encoding="utf-8")
        ids = re.findall(r"`([A-Za-z][A-Za-z0-9_]*)`", text)
        # Deduplicate preserving order
        seen = set()
        unique = []
        for i in ids:
            if i not in seen:
                seen.add(i)
                unique.append(i)
        return unique

    async def _click_any(self, selectors: List[str], timeout_ms: int = 5000) -> bool:
        for sel in selectors:
            try:
                el = await self.page.wait_for_selector(sel, timeout=timeout_ms)
                if el and await el.is_visible():
                    await el.click()
                    await asyncio.sleep(1)
                    return True
            except Exception:
                continue
        return False

    async def _fill_if_visible(self, selectors: List[str], value: str) -> bool:
        for sel in selectors:
            try:
                el = await self.page.query_selector(sel)
                if el and await el.is_visible():
                    await el.fill(value)
                    return True
            except Exception:
                continue
        return False

    async def open_and_login(self) -> bool:
        async with async_playwright() as p:
            self.browser = await p.chromium.launch(headless=self.headless, channel="msedge")
            self.context = await self.browser.new_context(viewport={"width": 1600, "height": 1000}, ignore_https_errors=True)
            self.page = await self.context.new_page()

            dashboard_url = f"https://manage.wix.com/dashboard/{self.site_id}"
            await self.page.goto(dashboard_url, wait_until="domcontentloaded", timeout=90000)
            await asyncio.sleep(3)

            cur = self.page.url.lower()
            if "signin" in cur or "login" in cur:
                # Try automated login first
                if self.wix_email and self.wix_password:
                    email_ok = await self._fill_if_visible(
                        [
                            'input[type="email"]',
                            'input[name="email"]',
                            'input[autocomplete="email"]',
                        ],
                        self.wix_email,
                    )
                    if email_ok:
                        await self._click_any(['button[type="submit"]', 'button:has-text("Continue")', 'button:has-text("Next")'])
                        await asyncio.sleep(2)

                    pwd_ok = await self._fill_if_visible(
                        [
                            'input[type="password"]',
                            'input[name="password"]',
                            'input[autocomplete="current-password"]',
                        ],
                        self.wix_password,
                    )
                    if pwd_ok:
                        await self._click_any(['button[type="submit"]', 'button:has-text("Log In")', 'button:has-text("Sign In")'])
                        await asyncio.sleep(6)

                # If still not logged in, allow short manual window
                if "signin" in self.page.url.lower() or "login" in self.page.url.lower():
                    self.log("⚠️ Waiting for manual login (up to 90s)...")
                    try:
                        await self.page.wait_for_url("**/dashboard/**", timeout=90000)
                    except PlaywrightTimeout:
                        self.add_step("editor.login", False, "Login not completed")
                        await self.browser.close()
                        return False

            self.add_step("editor.login", True, f"Logged in URL={self.page.url[:120]}")

            # Open editor
            editor_url = self.editor_url_override or f"https://editor.wix.com/html/editor/web/renderer/edit/{self.site_id}"
            await self.page.goto(editor_url, wait_until="domcontentloaded", timeout=90000)
            await asyncio.sleep(10)
            self.add_step("editor.open", True, f"Editor URL={self.page.url[:120]}")

            # Enable dev mode / code panel
            dev_ok = await self._click_any(
                [
                    'button:has-text("Dev Mode")',
                    'text="Turn on Dev Mode"',
                    '[data-hook*="developer"]',
                    '[aria-label*="Dev"]',
                ],
                timeout_ms=4000,
            )
            if not dev_ok:
                # keyboard fallback
                try:
                    await self.page.keyboard.press("Alt+Shift+C")
                    await asyncio.sleep(2)
                    dev_ok = True
                except Exception:
                    dev_ok = False

            self.add_step("editor.dev_mode", dev_ok, "Dev mode enabled or toggle attempted")

            # Open code panel if needed
            code_ok = await self._click_any(
                [
                    'text="Code Files"',
                    '[data-hook*="code-files"]',
                    'text="Backend"',
                ],
                timeout_ms=3000,
            )
            self.add_step("editor.code_panel", code_ok, "Code panel opened/attempted")

            # Attempt to apply Home.js content into active code editor
            apply_ok = await self._apply_home_code()
            self.add_step("editor.apply_home_code", apply_ok, "Applied Home.js to editor model" if apply_ok else "Could not apply Home.js automatically")

            # Publish
            published = await self._click_any(
                [
                    'button:has-text("Publish")',
                    '[data-hook*="publish"]',
                ],
                timeout_ms=5000,
            )
            if published:
                await asyncio.sleep(3)
                await self._click_any(['button:has-text("Publish")', 'button:has-text("Done")'], timeout_ms=3000)
                await asyncio.sleep(5)
            self.add_step("editor.publish", published, "Publish clicked" if published else "Publish button not found")

            # Keep browser close at end of flow
            await self.browser.close()
            return True

    async def _apply_home_code(self) -> bool:
        """Try multiple methods to set Home page code in Monaco editor."""
        code = HOME_CODE_FILE.read_text(encoding="utf-8")

        # Try to select Home page code tab/file first
        await self._click_any(
            [
                'text="Home"',
                'text="Home.js"',
                '[data-hook*="page-code"]',
            ],
            timeout_ms=2500,
        )

        # Monaco API direct set (most reliable if available)
        try:
            set_ok = await self.page.evaluate(
                """
                (newCode) => {
                  try {
                    if (window.monaco && window.monaco.editor) {
                      const models = window.monaco.editor.getModels();
                      if (models && models.length > 0) {
                        models[0].setValue(newCode);
                        return true;
                      }
                    }
                    return false;
                  } catch (e) {
                    return false;
                  }
                }
                """,
                code,
            )
            if set_ok:
                return True
        except Exception:
            pass

        # Keyboard fallback via editor textarea/inputarea
        try:
            editor_target = await self.page.query_selector(".monaco-editor .inputarea, .CodeMirror textarea, [data-hook*='code-editor']")
            if not editor_target:
                return False
            await editor_target.click()
            await self.page.keyboard.press("Control+A")
            # Insert in chunks to avoid dropping text
            chunk_size = 5000
            for i in range(0, len(code), chunk_size):
                await self.page.keyboard.insert_text(code[i:i + chunk_size])
                await asyncio.sleep(0.05)
            return True
        except Exception:
            return False

    async def smoke_check(self) -> Dict[str, Any]:
        """Run post-publish smoke checks on public site."""
        out: Dict[str, Any] = {
            "url": self.site_url,
            "has_iframe": None,
            "id_presence": {},
            "critical_buttons": {},
        }

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless, channel="msedge")
            ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, ignore_https_errors=True)
            page = await ctx.new_page()

            await page.goto(self.site_url, wait_until="domcontentloaded", timeout=90000)
            await asyncio.sleep(5)

            # iframe detection
            iframe_count = await page.evaluate("document.querySelectorAll('iframe').length")
            out["has_iframe"] = iframe_count > 0
            out["iframe_count"] = iframe_count

            # ID checks (sample critical subset)
            critical_ids = [
                "btnLogin", "btnRegister", "btnJoinBANF", "btnExploreEvents",
                "txtMemberCount", "repeaterEvents", "repeaterNews", "btnSubmitContact",
            ]
            for cid in critical_ids:
                exists = await page.evaluate("(id) => !!document.getElementById(id)", cid)
                out["id_presence"][cid] = bool(exists)

            # Button clickability check (no deep flow)
            for bid in ["btnLogin", "btnRegister", "btnJoinBANF", "btnExploreEvents"]:
                try:
                    clicked = await page.evaluate(
                        """
                        (id) => {
                          const el = document.getElementById(id);
                          if (!el) return false;
                          el.click();
                          return true;
                        }
                        """,
                        bid,
                    )
                    out["critical_buttons"][bid] = bool(clicked)
                except Exception:
                    out["critical_buttons"][bid] = False

            await browser.close()

        return out

    def write_report(self) -> Path:
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        self.report.finished_at = time.time()
        payload = asdict(self.report)
        payload["duration_sec"] = self.report.duration_sec

        ts = time.strftime("%Y%m%d_%H%M%S")
        out = REPORT_DIR / f"wix_native_agent_{ts}.json"
        out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return out

    async def run(self) -> int:
        self.log("=" * 72)
        self.log("WIX NATIVE EXECUTION AGENT")
        self.log("=" * 72)

        if not self.preflight():
            self.add_step("run.preflight_gate", False, "Preflight failed")
            path = self.write_report()
            self.log(f"Report: {path}")
            return 1

        editor_ok = await self.open_and_login()
        if not editor_ok:
            self.add_step("run.editor_gate", False, "Editor execution failed")
            path = self.write_report()
            self.log(f"Report: {path}")
            return 1

        self.report.smoke = await self.smoke_check()

        iframe_ok = not bool(self.report.smoke.get("has_iframe", True))
        ids_ok = all(self.report.smoke.get("id_presence", {}).values()) if self.report.smoke.get("id_presence") else False
        self.add_step("smoke.no_iframe", iframe_ok, f"iframe_count={self.report.smoke.get('iframe_count')}")
        self.add_step("smoke.critical_ids", ids_ok, "All critical IDs present" if ids_ok else "Some critical IDs missing")

        matrix_ok = True
        if self.run_matrix:
            matrix_agent = WixPostPublishMatrixAgent(url=self.site_url, headless=self.headless)
            matrix_exit = await matrix_agent.run()
            matrix_ok = matrix_exit == 0
            self.add_step(
                "matrix.p0_gate",
                matrix_ok,
                "Post-publish matrix passed" if matrix_ok else "Post-publish matrix failed (P0 gate)",
            )

        path = self.write_report()
        self.log(f"Report: {path}")

        final_ok = iframe_ok and ids_ok and matrix_ok
        self.add_step("run.final", final_ok, "Completed successfully" if final_ok else "Completed with issues")
        return 0 if final_ok else 2


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Autonomous Wix native landing execution agent")
    parser.add_argument("--url", default="https://banfwix.wixsite.com/banf1", help="Site URL to verify")
    parser.add_argument("--headless", action="store_true", help="Run browser headless")
    parser.add_argument("--skip-matrix", action="store_true", help="Skip post-publish full interaction matrix")
    parser.add_argument("--site-id", default="", help="Optional Wix site ID override")
    parser.add_argument("--editor-url", default="", help="Optional full Wix editor URL override")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    agent = WixNativeExecutionAgent(
        site_url=args.url,
        headless=args.headless,
        run_matrix=not args.skip_matrix,
        site_id_override=args.site_id,
        editor_url_override=args.editor_url,
    )
    code = asyncio.run(agent.run())
    raise SystemExit(code)
