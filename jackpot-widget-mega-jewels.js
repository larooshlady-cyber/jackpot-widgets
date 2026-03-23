/**
 * Mega Jewels Jackpot Widget
 * Premium floating jackpot display with realistic luxury jewel/gold theme.
 * Self-contained IIFE: injects its own CSS + HTML. No external dependencies.
 */
(function () {
  "use strict";

  /* --- Default configuration --- */
  var DEFAULTS = {
    name: "Mega Jackpot",
    subtitle: "JEWELS",
    amount: 2500000.0,
    currency: "EUR",
    currencySymbol: "EUR",
    incrementRate: 1.23,
    incrementInterval: 2000,
    position: "top-center",
    containerId: null,
    draggable: true,
    onOptIn: null,
    onOptOut: null
  };

  var STORAGE_KEY = "jackpot_mega_jewels_optin";
  var PREFIX = "jw-mega-";
  var instance = null;

  /* --- Helpers --- */
  function merge(defaults, overrides) {
    var out = {};
    for (var k in defaults) {
      if (defaults.hasOwnProperty(k)) {
        out[k] =
          overrides && overrides.hasOwnProperty(k) ? overrides[k] : defaults[k];
      }
    }
    return out;
  }

  function formatAmount(n) {
    var parts = n.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  function isOptedIn() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setOptIn(val) {
    try {
      if (val) localStorage.setItem(STORAGE_KEY, "1");
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* silent */
    }
  }

  /* --- CSS Injection --- */
  function injectStyles() {
    if (document.getElementById(PREFIX + "styles")) return;

    var css = [
      /* ---- Gold title shimmer (vertical) ---- */
      "@keyframes " + PREFIX + "shimmer {",
      "  0%   { background-position-y: 0%; }",
      "  100% { background-position-y: 200%; }",
      "}",

      /* ---- Light sweep across entire widget ---- */
      "@keyframes " + PREFIX + "sweep {",
      "  0%   { background-position: -100% 0; }",
      "  100% { background-position: 200% 0; }",
      "}",

      /* ---- Position classes (fixed mode) ---- */
      "." + PREFIX + "pos-top-center    { top: 10px; left: 50%; transform: translateX(-50%); }",
      "." + PREFIX + "pos-top-left      { top: 10px; left: 10px; }",
      "." + PREFIX + "pos-top-right     { top: 10px; right: 10px; }",
      "." + PREFIX + "pos-bottom-center { bottom: 10px; left: 50%; transform: translateX(-50%); }",
      "." + PREFIX + "pos-bottom-left   { bottom: 10px; left: 10px; }",
      "." + PREFIX + "pos-bottom-right  { bottom: 10px; right: 10px; }",

      /* ---- Root container ---- */
      "." + PREFIX + "root {",
      "  position: fixed;",
      "  z-index: 999999;",
      "  width: 240px;",
      "  font-family: Arial, Helvetica, sans-serif;",
      "  user-select: none;",
      "  -webkit-user-select: none;",
      "  border-radius: 12px;",
      "  background: linear-gradient(180deg, #18082e 0%, #220e44 40%, #160830 100%);",
      "  border: none;",
      "  box-shadow: 0 0 0 1px #8a6420, 0 0 0 3px #1a0830, 0 0 0 4px rgba(180,140,50,0.3), 0 4px 20px rgba(0,0,0,0.5);",
      "  overflow: visible;",
      "}",

      /* ---- Embedded mode ---- */
      "." + PREFIX + "root." + PREFIX + "embedded {",
      "  position: relative;",
      "  top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;",
      "  transform: none !important;",
      "}",
      "." + PREFIX + "root." + PREFIX + "dragging {",
      "  cursor: grabbing !important;",
      "}",
      "." + PREFIX + "root." + PREFIX + "dragging ." + PREFIX + "title-bar {",
      "  cursor: grabbing !important;",
      "}",

      /* ---- Title bar ---- */
      "." + PREFIX + "title-bar {",
      "  position: relative;",
      "  padding: 14px 28px 10px;",
      "  text-align: center;",
      "  cursor: grab;",
      "}",
      "." + PREFIX + "title-bar." + PREFIX + "no-drag {",
      "  cursor: default;",
      "}",

      /* Title text with metallic gold gradient + vertical shimmer */
      "." + PREFIX + "title-name {",
      "  display: block;",
      "  font-size: 13px;",
      "  font-weight: 700;",
      "  text-transform: uppercase;",
      "  letter-spacing: 1.5px;",
      "  line-height: 1.3;",
      "  color: #c49a30;",
      "  background: linear-gradient(180deg, #f5e6a0, #c49a30, #8b6a18, #c49a30, #f5e6a0);",
      "  background-size: 100% 200%;",
      "  -webkit-background-clip: text;",
      "  background-clip: text;",
      "  -webkit-text-fill-color: transparent;",
      "  animation: " + PREFIX + "shimmer 4s linear infinite;",
      "}",

      /* Subtitle */
      "." + PREFIX + "title-subtitle {",
      "  display: block;",
      "  font-size: 9px;",
      "  font-weight: 600;",
      "  color: #9a78c0;",
      "  letter-spacing: 3px;",
      "  line-height: 1.3;",
      "  margin-top: 2px;",
      "  text-transform: uppercase;",
      "}",

      /* ---- Close button ---- */
      "." + PREFIX + "close {",
      "  position: absolute;",
      "  top: 6px; right: 6px;",
      "  width: 18px; height: 18px;",
      "  background: transparent;",
      "  border: none;",
      "  color: #c49a30;",
      "  font-size: 12px;",
      "  line-height: 18px;",
      "  text-align: center;",
      "  cursor: pointer;",
      "  padding: 0;",
      "  z-index: 3;",
      "  opacity: 0.4;",
      "  transition: opacity 0.2s;",
      "  font-family: Arial, Helvetica, sans-serif;",
      "}",
      "." + PREFIX + "close:hover {",
      "  opacity: 0.7;",
      "}",

      /* ---- Decorative separator ---- */
      "." + PREFIX + "separator {",
      "  height: 1px;",
      "  background: linear-gradient(90deg, transparent 10%, rgba(180,140,50,0.25) 50%, transparent 90%);",
      "  margin: 0 16px;",
      "}",

      /* ---- Body area ---- */
      "." + PREFIX + "body {",
      "  position: relative;",
      "  padding: 12px 16px 14px;",
      "  text-align: center;",
      "}",

      /* ---- Currency pill ---- */
      "." + PREFIX + "currency-badge {",
      "  display: inline-block;",
      "  font-size: 8px;",
      "  font-weight: 700;",
      "  color: #c49a30;",
      "  background: rgba(180,140,50,0.1);",
      "  border: 1px solid rgba(180,140,50,0.2);",
      "  border-radius: 10px;",
      "  padding: 2px 10px;",
      "  letter-spacing: 1px;",
      "  margin-bottom: 8px;",
      "}",

      /* ---- Amount display area (recessed panel) ---- */
      "." + PREFIX + "amount-box {",
      "  position: relative;",
      "  background: rgba(0,0,0,0.25);",
      "  border: 1px solid rgba(180,140,50,0.15);",
      "  border-radius: 8px;",
      "  padding: 10px;",
      "  margin-bottom: 8px;",
      "  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);",
      "}",

      /* ---- Diamond decorations (static, subtle) ---- */
      "." + PREFIX + "diamond {",
      "  position: absolute;",
      "  width: 10px;",
      "  height: 10px;",
      "  transform: rotate(45deg);",
      "  background: linear-gradient(135deg, rgba(200,220,255,0.8), rgba(120,160,220,0.4));",
      "  box-shadow: 0 0 4px rgba(120,160,220,0.3);",
      "  z-index: 1;",
      "}",
      "." + PREFIX + "diamond--left {",
      "  left: 6px;",
      "  top: 50%;",
      "  margin-top: -5px;",
      "}",
      "." + PREFIX + "diamond--right {",
      "  right: 6px;",
      "  top: 50%;",
      "  margin-top: -5px;",
      "}",

      /* ---- Amount text with metallic gold gradient ---- */
      "." + PREFIX + "amount {",
      "  display: block;",
      "  font-family: 'Courier New', Courier, monospace;",
      "  font-size: 22px;",
      "  font-weight: 700;",
      "  color: #c49a30;",
      "  background: linear-gradient(180deg, #f5e6a0, #c49a30, #8b6a18, #c49a30, #f5e6a0);",
      "  background-size: 100% 200%;",
      "  -webkit-background-clip: text;",
      "  background-clip: text;",
      "  -webkit-text-fill-color: transparent;",
      "  text-shadow: none;",
      "  line-height: 1.2;",
      "  position: relative;",
      "  z-index: 2;",
      "}",

      /* ---- MEGA pill badge ---- */
      "." + PREFIX + "badge {",
      "  display: inline-block;",
      "  font-size: 8px;",
      "  font-weight: 700;",
      "  color: #c49a30;",
      "  background: rgba(180,140,50,0.12);",
      "  border: 1px solid rgba(180,140,50,0.2);",
      "  border-radius: 10px;",
      "  padding: 2px 10px;",
      "  letter-spacing: 2px;",
      "  text-transform: uppercase;",
      "  margin-top: 6px;",
      "}",

      /* ---- OPT IN / OPT OUT buttons ---- */
      "." + PREFIX + "btn {",
      "  display: block;",
      "  width: 100%;",
      "  height: 34px;",
      "  border: none;",
      "  border-radius: 8px;",
      "  font-size: 11px;",
      "  font-weight: 700;",
      "  letter-spacing: 1.5px;",
      "  cursor: pointer;",
      "  text-align: center;",
      "  line-height: 34px;",
      "  padding: 0;",
      "  margin-top: 10px;",
      "  transition: filter 0.2s;",
      "  font-family: Arial, Helvetica, sans-serif;",
      "}",
      "." + PREFIX + "btn:hover {",
      "  filter: brightness(1.06);",
      "}",
      "." + PREFIX + "btn--opt-in {",
      "  background: linear-gradient(180deg, #b8920e, #8a6a08);",
      "  color: #ffffff;",
      "  border: 1px solid rgba(255,255,255,0.1);",
      "}",
      "." + PREFIX + "btn--opted-in {",
      "  background: rgba(255,255,255,0.04);",
      "  color: #776655;",
      "  border: 1px solid rgba(255,255,255,0.06);",
      "}",

      /* ---- Minimized state ---- */
      "." + PREFIX + "root." + PREFIX + "minimized ." + PREFIX + "separator {",
      "  display: none;",
      "}",
      "." + PREFIX + "root." + PREFIX + "minimized ." + PREFIX + "body {",
      "  display: none;",
      "}",
      "." + PREFIX + "root." + PREFIX + "minimized {",
      "  border-radius: 12px;",
      "}",
      "." + PREFIX + "root." + PREFIX + "minimized ." + PREFIX + "title-bar {",
      "  border-radius: 10px;",
      "}",

      /* ---- Light sweep overlay ---- */
      "." + PREFIX + "sweep-wrap {",
      "  position: absolute; top: 0; left: 0; right: 0; bottom: 0;",
      "  overflow: hidden; border-radius: 12px; pointer-events: none; z-index: 3;",
      "}",
      "." + PREFIX + "sweep {",
      "  position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
      "  background: linear-gradient(110deg,",
      "    transparent 0%, transparent 40%,",
      "    rgba(200,180,240,0.12) 45%,",
      "    rgba(220,200,255,0.28) 49%,",
      "    rgba(240,230,255,0.35) 50%,",
      "    rgba(220,200,255,0.28) 51%,",
      "    rgba(200,180,240,0.12) 55%,",
      "    transparent 60%, transparent 100%);",
      "  background-size: 200% 100%;",
      "  background-repeat: no-repeat;",
      "  animation: " + PREFIX + "sweep 2.5s ease-in infinite;",
      "}"
    ].join("\n");

    var style = document.createElement("style");
    style.id = PREFIX + "styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* --- Build the DOM --- */
  function buildWidget(cfg) {
    /* root */
    var root = document.createElement("div");
    root.className = PREFIX + "root";

    if (!cfg.containerId) {
      var posClass = PREFIX + "pos-" + cfg.position.replace(/\s+/g, "-");
      root.classList.add(posClass);
    }

    /* ---- Title bar ---- */
    var titleBar = document.createElement("div");
    titleBar.className = PREFIX + "title-bar";
    if (!cfg.draggable) {
      titleBar.classList.add(PREFIX + "no-drag");
    }

    var titleName = document.createElement("span");
    titleName.className = PREFIX + "title-name";
    titleName.textContent = "MEGA JACKPOT";

    var titleSubtitle = document.createElement("span");
    titleSubtitle.className = PREFIX + "title-subtitle";
    titleSubtitle.textContent = cfg.subtitle;

    /* Close button */
    var closeBtn = document.createElement("button");
    closeBtn.className = PREFIX + "close";
    closeBtn.textContent = "x";
    closeBtn.title = "Minimize";

    titleBar.appendChild(titleName);
    titleBar.appendChild(titleSubtitle);
    titleBar.appendChild(closeBtn);
    root.appendChild(titleBar);

    /* ---- Decorative separator ---- */
    var separator = document.createElement("div");
    separator.className = PREFIX + "separator";
    root.appendChild(separator);

    /* ---- Body ---- */
    var body = document.createElement("div");
    body.className = PREFIX + "body";

    /* Currency pill */
    var curBadge = document.createElement("span");
    curBadge.className = PREFIX + "currency-badge";
    curBadge.textContent = cfg.currencySymbol;
    body.appendChild(curBadge);

    /* Amount display box (recessed panel) */
    var amountBox = document.createElement("div");
    amountBox.className = PREFIX + "amount-box";

    /* Diamond decorations */
    var diamondLeft = document.createElement("div");
    diamondLeft.className = PREFIX + "diamond " + PREFIX + "diamond--left";
    amountBox.appendChild(diamondLeft);

    var diamondRight = document.createElement("div");
    diamondRight.className = PREFIX + "diamond " + PREFIX + "diamond--right";
    amountBox.appendChild(diamondRight);

    /* Amount text with gold gradient */
    var amount = document.createElement("span");
    amount.className = PREFIX + "amount";
    amount.textContent = formatAmount(cfg.amount);
    amountBox.appendChild(amount);

    body.appendChild(amountBox);

    /* MEGA pill badge */
    var badge = document.createElement("div");
    badge.className = PREFIX + "badge";
    badge.textContent = "MEGA";
    body.appendChild(badge);

    /* Opt in/out button */
    var optedIn = isOptedIn();
    var btn = document.createElement("button");
    btn.className =
      PREFIX + "btn " + (optedIn ? PREFIX + "btn--opted-in" : PREFIX + "btn--opt-in");
    btn.textContent = optedIn ? "OPT OUT" : "OPT IN";
    body.appendChild(btn);

    root.appendChild(body);

    /* ---- Light sweep overlay ---- */
    var sweepWrap = document.createElement("div");
    sweepWrap.className = PREFIX + "sweep-wrap";
    var sweepEl = document.createElement("div");
    sweepEl.className = PREFIX + "sweep";
    sweepWrap.appendChild(sweepEl);
    root.appendChild(sweepWrap);

    /* ---- Interaction handlers ---- */

    /* Minimize / restore */
    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      root.classList.add(PREFIX + "minimized");
    });

    titleBar.addEventListener("click", function (e) {
      if (root.classList.contains(PREFIX + "minimized") && e.target !== closeBtn) {
        root.classList.remove(PREFIX + "minimized");
      }
    });

    /* Opt in/out */
    btn.addEventListener("click", function () {
      var nowIn = isOptedIn();
      if (nowIn) {
        setOptIn(false);
        btn.className = PREFIX + "btn " + PREFIX + "btn--opt-in";
        btn.textContent = "OPT IN";
        if (typeof cfg.onOptOut === "function") cfg.onOptOut();
      } else {
        setOptIn(true);
        btn.className = PREFIX + "btn " + PREFIX + "btn--opted-in";
        btn.textContent = "OPT OUT";
        if (typeof cfg.onOptIn === "function") cfg.onOptIn();
      }
    });

    /* ---- Draggable ---- */
    if (cfg.draggable) {
      setupDrag(root, titleBar, closeBtn, cfg);
    }

    return { root: root, amountEl: amount };
  }

  /* --- Drag logic (mouse + touch) --- */
  function setupDrag(widget, handle, closeBtn, cfg) {
    var isDragging = false;
    var offsetX = 0;
    var offsetY = 0;

    function getClient(e) {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    }

    function convertToExplicitPosition() {
      var rect = widget.getBoundingClientRect();
      var container = cfg.containerId ? widget.parentNode : null;
      if (container && container !== document.body) {
        var containerRect = container.getBoundingClientRect();
        widget.style.left = (rect.left - containerRect.left) + "px";
        widget.style.top = (rect.top - containerRect.top) + "px";
      } else {
        widget.style.left = rect.left + "px";
        widget.style.top = rect.top + "px";
      }
      widget.style.right = "auto";
      widget.style.bottom = "auto";
      widget.style.transform = "none";
    }

    function onStart(e) {
      if (e.target === closeBtn) return;
      if (widget.classList.contains(PREFIX + "minimized")) return;

      e.preventDefault();
      convertToExplicitPosition();

      var client = getClient(e);
      var widgetRect = widget.getBoundingClientRect();
      offsetX = client.x - widgetRect.left;
      offsetY = client.y - widgetRect.top;

      isDragging = true;
      widget.classList.add(PREFIX + "dragging");
    }

    function onMove(e) {
      if (!isDragging) return;
      e.preventDefault();

      var client = getClient(e);
      var container = cfg.containerId ? widget.parentNode : null;
      var newLeft, newTop, maxW, maxH;

      if (container && container !== document.body) {
        var containerRect = container.getBoundingClientRect();
        newLeft = client.x - offsetX - containerRect.left;
        newTop = client.y - offsetY - containerRect.top;
        maxW = containerRect.width - widget.offsetWidth;
        maxH = containerRect.height - widget.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxW));
        newTop = Math.max(0, Math.min(newTop, maxH));
      } else {
        newLeft = client.x - offsetX;
        newTop = client.y - offsetY;
        maxW = window.innerWidth - widget.offsetWidth;
        maxH = window.innerHeight - widget.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxW));
        newTop = Math.max(0, Math.min(newTop, maxH));
      }

      widget.style.left = newLeft + "px";
      widget.style.top = newTop + "px";
      widget.style.right = "auto";
      widget.style.bottom = "auto";
      widget.style.transform = "none";
    }

    function onEnd() {
      if (!isDragging) return;
      isDragging = false;
      widget.classList.remove(PREFIX + "dragging");
    }

    handle.addEventListener("mousedown", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);

    handle.addEventListener("touchstart", onStart, { passive: false });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);

    widget._dragCleanup = function () {
      handle.removeEventListener("mousedown", onStart);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      handle.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }

  /* --- Ticker logic --- */
  function startTicker(cfg, amountEl) {
    var current = cfg.amount;
    var timer = setInterval(function () {
      current += cfg.incrementRate;
      amountEl.textContent = formatAmount(current);
    }, cfg.incrementInterval);
    return timer;
  }

  /* --- Mount helper --- */
  function mount(cfg, built) {
    if (cfg.containerId) {
      var container = document.getElementById(cfg.containerId);
      if (container) {
        if (cfg.draggable) {
          built.root.style.position = "absolute";
        }
        container.appendChild(built.root);
      } else {
        document.body.appendChild(built.root);
      }
    } else {
      document.body.appendChild(built.root);
    }
  }

  /* --- Public API --- */
  var Widget = {
    _timer: null,

    init: function (config) {
      if (instance) {
        if (instance.root) {
          if (instance.root._dragCleanup) instance.root._dragCleanup();
          if (instance.root.parentNode) {
            instance.root.parentNode.removeChild(instance.root);
          }
        }
        if (Widget._timer) clearInterval(Widget._timer);
      }

      var cfg = merge(DEFAULTS, config);
      injectStyles();

      var built = buildWidget(cfg);
      instance = built;

      function doMount() {
        mount(cfg, built);
        Widget._timer = startTicker(cfg, built.amountEl);
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", doMount);
      } else {
        doMount();
      }

      return {
        destroy: Widget.destroy
      };
    },

    destroy: function () {
      if (Widget._timer) clearInterval(Widget._timer);
      if (instance && instance.root) {
        if (instance.root._dragCleanup) instance.root._dragCleanup();
        if (instance.root.parentNode) {
          instance.root.parentNode.removeChild(instance.root);
        }
      }
      instance = null;
    }
  };

  window.JackpotMegaJewelsWidget = Widget;
})();
