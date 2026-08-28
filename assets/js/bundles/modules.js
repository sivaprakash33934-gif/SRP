
/* --- assets/js/modules/loader.js --- */
/* ================================================================
 * FILE: assets/js/modules/loader.js
 * SRP Loader Component
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  "use strict";

  var loaderEl = null;
  var isDone = false;
  var loaderTimeout = null;
  var failsafeTimeout = null;
  var unsubs = [];

  function finish() {
    if (isDone) return;
    isDone = true;
    
    if (loaderEl) {
      loaderEl.classList.add("is-done");
    }
    document.body.classList.remove("no-scroll");
    
    if (window.SRP && window.SRP.EventBus && typeof window.SRP.EventBus.emit === "function") {
      window.SRP.EventBus.emit("loader:end");
    }
    
    // Remove element after fade out transition (typically ~600ms)
    setTimeout(function () {
      if (loaderEl && loaderEl.parentNode) {
        loaderEl.parentNode.removeChild(loaderEl);
      }
    }, 600);
    
    clearTimeouts();
  }

  function clearTimeouts() {
    if (loaderTimeout) {
      clearTimeout(loaderTimeout);
      loaderTimeout = null;
    }
    if (failsafeTimeout) {
      clearTimeout(failsafeTimeout);
      failsafeTimeout = null;
    }
  }

  function skip() {
    if (loaderEl) {
      loaderEl.style.display = "none";
    }
    finish();
  }

  function tryLoadLogo() {
    var logoContainer = loaderEl ? loaderEl.querySelector(".loader-logo") : null;
    if (!logoContainer) return;
    
    var img = new Image();
    img.onload = function() {
      // Only swap if loader isn't already done
      if (!isDone) {
        logoContainer.innerHTML = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        logoContainer.appendChild(img);
      }
    };
    // If error, do nothing, keep existing inline SVG
    img.src = "assets/svg/logos/srp-logo.svg";
  }

  function init() {
    loaderEl = window.SRP.Dom && window.SRP.Dom.$ ? window.SRP.Dom.$(".loader") : document.querySelector(".loader");
    if (!loaderEl) return;
    
    var cfg = window.CONFIG || (window.SRP && window.SRP.Config) || {};
    var duration = typeof cfg.LOADER_DURATION === 'number' ? cfg.LOADER_DURATION : 2200;
    
    if (cfg.ENABLE_LOADER === false) {
      skip();
      return;
    }
    
    var reduced = false;
    if (window.matchMedia) {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    if (document.body.classList.contains("reduced-motion")) {
      reduced = true;
    }
    
    if (reduced) {
      skip();
      return;
    }

    document.body.classList.add("no-scroll");
    
    if (window.SRP && window.SRP.EventBus) {
      if (typeof window.SRP.EventBus.emit === "function") {
        window.SRP.EventBus.emit("loader:start");
      }
      
      var unsubArrived = window.SRP.EventBus.on("transition:arrived", skip);
      if (unsubArrived) unsubs.push(unsubArrived);
      
      var unsubDone = window.SRP.EventBus.on("loader:done", finish);
      if (unsubDone) unsubs.push(unsubDone);
    }
    
    tryLoadLogo();

    loaderTimeout = setTimeout(finish, duration);
    failsafeTimeout = setTimeout(finish, 4000); // Failsafe absolute max
  }

  function destroy() {
    clearTimeouts();
    for (var i = 0; i < unsubs.length; i++) {
      if (typeof unsubs[i] === "function") unsubs[i]();
    }
    unsubs = [];
    isDone = false;
    loaderEl = null;
  }

  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.loader = { init: init, destroy: destroy };
})();


/* --- assets/js/modules/navbar.js --- */
/* ================================================================
 * FILE: assets/js/modules/navbar.js
 * SRP Navbar Component (Glass nav, active indicator, mobile drawer)
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  "use strict";

  var nav = null;
  var toggle = null;
  var links = null;
  var scrollListener = null;
  var toggleClickListener = null;
  var linksClickListener = null;
  var smoothScrollListener = null;
  var resizeListener = null;
  var keyListener = null;

  function init() {
    nav = window.SRP.Dom.$(".site-nav");
    toggle = window.SRP.Dom.$(".nav-toggle");
    links = window.SRP.Dom.$(".nav-links");
    if (!nav) return;

    /* Active Indicator logic */
    if (links) {
      var currentPage = window.SRP.CurrentPage || 'home';
      var updatedLinks = links.querySelectorAll('.nav-link');
      for (var k = 0; k < updatedLinks.length; k++) {
        var linkHref = updatedLinks[k].getAttribute('href') || '';
        updatedLinks[k].classList.remove('is-active');
        if (linkHref.indexOf(currentPage) > -1 || (currentPage === 'home' && linkHref === 'index.html')) {
          updatedLinks[k].classList.add('is-active');
          updatedLinks[k].setAttribute('aria-current', 'page');
        } else {
          updatedLinks[k].removeAttribute('aria-current');
        }
      }
    }

    /* Glass on scroll */
    var ticking = false;
    function onScroll() {
      ticking = false;
      if (nav) {
        nav.classList.toggle("is-scrolled", window.scrollY > 24);
      }
    }
    scrollListener = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    };
    window.addEventListener("scroll", scrollListener, { passive: true });
    onScroll();

    /* Mobile drawer */
    if (toggle && links) {
      toggleClickListener = function () {
        var open = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      };
      toggle.addEventListener("click", toggleClickListener);
      
      linksClickListener = function (e) {
        if (e.target.closest("a")) {
          links.classList.remove("is-open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      };
      links.addEventListener("click", linksClickListener);
    }
    
    /* Close on resize > 768px */
    resizeListener = function() {
      if (window.innerWidth > 768 && links && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    };
    window.addEventListener("resize", resizeListener);
    
    /* Close on Esc */
    keyListener = function(e) {
      if (e.key === "Escape" && links && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    };
    document.addEventListener("keydown", keyListener);

    /* Smooth anchor scrolling */
    smoothScrollListener = function (e) {
      if (!e.target.closest) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id === '#') return;
      var target = window.SRP.Dom.$(id);
      if (!target) return;
      e.preventDefault();
      
      var reduced = window.SRP.Dom.prefersReducedMotion() || document.body.classList.contains("reduced-motion");
      
      if (window.__lenis && !reduced) {
        window.__lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
    };
    document.addEventListener("click", smoothScrollListener);
  }
  
  function destroy() {
    if (scrollListener) {
      window.removeEventListener("scroll", scrollListener);
      scrollListener = null;
    }
    if (toggle && toggleClickListener) {
      toggle.removeEventListener("click", toggleClickListener);
      toggleClickListener = null;
    }
    if (links && linksClickListener) {
      links.removeEventListener("click", linksClickListener);
      linksClickListener = null;
    }
    if (resizeListener) {
      window.removeEventListener("resize", resizeListener);
      resizeListener = null;
    }
    if (keyListener) {
      document.removeEventListener("keydown", keyListener);
      keyListener = null;
    }
    if (smoothScrollListener) {
      document.removeEventListener("click", smoothScrollListener);
      smoothScrollListener = null;
    }
    nav = null;
    toggle = null;
    links = null;
  }

  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.navbar = { init: init, destroy: destroy };
})();


/* --- assets/js/modules/page-hero.js --- */
/* modules/page-hero.js — shared masked header reveal for all interior pages */
(function () {
  "use strict";

  function init() {
    var hero = SRP.Dom.$(".page-hero");
    if (!hero) return;
    SRP.Motion.mask.textReveal([hero]);
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.pageHero = { init: init };
})();


/* --- assets/js/modules/footer.js --- */
/* ================================================================
 * FILE: assets/js/modules/footer.js
 * SRP Footer Component
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  "use strict";

  var footerEl = null;
  var activeTweens = [];
  var clickListener = null;

  var M = function () { 
    return window.SRP && window.SRP.MotionConfig ? window.SRP.MotionConfig : { 
      duration: { medium: 0.8 }, 
      easing: { entrance: "power3.out" } 
    }; 
  };

  function init() {
    footerEl = window.SRP.Dom && window.SRP.Dom.$ ? window.SRP.Dom.$(".site-footer") : document.querySelector(".site-footer");
    if (!footerEl) return;

    // 1. Dynamic Year
    var yearEls = footerEl.querySelectorAll("[data-year]");
    var currentYear = new Date().getFullYear();
    for (var i = 0; i < yearEls.length; i++) {
      yearEls[i].textContent = currentYear;
    }

    // 2. Entrance Animation
    var reduced = false;
    if (window.SRP && window.SRP.Dom && window.SRP.Dom.prefersReducedMotion) {
      reduced = window.SRP.Dom.prefersReducedMotion();
    }
    if (document.body.classList.contains("reduced-motion")) {
      reduced = true;
    }

    if (window.SRP && window.SRP.FeatureDetect && window.SRP.FeatureDetect.gsap() && !reduced) {
      var tween = gsap.fromTo(footerEl, { y: 60, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: M().duration.medium, ease: M().easing.entrance,
        scrollTrigger: { trigger: footerEl, start: "top 95%", once: true }
      });
      activeTweens.push(tween);
    } else {
      footerEl.classList.add("reveal");
      if (window.SRP && window.SRP.Observers && window.SRP.Observers.reveal) {
        window.SRP.Observers.reveal(footerEl);
      }
    }

    // 3. Smooth scroll for anchor links within footer (e.g. "back to top")
    clickListener = function(e) {
      var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href");
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      
      e.preventDefault();
      
      if (window.__lenis && !reduced) {
        window.__lenis.scrollTo(target, { offset: 0, duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
    };
    footerEl.addEventListener("click", clickListener);
  }

  function destroy() {
    activeTweens.forEach(function(t) { 
      if (t.scrollTrigger) t.scrollTrigger.kill();
      t.kill(); 
    });
    activeTweens = [];

    if (footerEl && clickListener) {
      footerEl.removeEventListener("click", clickListener);
      clickListener = null;
    }

    footerEl = null;
  }

  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.footer = { init: init, destroy: destroy };
})();


/* --- assets/js/modules/hero.js --- */
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


/* --- assets/js/modules/stats.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;
  let rafIds = [];
  let countersFinished = 0;

  function init() {
    const statCards = document.querySelectorAll('.stat-card .stat-num, .stat-num');
    if (statCards.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = 2000;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10) || 0;
          const suffix = el.getAttribute('data-suffix') || '';
          
          if (prefersReducedMotion) {
            el.textContent = target + suffix;
            countersFinished++;
            checkComplete(statCards.length);
          } else {
            let start = null;
            const step = (timestamp) => {
              if (!start) start = timestamp;
              const progress = Math.min((timestamp - start) / duration, 1);
              // ease-out
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(easeProgress * target);
              el.textContent = current + suffix;
              
              if (progress < 1) {
                const id = window.requestAnimationFrame(step);
                rafIds.push(id);
              } else {
                el.textContent = target + suffix;
                countersFinished++;
                checkComplete(statCards.length);
              }
            };
            const id = window.requestAnimationFrame(step);
            rafIds.push(id);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    statCards.forEach(card => observer.observe(card));
  }

  function checkComplete(total) {
    if (countersFinished === total && window.SRP.EventBus) {
      window.SRP.EventBus.emit('stats:complete');
    }
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    rafIds.forEach(id => window.cancelAnimationFrame(id));
    rafIds = [];
    countersFinished = 0;
  }

  window.SRP.Modules.stats = { init, destroy };
})();


/* --- assets/js/modules/showcase.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let triggers = [];
  
  function init() {
    const container = document.querySelector('.showcase-scroll-container');
    const track = document.querySelector('.showcase-track');
    const cards = document.querySelectorAll('.showcase-card');
    
    if (!container || !track || cards.length === 0) return;

    if (window.gsap && window.ScrollTrigger) {
      // Horizontal pin
      const t = window.ScrollTrigger.create({
        trigger: container,
        pin: true,
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        animation: window.gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none'
        }),
        scrub: true,
        invalidateOnRefresh: true
      });
      triggers.push(t);

      // Card active states based on viewport center
      cards.forEach((card, i) => {
        const ct = window.ScrollTrigger.create({
          trigger: card,
          containerAnimation: t.animation,
          start: 'left center',
          end: 'right center',
          onEnter: () => activateCard(card, i),
          onEnterBack: () => activateCard(card, i)
        });
        triggers.push(ct);
      });
    }
  }

  function activateCard(card, index) {
    document.querySelectorAll('.showcase-card').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');
    if (window.SRP.EventBus) {
      window.SRP.EventBus.emit('showcase:active', { index });
    }
  }

  function destroy() {
    triggers.forEach(t => t.kill());
    triggers = [];
    document.querySelectorAll('.showcase-card').forEach(c => c.classList.remove('is-active'));
  }

  window.SRP.Modules.showcase = { init, destroy };
})();


/* --- assets/js/modules/offerings.js --- */
/* modules/offerings.js — quiet staggered fade (breathing room after the pin) */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var cards = SRP.Dom.$$(".offer-card");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      gsap.fromTo(cards, { autoAlpha: 0, y: 40 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        stagger: 0.09,
        scrollTrigger: { trigger: cards[0].parentElement, start: "top 85%", once: true }
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.09 });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.offerings = { init: init };
})();


/* --- assets/js/modules/partners.js --- */
/* modules/partners.js — quiet single mask fade (no per-chip stagger) */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var grid = SRP.Dom.$(".logo-grid");
    if (!grid) return;

    if (SRP.FeatureDetect.gsap() && SRP.FeatureDetect.clipPath()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(grid, { clipPath: "inset(0% 0% 100% 0%)", autoAlpha: 0 }, {
        clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1,
        duration: M().duration.medium, ease: "power2.out",
        scrollTrigger: { trigger: grid, start: "top 85%", once: true }
      });
    } else {
      grid.classList.add("reveal");
      SRP.Observers.reveal(grid);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.partners = { init: init };
})();


/* --- assets/js/modules/testimonials.js --- */
/* modules/testimonials.js — testimonials: staggered reveal on scroll */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var cards = SRP.Dom.$$(".testi-card");
    var stack = SRP.Dom.$(".testi-stack");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();

      /* Set initial state */
      gsap.set(cards, { autoAlpha: 0, y: 40 });

      /* Staggered reveal on scroll */
      gsap.to(cards, {
        autoAlpha: 1, y: 0,
        duration: 0.8, ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: stack,
          start: "top 75%",
          once: true
        }
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.2 });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.testimonials = { init: init };
})();


/* --- assets/js/modules/about.js --- */
/* modules/aboutPage.js — About header mask reveal + mission split panels */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    /* Mission split: statement from right, engine from left */
    var missL = SRP.Dom.$(".mission-card.l");
    var missR = SRP.Dom.$(".mission-card.r");
    if (SRP.FeatureDetect.gsap()) {
      var tl = gsap.timeline({ defaults: { ease: M().easing.entrance, duration: M().duration.slow } });
      if (missL) tl.fromTo(missL, { autoAlpha: 0, x: -90 }, { autoAlpha: 1, x: 0 }, 0);
      if (missR) tl.fromTo(missR, { autoAlpha: 0, x: 90 }, { autoAlpha: 1, x: 0 }, 0);
      tl.scrollTrigger = ScrollTrigger.create({ trigger: SRP.Dom.$(".mission-split"), start: "top 80%", once: true });
      tl.pause();
      ScrollTrigger.create({
        trigger: SRP.Dom.$(".mission-split"), start: "top 80%", once: true,
        onEnter: function () { tl.play(); }
      });
    } else {
      if (missL) { missL.classList.add("reveal-l"); SRP.Observers.reveal(missL); }
      if (missR) { missR.classList.add("reveal-r"); SRP.Observers.reveal(missR); }
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.aboutPage = { init: init };
})();


/* --- assets/js/modules/values.js --- */
/* modules/values.js — three value cards: single depth group (quiet 3D) */
(function () {
  "use strict";

  function init() {
    var cards = SRP.Dom.$$(".value-card");
    if (!cards.length) return;
    SRP.Motion.depth.depthReveal(cards, { z: -40, rotateX: 5, stagger: 0.12 });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.values = { init: init };
})();


/* --- assets/js/modules/people-preview.js --- */
/* modules/peoplePreview.js — glass float panel + CTA */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var panel = SRP.Dom.$(".people-preview");
    if (!panel) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(panel, { autoAlpha: 0, y: 60 }, {
        autoAlpha: 1, y: 0, duration: M().duration.slow, ease: M().easing.entrance,
        scrollTrigger: { trigger: panel, start: "top 85%", once: true }
      });
    } else {
      panel.classList.add("reveal");
      SRP.Observers.reveal(panel);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.peoplePreview = { init: init };
})();


/* --- assets/js/modules/pillars.js --- */
/* modules/pillars.js — SIGNATURE (Incubation): five cards, five distinct entrances */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var entrances = [
    { y: 90 },                       /* 1. rises */
    { rotation: 3 },                 /* 2. rotates slightly */
    { x: -90, y: 60 },               /* 3. slides diagonally */
    { scale: 0.82 },                 /* 4. scales up */
    { y: 46, autoAlpha: 0.001 }      /* 5. fades upward */
  ];

  function init() {
    var cards = SRP.Dom.$$(".pillar-card");
    if (!cards.length) return;

    if (!SRP.FeatureDetect.gsap()) {
      SRP.Observers.reveal(cards, { stagger: 0.12 });
      return;
    }

    SRP.Manager.trackTrigger();
    var tl = gsap.timeline({
      defaults: { duration: M().duration.medium, ease: M().easing.entrance },
      scrollTrigger: { trigger: cards[0].parentElement, start: "top 80%", once: true }
    });

    cards.forEach(function (card, i) {
      var e = entrances[i % entrances.length];
      var from = { autoAlpha: 0 };
      Object.keys(e).forEach(function (k) { from[k] = e[k]; });
      tl.fromTo(card, from, { autoAlpha: 1, y: 0, x: 0, rotation: 0, scale: 1 }, "+=0.06");
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.pillars = { init: init };
})();


/* --- assets/js/modules/who-apply.js --- */
/* modules/whoApply.js — blue box: morphing shape entrance + pulse CTA */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var box = SRP.Dom.$(".blue-box");
    if (!box) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(box, { autoAlpha: 0, scale: 0.94, borderRadius: "50%" }, {
        autoAlpha: 1, scale: 1, borderRadius: "22px",
        duration: M().duration.slow, ease: M().easing.entrance,
        scrollTrigger: { trigger: box, start: "top 85%", once: true }
      });
    } else {
      box.classList.add("reveal-scale");
      SRP.Observers.reveal(box);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.whoApply = { init: init };
})();


/* --- assets/js/modules/inc-partners.js --- */
/* modules/incPartners.js — 4 partner categories: hover-only, quiet fade */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var cards = SRP.Dom.$$(".inc-partner-card");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(cards, { autoAlpha: 0, y: 36 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: cards[0].parentElement, start: "top 85%", once: true }
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.08 });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.incPartners = { init: init };
})();


/* --- assets/js/modules/co-features.js --- */
/* modules/coFeatures.js — 5 feature cards: quiet stagger */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var cards = SRP.Dom.$$(".co-feature-card");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(cards, { autoAlpha: 0, y: 44 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        stagger: 0.1,
        scrollTrigger: { trigger: cards[0].parentElement, start: "top 84%", once: true }
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.1 });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.coFeatures = { init: init };
})();


/* --- assets/js/modules/beyond-desk.js --- */
/* modules/beyondDesk.js — word-by-word scrub text reveal ("Beyond the desk") */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var el = SRP.Dom.$("[data-scrub-text]");
    if (!el) return;

    /* Wrap each word in a masked span */
    var words = el.textContent.trim().split(/\s+/);
    var frag = document.createDocumentFragment();
    words.forEach(function (w, i) {
      var span = SRP.Dom.createEl("span", "scrub-word");
      span.textContent = w;
      span.style.cssText = "display:inline-block;opacity:.12;transition:opacity .4s ease;margin-right:.28em;";
      frag.appendChild(span);
    });
    el.textContent = "";
    el.appendChild(frag);

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.to(el.querySelectorAll(".scrub-word"), {
        opacity: 1,
        ease: "none",
        stagger: 0.02,
        scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 40%", scrub: 0.5 }
      });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.beyondDesk = { init: init };
})();


/* --- assets/js/modules/gallery.js --- */
/* modules/gallery.js — SIGNATURE (Coworking): 5 tiles, directional reveals */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  /* [left, bottom, right, scale, rotate] — per requirement */
  var dirs = ["left", "bottom", "right", "scale", "rotate"];

  function init() {
    var tiles = SRP.Dom.$$(".gallery-tile");
    if (!tiles.length) return;

    if (!SRP.FeatureDetect.gsap()) {
      SRP.Observers.reveal(tiles, { stagger: 0.1 });
      return;
    }

    SRP.Manager.trackTrigger();
    var tl = gsap.timeline({
      defaults: { duration: M().duration.medium, ease: M().easing.entrance },
      scrollTrigger: { trigger: tiles[0].parentElement, start: "top 82%", once: true }
    });

    tiles.forEach(function (tile, i) {
      var from = { autoAlpha: 0 };
      switch (dirs[i % dirs.length]) {
        case "left": from.x = -70; break;
        case "right": from.x = 70; break;
        case "bottom": from.y = 70; break;
        case "scale": from.scale = 0.8; break;
        case "rotate": from.rotation = 6; break;
      }
      tl.fromTo(tile, from, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0 }, "+=0.05");
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.gallery = { init: init };
})();


/* --- assets/js/modules/co-cta.js --- */
/* modules/coCta.js — CTA panel: brighten + button pulse + arrow slide */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var panel = SRP.Dom.$(".cta-panel");
    if (!panel) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      var tl = gsap.timeline({
        scrollTrigger: { trigger: panel, start: "top 82%", once: true }
      });
      tl.fromTo(panel, { filter: "brightness(0.9)", autoAlpha: 0, y: 40 }, {
        filter: "brightness(1)", autoAlpha: 1, y: 0,
        duration: M().duration.slow, ease: M().easing.entrance
      }).fromTo(".cta-panel .btn", { scale: 0.9, autoAlpha: 0 }, {
        scale: 1, autoAlpha: 1, duration: M().duration.fast, ease: "back.out(2)", stagger: 0.12
      }, "-=0.6").fromTo(".cta-panel .btn .btn-arrow", { x: -8, autoAlpha: 0 }, {
        x: 0, autoAlpha: 1, duration: M().duration.fast, ease: M().easing.entrance
      }, "-=0.4");
    } else {
      panel.classList.add("reveal");
      SRP.Observers.reveal(panel);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.coCta = { init: init };
})();


/* --- assets/js/modules/people-page.js --- */
/* modules/peoplePage.js — SIGNATURE (People): leadership split, directors wave, advisors, core team */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var leadership = SRP.Dom.$$(".leadership-card");
    if (leadership.length) {
      if (SRP.FeatureDetect.gsap()) {
        SRP.Manager.trackTrigger();
        gsap.fromTo(leadership, { autoAlpha: 0, scale: 0.9 }, {
          autoAlpha: 1, scale: 1, duration: M().duration.slow, ease: M().easing.entrance,
          stagger: 0.15,
          scrollTrigger: { trigger: leadership[0].parentElement, start: "top 85%", once: true }
        });
      } else {
        SRP.Observers.reveal(leadership, { stagger: 0.15 });
      }
    }

    /* Directors: 12-card wave cascade */
    var directors = SRP.Dom.$$(".director-card");
    if (directors.length) {
      SRP.Motion.wave.waveReveal(directors, { dist: 56, stagger: 0.05 });
    }

    /* Advisors: quiet float */
    var advisors = SRP.Dom.$$(".advisor-card");
    if (advisors.length) {
      if (SRP.FeatureDetect.gsap()) {
        gsap.fromTo(advisors, { autoAlpha: 0, y: 40 }, {
          autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: advisors[0].parentElement, start: "top 85%", once: true }
        });
      } else {
        SRP.Observers.reveal(advisors, { stagger: 0.1 });
      }
    }

    /* Core team: quiet stagger */
    var team = SRP.Dom.$$(".team-card");
    if (team.length) {
      if (SRP.FeatureDetect.gsap()) {
        gsap.fromTo(team, { autoAlpha: 0, y: 36 }, {
          autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: { trigger: team[0].parentElement, start: "top 85%", once: true }
        });
      } else {
        SRP.Observers.reveal(team, { stagger: 0.06 });
      }
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.peoplePage = { init: init };
})();


/* --- assets/js/modules/mentors.js --- */
/* modules/mentors.js — mentor carousel: scroll-snap swipe + keyboard nav */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var row = SRP.Dom.$(".mentor-row");
    var cells = SRP.Dom.$$(".mentor-cell");
    if (!row || !cells.length) return;

    /* Entrance: quiet stagger */
    if (SRP.FeatureDetect.gsap()) {
      gsap.fromTo(cells, { autoAlpha: 0, y: 30 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        stagger: 0.04,
        scrollTrigger: { trigger: row, start: "top 85%", once: true }
      });
    } else {
      SRP.Observers.reveal(cells, { stagger: 0.04 });
    }

    /* Keyboard navigation: arrow keys move focus + scroll */
    row.setAttribute("tabindex", "0");
    row.setAttribute("role", "list");
    row.setAttribute("aria-label", "Mentors carousel");
    cells.forEach(function (c) { c.setAttribute("role", "listitem"); });

    row.addEventListener("keydown", function (e) {
      var step = cells[0].offsetWidth + 26;
      if (e.key === "ArrowRight") { row.scrollBy({ left: step, behavior: "smooth" }); e.preventDefault(); }
      if (e.key === "ArrowLeft") { row.scrollBy({ left: -step, behavior: "smooth" }); e.preventDefault(); }
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.mentors = { init: init };
})();


/* --- assets/js/modules/portfolio-page.js --- */
/* modules/portfolioPage.js — SIGNATURE (Portfolio): featured depth cards + filterable grid */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var activeCategory = "all";

  function animateGrid() {
    var cards = SRP.Dom.$$(".startup-card:not(.is-hidden)");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(cards, { autoAlpha: 0, y: 32 }, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.06,
        overwrite: true
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.06 });
    }
  }

  function init() {
    /* Featured: 3D depth entrance */
    var feat = SRP.Dom.$$(".feat-card");
    if (feat.length) {
      SRP.Motion.depth.depthReveal(feat, { z: -50, rotateX: 6, stagger: 0.15 });
    }

    /* Grid: initial reveal */
    var grid = SRP.Dom.$("[data-filter-grid]");
    var pills = SRP.Dom.$$(".filter-pill");
    if (!grid) return;

    SRP.Observers.inView(grid, animateGrid, { threshold: 0.05 });

    /* Category filtering */
    pills.forEach(function (pill) {
      pill.setAttribute("role", "button");
      pill.addEventListener("click", function () {
        if (pill.classList.contains("is-active")) return;
        pills.forEach(function (p) {
          p.classList.toggle("is-active", p === pill);
          p.setAttribute("aria-pressed", p === pill ? "true" : "false");
        });

        activeCategory = pill.getAttribute("data-filter") || "all";
        SRP.Dom.$$(".startup-card", grid).forEach(function (card) {
          var cats = (card.getAttribute("data-cats") || "all").split(",");
          var show = activeCategory === "all" || cats.indexOf(activeCategory) !== -1;
          card.classList.toggle("is-hidden", !show);
        });
        SRP.EventBus.emit("filter:changed", activeCategory);
        animateGrid();
      });
      pill.setAttribute("aria-pressed", pill.classList.contains("is-active") ? "true" : "false");
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.portfolioPage = { init: init };
})();


/* --- assets/js/modules/events-page.js --- */
/* modules/eventsPage.js — SIGNATURE (Events): growing timeline, glowing dots, alternating cards */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var items = SRP.Dom.$$(".timeline-item");
    var fill = SRP.Dom.$(".timeline-line-fill");
    var upcoming = SRP.Dom.$(".coming-soon");
    if (!items.length) return;

    /* Upcoming: gentle float */
    if (upcoming && !SRP.Dom.prefersReducedMotion()) {
      upcoming.classList.add("float-anim");
    }

    if (!SRP.FeatureDetect.gsap()) {
      SRP.Observers.reveal(items, { stagger: 0.12 });
      return;
    }

    SRP.Manager.trackTrigger();

    /* Timeline line grows downward */
    if (fill) {
      gsap.fromTo(fill, { scaleY: 0 }, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: { trigger: fill, start: "top 80%", end: "bottom 60%", scrub: 0.4 }
      });
    }

    /* Cards slide alternately; dots glow as reached */
    items.forEach(function (item, i) {
      var card = SRP.Dom.$(".timeline-card", item);
      if (!card) return;
      var dir = i % 2 === 0 ? -70 : 70;

      SRP.Manager.trackTrigger();
      gsap.fromTo(card, { autoAlpha: 0, x: dir }, {
        autoAlpha: 1, x: 0, duration: M().duration.medium, ease: M().easing.entrance,
        scrollTrigger: { trigger: item, start: "top 85%", once: true, onEnter: function () { item.classList.add("is-reached"); } }
      });
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.eventsPage = { init: init };
})();


/* --- assets/js/modules/newsletter.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let forms = [];
  let timeouts = [];

  function init() {
    forms = Array.from(document.querySelectorAll('form.newsletter'));
    
    forms.forEach(form => {
      const btn = form.querySelector('.btn-state-morph');
      const input = form.querySelector('input[type="email"]');
      
      const onSubmit = (e) => {
        e.preventDefault();
        if (!input || !input.value || !input.checkValidity()) return;
        
        if (btn) {
          btn.classList.add('is-loading');
          
          const t1 = setTimeout(() => {
            btn.classList.remove('is-loading');
            btn.classList.add('is-success');
            const txt = btn.querySelector('.btn-text');
            if (txt) {
              btn.dataset.originalText = txt.textContent;
              txt.textContent = '✓ Subscribed!';
            }
            
            const t2 = setTimeout(() => {
              btn.classList.remove('is-success');
              if (txt && btn.dataset.originalText) {
                txt.textContent = btn.dataset.originalText;
              }
              form.reset();
            }, 3000);
            timeouts.push(t2);
          }, 1500);
          timeouts.push(t1);
        }
      };
      
      form.addEventListener('submit', onSubmit);
      form._onSubmit = onSubmit; // store ref for destroy
    });
  }

  function destroy() {
    forms.forEach(form => {
      if (form._onSubmit) {
        form.removeEventListener('submit', form._onSubmit);
      }
    });
    forms = [];
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
  }

  window.SRP.Modules.newsletter = { init, destroy };
})();


/* --- assets/js/modules/contact-page.js --- */
/* modules/contactPage.js — split layout slide + map pin drop + socials stagger */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var formCard = SRP.Dom.$(".contact-form-card");
    var infoCard = SRP.Dom.$(".contact-info-card");
    var map = SRP.Dom.$(".map-frame");
    var socials = SRP.Dom.$$(".socials .social-link");

    if (SRP.FeatureDetect.gsap()) {
      var tl = gsap.timeline({ defaults: { ease: M().easing.entrance, duration: M().duration.slow } });
      if (formCard) tl.fromTo(formCard, { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0 }, 0);
      if (infoCard) tl.fromTo(infoCard, { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0 }, 0);
      if (tl.duration() > 0) {
        tl.scrollTrigger = ScrollTrigger.create({ trigger: SRP.Dom.$(".split"), start: "top 80%", once: true });
        tl.pause();
        ScrollTrigger.create({
          trigger: SRP.Dom.$(".split"), start: "top 80%", once: true,
          onEnter: function () { tl.play(); }
        });
      }
    } else {
      if (formCard) { formCard.classList.add("reveal-l"); SRP.Observers.reveal(formCard); }
      if (infoCard) { infoCard.classList.add("reveal-r"); SRP.Observers.reveal(infoCard); }
    }

    /* Map pin drop is pure CSS (pinDrop keyframe) — nothing needed here */

    /* Contact form: static UI with validation + success message */
    var form = SRP.Dom.$("#contact-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = SRP.Dom.$("#cf-name");
        var email = SRP.Dom.$("#cf-email");
        var msg = SRP.Dom.$("#cf-message");
        var out = SRP.Dom.$(".form-msg", form);
        if (name && !name.checkValidity()) { name.reportValidity(); return; }
        if (email && !email.checkValidity()) { email.reportValidity(); return; }
        if (msg && !msg.checkValidity()) { msg.reportValidity(); return; }
        if (out) {
          out.textContent = "Thanks, " + (name && name.value ? name.value : "there") + "! Your message has been noted — we'll get back to you soon.";
          out.style.color = "#1565d8";
          out.style.fontWeight = "700";
        }
        form.reset();
      });
    }

    if (socials.length) {
      if (SRP.FeatureDetect.gsap()) {
        SRP.Manager.trackTrigger();
        gsap.fromTo(socials, { autoAlpha: 0, scale: 0.6 }, {
          autoAlpha: 1, scale: 1, duration: M().duration.fast, ease: "back.out(2)", stagger: 0.08,
          scrollTrigger: { trigger: socials[0], start: "top 90%", once: true }
        });
      }
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.contactPage = { init: init };
})();


/* --- assets/js/modules/chairman.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let trigger = null;
  let observer = null;
  let unsubTier = null;

  function init() {
    const wrapper = document.querySelector('.chairman-photo-wrapper');
    const content = document.querySelector('.chairman-content');

    if (!wrapper && !content) return;

    const isLite = window.SRP.Performance && window.SRP.Performance.getTier && window.SRP.Performance.getTier() === 'lite';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Observer for content reveal
    if (content) {
      const children = Array.from(content.children);
      
      if (prefersReducedMotion) {
        children.forEach(child => child.classList.add('is-visible'));
      } else {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              children.forEach((child, index) => {
                child.style.transitionDelay = `${index * 150}ms`;
                child.classList.add('is-visible');
              });
              observer.disconnect();
            }
          });
        }, { threshold: 0.2 });
        observer.observe(content);
      }
    }

    // 2. Parallax for photo wrapper
    if (wrapper && !isLite && !prefersReducedMotion && window.gsap && window.ScrollTrigger) {
      trigger = window.ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        animation: window.gsap.to(wrapper, { yPercent: -15, ease: 'none' })
      });
    }

    // Listen to tier changes
    if (window.SRP.EventBus) {
      unsubTier = window.SRP.EventBus.on('tier:change', (newTier) => {
        if (newTier === 'lite' && trigger) {
          trigger.kill();
          trigger = null;
          window.gsap.set(wrapper, { clearProps: 'yPercent' });
        }
      });
    }
  }

  function destroy() {
    if (trigger) {
      trigger.kill();
      trigger = null;
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (unsubTier) {
      unsubTier();
      unsubTier = null;
    }
  }

  window.SRP.Modules.chairman = { init, destroy };
})();


/* --- assets/js/modules/startup-structure.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let trigger = null;

  function init() {
    const container = document.querySelector('.journey-container');
    const pathLine = document.querySelector('.journey-path-line');
    const steps = document.querySelectorAll('.journey-step');

    if (!container || !pathLine || steps.length === 0) return;

    let totalLength = 0;
    try {
      totalLength = pathLine.getTotalLength();
    } catch (e) {
      // Fallback if not an SVGPathElement
      totalLength = 1200; // default for straight line based on spec
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      pathLine.style.strokeDasharray = totalLength;
      pathLine.style.strokeDashoffset = 0;
      steps.forEach(step => step.classList.add('is-active'));
      return;
    }

    pathLine.style.strokeDasharray = totalLength;
    pathLine.style.strokeDashoffset = totalLength;

    if (window.ScrollTrigger) {
      trigger = window.ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          pathLine.style.strokeDashoffset = totalLength * (1 - progress);

          steps.forEach((step, i) => {
            const threshold = (i + 0.5) / steps.length;
            if (progress >= threshold) {
              step.classList.add('is-active');
            } else {
              step.classList.remove('is-active');
            }
          });
        }
      });
    }
  }

  function destroy() {
    if (trigger) {
      trigger.kill();
      trigger = null;
    }
    const pathLine = document.querySelector('.journey-path-line');
    if (pathLine) {
      pathLine.style.strokeDashoffset = '';
      pathLine.style.strokeDasharray = '';
    }
    const steps = document.querySelectorAll('.journey-step');
    steps.forEach(step => step.classList.remove('is-active'));
  }

  window.SRP.Modules['startup-structure'] = { init, destroy };
})();


/* --- assets/js/modules/mentors-home.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;
  let listeners = [];
  let unsubTier = null;

  function init() {
    const cards = document.querySelectorAll('.mentor-card-enhanced');
    if (cards.length === 0) return;

    const isLite = window.SRP.Performance && window.SRP.Performance.getTier && window.SRP.Performance.getTier() === 'lite';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enableTilt = window.CONFIG && window.CONFIG.ENABLE_TILT !== false;

    // Reveal Observer
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const index = Array.from(cards).indexOf(card);
          card.style.transitionDelay = `${index * 0.1}s`;
          card.classList.add('is-visible');
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));

    // Tilt effect
    if (enableTilt && !isLite && !prefersReducedMotion && window.gsap) {
      cards.forEach(card => {
        const onMouseMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;
          
          window.gsap.to(card, { rotationX: rotateX, rotationY: rotateY, duration: 0.3, overwrite: 'auto' });
        };
        
        const onMouseLeave = () => {
          window.gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.4, overwrite: 'auto' });
        };

        card.addEventListener('mousemove', onMouseMove);
        card.addEventListener('mouseleave', onMouseLeave);
        
        listeners.push({ card, event: 'mousemove', handler: onMouseMove });
        listeners.push({ card, event: 'mouseleave', handler: onMouseLeave });
      });
    }

    if (window.SRP.EventBus) {
      unsubTier = window.SRP.EventBus.on('tier:change', (newTier) => {
        if (newTier === 'lite') {
          // Clean up tilt listeners
          listeners.forEach(({ card, event, handler }) => {
            card.removeEventListener(event, handler);
            if (window.gsap) {
              window.gsap.set(card, { clearProps: 'rotationX,rotationY' });
            }
          });
          listeners = [];
        }
      });
    }
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    listeners.forEach(({ card, event, handler }) => {
      card.removeEventListener(event, handler);
      if (window.gsap) {
        window.gsap.killTweensOf(card);
      }
    });
    listeners = [];
    if (unsubTier) {
      unsubTier();
      unsubTier = null;
    }
  }

  window.SRP.Modules['mentors-home'] = { init, destroy };
})();


/* --- assets/js/modules/gallery-preview.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;
  let trigger = null;

  function init() {
    const tiles = document.querySelectorAll('.gallery-tile');
    if (tiles.length === 0) return;

    // Stagger reveal
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tile = entry.target;
          const index = Array.from(tiles).indexOf(tile);
          tile.style.transitionDelay = `${index * 0.12}s`;
          tile.classList.add('is-visible');
          observer.unobserve(tile);
        }
      });
    }, { threshold: 0.1 });

    tiles.forEach(tile => observer.observe(tile));

    // Parallax on tall tile
    const isLite = window.SRP.Performance && window.SRP.Performance.getTier && window.SRP.Performance.getTier() === 'lite';
    const enableParallax = window.CONFIG ? window.CONFIG.ENABLE_PARALLAX : true;
    
    if (enableParallax && !isLite && window.gsap && window.ScrollTrigger) {
      const tallTile = document.querySelector('.gallery-tile.tall');
      if (tallTile) {
        trigger = window.ScrollTrigger.create({
          trigger: tallTile,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          animation: window.gsap.fromTo(tallTile, { yPercent: -10 }, { yPercent: 10, ease: 'none' })
        });
      }
    }
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (trigger) {
      trigger.kill();
      trigger = null;
    }
    document.querySelectorAll('.gallery-tile').forEach(tile => {
      tile.classList.remove('is-visible');
      tile.style.transitionDelay = '';
    });
  }

  window.SRP.Modules['gallery-preview'] = { init, destroy };
})();


/* --- assets/js/modules/trustees.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;

  function init() {
    const cards = document.querySelectorAll('.trustees-section .trustee-card, .trustees-section .person-card');
    if (cards.length === 0) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const index = Array.from(cards).indexOf(card);
          card.style.transitionDelay = `${index * 0.2}s`;
          card.classList.add('is-visible');
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    document.querySelectorAll('.trustees-section .trustee-card, .trustees-section .person-card').forEach(card => {
      card.classList.remove('is-visible');
      card.style.transitionDelay = '';
    });
  }

  window.SRP.Modules.trustees = { init, destroy };
})();


/* --- assets/js/modules/impact-report.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;
  let rafIds = [];
  let timeouts = [];
  let btnListener = null;
  let downloadBtn = null;

  function init() {
    // 1. Counters
    const statCards = document.querySelectorAll('.impact-section [data-count]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = 2000;

    if (statCards.length > 0) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10) || 0;
            const suffix = el.getAttribute('data-suffix') || '';
            
            if (prefersReducedMotion) {
              el.textContent = target + suffix;
            } else {
              let start = null;
              const step = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easeProgress * target);
                el.textContent = current + suffix;
                
                if (progress < 1) {
                  rafIds.push(window.requestAnimationFrame(step));
                } else {
                  el.textContent = target + suffix;
                }
              };
              rafIds.push(window.requestAnimationFrame(step));
            }
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.1 });

      statCards.forEach(card => observer.observe(card));
    }

    // 2. Download Button
    downloadBtn = document.querySelector('.impact-download-btn, .impact-section .btn-primary');
    if (downloadBtn) {
      btnListener = (e) => {
        downloadBtn.classList.add('is-loading');
        timeouts.push(setTimeout(() => {
          downloadBtn.classList.remove('is-loading');
          downloadBtn.classList.add('is-success');
          const originalText = downloadBtn.textContent;
          downloadBtn.textContent = '✓ Downloading!';
          
          timeouts.push(setTimeout(() => {
            downloadBtn.classList.remove('is-success');
            downloadBtn.textContent = originalText;
          }, 3000));
        }, 600));
      };
      downloadBtn.addEventListener('click', btnListener);
    }
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    rafIds.forEach(id => window.cancelAnimationFrame(id));
    rafIds = [];
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    if (downloadBtn && btnListener) {
      downloadBtn.removeEventListener('click', btnListener);
      downloadBtn = null;
      btnListener = null;
    }
  }

  window.SRP.Modules['impact-report'] = { init, destroy };
})();


/* --- assets/js/modules/faculty-startup.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let pillListeners = [];

  function init() {
    const pills = document.querySelectorAll('.faculty-section .filter-pill');
    const cards = document.querySelectorAll('.faculty-section .faculty-card');
    
    if (pills.length === 0 || cards.length === 0) return;

    pills.forEach(pill => {
      const handler = () => {
        // Update active pill
        pills.forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        
        const filter = pill.getAttribute('data-filter');
        
        // Filter cards
        let visibleIndex = 0;
        cards.forEach(card => {
          const dept = card.getAttribute('data-dept');
          if (filter === 'all' || dept === filter) {
            // Show
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            card.style.pointerEvents = 'auto';
            card.style.transitionDelay = `${visibleIndex * 100}ms`;
            visibleIndex++;
          } else {
            // Hide
            card.style.opacity = '0';
            card.style.transform = 'scale(0.92)';
            card.style.pointerEvents = 'none';
            card.style.transitionDelay = '0ms';
          }
        });
      };
      pill.addEventListener('click', handler);
      pillListeners.push({ pill, handler });
    });
  }

  function destroy() {
    pillListeners.forEach(({ pill, handler }) => {
      pill.removeEventListener('click', handler);
    });
    pillListeners = [];
  }

  window.SRP.Modules['faculty-startup'] = { init, destroy };
})();


/* --- assets/js/modules/blog-page.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let pillListeners = [];
  let observer = null;

  function init() {
    const pills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.article-card, .blog-card');
    
    // Filtering
    if (pills.length > 0 && cards.length > 0) {
      pills.forEach(pill => {
        const handler = () => {
          pills.forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          
          const filter = pill.getAttribute('data-filter');
          let visibleIndex = 0;
          
          cards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              card.style.display = '';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transitionDelay = `${visibleIndex * 100}ms`;
                visibleIndex++;
              }, 10);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(20px)';
              card.style.transitionDelay = '0ms';
              setTimeout(() => {
                if (!card.style.opacity || card.style.opacity === '0') {
                  card.style.display = 'none';
                }
              }, 400); // Wait for fade out
            }
          });
        };
        pill.addEventListener('click', handler);
        pillListeners.push({ pill, handler });
      });
    }

    // Initial Stagger Reveal via Observer
    if (cards.length > 0) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const index = Array.from(cards).indexOf(card);
            card.style.transitionDelay = `${index * 100}ms`;
            card.classList.add('is-visible');
            observer.unobserve(card);
          }
        });
      }, { threshold: 0.1 });

      cards.forEach(card => observer.observe(card));
    }
  }

  function destroy() {
    pillListeners.forEach(({ pill, handler }) => {
      pill.removeEventListener('click', handler);
    });
    pillListeners = [];
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  window.SRP.Modules['blog-page'] = { init, destroy };
})();


/* --- assets/js/modules/internship-page.js --- */
(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let pillListeners = [];
  let formListener = null;
  let btnListeners = [];
  let form = null;
  let timeouts = [];
  let observer = null;

  function init() {
    // 1. Filtering
    const pills = document.querySelectorAll('.filter-pills .filter-pill');
    const cards = document.querySelectorAll('.internship-card');
    
    if (pills.length > 0 && cards.length > 0) {
      pills.forEach(pill => {
        const handler = () => {
          pills.forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          const filter = pill.getAttribute('data-filter') || pill.textContent.trim().toLowerCase();
          
          let visibleIndex = 0;
          cards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              card.style.display = '';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.style.transitionDelay = `${visibleIndex * 100}ms`;
                visibleIndex++;
              }, 10);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'scale(0.95)';
              card.style.transitionDelay = '0ms';
              setTimeout(() => {
                if (card.style.opacity === '0') card.style.display = 'none';
              }, 300);
            }
          });
        };
        pill.addEventListener('click', handler);
        pillListeners.push({ pill, handler });
      });
    }

    // 2. Form submission
    form = document.getElementById('apply-form');
    if (form) {
      formListener = (e) => {
        e.preventDefault();
        
        // Simple validation check
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
          const field = input.closest('.field');
          if (!input.value.trim()) {
            isValid = false;
            if (field) field.classList.add('is-invalid');
          } else {
            if (field) field.classList.remove('is-invalid');
          }
        });

        if (!isValid) {
          form.classList.add('form-shake');
          setTimeout(() => form.classList.remove('form-shake'), 500);
          return;
        }

        const btn = form.querySelector('.btn-primary');
        if (btn) {
          btn.classList.add('is-loading');
          timeouts.push(setTimeout(() => {
            btn.classList.remove('is-loading');
            btn.classList.add('is-success');
            const originalText = btn.textContent;
            btn.textContent = '✓ Application Submitted!';
            
            timeouts.push(setTimeout(() => {
              btn.classList.remove('is-success');
              btn.textContent = originalText;
              form.reset();
            }, 3000));
          }, 2000));
        }
      };
      form.addEventListener('submit', formListener);
      
      // Observer for form fields
      const fields = form.querySelectorAll('.field');
      if (fields.length > 0) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const f = entry.target;
              const index = Array.from(fields).indexOf(f);
              f.style.transitionDelay = `${index * 100}ms`;
              f.classList.add('is-visible');
              observer.unobserve(f);
            }
          });
        }, { threshold: 0.1 });
        fields.forEach(f => observer.observe(f));
      }
    }

    // 3. Apply buttons scroll
    const applyBtns = document.querySelectorAll('.internship-card .btn-primary');
    applyBtns.forEach(btn => {
      const handler = (e) => {
        e.preventDefault();
        if (form && window.lenis) {
          window.lenis.scrollTo(form, { offset: -100 });
        } else if (form) {
          form.scrollIntoView({ behavior: 'smooth' });
        }
      };
      btn.addEventListener('click', handler);
      btnListeners.push({ btn, handler });
    });
  }

  function destroy() {
    pillListeners.forEach(({ pill, handler }) => pill.removeEventListener('click', handler));
    pillListeners = [];
    
    if (form && formListener) {
      form.removeEventListener('submit', formListener);
      formListener = null;
    }
    form = null;
    
    btnListeners.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
    btnListeners = [];
    
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  window.SRP.Modules['internship-page'] = { init, destroy };
})();

