/* Shared site motion: scroll-drawn SVG, scroll-to-top button.
   Applied on all pages. Progressive enhancement — no-JS safe. */
(function () {
  "use strict";

  // Pause the hero video under prefers-reduced-motion (Round 44)
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.pause();
  }
  // Chromium pauses offscreen autoplay videos (battery saver) — resume the
  // sky when it scrolls back into view (Round 47; never under reduced motion)
  if (heroVideo && "IntersectionObserver" in window) {
    var vidIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (heroVideo.paused && !document.hidden) {
          var pr = heroVideo.play();
          if (pr && pr.catch) pr.catch(function () {});
        }
      });
    }, { threshold: 0.1 });
    vidIO.observe(heroVideo);
  }

  // --- Round 67: nav depth feedback ---
  // Solid ivory nav gains a soft shadow once you leave the hero —
  // motion as feedback (Apple pattern), rAF-throttled passive listener.
  var navPending = false;
  function updateNavScrolled() {
    var on = (window.scrollY || window.pageYOffset) > 24;
    document.body.classList.toggle("scrolled", on);
    navPending = false;
  }
  window.addEventListener("scroll", function () {
    if (navPending) return;
    navPending = true;
    if (window.requestAnimationFrame) window.requestAnimationFrame(updateNavScrolled);
    else setTimeout(updateNavScrolled, 32);
  }, { passive: true });
  updateNavScrolled();

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

  // --- Alive: floating petals (subtle, wedding-appropriate) ---
  var petalsWrap = document.querySelector(".petals");
  if (petalsWrap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var PETAL_COLORS = ["rgba(179,160,124,.5)", "rgba(74,111,92,.38)", "rgba(227,213,180,.4)", "rgba(42,35,23,.22)"]; // Round 56: sunset-sage palette
    var i;
    for (i = 0; i < 14; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      var size = 5 + Math.random() * 8;
      p.style.cssText =
        "left:" + (Math.random() * 100) + "%;" +
        "width:" + size + "px;height:" + (size * 1.2) + "px;" +
        "background:" + PETAL_COLORS[i % PETAL_COLORS.length] + ";" +
        "animation-duration:" + (11 + Math.random() * 12) + "s;" +
        "animation-delay:" + (Math.random() * 12) + "s;";
      petalsWrap.appendChild(p);
    }
  }

  // --- Scroll-tilt hero (Seedance/Apple-style: bg shifts on tilt) ---
  var hero = document.querySelector(".hero");
  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var onHeroScroll = function () {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y < window.innerHeight * 0.7) {
        var tilt = Math.min(6, y / 40) * (y > 0 ? 1 : 0);
        hero.style.setProperty("--tilt", tilt + "deg");
        hero.classList.add("tilt");
      } else {
        hero.classList.remove("tilt");
      }
    };
    window.addEventListener("scroll", onHeroScroll, { passive: true });
    onHeroScroll();
  }

  // --- Pop-out reveals (Seedance: elements pop up on scroll) ---
  var popEls = document.querySelectorAll(".reveal.pop");
  if (popEls.length && "IntersectionObserver" in window) {
    var popObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add("in"); });
    }, { threshold: 0.2 });
    popEls.forEach(function (el) { popObserver.observe(el); });
  }

  // --- Animated stat counters (Seedance: animated dashboard elements) ---
  var counters = document.querySelectorAll(".stat-num[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var counterObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var start = 0, dur = 900, t0 = null;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { counterObs.observe(el); });
  }

  // --- Countdown timer (inviting anticipation; Round 46: lives in marquee) ---
  var WEDDING_DATE = "2027-12-11T10:00:00";
  var cdNums = document.querySelectorAll(".cd-num[data-unit]");
  if (cdNums.length && WEDDING_DATE) {
    var target = new Date(WEDDING_DATE).getTime();
    var byUnit = {};
    cdNums.forEach(function (el) {
      var u = el.getAttribute("data-unit");
      (byUnit[u] = byUnit[u] || []).push(el);
    });
    var pulse = function (el) {
      el.classList.remove("ticked");
      void el.offsetWidth;
      el.classList.add("ticked");
    };
    var setAll = function (unit, val) {
      (byUnit[unit] || []).forEach(function (el) { el.textContent = val; pulse(el); });
    };
    var tick = function () {
      var dist = Math.max(0, target - new Date().getTime());
      setAll("days", Math.floor(dist / 86400000));
      setAll("hours", Math.floor((dist % 86400000) / 3600000));
      setAll("mins", Math.floor((dist % 3600000) / 60000));
      setAll("secs", Math.floor((dist % 60000) / 1000));
    };
    tick();
    setInterval(tick, 1000);
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
  // --- Scroll-to-top button (mobile UX: one tap back to top) ---
  var scrollBtn = document.createElement("div");
  scrollBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 15l-6-6-6 6"/></svg>';
  scrollBtn.setAttribute("aria-label", "Scroll to top");
  Object.assign(scrollBtn.style, {
    position: "fixed", bottom: "72px", right: "16px", zIndex: "99",
    width: "48px", height: "48px", borderRadius: "50%",
    background: "rgba(74,111,92,.9)", color: "#f6f4ef",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", opacity: "0", transform: "translateY(16px)",
    transition: "opacity .3s ease, transform .3s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,.2)"
  });
  scrollBtn.onclick = function() { window.scrollTo({top: 0, behavior: "smooth"}); };
  document.body.appendChild(scrollBtn);
  window.addEventListener("scroll", function() {
    if (window.scrollY > 400) {
      scrollBtn.style.opacity = "1"; scrollBtn.style.transform = "translateY(0)";
    } else {
      scrollBtn.style.opacity = "0"; scrollBtn.style.transform = "translateY(16px)";
    }
  }, {passive: true});
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scrollBtn.style.display = "none";
  }
  // --- Continuous-scroll parallax: photo tiles drift subtly on scroll ---
  if (window.innerWidth > 760 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var parallaxEls = document.querySelectorAll(".photo-tile .photo-wrap");
    var updateParallax = function() {
      var vh = window.innerHeight;
      parallaxEls.forEach(function(wrap) {
        var r = wrap.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var progress = (r.top + r.height / 2 - vh / 2) / (vh / 2); // -1..1
        var drift = Math.max(-14, Math.min(14, progress * 14));
        wrap.style.setProperty("--parallax", drift + "px");
        wrap.classList.add("is-parallax");
      });
    };
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    window.addEventListener("load", function() { setTimeout(updateParallax, 150); });
  }

})();
