/* modules/testimonials.js — testimonials: staggered reveal on scroll */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var cards = SRP.Dom.$$(".testi-card");
    var stack = SRP.Dom.$(".testi-stack");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();

      /* Set initial state */
      gsap.set(cards, { autoAlpha: 0, y: 40 });

      /* Staggered reveal on scroll */
      gsap.to(cards, {
        autoAlpha: 1, y: 0,
        duration: 0.8, ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: stack,
          start: "top 75%",
          once: true
        }
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.2 });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.testimonials = { init: init };
})();
