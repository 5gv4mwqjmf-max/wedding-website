# Keshava & Cayla — Fusion Wedding Project

**Saturday, December 11 2027 · Briscoe Manor, Richmond TX.**

A complete digital suite for a one-day Indian + Western fusion wedding:
**email invitations** (Save-the-Date + formal Invitation) that link to a
static wedding website with full guest interactivity.

## The flow: email invitation → website

1. Guests receive the **Save-the-Date email** (`save-the-date.html`) or the
   **formal invitation email** (`evite.html`) — both are standalone,
   email-safe HTML (inline styles, table layout, hidden preheader,
   bulletproof buttons).
2. Each email's primary pill button (STD label "View Our Website",
   Invitation label "RSVP Now") points at `open-invitation.html` — the
   click-to-open envelope landing page — with a secondary text link to the
   site root. Two links per email; there is no `rsvp.html` link.
3. The website carries everything: itinerary, travel, story, FAQ, RSVP,
   gallery, contact, and the digital guestbook.

## Design System

- **Palette** (photo-driven warm sage/sand) — ivory `#f7f1e4` bg, cream
  `#f1e7d5` alt section, paper `#fcf8ef` cards, ink `#2a2317`, soft ink
  `#6c6248`, sage accent `#4a6f5c` (token `--maroon`), deep sage `#37513f`,
  sand-gold `#b3a07c`, light gold `#e3d5b4`. The earlier black/white/red
  palette is retired — do not reintroduce brick red `#a23a2f`
- **Typography** — Cormorant Garamond (display), Great Vibes (script accents),
  Outfit (body). The email stationery adds Parisienne for handwritten notes
  (Caveat is banned — it reads as a casual scribble)
- **Motifs** — temple-door arch cards, editorial numbered section heads,
  restrained ornaments (`❦` / `❧` in the emails)
- **Motion** — JS-driven whisper effects only: heading/settle reveal,
  manifesto word reveal, gold-rule draw, scroll-progress bar, photo
  parallax, ambient petals, countdown. NO CSS scroll-timelines (iOS Safari
  INVERTS their ranges) and no blur/zoom on text; all effects are
  `prefers-reduced-motion` safe
- **Accessibility** — WCAG-conscious contrast, visible focus states, 44px+ hit
  targets, semantic HTML

## Files

| File | Purpose |
|---|---|
| `index.html` | **The whole site** — single-page scroll (hero → manifesto → timeline → weekend → travel → stay → story → gallery → FAQ → RSVP → guestbook → contact) |
| `open-invitation.html` | Click-to-open envelope landing page (the email CTA target) |
| `travel/story/faq/rsvp/gallery/contact/guestbook.html` | **Redirect stubs** to `index.html#<section>` — keep for old links; no forms inside |
| `save-the-date.html` | **Email template** — Save-the-Date (send as email) |
| `evite.html` | **Email template** — formal invitation (send as email) |
| `404.html` | GitHub Pages not-found page |
| `appsscript/Code.gs` | Unified backend — RSVP + Guestbook + Contact → Sheet |
| `appsscript/MailMerge.gs` | Sheet menu for bulk STD/Invitation sends |
| `css/styles.css` | Shared design system |
| `js/guestbook.js` | Guestbook wall + big-screen mode (press `D`) |
| `js/site-motion.js` | Petals, countdown, scroll-top |
| `js/gentle-scroll.js` | Hero exit + photo parallax + heading settle |
| `js/scroll-life.js` | Universal JS scroll effects (no CSS timelines) |
| `js/premium-motion.js` | Word reveal, magnetic buttons, foil shimmer |
| `js/walk-camera.js` | Retired room walk-camera — kept, NOT loaded |

## Activating the backend — RSVP + Guestbook + Contact (5 min, one-time)

The whole site runs on **one Google Apps Script** (`appsscript/Code.gs`) —
the WithJoy-style DIY stack: every form writes to a Google Sheet (your
guest-list manager) and RSVPs/contact messages email you.

1. Create a spreadsheet: go to **sheets.new** → copy its ID from the URL
   (`docs.google.com/spreadsheets/d/<ID>/edit`).
2. Go to https://script.google.com → new project → paste
   `appsscript/Code.gs` into Code.gs. Set `CONFIG.SHEET_ID` to the ID
   from step 1 (or leave blank to auto-create).
3. Deploy → New deployment → Web app → *Execute as: Me*,
   *Who has access: Anyone* → copy the URL (looks like
   `https://script.google.com/macros/s/.../exec`).
4. Paste that URL into the **three live constants** (replace
   `PASTE_YOUR_URL`) — `index.html` twice (RSVP form ~line 764, contact
   form ~line 790) plus `js/guestbook.js` (~line 161). The
   `rsvp.html` / `contact.html` / `guestbook.html` files are redirect
   stubs with no forms: editing them changes nothing.
5. (Optional) Run the `setupSheets()` function in the editor to pre-create
   the RSVPs/Guestbook/Contact tabs.
6. Commit + push. Done — RSVPs land in your Sheet and inbox, guestbook
   messages in the Sheet, contact messages in your email.

**Every RSVP emails you immediately** — name, attending, party size, meal,
song, notes. The Sheet is your living guest list.

### Exporting the guest list
- **No-code**: open the spreadsheet → File → Download → CSV.
- **Script**: `python3 scripts/export_guest_list.py --spreadsheet-id <ID>`
  (needs a service account; the no-code path is easier for most use).

## Sending the email invitations

`save-the-date.html` and `evite.html` are complete email templates. Send them
with any email service (Gmail, Mailchimp, Butter, etc.):

- **Gmail (quick)**: open the HTML file in a browser → Select All → Copy →
  paste into a Gmail compose with rich text (or use a Chrome extension that
  sends HTML emails).
- **Bulk**: import the HTML into Mailchimp/Butter and send to your guest list.

Before sending, check the placeholder list further down — couple names, date,
venue and the RSVP deadline are already live in both templates.

## Guestbook

- Messages persist in `localStorage` (key `wedding-guestbook-v1`)
- Big Screen mode: click **Open Big Screen Mode** or press **D**
- Designed for a reception display — high contrast, large type, auto wall

## Before Going Live — Remaining Owner Placeholders

Couple names, date, venue + welcome-party addresses and the RSVP deadline
are all LIVE. Still owner-supplied (sweep with
`grep -noE '\[[^]]{1,40}\]' index.html`):

- `[wedding]@[domain].com` — contact email (x2: `#contact` note + the
  form-error string in the final-CTA script)
- `[#Hashtag]` — x2 (`#gallery` intro, `#faq` photos answer)
- `[$$]` — hotel room-block rate (`#stay`)
- `[honeymoon fund / home fund]` — registry wording (`#faq` gifts answer)
- Story copy ch.1 (how we met) + ch.2 (proposal), and `[tradition]` in ch.3

## Preview Locally

```bash
python3 -m http.server 8904 --directory .
# open http://localhost:8904   (canonical local preview port)
```

## Sending the Email Invitations — Deliverability & Tools

Both `save-the-date.html` and `evite.html` are ready to send. Here's what
maximizes inbox delivery.

### Recommended sender name

Use **a recognizable name**, not a brand. Best results:
- "Keshava & Cayla" (most personal)
- "Keshava Gali" or "Cayla"
- Avoid: "Wedding Team", "Wedding Website", generic addresses

### Subject lines that land in inbox

| Purpose | Subject line | Why it works |
|---|---|---|
| Save-the-Date | "Save the Date — Keshava & Cayla · December 2027" | Specific, personal, no spam triggers |
| Save-the-Date | "We're getting married! December 2027" | Warm, familiar, personal names |
| Invitation | "Invitation: Keshava & Cayla — Dec 11 2027" | Clear, formal, low spam score |
| Reminder | "Reply by Nov 13: Keshava & Cayla RSVP" | Action + deadline, personal |

**Avoid:** ALL CAPS, "FREE", "!!!", "You're invited!!!!!", "Win", "Act Now",
emojis in subject (can hurt deliverability on Outlook/Gmail desktop).

### Sender name (more important than subject)

Spam research consistently rates sender name recognition above subject line
cleverness. Use a name the recipient will recognize:
- **Keshava Gali** ← best (guests know you)
- **Keshava & Cayla** ← good (the couple)
- If using a service, the "From:" name should match one of these

### Recommended sending tools

| Tool | Cost | Works with our HTML? | RSVP tracking | Best for |
|---|---|---|---|---|
| **Butter** (withbutter.com) | Free starter, paid for full list | ✅ Paste HTML, send | ✅ Built-in + reminders | **Custom emails + tracking, wedding-focused** |
| **Gmail** (select-all-copy) | Free | ✅ Copy-paste | ❌ None | Quick send ≤20 guests |
| **Mailchimp** | Free ≤500 | ✅ HTML block | ⚠️ Campaign stats only | DIY bulk send |

### Guest list template

`guest-list-template.csv` has the universal columns used by Butter, Zola,
Joy, Paperless Post, and most wedding platforms. Open it in Google Sheets or
Excel, replace the example rows with your guests, and save as CSV.

**Columns:**
- **First Name / Last Name** — personalization tokens
- **Email** — required for online delivery
- **Party Size** — number in the party (for RSVP)
- **Guest Group** — filter by "Family", "Friend", "Work" etc.
- **RSVP Status** — auto-populated if using a platform
- **Meal Preference / Song Request / Notes** — for import into some platforms

### Sending flow (recommended)

```
1. Fill guest-list-template.csv in Google Sheets
2. Check the remaining owner placeholders in evite.html (list above)
3. Open evite.html in Chrome → Select All → Copy
4. Paste into Butter (or Gmail for small sends)
5. Send Save-the-Dates first → wait 2-3 weeks → send Invitations
6. Monitor RSVPs on the website (`/rsvp.html` redirects to the RSVP
   section) — guests click through from the email button
```
