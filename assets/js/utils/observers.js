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
