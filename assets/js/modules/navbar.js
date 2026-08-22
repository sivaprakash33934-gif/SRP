/* modules/navbar.js — glass nav, active indicator, mobile drawer, smooth anchor scroll */
(function () {
  "use strict";

  var nav = null;
  var toggle = null;
  var links = null;

  function init() {
    nav = SRP.Dom.$(".site-nav");
    toggle = SRP.Dom.$(".nav-toggle");
    links = SRP.Dom.$(".nav-links");
    if (!nav) return;

    /* Glass on scroll */
    var ticking = false;
    function onScroll() {
      ticking = false;
      nav.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    /* Mobile drawer */
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          links.classList.remove("is-open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    /* Smooth anchor scrolling (hero-scroll link, footer links) */
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      var target = SRP.Dom.$(id);
      if (!target) return;
      e.preventDefault();
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: SRP.Dom.prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      }
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.navbar = { init: init };
})();
