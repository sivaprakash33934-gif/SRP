/* modules/newsletter.js — newsletter: mask reveal + static success toast */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var form = SRP.Dom.$(".newsletter");
    if (!form) return;

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.fromTo(form, { autoAlpha: 0, y: 24 }, {
        autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
        scrollTrigger: { trigger: form, start: "top 90%", once: true }
      });
    }

    /* Static UI — show confirmation message only */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = SRP.Dom.$("input[type='email']", form);
      var msg = SRP.Dom.$(".newsletter-msg", form);
      if (input && !input.checkValidity()) {
        input.reportValidity();
        return;
      }
      if (msg) {
        msg.textContent = "You're on the list — see you at the next event!";
        msg.style.cssText = "color:#1565d8;font-weight:700;font-size:0.9rem;text-align:center;margin-top:14px;";
        form.reset();
      }
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.newsletter = { init: init };
})();
