/* modules/offerings.js — quiet staggered fade (breathing room after the pin) */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var cards = SRP.Dom.$$(".offer-card");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      gsap.fromTo(cards, { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        stagger: 0.09,
        scrollTrigger: { trigger: cards[0].parentElement, start: "top 85%", once: true }
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.09 });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.offerings = { init: init };
})();
