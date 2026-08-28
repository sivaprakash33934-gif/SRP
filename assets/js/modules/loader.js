/* ================================================================
 * FILE: assets/js/modules/loader.js
 * SRP Loader Component
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  "use strict";

  var loaderEl = null;
  var isDone = false;
  var loaderTimeout = null;
  var failsafeTimeout = null;
  var unsubs = [];

  function finish() {
    if (isDone) return;
    isDone = true;
    
    if (loaderEl) {
      loaderEl.classList.add("is-done");
    }
    document.body.classList.remove("no-scroll");
    
    if (window.SRP && window.SRP.EventBus && typeof window.SRP.EventBus.emit === "function") {
      window.SRP.EventBus.emit("loader:end");
    }
    
    // Remove element after fade out transition (typically ~600ms)
    setTimeout(function () {
      if (loaderEl && loaderEl.parentNode) {
        loaderEl.parentNode.removeChild(loaderEl);
      }
    }, 600);
    
    clearTimeouts();
  }

  function clearTimeouts() {
    if (loaderTimeout) {
      clearTimeout(loaderTimeout);
      loaderTimeout = null;
    }
    if (failsafeTimeout) {
      clearTimeout(failsafeTimeout);
      failsafeTimeout = null;
    }
  }

  function skip() {
    if (loaderEl) {
      loaderEl.style.display = "none";
    }
    finish();
  }

  function tryLoadLogo() {
    var logoContainer = loaderEl ? loaderEl.querySelector(".loader-logo") : null;
    if (!logoContainer) return;
    
    var img = new Image();
    img.onload = function() {
      // Only swap if loader isn't already done
      if (!isDone) {
        logoContainer.innerHTML = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        logoContainer.appendChild(img);
      }
    };
    // If error, do nothing, keep existing inline SVG
    img.src = "assets/svg/logos/srp-logo.svg";
  }

  function init() {
    loaderEl = window.SRP.Dom && window.SRP.Dom.$ ? window.SRP.Dom.$(".loader") : document.querySelector(".loader");
    if (!loaderEl) return;
    
    var cfg = window.CONFIG || (window.SRP && window.SRP.Config) || {};
    var duration = typeof cfg.LOADER_DURATION === 'number' ? cfg.LOADER_DURATION : 2200;
    
    if (cfg.ENABLE_LOADER === false) {
      skip();
      return;
    }
    
    var reduced = false;
    if (window.matchMedia) {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    if (document.body.classList.contains("reduced-motion")) {
      reduced = true;
    }
    
    if (reduced) {
      skip();
      return;
    }

    document.body.classList.add("no-scroll");
    
    if (window.SRP && window.SRP.EventBus) {
      if (typeof window.SRP.EventBus.emit === "function") {
        window.SRP.EventBus.emit("loader:start");
      }
      
      var unsubArrived = window.SRP.EventBus.on("transition:arrived", skip);
      if (unsubArrived) unsubs.push(unsubArrived);
      
      var unsubDone = window.SRP.EventBus.on("loader:done", finish);
      if (unsubDone) unsubs.push(unsubDone);
    }
    
    tryLoadLogo();

    loaderTimeout = setTimeout(finish, duration);
    failsafeTimeout = setTimeout(finish, 4000); // Failsafe absolute max
  }

  function destroy() {
    clearTimeouts();
    for (var i = 0; i < unsubs.length; i++) {
      if (typeof unsubs[i] === "function") unsubs[i]();
    }
    unsubs = [];
    isDone = false;
    loaderEl = null;
  }

  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.loader = { init: init, destroy: destroy };
})();
