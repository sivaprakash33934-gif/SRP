/* event-bus.js — Tiny pub/sub for decoupled modules */
(function () {
  "use strict";

  var handlers = {};

  var EventBus = {
    on: function (event, fn) {
      (handlers[event] = handlers[event] || []).push(fn);
      return this;
    },
    off: function (event, fn) {
      var list = handlers[event];
      if (!list) return this;
      handlers[event] = list.filter(function (h) { return h !== fn; });
      return this;
    },
    emit: function (event, payload) {
      var list = handlers[event];
      if (!list) return this;
      list.slice().forEach(function (fn) {
        try { fn(payload); } catch (e) {
          if (window.SRP && SRP.Debug) SRP.Debug.error("EventBus '" + event + "':", e);
        }
      });
      return this;
    }
  };

  window.SRP = window.SRP || {};
  SRP.EventBus = EventBus;
})();
