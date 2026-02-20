# Agentic Plan: BANF Native Wix Landing (No iFrame)

## Objective
Rebuild the current BANF landing page using native Wix elements and Velo code, with autonomous agents handling discovery, build, verification, and hardening.

## Execution Model (Agentic)
Use a multi-agent loop:

1. Plan Agent
2. Layout Agent
3. Wiring Agent
4. Data Agent
5. QA Agent
6. Release Agent

Each agent produces artifacts, hands off to the next agent, and receives feedback from QA for iteration.

---

## Agent Roles

### 1) Plan Agent
Inputs:
- Current reference UI: wix-embed-landing-v2.html
- Element map: WIX_ELEMENT_ID_MAPPING.md
- Home logic: src/pages_backup/Home.js

Outputs:
- Section inventory
- Component blueprint
- Priority order (P0/P1/P2)
- Risk list

Success criteria:
- 100% required Home sections mapped
- IDs cataloged and conflict-free

---

### 2) Layout Agent
Task:
- Build Home page visually in Wix Editor (native elements only)
- No iframe usage

Build order:
1. Header/nav
2. Hero
3. Stats
4. Quick access cards
5. Featured events repeater
6. News repeater
7. Radio widget
8. Contact form
9. Footer

Outputs:
- Screenshot per section
- Element inventory with final Wix IDs

Success criteria:
- All required IDs from WIX_ELEMENT_ID_MAPPING.md placed
- Mobile + desktop layout passes visual review

---

### 3) Wiring Agent
Task:
- Bind interactions and navigation
- Import and adapt logic from src/pages_backup/Home.js

Outputs:
- Home page code wired to real IDs
- masterPage wiring aligned with src/pages/masterPage/index.js

Success criteria:
- No missing selector errors
- Nav/login/CTA flows run end-to-end

---

### 4) Data Agent
Task:
- Connect repeaters/forms to live data sources
- Validate backend function dependencies and collection names

Outputs:
- Data contract checklist
- Repeater bindings and fallback behavior

Success criteria:
- Events/news/radio render from data
- Contact submit path works

---

### 5) QA Agent
Task:
- Execute deterministic interaction matrix
- Validate functional + visual + responsive behavior

Tests:
- Navigation matrix
- CTA matrix
- Repeater rendering states (empty/normal/error)
- Form validation and submit
- Logged in/out state handling

Outputs:
- Defect list with severity
- Repro steps and owner assignment

Success criteria:
- P0 defects = 0
- P1 defects <= agreed threshold

---

### 6) Release Agent
Task:
- Publish via Wix Editor
- Run post-publish smoke tests
- Archive release notes

Outputs:
- Release checklist
- Versioned rollback notes

Success criteria:
- Home page is iframe-free in production
- No regression in auth/nav/core CTAs

---

## Iteration Loop
For each sprint cycle:
1. QA Agent reports defects
2. Relevant implementation agent fixes
3. QA retests only impacted matrix + smoke baseline
4. Release Agent publishes after gate pass

Gate policy:
- Block publish on any P0
- Auto-approve patch publish for isolated P2 fixes

---

## Sprint Breakdown (Suggested)

### Sprint 1 (Landing Core)
- Header, Hero, Stats, Quick Access
- Core nav + auth buttons

### Sprint 2 (Dynamic Content)
- Events and News repeaters
- Radio widget

### Sprint 3 (Conversion + Hardening)
- Contact form
- Responsive polish
- Accessibility pass

### Sprint 4 (Stabilization)
- Full regression
- Release hardening and rollback drills

---

## Agent Prompt Templates (Operational)

### Plan Agent Prompt
"Compare wix-embed-landing-v2.html and WIX_ELEMENT_ID_MAPPING.md. Produce a section-by-section build plan for native Wix elements, with exact IDs, dependencies, and risk notes."

### Layout Agent Prompt
"Create Home page sections in Wix Editor using native elements only, assign required IDs exactly, and output section screenshots and ID inventory."

### Wiring Agent Prompt
"Port functional logic from src/pages_backup/Home.js to Home page code, adapting selectors to actual Wix IDs. Report every changed selector and reason."

### QA Agent Prompt
"Run the Home-page interaction matrix. Report failures with severity, repro steps, expected vs actual, and likely ownership (layout/wiring/data)."

---

## Required Artifacts per Cycle
- build/section-id-inventory.json
- build/selector-diff.md
- qa/interaction-matrix-results.json
- qa/visual-baseline-screenshots/
- release/release-notes.md

---

## Immediate Next Actions
1. Freeze Home scope (P0 section list).
2. Execute Layout Agent on Home page only.
3. Execute Wiring Agent for Home IDs.
4. Run QA Agent matrix and iterate to green.
5. Publish Home as first iframe-free milestone.
