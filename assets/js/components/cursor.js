/* components/cursor.js — custom cursor (desktop only, idle-safe writes) */
(function () {
  "use strict";

  var dot, ring, x = 0, y = 0, ringX = 0, ringY = 0, visible = false, running = false, rafId = 0;

  function loop() {
    ringX = SRP.Helpers.lerp(ringX, x, 0.18);
    ringY = SRP.Helpers.lerp(ringY, y, 0.18);
    /* Skip style writes when the ring has settled — avoids paint every frame */
    if (ring && (Math.abs(ringX - x) > 0.4 || Math.abs(ringY - y) > 0.4)) {
      ring.style.transform = "translate(" + ringX + "px, " + ringY + "px) translate(-50%, -50%)";
    }
    /* Update dot in rAF (avoids unthrottled mousemove writes) */
    if (dot && visible && (Math.abs(x) > 0.4 || Math.abs(y) > 0.4)) {
      dot.style.transform = "translate(" + x + "px, " + y + "px) translate(-50%, -50%)";
    }
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    running = false;
    if (dot) { dot.style.opacity = "0"; }
    if (ring) { ring.style.opacity = "0"; }
    visible = false;
    document.body.classList.remove("has-cursor");
  }

  function init() {
    if (!window.SRP.Config.ENABLE_CURSOR) return;
    if (!SRP.Dom.isDesktop()) return;
    if (SRP.Dom.prefersReducedMotion()) return;
    if (!SRP.FeatureDetect.intersectionObserver()) return;

    dot = SRP.Dom.createEl("div", "cursor-dot");
    ring = SRP.Dom.createEl("div", "cursor-ring");
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("has-cursor");

    window.addEventListener("mousemove", function (e) {
      x = e.clientX;
      y = e.clientY;
      if (!visible) { visible = true; dot.style.opacity = "1"; ring.style.opacity = "1"; }
    });

    if (!running) {
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest ? e.target.closest("a, button, [role='button'], .filter-pill, .card") : null;
      if (t && ring) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      var t = e.target.closest ? e.target.closest("a, button, [role='button'], .filter-pill, .card") : null;
      if (t && ring) ring.classList.remove("is-hover");
    });

    document.addEventListener("mousedown", function () { if (ring) ring.classList.add("is-click"); });
    document.addEventListener("mouseup", function () { if (ring) ring.classList.remove("is-click"); });

    document.addEventListener("mouseleave", function () {
      if (dot) dot.style.opacity = "0";
      if (ring) ring.style.opacity = "0";
      visible = false;
    });

    SRP.EventBus.on("tier:change", function () {
      if (SRP.Performance.getTier() === "lite") stop();
    });
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.Cursor = { init: init, destroy: stop };
})();
