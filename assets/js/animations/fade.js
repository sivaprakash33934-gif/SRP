/* animations/fade.js — fadeUp / fadeIn presets */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var Fade = {
    /* Fade + rise. Falls back to CSS reveal classes. */
    fadeUp: function (targets, opts) {
      var cfg = Object.assign({ y: 36, duration: M().duration.medium, ease: M().easing.entrance, stagger: 0, immediate: false }, opts || {});
      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;

      if (!SRP.FeatureDetect.gsap()) {
        return SRP.Observers.reveal(els, { stagger: cfg.stagger });
      }

      if (cfg.immediate) {
        gsap.fromTo(els, { autoAlpha: 0, y: cfg.y }, { autoAlpha: 1, y: 0, duration: cfg.duration, ease: cfg.ease, stagger: cfg.stagger, force3D: true });
      } else {
        gsap.fromTo(els, { autoAlpha: 0, y: cfg.y }, {
          autoAlpha: 1, y: 0, duration: cfg.duration, ease: cfg.ease, stagger: cfg.stagger, force3D: true,
          scrollTrigger: { trigger: els[0] || els, start: "top 85%", once: true }
        });
      }
    },

    /* Pure opacity fade */
    fadeIn: function (targets, opts) {
      var cfg = Object.assign({ duration: M().duration.medium, ease: "power2.out", stagger: 0 }, opts || {});
      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;

      if (!SRP.FeatureDetect.gsap()) return SRP.Observers.reveal(els, { stagger: cfg.stagger });

      gsap.fromTo(els, { autoAlpha: 0 }, {
        autoAlpha: 1, duration: cfg.duration, ease: cfg.ease, stagger: cfg.stagger,
        scrollTrigger: { trigger: els[0] || els, start: "top 85%", once: true }
      });
    }
  };

  window.SRP = window.SRP || {};
  SRP.Motion = SRP.Motion || {};
  SRP.Motion.fade = Fade;
})();
