/* modules/page-hero.js — shared masked header reveal for all interior pages */
(function () {
  "use strict";

  function init() {
    var hero = SRP.Dom.$(".page-hero");
    if (!hero) return;
    SRP.Motion.mask.textReveal([hero]);
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.pageHero = { init: init };
})();
