/* components/progress-bar.js — thin gradient scroll progress bar */
(function () {
  "use strict";

  var bar = null;

  function init() {
    if (!window.SRP.Config.ENABLE_PROGRESS_BAR) return;
    if (SRP.Dom.prefersReducedMotion()) return;

    bar = SRP.Dom.createEl("div", "progress-bar");
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var ticking = false;
    var setScale = null;
    if (window.gsap) setScale = gsap.quickTo(bar, "scaleX", { duration: 0.15, ease: "power2.out" });
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      if (setScale) setScale(p);
      else bar.style.transform = "scaleX(" + p + ")";
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.ProgressBar = { init: init };
})();
