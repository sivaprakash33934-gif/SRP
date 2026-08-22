/* config.js — Global feature toggles */
(function () {
  "use strict";

  var CONFIG = {
    DEBUG: false,

    ENABLE_LOADER: true,
    ENABLE_CURSOR: true,
    ENABLE_MAGNETIC: true,
    ENABLE_TILT: true,
    ENABLE_PARTICLES: true,
    ENABLE_PARALLAX: true,
    ENABLE_PROGRESS_BAR: true,
    ENABLE_PAGE_TRANSITION: true,
    ENABLE_GLASS: true,
    ENABLE_AMBIENT: true,

    LOADER_DURATION: 600,
    PARTICLE_CAP: 60,
    GPU_LAYER_BUDGET: 15,
    BLUR_LAYER_BUDGET: 2
  };

  window.SRP = window.SRP || {};
  SRP.Config = CONFIG;
})();
