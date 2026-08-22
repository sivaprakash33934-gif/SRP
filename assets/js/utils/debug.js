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
