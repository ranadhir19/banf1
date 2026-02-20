# BANF Website - Manual Deployment Guide

> **Why manual?** The Wix CLI `publish` command is currently broken due to a Wix CDN bug 
> (`@wix/document-management-wml-converter@1` returns HTTP 404). Until Wix fixes this, 
> all deployment must be done through the Wix Editor in your browser.

---

## 🚀 OPTION A: Wix GitHub Integration (RECOMMENDED)

This auto-syncs your GitHub repo to the Wix Editor — the BEST approach.

### Step 1: Enable GitHub Integration in Wix Editor

1. Go to **https://manage.wix.com** and open the **BANF1** site
2. Click **Edit Site** → opens the Wix Editor
3. In the Editor, enable **Dev Mode** (toggle at top of page)
4. In the left sidebar, click the **{ }** (Code) icon
5. At the bottom-left, click the **⚙️ gear icon** → **GitHub**
6. Click **Connect to GitHub**
7. Authorize Wix to access your GitHub account
8. Select repository: **ranadhir19/banf1**, branch: **main**
9. Click **Connect**

### Step 2: Sync Files

Once connected, Wix will pull all files from the repo:
- `src/backend/*.jsw` → appears under **Backend** in the Code panel
- `src/backend/http-functions.js` → appears as **http-functions.js** in Backend
- `src/public/*` → appears under **Public** in the Code panel
- `src/pages/masterPage/` → syncs to the site's master page code

### Step 3: Publish

1. After sync completes, click **Publish** in the Editor
2. Your site will now have all backend endpoints + public files

---

## 🧱 OPTION A2: Native Wix Landing Page (NO IFRAME)

Use this when you want the Home page built with real Wix elements (recommended to avoid iframe issues).

### What Wix CLI can and cannot do

From the local CLI in this repo, available commands are:
- `dev`
- `preview`
- `publish`
- `install` / `uninstall`
- `login` / `logout` / `whoami`

**Important:** Wix CLI currently does **not** provide a command to auto-create visual page elements/sections/buttons in the Editor canvas.
You still create layout elements in Wix Editor (or Wix Studio), then bind behavior with Velo code synced by CLI/GitHub.

### No-iframe implementation flow

1. In Wix Editor, open **Home** page (do not add HTML iframe).
2. Build the page using native Wix elements (strips/containers/text/buttons/repeaters/forms).
3. Assign IDs exactly from [WIX_ELEMENT_ID_MAPPING.md](WIX_ELEMENT_ID_MAPPING.md).
4. Paste/use page logic from:
  - [src/pages_backup/Home.js](src/pages_backup/Home.js)
5. Keep site-wide logic in:
  - [src/pages/masterPage/index.js](src/pages/masterPage/index.js)
6. Publish from Editor.

### Minimum section set to match current landing design

- Header/nav (`imgLogo`, nav buttons, auth buttons)
- Hero (`txtBengaliWelcome`, `txtEnglishWelcome`, `txtTagline`, CTAs)
- Stats (`txtMemberCount`, `txtEventCount`, `txtSponsorCount`, `txtYearsCount`)
- Quick access tiles (`quickEvents`, `quickMembers`, `quickGallery`, etc.)
- Events repeater (`repeaterEvents` + child IDs)
- News repeater (`repeaterNews` + child IDs)
- Radio widget (`txtRadioStatus`, `btnPlayRadio`, etc.)
- Contact form (`inputName`, `inputEmail`, `inputMessage`, `btnSubmitContact`)

If IDs match, the existing Home Velo logic can run with little/no code rewrite.

For full autonomous execution flow, see:
- [AGENTIC_WIX_NATIVE_MIGRATION_PLAN.md](AGENTIC_WIX_NATIVE_MIGRATION_PLAN.md)

For exact step-by-step build + full test gates, see:
- [WIX_NATIVE_EXECUTION_RUNBOOK.md](WIX_NATIVE_EXECUTION_RUNBOOK.md)

To execute automation-first migration/publish/smoke in one run, use:
- [wix_native_execution_agent.py](wix_native_execution_agent.py)
- [wix_post_publish_matrix_agent.py](wix_post_publish_matrix_agent.py) (full post-publish matrix)
- [wix_release_orchestrator.py](wix_release_orchestrator.py) (single launcher for native + matrix + sign-off markdown)

Example:

```powershell
cd C:\projects\survey\banf_web\wix-github-repo
set WIX_EMAIL=your-email@example.com
set WIX_PASSWORD=your-password
C:\projects\survey\venv\Scripts\python.exe wix_native_execution_agent.py --url https://banfwix.wixsite.com/banf1
```

Notes:
- `wix_native_execution_agent.py` now runs the full post-publish matrix automatically and fails on any P0 gate.
- Use `--skip-matrix` only for troubleshooting.
- To run the matrix standalone:

```powershell
cd C:\projects\survey\banf_web\wix-github-repo
C:\projects\survey\venv\Scripts\python.exe wix_post_publish_matrix_agent.py --url https://banfwix.wixsite.com/banf1 --headless
```

Single-command orchestration (recommended for release sign-off):

```powershell
cd C:\projects\survey\banf_web\wix-github-repo
C:\projects\survey\venv\Scripts\python.exe wix_release_orchestrator.py --url https://banfwix.wixsite.com/banf1 --headless
```

Output:
- Native report JSON in `agent_reports/`
- Matrix report JSON in `agent_reports/`
- Sign-off markdown in `release_signoff/`

If matrix fails due missing native elements, generate a targeted checklist:

```powershell
cd C:\projects\survey\banf_web\wix-github-repo
C:\projects\survey\venv\Scripts\python.exe wix_native_id_gap_report.py
```

This creates `release_signoff/native_id_gap_*.md` with missing Wix IDs and element types.

One-click launcher for release users (double-click):

- [run_wix_release.cmd](run_wix_release.cmd)

This wrapper runs the orchestrator with the default BANF URL and pauses at the end with pass/fail status.
It is configured to use the editor URL:

`https://editor.wix.com/html/editor/web/renderer/edit/5e03cc57-b39c-46a0-8879-040d433ca388?metaSiteId=c13ae8c5-7053-4f2d-9a9a-371869be4395`

---

## 🔧 OPTION B: Manual Code Paste (FALLBACK)

If GitHub integration doesn't work, paste code manually.

### Step 1: Open Wix Editor with Dev Mode

1. Go to **https://manage.wix.com** → open **BANF1** site
2. Click **Edit Site**
3. Enable **Dev Mode** at the top

### Step 2: Add Backend Files

In the Code panel (left sidebar, `{ }` icon):

1. Click **Backend** section
2. For each `.jsw` file listed below, click **+** → **New .jsw file**
3. Name it exactly as shown (without `src/backend/` prefix)
4. Paste the file content from the repo

**Critical backend files to add (in this order):**

| # | File | Purpose |
|---|------|---------|
| 1 | `admin-auth.jsw` | Admin authentication (imported by masterPage) |
| 2 | `members.jsw` | Member management |
| 3 | `member-auth.jsw` | Member authentication |
| 4 | `events.jsw` | Event management |
| 5 | `radio.jsw` | Radio/streaming |
| 6 | `sponsor-management.jsw` | Sponsors |
| 7 | `photo-gallery-service.jsw` | Photo gallery |
| 8 | `surveys.jsw` | Surveys |
| 9 | `complaints.jsw` | Complaints |
| 10 | `guide.jsw` | Community guide |
| 11 | `magazine.jsw` | Magazine |
| 12 | `documents.jsw` | Documents |
| 13 | `email-gateway.jsw` | Email service |
| 14 | `zelle-service.jsw` | Zelle payments |
| 15 | `setup-collections.jsw` | Collection setup |
| 16 | `http-functions.js` | **REST API endpoints** (special file) |

> **Note:** `http-functions.js` is a special Wix file. It should already appear 
> in the Backend section. If not, create it — Wix recognizes this filename automatically.

**Remaining backend files (add all 48 .jsw files):**
- accounting-ledger.jsw, ad-management.jsw, admin.jsw, analytics-service.jsw
- automation-framework.jsw, budget-finance-service.jsw, carpool-transport-service.jsw
- checkin-kiosk-service.jsw, communication-hub.jsw, community-engagement.jsw
- contact-service.jsw, dashboard-service.jsw, email.jsw, event-automation.jsw
- evite-service.jsw, feedback-survey-service.jsw, finance.jsw
- insights-analytics.jsw, member-automation.jsw, member-directory-service.jsw
- member-registration-flow.jsw, membership.jsw, notification-service.jsw
- payment-automation.jsw, payment-processing.jsw, qr-code-service.jsw
- radio-scheduler.jsw, reporting-module.jsw, specialized-admin-roles.jsw
- sponsorship.jsw, streaming-service.jsw, vendor-management.jsw, volunteer-service.jsw

### Step 3: Add Public Files

1. In the Code panel, click **Public** section
2. Click **+** → **New File**
3. Add these public files:

| File | Size | Purpose |
|------|------|---------|
| `wix-embed-landing.html` | 612 KB | Main landing page (v2) |
| `constants.js` | 3 KB | Shared constants |
| `utils.js` | 5 KB | Shared utilities |
| `admin-portal.html` | 63 KB | Admin portal interface |
| `member-portal.html` | 54 KB | Member portal interface |

### Step 4: Add Master Page Code

1. In the Code panel, click on **masterPage.js** (should already exist)
2. Replace its content with the code from `src/pages/masterPage/index.js`

### Step 5: Set Up the Landing Page

> Prefer **Option A2** above for native Wix elements (no iframe).
> Use this iframe path only as fallback.

**To display the landing page as the Home page:**

1. In the Wix Editor, select the **Home** page
2. Add an **HTML iFrame** element:
   - Click **+** (Add Elements) → **Embed & Social** → **HTML iFrame**
3. Set the iFrame source to:
   ```
   https://raw.githubusercontent.com/ranadhir19/banf1/main/src/public/wix-embed-landing.html
   ```
   **OR** use the Wix public file URL (after upload):
   ```
   /public/wix-embed-landing.html
   ```
4. Set the iFrame to **Full Width** and appropriate height (e.g., 3000px)
5. Position it to fill the page

### Step 6: Add Page Code (Optional)

For each page you want custom Velo code:

1. Navigate to the page in the Editor
2. In the Code panel, the page's code file appears at the bottom
3. Paste the code from the corresponding file in `src/pages_backup/`:

| Page | Code File |
|------|-----------|
| Home | `Home.js` (907 lines - full landing page logic) |
| Events | `Events.js` |
| Members | `Members.js` |
| Gallery | `Gallery.js` |
| Radio | `Radio.js` |
| Magazine | `Magazine.js` |
| Sponsors | `Sponsors.js` |
| Admin | `Admin.js` |
| Community | `Community.js` |
| Contact | `Contact.js` |
| Volunteer | `Volunteer.js` |
| Reports | `Reports.js` |
| Insights | `Insights.js` |

> **Important:** Page code uses `$w()` selectors that reference specific 
> UI elements on each page. The pages must first be designed in the Editor 
> with the correct element IDs before the code will work.

### Step 7: Publish

1. Click **Publish** in the top-right of the Editor
2. Test the site at: `https://banfwix.wixsite.com/banf1`
3. Test backend endpoints at: `https://banfwix.wixsite.com/banf1/_functions/health`

---

## 🧪 Testing Endpoints After Deployment

Once published, test these URLs:

```
GET  https://banfwix.wixsite.com/banf1/_functions/health
GET  https://banfwix.wixsite.com/banf1/_functions/get_events
GET  https://banfwix.wixsite.com/banf1/_functions/get_members
GET  https://banfwix.wixsite.com/banf1/_functions/zelle_health
POST https://banfwix.wixsite.com/banf1/_functions/setup_collections
```

Expected response for `/health`:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-02-15T...",
  "version": "2.0.0",
  "endpoints": { ... }
}
```

---

## 📋 File Inventory

### Backend (49 files)
```
src/backend/
├── http-functions.js      ← REST API (14 module imports, 40+ endpoints)
├── admin-auth.jsw         ← Admin auth (imported by masterPage)
├── admin.jsw
├── members.jsw
├── member-auth.jsw
├── events.jsw
├── radio.jsw
├── sponsor-management.jsw
├── photo-gallery-service.jsw
├── surveys.jsw
├── complaints.jsw
├── guide.jsw
├── magazine.jsw
├── documents.jsw
├── email-gateway.jsw
├── zelle-service.jsw
├── setup-collections.jsw
├── ... (32 more .jsw files)
```

### Pages (proper structure)
```
src/pages/
└── masterPage/
    ├── index.js           ← Navigation, user menu, footer, admin check
    ├── data.json          ← {"version": 1}
    ├── structure.xml      ← (empty - design managed by Editor)
    └── style.wcss         ← Styles
```

### Public Files
```
src/public/
├── wix-embed-landing.html  ← 612 KB landing page (v2)
├── admin-portal.html       ← Admin interface
├── member-portal.html      ← Member interface
├── constants.js            ← Shared constants
└── utils.js                ← Shared utilities
```

### Page Code Backup (for manual paste into Editor)
```
src/pages_backup/
├── Home.js                 ← 907 lines - comprehensive landing
├── Events.js, Members.js, Gallery.js, Radio.js
├── Magazine.js, Sponsors.js, Admin.js, Community.js
├── Contact.js, Volunteer.js, Reports.js, Insights.js
├── Ads.js, Home-simple.js, Home.html, Home.mainPage.js
```

---

## 🔄 After BANF1 Works → Deploy to Production

Once BANF1 (banfwix.wixsite.com/banf1) is working:

1. Update `wix.config.json`:
   ```json
   {
     "siteId": "6a4f0362-0394-4e28-8559-f6145dd414e0"
   }
   ```
2. Repeat the same process for **www.jaxbengali.org** (Banf Production)
3. Or use Wix's "Transfer Site" / "Duplicate" feature if available

---

## ⚠️ Known Issues

- **Wix CLI publish is broken**: CDN returns 404 for `@wix/document-management-wml-converter@1`. 
  This affects ALL CLI versions tested (1.0.53, 1.1.90, 1.1.162). No local fix possible.
- **Page code requires matching UI elements**: The `$w()` selectors in page JS files 
  reference specific element IDs. These elements must exist on the page in the Editor.
- **Public file URLs**: After upload, public files are accessible at 
  `https://[site-url]/_public/[filename]`
