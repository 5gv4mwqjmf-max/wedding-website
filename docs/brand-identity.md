# Brand Identity — Keshava & Cayla (Dec 11, 2027)

Canonical brand reference for the wedding suite (site, emails, envelope,
share card, favicon). Derived from research (Wezoree / WeddingPro / Paperlust
2026 mood-driven trend) + the site's golden-hour design rounds. **Anything
new must resolve through this file before it touches pixels.**

## 1. The feeling (the brief everything hangs on)

**Warm golden-hour welcome.** Guests should feel like they've arrived at
dusk on a Texas estate — pecan and oak trees, golden light, held and
unhurried. Two families and two traditions becoming one story — the whole
site is the invitation opening, not an information terminal.

- The wedding: **Briscoe Manor, 5251 FM 723, Richmond, TX 77406**
- The welcome party: **Holiday Inn Houston SW – Sugar Land Area,
  11160 Southwest Fwy, Houston, TX 77031**

- Adjectives: warm, editorial, layered, generous, grounded
- Not: cold, techy, busy, generic-template, Pinterest-replica

## 2. Palette (tokens — warm sunset-sage)

| Token | Hex | Role |
|---|---|---|
| `--ivory` | #f7f1e4 | Base surface / nav / browser chrome |
| `--cream` | #f1e7d5 | Alt section / card stacks |
| `--paper` | #fcf8ef | Cards / chips / email card stock |
| `--ink` | #2a2317 | Warm near-black — text, buttons, marquee |
| `--ink-soft` | #6c6248 | Secondary text |
| `--maroon` | #4a6f5c | Sage — photo accent ONLY |
| `--maroon-deep` | #37513f | Small text over media (7.92:1), kickers, links |
| `--gold` | #b3a07c | DECORATIVE only — borders, rules, chips, foil glint |
| `--gold-light` | #e3d5b4 | Marquee `<em>` accents, soft glints |

Rules: gold/sage never carry small text; ink + maroon-deep carry text;
the hero overlay is the peach sunset gradient.

## 3. Typography

- **Cormorant Garamond** — display serif (h1–h4, manifesto big type)
- **Great Vibes** — script (names, monograms, accents; all words SAME size)
- **Outfit** — body/UI (labels, nav, kickers, buttons)
- **Parisienne** — email handwritten notes (formal calligraphy)
- Caveat is BANNED (casual). No italics beyond Cormorant's loaded style.
- Scale discipline: 2-tier h2 (photo-tile 52 / section-head 46), no inline
  size drift, `text-wrap: balance` headings.

## 4. Marks

- **Monogram: `K&C`** in Great Vibes — used on the wax seal, evite seal,
  favicon (`images/brand-mark.html` → favicon-64.png, apple-touch-icon.png),
  404, and any future print. **Never `K&B`** (stale pre-Cayla initial).
- **Temple-door arch + mandala linework** — hero SVG mark, cards, motifs.
- Ornaments: restrained gold flourishes (❦ ❧) — email stationery only.

## 5. Voice

- "Together with their families" — kicker
- "One Day, Two Traditions" — tagline (marquee, hero, share card)
- "Two families, one beautiful beginning." — manifesto (pinned moment)
- Tone: warm formal. Short lines, generous spacing, no hype.

## 6. Signature experiences

1. **Walk-through scroll** (`js/walk-camera.js`) — rooms zoom/tilt as you
   walk past; manifesto word-reveal; magnetic CTAs; photo 3D tilt
2. **Sky video hero** — golden-hour loop + peach overlay + foil-glint names
3. **Envelope unboxing** (`open-invitation.html`) — the paperless-post moment
4. **Marquee countdown** — ink band with live days/hrs/mins/secs
5. Film grain + floating chips — premium texture, restrained

## 7. Non-negotiables (violations = rework)

- No glassmorphism, no tech gradients, no emoji, no AI-slop stock text
- Gold is decorative only; sage is a photo accent; small text over media
  is maroon-deep
- All motion dies under `prefers-reduced-motion`; mobile gets the
  pointer-free baseline
- One primary CTA everywhere: RSVP
- Never generate text inside images (decoration only)

_Last verified: Round 58 (2026-08-03). Update when the identity evolves._
