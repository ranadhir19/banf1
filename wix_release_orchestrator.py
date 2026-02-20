"""
Wix Release Orchestrator
========================
Single launcher that runs:
1) Native execution agent
2) Post-publish matrix agent
3) Release sign-off markdown summary

Usage:
  python wix_release_orchestrator.py --url https://banfwix.wixsite.com/banf1
  python wix_release_orchestrator.py --url https://banfwix.wixsite.com/banf1 --headless

Exit codes:
  0 = all gates passed
  2 = one or more quality gates failed
  3 = orchestrator/runtime error
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple


ROOT = Path(__file__).resolve().parent
REPORT_DIR = ROOT / "agent_reports"
SUMMARY_DIR = ROOT / "release_signoff"


@dataclass
class RunResult:
    name: str
    exit_code: int
    report_path: Optional[Path]


def _newest_report(pattern: str, created_after: float) -> Optional[Path]:
    if not REPORT_DIR.exists():
        return None
    candidates = [p for p in REPORT_DIR.glob(pattern) if p.stat().st_mtime >= created_after]
    if not candidates:
        return None
    return sorted(candidates, key=lambda p: p.stat().st_mtime)[-1]


def _run_python(script: Path, args: list[str]) -> int:
    cmd = [sys.executable, str(script)] + args
    print(f"\n▶ Running: {' '.join(cmd)}", flush=True)
    proc = subprocess.run(cmd, cwd=str(ROOT))
    return proc.returncode


def _load_json(path: Optional[Path]) -> dict:
    if not path or not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _summary_lines(native_data: dict, matrix_data: dict, native_run: RunResult, matrix_run: RunResult, started: float, finished: float) -> str:
    native_summary = native_data.get("summary", {})
    matrix_summary = matrix_data.get("summary", {})

    p0_gate = bool(matrix_summary.get("p0_gate_pass", False))
    final_ok = (native_run.exit_code == 0) and (matrix_run.exit_code == 0) and p0_gate

    lines = []
    lines.append("# Wix Release Sign-Off Summary")
    lines.append("")
    lines.append(f"- Started: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(started))}")
    lines.append(f"- Finished: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(finished))}")
    lines.append(f"- Duration: {round(finished - started, 2)}s")
    lines.append("")
    lines.append("## Pipeline Steps")
    lines.append(f"- Native execution agent: exit `{native_run.exit_code}`")
    lines.append(f"- Matrix agent: exit `{matrix_run.exit_code}`")
    lines.append("")
    lines.append("## Gate Status")
    lines.append(f"- Matrix P0 gate pass: `{p0_gate}`")
    lines.append(f"- Final release status: `{'PASS' if final_ok else 'FAIL'}`")
    lines.append("")

    if native_summary:
        lines.append("## Native Agent Summary")
        lines.append("```json")
        lines.append(json.dumps(native_summary, indent=2))
        lines.append("```")
        lines.append("")

    if matrix_summary:
        lines.append("## Matrix Agent Summary")
        lines.append("```json")
        lines.append(json.dumps(matrix_summary, indent=2))
        lines.append("```")
        lines.append("")

    lines.append("## Artifacts")
    lines.append(f"- Native report: `{native_run.report_path}`")
    lines.append(f"- Matrix report: `{matrix_run.report_path}`")

    return "\n".join(lines)


def _run_gap_report() -> Optional[Path]:
    script = ROOT / "wix_native_id_gap_report.py"
    if not script.exists():
        return None
    cmd = [sys.executable, str(script)]
    subprocess.run(cmd, cwd=str(ROOT))

    out_dir = ROOT / "release_signoff"
    if not out_dir.exists():
        return None
    files = sorted(out_dir.glob("native_id_gap_*.md"), key=lambda p: p.stat().st_mtime)
    return files[-1] if files else None


def run_orchestration(url: str, headless: bool, site_id: str, editor_url: str) -> Tuple[int, Path]:
    started = time.time()
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    SUMMARY_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: native agent (skip matrix to avoid double-run)
    t0 = time.time()
    native_script = ROOT / "wix_native_execution_agent.py"
    native_args = ["--url", url, "--skip-matrix"]
    if site_id:
        native_args += ["--site-id", site_id]
    if editor_url:
        native_args += ["--editor-url", editor_url]
    if headless:
        native_args.append("--headless")
    native_exit = _run_python(native_script, native_args)
    native_report = _newest_report("wix_native_agent_*.json", t0)
    native_run = RunResult("native", native_exit, native_report)

    # Step 2: matrix agent
    t1 = time.time()
    matrix_script = ROOT / "wix_post_publish_matrix_agent.py"
    matrix_args = ["--url", url]
    if headless:
        matrix_args.append("--headless")
    matrix_exit = _run_python(matrix_script, matrix_args)
    matrix_report = _newest_report("wix_matrix_agent_*.json", t1)
    matrix_run = RunResult("matrix", matrix_exit, matrix_report)

    # Step 3: markdown sign-off
    native_data = _load_json(native_report)
    matrix_data = _load_json(matrix_report)
    finished = time.time()

    summary_md = _summary_lines(native_data, matrix_data, native_run, matrix_run, started, finished)
    gap_file = _run_gap_report()
    if gap_file:
        summary_md += f"\n\n- Native ID gap checklist: `{gap_file}`\n"
    out_path = SUMMARY_DIR / f"release_signoff_{time.strftime('%Y%m%d_%H%M%S')}.md"
    out_path.write_text(summary_md, encoding="utf-8")

    # Gate logic
    p0_pass = bool(matrix_data.get("summary", {}).get("p0_gate_pass", False))
    final_ok = (native_exit == 0) and (matrix_exit == 0) and p0_pass

    return (0 if final_ok else 2), out_path


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Run native+matrix agents and generate release sign-off markdown")
    p.add_argument("--url", default="https://banfwix.wixsite.com/banf1", help="Published URL to validate")
    p.add_argument("--headless", action="store_true", help="Run both agents in headless mode")
    p.add_argument("--site-id", default="", help="Optional Wix site ID override for native execution")
    p.add_argument("--editor-url", default="", help="Optional full Wix editor URL override for native execution")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()
    try:
        code, summary_file = run_orchestration(args.url, args.headless, args.site_id, args.editor_url)
        print(f"\n📄 Sign-off summary: {summary_file}", flush=True)
        raise SystemExit(code)
    except Exception as ex:
        SUMMARY_DIR.mkdir(parents=True, exist_ok=True)
        fail_path = SUMMARY_DIR / f"release_signoff_error_{time.strftime('%Y%m%d_%H%M%S')}.md"
        fail_path.write_text(f"# Release Orchestrator Error\n\n- Error: `{str(ex)}`\n", encoding="utf-8")
        print(f"\n❌ Orchestrator error: {ex}", flush=True)
        print(f"📄 Error summary: {fail_path}", flush=True)
        raise SystemExit(3)
