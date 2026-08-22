/* animations/mask.js — clip-path / gradient mask reveals */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var Mask = {
    /* Section content revealed through a rising clip-path window */
    maskReveal: function (targets, opts) {
      var cfg = Object.assign({
        from: "inset(0% 0% 100% 0%)",
        to: "inset(0% 0% 0% 0%)",
        duration: M().duration.slow,
        ease: M().easing.entrance,
        stagger: 0
      }, opts || {});

      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;

      if (!SRP.FeatureDetect.gsap() || !SRP.FeatureDetect.clipPath()) {
        return SRP.Observers.reveal(els, { stagger: cfg.stagger });
      }

      gsap.fromTo(els, { clipPath: cfg.from, autoAlpha: 0 }, {
        clipPath: cfg.to, autoAlpha: 1, duration: cfg.duration, ease: cfg.ease,
        stagger: cfg.stagger,
        scrollTrigger: { trigger: els[0] || els, start: "top 82%", once: true }
      });
    },

    /* Word-by-word masked rise for headline text (.mask-line > .mask-inner) */
    textReveal: function (targets, opts) {
      var cfg = Object.assign({ duration: M().duration.slow, ease: M().easing.entrance, stagger: 0.08 }, opts || {});
      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;

      if (!SRP.FeatureDetect.gsap()) {
        els.forEach(function (el) { el.classList.add("is-animated"); });
        return;
      }

      var inners = [];
      els.forEach(function (el) {
        SRP.Dom.$$(".mask-inner", el).forEach(function (inner) {
          inner.style.transform = "translateY(110%)";
          inner.style.opacity = "0";
          inners.push(inner);
        });
      });

      if (!inners.length) return;
      gsap.to(inners, {
        y: 0, autoAlpha: 1, duration: cfg.duration, ease: cfg.ease, stagger: cfg.stagger,
        force3D: true,
        scrollTrigger: { trigger: els[0] || els, start: "top 80%", once: true }
      });
    }
  };

  window.SRP = window.SRP || {};
  SRP.Motion = SRP.Motion || {};
  SRP.Motion.mask = Mask;
})();
