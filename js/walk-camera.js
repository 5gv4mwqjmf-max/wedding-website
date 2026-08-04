/* Walk-through camera — "walk through rooms, not an elevator" (Round 56).
   As you scroll, each major section behaves like a room you walk INTO:
   - approaching from below: smaller + tilted toward you (ahead in the hall)
   - centered: full size, level, at eye height
   - passed above: shrinks + tilts away (you've walked past it)
   Inner content parallaxes at a different rate (photo recedes, text stays
   forward) for depth.
   Exclusions (deliberate):
   - #hero      : the front door — keeps its own gentle exit zoom
   - #marquee   : thin ticker strip, would read as a glitch at full zoom
   - #stats     : thin strip
   - #manifesto : sticky-pin section — transforms break position:sticky
   Guardrails (Round 19 discipline):
   - transform+opacity only; rAF-throttled; passive scroll
   - reduced-motion disables everything (no inline styles at all)
   - mobile (<=760px): gentler scale, zero tilt
   - progressive enhancement — no-JS safe */
(function () {
  "use strict";

  var mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mqReduced.matches) return; // fully disabled under reduced motion

  var mqNarrow = window.matchMedia("(max-width: 760px)");

  var SKIP = { hero: 1, marquee: 1, stats: 1, manifesto: 1 };

  function rooms() {
    var els = [];
    document.querySelectorAll("main > section").forEach(function (s) {
      if (!SKIP[s.id]) els.push(s);
    });
    return els;
  }

  var roomsArr = rooms();
  var heroInner = document.querySelector(".hero-inner");
  if (!roomsArr.length && !heroInner) return;

  var ticking = false;
  var vh = window.innerHeight || document.documentElement.clientHeight;

  function update() {
    ticking = false;
    var light = mqNarrow.matches;

    // ---- rooms (walk-through camera) ----
    for (var i = 0; i < roomsArr.length; i++) {
      var sec = roomsArr[i];
      var rect = sec.getBoundingClientRect();
      // off-screen: reset so we don't accumulate stale transforms
      if (rect.bottom < -rect.height * 0.5 || rect.top > vh + rect.height * 0.5) {
        if (sec._wc) {
          sec.style.transform = "";
          sec.style.opacity = "";
          sec.style.filter = "";
          sec._wc = false;
        }
        continue;
      }
      sec._wc = true;

      var center = rect.top + rect.height / 2;
      var dist = (center - vh / 2) / (vh + rect.height); // -0.5..0.5, + = below center
      var p = Math.min(1, Math.max(0, 0.5 - dist)); // 0 approaching, 0.5 center, 1 leaving

      var scale, tilt, blur = 0;
      if (light) {
        scale = 1 - 0.06 * Math.abs(p - 0.5) * 2;
        tilt = 0;
      } else {
        scale = 1 - 0.14 * Math.abs(p - 0.5) * 2;
        tilt = (0.5 - p) * 22; // +11deg approaching (look up at the room), -11deg receding
        // Cinematic depth-of-field (Round 60): rooms blur as they recede,
        // sharp at eye height. Round 62: much subtler (max 1.2px, starts
        // later so mid-approach stays crisp).
        var blurAmt = Math.abs(p - 0.5) * 2; // 0 center -> 1 at edges
        blur = blurAmt > 0.1 ? Math.min(1.2, (blurAmt - 0.1) * 1.6) : 0;
      }

      var transform = "perspective(1100px) rotateX(" + tilt.toFixed(2) + "deg) scale(" + scale.toFixed(4) + ")";
      sec.style.transform = (scale === 1 && tilt === 0) ? "" : transform;
      sec.style.filter = blur ? "blur(" + blur.toFixed(2) + "px)" : "";

      var opacity = 1;
      if (p < 0.04) opacity = p / 0.04;
      else if (p > 0.96) opacity = (1 - p) / 0.04;
      sec.style.opacity = opacity === 1 ? "" : opacity.toFixed(3);

      // parallax inner layers: background recedes, foreground stays forward
      var layers = sec.querySelectorAll(".photo-wrap, .tile-text, .wrap, .wrap-narrow");
      for (var j = 0; j < layers.length; j++) {
        var w = layers[j];
        var depth = 1;
        if (w.classList.contains("photo-wrap")) depth = 0.86;
        else if (w.classList.contains("tile-text")) depth = 1.14;
        var off = (0.5 - p) * 70 * (depth - 1);
        w.style.transform = off === 0 ? "" : "translateY(" + off.toFixed(1) + "px)";
      }
    }

    // ---- hero (front door): gentle exit zoom as you walk past ----
    if (heroInner) {
      var hr = heroInner.getBoundingClientRect();
      if (hr.bottom > 0 && hr.top < vh * 1.25) {
        var total = hr.height + vh;
        var hp = Math.min(1, Math.max(0, (vh - hr.top) / total));
        var hScale = 1, hOpacity = 1;
        if (hp > 0.75) {
          var u = (hp - 0.75) / 0.25;
          hScale = 1 - 0.03 * u;
          hOpacity = 1 - 0.45 * u;
        }
        heroInner.style.transform = hScale === 1 ? "" : "scale(" + hScale.toFixed(4) + ")";
        heroInner.style.opacity = hOpacity === 1 ? "" : hOpacity.toFixed(4);
      } else if (heroInner._wc) {
        heroInner.style.transform = "";
        heroInner.style.opacity = "";
        heroInner._wc = false;
      }
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
  update(); // set initial state (hero visible, first room settled)
})();
