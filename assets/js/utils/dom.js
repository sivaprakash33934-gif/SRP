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
