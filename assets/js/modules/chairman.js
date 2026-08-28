(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let trigger = null;
  let observer = null;
  let unsubTier = null;

  function init() {
    const wrapper = document.querySelector('.chairman-photo-wrapper');
    const content = document.querySelector('.chairman-content');

    if (!wrapper && !content) return;

    const isLite = window.SRP.Performance && window.SRP.Performance.getTier && window.SRP.Performance.getTier() === 'lite';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Observer for content reveal
    if (content) {
      const children = Array.from(content.children);
      
      if (prefersReducedMotion) {
        children.forEach(child => child.classList.add('is-visible'));
      } else {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              children.forEach((child, index) => {
                child.style.transitionDelay = `${index * 150}ms`;
                child.classList.add('is-visible');
              });
              observer.disconnect();
            }
          });
        }, { threshold: 0.2 });
        observer.observe(content);
      }
    }

    // 2. Parallax for photo wrapper
    if (wrapper && !isLite && !prefersReducedMotion && window.gsap && window.ScrollTrigger) {
      trigger = window.ScrollTrigger.create({
        trigger: wrapper,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        animation: window.gsap.to(wrapper, { yPercent: -15, ease: 'none' })
      });
    }

    // Listen to tier changes
    if (window.SRP.EventBus) {
      unsubTier = window.SRP.EventBus.on('tier:change', (newTier) => {
        if (newTier === 'lite' && trigger) {
          trigger.kill();
          trigger = null;
          window.gsap.set(wrapper, { clearProps: 'yPercent' });
        }
      });
    }
  }

  function destroy() {
    if (trigger) {
      trigger.kill();
      trigger = null;
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (unsubTier) {
      unsubTier();
      unsubTier = null;
    }
  }

  window.SRP.Modules.chairman = { init, destroy };
})();
