(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let pillListeners = [];

  function init() {
    const pills = document.querySelectorAll('.faculty-section .filter-pill');
    const cards = document.querySelectorAll('.faculty-section .faculty-card');
    
    if (pills.length === 0 || cards.length === 0) return;

    pills.forEach(pill => {
      const handler = () => {
        // Update active pill
        pills.forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        
        const filter = pill.getAttribute('data-filter');
        
        // Filter cards
        let visibleIndex = 0;
        cards.forEach(card => {
          const dept = card.getAttribute('data-dept');
          if (filter === 'all' || dept === filter) {
            // Show
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            card.style.pointerEvents = 'auto';
            card.style.transitionDelay = `${visibleIndex * 100}ms`;
            visibleIndex++;
          } else {
            // Hide
            card.style.opacity = '0';
            card.style.transform = 'scale(0.92)';
            card.style.pointerEvents = 'none';
            card.style.transitionDelay = '0ms';
          }
        });
      };
      pill.addEventListener('click', handler);
      pillListeners.push({ pill, handler });
    });
  }

  function destroy() {
    pillListeners.forEach(({ pill, handler }) => {
      pill.removeEventListener('click', handler);
    });
    pillListeners = [];
  }

  window.SRP.Modules['faculty-startup'] = { init, destroy };
})();
