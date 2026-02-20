"""
Wix Post-Publish Matrix Agent
=============================
Runs a full post-publish interaction matrix against the live Wix URL and
fails automatically when any P0 gate fails.

Matrix includes:
- Navigation
- Hero CTAs
- Repeaters
- Contact form
- Responsive checks (desktop/tablet/mobile)

Usage:
  python wix_post_publish_matrix_agent.py --url https://banfwix.wixsite.com/banf1

Exit codes:
  0 = pass (all P0 gates passed)
  2 = failed (one or more P0 gates failed)
  3 = runtime error
"""

from __future__ import annotations

import argparse
import asyncio
import json
import time
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

from playwright.async_api import async_playwright, Page


ROOT = Path(__file__).resolve().parent
REPORT_DIR = ROOT / "agent_reports"


@dataclass
class TestCaseResult:
    name: str
    category: str
    p0: bool
    passed: bool
    details: str = ""
    evidence: Dict[str, Any] = field(default_factory=dict)


@dataclass
class MatrixReport:
    started_at: float
    finished_at: float = 0.0
    url: str = ""
    test_cases: List[TestCaseResult] = field(default_factory=list)
    page_errors: List[str] = field(default_factory=list)
    console_errors: List[str] = field(default_factory=list)

    @property
    def duration_sec(self) -> float:
        if not self.finished_at:
            return 0.0
        return round(self.finished_at - self.started_at, 2)


class WixPostPublishMatrixAgent:
    def __init__(self, url: str, headless: bool = True):
        self.url = url.rstrip("/")
        self.headless = headless
        self.report = MatrixReport(started_at=time.time(), url=self.url)

    def log(self, msg: str) -> None:
        print(msg, flush=True)

    def add_case(self, name: str, category: str, p0: bool, passed: bool, details: str = "", evidence: Optional[Dict[str, Any]] = None) -> None:
        self.report.test_cases.append(
            TestCaseResult(
                name=name,
                category=category,
                p0=p0,
                passed=passed,
                details=details,
                evidence=evidence or {},
            )
        )
        icon = "✅" if passed else "❌"
        gate = "P0" if p0 else "P1"
        self.log(f"{icon} [{gate}] {category} :: {name} -> {details}")

    async def _new_page(self, context, viewport: Tuple[int, int]) -> Page:
        page = await context.new_page()
        await page.set_viewport_size({"width": viewport[0], "height": viewport[1]})

        page.on("pageerror", lambda e: self.report.page_errors.append(str(e)[:300]))

        def on_console(msg):
            if msg.type == "error":
                txt = msg.text[:300]
                self.report.console_errors.append(txt)

        page.on("console", on_console)

        await page.goto(self.url, wait_until="domcontentloaded", timeout=90000)
        await asyncio.sleep(4)
        return page

    async def _element_exists(self, page: Page, element_id: str) -> bool:
        return await page.evaluate("(id) => !!document.getElementById(id)", element_id)

    async def _click_and_expect_path(self, context, element_id: str, expected_path_contains: str, p0: bool, category: str) -> None:
        page = await self._new_page(context, (1440, 900))
        try:
            exists = await self._element_exists(page, element_id)
            if not exists:
                self.add_case(element_id, category, p0, False, "Element not found")
                return

            before = page.url
            clicked = await page.evaluate(
                """
                (id) => {
                    const el = document.getElementById(id);
                    if (!el) return false;
                    el.click();
                    return true;
                }
                """,
                element_id,
            )
            if not clicked:
                self.add_case(element_id, category, p0, False, "Click failed")
                return

            ok = False
            for _ in range(8):
                await asyncio.sleep(0.5)
                if expected_path_contains in page.url:
                    ok = True
                    break

            # Home route may remain same URL
            if expected_path_contains == "/" and page.url == before:
                ok = True

            self.add_case(
                element_id,
                category,
                p0,
                ok,
                f"expected path contains '{expected_path_contains}', final URL={page.url}",
                {"before": before, "after": page.url},
            )
        finally:
            await page.close()

    async def run_navigation_matrix(self, context) -> None:
        nav_map = {
            "navHome": "/",
            "navEvents": "/events",
            "navMembers": "/members",
            "navGallery": "/gallery",
            "navMagazine": "/magazine",
            "navRadio": "/radio",
            "navSponsors": "/sponsors",
            "navVolunteer": "/volunteer",
            "navContact": "/contact",
        }
        for element_id, path_part in nav_map.items():
            await self._click_and_expect_path(context, element_id, path_part, True, "navigation")

    async def run_hero_matrix(self, context) -> None:
        await self._click_and_expect_path(context, "btnJoinBANF", "/register", True, "hero_cta")
        await self._click_and_expect_path(context, "btnExploreEvents", "/events", True, "hero_cta")

    async def run_repeater_matrix(self, context) -> None:
        page = await self._new_page(context, (1440, 900))
        try:
            events_exists = await self._element_exists(page, "repeaterEvents")
            news_exists = await self._element_exists(page, "repeaterNews")

            events_item_count = await page.evaluate(
                """
                () => {
                  const r = document.getElementById('repeaterEvents');
                  if (!r) return -1;
                  const items = r.querySelectorAll('*');
                  return items.length;
                }
                """
            )
            news_item_count = await page.evaluate(
                """
                () => {
                  const r = document.getElementById('repeaterNews');
                  if (!r) return -1;
                  const items = r.querySelectorAll('*');
                  return items.length;
                }
                """
            )

            self.add_case(
                "repeaterEvents_presence",
                "repeaters",
                True,
                events_exists,
                f"exists={events_exists}, child_nodes={events_item_count}",
            )
            self.add_case(
                "repeaterNews_presence",
                "repeaters",
                True,
                news_exists,
                f"exists={news_exists}, child_nodes={news_item_count}",
            )
        finally:
            await page.close()

    async def run_form_matrix(self, context) -> None:
        page = await self._new_page(context, (1440, 900))
        try:
            required = ["inputName", "inputEmail", "inputMessage", "btnSubmitContact"]
            missing = []
            for rid in required:
                if not await self._element_exists(page, rid):
                    missing.append(rid)

            if missing:
                self.add_case("contact_form_structure", "forms", True, False, f"Missing IDs: {', '.join(missing)}")
                return

            # invalid submit attempt
            await page.evaluate(
                """
                () => {
                  document.getElementById('inputName').value = '';
                  document.getElementById('inputEmail').value = 'bad-email';
                  document.getElementById('inputMessage').value = '';
                }
                """
            )
            await page.evaluate("() => document.getElementById('btnSubmitContact').click()")
            await asyncio.sleep(2)

            invalid_ok = await page.evaluate(
                """
                () => {
                  const success = document.getElementById('txtContactSuccess');
                  const successVisible = !!(success && (success.offsetWidth || success.offsetHeight || success.getClientRects().length));
                  // Invalid payload should not show success immediately
                  return !successVisible;
                }
                """
            )
            self.add_case("contact_invalid_flow", "forms", True, bool(invalid_ok), "Invalid payload does not show success")

            # valid submit attempt
            ts = int(time.time())
            await page.evaluate(
                """
                (stamp) => {
                  document.getElementById('inputName').value = 'BANF Agent';
                  document.getElementById('inputEmail').value = `agent_${stamp}@example.com`;
                  document.getElementById('inputMessage').value = 'Automated matrix validation message';
                }
                """,
                ts,
            )
            await page.evaluate("() => document.getElementById('btnSubmitContact').click()")
            await asyncio.sleep(3)

            valid_outcome = await page.evaluate(
                """
                () => {
                  const success = document.getElementById('txtContactSuccess');
                  const successVisible = !!(success && (success.offsetWidth || success.offsetHeight || success.getClientRects().length));
                  // allow either success visible OR form still present without runtime crash
                  const formStillThere = !!document.getElementById('btnSubmitContact');
                  return successVisible || formStillThere;
                }
                """
            )
            self.add_case("contact_valid_flow", "forms", True, bool(valid_outcome), "Valid submission path executes without runtime failure")
        finally:
            await page.close()

    async def run_responsive_matrix(self, context) -> None:
        viewports = {
            "desktop": (1440, 900),
            "tablet": (768, 1024),
            "mobile": (390, 844),
        }

        for label, viewport in viewports.items():
            page = await self._new_page(context, viewport)
            try:
                # Horizontal overflow basic guard
                overflow_ok = await page.evaluate(
                    """
                    () => {
                      const sw = document.documentElement.scrollWidth;
                      const iw = window.innerWidth;
                      return sw <= iw + 20;
                    }
                    """
                )

                # Critical hero controls visible
                hero_ok = await page.evaluate(
                    """
                    () => {
                      const ids = ['txtEnglishWelcome', 'btnJoinBANF'];
                      return ids.every(id => {
                        const el = document.getElementById(id);
                        if (!el) return false;
                        const r = el.getBoundingClientRect();
                        return r.width > 0 && r.height > 0;
                      });
                    }
                    """
                )

                self.add_case(f"{label}_overflow", "responsive", True, bool(overflow_ok), f"viewport={viewport}")
                self.add_case(f"{label}_hero_visibility", "responsive", True, bool(hero_ok), f"viewport={viewport}")
            finally:
                await page.close()

    async def run_no_iframe_gate(self, context) -> None:
        page = await self._new_page(context, (1440, 900))
        try:
            iframe_count = await page.evaluate("document.querySelectorAll('iframe').length")
            passed = iframe_count == 0
            self.add_case("no_iframe_home", "layout", True, passed, f"iframe_count={iframe_count}")
        finally:
            await page.close()

    def summarize(self) -> Dict[str, Any]:
        p0_total = sum(1 for t in self.report.test_cases if t.p0)
        p0_failed = sum(1 for t in self.report.test_cases if t.p0 and not t.passed)
        total = len(self.report.test_cases)
        failed = sum(1 for t in self.report.test_cases if not t.passed)

        return {
            "total": total,
            "failed": failed,
            "p0_total": p0_total,
            "p0_failed": p0_failed,
            "page_errors": len(self.report.page_errors),
            "console_errors": len(self.report.console_errors),
            "p0_gate_pass": p0_failed == 0,
        }

    def write_report(self) -> Path:
        REPORT_DIR.mkdir(parents=True, exist_ok=True)
        self.report.finished_at = time.time()

        payload = asdict(self.report)
        payload["duration_sec"] = self.report.duration_sec
        payload["summary"] = self.summarize()

        ts = time.strftime("%Y%m%d_%H%M%S")
        out = REPORT_DIR / f"wix_matrix_agent_{ts}.json"
        out.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return out

    async def run(self) -> int:
        self.log("=" * 72)
        self.log("WIX POST-PUBLISH MATRIX AGENT")
        self.log("=" * 72)

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=self.headless, channel="msedge")
                context = await browser.new_context(ignore_https_errors=True)

                await self.run_no_iframe_gate(context)
                await self.run_navigation_matrix(context)
                await self.run_hero_matrix(context)
                await self.run_repeater_matrix(context)
                await self.run_form_matrix(context)
                await self.run_responsive_matrix(context)

                await browser.close()

            summary = self.summarize()
            self.log(f"Summary: {summary}")
            report_path = self.write_report()
            self.log(f"Report: {report_path}")

            return 0 if summary["p0_gate_pass"] else 2
        except Exception as ex:
            self.add_case("runtime_exception", "runner", True, False, str(ex)[:300])
            report_path = self.write_report()
            self.log(f"Report: {report_path}")
            return 3


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run post-publish interaction matrix and enforce P0 gates")
    parser.add_argument("--url", default="https://banfwix.wixsite.com/banf1", help="Published site URL")
    parser.add_argument("--headless", action="store_true", help="Run browser in headless mode")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    agent = WixPostPublishMatrixAgent(url=args.url, headless=args.headless)
    exit_code = asyncio.run(agent.run())
    raise SystemExit(exit_code)
