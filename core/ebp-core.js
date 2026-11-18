/*!
 * ebp-core.js — theme toggle + mobile nav disclosure for the three EBP sites.
 * No dependencies. Safe to load with `defer` anywhere; safe to load twice.
 * Contract: docs/design.md.
 *
 * Theme resolution (highest first):
 *   1. localStorage["ebp-theme"] ("light" | "dark") — an explicit visitor choice
 *   2. OS prefers-color-scheme: dark, on pages whose default is light
 *   3. <html data-default-theme="light|dark"> (missing = light)
 * The result is written to <html data-theme>. Every .ebp-theme-toggle gets
 * aria-pressed="true" in dark mode. A change dispatches
 *   document: CustomEvent("ebp:themechange", { detail: { theme } })
 *
 * Public API (window.EBP):
 *   EBP.init(root?)        re-sync toggles / nav buttons inside root (e.g. after injecting a header)
 *   EBP.getTheme()         "light" | "dark"
 *   EBP.setTheme(t, keep)  apply a theme; keep !== false stores it as the visitor's choice
 *   EBP.clearTheme()       forget the stored choice and fall back to default/OS
 *   EBP.closeNav()         close any open mobile nav
 */
(function (win, doc) {
  "use strict";
  if (win.EBP && win.EBP.__core) { return; }

  var KEY = "ebp-theme";
  var root = doc.documentElement;
  var mqDark = win.matchMedia ? win.matchMedia("(prefers-color-scheme: dark)") : null;

  function valid(t) { return t === "light" || t === "dark"; }

  function readStored() {
    try {
      var v = win.localStorage.getItem(KEY);
      return valid(v) ? v : null;
    } catch (e) { return null; }
  }
  function writeStored(t) {
    try {
      if (t) { win.localStorage.setItem(KEY, t); } else { win.localStorage.removeItem(KEY); }
    } catch (e) { /* private mode etc. */ }
  }

  function pageDefault() {
    return root.getAttribute("data-default-theme") === "dark" ? "dark" : "light";
  }
  function resolved() {
    var s = readStored();
    if (s) { return s; }
    /* Owner's decision: the page default always wins until the visitor uses the toggle;
       the OS dark preference is not followed. */
    return pageDefault();
  }
  function getTheme() {
    var t = root.getAttribute("data-theme");
    return valid(t) ? t : resolved();
  }

  function syncToggles(scope) {
    var dark = getTheme() === "dark";
    var list = (scope || doc).querySelectorAll(".ebp-theme-toggle");
    for (var i = 0; i < list.length; i++) {
      list[i].setAttribute("aria-pressed", dark ? "true" : "false");
      if (list[i].tagName === "BUTTON" && !list[i].hasAttribute("type")) { list[i].setAttribute("type", "button"); }
    }
  }

  /* The Spike logo is white line art; on paper (light mode) swap in the ink-line version.
     Only touches images whose file is logo.png / logo-ink.png; anything else keeps its dark tile. */
  function syncLogos(scope) {
    var dark = getTheme() === "dark";
    var list = (scope || doc).querySelectorAll("img.ebp-brand__logo");
    for (var i = 0; i < list.length; i++) {
      var src = list[i].getAttribute("src") || "";
      var m = src.match(/^(.*\/)?logo(-ink)?\.png(\?.*)?$/);
      if (!m) { continue; }
      var want = (m[1] || "") + (dark ? "logo.png" : "logo-ink.png") + (m[3] || "");
      if (want !== src) { list[i].setAttribute("src", want); }
      list[i].classList.add("ebp-brand__logo--bare");
    }
  }

  function apply(t, persist) {
    if (!valid(t)) { return; }
    var prev = root.getAttribute("data-theme");
    root.setAttribute("data-theme", t);
    if (persist) { writeStored(t); }
    syncToggles(doc);
    syncLogos(doc);
    if (prev !== t) {
      var ev;
      try {
        ev = new CustomEvent("ebp:themechange", { detail: { theme: t } });
      } catch (e) {
        ev = doc.createEvent("CustomEvent");
        ev.initCustomEvent("ebp:themechange", false, false, { theme: t });
      }
      doc.dispatchEvent(ev);
    }
  }

  /* ---- mobile nav disclosure ------------------------------------------ */
  function navFor(btn) {
    var id = btn.getAttribute("aria-controls");
    return id ? doc.getElementById(id) : null;
  }
  function setNav(btn, open, returnFocus) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    var header = btn.closest ? btn.closest(".ebp-header") : null;
    if (header) { header.classList.toggle("is-nav-open", open); }
    if (!open && returnFocus) { btn.focus(); }
  }
  function openToggles() {
    return doc.querySelectorAll('.ebp-nav-toggle[aria-expanded="true"]');
  }
  function closeNav(returnFocus) {
    var open = openToggles();
    for (var i = 0; i < open.length; i++) { setNav(open[i], false, returnFocus); }
  }

  function syncNavToggles(scope) {
    var list = (scope || doc).querySelectorAll(".ebp-nav-toggle");
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (b.getAttribute("aria-expanded") !== "true") { b.setAttribute("aria-expanded", "false"); }
      if (!b.hasAttribute("type")) { b.setAttribute("type", "button"); }
    }
  }

  function init(scope) {
    root.classList.add("ebp-js");
    if (!valid(root.getAttribute("data-theme"))) { apply(resolved(), false); }
    syncToggles(scope || doc);
    syncLogos(scope || doc);
    syncNavToggles(scope || doc);
  }

  /* ---- delegated events (work for headers injected later) -------------- */
  doc.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) { return; }
    var themeBtn = t.closest(".ebp-theme-toggle");
    if (themeBtn) {
      e.preventDefault();
      apply(getTheme() === "dark" ? "light" : "dark", true);
      return;
    }
    var navBtn = t.closest(".ebp-nav-toggle");
    if (navBtn) {
      e.preventDefault();
      setNav(navBtn, navBtn.getAttribute("aria-expanded") !== "true", false);
    }
  });

  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.key !== "Esc") { return; }
    var open = openToggles();
    if (!open.length) { return; }
    for (var i = 0; i < open.length; i++) {
      var btn = open[i];
      var nav = navFor(btn);
      var active = doc.activeElement;
      var inside = active === btn || (nav && nav.contains(active)) || active === doc.body;
      setNav(btn, false, inside);
    }
  });

  /* Leaving desktop/mobile breakpoint: don't leave a stale open state behind. */
  if (win.matchMedia) {
    var mqWide = win.matchMedia("(min-width: 48rem)");
    var onWide = function (m) { if (m.matches) { closeNav(false); } };
    if (mqWide.addEventListener) { mqWide.addEventListener("change", onWide); } else if (mqWide.addListener) { mqWide.addListener(onWide); }
  }

  /* OS preference changes apply only when the visitor has not chosen. */
  if (mqDark) {
    var onScheme = function () { if (!readStored()) { apply(resolved(), false); } };
    if (mqDark.addEventListener) { mqDark.addEventListener("change", onScheme); } else if (mqDark.addListener) { mqDark.addListener(onScheme); }
  }

  /* Keep tabs / sibling sites on the same origin in step. */
  win.addEventListener("storage", function (e) {
    if (e.key === KEY) { apply(valid(e.newValue) ? e.newValue : resolved(), false); }
  });

  /* Auto-sync headers injected after load (VEBP components.js). */
  if (win.MutationObserver) {
    var mo = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType === 1 && (n.matches(".ebp-theme-toggle, .ebp-nav-toggle") || n.querySelector(".ebp-theme-toggle, .ebp-nav-toggle"))) {
            init(n.parentNode || doc);
            return;
          }
        }
      }
    });
    var startObserving = function () { mo.observe(doc.body || root, { childList: true, subtree: true }); };
    if (doc.body) { startObserving(); } else { doc.addEventListener("DOMContentLoaded", startObserving); }
  }

  win.EBP = {
    __core: true,
    init: init,
    getTheme: getTheme,
    setTheme: function (t, keep) { apply(t, keep !== false); },
    clearTheme: function () { writeStored(null); apply(resolved(), false); },
    closeNav: function () { closeNav(false); }
  };

  init(doc);
  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", function () { init(doc); });
  }
})(window, document);
