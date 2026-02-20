# BANF Native Wix Landing Plan (No iFrame)

## Goal
Rebuild the current landing page using native Wix elements + Velo code, avoiding embedded HTML iframe.

## CLI Reality Check
Wix CLI helps with code sync/run/publish workflows, but it does not auto-draw page elements on the canvas.

Verified local CLI commands:
- `wix dev`
- `wix preview`
- `wix publish`
- `wix install` / `wix uninstall`
- `wix login` / `wix whoami`

## Build Sequence
1. Open Wix Editor Home page.
2. Add sections and controls using native Wix components.
3. Assign IDs from `WIX_ELEMENT_ID_MAPPING.md`.
4. Add Home page logic from `src/pages_backup/Home.js`.
5. Publish and validate interactions.

## Section-by-Section Starter Layout

### 1) Header
- IDs: `imgLogo`, `navHome`, `navEvents`, `navMembers`, `navGallery`, `navMagazine`, `navRadio`, `navSponsors`, `navVolunteer`, `navContact`, `btnLogin`, `btnRegister`, `btnUserMenu`

### 2) Hero
- IDs: `txtBengaliWelcome`, `txtEnglishWelcome`, `txtTagline`, `btnJoinBANF`, `btnExploreEvents`, `imgHero`

### 3) Stats
- IDs: `txtMemberCount`, `txtEventCount`, `txtSponsorCount`, `txtYearsCount`

### 4) Quick Access Cards
- IDs: `quickEvents`, `quickMembers`, `quickGallery`, `quickMagazine`, `quickRadio`, `quickVolunteer`, `quickDonate`, `quickCommunity`

### 5) Featured Events
- Parent repeater ID: `repeaterEvents`
- Item IDs: `txtEventTitle`, `txtEventDate`, `txtEventVenue`, `imgEvent`, `btnEventDetails`, `btnRegister`

### 6) News
- Parent repeater ID: `repeaterNews`
- Item IDs: `txtNewsTitle`, `txtNewsDate`, `txtNewsPreview`

### 7) Radio Widget
- IDs: `txtRadioStatus`, `txtCurrentShow`, `txtNextShow`, `btnPlayRadio`, `btnRadioSchedule`

### 8) Contact
- IDs: `inputName`, `inputEmail`, `inputMessage`, `btnSubmitContact`, `txtContactSuccess`

## Validation Checklist
- Navigation links route to expected pages
- Login/Register opens Wix auth flow
- Hero CTAs navigate correctly
- Repeaters render data
- Contact form submits
- No iframe used on Home page

## Rollout
1. Build Home page first.
2. Publish to BANF1 test site.
3. Run interaction tests.
4. Port pattern to remaining pages.
