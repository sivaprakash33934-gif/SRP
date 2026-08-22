/* modules/aboutPage.js — About header mask reveal + mission split panels */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    /* Mission split: statement from right, engine from left */
    var missL = SRP.Dom.$(".mission-card.l");
    var missR = SRP.Dom.$(".mission-card.r");
    if (SRP.FeatureDetect.gsap()) {
      var tl = gsap.timeline({ defaults: { ease: M().easing.entrance, duration: M().duration.slow } });
      if (missL) tl.fromTo(missL, { autoAlpha: 0, x: -90 }, { autoAlpha: 1, x: 0 }, 0);
      if (missR) tl.fromTo(missR, { autoAlpha: 0, x: 90 }, { autoAlpha: 1, x: 0 }, 0);
      tl.scrollTrigger = ScrollTrigger.create({ trigger: SRP.Dom.$(".mission-split"), start: "top 80%", once: true });
      tl.pause();
      ScrollTrigger.create({
        trigger: SRP.Dom.$(".mission-split"), start: "top 80%", once: true,
        onEnter: function () { tl.play(); }
      });
    } else {
      if (missL) { missL.classList.add("reveal-l"); SRP.Observers.reveal(missL); }
      if (missR) { missR.classList.add("reveal-r"); SRP.Observers.reveal(missR); }
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.aboutPage = { init: init };
})();
