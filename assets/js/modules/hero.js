/* modules/hero.js — cinematic reveal: word mask, CTA stagger, parallax bg */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };
  var activeTweens = [];
  var eventUnsub = null;

  function init() {
    var hero = window.SRP.Dom.$(".hero");
    if (!hero) return;

    var reduced = window.SRP.Dom.prefersReducedMotion() || document.body.classList.contains("reduced-motion");

    var pattern = window.SRP.Dom.$(".hero-pattern", hero);
    var orbital = window.SRP.Dom.$(".hero-orbital", hero);
    var logo = window.SRP.Dom.$(".hero-logo", hero);
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
      if (!window.SRP.FeatureDetect.gsap() || !(window.CONFIG && window.CONFIG.ENABLE_PARALLAX)) return;
      if (!window.SRP.Performance.check('parallax')) return;
      
      var scr = (M() && M().parallax) ? M().parallax.hero : true;
      
      if (pattern) {
        parallaxTweens.push(gsap.to(pattern, {
          yPercent: 18,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: scr }
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
    if (window.SRP.EventBus) {
      eventUnsub = window.SRP.EventBus.on("tier:change", function (tierName) {
        if (window.SRP.Performance.check('parallax')) startParallax();
        else stopParallax();
      });
    }

    /* Cinematic entrance after loader */
    function reveal() {
      if (reduced) {
        // Reduced motion: instant visibility
        var inners = document.querySelectorAll('.hero .mask-inner');
        for (var i = 0; i < inners.length; i++) {
          inners[i].style.transform = 'translateY(0)';
          inners[i].style.opacity = '1';
        }
        var subline = document.querySelector('.hero .subline');
        if (subline) { subline.style.opacity = '1'; subline.style.transform = 'translateY(0)'; }
        
        var ctas = document.querySelectorAll('.hero .hero-ctas .btn');
        for (var j = 0; j < ctas.length; j++) {
          ctas[j].style.opacity = '1'; ctas[j].style.transform = 'translateY(0)';
        }
        if (logo) { logo.style.opacity = '1'; logo.style.transform = 'scale(1)'; }
        hero.classList.add("is-animated");
        return;
      }

      if (window.SRP.FeatureDetect.gsap()) {
        hero.classList.add("is-animated");
        var tl = gsap.timeline({ defaults: { ease: (M() ? M().easing.entrance : "power3.out") } });
        
        // HOTFIX: reveal new markup
        tl.to('.hero .mask-inner', { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', stagger: 0.15 }, 0.05)
          .fromTo(".hero .subline", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0 }, 0.7)
          .fromTo(".hero .hero-ctas .btn", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0, stagger: 0.12 }, 0.9)
          .fromTo(".hero .hero-logo", { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: "power4.out" }, 0.8)
          .fromTo(".hero .hero-scroll", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7 }, 1.5);
          
        activeTweens.push(tl);
      } else {
        hero.classList.add("reveal", "is-animated");
        window.SRP.Observers.reveal(hero);
      }
    }

    if (reduced) {
      reveal();
      return;
    }

    if (logo && window.SRP.Dom.isDesktop() && window.SRP.Performance.check('parallax')) {
      activeTweens.push(gsap.to(logo, {
        y: 10, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1
      }));
    }

    if (logo && window.SRP.Dom.isDesktop()) {
      var shineEnd = function () { logo.classList.remove("shine-trigger"); };
      var shineStart = function () {
        logo.classList.remove("shine-trigger");
        void logo.offsetWidth;
        logo.classList.add("shine-trigger");
      };
      logo.addEventListener("mouseenter", shineStart);
      logo.addEventListener("animationend", shineEnd, true);
      // store for cleanup if we want, but sticking to quick fixes
    }

    if (logo && window.SRP.Dom.isDesktop() && window.CONFIG && window.CONFIG.ENABLE_TILT && window.SRP.Performance.check('tilt')) {
      if (window.SRP.Motion && window.SRP.Motion.depth) {
        window.SRP.Motion.depth.tilt([logo], { max: 6, scale: 1.02 });
      }
    }

    if (window.SRP.EventBus) {
      var started = false;
      window.SRP.EventBus.on("loader:end", function () {
        if (started) return;
        started = true;
        reveal();
      });
      setTimeout(function () {
        if (!started) reveal();
      }, 900);
    } else {
      reveal();
    }
  }

  function destroy() {
    activeTweens.forEach(function(t) { t.kill(); });
    activeTweens = [];
    if (eventUnsub) { eventUnsub(); eventUnsub = null; }
  }

  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.hero = { init: init, destroy: destroy };
})();
