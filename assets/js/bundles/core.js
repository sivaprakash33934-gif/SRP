
/* --- assets/js/utils/debug.js --- */
/* utils/debug.js — Debug.log/warn/error gated by CONFIG.DEBUG */
(function () {
  "use strict";
  var CONFIG = window.SRP && SRP.Config ? SRP.Config : { DEBUG: false };

  var Debug = {
    enabled: function () { return !!(window.SRP && SRP.Config && SRP.Config.DEBUG); },
    log: function () {
      if (!this.enabled()) return;
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[SRP]");
      console.log.apply(console, args);
    },
    warn: function () {
      if (!this.enabled()) return;
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[SRP]");
      console.warn.apply(console, args);
    },
    error: function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[SRP]");
      console.error.apply(console, args);
    }
  };

  window.SRP = window.SRP || {};
  SRP.Debug = Debug;
})();


/* --- assets/js/utils/dom.js --- */
/* utils/dom.js — DOM helpers */
(function () {
  "use strict";

  var Dom = {
    $: function (sel, ctx) { return (ctx || document).querySelector(sel); },
    $$: function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); },

    ready: function (fn) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn);
      } else {
        fn();
      }
    },

    isTouch: function () {
      return window.matchMedia("(hover: none), (pointer: coarse)").matches;
    },

    isDesktop: function () {
      return window.innerWidth >= 769 && !this.isTouch();
    },

    clamp: function (v, min, max) { return Math.max(min, Math.min(max, v)); },

    prefersReducedMotion: function () {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },

    prefersDark: function () {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    },

    createEl: function (tag, className, html) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (html !== undefined) el.innerHTML = html;
      return el;
    },

    on: function (el, evt, fn, opts) { el.addEventListener(evt, fn, opts || false); },
    off: function (el, evt, fn) { el.removeEventListener(evt, fn); }
  };

  window.SRP = window.SRP || {};
  SRP.Dom = Dom;
})();


/* --- assets/js/utils/helpers.js --- */
/* utils/helpers.js — math & timing helpers */
(function () {
  "use strict";

  var Helpers = {
    lerp: function (a, b, t) { return a + (b - a) * t; },

    clamp: function (v, min, max) { return Math.max(min, Math.min(max, v)); },

    debounce: function (fn, wait) {
      var t;
      return function () {
        var ctx = this, args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, wait || 150);
      };
    },

    throttle: function (fn, limit) {
      var last, timer;
      return function () {
        var ctx = this, args = arguments, now = Date.now();
        if (last && now - last < (limit || 100)) {
          clearTimeout(timer);
          timer = setTimeout(function () { last = now; fn.apply(ctx, args); }, limit);
          return;
        }
        last = now;
        fn.apply(ctx, args);
      };
    },

    /* Random int between min (incl) and max (incl) */
    rand: function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },

    /* Prepend zeros */
    pad: function (n, len) {
      var s = String(n);
      while (s.length < (len || 2)) s = "0" + s;
      return s;
    },

    /* Format Indian-style numbers: 4950 -> "4,950" */
    formatNum: function (n) {
      return n.toLocaleString("en-IN");
    }
  };

  window.SRP = window.SRP || {};
  SRP.Helpers = Helpers;
})();


/* --- assets/js/utils/feature-detect.js --- */
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


/* --- assets/js/config.js --- */
/* ================================================================
 * FILE: assets/js/config.js
 * SRP Configuration — Global Variable Pattern (vanilla JS)
 * NOTE: No ES module exports — loaded via plain <script defer> tag
 * SRP Rule 1.1: All values readonly via Object.freeze()
 * ================================================================ */

(function () {
  'use strict';

  var CONFIG = Object.freeze({
    DEBUG: false,
    ENABLE_LOADER: true,
    ENABLE_CURSOR: true,
    ENABLE_MAGNETIC: true,
    ENABLE_TILT: true,
    ENABLE_PARTICLES: false,
    ENABLE_PARALLAX: true,
    ENABLE_PROGRESS_BAR: true,
    ENABLE_PAGE_TRANSITION: true,
    ENABLE_GLASS: true,
    ENABLE_AMBIENT: true,
    ENABLE_CHATBOT: false,
    LOADER_DURATION: 800,
    PARTICLE_CAP: 60,
    GPU_LAYER_BUDGET: 15,
    BLUR_LAYER_BUDGET: 4
  });

  // Expose globally for all modules loaded via plain <script> tags
  window.SRP = window.SRP || {};
  window.SRP.Config = CONFIG;
  window.CONFIG = CONFIG;
})();


/* --- assets/js/theme.js --- */
/* theme.js — JS-side color tokens (mirrors CSS :root) */
(function () {
  "use strict";

  var Theme = {
    primary: "#1565d8",
    primaryDark: "#0d3a85",
    primaryLight: "#2e7df2",
    accent: "#6ea8f7",
    silver: "#e4e7ec",
    glow: "rgba(46,125,242,0.25)",
    ink: "#0f1b33",
    slate: "#52607a",
    paper: "#ffffff",
    wash: "#f7fafd",
    gradPrimary: "linear-gradient(135deg, #1565d8 0%, #2e7df2 55%, #6ea8f7 100%)"
  };

  window.SRP = window.SRP || {};
  SRP.Theme = Theme;
})();


/* --- assets/js/motion-config.js --- */
/* motion-config.js — Single source of truth for motion values */
(function () {
  "use strict";

  var MotionConfig = {
    duration: {
      fast: 0.7,
      medium: 1.0,
      slow: 1.6
    },

    easing: {
      entrance: "power4.out",
      scrub: "power2.out",
      spring: "elastic.out(1, 0.6)"
    },

    stagger: {
      grid: 0.08,
      wave: 0.06,
      list: 0.1
    },

    parallax: {
      hero: 0.2,
      ambient: 0.1,
      gallery: 0.18
    },

    glow: {
      strength: 0.25,
      hover: 0.45
    },

    pin: {
      enabled: true, /* single pinned section per site */
      totalPins: 1
    },

    budget: {
      maxConcurrentTriggers: 12,
      maxWillChange: 15
    }
  };

  window.SRP = window.SRP || {};
  SRP.MotionConfig = MotionConfig;
})();


/* --- assets/js/manifest.js --- */
/* ================================================================
 * FILE: assets/js/manifest.js
 * SRP Asset & Module Manifest
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  'use strict';

  // Assets registry — READ ONLY, safe to freeze
  var Assets = Object.freeze({
    logo: "assets/svg/logos/logo.svg",
    logoMark: "assets/svg/logos/mark.svg",
    network: "assets/svg/backgrounds/network.svg",
    patternHero: "assets/svg/patterns/hero-grid.svg",
    patternDot: "assets/svg/patterns/dots.svg",
    dividerWave: "assets/svg/dividers/wave.svg",
    loaderLogo: "assets/loader/logo.svg",
    loaderParticles: "assets/loader/particles.svg",
    loaderNetwork: "assets/loader/network.svg"
  });

  // Modules registry — MUST BE MUTABLE (modules register themselves here)
  // DO NOT USE Object.freeze() on this!
  var Modules = {};

  // Page-to-module mapping — READ ONLY, safe to freeze
  var PageModules = Object.freeze({
    home: ['hero', 'stats', 'chairman', 'showcase', 'offerings',
           'startup-structure', 'mentors-home', 'partners',
           'testimonials', 'gallery-preview', 'newsletter'],
    about: ['about', 'values', 'trustees', 'impact-report', 'gallery', 'newsletter'],
    incubation: ['pillars', 'who-apply', 'inc-partners', 'faculty-startup',
                'startup-structure'],
    coworking: ['co-features', 'beyond-desk', 'co-cta', 'gallery'],
    people: ['people-page', 'mentors'],
    portfolio: ['portfolio-page'],
    events: ['events-page'],
    internships: ['internship-page'],
    blog: ['blog-page', 'newsletter'],
    contact: ['contact-page']
  });

  // Global modules loaded on every page
  var GlobalModules = Object.freeze([
    'loader', 'navbar', 'footer', 'cursor', 'magnetic',
    'progress-bar', 'page-transition', 'chatbot', 'performance'
  ]);

  window.SRP = window.SRP || {};
  window.SRP.Assets = Assets;           // frozen (read-only)
  window.SRP.Modules = Modules;         // NOT frozen (mutable — modules register here)
  window.SRP.PageModules = PageModules; // frozen (read-only)
  window.SRP.GlobalModules = GlobalModules; // frozen (read-only)
})();


/* --- assets/js/event-bus.js --- */
/* ================================================================
 * FILE: assets/js/event-bus.js
 * SRP Core Event Bus — Global Variable Pattern
 * Rule: on() returns unsubscriber, MUST call in destroy()
 * ================================================================ */

(function () {
  'use strict';

  var handlers = {};

  // List of registered typed events
  var ALLOWED_EVENTS = [
    'app:ready',
    'app:resize',
    'app:scroll',
    'loader:complete',
    'nav:toggle',
    // New Events requested
    'chat:open',
    'chat:close',
    'chat:message',
    'stats:complete',
    'showcase:active'
  ];

  var EventBus = {
    /**
     * Subscribe to an event
     * @param {string} event - The event name
     * @param {Function} fn - The callback
     * @returns {Function} Unsubscribe function (SRP Architecture Rule)
     */
    on: function (event, fn) {
      if (window.CONFIG && window.CONFIG.DEBUG && ALLOWED_EVENTS.indexOf(event) === -1) {
        console.warn("EventBus: Subscribing to unregistered event '" + event + "'");
      }
      
      handlers[event] = handlers[event] || [];
      handlers[event].push(fn);
      
      // Return unsubscriber function to satisfy strict lifecycle cleanup rule
      return function unsubscribe() {
        if (!handlers[event]) return;
        var index = handlers[event].indexOf(fn);
        if (index > -1) {
          handlers[event].splice(index, 1);
        }
      };
    },

    /**
     * Unsubscribe explicitly (fallback)
     */
    off: function (event, fn) {
      if (!handlers[event]) return;
      var index = handlers[event].indexOf(fn);
      if (index > -1) {
        handlers[event].splice(index, 1);
      }
      return this;
    },

    /**
     * Emit an event
     * @param {string} event - The event name
     * @param {*} payload - The data payload
     */
    emit: function (event, payload) {
      var list = handlers[event];
      if (!list) return this;
      
      // Clone array to prevent mutation issues during execution
      var snapshot = list.slice();
      for (var i = 0; i < snapshot.length; i++) {
        try {
          snapshot[i](payload);
        } catch (e) {
          console.error("EventBus Error in '" + event + "':", e);
        }
      }
      return this;
    },
    
    // Expose allowed events dictionary for reference and strict checks
    EVENTS: Object.freeze(
      ALLOWED_EVENTS.reduce(function(acc, val) {
        acc[val] = val;
        return acc;
      }, {})
    )
  };

  window.SRP = window.SRP || {};
  window.SRP.EventBus = EventBus;
})();


/* --- assets/js/performance.js --- */
/* ================================================================
 * FILE: assets/js/performance.js
 * SRP Performance Monitor (with legacy compat layer)
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  'use strict';

  var currentTier = 'ultra';
  var resizeTimeout = null;
  var boundResize = null;

  function detectTier() {
    var hasReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    var nav = window.navigator;
    var connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    var isSaveData = connection && connection.saveData === true;
    var memory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null;

    if (hasReducedMotion || isSaveData || (memory !== null && memory <= 2)) {
      return 'lite';
    }
    if ((memory !== null && memory <= 4) || window.innerWidth <= 768) {
      return 'medium';
    }
    return 'ultra';
  }

  function getTier() {
    return currentTier;
  }

  function setTier(tier) {
    if (tier === currentTier && document.body.classList.contains('tier-' + tier)) {
      return;
    }
    currentTier = tier;
    document.body.classList.remove('tier-ultra', 'tier-medium', 'tier-lite');
    document.body.classList.add('tier-' + tier);

    var bus = window.SRP && window.SRP.EventBus;
    if (bus && typeof bus.emit === 'function') bus.emit('tier:change', tier);
  }

  function init() {
    setTier(detectTier());
    
    boundResize = function () {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function () {
        setTier(detectTier());
      }, 250);
    };
    
    window.addEventListener('resize', boundResize);
  }

  function destroy() {
    if (boundResize) {
      window.removeEventListener('resize', boundResize);
      boundResize = null;
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
      resizeTimeout = null;
    }
  }

  // LEGACY COMPATIBILITY
  function effects(featureName) {
    var cfg = window.CONFIG || (window.SRP && window.SRP.Config) || {};
    
    // Support calling .effects() which returns an object mapping features to booleans
    // (Old files use SRP.Performance.effects().parallax)
    if (typeof featureName === 'undefined') {
      return {
        ambient: !!cfg.ENABLE_AMBIENT && currentTier !== 'lite',
        parallax: !!cfg.ENABLE_PARALLAX && currentTier !== 'lite',
        tilt: !!cfg.ENABLE_TILT && currentTier !== 'lite',
        magnetic: !!cfg.ENABLE_MAGNETIC && currentTier !== 'lite',
        cursor: !!cfg.ENABLE_CURSOR && currentTier !== 'lite',
        particles: !!cfg.ENABLE_PARTICLES && currentTier === 'ultra',
        glass: !!cfg.ENABLE_GLASS && currentTier === 'ultra',
        loader: !!cfg.ENABLE_LOADER
      };
    }
    
    // Also support calling .effects('parallax') (new behavior)
    var name = String(featureName || '');
    switch (name) {
      case 'ambient':   return !!cfg.ENABLE_AMBIENT && currentTier !== 'lite';
      case 'parallax':  return !!cfg.ENABLE_PARALLAX && currentTier !== 'lite';
      case 'tilt':      return !!cfg.ENABLE_TILT && currentTier !== 'lite';
      case 'magnetic':  return !!cfg.ENABLE_MAGNETIC && currentTier !== 'lite';
      case 'cursor':    return !!cfg.ENABLE_CURSOR && currentTier !== 'lite';
      case 'particles': return !!cfg.ENABLE_PARTICLES && currentTier === 'ultra';
      case 'glass':     return !!cfg.ENABLE_GLASS && currentTier === 'ultra';
      case 'loader':    return !!cfg.ENABLE_LOADER;
      default:          return currentTier !== 'lite';
    }
  }

  function check(featureName) { return effects(featureName); }
  function watch(interval) { /* Legacy stub */ }
  function getFps() { return 60; /* Legacy stub */ }

  var api = {
    effects: effects,     // LEGACY
    check: check,         // NEW
    tier: getTier,        // LEGACY alias
    getTier: getTier,
    setTier: setTier,
    init: init,
    destroy: destroy,
    watch: watch,         // LEGACY
    getFps: getFps        // LEGACY
  };

  window.SRP = window.SRP || {};
  window.SRP.Performance = api;
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.performance = api;
})();


/* --- assets/js/utils/observers.js --- */
/* utils/observers.js — IntersectionObserver factory (CSS-first reveals) */
(function () {
  "use strict";

  var defaults = {
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
    once: true,
    stagger: 0,
    classIn: "is-visible"
  };

  var observers = [];

  var Observers = {
    /* Reveal one or many elements; children of a container can be auto-revealed
       by passing `autoReveal: true` (each child gets a stagger delay via CSS var). */
    reveal: function (targets, opts) {
      var settings = Object.assign({}, defaults, opts || {});
      var els = typeof targets === "string" ? SRP.Dom.$$(targets) : (targets.length ? targets : [targets]);

      if (!SRP.FeatureDetect.intersectionObserver()) {
        els.forEach(function (el) { el.classList.add(settings.classIn); });
        return;
      }

      els.forEach(function (el, i) {
        if (settings.stagger && el.style) {
          el.style.setProperty("--reveal-delay", (i * settings.stagger).toFixed(2) + "s");
        }
        if (el.classList.contains(settings.classIn)) return;
      });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            el.classList.add(settings.classIn);
            if (settings.once) io.unobserve(el);
          }
        });
      }, { threshold: settings.threshold, rootMargin: settings.rootMargin });

      els.forEach(function (el) { io.observe(el); });
      observers.push(io);
      return io;
    },

    /* Watch a container; when in view run fn once */
    inView: function (el, fn, opts) {
      var settings = Object.assign({ threshold: 0.2 }, opts || {});
      if (!SRP.FeatureDetect.intersectionObserver()) { fn(); return null; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            fn(entry.target);
            io.disconnect();
          }
        });
      }, { threshold: settings.threshold });
      io.observe(el);
      observers.push(io);
      return io;
    },

    destroyAll: function () {
      observers.forEach(function (io) { io.disconnect && io.disconnect(); });
      observers = [];
    }
  };

  window.SRP = window.SRP || {};
  SRP.Observers = Observers;
})();


/* --- assets/js/manager.js --- */
/* manager.js — AnimationManager: lifecycle, budget, queue, debug */
(function () {
  "use strict";

  var registry = {};
  var initialized = [];
  var triggerCount = 0;
  var gpuLayerCount = 0;

  var Manager = {
    /* moduleName -> { init, prepare, animate, idle, hover, destroy } */
    register: function (list) {
      list.forEach(function (name) {
        if (!SRP.Modules || !SRP.Modules[name]) {
          if (SRP.Debug) SRP.Debug.warn("Module not found:", name);
          return;
        }
        registry[name] = SRP.Modules[name];
      });
      return this;
    },

    has: function (name) { return !!registry[name]; },

    init: function () {
      Object.keys(registry).forEach(function (name) {
        var mod = registry[name];
        if (initialized.indexOf(name) !== -1) return;
        try {
          if (mod.prepare) mod.prepare();
          if (mod.init) mod.init();
          initialized.push(name);
          if (SRP.Debug) SRP.Debug.log("Module initialized:", name);
        } catch (e) {
          if (SRP.Debug) SRP.Debug.error("Module failed:", name, e);
        }
      });
      return this;
    },

    /* Queue-based sequencing: callbacks run in order after an event */
    queue: function (event, steps) {
      var i = 0;
      var next = function () {
        if (i < steps.length) {
          steps[i++]();
        }
      };
      SRP.EventBus.on(event, next);
      return this;
    },

    destroy: function () {
      initialized.forEach(function (name) {
        var mod = registry[name];
        try { if (mod.destroy) mod.destroy(); } catch (e) {}
      });
      initialized = [];
      if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
      if (SRP.Observers) SRP.Observers.destroyAll();
      if (SRP.Debug) SRP.Debug.log("Manager destroyed all modules");
    },

    /* ---- GPU / trigger budgets ---- */
    trackTrigger: function () {
      triggerCount++;
      var max = (SRP.MotionConfig || {}).budget ? SRP.MotionConfig.budget.maxConcurrentTriggers : 12;
      if (triggerCount > max && SRP.Debug) SRP.Debug.warn("Trigger budget exceeded:", triggerCount);
      return triggerCount;
    },

    claimLayer: function () {
      gpuLayerCount++;
      var max = (SRP.MotionConfig || {}).budget ? SRP.MotionConfig.budget.maxWillChange : 15;
      if (gpuLayerCount > max && SRP.Debug) SRP.Debug.warn("GPU layer budget exceeded:", gpuLayerCount);
      return gpuLayerCount;
    },

    releaseLayer: function () { gpuLayerCount = Math.max(0, gpuLayerCount - 1); },

    getStats: function () {
      return {
        modules: Object.keys(registry).length,
        initialized: initialized.length,
        triggers: triggerCount,
        gpuLayers: gpuLayerCount,
        fps: SRP.Performance ? Math.round(SRP.Performance.getFps()) : null,
        tier: SRP.Performance ? SRP.Performance.getTier() : null,
        level: SRP.FeatureDetect.animationLevel()
      };
    },

    debug: function () {
      if (!SRP.Debug || !SRP.Debug.enabled()) return;
      console.table(this.getStats());
    }
  };

  window.SRP = window.SRP || {};
  SRP.Manager = Manager;
})();


/* --- assets/js/routes.js --- */
/* ================================================================
 * FILE: assets/js/routes.js
 * SRP Page Routes & Navigation Registry
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  'use strict';

  var shared = ['loader', 'navbar', 'pageHero', 'footer'];

  // All 10 pages defined as per spec
  var ROUTES = {
    home: shared.concat(['hero', 'stats', 'chairman', 'showcase', 'offerings', 'startup-structure', 'mentors-home', 'partners', 'testimonials', 'gallery-preview', 'newsletter']),
    about: shared.concat(['aboutPage', 'values', 'trustees', 'impact-report', 'gallery', 'newsletter']),
    incubation: shared.concat(['pillars', 'whoApply', 'incPartners', 'faculty-startup', 'startup-structure']),
    coworking: shared.concat(['coFeatures', 'beyondDesk', 'coCta', 'gallery']),
    people: shared.concat(['peoplePage', 'mentors']),  // Aliased internally to Mentors if needed
    mentors: shared.concat(['mentorsPage']), // Keeping this if data-page='mentors'
    portfolio: shared.concat(['portfolioPage']),
    events: shared.concat(['eventsPage']),
    internships: shared.concat(['internshipsPage']),
    blog: shared.concat(['blogPage', 'newsletter']),
    contact: shared.concat(['contactPage'])
  };

  var current = (document.body && document.body.dataset && document.body.dataset.page) || 'home';
  var activeListeners = [];

  var Router = {
    // Expose the raw ROUTES object directly as requested by main.js
    // We merge the array directly onto the Router object so SRP.Routes['home'] works
    
    navigate: function(url) {
      if (window.SRP && window.SRP.EventBus && window.SRP.EventBus.emit) {
        window.SRP.EventBus.emit('route:change', url);
      }
      // Simple fallback navigation, actual view transition logic can hook into the event
      window.location.href = url;
    },

    init: function() {
      var links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
      var handleNav = function(e) {
        var href = this.getAttribute('href');
        // Prevent default only if it's not a special link
        if (href && !href.match(/^(mailto|tel|#)/) && this.target !== '_blank') {
          e.preventDefault();
          Router.navigate(href);
        }
      };

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', handleNav);
        activeListeners.push({ el: links[i], fn: handleNav });
      }
    },

    destroy: function() {
      for (var i = 0; i < activeListeners.length; i++) {
        var listener = activeListeners[i];
        listener.el.removeEventListener('click', listener.fn);
      }
      activeListeners = [];
    }
  };

  // Merge ROUTES keys into Router for backwards compatibility
  for (var key in ROUTES) {
    if (Object.prototype.hasOwnProperty.call(ROUTES, key)) {
      Router[key] = ROUTES[key];
    }
  }

  window.SRP = window.SRP || {};
  window.SRP.Routes = Router; // Exposes both Router methods and the Route array maps
  window.SRP.CurrentPage = current;
  window.SRP.Modules = window.SRP.Modules || {};
})();

