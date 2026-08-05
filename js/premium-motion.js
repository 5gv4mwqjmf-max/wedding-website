/* Premium motion (Round 57) — award-site techniques from the Viktor Oddy
   reference (6uwrRGARVlg), translated on-brand for the wedding site:
   1. Manifesto word reveal — words activate as the pinned section scrolls
      (scroll-linked, rAF-throttled; reduced-motion = all words visible)
   2. Magnetic buttons — primary CTAs lean a few px toward the cursor
      (desktop pointer only, tiny, no layout shift)
   3. Photo-tile 3D tilt — hover tilt ±3deg for depth (desktop pointer only)
   Guardrails: transform+opacity only, reduced-motion disables, touch/mobile
   gets nothing, progressive enhancement (html.pm-ready gates the dim state). */
(function () {
  "use strict";

  var mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqFine = window.matchMedia("(hover: hover) and (pointer: fine)");
  var mqNarrow = window.matchMedia("(max-width: 760px)");

  // ---------- 1. Manifesto word reveal ----------
  // Round 70: disabled — user asked to remove all scroll effects from the
  // homepage. The manifesto renders as plain, always-visible text.
  var manifesto = document.getElementById("manifesto");
  if (manifesto) document.documentElement.classList.remove("pm-ready");

  // ---------- 2. Magnetic buttons (desktop pointer only) ----------
  if (mqFine.matches && !mqReduced.matches && !mqNarrow.matches) {
    var mags = document.querySelectorAll(".hero-actions .btn, .final-cta-actions .btn, #rsvp .btn, .sticky-mobile-cta .btn");
    var MAG = 5; // max px of pull
    mags.forEach(function (btn) {
      btn.classList.add("mag");
      var raf = null;
      var onMove = function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = null;
          var r = btn.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          var d = Math.sqrt(dx * dx + dy * dy) || 1;
          var pull = Math.min(1, 40 / d);
          var x = (dx / d) * MAG * pull;
          var y = (dy / d) * MAG * pull;
          btn.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
        });
      };
      var onLeave = function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        btn.style.transform = "";
      };
      btn.addEventListener("mousemove", onMove, { passive: true });
      btn.addEventListener("mouseleave", onLeave);
    });
  }

  // ---------- 4. Movie-title clip-path reveal on section heads ----------
  // Round 70: DISABLED — scroll-linked (IntersectionObserver). Homepage is
  // now static-on-scroll per user request. Kept for reference only.
  /*
  if (mqFine.matches && !mqReduced.matches && !mqNarrow.matches && "IntersectionObserver" in window) {
    var heads = document.querySelectorAll(".section-head h2, .photo-tile .tile-text h2");
    heads.forEach(function (h) {
      h.classList.add("head-reveal");
    });
    if (heads.length) document.documentElement.classList.add("pm-ready");
    var headIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // Observe the PARENT: the h2 itself is clip-path-clipped to 0
        // visible area, so an IO on it reports ratio 0 and never fires
        // (Round 60 catch-22). Reveal the h2 when its container enters.
        if (!e.target._heads) return;
        e.target._heads.forEach(function (h) {
          if (e.isIntersecting) h.classList.add("in");
          else h.classList.remove("in");
        });
      });
    }, { threshold: 0.25 });
    heads.forEach(function (h) {
      var host = h.closest(".tile-text, .center, .wrap, .wrap-narrow") || h.parentElement;
      if (!host._heads) host._heads = [];
      host._heads.push(h);
      headIO.observe(host);
    });
  }
  */

  // ---------- 3. Photo-tile 3D tilt (desktop pointer only) ----------
  if (mqFine.matches && !mqReduced.matches && !mqNarrow.matches) {
    var tiles = document.querySelectorAll(".photo-tile");
    tiles.forEach(function (tile) {
      tile.classList.add("tilt-stage");
      var wrap = tile.querySelector(".photo-wrap");
      if (!wrap) return;
      // Tilt the inner <picture>, NOT the wrap — walk-camera parallax owns
      // the wrap's translateY; nested transforms compose (Round 57b)
      var tiltEl = tile.querySelector(".photo-wrap picture") || wrap;
      tiltEl.classList.add("tilt");
      var raf = null;
      var onMove = function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = null;
          var r = tile.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          tiltEl.style.transform = "rotateY(" + (px * 5).toFixed(2) + "deg) rotateX(" + (-py * 4).toFixed(2) + "deg)";
        });
      };
      var onLeave = function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        tiltEl.style.transform = "";
      };
      tile.addEventListener("mousemove", onMove, { passive: true });
      tile.addEventListener("mouseleave", onLeave);
    });
  }
})();
