/* components/hover.js — unified hover: silver edge sweep + lift + soft glow.
   Tilt is applied only to elements with [data-tilt]. */
(function () {
  "use strict";

  function init() {
    /* Silver edge sweep is pure CSS via .card::before — nothing to do here.
       This component wires the optional 3D tilt + parallax-glow extras. */

    SRP.Dom.$$("[data-tilt]").forEach(function (el) {
      SRP.Motion.depth.tilt([el], { max: parseFloat(el.getAttribute("data-tilt-max") || "5") });
    });
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.Hover = { init: init };
})();
