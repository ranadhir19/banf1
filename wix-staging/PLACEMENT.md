# PLACEMENT — Wix-hosted HTML pages for jaxbengali.org

**What this is.** Eight self-contained HTML documents in this folder, built to Ranadhir's approved
approach: each page's body is reproduced at full fidelity from the existing sites (Pages B =
`ranadhir19.github.io/banf1`, source `banf1/docs/index.html`, plus a harvest of A-only content from
`banfjax-hash.github.io/banf`) and is meant to be pasted into **one full-width HTML component** on
the matching Wix page. Nothing in any file loads from, links to, or depends on GitHub.

**Shared construction.** Every file carries: the Google Fonts link (Playfair Display / Inter /
Hind Siliguri — same families/weights as the source), Bootstrap 5.3.0 and Font Awesome 6.4.0 CSS
(the same CDN links the source site itself uses — see fidelity note F-1), and the source site's own
stylesheet inlined (~56 KB — which is why even thin pages run ~60 KB). The design system is the
site's: palette `#ff6b35 / #f7931e / #8B0000 / #006A4E / #1a1a2e / #D4AF37`, sticky-header classes,
section styles — all from the source CSS, unchanged (one CSS comment reworded, see V-2).
**No scripts of any kind** are included: no frame-busting, no redirects, no `postMessage`
navigation tricks (the source events page had one — dropped, see conversion C-9).

## Per-page summary

| File | Wix page (slug) | Size | Contents (in order) | Sources |
|---|---|---|---|---|
| `home.html` | Home 2026 (`/home-2026`) | 201 KB | Notification bar (spec text, byte-verified) → Sharodotsav heading + caption (flyer image = native element above the component — §Placement step 1) → hero (background inlined as a `data:` URI) → stats (80+/10+/17/45+) → quick-access bar → President's Message (Bengali + English) → **Strategic Vision (A harvest)** → Services/portal hub → Careers & Professional Network (6 profiles baked) → Upcoming Events strip (4 cards) → BANF Radio (player + schedule + directory) → Jacksonville Guide → Community Voice (surveys/complaints) → E-Magazine → Sponsorship tiers → ad cards → Get in Touch (info + form subjects) → footer | B `index.html` §§hero–contact + A strategic-vision block |
| `about.html` | About (`/about`) | 82 KB | About BANF intro (footer + hero mission text) → President's Message (both languages) → Executive Committee grid (8 members baked) → Leadership Profiles (full profile blocks) | B `index.html` §about, EC_MEMBERS + profileData |
| `events.html` | Events (`/events`) | 69 KB | Sharodotsav heading + caption (flyer image = native element above the component — §Placement step 1) → **Durga Puja 2026 details block** (venue, both days' schedules, Celebration Pass prices, lunch price, ticket contacts — from the 2026 flyer + A sub-events) → full 2026 Event Calendar (B's 10 cards + Natok card from A) → `#rsvp` anchor (form placement point) | B §events + flyer + A events strip |
| `membership.html` | Membership (`/membership`) | 109 KB | B membership section complete: portal banner, **Plans & Pricing** (7 tier cards + selective plans + benefits), **Event Coverage** (event×tier matrix), **Value Analysis** (worth cards, **$51,600 budget breakdown**, quick comparison) → **A harvest section**: FY 2026-27 plans (Earlybird/M2/M1 + Cultural/DP passes), 17-event coverage matrix, payment info (Zelle), sponsor/ad blocks | B §membership (all 3 tabs) + A membership |
| `gallery.html` | Gallery (`/gallery`) | 62 KB | Photo Gallery album cards (Durga Puja 2025, Saraswati Puja 2026, members collection, …) — gradient/emoji covers as designed | B §photos |
| `magazine.html` | Magazine (`/magazine`) | 75 KB | B E-Magazine section (Latest Issue: Durga Puja 2025 Special Edition; categories; contribute) → **Jagriti harvest**: stats, 7 released issues (2019–2024-25) + Jagriti 2026, printed Puja edition announcement, member + email submission guides, advertising rate table, Kids Corner, editor guidelines | B §magazine + A `v2/jagriti.html` |
| `guide.html` | Guide (`/guide`) | 60 KB | Jacksonville Guide: 8 category cards (Restaurants, Grocery, Healthcare, Schools, Housing, Services, Bengali-Owned, Featured) + CTAs | B §guide (see gap G-1) |
| `contact.html` | Contact (`/contact`) | 66 KB | Get in Touch: contact form fields (static — native-form replacement point) + contact info card (info@jaxbengali.org, location, office hours, socials) → Community Voice (surveys + complaints cards) → footer | B §contact + §surveys |

**Media tokens: none remain.** All 3 original tokens are resolved — see `media-manifest.md`.
The Sharodotsav flyer is **not** in the markup: it is placed as a **native Wix image element**
(from the Media Manager, where it is already uploaded) at the top of Home 2026 and Events,
**above** the HTML component, which keeps the "Sharodotsav — Durga Puja 2026" heading and caption.
The home hero background is inlined in `home.html` as a `data:` URI (recompressed Unsplash photo,
no upload needed). The career-profile photo is the President's portrait URL already on
`static.wixstatic.com` (resolved substitution M-1 below). All other imagery was already on
`static.wixstatic.com` and is referenced directly.

## Form & functionality conversions (per the link rule — every one flagged)

- **C-1 Contact form** (home + contact): the source `<form>` is reproduced with its fields
  (Name, Email, Subject with all 6 options, Message) as static/disabled informational content.
  On the Contact page, replace the whole block (class `contact-form`) with the native Wix Form.
  On Home, the form column is a "Send Message" button → `/contact` with the subject options as chips.
- **C-2 Join** buttons → `/membership`. **RSVP** buttons → `/events`; the Durga Puja RSVP button
  points to `/events#rsvp`, and an empty `<div id="rsvp">` at the foot of events.html marks where
  the native RSVP form goes. **Surveys / Complaints** buttons → `/contact`. **Magazine "Submit
  Article"** → `/contact`. **Guide "Submit a Listing"** → `/contact`. **Careers "Connect"**
  (an alert popup in the source) → `/contact`.
- **C-3 Member / Admin portal CTAs** (portal cards, membership banner Login/Sign Up, meeting-minutes
  and other member-only links) → `/account/my-account` (Wix Members Area). No portal functionality
  is reproduced — Phase 2 per the plan.
- **C-4 Membership tabs** (Plans & Pricing / Event Coverage / Value Analysis) are stacked as three
  headed sections — components carry no JS, so nothing is hidden behind a tab click.
- **C-5 President's Message language toggle** removed; the Bengali letter and its English version
  are stacked (Bengali first, divider, English) — all text verbatim, nothing hidden.
- **C-6 Careers search/filter bar** removed (JS-only control); all 6 visible member profiles are
  baked in statically using the source's own card template (bio truncated at 120 chars, first 4
  skills — exactly as the source renderer did).
- **C-7 BANF Radio**: play/skip/source-tab controls replaced by a native `<audio controls>` element
  streaming the first live station (Radio Bhumi) + the baked daily schedule chips (9 slots) + a full
  listen directory: 17 live stations with direct stream links, 6 YouTube playlists, 4 Spotify
  playlists (all data from the source's own JS data). There was **no public song-request form** in
  B's public markup (it exists only inside the member portal) — nothing to convert.
- **C-8 EC "View Profile"** modals → static Leadership Profile blocks under the grid on about.html,
  anchored `#profile-<id>`; each card's View Profile link jumps to its block. All profileData fields
  are included (full bio, profession, education, interests, quote, year joined).
- **C-9 Events page tail buttons dropped**: "View Full Calendar" used a `window.parent.postMessage`
  iframe-navigation hack and "Event Details" opened a JS modal — both omitted on events.html
  (a clean View Full Calendar → `/events` button is used in the home strip instead). Event cards'
  modal data (venue/food lines) already appears as visible card text, so nothing is lost.
- **C-10 Photo gallery** album cards are static (the `PhotoGallery` JS is gone); the hidden
  "Manage Advertisements (Admin)" control in the ad section was removed (admin UI, display:none
  in the source). Quick-access "Pay Dues" → `/membership`.

## Source conflicts & fidelity risks (found during the build — read before launch)

- **X-1 ⚠️ Membership pricing: A and B publish DIFFERENT FY 2026-27 price lists.** B's taxonomy is
  per-person tiers (Family Premium $410 / EB $375, Couple, Regular, Student + selective plans);
  A's is plan families (Earlybird Premium 375/330/205/145 · M2 Premium 410/365/230/165 · M1 Regular
  280/255/140/100 · Cultural 200/175/100/75 · DP Celebration 210/175/**110**/80 · DP Core
  150/125/80/60). Per plan decision D1, B is primary and A's list is ported intact in a clearly
  labeled "(As published on our previous website)" harvest section on membership.html.
  **Ranadhir should reconcile the two lists before the page goes live** — both cannot be right.
- **X-2 Durga Puja Celebration Pass, Individual:** the 2026 flyer says **$100**; A's plan page says
  **$110**. Events page uses the flyer's $100 (current, printed); A's $110 remains in the harvest.
- **X-3 The President's Message exists in two different versions.** B's letter (used verbatim,
  both languages) and A's letter share the opening and the Tagore poem but differ in the middle:
  A alone has the founders paragraph ("আমাদের যাত্রার শুরু হয়েছিল কিছু মানুষের হাত ধরে…"), the
  "এখনই সময়—আরও বড় স্বপ্ন দেখার…" paragraph, and the closing "আমরা একসাথে পথ চলতে চাই, হাতে হাত
  রেখে…". A signed letter was **not** merged (that would falsify it); A's separate Strategic
  Vision block *was* ported to home.html. Decide whether A's letter variant should replace B's.
- **X-4 Event dates disagree across sources.** Kali Puja: B = Nov 7, 2026; A strip = Nov 7;
  A matrix = Nov 14 (A contradicts itself). Natok: A strip Nov 7 vs A matrix Nov 14 — the events
  page card uses Nov 7. Saraswati Puja 2027: B = Jan 25, 2027 (combined with Winter Picnic);
  A = Feb 27 with Winter Picnic on Jan 11/27. Lakshmi Puja: A matrix Oct 24 vs A strip/flyer
  Oct 25 — flyer used. B's cards win on the events page (D1); A's dates survive only inside the
  membership harvest matrix.
- **X-5 Event counts:** B's membership header says "18 Events", A says 17 (its matrix has 17 rows),
  B's calendar lists 10. All reproduced as published; flag for reconciliation with X-1.
- **X-6 Jagriti inconsistencies (A):** the page says "since 2019" and lists 8 issues, yet its own
  stats counter reads "3 Issues Published", and Jagriti 2022 is labeled "Inaugural Edition"
  despite 2019–2021 issues. Reproduced verbatim. Also, B calls the latest issue "Durga Puja 2025
  Special Edition" while A calls it "Jagriti 2024-25" — both kept, in their own sections.
- **X-7 Sponsorship pricing (B):** Title Sponsor is listed at $3,000 — *below* Platinum at
  $5,000/year. Preserved verbatim; likely a source typo to confirm. Sponsor contact emails also
  differ by source: B's CTA uses `sponsors@jaxbengali.org`, A's advertising contact is
  `sponsorship@jaxbengali.org` — both preserved in place (and per plan decision D3, the domain
  currently has no MX records, so all @jaxbengali.org addresses need the email decision anyway).
- **X-8 A-internal matrix inconsistency:** A's footer says "Cultural Special: 5" events while its
  own 💡 note says the Cultural Special "covers 12 events at 3.5× value". Reproduced verbatim.
- **G-1 ⚠️ The one true content gap — Guide listings.** The Jacksonville Guide's actual business
  listings were loaded at runtime from the old Wix backend (`guide.jsw` API); they exist in **no**
  source file in either repo, so there was nothing static to port. guide.html reproduces the
  complete published guide *page* (8 categories + CTAs). Recovering the listing data itself is a
  Phase-2 item (export from Production's backend before disconnect — plan §5 R1).
- **M-1 ✅ Resolved substitution — career-profile photo.** The media manifest's original career
  photo, repo-relative `assets/ec-photos/president/ranadhir-ghosh.jpg` in `banf1`, **does not exist
  anywhere** — the file is not in the repo, so there was nothing to upload. home.html's Careers
  card avatar now uses the President's portrait already used on the site
  (`static.wixstatic.com/media/c62f94_…/rana.jpg`, 180×180). No fidelity is lost: the source
  site's own career card image is likewise broken (404) today.
- **F-1 CDN stylesheets.** Exact layout requires the Bootstrap grid + Font Awesome icons, so each
  file links the same Bootstrap 5.3.0 / Font Awesome 6.4.0 CDN stylesheets the source site uses
  (jsdelivr / cdnjs — not GitHub). If a zero-external-dependency build is ever wanted, both
  stylesheets can be inlined into the `<style>` block at placement time (~230 KB extra per page).
- **F-2 EC LinkedIn placeholders.** All 8 EC members have `linkedin: "#"` in the source data, so
  about.html's 8 LinkedIn icons are dead `href="#"` links — exactly as the source renders them.
  Every other file has zero dead `#` links. Supply real LinkedIn URLs to fix.
- **F-3** The source footer's YouTube link is `youtube.com/@banfjacksonville` (the plan/inventory
  said @banfjax for all socials) — footer kept verbatim.

## Verification performed (V)

- **V-1** `grep -i github` across all 8 files: **zero hits**. The single hit found during the build
  was a stylesheet comment ("On standalone (GitHub Pages)…") — reworded to "standalone pages";
  it styles nothing differently. `banfjax` hits are only BANF's own handles
  (facebook/instagram/twitter.com/banfjax) and BANF's own published Gmail (banfjax@gmail.com,
  in the Jagriti submission/Zelle text from A) — no GitHub-account references.
- **V-2** Notification bar text extracted from home.html and diffed against the approved text:
  **byte-identical**. Flyer caption on home + events matches the approved caption.
- **V-3** All 8 files parse with a tag-balance checker (Python html.parser): zero unclosed/stray
  tags. Zero `<script>` tags, zero `onclick`/event-handler attributes, zero frame-busting strings
  (`window.top`, `parent.location`, `postMessage`) in every file.
- **V-4** Content census spot-checks (31 assertions): Bengali + English President's letters,
  $51,600 budget, both pricing matrices, all 10 B events + Natok, DP pass prices/venue, 8 EC
  members + full bios, 6 career profiles, 9 radio schedule chips, 17 station links, Jagriti
  issues + ad-rate table, 8 guide categories, gallery albums, contact subjects — all present.

## Placement instructions (editor step)

1. **Flyer first (native element).** The 8 HTML files are final — zero tokens; there is nothing
   to upload or find-and-replace for them (hero background is an inline `data:` URI, career photo
   is the portrait URL — see `media-manifest.md`). The one media action: on **Home 2026** and
   **Events**, add a native **image element above the HTML component** and set it to
   `sharodotsav-2026-flyer.jpg` from the Media Manager (uploaded in an earlier step) — full-width
   on mobile, centered with a sensible max-width on desktop — so the flyer sits directly above
   the component's "Sharodotsav — Durga Puja 2026" heading and caption.
2. **One component per page.** On each of the 8 pre-created pages (Home 2026, About, Events,
   Membership, Gallery, Magazine, Guide, Contact), delete any placeholder elements and add a
   single **full-width HTML component** (classic editor: Add → Embed → Custom Embeds → HTML
   iframe), paste the whole file, and set the component height to fit the content (these are long
   pages — use the editor's height handle / "stretch to content" behaviour and check on mobile
   preview; long components may need the page's "infinite scroll" length extended).
3. **Slugs.** Internal links assume the plan's slugs: home = `/home-2026`, `/about`, `/events`,
   `/membership`, `/gallery`, `/magazine`, `/guide`, `/contact`. If the editor assigns different
   slugs to the new pages, rename the pages to match — do not edit the files. Member/EC links go
   to `/account/my-account` (existing Members Area).
4. **Native forms last** (they sit *next to / instead of* component content, per plan §3):
   Contact form replaces the static `contact-form` block on the Contact page; RSVP form goes at
   the `#rsvp` anchor at the foot of the Events page; Join form on the Membership page. Until a
   form is placed, the component buttons route visitors to the right page.
5. **Link behaviour.** Links intentionally carry no `target` attribute and no script: inside an
   HTML iframe component they navigate within the component frame by default. If full-window
   navigation is preferred, that is an editor/component decision at placement — do not add
   frame-busting code to these files.
6. **Do not publish** until the Phase-1 parity check (plan §6B) has been walked: X-1 (pricing)
   and X-3 (President's letter version) are the two items that genuinely need Ranadhir's eye.
