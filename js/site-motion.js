/* Shared site motion: scroll-drawn SVG, scroll-to-top button.
   Applied on all pages. Progressive enhancement — no-JS safe. */
(function () {
  "use strict";

  // --- Scroll-drawn SVG paths (SuperHi/Lusion technique) ---
  // Any path with class "draw-path" draws itself as the page scrolls past
  // its container, and reverses when scrolling back up.
  var drawPaths = document.querySelectorAll(".draw-path");
  if (drawPaths.length) {
    var drawRoots = [];
    drawPaths.forEach(function (p) {
      var container = p.closest(".draw-scroll") || p.parentElement;
      if (drawRoots.indexOf(container) === -1) drawRoots.push(container);
      // Set each path's dasharray to its full length once
      var len = p.getTotalLength ? p.getTotalLength() : 2000;
      p.style.strokeDasharray = len + " " + len;
      p.style.strokeDashoffset = len;
      p.setAttribute("data-draw-len", len);
    });

    var updateDraw = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      drawRoots.forEach(function (root) {
        var r = root.getBoundingClientRect();
        // progress = how far the element has scrolled through the viewport
        // 0 when its bottom hits viewport top, 1 when its top hits viewport bottom
        var total = r.height + vh;
        var scrolled = vh - r.top;
        var progress = Math.min(1, Math.max(0, scrolled / total));
        root.querySelectorAll(".draw-path").forEach(function (p) {
          var len = parseFloat(p.getAttribute("data-draw-len")) || 2000;
          p.style.strokeDashoffset = len * (1 - progress);
        });
      });
    };

    window.addEventListener("scroll", updateDraw, { passive: true });
    window.addEventListener("resize", updateDraw);
    // Delay so fonts/layout settle before measuring
    window.addEventListener("load", function () { setTimeout(updateDraw, 100); });
    updateDraw();
  }

  // --- Scroll-to-top button ---
  var topBtn = document.querySelector(".scroll-top");
  if (topBtn) {
    var onScroll = function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y > 300) topBtn.classList.add("visible");
      else topBtn.classList.remove("visible");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    onScroll();
  }
})();
