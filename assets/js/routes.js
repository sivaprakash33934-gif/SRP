/* routes.js — Per-page module registry keyed by <body data-page="..."> */
(function () {
  "use strict";

  var shared = ["loader", "navbar", "pageHero", "footer"];

  var ROUTES = {
    home: shared.concat(["hero", "stats", "showcase", "offerings", "partners", "testimonials"]),
    about: shared.concat(["aboutPage", "values", "peoplePreview"]),
    incubation: shared.concat(["pillars", "whoApply", "incPartners"]),
    coworking: shared.concat(["coFeatures", "beyondDesk", "gallery", "coCta"]),
    people: shared.concat(["peoplePage", "mentors"]),
    portfolio: shared.concat(["portfolioPage"]),
    events: shared.concat(["eventsPage", "newsletter"]),
    contact: shared.concat(["contactPage"])
  };

  var current = (document.body && document.body.dataset && document.body.dataset.page) || "home";

  window.SRP = window.SRP || {};
  SRP.Routes = ROUTES;
  SRP.CurrentPage = current;

  /* Default shared modules exist for every page */
  SRP.Modules = SRP.Modules || {};
})();
