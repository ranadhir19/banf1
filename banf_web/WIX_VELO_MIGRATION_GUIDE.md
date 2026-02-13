# BANF Web App — Wix Velo Migration Guide

## ✅ Problem Solved

**Before:** The HTML app called `http://127.0.0.1:5001/api/gmail/...` — a Flask server running on the developer's machine. Visitors' browsers tried to connect to **their own** localhost where nothing runs → all email/evite features were broken in production.

**After:** The HTML app auto-detects its environment and calls `https://www.jaxbengali.org/_functions/...` — Wix Velo HTTP Functions running on Wix's cloud infrastructure. Zero local dependencies.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  BEFORE (BROKEN)                                            │
│                                                             │
│  Visitor Browser                                            │
│    └─► iframe (GitHub Pages HTML)                           │
│         └─► fetch('http://127.0.0.1:5001/...')  ← FAILS!   │
│              └─► Flask gmail_service.py (developer's PC)    │
│                   └─► SMTP smtp.gmail.com                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  AFTER (PRODUCTION)                                         │
│                                                             │
│  Visitor Browser                                            │
│    └─► iframe (GitHub Pages HTML)                           │
│         └─► fetch('https://jaxbengali.org/_functions/...')  │
│              └─► Wix Velo HTTP Functions (http-functions.js)│
│                   └─► email-gateway.jsw                     │
│                        ├─► SendGrid API (primary)           │
│                        ├─► Wix triggeredEmails (fallback)   │
│                        └─► Wix Data Collections (storage)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Files Modified/Created

### 1. `backend/email-gateway.jsw` (NEW)
Complete Wix Velo backend replacing `gmail_service.py`. Functions:

| Function | Replaces | Description |
|----------|----------|-------------|
| `sendEmail()` | Flask `/send` | Sends email via SendGrid → fallback to triggeredEmails |
| `sendEviteEmails()` | Flask `/send-evite` | Sends BANF-branded evite HTML emails |
| `getEmailStatus()` | Flask `/status` | Returns service health |
| `getUnreadCount()` | Flask `/unread` | Unread message count |
| `getInboxMessages()` | Flask `/inbox` | Paginated inbox from Wix Data |
| `getMessage()` | Flask `/email/<id>` | Single message by ID |
| `markMessageRead()` | Flask `/mark-read/<id>` | Mark message read |
| `deleteMessage()` | Flask `/delete/<id>` | Move to trash |
| `searchMessages()` | Flask `/search` | Full-text search |
| `getContactGroups()` | Flask `/contacts` | All contact groups |
| `createContactGroup()` | Flask `/contacts/group` POST | Create group |
| `deleteContactGroup()` | Flask `/contacts/group/<name>` DELETE | Delete group |
| `addContactsToGroup()` | Flask `/contacts/group/<name>/add` | Add contacts |
| `removeContactFromGroup()` | Flask `/contacts/group/<name>/remove` | Remove contacts |
| `checkRSVPReplies()` | Flask `/rsvp-check` | RSVP tracking |
| `getSentEmailHistory()` | (new) | Sent email log |

### 2. `backend/http-functions.js` (MODIFIED)
Added 17 HTTP function endpoints + 16 CORS options handlers:

| Wix Endpoint | HTTP Method | Maps To |
|-------------|-------------|---------|
| `/_functions/email_status` | GET | `emailGateway.getEmailStatus()` |
| `/_functions/email_unread` | GET | `emailGateway.getUnreadCount()` |
| `/_functions/email_inbox` | GET | `emailGateway.getInboxMessages()` |
| `/_functions/email_message` | GET | `emailGateway.getMessage()` |
| `/_functions/email_mark_read` | POST | `emailGateway.markMessageRead()` |
| `/_functions/send_email` | POST | `emailGateway.sendEmail()` |
| `/_functions/send_evite` | POST | `emailGateway.sendEviteEmails()` |
| `/_functions/email_delete` | POST | `emailGateway.deleteMessage()` |
| `/_functions/email_search` | GET | `emailGateway.searchMessages()` |
| `/_functions/contacts` | GET | `emailGateway.getContactGroups()` |
| `/_functions/contact_group_create` | POST | `emailGateway.createContactGroup()` |
| `/_functions/contact_group_delete` | POST | `emailGateway.deleteContactGroup()` |
| `/_functions/contact_group_add` | POST | `emailGateway.addContactsToGroup()` |
| `/_functions/contact_group_remove` | POST | `emailGateway.removeContactFromGroup()` |
| `/_functions/rsvp_check` | GET | `emailGateway.checkRSVPReplies()` |
| `/_functions/sent_history` | GET | `emailGateway.getSentEmailHistory()` |

### 3. `wix-embed-landing-v2.html` (MODIFIED)
- **Environment auto-detection**: `IS_PRODUCTION` flag based on hostname
- **`apiUrl()` mapper**: Translates Flask REST paths → Wix flat function names
- **`apiFetch()` wrapper**: Handles method conversion (DELETE→POST for Wix) and URL parameter-to-body mapping
- **All 17 fetch() calls** updated to use `apiFetch()` instead of direct `GMAIL_API_BASE +` references
- **Error messages** updated for production context (no "start gmail_service.py" messages)

---

## Wix Setup Required

### Step 1: Create Data Collections

In Wix Dashboard → CMS → Create these collections:

#### `ContactGroups`
| Field | Type | Required |
|-------|------|----------|
| `groupName` | Text | ✅ |
| `description` | Text | |
| `createdAt` | Date & Time | |

#### `GroupContacts`
| Field | Type | Required |
|-------|------|----------|
| `groupName` | Text | ✅ |
| `contactName` | Text | |
| `contactEmail` | Text | ✅ |
| `addedAt` | Date & Time | |

#### `SentEmails`
| Field | Type | Required |
|-------|------|----------|
| `to` | Text | ✅ |
| `subject` | Text | ✅ |
| `body` | Text | |
| `type` | Text | (email/evite) |
| `status` | Text | (sent/failed) |
| `sentAt` | Date & Time | |
| `sentBy` | Text | |
| `provider` | Text | (sendgrid/triggered) |

#### `InboxMessages`
| Field | Type | Required |
|-------|------|----------|
| `from` | Text | ✅ |
| `subject` | Text | |
| `body` | Text | |
| `bodyHtml` | Text | |
| `date` | Date & Time | |
| `folder` | Text | (INBOX/SENT/TRASH) |
| `isRead` | Boolean | |
| `hasAttachments` | Boolean | |
| `source` | Text | (contact_form/rsvp/system) |

> **Permissions:** Set all collections to "Admin" read/write, with code-level access enabled for backend `.jsw` files.

### Step 2: Set Up SendGrid

1. Create free account at [sendgrid.com](https://sendgrid.com) (100 emails/day free)
2. Create an API key with "Mail Send" permission
3. Verify sender email: `banfjax@gmail.com`
4. In Wix Dashboard → Developer Tools → **Secrets Manager**:
   - Add secret: Key = `sendgrid_api_key`, Value = your SendGrid API key

### Step 3: Deploy to Wix

1. Copy `backend/email-gateway.jsw` to your Wix site's backend
2. Copy updated `backend/http-functions.js` to your Wix site's backend
3. Publish the Wix site
4. Push updated `wix-embed-landing-v2.html` to GitHub Pages

### Step 4: Test

1. Visit `https://www.jaxbengali.org`
2. Navigate to Admin Panel → Gmail/Email section
3. Click "Check Connection" — should show ✅ Connected
4. Try sending a test evite
5. Verify in SendGrid dashboard that email was sent

---

## Environment Detection Logic

```javascript
// In the HTML (auto-detect):
const IS_PRODUCTION = (window.location.hostname !== 'localhost' 
                    && window.location.hostname !== '127.0.0.1');

// Production: calls Wix Velo → https://www.jaxbengali.org/_functions/send_evite
// Local dev:  calls Flask   → http://127.0.0.1:5001/api/gmail/send-evite
```

**Result:** Developers can still test locally with `gmail_service.py`, but the production site calls Wix Velo with zero local dependencies.

---

## Email Transport Strategy

```
Email Request
     │
     ▼
[SendGrid API]  ← Primary (free 100/day, HTTP API via wixFetch)
     │
     ├─► Success → Log to SentEmails collection → Return success
     │
     └─► Failure
          │
          ▼
     [Wix triggeredEmails]  ← Fallback (Wix built-in, requires contact in CRM)
          │
          ├─► Success → Log to SentEmails collection → Return success
          │
          └─► Failure → Return error with details
```

---

## Inbox Limitation & Solution

**Gmail IMAP inbox reading is not possible from Wix Velo** (no raw socket/IMAP support).

**Solution:** The `InboxMessages` Wix Data collection serves as the inbox. Messages are added to it from:
1. **Contact form submissions** → stored as inbox messages
2. **RSVP replies** → stored as inbox messages  
3. **System notifications** → stored as inbox messages

For full Gmail inbox access, admins should use Gmail directly at `mail.google.com`.

---

## Radio Service Note

The radio streaming service (`RADIO_API_BASE`) currently still points to localhost in dev mode. In production, it will attempt to call Wix endpoints (`/radio_schedule`, etc.) — these would need corresponding implementations if radio features are needed on the live site. For now, radio features gracefully degrade if the endpoints don't exist.

---

## Files That Can Be Deprecated

| File | Status | Reason |
|------|--------|--------|
| `gmail_service.py` | **Deprecated** | Replaced by `email-gateway.jsw` |
| `banf_contacts.json` | **Deprecated** | Contacts now in Wix Data collections |

Keep them for local development/testing only.
