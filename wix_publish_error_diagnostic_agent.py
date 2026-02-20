"""
Wix Publish Error Diagnostic Agent
=================================
Interactive screen agent for Wix Editor publish diagnostics.

Purpose:
- Open Wix Editor
- Trigger publish
- Detect UI error banners/dialogs/toasts
- Capture evidence (screenshots + page HTML)
- Emit JSON report with probable root cause categories

Usage:
  python wix_publish_error_diagnostic_agent.py \
    --editor-url "https://editor.wix.com/html/editor/web/renderer/edit/..." \
    --site-id c13ae8c5-7053-4f2d-9a9a-371869be4395
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import re
import time
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import List, Dict, Optional

from playwright.async_api import async_playwright, Page


ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "agent_reports" / "publish_diagnostics"


@dataclass
class Finding:
    source: str
    severity: str
    text: str


@dataclass
class DiagnosticReport:
    started_at: float
    finished_at: float = 0.0
    editor_url: str = ""
    site_id: str = ""
    login_required: bool = False
    publish_clicked: bool = False
    findings: List[Finding] = field(default_factory=list)
    console_errors: List[str] = field(default_factory=list)
    probable_causes: List[str] = field(default_factory=list)
    artifacts: Dict[str, str] = field(default_factory=dict)


class WixPublishErrorDiagnosticAgent:
    def __init__(
        self,
        editor_url: str,
        site_id: str,
        headless: bool = False,
        hold_open: bool = False,
        hold_on_error: bool = False,
        hold_seconds: int = 0,
    ):
        self.editor_url = editor_url
        self.site_id = site_id
        self.headless = headless
        self.hold_open = hold_open
        self.hold_on_error = hold_on_error
        self.hold_seconds = hold_seconds
        self.report = DiagnosticReport(
            started_at=time.time(), editor_url=editor_url, site_id=site_id
        )
        self.page: Optional[Page] = None

    def log(self, msg: str) -> None:
        print(msg, flush=True)

    async def _click_any(self, selectors: List[str], timeout_ms: int = 5000) -> bool:
        for sel in selectors:
            try:
                el = await self.page.wait_for_selector(sel, timeout=timeout_ms)
                if el and await el.is_visible():
                    await el.click()
                    await asyncio.sleep(1.2)
                    return True
            except Exception:
                continue
        return False

    def _append_finding(self, source: str, text: str, severity: str = "error") -> None:
        text = (text or "").strip()
        if not text:
            return
        if len(text) > 500:
            text = text[:500]
        self.report.findings.append(Finding(source=source, severity=severity, text=text))

    async def _collect_ui_errors(self) -> None:
        # Collect likely error text in visible UI containers
        selectors = [
            "[role='alert']",
            "[aria-live='assertive']",
            "[data-hook*='toast']",
            "[data-hook*='notification']",
            "[data-hook*='error']",
            "div:has-text('error')",
            "div:has-text('failed')",
            "div:has-text('certificate')",
            "div:has-text('self-signed')",
            "div:has-text('Network error')",
            "div:has-text('FailedToDeployDocument')",
        ]

        seen = set()
        for sel in selectors:
            try:
                nodes = await self.page.query_selector_all(sel)
                for n in nodes[:20]:
                    try:
                        txt = (await n.inner_text()) or ""
                        txt = " ".join(txt.split())
                        if txt and txt.lower() not in seen:
                            seen.add(txt.lower())
                            if any(k in txt.lower() for k in ["error", "failed", "certificate", "network", "deploy"]):
                                self._append_finding("ui", txt)
                    except Exception:
                        pass
            except Exception:
                pass

    def _infer_probable_causes(self) -> None:
        corpus = "\n".join([f.text for f in self.report.findings] + self.report.console_errors).lower()

        causes = []
        if any(k in corpus for k in ["self-signed", "certificate", "ssl", "tls", "certificate chain"]):
            causes.append("TLS_CERT_CHAIN_OR_PROXY_INTERCEPT")
        if any(k in corpus for k in ["network error", "timeout", "failed to fetch", "econn", "enotfound"]):
            causes.append("NETWORK_CONNECTIVITY_OR_PROXY")
        if any(k in corpus for k in ["failedtodeploydocument", "deploy document", "publish failed"]):
            causes.append("WIX_DEPLOYMENT_SERVICE_FAILURE")
        if any(k in corpus for k in ["forbidden", "unauthorized", "permission", "access denied"]):
            causes.append("AUTH_OR_PERMISSION_ISSUE")
        if any(k in corpus for k in ["syntax", "compile", "build failed", "module not found"]):
            causes.append("PROJECT_BUILD_OR_CODE_ERROR")

        if not causes:
            causes.append("UNKNOWN_REQUIRES_MANUAL_REVIEW")

        self.report.probable_causes = causes

    async def run(self) -> int:
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        ts = time.strftime("%Y%m%d_%H%M%S")

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=self.headless, channel="msedge")
            context = await browser.new_context(ignore_https_errors=True, viewport={"width": 1600, "height": 1000})
            self.page = await context.new_page()

            self.page.on("console", lambda msg: self.report.console_errors.append(msg.text[:300]) if msg.type == "error" else None)

            # 1) Open dashboard for potential login
            dashboard = f"https://manage.wix.com/dashboard/{self.site_id}"
            await self.page.goto(dashboard, wait_until="domcontentloaded", timeout=90000)
            await asyncio.sleep(3)

            if any(k in self.page.url.lower() for k in ["signin", "login"]):
                self.report.login_required = True
                self.log("⚠️ Login required. Waiting up to 120s for manual login...")
                try:
                    await self.page.wait_for_url("**/dashboard/**", timeout=120000)
                except Exception:
                    # capture and stop
                    login_shot = OUT_DIR / f"publish_diag_login_blocked_{ts}.png"
                    await self.page.screenshot(path=str(login_shot), full_page=True)
                    self.report.artifacts["login_blocked_screenshot"] = str(login_shot)
                    self._append_finding("login", "Manual login was not completed before timeout")
                    await browser.close()
                    self._infer_probable_causes()
                    self.report.finished_at = time.time()
                    out_json = OUT_DIR / f"publish_diag_{ts}.json"
                    out_json.write_text(json.dumps(asdict(self.report), indent=2), encoding="utf-8")
                    print(f"Report: {out_json}")
                    return 2

            # 2) Open editor URL
            await self.page.goto(self.editor_url, wait_until="domcontentloaded", timeout=120000)
            await asyncio.sleep(12)

            pre_shot = OUT_DIR / f"publish_diag_editor_loaded_{ts}.png"
            await self.page.screenshot(path=str(pre_shot), full_page=True)
            self.report.artifacts["editor_loaded_screenshot"] = str(pre_shot)

            # 3) Try enabling dev mode (best effort)
            await self._click_any([
                'button:has-text("Dev Mode")',
                'text="Turn on Dev Mode"',
                '[data-hook*="developer"]',
                '[aria-label*="Dev"]',
            ], timeout_ms=3500)

            # 4) Try publish
            clicked = await self._click_any([
                'button:has-text("Publish")',
                '[data-hook*="publish"]',
                '[aria-label*="Publish"]',
            ], timeout_ms=8000)
            self.report.publish_clicked = clicked

            if clicked:
                # confirm publish dialog if present
                await self._click_any([
                    'button:has-text("Publish")',
                    'button:has-text("Done")',
                    'button:has-text("Continue")',
                ], timeout_ms=4000)

            await asyncio.sleep(12)

            # 5) Collect visible error signals
            await self._collect_ui_errors()

            # capture html + screenshot evidence
            html_path = OUT_DIR / f"publish_diag_page_{ts}.html"
            html_path.write_text(await self.page.content(), encoding="utf-8")
            self.report.artifacts["page_html"] = str(html_path)

            post_shot = OUT_DIR / f"publish_diag_after_publish_{ts}.png"
            await self.page.screenshot(path=str(post_shot), full_page=True)
            self.report.artifacts["after_publish_screenshot"] = str(post_shot)

            # Optional manual inspection mode: keep editor open after publish
            should_hold = self.hold_open or (self.hold_on_error and len(self.report.findings) > 0)
            if should_hold and not self.headless:
                if self.hold_seconds > 0:
                    self.log(f"🔎 Holding browser open for manual inspection ({self.hold_seconds}s)...")
                    await asyncio.sleep(self.hold_seconds)
                else:
                    self.log("🔎 Holding browser open for manual inspection. Press Enter in terminal to close...")
                    await asyncio.to_thread(input)

            await browser.close()

        self._infer_probable_causes()
        self.report.finished_at = time.time()

        out_json = OUT_DIR / f"publish_diag_{ts}.json"
        out_json.write_text(json.dumps(asdict(self.report), indent=2), encoding="utf-8")
        print(f"Report: {out_json}")

        # non-zero if any findings exist
        return 0 if not self.report.findings else 2


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Diagnose Wix publish screen errors")
    p.add_argument("--editor-url", required=True, help="Full Wix editor URL")
    p.add_argument("--site-id", required=True, help="Wix meta site ID")
    p.add_argument("--headless", action="store_true", help="Run headless")
    p.add_argument("--hold-open", action="store_true", help="Keep browser open after publish for manual review")
    p.add_argument("--hold-on-error", action="store_true", help="Keep browser open only when publish diagnostics detect findings")
    p.add_argument("--hold-seconds", type=int, default=0, help="When holding open, keep browser open for N seconds (0 = wait for Enter)")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    agent = WixPublishErrorDiagnosticAgent(
        editor_url=args.editor_url,
        site_id=args.site_id,
        headless=args.headless,
        hold_open=args.hold_open,
        hold_on_error=args.hold_on_error,
        hold_seconds=args.hold_seconds,
    )
    raise SystemExit(asyncio.run(agent.run()))
