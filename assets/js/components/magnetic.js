/* components/magnetic.js — magnetic buttons (quickTo: no per-move tween allocation) */
(function () {
  "use strict";

  var buttons = [];
  var handlers = [];

  function detach(btn) {
    for (var i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i].btn === btn) {
        btn.removeEventListener("mousemove", handlers[i].move);
        btn.removeEventListener("mouseleave", handlers[i].leave);
        handlers.splice(i, 1);
      }
    }
  }

  function setEnabled(on) {
    buttons.forEach(function (b) {
      if (!on) {
        if (window.gsap) gsap.killTweensOf(b);
        detach(b);
      }
    });
  }

  function init() {
    if (!window.SRP.Config.ENABLE_MAGNETIC) return;
    if (!SRP.Dom.isDesktop()) return;
    if (SRP.Dom.prefersReducedMotion()) return;
    if (!SRP.Performance.effects().magnetic) return;

    buttons = SRP.Dom.$$(".btn[data-magnetic], .hero-ctas .btn");
    buttons.forEach(function (btn) {
      var strength = parseFloat(btn.getAttribute("data-strength") || "0.3");
      if (window.gsap) {
        var qx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power2.out", force3D: true });
        var qy = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power2.out", force3D: true });
        var cachedRect = null;
        var move = function (e) {
          if (!cachedRect) return;
          qx((e.clientX - cachedRect.left - cachedRect.width / 2) * strength);
          qy((e.clientY - cachedRect.top - cachedRect.height / 2) * strength);
        };
        var enter = function () { cachedRect = btn.getBoundingClientRect(); };
        var leave = function () { cachedRect = null; qx(0); qy(0); };
        btn.addEventListener("mouseenter", enter);
        btn.addEventListener("mousemove", move);
        btn.addEventListener("mouseleave", leave);
        handlers.push({ btn: btn, move: move, leave: leave });
      } else {
        var movePlain = function (e) {
          var r = btn.getBoundingClientRect();
          btn.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * strength + "px, " +
            (e.clientY - r.top - r.height / 2) * strength + "px)";
        };
        var leavePlain = function () { btn.style.transform = ""; };
        btn.addEventListener("mousemove", movePlain);
        btn.addEventListener("mouseleave", leavePlain);
        handlers.push({ btn: btn, move: movePlain, leave: leavePlain });
      }
    });

    SRP.EventBus.on("tier:change", function () {
      setEnabled(SRP.Performance.effects().magnetic);
    });
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.Magnetic = { init: init };
})();
