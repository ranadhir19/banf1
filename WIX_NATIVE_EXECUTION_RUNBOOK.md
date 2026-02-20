# Wix Native Landing Execution Runbook (Step-by-Step)

## Goal
Build and verify a fully working BANF landing page in Wix using native Wix elements (no iframe), with reproducible validation gates.

## Scope
This runbook covers Home page only (first milestone), then provides extension rules for other pages.

## Pre-Flight (must pass before build)

1. Confirm Wix auth:
   - Run `wix whoami` from this project.
   - Expected: Logged-in account shown.
2. Confirm dev dependencies installed in this repo.
3. Confirm source references are available:
   - `WIX_ELEMENT_ID_MAPPING.md`
   - `src/pages_backup/Home.js`
   - `src/pages/masterPage/index.js`

Gate P0:
- Stop if auth missing or Home source files unavailable.

---

## Phase 1: Create Native Wix Layout (No iFrame)

### Step 1. Remove iframe approach from Home
- In Wix Editor Home page, ensure no HTML iframe element is used for landing content.
- If an iframe exists, disable/hide it before native build.

### Step 2. Build section skeleton in this exact order
1. Header/nav container
2. Hero container
3. Stats container
4. Quick access container
5. Featured events container
6. News container
7. Radio widget container
8. Contact container
9. Footer container

### Step 3. Assign required IDs exactly
Use IDs from `WIX_ELEMENT_ID_MAPPING.md`. Minimum required IDs for functional Home:

- Header/nav:
  - `imgLogo`, `navHome`, `navEvents`, `navMembers`, `navGallery`, `navMagazine`, `navRadio`, `navSponsors`, `navVolunteer`, `navContact`, `btnLogin`, `btnRegister`, `btnUserMenu`
- Hero:
  - `txtBengaliWelcome`, `txtEnglishWelcome`, `txtTagline`, `btnJoinBANF`, `btnExploreEvents`, `imgHero`
- Stats:
  - `txtMemberCount`, `txtEventCount`, `txtSponsorCount`, `txtYearsCount`
- Quick access:
  - `quickEvents`, `quickMembers`, `quickGallery`, `quickMagazine`, `quickRadio`, `quickVolunteer`, `quickDonate`, `quickCommunity`
- Events repeater:
  - `repeaterEvents`, `txtEventTitle`, `txtEventDate`, `txtEventVenue`, `imgEvent`, `btnEventDetails`, `btnRegister`
- News repeater:
  - `repeaterNews`, `txtNewsTitle`, `txtNewsDate`, `txtNewsPreview`
- Radio widget:
  - `txtRadioStatus`, `txtCurrentShow`, `txtNextShow`, `btnPlayRadio`, `btnRadioSchedule`
- Contact:
  - `inputName`, `inputEmail`, `inputMessage`, `btnSubmitContact`, `txtContactSuccess`

Gate P0:
- Every required ID present exactly (case-sensitive).

---

## Phase 2: Wire Home Page Logic

### Step 4. Paste Home code
- Open Home page code in Wix Editor.
- Port logic from `src/pages_backup/Home.js`.
- Keep selector names aligned to actual IDs from Phase 1.

### Step 5. Wire site-wide behavior
- Validate master page code using `src/pages/masterPage/index.js`.
- Ensure auth/menu handlers do not conflict with Home handlers.

### Step 6. Save and publish
- Publish from Wix Editor (do not rely on CLI publish if it is unstable).

Gate P0:
- No runtime selector errors in console for required IDs.

---

## Phase 3: Functional Verification Matrix (must execute)

## A. Navigation and identity
1. Click each header nav item once.
2. Verify expected route opens.
3. Click `btnLogin` and `btnRegister`.
4. Verify Wix auth UI appears.

Pass criteria:
- 100% links route correctly.
- Auth actions open expected flow.

## B. Hero and CTA
1. Verify Bengali and English welcome text render.
2. Click `btnJoinBANF` and `btnExploreEvents`.

Pass criteria:
- Text visible and correct.
- CTA routes correct.

## C. Stats
1. Validate all 4 stat fields render values.
2. Simulate no-data fallback (if possible) and verify defaults.

Pass criteria:
- No empty stat placeholders.

## D. Events and News
1. Verify `repeaterEvents` renders item cards.
2. Verify each card shows title/date/venue/image.
3. Verify `repeaterNews` renders title/date/preview.

Pass criteria:
- Repeaters render without console errors.

## E. Radio widget
1. Check `txtRadioStatus` shows expected state.
2. Click `btnPlayRadio`.
3. Click `btnRadioSchedule`.

Pass criteria:
- No blocking errors.

## F. Contact form
1. Submit invalid values and verify validation.
2. Submit valid values and verify success message `txtContactSuccess`.

Pass criteria:
- Validation works and valid submit path succeeds.

## G. Responsive
1. Desktop test (>=1200 px).
2. Tablet test (~768 px).
3. Mobile test (~390 px).

Pass criteria:
- No overlap/cutoff of key controls.

Gate P0:
- Any failed item in A, B, D, or F blocks release.

---

## Phase 4: Defect Triage and Re-test

1. Record defects in three buckets:
   - Layout (missing/incorrect element/ID)
   - Wiring (handler/selector/navigation)
   - Data (query/collection/permission)
2. Fix by owner.
3. Re-run only failed matrix items + smoke of all sections.

Exit criteria:
- P0 defects = 0
- P1 defects accepted by owner

---

## Phase 5: Production Readiness

1. Run final smoke checklist:
   - Header nav
   - Hero CTAs
   - Events/news loaded
   - Contact submit
2. Capture screenshots for desktop/tablet/mobile.
3. Publish and verify live URL.

---

## Quick Smoke Checklist (copy/paste)

- [ ] No iframe on Home page
- [ ] All required IDs present
- [ ] Header nav links pass
- [ ] Login/register opens auth flow
- [ ] Hero CTAs pass
- [ ] Stats visible
- [ ] Events repeater renders
- [ ] News repeater renders
- [ ] Radio controls responsive
- [ ] Contact form validates and submits
- [ ] Desktop/tablet/mobile visual pass

---

## If Something Fails

- Selector missing:
  - Compare element ID in Editor with `WIX_ELEMENT_ID_MAPPING.md`.
- Runtime function error:
  - Compare Home code with `src/pages_backup/Home.js`.
- Data not loading:
  - Validate collection names/permissions and backend function availability.

---

## Recommended cadence
- Execute this runbook in one focused Home-page sprint.
- Only after Home is stable, expand same pattern to other pages.
