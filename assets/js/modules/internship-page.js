(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let pillListeners = [];
  let formListener = null;
  let btnListeners = [];
  let form = null;
  let timeouts = [];
  let observer = null;

  function init() {
    // 1. Filtering
    const pills = document.querySelectorAll('.filter-pills .filter-pill');
    const cards = document.querySelectorAll('.internship-card');
    
    if (pills.length > 0 && cards.length > 0) {
      pills.forEach(pill => {
        const handler = () => {
          pills.forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          const filter = pill.getAttribute('data-filter') || pill.textContent.trim().toLowerCase();
          
          let visibleIndex = 0;
          cards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              card.style.display = '';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                card.style.transitionDelay = `${visibleIndex * 100}ms`;
                visibleIndex++;
              }, 10);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'scale(0.95)';
              card.style.transitionDelay = '0ms';
              setTimeout(() => {
                if (card.style.opacity === '0') card.style.display = 'none';
              }, 300);
            }
          });
        };
        pill.addEventListener('click', handler);
        pillListeners.push({ pill, handler });
      });
    }

    // 2. Form submission
    form = document.getElementById('apply-form');
    if (form) {
      formListener = (e) => {
        e.preventDefault();
        
        // Simple validation check
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
          const field = input.closest('.field');
          if (!input.value.trim()) {
            isValid = false;
            if (field) field.classList.add('is-invalid');
          } else {
            if (field) field.classList.remove('is-invalid');
          }
        });

        if (!isValid) {
          form.classList.add('form-shake');
          setTimeout(() => form.classList.remove('form-shake'), 500);
          return;
        }

        const btn = form.querySelector('.btn-primary');
        if (btn) {
          btn.classList.add('is-loading');
          timeouts.push(setTimeout(() => {
            btn.classList.remove('is-loading');
            btn.classList.add('is-success');
            const originalText = btn.textContent;
            btn.textContent = '✓ Application Submitted!';
            
            timeouts.push(setTimeout(() => {
              btn.classList.remove('is-success');
              btn.textContent = originalText;
              form.reset();
            }, 3000));
          }, 2000));
        }
      };
      form.addEventListener('submit', formListener);
      
      // Observer for form fields
      const fields = form.querySelectorAll('.field');
      if (fields.length > 0) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const f = entry.target;
              const index = Array.from(fields).indexOf(f);
              f.style.transitionDelay = `${index * 100}ms`;
              f.classList.add('is-visible');
              observer.unobserve(f);
            }
          });
        }, { threshold: 0.1 });
        fields.forEach(f => observer.observe(f));
      }
    }

    // 3. Apply buttons scroll
    const applyBtns = document.querySelectorAll('.internship-card .btn-primary');
    applyBtns.forEach(btn => {
      const handler = (e) => {
        e.preventDefault();
        if (form && window.lenis) {
          window.lenis.scrollTo(form, { offset: -100 });
        } else if (form) {
          form.scrollIntoView({ behavior: 'smooth' });
        }
      };
      btn.addEventListener('click', handler);
      btnListeners.push({ btn, handler });
    });
  }

  function destroy() {
    pillListeners.forEach(({ pill, handler }) => pill.removeEventListener('click', handler));
    pillListeners = [];
    
    if (form && formListener) {
      form.removeEventListener('submit', formListener);
      formListener = null;
    }
    form = null;
    
    btnListeners.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
    btnListeners = [];
    
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  window.SRP.Modules['internship-page'] = { init, destroy };
})();
