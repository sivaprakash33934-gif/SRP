/* animations/wave.js — wave cascade & staggered grid presets */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var Wave = {
    /* Left-to-right wave cascade (e.g. directors grid) */
    waveReveal: function (targets, opts) {
      var cfg = Object.assign({
        dist: 60, duration: M().duration.medium, ease: M().easing.entrance,
        stagger: M().stagger.wave
      }, opts || {});

      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;
      if (!SRP.FeatureDetect.gsap()) return SRP.Observers.reveal(els, { stagger: 0.05 });

      gsap.fromTo(els, { autoAlpha: 0, y: cfg.dist, x: -cfg.dist }, {
        autoAlpha: 1, y: 0, x: 0, duration: cfg.duration, ease: cfg.ease,
        stagger: cfg.stagger, force3D: true,
        scrollTrigger: { trigger: els[0] || els, start: "top 82%", once: true }
      });
    },

    /* Staggered grid with alternating row offsets */
    staggerGrid: function (targets, opts) {
      var cfg = Object.assign({
        rows: 1, dist: 40, duration: M().duration.medium, ease: M().easing.entrance,
        stagger: M().stagger.grid, alt: true
      }, opts || {});

      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;
      if (!SRP.FeatureDetect.gsap()) return SRP.Observers.reveal(els, { stagger: cfg.stagger });

      var perRow = Math.ceil(els.length / cfg.rows);
      var fromArr = [];
      els.forEach(function (el, i) {
        var row = Math.floor(i / perRow);
        var offset = cfg.alt && row % 2 === 1 ? -cfg.dist : cfg.dist;
        fromArr.push({ autoAlpha: 0, x: offset, y: cfg.dist * 0.4 });
      });
      gsap.fromTo(els, fromArr, {
        autoAlpha: 1, x: 0, y: 0, duration: cfg.duration, ease: cfg.ease,
        stagger: cfg.stagger, force3D: true,
        scrollTrigger: { trigger: els[0] || els, start: "top 82%", once: true }
      });
    }
  };

  window.SRP = window.SRP || {};
  SRP.Motion = SRP.Motion || {};
  SRP.Motion.wave = Wave;
})();
