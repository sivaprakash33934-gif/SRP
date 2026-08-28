(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let observer = null;
  let listeners = [];
  let unsubTier = null;

  function init() {
    const cards = document.querySelectorAll('.mentor-card-enhanced');
    if (cards.length === 0) return;

    const isLite = window.SRP.Performance && window.SRP.Performance.getTier && window.SRP.Performance.getTier() === 'lite';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enableTilt = window.CONFIG && window.CONFIG.ENABLE_TILT !== false;

    // Reveal Observer
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const index = Array.from(cards).indexOf(card);
          card.style.transitionDelay = `${index * 0.1}s`;
          card.classList.add('is-visible');
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));

    // Tilt effect
    if (enableTilt && !isLite && !prefersReducedMotion && window.gsap) {
      cards.forEach(card => {
        const onMouseMove = (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;
          
          window.gsap.to(card, { rotationX: rotateX, rotationY: rotateY, duration: 0.3, overwrite: 'auto' });
        };
        
        const onMouseLeave = () => {
          window.gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.4, overwrite: 'auto' });
        };

        card.addEventListener('mousemove', onMouseMove);
        card.addEventListener('mouseleave', onMouseLeave);
        
        listeners.push({ card, event: 'mousemove', handler: onMouseMove });
        listeners.push({ card, event: 'mouseleave', handler: onMouseLeave });
      });
    }

    if (window.SRP.EventBus) {
      unsubTier = window.SRP.EventBus.on('tier:change', (newTier) => {
        if (newTier === 'lite') {
          // Clean up tilt listeners
          listeners.forEach(({ card, event, handler }) => {
            card.removeEventListener(event, handler);
            if (window.gsap) {
              window.gsap.set(card, { clearProps: 'rotationX,rotationY' });
            }
          });
          listeners = [];
        }
      });
    }
  }

  function destroy() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    listeners.forEach(({ card, event, handler }) => {
      card.removeEventListener(event, handler);
      if (window.gsap) {
        window.gsap.killTweensOf(card);
      }
    });
    listeners = [];
    if (unsubTier) {
      unsubTier();
      unsubTier = null;
    }
  }

  window.SRP.Modules['mentors-home'] = { init, destroy };
})();
