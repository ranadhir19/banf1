# -*- coding: utf-8 -*-
"""
BANF Gmail Integration Service
================================
Flask backend to manage Gmail operations for banfjax@gmail.com
Provides REST API for reading, sending, managing emails and contact groups.

IMPORTANT: This uses Gmail App Password (NOT regular password).
Steps to set up:
  1. Go to https://myaccount.google.com/security
  2. Enable 2-Step Verification
  3. Go to https://myaccount.google.com/apppasswords
  4. Generate an App Password for "Mail" on "Other (Custom name)" = "BANF App"
  5. Use that 16-char app password in the GMAIL_APP_PASSWORD env var

Usage:
  python gmail_service.py
  # Runs on http://localhost:5001
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import imaplib
import smtplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import decode_header
import json
import os
import re
import traceback
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow cross-origin for frontend

# ====== CONFIGURATION ======
GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS", "banfjax@gmail.com")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "skmxlbejaryowvkt")  # Gmail App Password
IMAP_SERVER = "imap.gmail.com"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# Contact groups stored in-memory (persistent file-based in production)
CONTACTS_FILE = os.path.join(os.path.dirname(__file__), "gmail_contacts.json")


def load_contacts():
    """Load contact groups from file"""
    if os.path.exists(CONTACTS_FILE):
        with open(CONTACTS_FILE, 'r') as f:
            return json.load(f)
    return {
        "groups": {
            "EC Members": {
                "description": "Executive Committee Members",
                "contacts": [
                    {"name": "Admin Test", "email": "admin@test.com"},
                    {"name": "Priya Sen", "email": "events@banf.org"},
                    {"name": "Amit Roy", "email": "sponsor@banf.org"}
                ]
            },
            "All Members": {
                "description": "All BANF Members",
                "contacts": []
            },
            "Volunteers": {
                "description": "Event Volunteers",
                "contacts": []
            }
        }
    }


def save_contacts(data):
    """Save contact groups to file"""
    with open(CONTACTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


# ====== IMAP HELPER FUNCTIONS ======

def get_imap_connection():
    """Create IMAP connection to Gmail"""
    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
    return mail


def decode_email_header(header_value):
    """Decode email header (handles encoded subjects)"""
    if not header_value:
        return ""
    decoded_parts = decode_header(header_value)
    result = ""
    for part, encoding in decoded_parts:
        if isinstance(part, bytes):
            result += part.decode(encoding or 'utf-8', errors='replace')
        else:
            result += part
    return result


def parse_email_message(msg, msg_id):
    """Parse email message into dict"""
    subject = decode_email_header(msg.get("Subject", ""))
    from_addr = decode_email_header(msg.get("From", ""))
    to_addr = decode_email_header(msg.get("To", ""))
    date_str = msg.get("Date", "")
    message_id = msg.get("Message-ID", "")

    # Get body
    body = ""
    body_html = ""
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            if "attachment" in content_disposition:
                continue
            try:
                payload = part.get_payload(decode=True)
                if payload:
                    charset = part.get_content_charset() or 'utf-8'
                    text = payload.decode(charset, errors='replace')
                    if content_type == "text/plain":
                        body = text
                    elif content_type == "text/html":
                        body_html = text
            except Exception:
                pass
    else:
        try:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or 'utf-8'
                body = payload.decode(charset, errors='replace')
        except Exception:
            body = str(msg.get_payload())

    # Parse attachments
    attachments = []
    if msg.is_multipart():
        for part in msg.walk():
            content_disposition = str(part.get("Content-Disposition", ""))
            if "attachment" in content_disposition:
                filename = part.get_filename()
                if filename:
                    attachments.append({
                        "filename": decode_email_header(filename),
                        "content_type": part.get_content_type(),
                        "size": len(part.get_payload(decode=True) or b"")
                    })

    return {
        "id": str(msg_id),
        "subject": subject,
        "from": from_addr,
        "to": to_addr,
        "date": date_str,
        "message_id": message_id,
        "body": body[:5000] if body else (body_html[:5000] if body_html else ""),
        "body_html": body_html[:10000] if body_html else "",
        "has_html": bool(body_html),
        "attachments": attachments,
        "has_attachments": len(attachments) > 0
    }


# ====== API ROUTES ======

@app.route('/api/gmail/status', methods=['GET'])
def gmail_status():
    """Check Gmail connection status"""
    try:
        mail = get_imap_connection()
        status, data = mail.select("INBOX", readonly=True)
        msg_count = int(data[0])
        mail.logout()
        return jsonify({
            "connected": True,
            "email": GMAIL_ADDRESS,
            "inbox_count": msg_count,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "connected": False,
            "email": GMAIL_ADDRESS,
            "error": str(e),
            "hint": "If using regular password, you need a Gmail App Password. Enable 2FA first, then generate App Password at https://myaccount.google.com/apppasswords"
        }), 500


@app.route('/api/gmail/inbox', methods=['GET'])
def get_inbox():
    """Get inbox emails with pagination"""
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    search = request.args.get('search', '')
    folder = request.args.get('folder', 'INBOX')

    try:
        mail = get_imap_connection()
        mail.select(folder, readonly=True)

        # Search
        if search:
            criteria = f'(OR (SUBJECT "{search}") (FROM "{search}") (BODY "{search}"))'
            status, msg_ids = mail.search(None, criteria)
        else:
            status, msg_ids = mail.search(None, "ALL")

        all_ids = msg_ids[0].split()
        all_ids.reverse()  # Newest first
        total = len(all_ids)

        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        page_ids = all_ids[start:end]

        emails = []
        for msg_id in page_ids:
            try:
                status, msg_data = mail.fetch(msg_id, "(RFC822)")
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                parsed = parse_email_message(msg, msg_id.decode())
                emails.append(parsed)
            except Exception as e:
                emails.append({"id": msg_id.decode(), "error": str(e)})

        mail.logout()

        return jsonify({
            "emails": emails,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/gmail/email/<email_id>', methods=['GET'])
def get_email(email_id):
    """Get a single email by ID"""
    folder = request.args.get('folder', 'INBOX')

    try:
        mail = get_imap_connection()
        mail.select(folder, readonly=True)

        status, msg_data = mail.fetch(email_id.encode(), "(RFC822)")
        if status != 'OK':
            return jsonify({"error": "Email not found"}), 404

        raw_email = msg_data[0][1]
        msg = email.message_from_bytes(raw_email)
        parsed = parse_email_message(msg, email_id)

        mail.logout()
        return jsonify(parsed)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/gmail/folders', methods=['GET'])
def get_folders():
    """Get list of Gmail folders/labels"""
    try:
        mail = get_imap_connection()
        status, folders = mail.list()
        mail.logout()

        folder_list = []
        for f in folders:
            decoded = f.decode()
            # Parse folder name from IMAP response
            match = re.search(r'"([^"]*)"$|(\S+)$', decoded)
            if match:
                name = match.group(1) or match.group(2)
                folder_list.append(name)

        return jsonify({"folders": folder_list})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/gmail/send', methods=['POST'])
def send_email():
    """Send an email"""
    data = request.json
    to_addr = data.get('to', '')
    subject = data.get('subject', '')
    body = data.get('body', '')
    body_html = data.get('body_html', '')
    cc = data.get('cc', '')
    bcc = data.get('bcc', '')
    reply_to = data.get('reply_to', '')

    if not to_addr or not subject:
        return jsonify({"error": "Missing required fields: to, subject"}), 400

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"BANF <{GMAIL_ADDRESS}>"
        msg["To"] = to_addr
        msg["Subject"] = subject
        if cc:
            msg["Cc"] = cc
        if reply_to:
            msg["Reply-To"] = reply_to

        # Add plain text body
        msg.attach(MIMEText(body or "No plain text version", "plain"))

        # Add HTML body if provided
        if body_html:
            msg.attach(MIMEText(body_html, "html"))

        # Build recipient list
        recipients = [addr.strip() for addr in to_addr.split(',')]
        if cc:
            recipients.extend([addr.strip() for addr in cc.split(',')])
        if bcc:
            recipients.extend([addr.strip() for addr in bcc.split(',')])

        # Send via SMTP (with timeout to avoid hanging)
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_ADDRESS, recipients, msg.as_string())

        return jsonify({
            "success": True,
            "message": f"Email sent to {to_addr}",
            "timestamp": datetime.now().isoformat()
        })

    except smtplib.SMTPAuthenticationError as e:
        return jsonify({
            "error": "Gmail authentication failed. Please use an App Password.",
            "hint": "Enable 2FA on the Gmail account, then create an App Password at https://myaccount.google.com/apppasswords",
            "details": str(e)
        }), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/gmail/send-evite', methods=['POST'])
def send_evite():
    """Send an evite/invitation email with RSVP link"""
    data = request.json
    recipients = data.get('recipients', [])  # List of {name, email}
    event_name = data.get('event_name', '')
    event_date = data.get('event_date', '')
    event_time = data.get('event_time', '')
    venue = data.get('venue', '')
    message = data.get('message', '')
    subject = data.get('subject', f"You're Invited: {event_name}")
    collect_dietary = data.get('collect_dietary', True)
    collect_kids = data.get('collect_kids', True)

    if not recipients or not event_name:
        return jsonify({"error": "Missing required fields: recipients, event_name"}), 400

    sent_count = 0
    failed = []

    for recipient in recipients:
        r_name = recipient.get('name', 'Member')
        r_email = recipient.get('email', '')
        if not r_email:
            continue

        # Personalize message
        personalized_msg = message.replace('{memberName}', r_name)\
                                   .replace('{eventName}', event_name)\
                                   .replace('{eventDate}', event_date)\
                                   .replace('{venue}', venue)\
                                   .replace('{eventTime}', event_time)

        # Build HTML email
        html_body = f"""
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
            <div style="background:linear-gradient(135deg,#ff6b35,#f7c948);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
                <h1 style="color:white;margin:0;">&#127799; BANF Invitation</h1>
                <p style="color:rgba(255,255,255,0.9);margin:5px 0 0;">Bengali Association of North Florida</p>
            </div>
            <div style="background:#fff;padding:30px;border:1px solid #eee;">
                <h2 style="color:#333;">{event_name}</h2>
                <p style="color:#666;">Dear {r_name},</p>
                <p style="color:#444;line-height:1.6;">{personalized_msg}</p>
                <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:20px 0;">
                    <p style="margin:5px 0;"><strong>&#128197; Date:</strong> {event_date}</p>
                    <p style="margin:5px 0;"><strong>&#128336; Time:</strong> {event_time}</p>
                    <p style="margin:5px 0;"><strong>&#128205; Venue:</strong> {venue}</p>
                </div>
                <div style="text-align:center;margin:25px 0;">
                    <p style="color:#666;margin-bottom:15px;">Please let us know if you can attend:</p>
                    <a href="mailto:{GMAIL_ADDRESS}?subject=RSVP%20YES%20-%20{event_name}%20-%20{r_name}&body=I%20will%20attend!%0A%0AName:%20{r_name}%0AAdults:%20%0AKids:%20%0ADietary:%20" 
                       style="display:inline-block;background:#4CAF50;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:5px;font-weight:bold;">
                        &#9989; Yes, I'll Attend
                    </a>
                    <a href="mailto:{GMAIL_ADDRESS}?subject=RSVP%20MAYBE%20-%20{event_name}%20-%20{r_name}&body=I%20might%20attend.%0A%0AName:%20{r_name}" 
                       style="display:inline-block;background:#FF9800;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:5px;font-weight:bold;">
                        &#129300; Maybe
                    </a>
                    <a href="mailto:{GMAIL_ADDRESS}?subject=RSVP%20NO%20-%20{event_name}%20-%20{r_name}&body=Sorry,%20I%20cannot%20attend.%0A%0AName:%20{r_name}" 
                       style="display:inline-block;background:#f44336;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:5px;font-weight:bold;">
                        &#10060; Can't Make It
                    </a>
                </div>
                {"<p style='color:#888;font-size:14px;'>Please include: number of adults, kids, and any dietary requirements in your reply.</p>" if collect_dietary or collect_kids else ""}
            </div>
            <div style="background:#333;padding:15px;text-align:center;border-radius:0 0 10px 10px;">
                <p style="color:#aaa;margin:0;font-size:12px;">Bengali Association of North Florida (BANF) &#8226; Jacksonville, FL</p>
                <p style="color:#aaa;margin:5px 0 0;font-size:12px;">Contact: banfjax@gmail.com</p>
            </div>
        </div>
        """

        plain_body = f"""
BANF Invitation - {event_name}

Dear {r_name},

{personalized_msg}

&#128197; Date: {event_date}
&#128336; Time: {event_time}
&#128205; Venue: {venue}

Please reply to this email with:
- YES / MAYBE / NO
- Number of adults and kids attending
- Any dietary requirements

Thank you!
BANF - Bengali Association of North Florida
"""

        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"BANF <{GMAIL_ADDRESS}>"
            msg["To"] = r_email
            msg["Subject"] = subject
            msg["Reply-To"] = GMAIL_ADDRESS

            msg.attach(MIMEText(plain_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
                server.sendmail(GMAIL_ADDRESS, [r_email], msg.as_string())

            sent_count += 1

        except smtplib.SMTPAuthenticationError as e:
            failed.append({"email": r_email, "error": "Gmail auth failed. Use an App Password (see https://myaccount.google.com/apppasswords)"})
        except Exception as e:
            failed.append({"email": r_email, "error": str(e)})

    return jsonify({
        "success": sent_count > 0,
        "sent_count": sent_count,
        "failed_count": len(failed),
        "failed": failed,
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/gmail/rsvp-check', methods=['GET'])
def check_rsvp_replies():
    """Check inbox for RSVP replies to evites"""
    event_name = request.args.get('event_name', '')
    days_back = int(request.args.get('days_back', 30))

    try:
        mail = get_imap_connection()
        mail.select("INBOX", readonly=True)

        # Search for RSVP replies
        since_date = (datetime.now() - timedelta(days=days_back)).strftime("%d-%b-%Y")
        search_criteria = f'(SINCE "{since_date}" SUBJECT "RSVP")'
        if event_name:
            search_criteria = f'(SINCE "{since_date}" SUBJECT "RSVP" SUBJECT "{event_name}")'

        status, msg_ids = mail.search(None, search_criteria)
        all_ids = msg_ids[0].split()

        rsvps = []
        for msg_id in all_ids:
            try:
                status, msg_data = mail.fetch(msg_id, "(RFC822)")
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)

                subject = decode_email_header(msg.get("Subject", ""))
                from_addr = decode_email_header(msg.get("From", ""))
                date_str = msg.get("Date", "")

                # Parse RSVP status from subject
                subject_upper = subject.upper()
                if "RSVP YES" in subject_upper:
                    rsvp_status = "attending"
                elif "RSVP MAYBE" in subject_upper:
                    rsvp_status = "maybe"
                elif "RSVP NO" in subject_upper:
                    rsvp_status = "not_attending"
                else:
                    rsvp_status = "unknown"

                # Get body for details
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            payload = part.get_payload(decode=True)
                            if payload:
                                body = payload.decode(part.get_content_charset() or 'utf-8', errors='replace')
                            break
                else:
                    payload = msg.get_payload(decode=True)
                    if payload:
                        body = payload.decode(msg.get_content_charset() or 'utf-8', errors='replace')

                # Extract name from subject (RSVP YES - EventName - MemberName)
                name_match = re.search(r'RSVP\s+\w+\s*-\s*[^-]+-\s*(.+)', subject, re.IGNORECASE)
                member_name = name_match.group(1).strip() if name_match else from_addr

                # Parse adults/kids from body
                adults_match = re.search(r'Adults?:\s*(\d+)', body, re.IGNORECASE)
                kids_match = re.search(r'Kids?:\s*(\d+)', body, re.IGNORECASE)
                dietary_match = re.search(r'Dietary:\s*(.+)', body, re.IGNORECASE)

                rsvps.append({
                    "from": from_addr,
                    "name": member_name,
                    "status": rsvp_status,
                    "subject": subject,
                    "date": date_str,
                    "adults": int(adults_match.group(1)) if adults_match else None,
                    "kids": int(kids_match.group(1)) if kids_match else None,
                    "dietary": dietary_match.group(1).strip() if dietary_match else None,
                    "raw_body": body[:500]
                })

            except Exception:
                pass

        mail.logout()

        return jsonify({
            "rsvps": rsvps,
            "total": len(rsvps),
            "attending": len([r for r in rsvps if r["status"] == "attending"]),
            "maybe": len([r for r in rsvps if r["status"] == "maybe"]),
            "declined": len([r for r in rsvps if r["status"] == "not_attending"]),
            "unknown": len([r for r in rsvps if r["status"] == "unknown"])
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/gmail/delete/<email_id>', methods=['DELETE'])
def delete_email(email_id):
    """Move email to trash"""
    folder = request.args.get('folder', 'INBOX')

    try:
        mail = get_imap_connection()
        mail.select(folder)
        mail.store(email_id.encode(), '+FLAGS', '\\Deleted')
        mail.expunge()
        mail.logout()
        return jsonify({"success": True, "message": f"Email {email_id} deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/gmail/mark-read/<email_id>', methods=['POST'])
def mark_read(email_id):
    """Mark email as read"""
    folder = request.args.get('folder', 'INBOX')

    try:
        mail = get_imap_connection()
        mail.select(folder)
        mail.store(email_id.encode(), '+FLAGS', '\\Seen')
        mail.logout()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====== CONTACT GROUP ROUTES ======

@app.route('/api/gmail/contacts', methods=['GET'])
def get_contacts():
    """Get all contact groups"""
    contacts = load_contacts()
    return jsonify(contacts)


@app.route('/api/gmail/contacts/group', methods=['POST'])
def create_group():
    """Create a new contact group"""
    data = request.json
    group_name = data.get('name', '')
    description = data.get('description', '')

    if not group_name:
        return jsonify({"error": "Group name required"}), 400

    contacts = load_contacts()
    if group_name in contacts["groups"]:
        return jsonify({"error": "Group already exists"}), 409

    contacts["groups"][group_name] = {
        "description": description,
        "contacts": []
    }
    save_contacts(contacts)
    return jsonify({"success": True, "message": f"Group '{group_name}' created"})


@app.route('/api/gmail/contacts/group/<group_name>', methods=['DELETE'])
def delete_group(group_name):
    """Delete a contact group"""
    contacts = load_contacts()
    if group_name not in contacts["groups"]:
        return jsonify({"error": "Group not found"}), 404

    del contacts["groups"][group_name]
    save_contacts(contacts)
    return jsonify({"success": True, "message": f"Group '{group_name}' deleted"})


@app.route('/api/gmail/contacts/group/<group_name>/add', methods=['POST'])
def add_to_group(group_name):
    """Add contact(s) to a group"""
    data = request.json
    contact_list = data.get('contacts', [])  # [{name, email}]

    contacts = load_contacts()
    if group_name not in contacts["groups"]:
        return jsonify({"error": "Group not found"}), 404

    existing_emails = {c['email'] for c in contacts["groups"][group_name]["contacts"]}
    added = 0
    for contact in contact_list:
        if contact.get('email') and contact['email'] not in existing_emails:
            contacts["groups"][group_name]["contacts"].append(contact)
            existing_emails.add(contact['email'])
            added += 1

    save_contacts(contacts)
    return jsonify({"success": True, "added": added})


@app.route('/api/gmail/contacts/group/<group_name>/remove', methods=['POST'])
def remove_from_group(group_name):
    """Remove contact from a group"""
    data = request.json
    email_addr = data.get('email', '')

    contacts = load_contacts()
    if group_name not in contacts["groups"]:
        return jsonify({"error": "Group not found"}), 404

    contacts["groups"][group_name]["contacts"] = [
        c for c in contacts["groups"][group_name]["contacts"]
        if c['email'] != email_addr
    ]
    save_contacts(contacts)
    return jsonify({"success": True})


@app.route('/api/gmail/contacts/group/<group_name>/send', methods=['POST'])
def send_to_group(group_name):
    """Send email to all contacts in a group"""
    data = request.json
    subject = data.get('subject', '')
    body = data.get('body', '')
    body_html = data.get('body_html', '')

    contacts = load_contacts()
    if group_name not in contacts["groups"]:
        return jsonify({"error": "Group not found"}), 404

    group_contacts = contacts["groups"][group_name]["contacts"]
    if not group_contacts:
        return jsonify({"error": "Group has no contacts"}), 400

    sent = 0
    failed = []
    for contact in group_contacts:
        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"BANF <{GMAIL_ADDRESS}>"
            msg["To"] = contact['email']
            msg["Subject"] = subject

            msg.attach(MIMEText(body, "plain"))
            if body_html:
                msg.attach(MIMEText(body_html, "html"))

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.ehlo()
                server.starttls()
                server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
                server.sendmail(GMAIL_ADDRESS, [contact['email']], msg.as_string())

            sent += 1
        except Exception as e:
            failed.append({"email": contact['email'], "error": str(e)})

    return jsonify({
        "success": sent > 0,
        "sent": sent,
        "failed": len(failed),
        "failed_details": failed
    })


# ====== SEARCH ======

@app.route('/api/gmail/search', methods=['GET'])
def search_emails():
    """Search emails with Gmail search syntax"""
    query = request.args.get('q', '')
    folder = request.args.get('folder', 'INBOX')
    limit = int(request.args.get('limit', 20))

    if not query:
        return jsonify({"error": "Search query required"}), 400

    try:
        mail = get_imap_connection()
        mail.select(folder, readonly=True)

        # Build IMAP search
        search_criteria = f'(OR (SUBJECT "{query}") (FROM "{query}") (BODY "{query}"))'
        status, msg_ids = mail.search(None, search_criteria)

        all_ids = msg_ids[0].split()
        all_ids.reverse()
        all_ids = all_ids[:limit]

        results = []
        for msg_id in all_ids:
            try:
                status, msg_data = mail.fetch(msg_id, "(RFC822)")
                raw_email = msg_data[0][1]
                msg = email.message_from_bytes(raw_email)
                parsed = parse_email_message(msg, msg_id.decode())
                # Trim body for search results
                parsed['body'] = parsed['body'][:300] if parsed['body'] else ""
                results.append(parsed)
            except Exception:
                pass

        mail.logout()
        return jsonify({"results": results, "count": len(results)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====== UNREAD COUNT ======

@app.route('/api/gmail/unread', methods=['GET'])
def unread_count():
    """Get unread email count"""
    try:
        mail = get_imap_connection()
        mail.select("INBOX", readonly=True)
        status, msg_ids = mail.search(None, "UNSEEN")
        count = len(msg_ids[0].split()) if msg_ids[0] else 0
        mail.logout()
        return jsonify({"unread": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ====== HEALTH CHECK ======

@app.route('/api/gmail/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "service": "BANF Gmail Integration",
        "status": "running",
        "email": GMAIL_ADDRESS,
        "timestamp": datetime.now().isoformat(),
        "endpoints": [
            "GET /api/gmail/status",
            "GET /api/gmail/inbox",
            "GET /api/gmail/email/<id>",
            "GET /api/gmail/folders",
            "GET /api/gmail/unread",
            "GET /api/gmail/search?q=",
            "POST /api/gmail/send",
            "POST /api/gmail/send-evite",
            "GET /api/gmail/rsvp-check",
            "DELETE /api/gmail/delete/<id>",
            "POST /api/gmail/mark-read/<id>",
            "GET /api/gmail/contacts",
            "POST /api/gmail/contacts/group",
            "DELETE /api/gmail/contacts/group/<name>",
            "POST /api/gmail/contacts/group/<name>/add",
            "POST /api/gmail/contacts/group/<name>/remove",
            "POST /api/gmail/contacts/group/<name>/send"
        ]
    })


if __name__ == '__main__':
    print("=" * 60)
    print("[EMAIL] BANF Gmail Integration Service")
    print("=" * 60)
    print(f"  Email:    {GMAIL_ADDRESS}")
    print(f"  Server:   http://localhost:5001")
    print(f"  Docs:     http://localhost:5001/api/gmail/health")
    print("=" * 60)
    print()
    print("[WARNING]  IMPORTANT: If Gmail login fails, you need an App Password!")
    print("   1. Enable 2FA: https://myaccount.google.com/security")
    print("   2. Create App Password: https://myaccount.google.com/apppasswords")
    print("   3. Set GMAIL_APP_PASSWORD env var with the 16-char code")
    print()
    app.run(host='0.0.0.0', port=5001, debug=False)
