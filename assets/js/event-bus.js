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
