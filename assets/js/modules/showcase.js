(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let triggers = [];
  
  function init() {
    const container = document.querySelector('.showcase-scroll-container');
    const track = document.querySelector('.showcase-track');
    const cards = document.querySelectorAll('.showcase-card');
    
    if (!container || !track || cards.length === 0) return;

    if (window.gsap && window.ScrollTrigger) {
      // Horizontal pin
      const t = window.ScrollTrigger.create({
        trigger: container,
        pin: true,
        start: 'top top',
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        animation: window.gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: 'none'
        }),
        scrub: true,
        invalidateOnRefresh: true
      });
      triggers.push(t);

      // Card active states based on viewport center
      cards.forEach((card, i) => {
        const ct = window.ScrollTrigger.create({
          trigger: card,
          containerAnimation: t.animation,
          start: 'left center',
          end: 'right center',
          onEnter: () => activateCard(card, i),
          onEnterBack: () => activateCard(card, i)
        });
        triggers.push(ct);
      });
    }
  }

  function activateCard(card, index) {
    document.querySelectorAll('.showcase-card').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');
    if (window.SRP.EventBus) {
      window.SRP.EventBus.emit('showcase:active', { index });
    }
  }

  function destroy() {
    triggers.forEach(t => t.kill());
    triggers = [];
    document.querySelectorAll('.showcase-card').forEach(c => c.classList.remove('is-active'));
  }

  window.SRP.Modules.showcase = { init, destroy };
})();
