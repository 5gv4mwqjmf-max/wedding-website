# Keshava & [Bride] — Fusion Wedding Project

A complete digital suite for a one-day Indian + Western fusion wedding:
Save-the-Date email template, formal Evite template, a static wedding website,
and an interactive digital guestbook built for a large reception screen.

## Design System

- **Palette** — ivory `#faf6ef`, deep maroon `#6d1a2e`, antique gold `#c9a227`,
  saffron `#e8a13c`, forest `#1f3d2b`
- **Typography** — Cormorant Garamond (display), Great Vibes (script accents),
  Outfit (body)
- **Motifs** — temple-door arch cards, gold linework dividers, restrained ornament
- **Accessibility** — WCAG-conscious contrast, visible focus states, 44px+ hit
  targets, `prefers-reduced-motion` support, semantic HTML

## Files

| File | Purpose |
|---|---|
| `index.html` | Home/Welcome + full-day itinerary (timeline) |
| `travel.html` | Travel & accommodation details |
| `guestbook.html` | Digital guestbook (form + wall + big-screen mode) |
| `save-the-date.html` | Email-safe Save-the-Date template (inline styles, table layout) |
| `evite.html` | Email-safe formal invitation template |
| `css/styles.css` | Shared design system |
| `js/guestbook.js` | Guestbook logic (localStorage, hearts, screen mode) |

## Guestbook

- Messages persist in `localStorage` (key `wedding-guestbook-v1`)
- Big Screen mode: click **Open Big Screen Mode** or press **D**
- Designed for a reception display — high contrast, large type, auto wall

## Before Going Live — Replace These Placeholders

- `[Bride]` — bride's name (couple name in nav, hero, emails)
- `[Venue Name]`, `[Street Address]`, `[City, State ZIP]`
- `[Signature Hotel]`, `[Boutique Hotel]`, rates, booking dates
- Airports / driving copy in Travel
- Event date, times, RSVP date
- `[website link]` in email templates
- Local tips copy in Travel

## Preview Locally

```bash
python3 -m http.server 8000 --directory .
# open http://localhost:8000
```
