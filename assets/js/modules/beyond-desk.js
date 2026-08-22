/* modules/beyondDesk.js — word-by-word scrub text reveal ("Beyond the desk") */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var el = SRP.Dom.$("[data-scrub-text]");
    if (!el) return;

    /* Wrap each word in a masked span */
    var words = el.textContent.trim().split(/\s+/);
    var frag = document.createDocumentFragment();
    words.forEach(function (w, i) {
      var span = SRP.Dom.createEl("span", "scrub-word");
      span.textContent = w;
      span.style.cssText = "display:inline-block;opacity:.12;transition:opacity .4s ease;margin-right:.28em;";
      frag.appendChild(span);
    });
    el.textContent = "";
    el.appendChild(frag);

    if (SRP.FeatureDetect.gsap()) {
      SRP.Manager.trackTrigger();
      gsap.to(el.querySelectorAll(".scrub-word"), {
        opacity: 1,
        ease: "none",
        stagger: 0.02,
        scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 40%", scrub: 0.5 }
      });
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.beyondDesk = { init: init };
})();
