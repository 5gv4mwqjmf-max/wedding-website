# images/ — Wedding photo pipeline

Drop real photos here with these EXACT filenames and sizes. The site
references them via `<picture>` + srcset (WebP preferred, JPEG fallback).

## Required files (17 unique photos)

| File | Purpose | Suggested crop |
|------|---------|----------------|
| `welcome-couple-800.jpg` / `-1600.jpg` / `-2400.jpg` (+`.webp`) | Home editorial split | 4:3 portrait, warm grade |
| `ch1-procession-800.jpg` / `-1600.jpg` (+`.webp`) | Chapter 1 — Baroth procession | 16:9 |
| `ch2-ceremony-800.jpg` / `-1600.jpg` (+`.webp`) | Chapter 2 — ceremony | 16:9 |
| `ch3-lunch-800.jpg` / `-1600.jpg` (+`.webp`) | Chapter 3 — lunch/lawn | 16:9 |
| `ch4-reception-800.jpg` / `-1600.jpg` (+`.webp`) | Chapter 4 — reception | 16:9 |
| `story-met-600.jpg` | Story — how we met | 1:1 |
| `story-proposal-600.jpg` | Story — the proposal | 1:1 |
| `story-day-600.jpg` | Story — the day | 1:1 |
| `travel-venue-600.jpg` | Travel — venue exterior | 1:1 |
| `travel-hotel-600.jpg` | Travel — hotel room | 1:1 |
| `gallery-1.jpg` … `gallery-6.jpg` | Gallery square moments | 1:1, 18px radius |

## Sizing convention
- `-800` = 800px wide (mobile), `-1600` = 1600px (tablet), `-2400` = 2400px (desktop)
- Gallery/story/travel tiles: single 600px square (`gallery-1.jpg` style)
- Convert to WebP (quality 82) + keep JPEG fallback
- **Consistent color grade across ALL photos** — one warm treatment
  (the luxury research: inconsistent grading reads cheap)

## Until photos arrive
The `photo-fallback` class shows a warm gradient placeholder — the layout
is fully functional with no images. Drop files in, git add, deploy.

## AUTO-GRADING (do this first, not by hand)
Run the grader so every photo shares one consistent treatment (the luxury
research: mismatched grades read cheap):

```bash
python3 scripts/grade_photos.py --dir images/raw/ --out images/
```

The grader (scripts/grade_photos.py) applies the site's exact palette:
- Warmth: midtones/highlights pushed toward cream #f7f4f0
- Mute: saturation pulled ~18% (editorial, not candy)
- Soft blacks: shadows lifted toward #1b1b1b (no crushed blacks)
- Brick tint: warm red cast in shadows echoing #a23a2f
- S-curve: gentle contrast for the premium print feel

It outputs JPEG (q90) + WebP (q82) at 800/1600/2400 widths automatically,
following the naming spec. Then drop the outputs into images/ (or move the
raw folder out of the repo if you don't want it committed).
