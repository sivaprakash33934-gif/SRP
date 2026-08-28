/* ================================================================
 * FILE: assets/js/modules/footer.js
 * SRP Footer Component
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  "use strict";

  var footerEl = null;
  var activeTweens = [];
  var clickListener = null;

  var M = function () { 
    return window.SRP && window.SRP.MotionConfig ? window.SRP.MotionConfig : { 
      duration: { medium: 0.8 }, 
      easing: { entrance: "power3.out" } 
    }; 
  };

  function init() {
    footerEl = window.SRP.Dom && window.SRP.Dom.$ ? window.SRP.Dom.$(".site-footer") : document.querySelector(".site-footer");
    if (!footerEl) return;

    // 1. Dynamic Year
    var yearEls = footerEl.querySelectorAll("[data-year]");
    var currentYear = new Date().getFullYear();
    for (var i = 0; i < yearEls.length; i++) {
      yearEls[i].textContent = currentYear;
    }

    // 2. Entrance Animation
    var reduced = false;
    if (window.SRP && window.SRP.Dom && window.SRP.Dom.prefersReducedMotion) {
      reduced = window.SRP.Dom.prefersReducedMotion();
    }
    if (document.body.classList.contains("reduced-motion")) {
      reduced = true;
    }

    if (window.SRP && window.SRP.FeatureDetect && window.SRP.FeatureDetect.gsap() && !reduced) {
      var tween = gsap.fromTo(footerEl, { y: 60, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: M().duration.medium, ease: M().easing.entrance,
        scrollTrigger: { trigger: footerEl, start: "top 95%", once: true }
      });
      activeTweens.push(tween);
    } else {
      footerEl.classList.add("reveal");
      if (window.SRP && window.SRP.Observers && window.SRP.Observers.reveal) {
        window.SRP.Observers.reveal(footerEl);
      }
    }

    // 3. Smooth scroll for anchor links within footer (e.g. "back to top")
    clickListener = function(e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      
      e.preventDefault();
      
      if (window.__lenis && !reduced) {
        window.__lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
    };
    footerEl.addEventListener("click", clickListener);
  }

  function destroy() {
    activeTweens.forEach(function(t) { 
      if (t.scrollTrigger) t.scrollTrigger.kill();
      t.kill(); 
    });
    activeTweens = [];

    if (footerEl && clickListener) {
      footerEl.removeEventListener("click", clickListener);
      clickListener = null;
    }

    footerEl = null;
  }

  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.footer = { init: init, destroy: destroy };
})();
