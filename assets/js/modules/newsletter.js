(function() {
  'use strict';
  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};

  let forms = [];
  let timeouts = [];

  function init() {
    forms = Array.from(document.querySelectorAll('form.newsletter'));
    
    forms.forEach(form => {
      const btn = form.querySelector('.btn-state-morph');
      const input = form.querySelector('input[type="email"]');
      
      const onSubmit = (e) => {
        e.preventDefault();
        if (!input || !input.value || !input.checkValidity()) return;
        
        if (btn) {
          btn.classList.add('is-loading');
          
          const t1 = setTimeout(() => {
            btn.classList.remove('is-loading');
            btn.classList.add('is-success');
            const txt = btn.querySelector('.btn-text');
            if (txt) {
              btn.dataset.originalText = txt.textContent;
              txt.textContent = '✓ Subscribed!';
            }
            
            const t2 = setTimeout(() => {
              btn.classList.remove('is-success');
              if (txt && btn.dataset.originalText) {
                txt.textContent = btn.dataset.originalText;
              }
              form.reset();
            }, 3000);
            timeouts.push(t2);
          }, 1500);
          timeouts.push(t1);
        }
      };
      
      form.addEventListener('submit', onSubmit);
      form._onSubmit = onSubmit; // store ref for destroy
    });
  }

  function destroy() {
    forms.forEach(form => {
      if (form._onSubmit) {
        form.removeEventListener('submit', form._onSubmit);
      }
    });
    forms = [];
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
  }

  window.SRP.Modules.newsletter = { init, destroy };
})();
