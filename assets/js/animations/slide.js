/* animations/slide.js — directional slide presets */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var Slide = {
    /* Generic directional slide: dir in (left|right|up|down|tl|tr|bl|br) */
    slideIn: function (targets, opts) {
      var cfg = Object.assign({
        dir: "up", dist: 70, duration: M().duration.medium, ease: M().easing.entrance,
        stagger: 0, immediate: false
      }, opts || {});

      var from = { autoAlpha: 0 };
      switch (cfg.dir) {
        case "left": from.x = -cfg.dist; break;
        case "right": from.x = cfg.dist; break;
        case "up": from.y = cfg.dist; break;
        case "down": from.y = -cfg.dist; break;
        case "tl": from.x = -cfg.dist; from.y = -cfg.dist; break;
        case "tr": from.x = cfg.dist; from.y = -cfg.dist; break;
        case "bl": from.x = -cfg.dist; from.y = cfg.dist; break;
        case "br": from.x = cfg.dist; from.y = cfg.dist; break;
      }

      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;

      if (!SRP.FeatureDetect.gsap()) {
        var klass = cfg.dir === "left" ? "reveal-l" : (cfg.dir === "right" ? "reveal-r" : "reveal");
        els.forEach(function (el) {
          if (el.classList) el.classList.add(klass);
        });
        return SRP.Observers.reveal(els, { stagger: cfg.stagger });
      }

      var tween = gsap.fromTo(els, from, {
        autoAlpha: 1, x: 0, y: 0, duration: cfg.duration, ease: cfg.ease,
        stagger: cfg.stagger, force3D: true
      });
      if (!cfg.immediate) {
        tween.scrollTrigger = ScrollTrigger.create({
          trigger: els[0] || els, start: "top 85%", once: true,
          onEnter: function () { tween.play(); }
        });
        tween.pause();
      }
      return tween;
    }
  };

  window.SRP = window.SRP || {};
  SRP.Motion = SRP.Motion || {};
  SRP.Motion.slide = Slide;
})();
