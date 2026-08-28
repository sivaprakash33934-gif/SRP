/* ================================================================
 * FILE: assets/js/manifest.js
 * SRP Asset & Module Manifest
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  'use strict';

  // Assets registry — READ ONLY, safe to freeze
  var Assets = Object.freeze({
    logo: "assets/svg/logos/logo.svg",
    logoMark: "assets/svg/logos/mark.svg",
    network: "assets/svg/backgrounds/network.svg",
    patternHero: "assets/svg/patterns/hero-grid.svg",
    patternDot: "assets/svg/patterns/dots.svg",
    dividerWave: "assets/svg/dividers/wave.svg",
    loaderLogo: "assets/loader/logo.svg",
    loaderParticles: "assets/loader/particles.svg",
    loaderNetwork: "assets/loader/network.svg"
  });

  // Modules registry — MUST BE MUTABLE (modules register themselves here)
  // DO NOT USE Object.freeze() on this!
  var Modules = {};

  // Page-to-module mapping — READ ONLY, safe to freeze
  var PageModules = Object.freeze({
    home: ['hero', 'stats', 'chairman', 'showcase', 'offerings',
           'startup-structure', 'mentors-home', 'partners',
           'testimonials', 'gallery-preview', 'newsletter'],
    about: ['about', 'values', 'trustees', 'impact-report', 'gallery', 'newsletter'],
    incubation: ['pillars', 'who-apply', 'inc-partners', 'faculty-startup',
                'startup-structure'],
    coworking: ['co-features', 'beyond-desk', 'co-cta', 'gallery'],
    people: ['people-page', 'mentors'],
    portfolio: ['portfolio-page'],
    events: ['events-page'],
    internships: ['internship-page'],
    blog: ['blog-page', 'newsletter'],
    contact: ['contact-page']
  });

  // Global modules loaded on every page
  var GlobalModules = Object.freeze([
    'loader', 'navbar', 'footer', 'cursor', 'magnetic',
    'progress-bar', 'page-transition', 'chatbot', 'performance'
  ]);

  window.SRP = window.SRP || {};
  window.SRP.Assets = Assets;           // frozen (read-only)
  window.SRP.Modules = Modules;         // NOT frozen (mutable — modules register here)
  window.SRP.PageModules = PageModules; // frozen (read-only)
  window.SRP.GlobalModules = GlobalModules; // frozen (read-only)
})();
