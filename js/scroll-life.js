/* Universal scroll-life fallback (Round 75).
   Problem: the CSS effects (gold-rule draw, content settle, progress
   bar) rely on animation-timeline: view()/scroll(), which only exists in
   Chrome/Edge 115+ and Safari 26+. On older Safari (most iPhones) the
   effects silently do nothing.
   This script detects missing support and re-implements the SAME effects
   with IntersectionObserver + rAF, so they work on every browser.
   When the browser supports the CSS timelines natively, this does
   nothing (CSS keeps doing the work).
   Guardrails: reduced-motion disables everything; passive listeners;
   no-JS safe; respects the one-scroll-system-per-element rule. */
(function () {
  "use strict";

  var mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mqReduced.matches) return;

  // If the browser supports BOTH view() and scroll() timelines natively,
  // the CSS already provides these effects — nothing to do here.
  var hasView = CSS.supports && CSS.supports("animation-timeline: view()");
  var hasScroll = CSS.supports && CSS.supports("animation-timeline: scroll()");
  if (hasView && hasScroll) return;

  var root = document.documentElement;
  root.classList.add("js-scroll-fallback");
  var vh = window.innerHeight || document.documentElement.clientHeight;

  // ---------- 1. content settle + gold-rule draw via IO ----------
  if (!hasView && "IntersectionObserver" in window) {
    var reveal = function (els, cls) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add(cls);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(function (el) { io.observe(el); });
    };
    var settles = Array.prototype.slice.call(document.querySelectorAll(".settle"));
    if (settles.length) reveal(settles, "in");
    var rules = Array.prototype.slice.call(document.querySelectorAll(".gold-rule"));
    if (rules.length) reveal(rules, "in");
  }

  // ---------- 2. progress bar via rAF ----------
  if (!hasScroll) {
    var bar = document.querySelector(".scroll-progress");
    if (bar) {
      var ticking = false;
      var update = function () {
        ticking = false;
        var max = (document.documentElement.scrollHeight - vh) || 1;
        var p = Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset) / max));
        bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
      };
      var onScroll = function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", function () { vh = window.innerHeight || document.documentElement.clientHeight; update(); });
      update();
    }
  }
})();
