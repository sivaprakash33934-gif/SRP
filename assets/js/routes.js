/* ================================================================
 * FILE: assets/js/routes.js
 * SRP Page Routes & Navigation Registry
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  'use strict';

  var shared = ['loader', 'navbar', 'pageHero', 'footer'];

  // All 10 pages defined as per spec
  var ROUTES = {
    home: shared.concat(['hero', 'stats', 'chairman', 'showcase', 'offerings', 'startup-structure', 'mentors-home', 'partners', 'testimonials', 'gallery-preview', 'newsletter']),
    about: shared.concat(['aboutPage', 'values', 'trustees', 'impact-report', 'gallery', 'newsletter']),
    incubation: shared.concat(['pillars', 'whoApply', 'incPartners', 'faculty-startup', 'startup-structure']),
    coworking: shared.concat(['coFeatures', 'beyondDesk', 'coCta', 'gallery']),
    people: shared.concat(['peoplePage', 'mentors']),  // Aliased internally to Mentors if needed
    mentors: shared.concat(['mentorsPage']), // Keeping this if data-page='mentors'
    portfolio: shared.concat(['portfolioPage']),
    events: shared.concat(['eventsPage']),
    internships: shared.concat(['internshipsPage']),
    blog: shared.concat(['blogPage', 'newsletter']),
    contact: shared.concat(['contactPage'])
  };

  var current = (document.body && document.body.dataset && document.body.dataset.page) || 'home';
  var activeListeners = [];

  var Router = {
    // Expose the raw ROUTES object directly as requested by main.js
    // We merge the array directly onto the Router object so SRP.Routes['home'] works
    
    navigate: function(url) {
      if (window.SRP && window.SRP.EventBus && window.SRP.EventBus.emit) {
        window.SRP.EventBus.emit('route:change', url);
      }
      // Simple fallback navigation, actual view transition logic can hook into the event
      window.location.href = url;
    },

    init: function() {
      var links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
      var handleNav = function(e) {
        var href = this.getAttribute('href');
        // Prevent default only if it's not a special link
        if (href && !href.match(/^(mailto|tel|#)/) && this.target !== '_blank') {
          e.preventDefault();
          Router.navigate(href);
        }
      };

      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('click', handleNav);
        activeListeners.push({ el: links[i], fn: handleNav });
      }
    },

    destroy: function() {
      for (var i = 0; i < activeListeners.length; i++) {
        var listener = activeListeners[i];
        listener.el.removeEventListener('click', listener.fn);
      }
      activeListeners = [];
    }
  };

  // Merge ROUTES keys into Router for backwards compatibility
  for (var key in ROUTES) {
    if (Object.prototype.hasOwnProperty.call(ROUTES, key)) {
      Router[key] = ROUTES[key];
    }
  }

  window.SRP = window.SRP || {};
  window.SRP.Routes = Router; // Exposes both Router methods and the Route array maps
  window.SRP.CurrentPage = current;
  window.SRP.Modules = window.SRP.Modules || {};
})();
