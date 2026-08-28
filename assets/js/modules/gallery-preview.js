(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;
  let trigger = null;

  function init() {
    const tiles = document.querySelectorAll('.gallery-tile');
    if (tiles.length === 0) return;

    // Stagger reveal
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const tile = entry.target;
          const index = Array.from(tiles).indexOf(tile);
          tile.style.transitionDelay = `${index * 0.12}s`;
          tile.classList.add('is-visible');
          observer.unobserve(tile);
        }
      });
    }, { threshold: 0.1 });

    tiles.forEach(tile => observer.observe(tile));

    // Parallax on tall tile
    const isLite = window.SRP.Performance && window.SRP.Performance.getTier && window.SRP.Performance.getTier() === 'lite';
    const enableParallax = window.CONFIG ? window.CONFIG.ENABLE_PARALLAX : true;
    
    if (enableParallax && !isLite && window.gsap && window.ScrollTrigger) {
      const tallTile = document.querySelector('.gallery-tile.tall');
      if (tallTile) {
        trigger = window.ScrollTrigger.create({
          trigger: tallTile,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          animation: window.gsap.fromTo(tallTile, { yPercent: -10 }, { yPercent: 10, ease: 'none' })
        });
      }
    }
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (trigger) {
      trigger.kill();
      trigger = null;
    }
    document.querySelectorAll('.gallery-tile').forEach(tile => {
      tile.classList.remove('is-visible');
      tile.style.transitionDelay = '';
    });
  }

  window.SRP.Modules['gallery-preview'] = { init, destroy };
})();
