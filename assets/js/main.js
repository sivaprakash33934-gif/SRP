/* main.js — Bootstrapping only. No animation logic here. */
(function () {
  "use strict";

  function boot() {
    /* 1. Capability detection + CSS fallbacks */
    SRP.FeatureDetect.applyFallbacks();

    /* 2. Reduced motion: static premium layout, no motion */
    var reduced = SRP.Dom.prefersReducedMotion();
    if (reduced) {
      document.body.classList.add("reduced-motion", "tier-lite");
      document.body.classList.remove("tier-ultra", "tier-medium");
      if (SRP.Debug) SRP.Debug.log("Reduced motion detected — motion disabled");
    }

    /* 3. Ambient background layer (1 per page) */
    if (SRP.Config.ENABLE_AMBIENT && !reduced && SRP.Performance.effects().ambient) {
      var ambient = SRP.Dom.createEl("div", "ambient");
      ambient.setAttribute("aria-hidden", "true");
      document.body.insertBefore(ambient, document.body.firstChild);
    }

    /* 4. Performance monitor with tier switching */
    if (!reduced) {
      SRP.Performance.watch(1500);
    }

    /* 5. Components (global UI behaviors) */
    SRP.Components.Cursor.init();
    SRP.Components.ProgressBar.init();
    SRP.Components.PageTransition.init();
    SRP.Components.Magnetic.init();
    SRP.Components.Hover.init();

    /* 6. Lenis smooth scroll (progressive enhancement) */
    if (SRP.FeatureDetect.lenis() && !reduced) {
      var lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      window.__lenis = lenis;
      if (window.ScrollTrigger) {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(500, 33);
      } else {
        (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
      }
    }

    /* 7. Register + init page modules from routes */
    var page = SRP.Routes[SRP.CurrentPage] || SRP.Routes.home;
    SRP.Manager.register(page);
    SRP.Manager.init();

    /* 8. Sequence: after loader ends, signal the queue */
    setTimeout(function () { SRP.EventBus.emit("page:ready"); }, 0);

    if (SRP.Debug) {
      SRP.Debug.log("Boot complete. Page:", SRP.CurrentPage, "| Level:", SRP.FeatureDetect.animationLevel());
      SRP.Manager.debug();
    }
  }

  SRP.Dom.ready(boot);
})();
