/* modules/footer.js — footer rise + fade, network line draw-in, year stamp */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var footer = SRP.Dom.$(".site-footer");
    if (!footer) return;

    /* Current year */
    SRP.Dom.$$("[data-year]", footer).forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    if (SRP.FeatureDetect.gsap()) {
      gsap.fromTo(footer, { y: 60, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: M().duration.medium, ease: M().easing.entrance,
        scrollTrigger: { trigger: footer, start: "top 95%", once: true }
      });

    } else {
      footer.classList.add("reveal");
      SRP.Observers.reveal(footer);
    }

    /* Social glow handled by CSS hover; nothing else needed */
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.footer = { init: init };
})();
