(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;
  let rafIds = [];
  let countersFinished = 0;

  function init() {
    const statCards = document.querySelectorAll('.stat-card .stat-num, .stat-num');
    if (statCards.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = 2000;

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10) || 0;
          const suffix = el.getAttribute('data-suffix') || '';
          
          if (prefersReducedMotion) {
            el.textContent = target + suffix;
            countersFinished++;
            checkComplete(statCards.length);
          } else {
            let start = null;
            const step = (timestamp) => {
              if (!start) start = timestamp;
              const progress = Math.min((timestamp - start) / duration, 1);
              // ease-out
              const easeProgress = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(easeProgress * target);
              el.textContent = current + suffix;
              
              if (progress < 1) {
                const id = window.requestAnimationFrame(step);
                rafIds.push(id);
              } else {
                el.textContent = target + suffix;
                countersFinished++;
                checkComplete(statCards.length);
              }
            };
            const id = window.requestAnimationFrame(step);
            rafIds.push(id);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.1 });

    statCards.forEach(card => observer.observe(card));
  }

  function checkComplete(total) {
    if (countersFinished === total && window.SRP.EventBus) {
      window.SRP.EventBus.emit('stats:complete');
    }
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    rafIds.forEach(id => window.cancelAnimationFrame(id));
    rafIds = [];
    countersFinished = 0;
  }

  window.SRP.Modules.stats = { init, destroy };
})();
