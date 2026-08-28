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
