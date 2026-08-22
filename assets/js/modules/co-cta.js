/* modules/coCta.js — CTA panel: brighten + button pulse + arrow slide */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var panel = SRP.Dom.$(".cta-panel");
    if (!panel) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      var tl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: "top 82%", once: true }
      });
      tl.fromTo(panel, { filter: "brightness(0.9)", autoAlpha: 0, y: 40 }, {
        filter: "brightness(1)", autoAlpha: 1, y: 0,
        duration: M().duration.slow, ease: M().easing.entrance
      }).fromTo(".cta-panel .btn", { scale: 0.9, autoAlpha: 0 }, {
        scale: 1, autoAlpha: 1, duration: M().duration.fast, ease: "back.out(2)", stagger: 0.12
      }, "-=0.6").fromTo(".cta-panel .btn .btn-arrow", { x: -8, autoAlpha: 0 }, {
        x: 0, autoAlpha: 1, duration: M().duration.fast, ease: M().easing.entrance
      }, "-=0.4");
    } else {
      panel.classList.add("reveal");
      SRP.Observers.reveal(panel);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.coCta = { init: init };
})();
