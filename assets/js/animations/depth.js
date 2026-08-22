/* animations/depth.js — 3D depth reveal & tilt presets */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var Depth = {
    /* Cards emerge from background with perspective + slight z-rotation */
    depthReveal: function (targets, opts) {
      var cfg = Object.assign({
        z: -60, rotateX: 8, duration: M().duration.slow, ease: M().easing.entrance,
        stagger: M().stagger.grid, perspective: 1200
      }, opts || {});

      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;
      if (!SRP.FeatureDetect.gsap()) return SRP.Observers.reveal(els, { stagger: cfg.stagger });

      gsap.set(els, { transformPerspective: cfg.perspective, transformOrigin: "50% 50%" });
      gsap.fromTo(els, { autoAlpha: 0, z: cfg.z, rotateX: cfg.rotateX }, {
        autoAlpha: 1, z: 0, rotateX: 0, duration: cfg.duration, ease: cfg.ease,
        stagger: cfg.stagger, force3D: true,
        scrollTrigger: { trigger: els[0] || els, start: "top 85%", once: true }
      });
    },

    /* Magnetic hover tilt (desktop only, respects tier/flag) */
    tilt: function (els, opts) {
      var cfg = Object.assign({ max: 6, scale: 1.02 }, opts || {});
      if (!SRP.FeatureDetect.gsap() || !window.SRP.Config.ENABLE_TILT || !SRP.Dom.isDesktop()) return;
      if (!SRP.Performance.effects().tilt) return;

      els.forEach(function (el) {
        el.classList.add("card-tilt");
        var enabled = true;
        var qrx = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2.out", force3D: true });
        var qry = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2.out", force3D: true });
        var qsc = gsap.quickTo(el, "scale", { duration: 0.4, ease: "power2.out", force3D: true });
        el.addEventListener("mousemove", function (e) {
          if (!enabled) return;
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          qrx(px * cfg.max * 2);
          qry(-py * cfg.max * 2);
          qsc(cfg.scale);
        });
        el.addEventListener("mouseleave", function () {
          qrx(0); qry(0); qsc(1);
        });
        SRP.EventBus.on("tier:change", function () {
          var on = SRP.Performance.effects().tilt;
          if (on && !enabled) {
            enabled = true;
          } else if (!on && enabled) {
            enabled = false;
            qrx(0); qry(0); qsc(1);
          }
        });
      });
    }
  };

  window.SRP = window.SRP || {};
  SRP.Motion = SRP.Motion || {};
  SRP.Motion.depth = Depth;
})();
