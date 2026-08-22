/* modules/incPartners.js — 4 partner categories: hover-only, quiet fade */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var cards = SRP.Dom.$$(".inc-partner-card");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(cards, { autoAlpha: 0, y: 36 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: cards[0].parentElement, start: "top 85%", once: true }
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.08 });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.incPartners = { init: init };
})();
