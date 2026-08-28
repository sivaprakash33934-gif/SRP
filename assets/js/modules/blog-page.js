(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let pillListeners = [];
  let observer = null;

  function init() {
    const pills = document.querySelectorAll('.filter-pill');
    const cards = document.querySelectorAll('.article-card, .blog-card');
    
    // Filtering
    if (pills.length > 0 && cards.length > 0) {
      pills.forEach(pill => {
        const handler = () => {
          pills.forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          
          const filter = pill.getAttribute('data-filter');
          let visibleIndex = 0;
          
          cards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              card.style.display = '';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transitionDelay = `${visibleIndex * 100}ms`;
                visibleIndex++;
              }, 10);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(20px)';
              card.style.transitionDelay = '0ms';
              setTimeout(() => {
                if (!card.style.opacity || card.style.opacity === '0') {
                  card.style.display = 'none';
                }
              }, 400); // Wait for fade out
            }
          });
        };
        pill.addEventListener('click', handler);
        pillListeners.push({ pill, handler });
      });
    }

    // Initial Stagger Reveal via Observer
    if (cards.length > 0) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const index = Array.from(cards).indexOf(card);
            card.style.transitionDelay = `${index * 100}ms`;
            card.classList.add('is-visible');
            observer.unobserve(card);
          }
        });
      }, { threshold: 0.1 });

      cards.forEach(card => observer.observe(card));
    }
  }

  function destroy() {
    pillListeners.forEach(({ pill, handler }) => {
      pill.removeEventListener('click', handler);
    });
    pillListeners = [];
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  window.SRP.Modules['blog-page'] = { init, destroy };
})();
