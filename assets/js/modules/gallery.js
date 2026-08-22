/* modules/gallery.js — SIGNATURE (Coworking): 5 tiles, directional reveals */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  /* [left, bottom, right, scale, rotate] — per requirement */
  var dirs = ["left", "bottom", "right", "scale", "rotate"];

  function init() {
    var tiles = SRP.Dom.$$(".gallery-tile");
    if (!tiles.length) return;

    if (!SRP.FeatureDetect.gsap()) {
      SRP.Observers.reveal(tiles, { stagger: 0.1 });
      return;
    }

    SRP.Manager.trackTrigger();
    var tl = gsap.timeline({
      defaults: { duration: M().duration.medium, ease: M().easing.entrance },
      scrollTrigger: { trigger: tiles[0].parentElement, start: "top 82%", once: true }
    });

    tiles.forEach(function (tile, i) {
      var from = { autoAlpha: 0 };
      switch (dirs[i % dirs.length]) {
        case "left": from.x = -70; break;
        case "right": from.x = 70; break;
        case "bottom": from.y = 70; break;
        case "scale": from.scale = 0.8; break;
        case "rotate": from.rotation = 6; break;
      }
      tl.fromTo(tile, from, { autoAlpha: 1, x: 0, y: 0, scale: 1, rotation: 0 }, "+=0.05");
    });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.gallery = { init: init };
})();
