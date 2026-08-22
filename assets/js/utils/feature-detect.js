/* utils/feature-detect.js — capability detection & 3-level fallback tiers */
(function () {
  "use strict";

  var css = function (prop, value) {
    var el = document.createElement("div");
    el.style[prop] = value;
    return el.style[prop] !== "";
  };

  var FeatureDetect = {
    gsap: function () { return !!(window.gsap && window.ScrollTrigger); },
    lenis: function () { return !!window.Lenis; },

    backdropFilter: function () {
      return css("backdropFilter", "blur(2px)") || css("webkitBackdropFilter", "blur(2px)");
    },

    maskImage: function () {
      return css("maskImage", "linear-gradient(#fff, #fff)") || css("webkitMaskImage", "linear-gradient(#fff, #fff)");
    },

    clipPath: function () {
      return css("clipPath", "inset(0 0 0 0)");
    },

    intersectionObserver: function () { return "IntersectionObserver" in window; },

    /* Animation level: gsap > io+css > static */
    animationLevel: function () {
      if (this.gsap()) return 2;         /* GSAP + ScrollTrigger */
      if (this.intersectionObserver()) return 1; /* IO + CSS transitions */
      return 0;                          /* fully static */
    },

    /* Applies CSS fallbacks for unsupported props */
    applyFallbacks: function () {
      if (!this.backdropFilter()) {
        document.documentElement.classList.add("no-backdrop");
      }
      if (!this.maskImage()) {
        document.documentElement.classList.add("no-mask");
      }
      if (!this.clipPath()) {
        document.documentElement.classList.add("no-clip");
      }
    }
  };

  window.SRP = window.SRP || {};
  SRP.FeatureDetect = FeatureDetect;
})();
