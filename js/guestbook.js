/* Digital Guestbook — localStorage-backed message wall + big-screen mode */
(function () {
  "use strict";

  var KEY = "wedding-guestbook-v1";
  var messages = [];
  try {
    messages = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(messages)) messages = [];
  } catch (e) { messages = []; }

  // Live message count (animated stat)
  var countEl = document.getElementById("gb-count");
  function updateCount() {
    if (!countEl) return;
    countEl.textContent = messages.length;
  }
  updateCount();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(messages)); } catch (e) { /* storage full or blocked */ }
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fmtTime(ts) {
    try {
      return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    } catch (e) { return ""; }
  }

  function cardHTML(m, screen) {
    var heart = m.liked ? "liked" : "";
    var heartLabel = m.liked ? "Unlike" : "Like";
    var city = m.city ? '<span class="gb-city"> · ' + escapeHtml(m.city) + "</span>" : "";
    return (
      '<article class="gb-card" data-id="' + m.id + '">' +
        '<p class="gb-quote">“' + escapeHtml(m.message) + "”</p>" +
        '<p class="gb-from">— ' + escapeHtml(m.name) + city + "</p>" +
        (screen ? "" : '<button class="gb-heart ' + heart + '" aria-pressed="' + (m.liked ? "true" : "false") + '" aria-label="' + heartLabel + ' this message">' +
          '<span aria-hidden="true">♥</span><span>' + (m.hearts || 0) + "</span></button>") +
      "</article>"
    );
  }

  function renderWall() {
    var wall = document.getElementById("gb-wall");
    var empty = document.getElementById("gb-empty");
    var count = document.getElementById("gb-count");
    if (!wall) return;
    var sorted = messages.slice().sort(function (a, b) { return b.ts - a.ts; });
    wall.innerHTML = sorted.map(function (m) { return cardHTML(m, false); }).join("");
    if (empty) empty.hidden = messages.length > 0;
    if (count) count.textContent = messages.length === 1 ? "1 message" : messages.length + " messages";
    attachHearts(wall);
  }

  function renderScreen() {
    var wall = document.getElementById("gb-screen-wall");
    if (!wall) return;
    var sorted = messages.slice().sort(function (a, b) { return b.ts - a.ts; });
    wall.innerHTML = sorted.map(function (m) { return cardHTML(m, true); }).join("");
  }

  function attachHearts(root) {
    root.querySelectorAll(".gb-heart").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".gb-card");
        if (!card) return;
        var id = card.getAttribute("data-id");
        var m = messages.find(function (x) { return String(x.id) === String(id); });
        if (!m) return;
        m.liked = !m.liked;
        m.hearts = Math.max(0, (m.hearts || 0) + (m.liked ? 1 : -1));
        save();
        renderWall();
        if (screenActive()) renderScreen();
      });
    });
  }

  function toast(msg) {
    var el = document.getElementById("gb-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  /* --- Big screen mode --- */
  var screenEl = document.getElementById("gb-screen");
  var screenActiveFlag = false;

  function screenActive() { return screenActiveFlag; }

  function openScreen() {
    if (!screenEl) return;
    screenActiveFlag = true;
    screenEl.classList.add("active");
    screenEl.setAttribute("aria-hidden", "false");
    renderScreen();
    document.body.style.overflow = "hidden";
    try { localStorage.setItem("wedding-gb-screen", "1"); } catch (e) {}
  }

  function closeScreen() {
    if (!screenEl) return;
    screenActiveFlag = false;
    screenEl.classList.remove("active");
    screenEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    try { localStorage.setItem("wedding-gb-screen", "0"); } catch (e) {}
  }

  var openBtn = document.getElementById("gb-screen-btn");
  var closeBtn = document.getElementById("gb-screen-close");
  if (openBtn) openBtn.addEventListener("click", openScreen);
  if (closeBtn) closeBtn.addEventListener("click", closeScreen);

  document.addEventListener("keydown", function (e) {
    if (e.key === "d" || e.key === "D") {
      if (screenActive()) closeScreen(); else openScreen();
    }
    if (e.key === "Escape" && screenActive()) closeScreen();
  });

  /* --- Form submit --- */
  var form = document.getElementById("gb-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("gb-name").value.trim();
      var city = document.getElementById("gb-city").value.trim();
      var msg = document.getElementById("gb-message").value.trim();
      if (!name || !msg) {
        toast("Please add your name and a message.");
        return;
      }
      messages.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: name,
        city: city,
        message: msg,
        ts: Date.now(),
        hearts: 0,
        liked: false
      });
      save();
      updateCount();
      renderWall();
      if (screenActive()) renderScreen();
      // Send to backend (Google Apps Script → Sheet)
      var SCRIPT_URL = "https://script.google.com/macros/s/PASTE_YOUR_URL/exec";
      if (SCRIPT_URL.indexOf("PASTE_YOUR_URL") === -1) {
        fetch(SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "guestbook", name: name, city: city, message: msg })
        }).catch(function(){});
      }
      form.reset();
      updateHint();
      toast("Thank you! Your message is on the wall.");
      if (name) document.getElementById("gb-name").focus();
    });
  }

  /* --- Character counter --- */
  var msgField = document.getElementById("gb-message");
  var hint = document.getElementById("gb-count-hint");
  function updateHint() {
    if (msgField && hint) hint.textContent = msgField.value.length + " / 500";
  }
  if (msgField) msgField.addEventListener("input", updateHint);

  /* --- Init --- */
  renderWall();
  try {
    if (localStorage.getItem("wedding-gb-screen") === "1") openScreen();
  } catch (e) {}
})();
