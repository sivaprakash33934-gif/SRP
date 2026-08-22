/* theme.js — JS-side color tokens (mirrors CSS :root) */
(function () {
  "use strict";

  var Theme = {
    primary: "#1565d8",
    primaryDark: "#0d3a85",
    primaryLight: "#2e7df2",
    accent: "#6ea8f7",
    silver: "#e4e7ec",
    glow: "rgba(46,125,242,0.25)",
    ink: "#0f1b33",
    slate: "#52607a",
    paper: "#ffffff",
    wash: "#f7fafd",
    gradPrimary: "linear-gradient(135deg, #1565d8 0%, #2e7df2 55%, #6ea8f7 100%)"
  };

  window.SRP = window.SRP || {};
  SRP.Theme = Theme;
})();
