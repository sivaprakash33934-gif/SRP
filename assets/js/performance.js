/* performance.js — FPS monitor with Ultra / Medium / Lite tiers.
   Frame-time EMA (120Hz-safe): classification clamps to 60fps so high-refresh
   displays aren't misread. Downgrades fast, upgrades slowly (hysteresis). */
(function () {
  "use strict";

  var CONFIG = window.SRP && SRP.Config ? SRP.Config : {};

  var emaFrame = 1000 / 60;      /* ms per frame, EMA-smoothed */
  var tier = "ultra";
  var running = false;
  var rafId = null;
  var lastT = 0;
  var badChecks = 0;
  var goodChecks = 0;
  var downgradedAt = 0;

  var D_DOWN_MEDIUM = 50;   /* sustained fps below this -> medium */
  var D_DOWN_LITE = 35;     /* sustained fps below this -> lite */
  var D_UP = 57;            /* sustained fps above this -> upgrade */
  var DOWNGRADE_CHECKS = 2; /* consecutive bad samples to downgrade */
  var UPGRADE_CHECKS = 3;   /* consecutive good samples to upgrade */
  var UPGRADE_DWELL = 8000; /* min ms spent in a tier before upgrading */

  function measure() {
    rafId = requestAnimationFrame(measure);
    var now = performance.now();
    if (lastT) {
      var dt = now - lastT;
      if (dt > 0 && dt < 250) emaFrame = emaFrame * 0.85 + dt * 0.15;
    }
    lastT = now;
  }

  function fps() {
    var f = 1000 / emaFrame;
    return f > 60 ? 60 : f; /* classify against 60fps, not display refresh */
  }

  function applyTier(newTier) {
    if (newTier === tier) return;
    tier = newTier;
    document.body.classList.remove("tier-ultra", "tier-medium", "tier-lite");
    document.body.classList.add("tier-" + tier);
    if (newTier === "ultra") downgradedAt = 0;
    SRP.EventBus.emit("tier:change", tier);
    if (SRP.Debug) SRP.Debug.log("Performance tier ->", tier, "| fps ~", Math.round(fps()));
  }

  function check() {
    var f = fps();
    if (f < D_DOWN_LITE) {
      badChecks++; goodChecks = 0;
      if (badChecks >= DOWNGRADE_CHECKS) {
        badChecks = 0;
        downgradedAt = performance.now();
        applyTier("lite");
      }
    } else if (f < D_DOWN_MEDIUM) {
      badChecks++; goodChecks = 0;
      if (badChecks >= DOWNGRADE_CHECKS) {
        badChecks = 0;
        downgradedAt = performance.now();
        applyTier(tier === "lite" ? "lite" : "medium");
      }
    } else if (f >= D_UP) {
      goodChecks++; badChecks = 0;
      if (tier !== "ultra" && goodChecks >= UPGRADE_CHECKS &&
          performance.now() - downgradedAt >= UPGRADE_DWELL) {
        goodChecks = 0;
        applyTier("ultra");
      }
    } else {
      badChecks = 0; goodChecks = 0;
    }
  }

  var Performance = {
    start: function () {
      if (running) return;
      running = true;
      lastT = 0;
      measure();
    },

    stop: function () {
      running = false;
      cancelAnimationFrame(rafId);
      if (this._intervalId) { clearInterval(this._intervalId); this._intervalId = null; }
    },

    getTier: function () { return tier; },
    getFps: function () { return fps(); },

    /* Interval sampler */
    _intervalId: null,
    watch: function (interval) {
      this.start();
      if (this._intervalId) clearInterval(this._intervalId);
      this._intervalId = setInterval(function () {
        if (running) Performance.check();
      }, interval || 1500);
    },

    /* Feature flags effective for current tier */
    effects: function () {
      if (tier === "lite") {
        return { blur: false, particles: false, magnetic: false, glow: false, parallax: false, tilt: false, ambient: false };
      }
      if (tier === "medium") {
        /* Medium: keep light effects, drop per-frame scrub layers (parallax/tilt) */
        return { blur: true, particles: true, magnetic: true, glow: true, parallax: false, tilt: false, ambient: true };
      }
      return { blur: true, particles: true, magnetic: true, glow: true, parallax: true, tilt: true, ambient: true };
    }
  };

  /* Initial tier by hardware: touch/coarse screens start lean (medium),
     desktops start at ultra. This avoids a janky first interaction on mobile. */
  function initialTier() {
    var touch = (SRP.Dom && SRP.Dom.isTouch && SRP.Dom.isTouch()) ||
                (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    return touch ? "medium" : "ultra";
  }

  tier = initialTier();
  document.body.classList.add("tier-" + tier);

  window.SRP = window.SRP || {};
  SRP.Performance = Performance;
})();
