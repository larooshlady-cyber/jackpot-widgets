/**
 * Jackpot Cyber Neon Widget
 * High-end cyberpunk floating jackpot display. Subtle neon glow, scanlines,
 * rare glitch, crystal decorations. Fully self-contained: injects CSS + HTML.
 * Container-relative drag with clamping, mouse + touch support.
 */
(function () {
  "use strict";

  var DEFAULTS = {
    name: "Cyber Neon",
    subtitle: "Jackpot",
    amount: 8320000.0,
    currency: "EUR",
    currencySymbol: "EUR",
    incrementRate: 2.5,
    incrementInterval: 2000,
    position: "top-right",
    containerId: null,
    draggable: true,
    onOptIn: null,
    onOptOut: null
  };

  var STORAGE_KEY = "jackpot_cyber_neon_optin";
  var P = "jw-neon-";

  /* ---- CSS ---- */
  var CSS =

    /* ===== Keyframes ===== */

    /* Border glow: cyan <-> magenta at very low opacity, 6s cycle */
    "@keyframes " + P + "border-glow{" +
      "0%,100%{box-shadow:0 0 8px rgba(0,200,220,0.08),0 4px 16px rgba(0,0,0,0.5);}" +
      "50%{box-shadow:0 0 8px rgba(180,60,200,0.12),0 4px 16px rgba(0,0,0,0.5);}" +
    "}" +

    /* Scanline scroll: slow downward drift, 12s */
    "@keyframes " + P + "scanline-scroll{" +
      "0%{background-position-y:0;}" +
      "100%{background-position-y:80px;}" +
    "}" +

    /* Sweep line across amount panel, 4s */
    "@keyframes " + P + "sweep{" +
      "0%{left:-30px;}" +
      "100%{left:calc(100% + 30px);}" +
    "}" +

    /* Light sweep across entire widget */
    "@keyframes " + P + "light-sweep{" +
      "0%{background-position:-100% 0;}" +
      "100%{background-position:200% 0;}" +
    "}" +

    /* ===== Root ===== */
    "." + P + "root{" +
      "position:fixed;z-index:999999;width:230px;" +
      "font-family:'Segoe UI',Arial,Helvetica,sans-serif;" +
      "line-height:1.4;user-select:none;" +
    "}" +
    "." + P + "root." + P + "absolute{position:absolute;}" +
    "." + P + "root." + P + "pos-top-right{top:18px;right:18px;}" +
    "." + P + "root." + P + "pos-top-left{top:18px;left:18px;}" +
    "." + P + "root." + P + "pos-bottom-right{bottom:18px;right:18px;}" +
    "." + P + "root." + P + "pos-bottom-left{bottom:18px;left:18px;}" +
    "." + P + "root." + P + "pos-center{top:50%;left:50%;transform:translate(-50%,-50%);}" +
    "." + P + "root." + P + "inline{position:relative;top:auto;right:auto;bottom:auto;left:auto;}" +
    "." + P + "root." + P + "dragging{cursor:grabbing;}" +

    /* ===== Panel (main frame) ===== */
    "." + P + "panel{" +
      "background:#08080f;" +
      "border:1px solid rgba(0,200,220,0.2);" +
      "border-radius:3px;" +
      "overflow:hidden;" +
      "position:relative;" +
      "animation:" + P + "border-glow 6s ease-in-out infinite;" +
    "}" +

    /* ===== Scanline overlay (::after on panel) ===== */
    "." + P + "panel::after{" +
      "content:'';" +
      "position:absolute;top:0;left:0;right:0;bottom:0;" +
      "pointer-events:none;z-index:1;" +
      "background:repeating-linear-gradient(" +
        "0deg," +
        "transparent," +
        "transparent 3px," +
        "rgba(0,200,220,0.015) 3px," +
        "rgba(0,200,220,0.015) 4px" +
      ");" +
      "animation:" + P + "scanline-scroll 12s linear infinite;" +
    "}" +

    /* ===== Title bar ===== */
    "." + P + "title-bar{" +
      "padding:12px 30px 8px;" +
      "text-align:center;" +
      "position:relative;z-index:2;" +
      "cursor:default;" +
    "}" +
    "." + P + "title-bar." + P + "grab{cursor:grab;}" +
    "." + P + "root." + P + "dragging ." + P + "title-bar." + P + "grab{cursor:grabbing;}" +

    /* ===== Title text: muted teal, single subtle glow ===== */
    "." + P + "name{" +
      "font-family:monospace;" +
      "font-size:11px;font-weight:bold;color:#00bcd4;" +
      "text-transform:uppercase;letter-spacing:3px;" +
      "margin:0;line-height:1.3;" +
      "text-shadow:0 0 6px rgba(0,188,212,0.3);" +
      "transition:transform 0.1s ease;" +
    "}" +

    /* Glitch class: applied by JS for 100ms — very subtle */
    "." + P + "name." + P + "glitch{" +
      "transform:translateX(1px) skewX(-1deg);" +
    "}" +
    /* Faint cyan ghost during glitch */
    "." + P + "name." + P + "glitch::after{" +
      "content:attr(data-text);" +
      "position:absolute;top:0;left:1px;" +
      "color:rgba(0,188,212,0.2);" +
      "text-shadow:none;" +
      "pointer-events:none;" +
    "}" +

    /* ===== Subtitle: muted purple-pink, italic serif ===== */
    "." + P + "subtitle{" +
      "font-family:Georgia,serif;" +
      "font-size:10px;font-style:italic;color:#c060d0;" +
      "margin:2px 0 0;line-height:1.3;" +
      "text-shadow:0 0 6px rgba(192,96,208,0.2);" +
    "}" +

    /* ===== Header separator ===== */
    "." + P + "separator{" +
      "height:1px;border:none;margin:0;" +
      "background:linear-gradient(90deg,rgba(0,188,212,0.15),transparent);" +
      "position:relative;z-index:2;" +
    "}" +

    /* ===== Close button ===== */
    "." + P + "close-btn{" +
      "position:absolute;top:6px;right:8px;" +
      "background:none;border:none;padding:0;" +
      "color:#8a4a9a;font-size:14px;line-height:1;" +
      "cursor:pointer;opacity:0.4;z-index:3;" +
    "}" +
    "." + P + "close-btn:hover{opacity:0.7;}" +

    /* ===== Body ===== */
    "." + P + "body{padding:0 0 10px;position:relative;z-index:2;}" +

    /* ===== Amount panel ===== */
    "." + P + "amount-panel{" +
      "background:#04040a;" +
      "border:1px solid rgba(0,188,212,0.1);" +
      "border-radius:3px;" +
      "margin:8px 10px;" +
      "padding:10px 8px 12px;" +
      "text-align:center;" +
      "position:relative;overflow:hidden;" +
    "}" +

    /* Currency label */
    "." + P + "currency-label{" +
      "font-size:8px;color:#4a7a84;margin:0 0 4px;letter-spacing:1px;" +
    "}" +

    /* Amount text */
    "." + P + "amount-text{" +
      "font-family:'Courier New',Courier,monospace;" +
      "font-size:21px;font-weight:bold;color:#d0e8ec;" +
      "margin:0;white-space:nowrap;letter-spacing:0.5px;" +
      "text-shadow:0 0 4px rgba(0,188,212,0.15);" +
    "}" +

    /* Subtle magenta sweep line: 1px tall, 30px wide, 4s */
    "." + P + "sweep-line{" +
      "position:absolute;bottom:4px;" +
      "width:30px;height:1px;" +
      "background:linear-gradient(90deg,transparent,rgba(192,96,208,0.3),transparent);" +
      "animation:" + P + "sweep 4s linear infinite;" +
      "pointer-events:none;" +
    "}" +

    /* ===== Crystal decorations ===== */
    "." + P + "crystal-row{" +
      "display:flex;align-items:center;justify-content:center;" +
      "position:relative;z-index:2;" +
    "}" +
    "." + P + "crystal{" +
      "width:8px;height:12px;flex-shrink:0;" +
      "box-shadow:0 0 3px rgba(140,60,180,0.2);" +
      "clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);" +
      "background:linear-gradient(180deg,rgba(100,40,140,0.6),rgba(160,60,200,0.3));" +
    "}" +

    /* ===== Buttons ===== */
    "." + P + "btn-wrap{text-align:center;padding:6px 10px 10px;position:relative;z-index:2;}" +
    "." + P + "opt-btn{" +
      "display:block;width:100%;height:32px;" +
      "font-family:'Segoe UI',Arial,sans-serif;" +
      "font-size:12px;font-weight:bold;text-transform:uppercase;" +
      "letter-spacing:1px;border-radius:3px;cursor:pointer;" +
      "background:transparent;border:1px solid rgba(0,188,212,0.3);color:#00bcd4;" +
      "transition:background 0.2s,color 0.2s,border-color 0.2s;" +
    "}" +
    "." + P + "opt-btn:hover{background:rgba(0,188,212,0.06);}" +
    "." + P + "opt-btn." + P + "opted-in{" +
      "background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);color:#4a4a5a;" +
    "}" +
    "." + P + "opt-btn." + P + "opted-in:hover{background:rgba(255,255,255,0.04);color:#5a5a6a;}" +

    /* ===== Light sweep overlay ===== */
    "." + P + "sweep-wrap{" +
      "position:absolute;top:0;left:0;right:0;bottom:0;" +
      "overflow:hidden;border-radius:3px;pointer-events:none;z-index:3;" +
    "}" +
    "." + P + "light-sweep{" +
      "position:absolute;top:0;left:0;width:100%;height:100%;" +
      "background:linear-gradient(110deg," +
        "transparent 0%,transparent 40%," +
        "rgba(0,255,220,0.08) 45%," +
        "rgba(0,255,255,0.18) 49%," +
        "rgba(180,255,255,0.25) 50%," +
        "rgba(0,255,255,0.18) 51%," +
        "rgba(0,255,220,0.08) 55%," +
        "transparent 60%,transparent 100%);" +
      "background-size:200% 100%;" +
      "background-repeat:no-repeat;" +
      "animation:" + P + "light-sweep 2.5s ease-in infinite;" +
    "}" +

    /* ===== Minimized state ===== */
    "." + P + "minimized ." + P + "body{display:none;}" +
    "." + P + "minimized ." + P + "separator{display:none;}" +
    "." + P + "minimized ." + P + "panel{border-radius:3px;}" +
    "." + P + "minimized ." + P + "title-bar{cursor:pointer;}";

  /* ---- Helpers ---- */
  function formatAmount(value) {
    var parts = value.toFixed(2).split(".");
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return intPart + "." + parts[1];
  }

  function getStorage() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch (e) {
      return false;
    }
  }

  function setStorage(val) {
    try {
      localStorage.setItem(STORAGE_KEY, val ? "true" : "false");
    } catch (e) { /* swallow */ }
  }

  /* ---- Init ---- */
  function init(config) {
    var cfg = {};
    var key;
    for (key in DEFAULTS) {
      if (DEFAULTS.hasOwnProperty(key)) {
        cfg[key] = config && config.hasOwnProperty(key) ? config[key] : DEFAULTS[key];
      }
    }

    var amount = cfg.amount;
    var optedIn = getStorage();
    var minimized = false;
    var intervalId = null;
    var glitchTimerId = null;
    var styleEl = null;
    var els = {};

    /* Drag state */
    var dragging = false;
    var offsetX = 0;
    var offsetY = 0;
    var hasDragged = false;

    /* ---- Inject CSS ---- */
    if (!document.getElementById(P + "style")) {
      styleEl = document.createElement("style");
      styleEl.id = P + "style";
      styleEl.textContent = CSS;
      document.head.appendChild(styleEl);
    }

    /* ---- Build DOM ---- */
    var root = document.createElement("div");
    root.className = P + "root";
    els.root = root;

    var container = null;
    if (cfg.containerId) {
      container = document.getElementById(cfg.containerId);
      if (container) {
        root.classList.add(P + "inline");
        if (cfg.draggable) {
          root.classList.add(P + "absolute");
          root.classList.remove(P + "inline");
        }
      }
    }

    if (!container && !cfg.draggable) {
      root.classList.add(P + "pos-" + (cfg.position || "top-right"));
    }

    /* Panel wrapper */
    var panel = document.createElement("div");
    panel.className = P + "panel";
    root.appendChild(panel);
    els.panel = panel;

    /* Light sweep overlay */
    var sweepWrap = document.createElement("div");
    sweepWrap.className = P + "sweep-wrap";
    var lightSweep = document.createElement("div");
    lightSweep.className = P + "light-sweep";
    sweepWrap.appendChild(lightSweep);
    panel.appendChild(sweepWrap);

    /* Title bar */
    var titleBar = document.createElement("div");
    titleBar.className = P + "title-bar";
    if (cfg.draggable) {
      titleBar.classList.add(P + "grab");
    }
    panel.appendChild(titleBar);
    els.titleBar = titleBar;

    /* Title name */
    var nameEl = document.createElement("div");
    nameEl.className = P + "name";
    nameEl.textContent = cfg.name.toUpperCase();
    nameEl.setAttribute("data-text", cfg.name.toUpperCase());
    nameEl.style.position = "relative";
    titleBar.appendChild(nameEl);
    els.nameEl = nameEl;

    /* Subtitle */
    var subtitleEl = document.createElement("div");
    subtitleEl.className = P + "subtitle";
    subtitleEl.textContent = cfg.subtitle;
    titleBar.appendChild(subtitleEl);

    /* Close / minimize button */
    var closeBtn = document.createElement("button");
    closeBtn.className = P + "close-btn";
    closeBtn.textContent = "x";
    closeBtn.title = "Minimize";
    titleBar.appendChild(closeBtn);
    els.closeBtn = closeBtn;

    /* Header separator line */
    var separator = document.createElement("hr");
    separator.className = P + "separator";
    panel.appendChild(separator);

    /* Body (collapsible) */
    var body = document.createElement("div");
    body.className = P + "body";
    panel.appendChild(body);
    els.body = body;

    /* Amount panel with crystal decorations on sides */
    var amountOuter = document.createElement("div");
    amountOuter.className = P + "crystal-row";
    amountOuter.style.cssText = "margin:8px 10px 4px;gap:6px;";
    body.appendChild(amountOuter);

    /* Left crystal */
    var crystalLeft = document.createElement("div");
    crystalLeft.className = P + "crystal";
    amountOuter.appendChild(crystalLeft);

    /* Amount panel (center) */
    var amountPanel = document.createElement("div");
    amountPanel.className = P + "amount-panel";
    amountPanel.style.cssText = "margin:0;flex:1;";
    amountOuter.appendChild(amountPanel);

    var currencyLabel = document.createElement("div");
    currencyLabel.className = P + "currency-label";
    currencyLabel.textContent = cfg.currencySymbol;
    amountPanel.appendChild(currencyLabel);

    var amountText = document.createElement("div");
    amountText.className = P + "amount-text";
    amountText.textContent = formatAmount(amount);
    amountPanel.appendChild(amountText);
    els.amountText = amountText;

    /* Sweep line inside amount panel */
    var sweepLine = document.createElement("div");
    sweepLine.className = P + "sweep-line";
    amountPanel.appendChild(sweepLine);

    /* Right crystal */
    var crystalRight = document.createElement("div");
    crystalRight.className = P + "crystal";
    amountOuter.appendChild(crystalRight);

    /* Button wrap */
    var btnWrap = document.createElement("div");
    btnWrap.className = P + "btn-wrap";
    body.appendChild(btnWrap);

    var optBtn = document.createElement("button");
    optBtn.className = P + "opt-btn";
    if (optedIn) optBtn.classList.add(P + "opted-in");
    optBtn.textContent = optedIn ? "OPT OUT" : "OPT IN";
    btnWrap.appendChild(optBtn);
    els.optBtn = optBtn;

    /* ---- Mount ---- */
    function mount() {
      if (container) {
        container.appendChild(root);
      } else {
        document.body.appendChild(root);
      }

      /* Initial position for draggable */
      if (cfg.draggable && !container) {
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var w = 230;
        var posMap = {
          "top-left":     { x: 18, y: 18 },
          "top-right":    { x: vw - w - 18, y: 18 },
          "bottom-left":  { x: 18, y: vh - 280 },
          "bottom-right": { x: vw - w - 18, y: vh - 280 },
          "center":       { x: (vw - w) / 2, y: (vh - 280) / 2 }
        };
        var startPos = posMap[cfg.position] || posMap["top-right"];
        root.style.left = startPos.x + "px";
        root.style.top = startPos.y + "px";
        root.style.right = "auto";
        root.style.bottom = "auto";
        root.style.transform = "none";
      }

      if (cfg.draggable && container) {
        root.style.left = "10px";
        root.style.top = "10px";
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount);
    } else {
      mount();
    }

    /* ---- Minimize / Restore ---- */
    function toggleMinimize() {
      minimized = !minimized;
      if (minimized) {
        root.classList.add(P + "minimized");
      } else {
        root.classList.remove(P + "minimized");
      }
    }

    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleMinimize();
    });

    titleBar.addEventListener("click", function () {
      if (minimized && !hasDragged) {
        toggleMinimize();
      }
    });

    /* ---- Opt In / Out ---- */
    optBtn.addEventListener("click", function () {
      optedIn = !optedIn;
      setStorage(optedIn);
      if (optedIn) {
        optBtn.classList.add(P + "opted-in");
        optBtn.textContent = "OPT OUT";
        if (typeof cfg.onOptIn === "function") cfg.onOptIn();
      } else {
        optBtn.classList.remove(P + "opted-in");
        optBtn.textContent = "OPT IN";
        if (typeof cfg.onOptOut === "function") cfg.onOptOut();
      }
    });

    /* ---- Jackpot counter ---- */
    intervalId = setInterval(function () {
      amount += cfg.incrementRate;
      els.amountText.textContent = formatAmount(amount);
    }, cfg.incrementInterval);

    /* ---- Glitch effect: rare (8-12s interval), brief (100ms) ---- */
    function triggerGlitch() {
      nameEl.classList.add(P + "glitch");
      setTimeout(function () {
        nameEl.classList.remove(P + "glitch");
      }, 100);
      glitchTimerId = setTimeout(triggerGlitch, 8000 + Math.random() * 4000);
    }
    glitchTimerId = setTimeout(triggerGlitch, 8000 + Math.random() * 4000);

    /* ---- Drag and Drop ---- */
    var onDragMove, onDragEnd;

    if (cfg.draggable) {
      function onDragStart(e) {
        /* Ignore clicks on the close button */
        if (e.target === closeBtn) return;

        dragging = true;
        hasDragged = false;

        var clientX, clientY;
        if (e.type === "touchstart") {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        var widgetRect = root.getBoundingClientRect();
        offsetX = clientX - widgetRect.left;
        offsetY = clientY - widgetRect.top;

        root.classList.add(P + "dragging");
        e.preventDefault();
      }

      onDragMove = function (e) {
        if (!dragging) return;

        var clientX, clientY;
        if (e.type === "touchmove") {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        var newLeft, newTop;

        if (container) {
          /* Container-relative dragging */
          var containerRect = container.getBoundingClientRect();
          newLeft = clientX - offsetX - containerRect.left;
          newTop = clientY - offsetY - containerRect.top;

          /* Clamp to container bounds */
          newLeft = Math.max(0, Math.min(newLeft, containerRect.width - root.offsetWidth));
          newTop = Math.max(0, Math.min(newTop, containerRect.height - root.offsetHeight));
        } else {
          /* Viewport-relative dragging (position: fixed) */
          newLeft = clientX - offsetX;
          newTop = clientY - offsetY;

          /* Clamp to viewport */
          newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - root.offsetWidth));
          newTop = Math.max(0, Math.min(newTop, window.innerHeight - root.offsetHeight));
        }

        if (Math.abs(newLeft - parseFloat(root.style.left || 0)) > 2 ||
            Math.abs(newTop - parseFloat(root.style.top || 0)) > 2) {
          hasDragged = true;
        }

        root.style.left = newLeft + "px";
        root.style.top = newTop + "px";
        root.style.right = "auto";
        root.style.bottom = "auto";
        root.style.transform = "none";

        e.preventDefault();
      };

      onDragEnd = function () {
        if (!dragging) return;
        dragging = false;
        root.classList.remove(P + "dragging");
      };

      titleBar.addEventListener("mousedown", onDragStart);
      document.addEventListener("mousemove", onDragMove);
      document.addEventListener("mouseup", onDragEnd);
      titleBar.addEventListener("touchstart", onDragStart, { passive: false });
      document.addEventListener("touchmove", onDragMove, { passive: false });
      document.addEventListener("touchend", onDragEnd);
    }

    /* ---- Destroy ---- */
    function destroy() {
      if (intervalId) clearInterval(intervalId);
      if (glitchTimerId) clearTimeout(glitchTimerId);
      if (root && root.parentNode) root.parentNode.removeChild(root);
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      if (cfg.draggable && onDragMove && onDragEnd) {
        document.removeEventListener("mousemove", onDragMove);
        document.removeEventListener("mouseup", onDragEnd);
        document.removeEventListener("touchmove", onDragMove);
        document.removeEventListener("touchend", onDragEnd);
      }
    }

    return { destroy: destroy };
  }

  window.JackpotCyberNeonWidget = { init: init };
})();
