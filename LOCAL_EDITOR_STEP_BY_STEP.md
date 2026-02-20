# BANF Wix Local Editor: Detailed Step-by-Step Instructions

## Goal
Fix the publish/build issue (`Cannot find module 'backend/sponsors.jsw'`) and ensure local editor sync/publish uses the correct repository and site.

---

## 1) Open the Correct Folder in VS Code

1. In VS Code, select **File → Open Folder...**
2. Choose:
   - `C:\projects\survey\banf_web\wix-github-repo`
3. Click **Select Folder**.
4. If prompted, open in current window.

### If using multi-root workspace
- In Explorer, right-click any wrong folder root (for example `wix_pages`) and choose **Remove Folder from Workspace**.

---

## 2) Confirm You Are on the Correct Site

Open:
- `wix.config.json`

Expected value:
- `siteId: c13ae8c5-7053-4f2d-9a9a-371869be4395`

If the `siteId` is different, stop and switch to the correct folder/repo before editing.

---

## 3) Understand Where to Edit

Edit only in this repo:
- `C:\projects\survey\banf_web\wix-github-repo`

Do **not** edit your old standalone mirror folder:
- `C:\projects\survey\banf_web\wix_pages`

---

## 4) Verify Required Backend Files Exist

Check these files exist and are non-empty:

- `backend/sponsors.jsw`
- `src/backend/sponsors.jsw`
- `backend/sponsor-management.jsw`

`backend/sponsors.jsw` and `src/backend/sponsors.jsw` are compatibility modules and must export:
- `getActiveSponsors`
- `getSponsorsByTier`
- `getSponsorDetails`

---

## 5) Verify Public Folder Is Available

These folders should contain files (not empty):

- `public/`
- `src/public/`

At minimum, you should see files such as:
- `public/utils.js`
- `public/constants.js`

---

## 6) Fix Page Imports (Critical)

Run workspace search for:
- `backend/sponsors.jsw`

Expected result after cleanup:
- No active page imports should depend on `backend/sponsors.jsw`.
- If references remain, they should only be comments in compatibility backend files.

If you find page code importing `backend/sponsors.jsw`, update it to use:
- `backend/sponsor-management.jsw`

---

## 7) Save and Sync Correctly

1. Use **File → Save All**.
2. Wait until local sync finishes (no pending/sync-in-progress indicator).
3. Confirm no file tab shows unsaved changes.

---

## 8) Start Local Dev and Confirm Read/Write Flow

From terminal in repo root (`wix-github-repo`), run Wix dev.

If your environment has TLS interception/certificate issues, use your existing validated workaround in the same terminal session (as previously done).

Wait until you see:
- local environment ready/synced status

Then make a tiny non-functional edit (e.g., a comment), save, and confirm it syncs.

---

## 9) Publish Sequence

1. Publish once.
2. If build panel still shows old error, hard refresh editor.
3. Publish again.

---

## 10) If Error Persists

Capture and check these in order:

1. Latest build log line showing failing module path.
2. Confirm compatibility file exists at:
   - `backend/sponsors.jsw`
3. Confirm page code no longer imports wrong path.
4. Confirm you are publishing from site with the correct `siteId`.

---

## 11) Quick Pre-Publish Checklist

- [ ] Opened `wix-github-repo` (not `wix_pages`)
- [ ] `wix.config.json` has correct `siteId`
- [ ] `backend/sponsors.jsw` exists with 3 exports
- [ ] `backend/sponsor-management.jsw` exists
- [ ] `public/` is populated
- [ ] No active page imports to `backend/sponsors.jsw`
- [ ] Save All completed
- [ ] Local dev sync completed
- [ ] Publish retried after refresh

---

## 12) Known Environment Notes

- Corporate/self-signed cert chain may break npm/Wix fetch calls.
- If local editor appears stale, refresh and re-sync before publishing.
- If branch/site mismatch is suspected, always re-validate `wix.config.json` first.

---

## 13) Recommended Files to Inspect First

- `wix.config.json`
- `backend/sponsors.jsw`
- `backend/sponsor-management.jsw`
- `src/backend/sponsors.jsw`
- `src/pages/**` (all page imports)

---

Prepared for BANF local Wix troubleshooting and publish stabilization.