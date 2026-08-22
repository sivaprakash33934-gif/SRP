/* modules/portfolioPage.js — SIGNATURE (Portfolio): featured depth cards + filterable grid */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var activeCategory = "all";

  function animateGrid() {
    var cards = SRP.Dom.$$(".startup-card:not(.is-hidden)");
    if (!cards.length) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(cards, { autoAlpha: 0, y: 32 }, {
        autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.06,
        overwrite: true
      });
    } else {
      SRP.Observers.reveal(cards, { stagger: 0.06 });
    }
  }

  function init() {
    /* Featured: 3D depth entrance */
    var feat = SRP.Dom.$$(".feat-card");
    if (feat.length) {
      SRP.Motion.depth.depthReveal(feat, { z: -50, rotateX: 6, stagger: 0.15 });
    }

    /* Grid: initial reveal */
    var grid = SRP.Dom.$("[data-filter-grid]");
    var pills = SRP.Dom.$$(".filter-pill");
    if (!grid) return;

    SRP.Observers.inView(grid, animateGrid, { threshold: 0.05 });

    /* Category filtering */
    pills.forEach(function (pill) {
      pill.setAttribute("role", "button");
      pill.addEventListener("click", function () {
        if (pill.classList.contains("is-active")) return;
        pills.forEach(function (p) {
          p.classList.toggle("is-active", p === pill);
          p.setAttribute("aria-pressed", p === pill ? "true" : "false");
        });

        activeCategory = pill.getAttribute("data-filter") || "all";
        SRP.Dom.$$(".startup-card", grid).forEach(function (card) {
          var cats = (card.getAttribute("data-cats") || "all").split(",");
          var show = activeCategory === "all" || cats.indexOf(activeCategory) !== -1;
          card.classList.toggle("is-hidden", !show);
        });
        SRP.EventBus.emit("filter:changed", activeCategory);
        animateGrid();
      });
      pill.setAttribute("aria-pressed", pill.classList.contains("is-active") ? "true" : "false");
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.portfolioPage = { init: init };
})();
