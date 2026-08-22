/* modules/mentors.js — mentor carousel: scroll-snap swipe + keyboard nav */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var row = SRP.Dom.$(".mentor-row");
    var cells = SRP.Dom.$$(".mentor-cell");
    if (!row || !cells.length) return;

    /* Entrance: quiet stagger */
    if (SRP.FeatureDetect.gsap()) {
      gsap.fromTo(cells, { autoAlpha: 0, y: 30 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        stagger: 0.04,
        scrollTrigger: { trigger: row, start: "top 85%", once: true }
      });
    } else {
      SRP.Observers.reveal(cells, { stagger: 0.04 });
    }

    /* Keyboard navigation: arrow keys move focus + scroll */
    row.setAttribute("tabindex", "0");
    row.setAttribute("role", "list");
    row.setAttribute("aria-label", "Mentors carousel");
    cells.forEach(function (c) { c.setAttribute("role", "listitem"); });

    row.addEventListener("keydown", function (e) {
      var step = cells[0].offsetWidth + 26;
      if (e.key === "ArrowRight") { row.scrollBy({ left: step, behavior: "smooth" }); e.preventDefault(); }
      if (e.key === "ArrowLeft") { row.scrollBy({ left: -step, behavior: "smooth" }); e.preventDefault(); }
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.mentors = { init: init };
})();
