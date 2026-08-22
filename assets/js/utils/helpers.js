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
