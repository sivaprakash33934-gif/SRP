/* modules/whoApply.js — blue box: morphing shape entrance + pulse CTA */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var box = SRP.Dom.$(".blue-box");
    if (!box) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(box, { autoAlpha: 0, scale: 0.94, borderRadius: "50%" }, {
        autoAlpha: 1, scale: 1, borderRadius: "22px",
        duration: M().duration.slow, ease: M().easing.entrance,
        scrollTrigger: { trigger: box, start: "top 85%", once: true }
      });
    } else {
      box.classList.add("reveal-scale");
      SRP.Observers.reveal(box);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.whoApply = { init: init };
})();
