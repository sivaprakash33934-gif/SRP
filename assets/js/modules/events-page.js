/* modules/eventsPage.js — SIGNATURE (Events): growing timeline, glowing dots, alternating cards */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var items = SRP.Dom.$$(".timeline-item");
    var fill = SRP.Dom.$(".timeline-line-fill");
    var upcoming = SRP.Dom.$(".coming-soon");
    if (!items.length) return;

    /* Upcoming: gentle float */
    if (upcoming && !SRP.Dom.prefersReducedMotion()) {
      upcoming.classList.add("float-anim");
    }

    if (!SRP.FeatureDetect.gsap()) {
      SRP.Observers.reveal(items, { stagger: 0.12 });
      return;
    }

    SRP.Manager.trackTrigger();

    /* Timeline line grows downward */
    if (fill) {
      gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: fill, start: "top 80%", end: "bottom 60%", scrub: 0.4 }
      });
    }

    /* Cards slide alternately; dots glow as reached */
    items.forEach(function (item, i) {
      var card = SRP.Dom.$(".timeline-card", item);
      if (!card) return;
      var dir = i % 2 === 0 ? -70 : 70;

      SRP.Manager.trackTrigger();
      gsap.fromTo(card, { autoAlpha: 0, x: dir }, {
        autoAlpha: 1, x: 0, duration: M().duration.medium, ease: M().easing.entrance,
        scrollTrigger: { trigger: item, start: "top 85%", once: true, onEnter: function () { item.classList.add("is-reached"); } }
      });
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.eventsPage = { init: init };
})();
