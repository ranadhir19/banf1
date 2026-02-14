# 🧪 BANF User Acceptance Testing Guide

**Version:** 1.0  
**Date:** February 2026  
**Site URL:** [https://www.jaxbengali.org/test](https://www.jaxbengali.org/test)  
**Prepared for:** BANF Executive Committee & Community Testers

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Test Credentials (Pre-Built Accounts)](#2-test-credentials)
3. [Testing as a Common Member](#3-testing-as-a-common-member)
4. [Testing as Full Admin (President)](#4-testing-as-full-admin)
5. [Testing EC Roles (Role-Based Access)](#5-testing-ec-roles)
6. [Signing Up with Your Real Name (EC Members)](#6-signing-up-with-your-real-name)
7. [Testing the Public Landing Page](#7-testing-the-public-landing-page)
8. [Mobile Testing (Phone/Tablet)](#8-mobile-testing)
9. [Architecture & Service Notes](#9-architecture--service-notes)
10. [How to Submit Feedback](#10-how-to-submit-feedback)
11. [Feedback Template](#11-feedback-template)
12. [Detailed Test Checklist Reference](#12-detailed-test-checklist)

---

## 1. Getting Started

### How to Access the Test Site

1. Open your browser (Chrome recommended)
2. Go to: **https://www.jaxbengali.org/test**
3. The BANF community website will load inside the page
4. Scroll down to explore all sections

> ⚠️ **Important:** The main homepage at https://www.jaxbengali.org remains unchanged. Only the `/test` page contains the new features being tested.

### What You're Testing

The BANF website includes:
- **Public Landing Page** — Visible to everyone (About, EC Team, Events, Radio, Services, Membership, Sponsorship, Careers, Gallery, Contact)
- **Member Portal** — Login required (Dashboard, Profile, Family, Payments, Events/RSVP, Surveys, Radio, Magazine)
- **Admin Portal** — Admin/EC login required (All management sections based on role)

### Browser Requirements
- ✅ Chrome (recommended), Firefox, Safari, Edge
- ✅ Works on desktop and mobile
- ✅ JavaScript must be enabled

---

## 2. Test Credentials

These are pre-built test accounts. **Use these first** to explore all features before signing up with your own name.

### Member Account

| Field | Value |
|-------|-------|
| **Username** | `member_test` |
| **Password** | `test123` |
| **Name** | Anirban Dasgupta |
| **Type** | Family Membership |
| **Access** | Member Portal only |

**How to login:** Scroll to the top of the page → Click **"Member Login"** button → Enter credentials → Click Login

### Full Admin Account (President)

| Field | Value |
|-------|-------|
| **Username** | `admin_test` |
| **Password** | `admin123` |
| **Name** | Ranadhir Basu |
| **Role** | President (full access) |
| **Access** | All admin sections |

**How to login:** Scroll to About section or Footer → Click **"Admin Login"** → Enter credentials → Click Login

### EC Role Accounts

Each EC role has limited access to only their relevant sections:

| Username | Password | Name | Role | Sections Accessible |
|----------|----------|------|------|-------------------|
| `ec_events` | `events123` | Priya Sen | Event Coordinator | Events, RSVPs, Evite, Volunteers |
| `ec_sponsorship` | `sponsor123` | Amit Roy | Sponsorship Manager | Vendors, Budget |
| `ec_members` | `members123` | Shreya Das | Secretary | Members, Meetings, Data Import |
| `ec_vendors` | `vendor123` | Rina Mukherjee | Vendor Coordinator | Vendors, Events |
| `ec_accounts` | `accounts123` | Subir Ghosh | Treasurer | Payments, Budget, Vendors |
| `ec_payments` | `payment123` | Deepa Banerjee | Asst. Treasurer | Payments only |
| `ec_comms` | `comms123` | Tanmay Chatterjee | Communications | Announcements, Surveys, Complaints, Magazine |
| `ec_ads` | `ads123` | Mousumi Basu | Ad Manager | Vendors, Announcements |

---

## 3. Testing as a Common Member

Login with `member_test` / `test123` and test these workflows:

### 3.1 Login & Dashboard
- [ ] Click "Member Login" on the landing page
- [ ] Enter `member_test` / `test123`
- [ ] Verify: Portal opens showing "Anirban Dasgupta" and membership type "Family"
- [ ] Verify: Dashboard shows quick stats cards

### 3.2 Sidebar Navigation
- [ ] Click each sidebar item and verify it loads:
  - Dashboard, Profile, Family, Payments, Budget, Meetings, Events, Surveys, Directory, Radio, Magazine

### 3.3 Profile
- [ ] Navigate to Profile section
- [ ] Verify: Name, email, phone, membership type displayed
- [ ] Check if Edit button is present

### 3.4 Family Members
- [ ] Navigate to Family section
- [ ] Verify: "Add Family Member" form with name, relation, age fields
- [ ] Try adding a family member

### 3.5 Events & RSVP
- [ ] Navigate to Events section
- [ ] Verify: Event cards visible (Nabo Borsho, Summer Camp, Summer Picnic)
- [ ] Click **"RSVP Now"** on any event
- [ ] Fill in: Status = "Yes, I'll attend", Adults = 2, Kids = 1, Dietary = Vegetarian
- [ ] Add a note: "Please seat us near stage"
- [ ] Click **Submit RSVP**
- [ ] Verify: Success confirmation appears
- [ ] Verify: "My RSVPs" table shows your submission
- [ ] Try **editing** an existing RSVP

### 3.6 Surveys
- [ ] Navigate to Surveys section
- [ ] Verify: Active surveys listed (Menu Preferences, Summer Camp Interest)
- [ ] Click "Take Survey" on one

### 3.7 Radio (Member Portal)
- [ ] Navigate to Radio section
- [ ] Verify: Radio player with Play/Pause, Next, Previous buttons
- [ ] Verify: "Today's Schedule" list visible
- [ ] Find **"Request a Song"** form
- [ ] Fill in: Song = "Ami Chini Go Chini", Artist = "Rabindranath Tagore", Category = "Rabindra Sangeet"
- [ ] Click Submit Request
- [ ] Verify: Success message, song appears in "My Recent Requests"

### 3.8 Logout
- [ ] Click Logout
- [ ] Verify: Portal closes, returns to main page

---

## 4. Testing as Full Admin

Login with `admin_test` / `admin123` and test these workflows:

### 4.1 Admin Login
- [ ] Click "Admin Login" (in About section or footer)
- [ ] Enter `admin_test` / `admin123`
- [ ] Verify: Admin portal opens with all sidebar items visible

### 4.2 Dashboard
- [ ] Verify: Dashboard shows stat cards (Total Members, Active, Payments, Events)

### 4.3 Navigate All Admin Sections
Click each sidebar item and verify it loads without error:
- [ ] Dashboard
- [ ] Members (member table with search/filter)
- [ ] Payments (payment records table)
- [ ] Events (event management cards)
- [ ] RSVPs (RSVP tracking table and stats)
- [ ] Evite / Invitations (send invitations, view sent list)
- [ ] Data Import (3 import types: Member, Event, Payment)
- [ ] Complaints (complaints table)
- [ ] Surveys (survey management)
- [ ] Announcements (announcement list)
- [ ] Radio (admin dashboard with stats, schedule, song requests)
- [ ] Magazine (magazine management)
- [ ] Budget (budget breakdown)
- [ ] Vendors (vendor list)
- [ ] Volunteers (volunteer management)
- [ ] Meetings (meeting schedule)
- [ ] Site Configuration (section toggles, fees, tiers, ad slots — **President only**)

### 4.4 Evite — Send Invitation
- [ ] Navigate to Evite section → Click "Send New Evite"
- [ ] Select email template (e.g., "🪷 Cultural Event")
- [ ] Verify: Subject and message auto-populate
- [ ] Click "Preview" → verify formatted preview
- [ ] Select recipients: "All Members"
- [ ] Click "Send Invitations"
- [ ] Verify: Success alert with recipient count

### 4.5 Radio Admin
- [ ] Navigate to Radio section
- [ ] Verify: 4 stat cards (Active Listeners, Uptime, Pending Requests, Library Songs)
- [ ] Test: Toggle Online/Offline button
- [ ] Test: Approve/Reject pending song requests
- [ ] Test: View music library categories

### 4.6 Site Configuration (President Only)
- [ ] Navigate to Site Configuration
- [ ] Toggle a section visibility (e.g., Radio) → Save → Check landing page
- [ ] Edit a membership fee → Save → Verify on landing page
- [ ] Add a sponsorship tier
- [ ] Edit an ad slot

### 4.7 Data Import
- [ ] Navigate to Data Import
- [ ] Click "Template" to download CSV template
- [ ] Upload a test CSV → Verify preview
- [ ] Click "Confirm Import" → Verify success message

---

## 5. Testing EC Roles

The purpose of EC role testing is to verify that **each role only sees their permitted sections** and cannot access restricted areas.

### Test Procedure (repeat for each EC account):

1. Login with the EC credentials from the table in Section 2
2. **Verify:** Admin portal shows the correct name
3. **Verify:** Only the permitted sidebar items are visible
4. **Verify:** Each visible section loads correctly
5. **Try to access a restricted section** (if possible via sidebar) → Should be blocked

### Quick Reference — What Each Role Should See:

| Role | Should See | Should NOT See |
|------|-----------|---------------|
| **Event Coordinator** (`ec_events`) | Dashboard, Events, RSVPs, Evite, Volunteers | Members, Payments, Budget, Site Config |
| **Sponsorship** (`ec_sponsorship`) | Dashboard, Vendors, Budget | Members, Events, Payments, Site Config |
| **Secretary** (`ec_members`) | Dashboard, Members, Meetings, Data Import | Payments, Budget, Events, Site Config |
| **Vendor Coord** (`ec_vendors`) | Dashboard, Vendors, Events | Members, Payments, Budget, Site Config |
| **Treasurer** (`ec_accounts`) | Dashboard, Payments, Budget, Vendors | Members, Events, Radio, Site Config |
| **Asst. Treasurer** (`ec_payments`) | Dashboard, Payments | Everything else |
| **Communications** (`ec_comms`) | Dashboard, Announcements, Surveys, Complaints, Magazine | Members, Payments, Events, Site Config |
| **Ad Manager** (`ec_ads`) | Dashboard, Vendors, Announcements | Members, Payments, Events, Site Config |

### What to Report:
- ❌ If you can see a section you shouldn't
- ❌ If you cannot see a section you should
- ❌ If clicking a permitted section shows an error

---

## 6. Signing Up with Your Real Name

### For Current EC Members

The system already knows the current BANF EC members. When you sign up using your real name, the system will recognize your role and grant appropriate permissions.

**Current EC Members defined in the system:**

| Name | Role | Expected Access |
|------|------|----------------|
| Dr. Ranadhir Ghosh | President | Full admin access (all sections) |
| Partha Mukhopadhyay | Vice President | Events, Members, Meetings, Budget |
| Amit Chandak | Treasurer | Payments, Budget, Vendors |
| Rajanya Ghosh | General Secretary | Members, Meetings, Data Import |
| Dr. Moumita Ghosh | Cultural Secretary | Events, RSVPs, Evite, Volunteers |
| Banty Dutta | Food Coordinator | Vendors, Events |
| Dr. Sumanta Ghosh | Event Coordinator | Events, RSVPs, Evite, Volunteers |
| Rwiti Choudhury | Puja Coordinator | Events, Volunteers |

### How to Sign Up

1. Go to https://www.jaxbengali.org/test
2. Click **"Member Login"** → Look for **"Sign Up"** or **"Register"** option
3. Enter your **real full name** exactly as listed above
4. Create a **username** and **password** of your choice
5. Provide your email and phone
6. Click **Register / Sign Up**

### After Signing Up

- **As a member:** You can access the Member Portal with your new credentials
- **As an EC member:** Try clicking "Admin Login" with your credentials — the system should recognize your name and role, granting you appropriate admin access based on your position
- **Test your permissions:** Verify that you can only see the sections relevant to your role (see table above)

### What to Report:
- Whether sign-up succeeded
- Whether your role was correctly recognized
- Whether you got the right sidebar sections for your position
- Any errors during the process

---

## 7. Testing the Public Landing Page

These sections are visible to everyone **without logging in**:

### 7.1 Navigation & Scroll
- [ ] Scroll through the entire page smoothly
- [ ] Click navbar links: About, EC Team, Events, Radio, Services, Membership, Careers, Contact
- [ ] Verify: Each link scrolls to the correct section

### 7.2 EC Team Section
- [ ] Verify: 8 EC member cards displayed in a grid
- [ ] Verify: Members with photos show images; others show initials avatars
- [ ] **Click any EC card** → Verify: Profile modal opens with photo, name, role, bio, vision
- [ ] Close modal with X button or by clicking the backdrop

### 7.3 Events Calendar
- [ ] Verify: Event cards visible (Nabo Borsho, Summer Camp, Summer Picnic)
- [ ] Check event details: dates, venue, description

### 7.4 Radio Player (Public)
- [ ] Verify: Radio section shows "BANF Radio" header
- [ ] Verify: Now Playing card with station name
- [ ] Click Play ▶️ → Verify: Icon changes to Pause ⏸
- [ ] Click Next ⏭ / Previous ⏮ → Verify: Station changes
- [ ] Verify: Program schedule displayed

### 7.5 Services Portal Hub
- [ ] Verify: Service cards visible (Jacksonville Guide, Community Directory, etc.)

### 7.6 Membership Plans
- [ ] Verify: Plan cards (Individual, Family, Student, Senior)
- [ ] Verify: Prices displayed correctly

### 7.7 Sponsorship Tiers
- [ ] Verify: Tier cards (Platinum, Gold, Silver, Bronze)

### 7.8 Careers & Professional Network
- [ ] Verify: Career profile cards displayed
- [ ] Test search by name (type "Ghosh")
- [ ] Test filter by industry
- [ ] Test filter by guidance type

### 7.9 Photo Gallery
- [ ] Verify: Gallery section loads with images

### 7.10 Contact Section
- [ ] Verify: Contact form visible
- [ ] Verify: Map or address information displayed

---

## 8. Mobile Testing

Test on your phone OR use Chrome DevTools (F12 → Toggle Device Toolbar → Select iPhone SE 375px):

### Landing Page
- [ ] All sections stack vertically — no horizontal scrollbar
- [ ] Text is readable without pinch-zoom
- [ ] EC Team cards display in 2-column grid
- [ ] Buttons are easy to tap (no tiny touch targets)

### Member/Admin Portal
- [ ] Sidebar is hidden by default on mobile
- [ ] Hamburger menu (☰) button appears at top
- [ ] Clicking hamburger → sidebar slides in
- [ ] Selecting a nav item → sidebar closes, section loads
- [ ] Tables scroll horizontally within their container (don't break layout)

---

## 9. Architecture & Service Notes

All BANF services run entirely through the **Wix Velo cloud backend** — no local servers or Flask services required. Everything works from the live production URL.

| Feature | Status | Notes |
|---------|--------|-------|
| **Zelle Payment Automation** | ✅ Cloud-native (Wix Velo) | Zelle payments are managed via the Wix Velo backend. Scan, verify, match, and reject payments directly from the Admin Portal. |
| **Radio Streaming** | ✅ Cloud-native (Wix Velo) | Radio station config, schedule, and controls are all served from Wix Velo HTTP endpoints. |
| **Gmail/Email** | ✅ Cloud-native (Wix Velo) | Email sending (Evite, inbox) is fully migrated to Wix Velo backend — no Flask or localhost dependency. |
| **Data Persistence** | ✅ Wix Data Collections | All data (members, payments, events, etc.) is stored in Wix Data collections with full CRUD via backend modules. |
| **File Uploads** | ✅ Client-side parsing works | CSV/XLSX uploads parse on the client side (SheetJS) and show previews. Import confirmation may use demo storage. |

> 💡 **All services are cloud-hosted.** There are no localhost dependencies. If any API call returns an error, it's a Wix backend issue — please report it.

---

## 10. How to Submit Feedback

### Option A: Text Feedback (Recommended)

Create a simple text document or email with your findings. Use the template in Section 11 below. Send to: **banfjax@gmail.com** with subject line: **"BANF Testing Feedback — [Your Name]"**

### Option B: Use the Interactive Test Tracker

1. Open `BANF_COMPREHENSIVE_ACCEPTANCE_TEST.html` (provided separately)
2. Work through each tab (Overview, Member, Admin, EC roles, etc.)
3. For each test: select ✅ Pass, ❌ Fail, or ⏭️ Skip
4. Add notes in the text box under any test
5. When done, click **"📥 Export Results"** at the top
6. A JSON file will download — send it to banfjax@gmail.com

### Option C: Quick Voice/Text Notes

If you prefer, just send a text message, WhatsApp, or voice note describing:
- What you tested
- What worked
- What didn't work
- What was confusing

---

## 11. Feedback Template

Copy this template and fill it in. You don't need to test everything — **test what's relevant to your role**.

```
============================================
BANF User Testing Feedback
============================================
Tester Name: _______________
Date: _______________
Device: Desktop / Mobile / Tablet
Browser: Chrome / Firefox / Safari / Edge
Screen Size: _______________

============================================
SECTION 1: LANDING PAGE
============================================
Overall impression: 
[ ] Looks good  [ ] Needs work  [ ] Broken

Navigation (clicking menu links):
[ ] Works  [ ] Partially works  [ ] Broken
Notes: 

EC Team Section:
[ ] Cards display correctly  [ ] Photos/initials show  [ ] Modal opens on click
Notes:

Events Section:
[ ] Events visible  [ ] Dates correct  [ ] RSVP buttons present
Notes:

Radio Section:
[ ] Player visible  [ ] Play/Pause works  [ ] Schedule shows
Notes:

Membership Plans:
[ ] Plans visible  [ ] Prices correct
Notes:

Careers Section:
[ ] Profiles visible  [ ] Search works  [ ] Filters work
Notes:

Other Landing Page Notes:


============================================
SECTION 2: MEMBER PORTAL
============================================
Login (member_test / test123):
[ ] Login works  [ ] Login failed  [ ] Didn't test
Notes:

Dashboard:
[ ] Shows correctly  [ ] Missing info  [ ] Error
Notes:

Profile:
[ ] Displays correctly  [ ] Edit works
Notes:

Family Members:
[ ] Section loads  [ ] Can add member
Notes:

Events & RSVP:
[ ] Events visible  [ ] RSVP form works  [ ] Submit works
Notes:

Surveys:
[ ] Surveys listed  [ ] Can take survey
Notes:

Radio (Member):
[ ] Player works  [ ] Song request form works  [ ] Request submitted
Notes:

Other Member Portal Notes:


============================================
SECTION 3: ADMIN PORTAL
============================================
Login (admin_test / admin123):
[ ] Login works  [ ] Login failed  [ ] Didn't test
Notes:

Dashboard stats:
[ ] All stats visible  [ ] Missing stats
Notes:

All sidebar sections load?
[ ] Yes, all load  [ ] Some fail (list which ones below)
Failed sections:

Evite (Send Invitation):
[ ] Form opens  [ ] Template applies  [ ] Preview works  [ ] Send works
Notes:

Radio Admin:
[ ] Stats show  [ ] Toggle works  [ ] Approve/Reject requests
Notes:

Site Configuration:
[ ] Panel loads  [ ] Toggles work  [ ] Fee editing works
Notes:

Data Import:
[ ] Template downloads  [ ] CSV upload works  [ ] Preview shows  [ ] Import confirms
Notes:

Other Admin Portal Notes:


============================================
SECTION 4: EC ROLE TESTING
============================================
Which EC role did you test? _______________
Username used: _______________

Correct name displayed? [ ] Yes  [ ] No
Correct sections visible? [ ] Yes  [ ] No
If wrong sections: 
  - Missing sections (should see but don't): 
  - Extra sections (shouldn't see but do): 

All visible sections load? [ ] Yes  [ ] No (which failed?):

Other EC Role Notes:


============================================
SECTION 5: SIGN-UP TESTING (with your real name)
============================================
Did you sign up? [ ] Yes  [ ] No
Full name used: _______________
Sign-up successful? [ ] Yes  [ ] No
Error message (if any): 

After sign-up:
  - Member portal login works? [ ] Yes  [ ] No
  - Admin login works (if EC)? [ ] Yes  [ ] No
  - Correct role recognized? [ ] Yes  [ ] No  [ ] N/A
  - Correct sections visible? [ ] Yes  [ ] No

Notes:


============================================
SECTION 6: MOBILE TESTING
============================================
Device used: _______________
Screen size: _______________

Landing page stacks vertically? [ ] Yes  [ ] No
Horizontal scrollbar appears? [ ] Yes (bad)  [ ] No (good)
EC cards in 2-column grid? [ ] Yes  [ ] No
Hamburger menu works? [ ] Yes  [ ] No
Sidebar slides in/out? [ ] Yes  [ ] No
Tables scrollable? [ ] Yes  [ ] No
Buttons easy to tap? [ ] Yes  [ ] No

Notes:


============================================
SECTION 7: OVERALL FEEDBACK
============================================
What worked well?


What needs improvement?


What was confusing?


Suggestions for new features?


Priority issues (things that MUST be fixed):


============================================
END OF FEEDBACK
============================================
```

---

## 12. Detailed Test Checklist Reference

For a comprehensive test-by-test checklist with pass/fail/skip tracking, use the interactive HTML file:

📄 **`BANF_COMPREHENSIVE_ACCEPTANCE_TEST.html`**

This file contains **80+ individual test cases** organized into 21 tabs:
- **Overview** — Test summary and credential reference
- **Member** — 15 member workflow tests (auth, dashboard, profile, family, payments, events/RSVP, surveys, radio)
- **Admin** — 14 admin workflow tests (auth, dashboard, members, payments, events, comms, vendors, volunteers, meetings)
- **EC Roles** (8 tabs) — One tab per EC role with login and access verification tests
- **Evite** — 9 tests (send invitations, templates, preview, RSVP tracking, reports, CSV export, reminders)
- **Data Import** — 5 tests (template download, CSV upload, preview, confirm, history)
- **Radio** — 18 tests (public player, member player, song requests, admin dashboard, schedule, API)
- **Features F1-F7** — Tests for Site Config, Mobile Layout, Role Permissions, EC Photos, EC Modals, Careers, Excel/DB Explorer

### How to Use the Test Tracker:
1. Open the HTML file in your browser
2. Click through each tab
3. For each test card, click the header to expand and see detailed steps
4. Set the dropdown to ✅ Pass, ❌ Fail, or ⏭️ Skip
5. Add notes in the text area under each test
6. Use the **"📥 Export Results"** button to save your results as JSON
7. Send the JSON file to banfjax@gmail.com

---

## Quick Start Summary

| What to Test | Login | Time Needed |
|-------------|-------|-------------|
| **Quick Tour** (landing page only) | No login needed | 5 minutes |
| **Member Experience** | `member_test` / `test123` | 15 minutes |
| **Admin Full Test** | `admin_test` / `admin123` | 20 minutes |
| **Your EC Role** | See table in Section 2 | 10 minutes |
| **Sign Up with Real Name** | Create new account | 10 minutes |
| **Mobile Test** | Use phone or DevTools | 10 minutes |

**Total estimated time for full testing: ~70 minutes**  
**Minimum useful testing: ~20 minutes** (landing page + your role)

---

*Thank you for helping test the BANF community website! Your feedback directly shapes the final product. 🙏*
