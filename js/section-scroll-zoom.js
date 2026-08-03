/* Section scroll-zoom — AirSide-style scale/fade transitions (2026-08-03).
   Translated for the wedding site: as you scroll,
   - the hero content zooms out + fades as it leaves (mirrors the AirSide
     hero exit), and
   - each section's inner content zooms in subtly (1.03 -> 1) as it arrives,
     then eases down (1 -> 0.97) as it leaves.

   Design guardrails (Round 19 edit-down discipline):
   - Subtle only (3% max scale) — premium reads as restraint, not flash.
   - Solid section backgrounds stay static; only inner content transforms,
     so no background-edge artifacts.
   - Fully disabled under prefers-reduced-motion; lightweight (rAF throttle,
     passive scroll, transform+opacity only, no layout reads per frame beyond
     getBoundingClientRect).
   Progressive enhancement — no-JS safe. */
(function () {
  "use strict";

  var mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mqReduced.matches) return; // disabled under reduced motion

  var mqNarrow = window.matchMedia("(max-width: 760px)");

  function targets() {
    // hero content zooms out on exit; section wraps zoom in on enter
    var els = Array.prototype.slice.call(document.querySelectorAll(".hero-inner"));
    document.querySelectorAll(".section > .wrap, .section > .wrap-narrow, .section-tight > .wrap, .section-tight > .wrap-narrow").forEach(function (w) {
      els.push(w);
    });
    return els;
  }

  var els = targets();
  if (!els.length) return;

  var ticking = false;
  var vh = window.innerHeight || document.documentElement.clientHeight;

  function update() {
    ticking = false;
    var light = mqNarrow.matches ? 0.02 : 0.03; // gentler on mobile
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh * 1.25) {
        // fully off-screen: reset so we don't accumulate stale transforms
        if (el._szActive) {
          el.style.transform = "";
          el.style.opacity = "";
          el._szActive = false;
        }
        continue;
      }
      var total = rect.height + vh;
      var p = (vh - rect.top) / total; // 0 = bottom entering, 1 = top leaving
      p = Math.min(1, Math.max(0, p));

      var scale = 1;
      var opacity = 1;
      var isHero = el.classList.contains("hero-inner");

      // Enter zoom: 1.03 -> 1 over the first ~35% of the journey
      if (p < 0.35) {
        var t = p / 0.35;
        scale = (1 + light) - light * t;
      }
      // Exit zoom: 1 -> 0.97 over the last ~25% (hero also fades out)
      if (p > 0.75) {
        var u = (p - 0.75) / 0.25;
        scale = scale * (1 - light * u);
        if (isHero) opacity = 1 - 0.45 * u;
      }

      el.style.transform = scale === 1 ? "" : "scale(" + scale.toFixed(4) + ")";
      if (isHero) el.style.opacity = opacity === 1 ? "" : opacity.toFixed(4);
      el._szActive = true;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    vh = window.innerHeight || document.documentElement.clientHeight;
    update();
  });
  update(); // set initial state (hero visible)
})();
