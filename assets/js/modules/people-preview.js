/* modules/peoplePreview.js — glass float panel + CTA */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var panel = SRP.Dom.$(".people-preview");
    if (!panel) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(panel, { autoAlpha: 0, y: 60 }, {
        autoAlpha: 1, y: 0, duration: M().duration.slow, ease: M().easing.entrance,
        scrollTrigger: { trigger: panel, start: "top 85%", once: true }
      });
    } else {
      panel.classList.add("reveal");
      SRP.Observers.reveal(panel);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.peoplePreview = { init: init };
})();
