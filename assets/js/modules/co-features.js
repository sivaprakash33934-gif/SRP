/* modules/coFeatures.js — 5 feature cards: quiet stagger */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var cards = SRP.Dom.$$(".co-feature-card");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(cards, { autoAlpha: 0, y: 44 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: cards[0].parentElement, start: "top 84%", once: true }
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.1 });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.coFeatures = { init: init };
})();
