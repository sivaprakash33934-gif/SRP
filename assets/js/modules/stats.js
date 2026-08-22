/* modules/stats.js — blue stat cards: staggered slide + count-up + burst */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var section = SRP.Dom.$(".stats-bar");
    var cards = SRP.Dom.$$(".stats-bar .stat-card");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(cards, { autoAlpha: 0, x: 80 }, {
        autoAlpha: 1, x: 0, duration: M().duration.medium, ease: M().easing.entrance,
        stagger: 0.12, force3D: true,
        scrollTrigger: { trigger: section, start: "top 82%", once: true }
      });
    } else {
      cards.forEach(function (c) { c.classList.add("reveal-r"); });
      SRP.Observers.reveal(cards, { stagger: 0.12 });
    }

    /* Count-up (works at all animation levels) */
    SRP.Components.Counters.init(cards.map(function (c) { return c.querySelector(".stat-num"); }).filter(Boolean));
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.stats = { init: init };
})();
