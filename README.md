# Keshava & [Bride] — Fusion Wedding Project

A complete digital suite for a one-day Indian + Western fusion wedding:
**email invitations** (Save-the-Date + formal Invitation) that link to a
static wedding website with full guest interactivity.

## The flow: email invitation → website

1. Guests receive the **Save-the-Date email** (`save-the-date.html`) or the
   **formal invitation email** (`evite.html`) — both are standalone,
   email-safe HTML (inline styles, table layout, hidden preheader,
   bulletproof buttons).
2. Each email has a prominent **"View Our Website" / "RSVP on Our Website"**
   button that points to the live site.
3. The website carries everything: itinerary, travel, story, FAQ, RSVP,
   gallery, contact, and the digital guestbook.

## Design System

- **Palette** — warm off-white `#f7f4f0`, soft black `#1b1b1b`,
  muted brick red `#a23a2f` (accent)
- **Typography** — Cormorant Garamond (display), Great Vibes (script accents),
  Outfit (body)
- **Motifs** — temple-door arch, mandala linework, marquee strips
- **Motion** — scroll-drawn mandala, parallax, floating petals, countdown,
  marquee shimmer, staggered reveals — all `prefers-reduced-motion` safe
- **Accessibility** — WCAG-conscious contrast, visible focus states, 44px+ hit
  targets, semantic HTML

## Files

| File | Purpose |
|---|---|
| `index.html` | Home — hero + countdown + itinerary + offers |
| `travel.html` | Travel & accommodation details |
| `story.html` | Our Story chapters |
| `faq.html` | Accordion FAQ (10 questions) |
| `rsvp.html` | RSVP form (attendance, party, meal, song request) |
| `gallery.html` | Photo gallery grid (placeholder tiles) |
| `contact.html` | Contact form → Google Apps Script → your inbox |
| `guestbook.html` | Digital guestbook (form + wall + big-screen mode) |
| `save-the-date.html` | **Email template** — Save-the-Date (send as email) |
| `evite.html` | **Email template** — formal invitation (send as email) |
| `appsscript/Code.gs` | Google Apps Script backend for the contact form |
| `css/styles.css` | Shared design system |
| `js/guestbook.js` | Guestbook logic (localStorage, hearts, screen mode) |
| `js/site-motion.js` | Motion: scroll-draw, petals, countdown, scroll-top |

## Activating the contact email (2 min, one-time)

1. Go to https://script.google.com → new project → paste `appsscript/Code.gs`
   into Code.gs (set `TO_EMAIL` to your inbox).
2. Deploy → New deployment → Web app → *Execute as: Me*,
   *Who has access: Anyone* → copy the URL.
3. In `contact.html`, paste it at `var SCRIPT_URL = '...'`.
4. Commit + push. The contact form now emails you — no backend server.

## Sending the email invitations

`save-the-date.html` and `evite.html` are complete email templates. Send them
with any email service (Gmail, Mailchimp, Butter, etc.):

- **Gmail (quick)**: open the HTML file in a browser → Select All → Copy →
  paste into a Gmail compose with rich text (or use a Chrome extension that
  sends HTML emails).
- **Bulk**: import the HTML into Mailchimp/Butter and send to your guest list.

Before sending, replace: `[Bride]`, `[Month DD, YYYY]`, `[Time]`,
`[Venue Name]`, `[City, State]`, `[RSVP date]`.

## Guestbook

- Messages persist in `localStorage` (key `wedding-guestbook-v1`)
- Big Screen mode: click **Open Big Screen Mode** or press **D**
- Designed for a reception display — high contrast, large type, auto wall

## Before Going Live — Replace These Placeholders

- `[Bride]` — bride's name (couple name in nav, hero, emails)
- `[Venue Name]`, `[Street Address]`, `[City, State ZIP]`
- `[Signature Hotel]`, `[Boutique Hotel]`, rates, booking dates
- Airports / driving copy in Travel
- Event date (also `WEDDING_DATE` in `js/site-motion.js` for the countdown),
  times, RSVP date
- `[wedding]@[domain].com` in `contact.html`
- Local tips copy in Travel

## Preview Locally

```bash
python3 -m http.server 8000 --directory .
# open http://localhost:8000
```
