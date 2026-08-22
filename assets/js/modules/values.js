/* modules/values.js — three value cards: single depth group (quiet 3D) */
(function () {
  "use strict";

  function init() {
    var cards = SRP.Dom.$$(".value-card");
    if (!cards.length) return;
    SRP.Motion.depth.depthReveal(cards, { z: -40, rotateX: 5, stagger: 0.12 });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.values = { init: init };
})();
