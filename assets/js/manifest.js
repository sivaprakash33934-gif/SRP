/* manifest.js — Asset paths (never hardcode paths elsewhere) */
(function () {
  "use strict";

  var Assets = {
    logo: "assets/svg/logos/logo.svg",
    logoMark: "assets/svg/logos/mark.svg",
    network: "assets/svg/backgrounds/network.svg",
    patternHero: "assets/svg/patterns/hero-grid.svg",
    patternDot: "assets/svg/patterns/dots.svg",
    dividerWave: "assets/svg/dividers/wave.svg",
    loaderLogo: "assets/loader/logo.svg",
    loaderParticles: "assets/loader/particles.svg",
    loaderNetwork: "assets/loader/network.svg"
  };

  window.SRP = window.SRP || {};
  SRP.Assets = Assets;
})();
