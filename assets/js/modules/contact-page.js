/* modules/contactPage.js — split layout slide + map pin drop + socials stagger */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var formCard = SRP.Dom.$(".contact-form-card");
    var infoCard = SRP.Dom.$(".contact-info-card");
    var map = SRP.Dom.$(".map-frame");
    var socials = SRP.Dom.$$(".socials .social-link");

    if (SRP.FeatureDetect.gsap()) {
      var tl = gsap.timeline({ defaults: { ease: M().easing.entrance, duration: M().duration.slow } });
      if (formCard) tl.fromTo(formCard, { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0 }, 0);
      if (infoCard) tl.fromTo(infoCard, { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0 }, 0);
      if (tl.duration() > 0) {
        tl.scrollTrigger = ScrollTrigger.create({ trigger: SRP.Dom.$(".split"), start: "top 80%", once: true });
        tl.pause();
        ScrollTrigger.create({
          trigger: SRP.Dom.$(".split"), start: "top 80%", once: true,
          onEnter: function () { tl.play(); }
        });
      }
    } else {
      if (formCard) { formCard.classList.add("reveal-l"); SRP.Observers.reveal(formCard); }
      if (infoCard) { infoCard.classList.add("reveal-r"); SRP.Observers.reveal(infoCard); }
    }

    /* Map pin drop is pure CSS (pinDrop keyframe) — nothing needed here */

    /* Contact form: static UI with validation + success message */
    var form = SRP.Dom.$("#contact-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = SRP.Dom.$("#cf-name");
        var email = SRP.Dom.$("#cf-email");
        var msg = SRP.Dom.$("#cf-message");
        var out = SRP.Dom.$(".form-msg", form);
        if (name && !name.checkValidity()) { name.reportValidity(); return; }
        if (email && !email.checkValidity()) { email.reportValidity(); return; }
        if (msg && !msg.checkValidity()) { msg.reportValidity(); return; }
        if (out) {
          out.textContent = "Thanks, " + (name && name.value ? name.value : "there") + "! Your message has been noted — we'll get back to you soon.";
          out.style.color = "#1565d8";
          out.style.fontWeight = "700";
        }
        form.reset();
      });
    }

    if (socials.length) {
      if (SRP.FeatureDetect.gsap()) {
        SRP.Manager.trackTrigger();
        gsap.fromTo(socials, { autoAlpha: 0, scale: 0.6 }, {
          autoAlpha: 1, scale: 1, duration: M().duration.fast, ease: "back.out(2)", stagger: 0.08,
          scrollTrigger: { trigger: socials[0], start: "top 90%", once: true }
        });
      }
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.contactPage = { init: init };
})();
