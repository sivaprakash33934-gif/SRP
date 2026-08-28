(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let trigger = null;

  function init() {
    const container = document.querySelector('.journey-container');
    const pathLine = document.querySelector('.journey-path-line');
    const steps = document.querySelectorAll('.journey-step');

    if (!container || !pathLine || steps.length === 0) return;

    let totalLength = 0;
    try {
      totalLength = pathLine.getTotalLength();
    } catch (e) {
      // Fallback if not an SVGPathElement
      totalLength = 1200; // default for straight line based on spec
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      pathLine.style.strokeDasharray = totalLength;
      pathLine.style.strokeDashoffset = 0;
      steps.forEach(step => step.classList.add('is-active'));
      return;
    }

    pathLine.style.strokeDasharray = totalLength;
    pathLine.style.strokeDashoffset = totalLength;

    if (window.ScrollTrigger) {
      trigger = window.ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          pathLine.style.strokeDashoffset = totalLength * (1 - progress);

          steps.forEach((step, i) => {
            const threshold = (i + 0.5) / steps.length;
            if (progress >= threshold) {
              step.classList.add('is-active');
            } else {
              step.classList.remove('is-active');
            }
          });
        }
      });
    }
  }

  function destroy() {
    if (trigger) {
      trigger.kill();
      trigger = null;
    }
    const pathLine = document.querySelector('.journey-path-line');
    if (pathLine) {
      pathLine.style.strokeDashoffset = '';
      pathLine.style.strokeDasharray = '';
    }
    const steps = document.querySelectorAll('.journey-step');
    steps.forEach(step => step.classList.remove('is-active'));
  }

  window.SRP.Modules['startup-structure'] = { init, destroy };
})();
