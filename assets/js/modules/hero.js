/* modules/hero.js — cinematic reveal: word mask, CTA stagger, parallax bg */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var hero = SRP.Dom.$(".hero");
    if (!hero) return;

    var reduced = SRP.Dom.prefersReducedMotion() || document.body.classList.contains("reduced-motion");

    /* Parallax background layers (background only, never content).
       Killed on tier downgrade so scrub layers never hog the GPU. */
    var pattern = SRP.Dom.$(".hero-pattern", hero);
    var orbital = SRP.Dom.$(".hero-orbital", hero);
    var logo = SRP.Dom.$(".hero-logo", hero);
    var parallaxTweens = [];

    function stopParallax() {
      if (!window.gsap) return;
      parallaxTweens.forEach(function (t) {
        if (t && t.scrollTrigger) t.scrollTrigger.kill();
        t && t.kill();
      });
      parallaxTweens = [];
      if (pattern) gsap.set(pattern, { yPercent: 0 });
      if (orbital) gsap.set(orbital, { yPercent: 0 });
      if (logo) gsap.set(logo, { yPercent: 0 });
    }

    function startParallax() {
      if (reduced) return;
      if (parallaxTweens.length) return;
      if (!SRP.FeatureDetect.gsap() || !SRP.Config.ENABLE_PARALLAX) return;
      if (!SRP.Performance.effects().parallax) return;
      if (pattern) {
        parallaxTweens.push(gsap.to(pattern, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: M().parallax.hero }
        }));
      }
      if (orbital) {
        parallaxTweens.push(gsap.to(orbital, {
          yPercent: -22,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
        }));
      }
      if (logo) {
        parallaxTweens.push(gsap.to(logo, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
        }));
      }
    }

    startParallax();
    SRP.EventBus.on("tier:change", function (tierName) {
      if (SRP.Performance.effects().parallax) startParallax();
      else stopParallax();
    });

    /* Cinematic entrance after loader */
    function reveal() {
      if (SRP.FeatureDetect.gsap()) {
        var tl = gsap.timeline({ defaults: { ease: M().easing.entrance } });
        tl.to(hero, { autoAlpha: 1, duration: 0.1 }, 0)
          .fromTo(".hero .mask-inner", { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: M().duration.slow, stagger: 0.12 }, 0.05)
          .fromTo(".hero .subline", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: M().duration.medium }, 0.7)
          .fromTo(".hero .hero-ctas .btn", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: M().duration.medium, stagger: 0.12 }, 0.9)
          .fromTo(".hero .hero-logo", { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "power4.out" }, 0.8)
          .fromTo(".hero .hero-scroll", { autoAlpha: 0 }, { autoAlpha: 1, duration: M().duration.fast }, 1.5);
      } else {
        hero.classList.add("reveal", "is-animated");
        SRP.Observers.reveal(hero);
      }
    }

    if (reduced) return;

    /* Logo idle float (desktop only, respects tier) */
    if (logo && SRP.Dom.isDesktop() && SRP.Performance.effects().parallax) {
      gsap.to(logo, {
        y: 10, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1
      });
    }

    /* Logo hover: one-shot shine pass, then resume infinite loop */
    if (logo && SRP.Dom.isDesktop()) {
      logo.addEventListener("mouseenter", function () {
        logo.classList.remove("shine-trigger");
        void logo.offsetWidth;
        logo.classList.add("shine-trigger");
      });
      logo.addEventListener("animationend", function () {
        logo.classList.remove("shine-trigger");
      }, true);
    }

    /* Logo 3D tilt on hover */
    if (logo && SRP.Dom.isDesktop() && SRP.Config.ENABLE_TILT && SRP.Performance.effects().tilt) {
      SRP.Motion.depth.tilt([logo], { max: 6, scale: 1.02 });
    }

    if (SRP.EventBus) {
      var started = false;
      SRP.EventBus.on("loader:end", function () {
        if (started) return;
        started = true;
        reveal();
      });
      /* Fallback: if loader never ran, reveal immediately */
      setTimeout(function () {
        if (!started) reveal();
      }, 900);
    } else {
      reveal();
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.hero = { init: init };
})();
