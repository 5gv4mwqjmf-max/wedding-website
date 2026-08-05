/* Universal scroll-life (Round 75/76).
   Two jobs:
   A) Manifesto word reveal — pure JS, runs on EVERY browser (no CSS
      scroll-timeline dependency). R57 signature text effect rebuilt:
      words dim at .5 opacity (always readable), light up to 1 as the
      pinned section scrolls past; 4px rise only — no blur, no zoom.
   B) Universal fallback for CSS scroll-timeline effects (gold-rule
      draw, content settle, heading reveal, progress bar). CSS
      animation-timeline: view()/scroll() only exists in Chrome/Edge
      115+ and Safari 26+. When missing, this re-implements the same
      effects with IntersectionObserver + rAF.
   Modern browsers: part A runs, part B returns early (CSS keeps the
   work). Old Safari/iPhone: both parts drive everything via JS.
   Guardrails: reduced-motion disables everything; passive listeners;
   no-JS safe; one-scroll-system-per-element. */
(function () {
  "use strict";

  var mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mqReduced.matches) return;

  var root = document.documentElement;
  var vh = window.innerHeight || document.documentElement.clientHeight;

  // ================= A. manifesto word reveal (universal) =================
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

  // ================= B. universal fallback for CSS timeline effects =================
  var hasView = CSS.supports && CSS.supports("animation-timeline: view()");
  var hasScroll = CSS.supports && CSS.supports("animation-timeline: scroll()");
  if (hasView && hasScroll) return; // modern browser: CSS handles the rest

  root.classList.add("js-scroll-fallback");

  // B1. content settle + gold-rule draw + heading reveal via IO
  if (!hasView && "IntersectionObserver" in window) {
    var reveal = function (els, cls) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add(cls);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -15% 0px" });
      els.forEach(function (el) { io.observe(el); });
    };
    var settles = Array.prototype.slice.call(document.querySelectorAll(".settle"));
    if (settles.length) reveal(settles, "in");
    var rules = Array.prototype.slice.call(document.querySelectorAll(".gold-rule"));
    if (rules.length) reveal(rules, "in");
    var heads = Array.prototype.slice.call(document.querySelectorAll(".gentle-reveal"));
    if (heads.length) reveal(heads, "in");
  }

  // B2. progress bar via rAF
  if (!hasScroll) {
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
  }
})();
