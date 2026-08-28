/* ================================================================
 * FILE: assets/js/modules/navbar.js
 * SRP Navbar Component (Glass nav, active indicator, mobile drawer)
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  "use strict";

  var nav = null;
  var toggle = null;
  var links = null;
  var scrollListener = null;
  var toggleClickListener = null;
  var linksClickListener = null;
  var smoothScrollListener = null;
  var resizeListener = null;
  var keyListener = null;

  function init() {
    nav = window.SRP.Dom.$(".site-nav");
    toggle = window.SRP.Dom.$(".nav-toggle");
    links = window.SRP.Dom.$(".nav-links");
    if (!nav) return;

    /* Active Indicator logic */
    if (links) {
      var currentPage = window.SRP.CurrentPage || 'home';
      var updatedLinks = links.querySelectorAll('.nav-link');
      for (var k = 0; k < updatedLinks.length; k++) {
        var linkHref = updatedLinks[k].getAttribute('href') || '';
        updatedLinks[k].classList.remove('is-active');
        if (linkHref.indexOf(currentPage) > -1 || (currentPage === 'home' && linkHref === 'index.html')) {
          updatedLinks[k].classList.add('is-active');
          updatedLinks[k].setAttribute('aria-current', 'page');
        } else {
          updatedLinks[k].removeAttribute('aria-current');
        }
      }
    }

    /* Glass on scroll */
    var ticking = false;
    function onScroll() {
      ticking = false;
      if (nav) {
        nav.classList.toggle("is-scrolled", window.scrollY > 24);
      }
    }
    scrollListener = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    };
    window.addEventListener("scroll", scrollListener, { passive: true });
    onScroll();

    /* Mobile drawer */
    if (toggle && links) {
      toggleClickListener = function () {
        var open = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      };
      toggle.addEventListener("click", toggleClickListener);
      
      linksClickListener = function (e) {
        if (e.target.closest("a")) {
          links.classList.remove("is-open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      };
      links.addEventListener("click", linksClickListener);
    }
    
    /* Close on resize > 768px */
    resizeListener = function() {
      if (window.innerWidth > 768 && links && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    };
    window.addEventListener("resize", resizeListener);
    
    /* Close on Esc */
    keyListener = function(e) {
      if (e.key === "Escape" && links && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    };
    document.addEventListener("keydown", keyListener);

    /* Smooth anchor scrolling */
    smoothScrollListener = function (e) {
      if (!e.target.closest) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id === '#') return;
      var target = window.SRP.Dom.$(id);
      if (!target) return;
      e.preventDefault();
      
      var reduced = window.SRP.Dom.prefersReducedMotion() || document.body.classList.contains("reduced-motion");
      
      if (window.__lenis && !reduced) {
        window.__lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
    };
    document.addEventListener("click", smoothScrollListener);
  }
  
  function destroy() {
    if (scrollListener) {
      window.removeEventListener("scroll", scrollListener);
      scrollListener = null;
    }
    if (toggle && toggleClickListener) {
      toggle.removeEventListener("click", toggleClickListener);
      toggleClickListener = null;
    }
    if (links && linksClickListener) {
      links.removeEventListener("click", linksClickListener);
      linksClickListener = null;
    }
    if (resizeListener) {
      window.removeEventListener("resize", resizeListener);
      resizeListener = null;
    }
    if (keyListener) {
      document.removeEventListener("keydown", keyListener);
      keyListener = null;
    }
    if (smoothScrollListener) {
      document.removeEventListener("click", smoothScrollListener);
      smoothScrollListener = null;
    }
    nav = null;
    toggle = null;
    links = null;
  }

  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.navbar = { init: init, destroy: destroy };
})();
