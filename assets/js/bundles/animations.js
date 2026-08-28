
/* --- assets/js/animations/fade.js --- */
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


/* --- assets/js/animations/slide.js --- */
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


/* --- assets/js/animations/depth.js --- */
/* ================================================================
 * FILE: assets/js/animations/depth.js
 * SRP 3D Depth Reveal & Tilt Presets
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  'use strict';

  var activeTweens = [];
  var activeTriggers = [];
  var tiltListeners = [];

  var M = function () { 
    return window.SRP && window.SRP.MotionConfig ? window.SRP.MotionConfig : { 
      duration: { slow: 1.2 }, 
      easing: { entrance: "power3.out" }, 
      stagger: { grid: 0.1 } 
    }; 
  };

  var Depth = {
    depthReveal: function (targets, opts) {
      if (!targets) return;
      var cfg = Object.assign({
        z: -60, rotateX: 8, duration: M().duration.slow, ease: M().easing.entrance,
        stagger: M().stagger.grid, perspective: 1200
      }, opts || {});

      var els = typeof targets === "string" ? window.SRP.Dom.$$(targets) : targets;
      if (!els || els.length === 0) return;
      
      els = Array.prototype.slice.call(els).filter(function(el) {
        var rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
      });
      if (els.length === 0) return;

      var tier = window.SRP.Performance ? window.SRP.Performance.getTier() : 'ultra';
      var parallaxEnabled = window.CONFIG ? window.CONFIG.ENABLE_PARALLAX : true;
      
      if (!window.SRP.FeatureDetect || !window.SRP.FeatureDetect.gsap()) {
        if (window.SRP.Observers && window.SRP.Observers.reveal) {
          window.SRP.Observers.reveal(els, { stagger: cfg.stagger });
        }
        return;
      }

      if (tier === 'lite' || !parallaxEnabled) {
         var tween = gsap.fromTo(els, { autoAlpha: 0 }, {
            autoAlpha: 1, duration: cfg.duration, ease: cfg.ease, stagger: cfg.stagger,
            immediateRender: false, overwrite: "auto",
            scrollTrigger: { trigger: els[0], start: "top 85%", once: true }
         });
         activeTweens.push(tween);
         if (tween.scrollTrigger) activeTriggers.push(tween.scrollTrigger);
         return;
      }

      gsap.set(els, { transformPerspective: cfg.perspective, transformOrigin: "50% 50%" });
      var depthTween = gsap.fromTo(els, { autoAlpha: 0, z: cfg.z, rotateX: cfg.rotateX }, {
        autoAlpha: 1, z: 0, rotateX: 0, duration: cfg.duration, ease: cfg.ease,
        stagger: cfg.stagger, force3D: true, immediateRender: false, overwrite: "auto",
        scrollTrigger: { trigger: els[0], start: "top 85%", once: true }
      });
      activeTweens.push(depthTween);
      if (depthTween.scrollTrigger) activeTriggers.push(depthTween.scrollTrigger);
    },

    tilt: function (els, opts) {
      if (!els) return;
      var cfg = Object.assign({ max: 6 }, opts || {});
      
      if (!window.SRP.FeatureDetect || !window.SRP.FeatureDetect.gsap() || 
          !(window.CONFIG ? window.CONFIG.ENABLE_TILT : true) || 
          (window.SRP.Dom && !window.SRP.Dom.isDesktop())) return;
          
      var tier = window.SRP.Performance ? window.SRP.Performance.getTier() : 'ultra';
      if (tier === 'lite') return;

      var elementArray = Array.prototype.slice.call(els).filter(function(el) {
        var rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
      });

      elementArray.forEach(function (el) {
        el.classList.add("card-tilt");
        var enabled = true;
        
        var qry = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power2.out", overwrite: "auto" });
        var qrx = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power2.out", overwrite: "auto" });
        
        var handleMouseMove = function (e) {
          if (!enabled) return;
          var r = el.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          qrx(px * cfg.max * 2);
          qry(-py * cfg.max * 2);
        };
        
        var handleMouseLeave = function () {
          qrx(0); qry(0);
        };
        
        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);
        
        var unsub = null;
        if (window.SRP.EventBus && window.SRP.EventBus.on) {
          unsub = window.SRP.EventBus.on("tier:change", function (newTier) {
            var on = (newTier !== 'lite');
            if (on && !enabled) {
              enabled = true;
            } else if (!on && enabled) {
              enabled = false;
              handleMouseLeave();
            }
          });
        }
        
        tiltListeners.push({
          el: el, move: handleMouseMove, leave: handleMouseLeave, unsub: unsub,
          qrx: qrx, qry: qry
        });
      });
    },
    
    destroy: function() {
      activeTweens.forEach(function(t) { t.kill(); });
      activeTweens = [];
      
      activeTriggers.forEach(function(st) { st.kill(); });
      activeTriggers = [];
      
      tiltListeners.forEach(function(listener) {
        listener.el.removeEventListener("mousemove", listener.move);
        listener.el.removeEventListener("mouseleave", listener.leave);
        if (listener.unsub) listener.unsub();
        
        if (listener.qrx && listener.qrx.tween) listener.qrx.tween.kill();
        if (listener.qry && listener.qry.tween) listener.qry.tween.kill();
        
        // Remove scale from set completely
        gsap.set(listener.el, { rotationX: 0, rotationY: 0, x: 0, y: 0 }); 
      });
      tiltListeners = [];
    }
  };

  window.SRP = window.SRP || {};
  window.SRP.Motion = window.SRP.Motion || {};
  window.SRP.Motion.depth = Depth;
})();


/* --- assets/js/animations/mask.js --- */
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


/* --- assets/js/animations/wave.js --- */
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

