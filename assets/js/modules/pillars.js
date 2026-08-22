/* modules/pillars.js — SIGNATURE (Incubation): five cards, five distinct entrances */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var entrances = [
    { y: 90 },                       /* 1. rises */
    { rotation: 3 },                 /* 2. rotates slightly */
    { x: -90, y: 60 },               /* 3. slides diagonally */
    { scale: 0.82 },                 /* 4. scales up */
    { y: 46, autoAlpha: 0.001 }      /* 5. fades upward */
  ];

  function init() {
    var cards = SRP.Dom.$$(".pillar-card");
    if (!cards.length) return;

    if (!SRP.FeatureDetect.gsap()) {
      SRP.Observers.reveal(cards, { stagger: 0.12 });
      return;
    }

    SRP.Manager.trackTrigger();
    var tl = gsap.timeline({
      defaults: { duration: M().duration.medium, ease: M().easing.entrance },
      scrollTrigger: { trigger: cards[0].parentElement, start: "top 80%", once: true }
    });

    cards.forEach(function (card, i) {
      var e = entrances[i % entrances.length];
      var from = { autoAlpha: 0 };
      Object.keys(e).forEach(function (k) { from[k] = e[k]; });
      tl.fromTo(card, from, { autoAlpha: 1, y: 0, x: 0, rotation: 0, scale: 1 }, "+=0.06");
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.pillars = { init: init };
})();
