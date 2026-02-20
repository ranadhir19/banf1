"""
Generate native Wix element gap report from latest agent outputs.

Outputs markdown checklist for missing IDs so editor work can be done quickly.
"""

from __future__ import annotations

import json
import re
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPORT_DIR = ROOT / "agent_reports"
OUT_DIR = ROOT / "release_signoff"
MAPPING = ROOT / "WIX_ELEMENT_ID_MAPPING.md"


def latest(pattern: str) -> Path | None:
    files = sorted(REPORT_DIR.glob(pattern), key=lambda p: p.stat().st_mtime)
    return files[-1] if files else None


def parse_mapping() -> dict[str, dict[str, str]]:
    text = MAPPING.read_text(encoding="utf-8", errors="ignore")
    rows = {}
    for line in text.splitlines():
        if not line.strip().startswith("|"):
            continue
        parts = [p.strip() for p in line.strip().strip("|").split("|")]
        if len(parts) < 3:
            continue
        # Expected: Element Type | Wix ID | Description | ...
        wix_id = parts[1].strip().strip('`')
        if not wix_id or wix_id.lower() in {"wix id", "---"}:
            continue
        rows[wix_id] = {
            "element_type": parts[0],
            "description": parts[2],
        }
    return rows


def main() -> int:
    native = latest("wix_native_agent_*.json")
    matrix = latest("wix_matrix_agent_*.json")

    if not native and not matrix:
        print("No agent reports found.")
        return 1

    mapping = parse_mapping()

    missing_ids: set[str] = set()

    if native:
        nd = json.loads(native.read_text(encoding="utf-8"))
        id_presence = (nd.get("smoke") or {}).get("id_presence") or {}
        for k, v in id_presence.items():
            if not v:
                missing_ids.add(k)

    if matrix:
        md = json.loads(matrix.read_text(encoding="utf-8"))
        for tc in md.get("test_cases", []):
            if tc.get("category") in {"navigation", "hero_cta", "forms", "repeaters"} and not tc.get("passed"):
                name = tc.get("name", "")
                detail = tc.get("details", "")
                if "Missing IDs:" in detail:
                    tail = detail.split("Missing IDs:", 1)[1]
                    for x in tail.split(","):
                        xid = x.strip()
                        if xid:
                            missing_ids.add(xid)
                if name.endswith("_presence"):
                    continue
                if re.match(r"^(nav|btn|input|repeater|txt)[A-Za-z0-9_]+$", name):
                    missing_ids.add(name)

    ts = time.strftime("%Y%m%d_%H%M%S")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"native_id_gap_{ts}.md"

    lines: list[str] = []
    lines.append("# Native Wix Element Gap Checklist")
    lines.append("")
    lines.append("This checklist is generated from latest native + matrix agent reports.")
    lines.append("")
    lines.append(f"- Native report: {native}")
    lines.append(f"- Matrix report: {matrix}")
    lines.append("")

    if not missing_ids:
        lines.append("✅ No missing IDs detected in latest reports.")
    else:
        lines.append(f"## Missing IDs ({len(missing_ids)})")
        lines.append("")
        lines.append("| Wix ID | Element Type | Description |")
        lines.append("|---|---|---|")
        for xid in sorted(missing_ids):
            meta = mapping.get(xid, {})
            lines.append(f"| {xid} | {meta.get('element_type','Unknown')} | {meta.get('description','')} |")

        lines.append("")
        lines.append("## Editor Action")
        lines.append("1. Open Home page in Wix Editor (native elements only).")
        lines.append("2. Create each missing element and assign exact Wix ID.")
        lines.append("3. Publish.")
        lines.append("4. Re-run `run_wix_release.cmd`.")

    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
