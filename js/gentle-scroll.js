/* Gentle scroll life (Round 73) — deliberately whisper-level.
   History: R70/R71 removed ALL scroll effects per user request; this
   re-adds only THREE subtle, readable-safe effects:
   1. Cinematic hero exit   — hero slightly scales down + fades as you
                              scroll past it (Apple product-page feel)
   2. Photo parallax        — .photo-wrap images drift +/-12px (±6px on
                              mobile) as they cross vertical center
   3. (Heading settle is CSS-only: .apple-reveal in styles.css)
   Hard rules inherited from earlier rounds:
   - NO room transforms, NO blur, NO text movement
   - transform + opacity only; rAF-throttled; passive scroll listeners
   - reduced-motion disables EVERYTHING (no inline styles)
   - mobile gets gentler values
   - progressive enhancement — no-JS safe
   Conflicts: parallax owns .photo-wrap (not the inner <picture>, which
   premium-motion tilts on hover). Hero owns .hero-inner (walk-camera is
   no longer loaded). */
(function () {
  "use strict";

  var mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mqReduced.matches) return;

  var mqNarrow = window.matchMedia("(max-width: 760px)");

  var heroInner = document.querySelector(".hero-inner");
  var photoWraps = Array.prototype.slice.call(document.querySelectorAll(".photo-wrap"));
  if (!heroInner && !photoWraps.length) return;

  var ticking = false;
  var vh = window.innerHeight || document.documentElement.clientHeight;

  function update() {
    ticking = false;
    var light = mqNarrow.matches;

    // ---- 1. cinematic hero exit ----
    if (heroInner) {
      var hr = heroInner.getBoundingClientRect();
      if (hr.bottom > 0 && hr.top < vh * 1.25) {
        var total = hr.height + vh;
        var hp = Math.min(1, Math.max(0, (vh - hr.top) / total));
        var hScale = 1, hOpacity = 1;
        if (hp > 0.7) {
          var u = (hp - 0.7) / 0.3;
          hScale = 1 - 0.015 * u;      // max 1.5% shrink
          hOpacity = 1 - 0.18 * u;     // never below 82%
        }
        heroInner.style.transform = hScale === 1 ? "" : "scale(" + hScale.toFixed(4) + ")";
        heroInner.style.opacity = hOpacity === 1 ? "" : hOpacity.toFixed(4);
        heroInner._g = true;
      } else if (heroInner._g) {
        heroInner.style.transform = "";
        heroInner.style.opacity = "";
        heroInner._g = false;
      }
    }

    // ---- 2. photo parallax (depth drift) ----
    var limit = light ? 6 : 12;
    for (var i = 0; i < photoWraps.length; i++) {
      var wrap = photoWraps[i];
      var r = wrap.getBoundingClientRect();
      if (r.bottom < -r.height || r.top > vh + r.height) {
        if (wrap._g) { wrap.style.transform = ""; wrap._g = false; }
        continue;
      }
      wrap._g = true;
      // p: -1 top edge, 0 center, +1 bottom edge
      var p = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      p = Math.min(1, Math.max(-1, p));
      var off = -p * limit; // image drifts opposite the scroll a touch
      wrap.style.transform = off === 0 ? "" : "translateY(" + off.toFixed(1) + "px)";
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight || document.documentElement.clientHeight; update(); });
  update();
})();
