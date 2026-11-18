/*!
 * toolkit.js — small enhancements for the Punk Archiving Toolkit pages.
 * Loaded with `defer` after core/ebp-core.js. No dependencies.
 *   1. Links that open a new tab get a visible arrow and screen-reader text.
 *   2. On narrow screens the toolkit subnav collapses behind a "Sections" button
 *      (click/Enter/Space toggles, Esc closes and returns focus). Without JS the list stays open.
 */
(function (doc) {
  "use strict";

  /* ---- 1. new-tab cue ---------------------------------------------------- */
  function cue() {
    var wrap = doc.createElement("span");
    wrap.className = "tk-newtab";
    var icon = doc.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "↗";
    var txt = doc.createElement("span");
    txt.className = "ebp-vh";
    txt.textContent = " (opens in new tab)";
    wrap.appendChild(icon);
    wrap.appendChild(txt);
    return wrap;
  }
  var links = doc.querySelectorAll('a[target="_blank"]');
  for (var i = 0; i < links.length; i++) {
    if (!links[i].querySelector(".tk-newtab")) { links[i].appendChild(cue()); }
  }

  /* ---- 2. subnav disclosure on narrow screens ---------------------------- */
  var nav = doc.querySelector(".tk-subnav");
  var btn = nav && nav.querySelector(".tk-subnav__toggle");
  var list = btn && doc.getElementById(btn.getAttribute("aria-controls"));
  if (!btn || !list) { return; }

  nav.classList.add("tk-subnav--js");
  btn.hidden = false;

  function set(open, focusBtn) {
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (!open && focusBtn) { btn.focus(); }
  }

  btn.addEventListener("click", function () {
    set(btn.getAttribute("aria-expanded") !== "true", false);
  });

  nav.addEventListener("keydown", function (e) {
    if ((e.key === "Escape" || e.key === "Esc") && btn.getAttribute("aria-expanded") === "true") {
      e.stopPropagation();
      set(false, true);
    }
  });

  /* Following an in-page link closes the menu so the target is visible. */
  list.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("a")) { set(false, false); }
  });

  /* Back on a wide screen the list is always shown; reset the state. */
  if (window.matchMedia) {
    var wide = window.matchMedia("(min-width: 48rem)");
    var onWide = function (m) { if (m.matches) { set(false, false); } };
    if (wide.addEventListener) { wide.addEventListener("change", onWide); } else if (wide.addListener) { wide.addListener(onWide); }
  }
})(document);
