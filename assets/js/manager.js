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
