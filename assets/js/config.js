/* ================================================================
 * FILE: assets/js/config.js
 * SRP Configuration — Global Variable Pattern (vanilla JS)
 * NOTE: No ES module exports — loaded via plain <script defer> tag
 * SRP Rule 1.1: All values readonly via Object.freeze()
 * ================================================================ */

(function () {
  'use strict';

  var CONFIG = Object.freeze({
    DEBUG: false,
    ENABLE_LOADER: true,
    ENABLE_CURSOR: true,
    ENABLE_MAGNETIC: true,
    ENABLE_TILT: true,
    ENABLE_PARTICLES: false,
    ENABLE_PARALLAX: true,
    ENABLE_PROGRESS_BAR: true,
    ENABLE_PAGE_TRANSITION: true,
    ENABLE_GLASS: true,
    ENABLE_AMBIENT: true,
    ENABLE_CHATBOT: false,
    LOADER_DURATION: 800,
    PARTICLE_CAP: 60,
    GPU_LAYER_BUDGET: 15,
    BLUR_LAYER_BUDGET: 4
  });

  // Expose globally for all modules loaded via plain <script> tags
  window.SRP = window.SRP || {};
  window.SRP.Config = CONFIG;
  window.CONFIG = CONFIG;
})();
