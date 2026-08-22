/* components/page-transition.js — seamless internal navigation */
(function () {
  "use strict";

  var ANIM_MS = 250;
  var isTransitioning = false;

  function fadeOut(cb) {
    var veil = SRP.Dom.createEl("div", "page-veil");
    veil.setAttribute("aria-hidden", "true");
    veil.style.cssText = "position:fixed;inset:0;z-index:900;background:#fff;opacity:0;pointer-events:none;transition:opacity 250ms ease;";
    document.body.appendChild(veil);
    requestAnimationFrame(function () {
      veil.style.opacity = "1";
    });
    setTimeout(cb, ANIM_MS);
  }

  function handleClick(e) {
    if (isTransitioning) { e.preventDefault(); return; }
    var link = e.target.closest ? e.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;
    if (href.indexOf("http") === 0 && href.indexOf(location.origin) !== 0) return;

    var samePage = href === location.pathname.split("/").pop() || href === location.pathname;
    if (samePage) return;

    e.preventDefault();
    isTransitioning = true;
    markArrival();
    SRP.EventBus.emit("transition:start", href);
    fadeOut(function () {
      window.location.href = href;
    });
  }

  /* After transition arrival, skip the loader on the next page */
  function markArrival() {
    sessionStorage.setItem("srp-arrived", "1");
  }
  function clearArrival() {
    sessionStorage.removeItem("srp-arrived");
  }

  function init() {
    if (!window.SRP.Config.ENABLE_PAGE_TRANSITION) return;
    if (SRP.Dom.prefersReducedMotion()) return;
    if (!SRP.FeatureDetect.intersectionObserver()) return;

    document.addEventListener("click", handleClick);

    /* On load: if we arrived via transition, tell the loader to skip */
    if (sessionStorage.getItem("srp-arrived") === "1") {
      SRP.EventBus.emit("transition:arrived");
      setTimeout(clearArrival, 300);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.PageTransition = { init: init, markArrival: markArrival };
})();
