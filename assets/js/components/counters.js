/* components/counters.js — count-up numbers with particle burst */
(function () {
  "use strict";

  var PARTICLE_CAP = window.SRP && SRP.Config ? SRP.Config.PARTICLE_CAP : 60;

  var pool = [];
  var POOL_SIZE = 8;
  var poolReady = false;

  function initPool() {
    if (poolReady) return;
    for (var i = 0; i < POOL_SIZE; i++) {
      var p = SRP.Dom.createEl("span", "burst");
      p.style.cssText = "position:fixed;pointer-events:none;z-index:9999;display:none;";
      document.body.appendChild(p);
      pool.push(p);
    }
    poolReady = true;
  }

  function burst(el) {
    if (!window.SRP.Config.ENABLE_PARTICLES) return;
    if (!SRP.Performance.effects().particles) return;
    initPool();
    var rect = el.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var count = Math.min(POOL_SIZE, PARTICLE_CAP / 8);
    for (var i = 0; i < count; i++) {
      var p = pool[i];
      p.style.left = (cx + (Math.random() - 0.5) * 40) + "px";
      p.style.top = (cy + (Math.random() - 0.5) * 20) + "px";
      p.style.setProperty("--dx", SRP.Helpers.rand(-46, 46) + "px");
      p.style.setProperty("--dy", SRP.Helpers.rand(-64, -24) + "px");
      p.style.display = "block";
      p.style.animation = "none";
      void p.offsetWidth;
      p.style.animation = "";
      (function (particle) {
        setTimeout(function () { particle.style.display = "none"; }, 1000);
      })(p);
    }
  }

  function animate(el, from, to, suffix, duration, onDone) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3); /* cubic out */
      var val = Math.round(from + (to - from) * eased);
      el.textContent = SRP.Helpers.formatNum(val) + (suffix || "");
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (onDone) {
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function init(targets) {
    var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;
    els.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count") || "0");
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = parseInt(el.getAttribute("data-duration") || "1600", 10);
      var card = el.closest(".stat-card, .card");

      var run = function () {
        animate(el, 0, target, suffix, duration, function () {
          if (card) burst(card);
        });
      };

      if (SRP.Observers) {
        SRP.Observers.inView(el, run, { threshold: 0.6 });
      } else {
        run();
      }
    });
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.Counters = { init: init };
})();
