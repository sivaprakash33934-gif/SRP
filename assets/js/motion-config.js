/* motion-config.js — Single source of truth for motion values */
(function () {
  "use strict";

  var MotionConfig = {
    duration: {
      fast: 0.7,
      medium: 1.0,
      slow: 1.6
    },

    easing: {
      entrance: "power4.out",
      scrub: "power2.out",
      spring: "elastic.out(1, 0.6)"
    },

    stagger: {
      grid: 0.08,
      wave: 0.06,
      list: 0.1
    },

    parallax: {
      hero: 0.2,
      ambient: 0.1,
      gallery: 0.18
    },

    glow: {
      strength: 0.25,
      hover: 0.45
    },

    pin: {
      enabled: true, /* single pinned section per site */
      totalPins: 1
    },

    budget: {
      maxConcurrentTriggers: 12,
      maxWillChange: 15
    }
  };

  window.SRP = window.SRP || {};
  SRP.MotionConfig = MotionConfig;
})();
