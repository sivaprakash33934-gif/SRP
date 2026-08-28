
/* --- assets/js/components/chatbot.js --- */
/* ================================================================
 * FILE: assets/js/components/chatbot.js
 * SRP AI Chatbot Component
 * Global Variable Pattern — NO EXPORTS
 * ================================================================ */

(function () {
  "use strict";

  var widgetEl = null;
  var toggleBtn = null;
  var chatWindow = null;
  var messagesBody = null;
  var inputField = null;
  var sendBtn = null;
  var quickRepliesBox = null;
  var isTyping = false;
  var isOpen = false;

  var listeners = [];

  var DB = {
    greetings: ["Hello! I'm the SRP AI assistant. How can I help you navigate the Sriram Research Park today?"],
    quickReplies: ["Incubation", "Coworking", "Funding", "Contact"],
    keywords: {
      "incubat": "We offer structured incubation programs with mentoring, seed funding access, and world-class infrastructure. Visit the 'Incubation' page to apply.",
      "coworking": "Our 24/7 coworking spaces provide high-speed internet, meeting rooms, and networking events. Desks start at custom rates. See the 'Coworking' page.",
      "fund": "SRP provides seed funding support, access to angel networks, and government grants like NIDHI-PRAYAS for eligible startups.",
      "contact": "You can reach us at contact@sriramresearchpark.org or call 044 - 22359227.",
      "location": "We are located at the Second Floor, Platinum Jubilee Building, AC Tech Campus, Anna University, Guindy, Chennai.",
      "mentor": "We have an extensive network of 10+ industry leaders, 6+ core faculty experts, and an esteemed advisory board. Check our 'Mentors' page."
    },
    fallback: "I can help with information about Incubation, Coworking, Mentors, and Funding. Could you specify your query?"
  };

  function addMessage(text, isUser) {
    var msg = document.createElement("div");
    msg.className = "chat-msg " + (isUser ? "chat-msg-user" : "chat-msg-bot");
    msg.innerHTML = '<div class="chat-bubble">' + text + '</div>';
    messagesBody.appendChild(msg);
    scrollToBottom();
    if (window.SRP && window.SRP.EventBus && window.SRP.EventBus.emit) {
      window.SRP.EventBus.emit("chat:message", { text: text, isUser: isUser });
    }
  }

  function showTyping() {
    isTyping = true;
    var indicator = document.createElement("div");
    indicator.className = "chat-msg chat-msg-bot chat-typing";
    indicator.id = "chat-typing";
    indicator.innerHTML = '<div class="chat-bubble"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
    messagesBody.appendChild(indicator);
    scrollToBottom();
  }

  function hideTyping() {
    isTyping = false;
    var indicator = document.getElementById("chat-typing");
    if (indicator) indicator.remove();
  }

  function scrollToBottom() {
    messagesBody.scrollTop = messagesBody.scrollHeight;
  }

  function botReply(userText) {
    showTyping();
    setTimeout(function () {
      hideTyping();
      var txt = userText.toLowerCase();
      var reply = DB.fallback;
      for (var key in DB.keywords) {
        if (txt.indexOf(key) !== -1) {
          reply = DB.keywords[key];
          break;
        }
      }
      addMessage(reply, false);
      renderQuickReplies();
    }, 1000 + Math.random() * 800);
  }

  function handleSend() {
    var txt = inputField.value.trim();
    if (!txt || isTyping) return;
    inputField.value = "";
    addMessage(txt, true);
    quickRepliesBox.innerHTML = "";
    botReply(txt);
  }

  function renderQuickReplies() {
    quickRepliesBox.innerHTML = "";
    DB.quickReplies.forEach(function (qr) {
      var btn = document.createElement("button");
      btn.className = "chat-qr-btn";
      btn.type = "button";
      btn.textContent = qr;
      var clickFn = function () {
        addMessage(qr, true);
        quickRepliesBox.innerHTML = "";
        botReply(qr);
      };
      btn.addEventListener("click", clickFn);
      listeners.push({ el: btn, ev: "click", fn: clickFn });
      quickRepliesBox.appendChild(btn);
    });
  }

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.add("is-open");
      toggleBtn.setAttribute("aria-expanded", "true");
      inputField.focus();
      if (window.SRP && window.SRP.EventBus && window.SRP.EventBus.emit) window.SRP.EventBus.emit("chat:open");
    } else {
      chatWindow.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
      if (window.SRP && window.SRP.EventBus && window.SRP.EventBus.emit) window.SRP.EventBus.emit("chat:close");
    }
  }

  function buildDOM() {
    widgetEl = document.createElement("div");
    widgetEl.className = "srp-chatbot-widget";

    chatWindow = document.createElement("div");
    chatWindow.className = "chat-window";
    chatWindow.innerHTML = 
      '<div class="chat-header"><h4>SRP Assistant</h4><button type="button" class="chat-close" aria-label="Close Chat">×</button></div>' +
      '<div class="chat-body"></div>' +
      '<div class="chat-quick-replies"></div>' +
      '<div class="chat-footer"><input type="text" class="chat-input" placeholder="Ask me anything..." aria-label="Chat input"/><button type="button" class="chat-send" aria-label="Send">➔</button></div>';

    toggleBtn = document.createElement("button");
    toggleBtn.className = "chat-fab";
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Open Chat");
    toggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

    widgetEl.appendChild(chatWindow);
    widgetEl.appendChild(toggleBtn);
    document.body.appendChild(widgetEl);

    messagesBody = chatWindow.querySelector(".chat-body");
    inputField = chatWindow.querySelector(".chat-input");
    sendBtn = chatWindow.querySelector(".chat-send");
    quickRepliesBox = chatWindow.querySelector(".chat-quick-replies");
    var closeBtn = chatWindow.querySelector(".chat-close");

    var bind = function (el, ev, fn) {
      el.addEventListener(ev, fn);
      listeners.push({ el: el, ev: ev, fn: fn });
    };

    bind(toggleBtn, "click", toggleChat);
    bind(closeBtn, "click", toggleChat);
    bind(sendBtn, "click", handleSend);
    bind(inputField, "keydown", function (e) {
      if (e.key === "Enter") handleSend();
    });
    bind(document, "keydown", function (e) {
      if (e.key === "Escape" && isOpen) toggleChat();
    });

    setTimeout(function () {
      addMessage(DB.greetings[0], false);
      renderQuickReplies();
    }, 500);
  }

  function init() {
    var cfg = window.CONFIG || (window.SRP && window.SRP.Config) || {};
    if (cfg.ENABLE_CHATBOT === false) return;
    if (window.SRP.Dom.prefersReducedMotion && window.SRP.Performance && window.SRP.Performance.getTier() === 'lite') {
      // maybe disable on extremely low tier devices entirely?
    }
    
    // Only build once
    if (!widgetEl) {
      buildDOM();
    }
  }

  function destroy() {
    listeners.forEach(function (l) {
      l.el.removeEventListener(l.ev, l.fn);
    });
    listeners = [];
    if (widgetEl && widgetEl.parentNode) {
      widgetEl.parentNode.removeChild(widgetEl);
    }
    widgetEl = null;
    toggleBtn = null;
    chatWindow = null;
    messagesBody = null;
    inputField = null;
    sendBtn = null;
    quickRepliesBox = null;
    isOpen = false;
    isTyping = false;
  }

  window.SRP = window.SRP || {};
  window.SRP.Modules = window.SRP.Modules || {};
  window.SRP.Modules.chatbot = { init: init, destroy: destroy };
})();


/* --- assets/js/components/cursor.js --- */
/* components/cursor.js — custom cursor (desktop only, idle-safe writes) */
(function () {
  "use strict";

  var dot, ring, x = 0, y = 0, ringX = 0, ringY = 0, visible = false, running = false, rafId = 0;

  function loop() {
    ringX = SRP.Helpers.lerp(ringX, x, 0.18);
    ringY = SRP.Helpers.lerp(ringY, y, 0.18);
    /* Skip style writes when the ring has settled — avoids paint every frame */
    if (ring && (Math.abs(ringX - x) > 0.4 || Math.abs(ringY - y) > 0.4)) {
      ring.style.transform = "translate(" + ringX + "px, " + ringY + "px) translate(-50%, -50%)";
    }
    /* Update dot in rAF (avoids unthrottled mousemove writes) */
    if (dot && visible && (Math.abs(x) > 0.4 || Math.abs(y) > 0.4)) {
      dot.style.transform = "translate(" + x + "px, " + y + "px) translate(-50%, -50%)";
    }
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    running = false;
    if (dot) { dot.style.opacity = "0"; }
    if (ring) { ring.style.opacity = "0"; }
    visible = false;
    document.body.classList.remove("has-cursor");
  }

  function init() {
    if (!window.SRP.Config.ENABLE_CURSOR) return;
    if (!SRP.Dom.isDesktop()) return;
    if (SRP.Dom.prefersReducedMotion()) return;
    if (!SRP.FeatureDetect.intersectionObserver()) return;

    dot = SRP.Dom.createEl("div", "cursor-dot");
    ring = SRP.Dom.createEl("div", "cursor-ring");
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add("has-cursor");

    window.addEventListener("mousemove", function (e) {
      x = e.clientX;
      y = e.clientY;
      if (!visible) { visible = true; dot.style.opacity = "1"; ring.style.opacity = "1"; }
    });

    if (!running) {
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest ? e.target.closest("a, button, [role='button'], .filter-pill, .card") : null;
      if (t && ring) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      var t = e.target.closest ? e.target.closest("a, button, [role='button'], .filter-pill, .card") : null;
      if (t && ring) ring.classList.remove("is-hover");
    });

    document.addEventListener("mousedown", function () { if (ring) ring.classList.add("is-click"); });
    document.addEventListener("mouseup", function () { if (ring) ring.classList.remove("is-click"); });

    document.addEventListener("mouseleave", function () {
      if (dot) dot.style.opacity = "0";
      if (ring) ring.style.opacity = "0";
      visible = false;
    });

    SRP.EventBus.on("tier:change", function () {
      if (SRP.Performance.getTier() === "lite") stop();
    });
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.Cursor = { init: init, destroy: stop };
})();


/* --- assets/js/components/magnetic.js --- */
/* components/magnetic.js — magnetic buttons (quickTo: no per-move tween allocation) */
(function () {
  "use strict";

  var buttons = [];
  var handlers = [];

  function detach(btn) {
    for (var i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i].btn === btn) {
        btn.removeEventListener("mousemove", handlers[i].move);
        btn.removeEventListener("mouseleave", handlers[i].leave);
        handlers.splice(i, 1);
      }
    }
  }

  function setEnabled(on) {
    buttons.forEach(function (b) {
      if (!on) {
        if (window.gsap) gsap.killTweensOf(b);
        detach(b);
      }
    });
  }

  function init() {
    if (!window.SRP.Config.ENABLE_MAGNETIC) return;
    if (!SRP.Dom.isDesktop()) return;
    if (SRP.Dom.prefersReducedMotion()) return;
    if (!SRP.Performance.effects().magnetic) return;

    buttons = SRP.Dom.$$(".btn[data-magnetic], .hero-ctas .btn");
    buttons.forEach(function (btn) {
      var strength = parseFloat(btn.getAttribute("data-strength") || "0.3");
      if (window.gsap) {
        var qx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power2.out", force3D: true });
        var qy = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power2.out", force3D: true });
        var cachedRect = null;
        var move = function (e) {
          if (!cachedRect) return;
          qx((e.clientX - cachedRect.left - cachedRect.width / 2) * strength);
          qy((e.clientY - cachedRect.top - cachedRect.height / 2) * strength);
        };
        var enter = function () { cachedRect = btn.getBoundingClientRect(); };
        var leave = function () { cachedRect = null; qx(0); qy(0); };
        btn.addEventListener("mouseenter", enter);
        btn.addEventListener("mousemove", move);
        btn.addEventListener("mouseleave", leave);
        handlers.push({ btn: btn, move: move, leave: leave });
      } else {
        var movePlain = function (e) {
          var r = btn.getBoundingClientRect();
          btn.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * strength + "px, " +
            (e.clientY - r.top - r.height / 2) * strength + "px)";
        };
        var leavePlain = function () { btn.style.transform = ""; };
        btn.addEventListener("mousemove", movePlain);
        btn.addEventListener("mouseleave", leavePlain);
        handlers.push({ btn: btn, move: movePlain, leave: leavePlain });
      }
    });

    SRP.EventBus.on("tier:change", function () {
      setEnabled(SRP.Performance.effects().magnetic);
    });
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.Magnetic = { init: init };
})();


/* --- assets/js/components/progress-bar.js --- */
/* components/progress-bar.js — thin gradient scroll progress bar */
(function () {
  "use strict";

  var bar = null;

  function init() {
    if (!window.SRP.Config.ENABLE_PROGRESS_BAR) return;
    if (SRP.Dom.prefersReducedMotion()) return;

    bar = SRP.Dom.createEl("div", "progress-bar");
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    var ticking = false;
    var setScale = null;
    if (window.gsap) setScale = gsap.quickTo(bar, "scaleX", { duration: 0.15, ease: "power2.out" });
    function update() {
      ticking = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      if (setScale) setScale(p);
      else bar.style.transform = "scaleX(" + p + ")";
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.ProgressBar = { init: init };
})();


/* --- assets/js/components/counters.js --- */
/* components/counters.js — count-up numbers with particle burst */
(function () {
  "use strict";

  var PARTICLE_CAP = window.SRP && SRP.Config ? SRP.Config.PARTICLE_CAP : 60;

  var pool = [];
  var POOL_SIZE = 8;
  var poolReady = false;

  function initPool() {
    if (poolReady) return;
    for (var i = 0; i < POOL_SIZE; i++) {
      var p = SRP.Dom.createEl("span", "burst");
      p.style.cssText = "position:fixed;pointer-events:none;z-index:9999;display:none;";
      document.body.appendChild(p);
      pool.push(p);
    }
    poolReady = true;
  }

  function burst(el) {
    if (!window.SRP.Config.ENABLE_PARTICLES) return;
    if (!SRP.Performance.effects().particles) return;
    initPool();
    var rect = el.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var count = Math.min(POOL_SIZE, PARTICLE_CAP / 8);
    for (var i = 0; i < count; i++) {
      var p = pool[i];
      p.style.left = (cx + (Math.random() - 0.5) * 40) + "px";
      p.style.top = (cy + (Math.random() - 0.5) * 20) + "px";
      p.style.setProperty("--dx", SRP.Helpers.rand(-46, 46) + "px");
      p.style.setProperty("--dy", SRP.Helpers.rand(-64, -24) + "px");
      p.style.display = "block";
      p.style.animation = "none";
      void p.offsetWidth;
      p.style.animation = "";
      (function (particle) {
        setTimeout(function () { particle.style.display = "none"; }, 1000);
      })(p);
    }
  }

  function animate(el, from, to, suffix, duration, onDone) {
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3); /* cubic out */
      var val = Math.round(from + (to - from) * eased);
      el.textContent = SRP.Helpers.formatNum(val) + (suffix || "");
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (onDone) {
        onDone();
      }
    }
    requestAnimationFrame(step);
  }

  function init(targets) {
    var els = typeof targets === "string" ? SRP.Dom.$$(targets) : targets;
    els.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count") || "0");
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = parseInt(el.getAttribute("data-duration") || "1600", 10);
      var card = el.closest(".stat-card, .card");

      var run = function () {
        animate(el, 0, target, suffix, duration, function () {
          if (card) burst(card);
        });
      };

      if (SRP.Observers) {
        SRP.Observers.inView(el, run, { threshold: 0.6 });
      } else {
        run();
      }
    });
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.Counters = { init: init };
})();


/* --- assets/js/components/hover.js --- */
/* components/hover.js — unified hover: silver edge sweep + lift + soft glow.
   Tilt is applied only to elements with [data-tilt]. */
(function () {
  "use strict";

  function init() {
    /* Silver edge sweep is pure CSS via .card::before — nothing to do here.
       This component wires the optional 3D tilt + parallax-glow extras. */

    SRP.Dom.$$("[data-tilt]").forEach(function (el) {
      SRP.Motion.depth.tilt([el], { max: parseFloat(el.getAttribute("data-tilt-max") || "5") });
    });
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.Hover = { init: init };
})();


/* --- assets/js/components/page-transition.js --- */
/* components/page-transition.js — seamless internal navigation */
(function () {
  "use strict";

  var ANIM_MS = 250;
  var isTransitioning = false;

  function fadeOut(cb) {
    var veil = SRP.Dom.createEl("div", "page-veil");
    veil.setAttribute("aria-hidden", "true");
    veil.style.cssText = "position:fixed;inset:0;z-index:900;background:#fff;opacity:0;pointer-events:none;transition:opacity 250ms ease;";
    document.body.appendChild(veil);
    requestAnimationFrame(function () {
      veil.style.opacity = "1";
    });
    setTimeout(cb, ANIM_MS);
  }

  function handleClick(e) {
    if (isTransitioning) { e.preventDefault(); return; }
    var link = e.target.closest ? e.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    if (link.target && link.target !== "_self") return;
    if (link.hasAttribute("download")) return;
    if (href.indexOf("http") === 0 && href.indexOf(location.origin) !== 0) return;

    var samePage = href === location.pathname.split("/").pop() || href === location.pathname;
    if (samePage) return;

    e.preventDefault();
    isTransitioning = true;
    markArrival();
    SRP.EventBus.emit("transition:start", href);
    fadeOut(function () {
      window.location.href = href;
    });
  }

  /* After transition arrival, skip the loader on the next page */
  function markArrival() {
    sessionStorage.setItem("srp-arrived", "1");
  }
  function clearArrival() {
    sessionStorage.removeItem("srp-arrived");
  }

  function init() {
    if (!window.SRP.Config.ENABLE_PAGE_TRANSITION) return;
    if (SRP.Dom.prefersReducedMotion()) return;
    if (!SRP.FeatureDetect.intersectionObserver()) return;

    document.addEventListener("click", handleClick);

    /* On load: if we arrived via transition, tell the loader to skip */
    if (sessionStorage.getItem("srp-arrived") === "1") {
      SRP.EventBus.emit("transition:arrived");
      setTimeout(clearArrival, 300);
    }
  }

  window.SRP = window.SRP || {};
  SRP.Components = SRP.Components || {};
  SRP.Components.PageTransition = { init: init, markArrival: markArrival };
})();

