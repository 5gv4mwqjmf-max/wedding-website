#!/usr/bin/env python3
"""
Wedding photo color grader — matches the site's muted black/white/red
palette: warm off-white #f7f4f0, soft black #1b1b1b, brick red #a23a2f.

The grade (consistent with the luxury research — uniform treatment):
  1. WARMTH   — push midtones/highlights toward warm cream (the site bg)
  2. MUTE     — pull saturation down ~18% (muted, editorial, not candy)
  3. SOFT BLACKS — lift shadows so blacks sit near #1b1b1b, not pure 0
  4. BRICK TINT — warm red cast in shadows to echo the #a23a2f accent
  5. GENTLE S-CURVE — subtle contrast for the premium print feel

Usage:
  grade_photos.py <input.jpg> [output.jpg]          # single file
  grade_photos.py --dir images/raw/ --out images/   # batch, auto-names
  grade_photos.py --help

Outputs JPEG (quality 90) and WebP (quality 82) — the site's srcset wants
both. Batch mode writes <name>-800/-1600/-2400 widths per the README spec.
"""

import argparse
import os
import sys

import numpy as np
from PIL import Image, ImageEnhance

# Site tokens (from css/styles.css)
CREAM = np.array([247, 244, 240])   # #f7f4f0 warm off-white
SOFT_BLACK = np.array([27, 27, 27]) # #1b1b1b
BRICK = np.array([162, 58, 47])     # #a23a2f

SIZES = [800, 1600, 2400]


def to_float(img):
    return np.asarray(img, dtype=np.float32) / 255.0


def to_uint8(arr):
    return np.clip(arr * 255.0, 0, 255).astype(np.uint8)


def grade(arr):
    """Apply the full grade to a float [H,W,3] array."""
    # 1. Warmth: shift midtones/highlights toward cream
    #    luminance-weighted mix: out = in + warmth * (cream - in) * mask
    lum = arr @ np.array([0.2126, 0.7152, 0.0722])
    high_mask = np.clip((lum - 0.35) / 0.65, 0, 1)[..., None]  # highlights
    warm = 0.14
    arr = arr + warm * (CREAM / 255.0 - arr) * high_mask

    # 2. Mute: reduce saturation ~18%
    gray = np.tile(lum[..., None], (1, 1, 3))
    arr = gray + (arr - gray) * 0.82

    # 3. Soft blacks: lift shadows toward #1b1b1b (no pure black)
    low_mask = np.clip(1.0 - lum / 0.45, 0, 1)[..., None]
    lift = 0.10
    arr = arr + lift * (SOFT_BLACK / 255.0 - arr) * low_mask

    # 4. Brick tint: warm red cast in shadows (echoes #a23a2f)
    brick_shift = np.array([0.028, 0.006, -0.012], dtype=np.float32)
    arr = arr + brick_shift[None, None, :] * low_mask

    # 5. Gentle S-curve contrast
    def s_curve(x, mid=0.5, strength=1.10):
        return x ** (np.log(0.5) / np.log(mid)) ** (1 / strength)
    arr = s_curve(arr)

    return arr


def process(img, out_jpg, out_webp=None, quality=90):
    arr = grade(to_float(img.convert("RGB")))
    graded = Image.fromarray(to_uint8(arr))
    graded.save(out_jpg, "JPEG", quality=quality)
    if out_webp:
        graded.save(out_webp, "WEBP", quality=82)
    return graded


def batch(indir, outdir):
    os.makedirs(outdir, exist_ok=True)
    exts = (".jpg", ".jpeg", ".png", ".webp", ".heic")
    files = sorted(f for f in os.listdir(indir) if f.lower().endswith(exts))
    if not files:
        print(f"No images found in {indir}")
        return
    for f in files:
        stem = os.path.splitext(f)[0]
        img = Image.open(os.path.join(indir, f))
        # Full-res graded master (for email hero + largest srcset)
        master = grade(to_float(img.convert("RGB")))
        master_img = Image.fromarray(to_uint8(master))
        # Save each size per README naming
        for size in SIZES:
            w, h = master_img.size
            if w <= size:
                continue
            ratio = size / w
            resized = master_img.resize((size, int(h * ratio)), Image.Resampling.LANCZOS)
            jpg = os.path.join(outdir, f"{stem}-{size}.jpg")
            webp = os.path.join(outdir, f"{stem}-{size}.webp")
            resized.save(jpg, "JPEG", quality=90)
            resized.save(webp, "WEBP", quality=82)
            print(f"  {os.path.basename(jpg)} + .webp")
        # Always a base 800 (even if source smaller)
        if master_img.size[0] <= SIZES[0]:
            jpg = os.path.join(outdir, f"{stem}-800.jpg")
            webp = os.path.join(outdir, f"{stem}-800.webp")
            master_img.save(jpg, "JPEG", quality=90)
            master_img.save(webp, "WEBP", quality=82)
            print(f"  {os.path.basename(jpg)} + .webp (source < 800)")
        print(f"graded {f}")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("input", nargs="?", help="input image or --dir")
    ap.add_argument("output", nargs="?", help="output image (single mode)")
    ap.add_argument("--dir", help="batch: directory of raw photos")
    ap.add_argument("--out", help="batch: output directory")
    args = ap.parse_args()

    if args.dir:
        batch(args.dir, args.out or os.path.join(args.dir, "graded"))
        return

    if not args.input:
        ap.print_help()
        return

    out = args.output or os.path.splitext(args.input)[0] + "-graded.jpg"
    out_webp = os.path.splitext(out)[0] + ".webp"
    img = Image.open(args.input)
    process(img, out, out_webp)
    print(f"graded -> {out} (+ .webp)")


if __name__ == "__main__":
    main()
