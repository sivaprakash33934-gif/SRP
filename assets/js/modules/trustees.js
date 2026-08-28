(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;

  function init() {
    const cards = document.querySelectorAll('.trustees-section .trustee-card, .trustees-section .person-card');
    if (cards.length === 0) return;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const index = Array.from(cards).indexOf(card);
          card.style.transitionDelay = `${index * 0.2}s`;
          card.classList.add('is-visible');
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    document.querySelectorAll('.trustees-section .trustee-card, .trustees-section .person-card').forEach(card => {
      card.classList.remove('is-visible');
      card.style.transitionDelay = '';
    });
  }

  window.SRP.Modules.trustees = { init, destroy };
})();
