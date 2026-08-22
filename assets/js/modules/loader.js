/* modules/loader.js — lightweight brand reveal (~600ms) */
(function () {
  "use strict";

  var CONFIG = window.SRP && SRP.Config ? SRP.Config : {};
  var loaderEl = null;
  var isDone = false;

  function finish() {
    if (isDone) return;
    isDone = true;
    if (loaderEl) loaderEl.classList.add("is-done");
    document.body.classList.remove("no-scroll");
    SRP.EventBus.emit("loader:end");
    setTimeout(function () { if (loaderEl) loaderEl.remove(); }, 600);
  }

  function skip() {
    if (loaderEl) loaderEl.style.display = "none";
    finish();
  }

  function init() {
    loaderEl = SRP.Dom.$(".loader");
    if (!loaderEl) return;

    document.body.classList.add("no-scroll");

    /* Skipped when arriving via page transition */
    SRP.EventBus.on("transition:arrived", skip);

    var t = setTimeout(finish, CONFIG.LOADER_DURATION || 600);
    SRP.EventBus.on("loader:done", function () { clearTimeout(t); finish(); });
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.loader = { init: init };
})();
