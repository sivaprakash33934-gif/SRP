/* modules/partners.js — quiet single mask fade (no per-chip stagger) */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var grid = SRP.Dom.$(".logo-grid");
    if (!grid) return;

    if (SRP.FeatureDetect.gsap() && SRP.FeatureDetect.clipPath()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(grid, { clipPath: "inset(0% 0% 100% 0%)", autoAlpha: 0 }, {
        clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1,
        duration: M().duration.medium, ease: "power2.out",
        scrollTrigger: { trigger: grid, start: "top 85%", once: true }
      });
    } else {
      grid.classList.add("reveal");
      SRP.Observers.reveal(grid);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.partners = { init: init };
})();
