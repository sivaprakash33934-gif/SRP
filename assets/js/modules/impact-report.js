(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;
  let rafIds = [];
  let timeouts = [];
  let btnListener = null;
  let downloadBtn = null;

  function init() {
    // 1. Counters
    const statCards = document.querySelectorAll('.impact-section [data-count]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = 2000;

    if (statCards.length > 0) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10) || 0;
            const suffix = el.getAttribute('data-suffix') || '';
            
            if (prefersReducedMotion) {
              el.textContent = target + suffix;
            } else {
              let start = null;
              const step = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(easeProgress * target);
                el.textContent = current + suffix;
                
                if (progress < 1) {
                  rafIds.push(window.requestAnimationFrame(step));
                } else {
                  el.textContent = target + suffix;
                }
              };
              rafIds.push(window.requestAnimationFrame(step));
            }
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.1 });

      statCards.forEach(card => observer.observe(card));
    }

    // 2. Download Button
    downloadBtn = document.querySelector('.impact-download-btn, .impact-section .btn-primary');
    if (downloadBtn) {
      btnListener = (e) => {
        downloadBtn.classList.add('is-loading');
        timeouts.push(setTimeout(() => {
          downloadBtn.classList.remove('is-loading');
          downloadBtn.classList.add('is-success');
          const originalText = downloadBtn.textContent;
          downloadBtn.textContent = '✓ Downloading!';
          
          timeouts.push(setTimeout(() => {
            downloadBtn.classList.remove('is-success');
            downloadBtn.textContent = originalText;
          }, 3000));
        }, 600));
      };
      downloadBtn.addEventListener('click', btnListener);
    }
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    rafIds.forEach(id => window.cancelAnimationFrame(id));
    rafIds = [];
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    if (downloadBtn && btnListener) {
      downloadBtn.removeEventListener('click', btnListener);
      downloadBtn = null;
      btnListener = null;
    }
  }

  window.SRP.Modules['impact-report'] = { init, destroy };
})();
