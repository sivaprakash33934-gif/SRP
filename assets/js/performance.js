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
