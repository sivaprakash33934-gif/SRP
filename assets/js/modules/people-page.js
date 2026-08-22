/* modules/peoplePage.js — SIGNATURE (People): leadership split, directors wave, advisors, core team */
(function () {
  "use strict";

  var M = function () { return window.SRP.MotionConfig; };

  function init() {
    var leadership = SRP.Dom.$$(".leadership-card");
    if (leadership.length) {
      if (SRP.FeatureDetect.gsap()) {
        SRP.Manager.trackTrigger();
        gsap.fromTo(leadership, { autoAlpha: 0, scale: 0.9 }, {
          autoAlpha: 1, scale: 1, duration: M().duration.slow, ease: M().easing.entrance,
          stagger: 0.15,
          scrollTrigger: { trigger: leadership[0].parentElement, start: "top 85%", once: true }
        });
      } else {
        SRP.Observers.reveal(leadership, { stagger: 0.15 });
      }
    }

    /* Directors: 12-card wave cascade */
    var directors = SRP.Dom.$$(".director-card");
    if (directors.length) {
      SRP.Motion.wave.waveReveal(directors, { dist: 56, stagger: 0.05 });
    }

    /* Advisors: quiet float */
    var advisors = SRP.Dom.$$(".advisor-card");
    if (advisors.length) {
      if (SRP.FeatureDetect.gsap()) {
        gsap.fromTo(advisors, { autoAlpha: 0, y: 40 }, {
          autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: { trigger: advisors[0].parentElement, start: "top 85%", once: true }
        });
      } else {
        SRP.Observers.reveal(advisors, { stagger: 0.1 });
      }
    }

    /* Core team: quiet stagger */
    var team = SRP.Dom.$$(".team-card");
    if (team.length) {
      if (SRP.FeatureDetect.gsap()) {
        gsap.fromTo(team, { autoAlpha: 0, y: 36 }, {
          autoAlpha: 1, y: 0, duration: M().duration.medium, ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: { trigger: team[0].parentElement, start: "top 85%", once: true }
        });
      } else {
        SRP.Observers.reveal(team, { stagger: 0.06 });
      }
    }
  }

  window.SRP = window.SRP || {};
  SRP.Modules = SRP.Modules || {};
  SRP.Modules.peoplePage = { init: init };
})();
