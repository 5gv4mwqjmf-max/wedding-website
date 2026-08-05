/* Universal scroll-life (Round 76c — deterministic across browsers).
   WebKit/Safari interprets CSS animation-timeline view()/scroll() ranges
   INVERTED vs Chromium (verified in Playwright WebKit: heading at center
   = .35 start state, settle = opacity 0). So ALL scroll effects are now
   JS-driven via IntersectionObserver + rAF — one code path, identical
   on every browser. CSS keeps only the transition states (gated by
   html.js-scroll-fallback), JS toggles .in.
   Effects:
   1. Manifesto word reveal — words dim .5, light to 1 progressively
      as the pinned section scrolls (pure JS, always readable, no blur)
   2. Heading reveal (.gentle-reveal) — fade .35->1 + 8px rise via IO
   3. Content settle (.settle) — fade 0->1 + 10px rise via IO
   4. Gold-rule draw — scaleX 0->1 via IO
   5. Progress bar — rAF scaleX
   Guardrails: reduced-motion disables everything; passive listeners;
   no-JS safe; one-scroll-system-per-element. */
(function () {
  "use strict";

  var mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mqReduced.matches) return;

  var root = document.documentElement;
  root.classList.add("js-scroll-fallback");
  var vh = window.innerHeight || document.documentElement.clientHeight;

  // ---------- 1. manifesto word reveal ----------
  var manifesto = document.getElementById("manifesto");
  var typeEl = manifesto && manifesto.querySelector(".manifesto-type");
  if (typeEl) {
    var mWords = [];
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
    mWords = Array.prototype.slice.call(typeEl.querySelectorAll(".mw"));
    if (mWords.length) {
      root.classList.add("text-reveal");
      var tickA = false;
      var updateWords = function () {
        tickA = false;
        var r = manifesto.getBoundingClientRect();
        var total = r.height + vh;
        var p = Math.min(1, Math.max(0, (vh - r.top) / total));
        var t = Math.min(1, Math.max(0, (p - 0.05) / 0.67));
        var active = Math.floor(t * mWords.length);
        for (var i = 0; i < mWords.length; i++) {
          if (i <= active) mWords[i].classList.add("on");
          else mWords[i].classList.remove("on");
        }
      };
      var onScrollA = function () {
        if (!tickA) { tickA = true; window.requestAnimationFrame(updateWords); }
      };
      window.addEventListener("scroll", onScrollA, { passive: true });
      window.addEventListener("resize", function () { vh = window.innerHeight || document.documentElement.clientHeight; updateWords(); });
      updateWords();
    }
  }

  // ---------- 2. heading / settle / gold-rule reveal via rAF position
  // check (deterministic in EVERY engine — IO callbacks are async and
  // get skipped on fast scrolls in WebKit). ----------
  var revealEls = [];
  var pushEls = function (sel) {
    Array.prototype.slice.call(document.querySelectorAll(sel)).forEach(function (el) {
      revealEls.push(el);
    });
  };
  pushEls(".settle");
  pushEls(".gold-rule");
  pushEls(".gentle-reveal");
  var revealed = 0;
  var tickR = false;
  var checkReveal = function () {
    tickR = false;
    var limit = vh * 0.9; // reveal once the element is 90% up from the bottom
    for (var i = 0; i < revealEls.length; i++) {
      var el = revealEls[i];
      if (el.classList.contains("in")) continue;
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add("in");
        revealed++;
      }
    }
  };
  var onScrollR = function () {
    if (!tickR) { tickR = true; window.requestAnimationFrame(checkReveal); }
  };
  window.addEventListener("scroll", onScrollR, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight || document.documentElement.clientHeight; checkReveal(); });
  checkReveal();

  // ---------- 3. progress bar via rAF ----------
  var bar = document.querySelector(".scroll-progress");
  if (bar) {
    var tickB = false;
    var update = function () {
      tickB = false;
      var max = (document.documentElement.scrollHeight - vh) || 1;
      var p = Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset) / max));
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    };
    var onScrollB = function () {
      if (!tickB) { tickB = true; window.requestAnimationFrame(update); }
    };
    window.addEventListener("scroll", onScrollB, { passive: true });
    window.addEventListener("resize", function () { vh = window.innerHeight || document.documentElement.clientHeight; update(); });
    update();
  }
})();
