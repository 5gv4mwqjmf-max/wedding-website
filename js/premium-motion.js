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
  var manifesto = document.getElementById("manifesto");
  var mWords = [];
  if (manifesto && !mqReduced.matches) {
    var typeEl = manifesto.querySelector(".manifesto-type");
    if (typeEl) {
      // Split text nodes into word spans, preserving the .script span
      var nodes = Array.prototype.slice.call(typeEl.childNodes);
      typeEl.innerHTML = "";
      var walk = function (node) {
        if (node.nodeType === 3) {
          var parts = node.textContent.split(/(\s+)/);
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              typeEl.appendChild(document.createTextNode(part));
            } else {
              var w = document.createElement("span");
              w.className = "mw";
              w.textContent = part;
              typeEl.appendChild(w);
              mWords.push(w);
            }
          });
        } else if (node.nodeType === 1) {
          var clone = node.cloneNode(false);
          Array.prototype.slice.call(node.childNodes).forEach(walk);
          typeEl.appendChild(clone);
        }
      };
      nodes.forEach(walk);
      // Re-select words inside the clone (script spans)
      mWords = Array.prototype.slice.call(typeEl.querySelectorAll(".mw"));
      if (mWords.length) document.documentElement.classList.add("pm-ready");

      var ticking = false;
      var update = function () {
        ticking = false;
        var r = manifesto.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        // 0 = section entering, 1 = section fully passed
        var total = r.height + vh;
        var p = (vh - r.top) / total;
        p = Math.min(1, Math.max(0, p));
        // words activate across the pinned journey 0.05 -> 0.72
        var t = Math.min(1, Math.max(0, (p - 0.05) / 0.67));
        var active = Math.floor(t * mWords.length);
        for (var i = 0; i < mWords.length; i++) {
          if (i <= active) mWords[i].classList.add("on");
          else mWords[i].classList.remove("on");
        }
      };
      var onScroll = function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      update();
    }
  } else if (manifesto && mqReduced.matches) {
    // reduced motion: keep everything visible, no splitting
    document.documentElement.classList.remove("pm-ready");
  }

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
