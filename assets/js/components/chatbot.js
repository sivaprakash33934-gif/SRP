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
