/* modules/showcase.js — THE pinned section: horizontal scroll with snap + glow */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  var activeTriggers = [];
  var activeTweens = [];

  function killAll() {
    activeTweens.forEach(function (t) {
      if (t.scrollTrigger) t.scrollTrigger.kill();
      t.kill();
    });
    activeTweens = [];
    activeTriggers = [];
  }

  function getScrollWidth(viewport) {
    var padLeft = parseFloat(getComputedStyle(viewport).paddingLeft) || 0;
    return viewport.scrollWidth - viewport.clientWidth - padLeft;
  }

  function init() {
    var section = SRP.Dom.$(".showcase");
    var viewport = SRP.Dom.$(".showcase-viewport");
    var cards = SRP.Dom.$$(".showcase-card");
    if (!section || !viewport || !cards.length) return;

    /* Progressive: non-GSAP devices get a simple fade reveal instead of pinning */
    if (!SRP.FeatureDetect.gsap() || SRP.Dom.prefersReducedMotion() || !M().pin.enabled) {
      cards.forEach(function (c) { c.classList.add("reveal"); });
      SRP.Observers.reveal(cards, { stagger: 0.1 });
      return;
    }

    if (!SRP.Dom.isDesktop()) {
      /* Mobile: scroll-snap swipe handled by CSS; simple entrance here */
      cards.forEach(function (c) { c.classList.add("reveal"); });
      SRP.Observers.reveal(cards, { stagger: 0.1 });
      return;
    }

    SRP.Manager.trackTrigger();

    /* Disable CSS transitions on cards while scrub drives their transforms */
    viewport.classList.add("is-pinning");

    var activeIndex = -1;
    var scaleCache = new Array(cards.length).fill(0.92);
    var track = gsap.to(viewport, {
      x: function () { return -getScrollWidth(viewport); },
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: function () { return "+=" + getScrollWidth(viewport); },
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var progress = self.progress;
          var newActive = -1;
          for (var i = 0; i < cards.length; i++) {
            var mid = (i + 0.5) / cards.length;
            var dist = Math.abs(progress - mid);
            if (dist < 0.09) newActive = i;
            var isActive = dist < 0.09;
            if (isActive) {
              if (scaleCache[i] !== 1) {
                cards[i].style.transform = "scale(1)";
                scaleCache[i] = 1;
              }
            } else {
              var s = 1 - dist * 0.12;
              if (scaleCache[i] !== s) {
                cards[i].style.transform = "scale(" + s.toFixed(3) + ")";
                scaleCache[i] = s;
              }
            }
          }
          if (newActive !== activeIndex) {
            if (activeIndex >= 0) cards[activeIndex].classList.remove("is-active");
            if (newActive >= 0) cards[newActive].classList.add("is-active");
            activeIndex = newActive;
          }
        }
      }
    });

    activeTweens.push(track);
    if (track.scrollTrigger) activeTriggers.push(track.scrollTrigger);
  }

  function destroy() {
    killAll();
    var viewport = SRP.Dom.$(".showcase-viewport");
    if (viewport) viewport.classList.remove("is-pinning");
    var cards = SRP.Dom.$$(".showcase-card");
    cards.forEach(function (c) {
      c.classList.remove("is-active");
      c.style.transform = "";
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.showcase = { init: init, destroy: destroy };
})();
