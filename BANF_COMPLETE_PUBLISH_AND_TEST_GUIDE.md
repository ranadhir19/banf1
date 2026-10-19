# BANF Wix Site — Complete Publish & Test Guide (From Another Laptop)

> **Last Updated:** February 20, 2026  
> **Site:** https://banfwix.wixsite.com/banf1  
> **Repo (primary):** https://github.com/ranadhir19/banf1-wix.git  
> **Repo (mirror):** https://github.com/ranadhir19/banf1.git  
> **Wix Account:** banfjax@gmail.com  
> **SiteId:** `c13ae8c5-7053-4f2d-9a9a-371869be4395`

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone & Setup](#2-clone--setup)
3. [Repository Structure Overview](#3-repository-structure-overview)
4. [Install Dependencies & Update Wix CLI](#4-install-dependencies--update-wix-cli)
5. [Authenticate with Wix](#5-authenticate-with-wix)
6. [Pre-Publish Verification](#6-pre-publish-verification)
7. [Publish the Site](#7-publish-the-site)
8. [Post-Publish: Verify Live Site](#8-post-publish-verify-live-site)
9. [Comprehensive Testing Checklist](#9-comprehensive-testing-checklist)
10. [Wix Velo API & Database Connection Testing](#10-wix-velo-api--database-connection-testing)
11. [Element-by-Element Landing Page Verification](#11-element-by-element-landing-page-verification)
12. [Backend Services Verification](#12-backend-services-verification)
13. [Seed Sample Data for Testing](#13-seed-sample-data-for-testing)
14. [Troubleshooting](#14-troubleshooting)
15. [Quick Reference Commands](#15-quick-reference-commands)

---

## 1. Prerequisites

### Required on the laptop:
- [ ] **Node.js v18+** — Download from https://nodejs.org
- [ ] **Git** — Download from https://git-scm.com
- [ ] **Internet access** — Must NOT be on corporate network (home WiFi / mobile hotspot)
- [ ] **Modern browser** (Chrome/Edge with DevTools)

### Verify installations:
```bash
node --version    # Should show v18.x or v20.x
npm --version     # Should show 9.x or 10.x
git --version     # Should show 2.x+
```

---

## 2. Clone & Setup

### Option A: Clone the Wix repo (recommended)
```bash
git clone https://github.com/ranadhir19/banf1-wix.git
cd banf1-wix
```

### Option B: Clone from the mirror
```bash
git clone https://github.com/ranadhir19/banf1.git
cd banf1
```

### Verify you have the latest commit:
```bash
git log --oneline -3
```

Expected output (should show these commits):
```
0e6e760 docs: add publish guide for non-corporate machine
6b69668 sync: push all backend files and local editor setup to wix remote
b1d2ee1 feat: BANF full site - pages, backend services, element mappings
```

---

## 3. Repository Structure Overview

After cloning, you should see this structure:

```
banf1-wix/
├── wix.config.json              ← Wix site configuration (siteId)
├── package.json                 ← Node dependencies (@wix/cli)
├── jsconfig.json                ← JavaScript config
├── .npmrc                       ← ⚠️ Corporate proxy (MUST rename, see Step 4)
│
├── src/
│   ├── backend/                 ← 51 Velo backend modules (.jsw files)
│   │   ├── sponsors.jsw         ← The file that caused the original error
│   │   ├── sponsor-management.jsw
│   │   ├── admin.jsw
│   │   ├── admin-auth.jsw
│   │   ├── events.jsw
│   │   ├── members.jsw
│   │   ├── membership.jsw
│   │   ├── radio.jsw
│   │   ├── magazine.jsw
│   │   ├── http-functions.js    ← HTTP API endpoints
│   │   └── ... (47 more .jsw files)
│   │
│   ├── public/                  ← 8 client-side files
│   │   ├── utils.js             ← Shared utility functions
│   │   ├── constants.js         ← Site config constants
│   │   ├── landing-page.html    ← Main landing page HTML
│   │   ├── admin-portal.html    ← Admin dashboard HTML
│   │   ├── member-portal.html   ← Member portal HTML
│   │   └── ... (3 more files)
│   │
│   ├── pages/
│   │   └── masterPage/          ← Master page (site shell)
│   │       ├── index.js         ← Empty (intentional — prevents bundling conflicts)
│   │       ├── data.json
│   │       ├── structure.xml
│   │       └── style.wcss
│   │
│   └── pages_backup/            ← 17 page JS files (reference/future use)
│       ├── Home.js              ← Home page with all widgets
│       ├── Sponsors.js          ← Sponsor showcase page
│       ├── Admin.js             ← Admin dashboard page
│       ├── Events.js            ← Events listing page
│       ├── Members.js           ← Members directory
│       ├── Magazine.js          ← Magazine page
│       ├── Radio.js             ← Radio player page
│       ├── Gallery.js           ← Photo gallery page
│       ├── Contact.js           ← Contact form
│       ├── Volunteer.js         ← Volunteer signup
│       ├── Community.js         ← Community engagement
│       ├── Insights.js          ← Analytics/insights
│       ├── Reports.js           ← Reports page
│       └── ... (4 more)
│
├── backend/                     ← 46 backend compatibility copies
│   ├── sponsors.jsw
│   ├── sponsor-management.jsw
│   └── ... (mirrors src/backend/)
│
└── agent_reports/               ← Diagnostic reports (for reference)
```

### Key file counts to verify:
```bash
# Run these to verify everything is present:
ls src/backend/ | wc -l      # Expected: 51
ls src/public/ | wc -l        # Expected: 8
ls src/pages_backup/ | wc -l  # Expected: 17
ls backend/ | wc -l           # Expected: 46
cat wix.config.json            # Should show siteId: c13ae8c5-...
```

---

## 4. Install Dependencies & Update Wix CLI

### Step 4a: Verify the npm registry

The repo's `.npmrc` is configured to use the public npm registry.

```bash
# Confirm .npmrc points at the public registry
cat .npmrc
# It should show: registry=https://registry.npmjs.org/
```

### Step 4b: Install dependencies
```bash
npm install
```

### Step 4c: Update Wix CLI to latest version

**This is the critical fix.** The bundled CLI v1.1.90 references a deleted Wix CDN package.

```bash
npm install @wix/cli@latest --save-dev
```

### Step 4d: Verify CLI version
```bash
npx wix --version
# Should show a version NEWER than 1.1.90
```

---

## 5. Authenticate with Wix

### Login to Wix CLI
```bash
npx wix login
```

This opens a browser window. Log in with:
- **Email:** banfjax@gmail.com
- **Password:** (use the BANF Wix account password)

### Verify authentication
```bash
npx wix whoami
# Expected: banfjax@gmail.com
```

### Verify site connection
```bash
cat wix.config.json
# Should show: siteId: "c13ae8c5-7053-4f2d-9a9a-371869be4395"
```

---

## 6. Pre-Publish Verification

Before publishing, verify all critical files:

### 6a: Backend modules check
```bash
echo "=== Backend Files ==="
ls src/backend/*.jsw | wc -l
echo "Expected: 50 .jsw files + 1 .js file"

echo ""
echo "=== Critical files ==="
ls -la src/backend/sponsors.jsw
ls -la src/backend/sponsor-management.jsw
ls -la src/backend/admin.jsw
ls -la src/backend/events.jsw
ls -la src/backend/members.jsw
ls -la src/backend/http-functions.js
```

### 6b: Verify sponsors.jsw has content
```bash
head -20 src/backend/sponsors.jsw
# Should show import statements and function definitions
```

### 6c: Public files check
```bash
ls src/public/
# Should show: utils.js, constants.js, landing-page.html, admin-portal.html, etc.
```

### 6d: Pages check
```bash
ls -la src/pages/masterPage/
# Should show: index.js, data.json, structure.xml, style.wcss (if present)

cat src/pages/masterPage/index.js
# Should show: // Master Page - intentionally empty...
```

### 6e: Quick validation script
```bash
# Run this one-liner to validate everything:
echo "Backend: $(ls src/backend/ | wc -l) files" && \
echo "Public: $(ls src/public/ | wc -l) files" && \
echo "sponsors.jsw: $(wc -c < src/backend/sponsors.jsw) bytes" && \
echo "CLI: $(npx wix --version)" && \
echo "Auth: $(npx wix whoami 2>&1)" && \
echo "Site: $(cat wix.config.json | grep siteId)"
```

---

## 7. Publish the Site

### 7a: Standard publish
```bash
npx wix publish -y
```

**Expected successful output:**
```
✔ Success  Site published
```

### 7b: If publish fails, try with force flag
```bash
npx wix publish --force
```

### 7c: If still failing, try verbose mode for diagnostics
```bash
npx wix publish -y --verbose 2>&1 | tee publish_output.log
```

### 7d: Check debug log after publish
```bash
cat .wix/debug.log | tail -50
```

---

## 8. Post-Publish: Verify Live Site

### 8a: Open the live site
Open in browser: **https://banfwix.wixsite.com/banf1**

### 8b: Check browser console for errors
1. Open Chrome DevTools (F12)
2. Go to **Console** tab
3. Look for:
   - ❌ `Cannot find module 'backend/sponsors.jsw'` — means backend didn't sync
   - ❌ Any red error messages
   - ✅ No errors = SUCCESS

### 8c: Check Network tab
1. In DevTools → **Network** tab
2. Reload the page
3. Filter by "XHR" or "Fetch"
4. Look for failed requests (red entries)
5. Verify Velo backend calls are succeeding (200 status)

---

## 9. Comprehensive Testing Checklist

### 🏠 Landing Page Elements

| # | Element | What to Check | How to Verify |
|---|---------|---------------|---------------|
| 1 | **Hero Section** | Bengali/English welcome text displays | Visual check — green banner with BANF branding |
| 2 | **Navigation Menu** | All nav links work | Click each: Home, Events, Members, Sponsors, etc. |
| 3 | **Quick Stats** | Member/Event/Sponsor counts load | Numbers should appear (pulled from DB) |
| 4 | **Featured Events** | Event cards display | Should show upcoming events from Events collection |
| 5 | **Sponsor Showcase** | Sponsor logos render by tier | Platinum → Gold → Silver → Bronze sections |
| 6 | **Radio Widget** | Player controls visible | Play button, now-playing info |
| 7 | **Magazine Preview** | Latest issue thumbnail | Should load from Magazine collection |
| 8 | **Membership CTA** | Join button works | Should navigate to membership page |
| 9 | **Contact Form** | Form submits | Fill and submit — check for success toast |
| 10 | **Footer** | Social links, copyright | All links open in new tab |
| 11 | **Mobile Responsive** | Site works on mobile viewport | DevTools → Toggle device toolbar (Ctrl+Shift+M) |
| 12 | **Page Load Speed** | No excessive loading time | Should load within 3-5 seconds |

### 🔐 Admin Portal

| # | Test | Steps |
|---|------|-------|
| 1 | Admin login | Navigate to admin page → enter credentials |
| 2 | Dashboard stats | After login, verify member/event/sponsor counts |
| 3 | Member management | View member list, search, filter |
| 4 | Event management | Create/edit/delete an event |
| 5 | Sponsor management | View sponsor list, update tier |
| 6 | Content management | Edit announcements/magazine content |

### 👥 Member Portal

| # | Test | Steps |
|---|------|-------|
| 1 | Registration | Sign up as new member |
| 2 | Login | Login with member credentials |
| 3 | Profile | View/edit member profile |
| 4 | Event RSVP | RSVP to an event |
| 5 | Directory | View member directory (if authorized) |

---

## 10. Wix Velo API & Database Connection Testing

### 10a: Test backend functions via browser console

After the site loads, open DevTools Console and test:

```javascript
// Test 1: Import and call sponsors backend
import('backend/sponsors.jsw').then(m => {
    console.log('✅ sponsors.jsw imported successfully');
    m.getActiveSponsors().then(s => console.log('Sponsors:', s));
}).catch(e => console.error('❌ sponsors.jsw failed:', e));
```

```javascript
// Test 2: Test sponsor management
import('backend/sponsor-management.jsw').then(m => {
    console.log('✅ sponsor-management.jsw imported');
    m.getSponsorsByTier('gold').then(s => console.log('Gold sponsors:', s));
}).catch(e => console.error('❌ Failed:', e));
```

```javascript
// Test 3: Test events backend
import('backend/events.jsw').then(m => {
    console.log('✅ events.jsw imported');
}).catch(e => console.error('❌ events.jsw failed:', e));
```

### 10b: Verify Wix Data Collections exist

In the Wix Dashboard (https://manage.wix.com):
1. Select your site
2. Go to **CMS** (Content Manager)
3. Verify these collections exist:

| Collection Name | Purpose | Required Fields |
|----------------|---------|-----------------|
| `Sponsors` | Sponsor directory | companyName, tier, logo, website, status |
| `Events` | Event listings | title, date, location, description |
| `Members` | Member directory | name, email, membershipType, status |
| `RadioSchedule` | Radio programming | timeSlot, showName, description |
| `RadioNowPlaying` | Currently playing | title, artist |
| `SongRequests` | Song request queue | songTitle, artist, status |
| `Magazine` | Magazine issues | title, issueNumber, coverImage |
| `Announcements` | News items | title, content, date |
| `Complaints` | Feedback/complaints | subject, description, status |
| `Volunteers` | Volunteer signups | name, skills, availability |
| `Gallery` | Photo gallery | image, caption, album |

### 10c: Test HTTP Functions

After publish, test the HTTP API endpoints:

```bash
# Test from terminal (replace with your site URL)
curl -s "https://banfwix.wixsite.com/banf1/_functions/hello" | head -20

# Or in browser, visit:
# https://banfwix.wixsite.com/banf1/_functions/hello
```

### 10d: Wix Dev Mode Verification (Optional)

If you want to use the Wix Editor to verify:

```bash
npx wix dev
```

This starts the Local Editor. Then:
1. Open the URL it shows (usually `https://editor.wix.com/...`)
2. In the editor, check:
   - **Code Files** panel shows `backend/` with all 51 files
   - **Public** panel shows `utils.js`, `constants.js`, etc.
   - **Pages** panel shows `masterPage`
3. Click **Preview** to test locally

---

## 11. Element-by-Element Landing Page Verification

### Page Layout Sections (top to bottom):

#### 🟢 Section 1: Hero Banner
- **Expected:** Full-width green gradient (#006A4E) with BANF title
- **Content:** Bengali + English welcome text
- **DB Connection:** None (static content)
- **Test:** Visual — loads without broken images

#### 🟢 Section 2: Quick Navigation Cards
- **Expected:** Grid of clickable service cards
- **Buttons:** Events, Members, Sponsors, Radio, Magazine, Gallery, etc.
- **DB Connection:** None (static links)
- **Test:** Click each card → should navigate to correct page

#### 🟢 Section 3: Live Stats Dashboard
- **Expected:** Counter widgets showing real-time numbers
- **Counters:** Total Members, Upcoming Events, Active Sponsors
- **DB Connection:** ✅ `wixData.query("Members")`, `wixData.query("Events")`, `wixData.query("Sponsors")`
- **Test:** Numbers should be non-zero if collections have data

#### 🟢 Section 4: Featured Events
- **Expected:** Carousel/grid of upcoming event cards
- **DB Connection:** ✅ `backend/events.jsw` → `Events` collection
- **Test:** Cards should show event name, date, location

#### 🟢 Section 5: Sponsor Showcase
- **Expected:** Tiered sponsor logos (Platinum → Bronze)
- **DB Connection:** ✅ `backend/sponsor-management.jsw` → `Sponsors` collection
- **Test:** Logos render, clicking opens sponsor website

#### 🟢 Section 6: Radio Player Widget
- **Expected:** Mini radio player with play/pause
- **DB Connection:** ✅ `backend/radio.jsw` → `RadioSchedule`, `RadioNowPlaying`
- **Test:** Shows current show info, play button responds

#### 🟢 Section 7: Magazine Preview
- **Expected:** Latest magazine issue cover
- **DB Connection:** ✅ `backend/magazine.jsw` → `Magazine` collection
- **Test:** Cover image loads, "Read More" links to full issue

#### 🟢 Section 8: Membership CTA
- **Expected:** Call-to-action banner with "Join Now" button
- **DB Connection:** None (links to registration flow)
- **Test:** Button navigates to membership signup

#### 🟢 Section 9: Footer
- **Expected:** Contact info, social links, copyright
- **DB Connection:** None (static)
- **Test:** Social links open correct profiles in new tab

---

## 12. Backend Services Verification

### Complete Backend Module Map

Each `.jsw` file is a Wix Velo backend module. Here's what each does:

| # | Module | Purpose | DB Collections Used |
|---|--------|---------|---------------------|
| 1 | `sponsors.jsw` | Sponsor compatibility layer | Sponsors |
| 2 | `sponsor-management.jsw` | Full sponsor CRUD + tiers | Sponsors |
| 3 | `sponsorship.jsw` | Sponsorship applications | Sponsors, SponsorApplications |
| 4 | `admin.jsw` | Admin operations | Various |
| 5 | `admin-auth.jsw` | Admin authentication | Admins |
| 6 | `events.jsw` | Event management | Events |
| 7 | `event-automation.jsw` | Event reminders/automation | Events |
| 8 | `evite-service.jsw` | Event invitations | Events, Invitations |
| 9 | `members.jsw` | Member directory | Members |
| 10 | `membership.jsw` | Membership management | Members, MembershipPlans |
| 11 | `member-auth.jsw` | Member login/signup | Members |
| 12 | `member-automation.jsw` | Member onboarding flows | Members |
| 13 | `member-registration-flow.jsw` | Registration process | Members |
| 14 | `member-directory-service.jsw` | Public directory | Members |
| 15 | `radio.jsw` | Radio player | RadioSchedule, RadioNowPlaying, SongRequests |
| 16 | `radio-scheduler.jsw` | Schedule management | RadioSchedule |
| 17 | `streaming-service.jsw` | Audio streaming | StreamConfig |
| 18 | `magazine.jsw` | Magazine content | Magazine |
| 19 | `finance.jsw` | Financial records | Transactions |
| 20 | `budget-finance-service.jsw` | Budget management | Budgets |
| 21 | `payment-processing.jsw` | Payment handling | Payments |
| 22 | `payment-automation.jsw` | Recurring payments | Payments |
| 23 | `zelle-service.jsw` | Zelle integration | ZelleTransactions |
| 24 | `dashboard-service.jsw` | Admin dashboard data | Various |
| 25 | `analytics-service.jsw` | Site analytics | Analytics |
| 26 | `insights-analytics.jsw` | Insights reporting | Analytics |
| 27 | `reporting-module.jsw` | Report generation | Various |
| 28 | `email.jsw` | Email sending | — |
| 29 | `email-gateway.jsw` | Email routing | — |
| 30 | `notification-service.jsw` | Push notifications | Notifications |
| 31 | `communication-hub.jsw` | Messaging | Messages |
| 32 | `community-engagement.jsw` | Community features | CommunityPosts |
| 33 | `volunteer-service.jsw` | Volunteer management | Volunteers |
| 34 | `photo-gallery-service.jsw` | Gallery management | Gallery |
| 35 | `documents.jsw` | Document storage | Documents |
| 36 | `complaints.jsw` | Complaint handling | Complaints |
| 37 | `feedback-survey-service.jsw` | Surveys | Surveys |
| 38 | `surveys.jsw` | Survey management | Surveys |
| 39 | `contact-service.jsw` | Contact form | ContactSubmissions |
| 40 | `vendor-management.jsw` | Vendor directory | Vendors |
| 41 | `guide.jsw` | Help/guide content | Guides |
| 42 | `accounting-ledger.jsw` | Accounting records | Ledger |
| 43 | `ad-management.jsw` | Advertisement system | Advertisements |
| 44 | `automation-framework.jsw` | Workflow automation | — |
| 45 | `carpool-transport-service.jsw` | Carpool coordination | CarpoolRides |
| 46 | `checkin-kiosk-service.jsw` | Event check-in | EventCheckins |
| 47 | `qr-code-service.jsw` | QR code generation | — |
| 48 | `setup-collections.jsw` | DB collection setup | — |
| 49 | `specialized-admin-roles.jsw` | Role management | AdminRoles |
| 50 | `http-functions.js` | HTTP API endpoints | Various |

### Velo API Imports Used Across Modules

These Wix Velo APIs must be available after publish:

| Wix API | Used In | Purpose |
|---------|---------|---------|
| `wix-data` | All .jsw files | Database CRUD operations |
| `wix-members-backend` | member-auth, membership | Member authentication |
| `wix-crm-backend` | sponsor-management, events | Triggered emails |
| `wix-window` | Page files | Browser window API |
| `wix-location` | Page files | URL/navigation |
| `wix-users` | Admin.js, page files | User session |
| `wix-fetch` | http-functions, email-gateway | External HTTP calls |
| `wix-secrets-backend` | payment-processing | API key storage |

---

## 13. Seed Sample Data for Testing

After publishing, the site's database collections will be empty. Use the built-in seeding module to populate **30 collections** with realistic Bengali-American community data.

### One-time setup (from browser console or a test page):

```javascript
import { seedAllCollections } from 'backend/seed-data.jsw';

// Seed all 30 collections (idempotent — skips collections that have data)
const result = await seedAllCollections();
console.log(result.summary);
// → "Seeded: 29, Skipped: 1, Failed: 0"
```

### What gets created:
- **8 Members** with realistic Bengali names, FL addresses, 904 area codes
- **7 Events** including Pohela Boishakh, Durga Puja, Ekushey (2 past + 5 upcoming)
- **5 Sponsors** — local Jacksonville businesses with tier assignments
- **7 Radio Schedule** entries with Bengali/English show names
- **3 E-Magazines** + **4 Articles** about culture, recipes, youth
- **4 Jacksonville Guide** listings (restaurants, grocery, mosque, dental)
- **6 Financial Records** + **4 Transactions** — realistic org income/expenses
- **Plus** Admins, Volunteers, Vendors, Documents, Complaints, Surveys, Scholarships, and more

### Other useful commands:

```javascript
import { seedCollection, clearCollection, resetAllCollections, getAvailableSeedCollections } from 'backend/seed-data.jsw';

// Seed just one collection
await seedCollection("Events");

// Clear a collection (⚠️ deletes all records)
await clearCollection("Events");

// Reset everything (⚠️ destructive — clears all, then re-seeds)
await resetAllCollections();

// See what collections and record counts are available
const info = getAvailableSeedCollections();
// → { totalCollections: 30, totalRecords: 105, collections: [...] }
```

> 📖 **Full documentation:** See [`BANF_DATA_SEEDING_GUIDE.md`](BANF_DATA_SEEDING_GUIDE.md)  
> 📦 **Portable seed data:** See [`seed-data/banf_seed_data.json`](seed-data/banf_seed_data.json)

---

## 14. Troubleshooting

### Error: "FailedToDeployDocument"
```
Action IMPORT_SITE failed with error: could not get document management converter package
```
**Cause:** Wix CLI v1.1.90 references deleted CDN package  
**Fix:** Update CLI:
```bash
npm install @wix/cli@latest --save-dev
npx wix publish -y
```

### Error: "Cannot find module 'backend/sponsors.jsw'"
**Cause:** Backend files didn't sync to Wix cloud  
**Fix:** Verify file exists and has content:
```bash
cat src/backend/sponsors.jsw | head -5
# Should show: // Sponsors Compatibility Module
```
Then re-publish:
```bash
npx wix publish -y
```

### Error: "Not logged in" or "Unauthorized"
```bash
npx wix login
# Login with: banfjax@gmail.com
npx wix whoami
```

### Error: "Site not found"
```bash
cat wix.config.json
# Verify: "siteId": "c13ae8c5-7053-4f2d-9a9a-371869be4395"
```

### Error: npm install fails (E503 / ECONNRESET)
**Cause:** Corporate network is blocking npm registry  
**Fix:** Must be on non-corporate network. Also rename `.npmrc`:
```bash
mv .npmrc .npmrc.corporate_bak
npm install --registry=https://registry.npmjs.org/
```

### Blank pages / No data loading
**Cause:** Wix Data collections may not exist yet  
**Fix:** Go to Wix Dashboard → CMS → Create the required collections (see Section 10b)

### Page code not running
**Cause:** Page JS files are in `src/pages_backup/` not in `src/pages/`  
**Fix:** Page code needs to be added via the Wix Editor:
1. Open the Wix Editor (https://manage.wix.com → Edit Site)
2. For each page, add the corresponding code from `src/pages_backup/`
3. Or use `npx wix dev` and add pages through the Local Editor

---

## 15. Quick Reference Commands

### One-liner: Clone → Install → Login → Publish
```bash
git clone https://github.com/ranadhir19/banf1-wix.git && \
cd banf1-wix && \
mv .npmrc .npmrc.corporate_bak 2>/dev/null; \
npm install && \
npm install @wix/cli@latest --save-dev && \
npx wix login && \
npx wix publish -y
```

### Windows PowerShell version:
```powershell
git clone https://github.com/ranadhir19/banf1-wix.git
cd banf1-wix
if (Test-Path .npmrc) { Rename-Item .npmrc .npmrc.corporate_bak }
npm install
npm install @wix/cli@latest --save-dev
npx wix login
npx wix publish -y
```

### After successful publish, push updated package.json back:
```bash
git add package.json package-lock.json
git commit -m "chore: update @wix/cli to latest"
git push origin main
```

### Quick site health check:
```bash
curl -s -o /dev/null -w "HTTP %{http_code} | Size: %{size_download} bytes | Time: %{time_total}s\n" \
  https://banfwix.wixsite.com/banf1
# Expected: HTTP 200 | Size: >50000 bytes | Time: <5s
```

---

## Appendix A: Page Code Reference

The `src/pages_backup/` directory contains page-level Velo code for 17 pages. These define the interactive behavior for each page. Here's what each imports from backend:

| Page File | Backend Imports |
|-----------|-----------------|
| `Home.js` | `wix-data`, `wix-window`, `wix-location`, `wix-users` |
| `Sponsors.js` | `backend/sponsor-management.jsw` (getSponsorsByTier, getActiveSponsors) |
| `Admin.js` | `backend/admin-auth.jsw`, `backend/dashboard-service.jsw` |
| `Events.js` | `backend/events.jsw` |
| `Members.js` | `backend/members.jsw`, `backend/membership.jsw` |
| `Magazine.js` | `backend/magazine.jsw` |
| `Radio.js` | `backend/radio.jsw` |
| `Gallery.js` | `backend/photo-gallery-service.jsw` |
| `Contact.js` | `backend/contact-service.jsw` |
| `Volunteer.js` | `backend/volunteer-service.jsw` |
| `Community.js` | `backend/community-engagement.jsw` |
| `Insights.js` | `backend/insights-analytics.jsw` |
| `Reports.js` | `backend/reporting-module.jsw` |

> **Note:** These page JS files need to be connected to their respective pages in the Wix Editor. After publish, use the Wix Editor to add this code to each page's code panel.

---

## Appendix B: Database Collections Setup

If the Wix Data collections don't exist yet, create them in the CMS:

### Minimal collections to create for a working site:

**1. Sponsors**
```
Fields: companyName (Text), tier (Text), logo (Image), website (URL), 
        description (Text), status (Text), isActive (Boolean)
```

**2. Events**
```
Fields: title (Text), date (DateTime), location (Text), description (RichText),
        image (Image), category (Text), maxAttendees (Number), status (Text)
```

**3. Members**
```
Fields: name (Text), email (Text), phone (Text), membershipType (Text),
        status (Text), joinDate (DateTime), isActive (Boolean)
```

**4. RadioSchedule**
```
Fields: timeSlot (Text), showName (Text), emoji (Text), 
        description (Text), isLive (Boolean)
```

**5. Magazine**
```
Fields: title (Text), issueNumber (Number), coverImage (Image),
        publishDate (DateTime), content (RichText)
```

> Add sample data to each collection so the site has content to display.

---

*Guide generated: February 20, 2026*  
*Both repos synced: `ranadhir19/banf1` and `ranadhir19/banf1-wix`*  
*Latest commit: `0e6e760` on all remotes*
