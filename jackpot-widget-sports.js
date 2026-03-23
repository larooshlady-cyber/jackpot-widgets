(function () {
  "use strict";

  var DEFAULTS = {
    name: "Sports Jackpot",
    sport: "football",
    amount: 50000.00,
    currency: "EUR",
    currencySymbol: "EUR",
    incrementRate: 0.25,
    incrementInterval: 3000,
    position: "top-center",
    containerId: null,
    draggable: true,
    onOptIn: null,
    onOptOut: null
  };

  var LS_KEY = "jackpot_sports_optin";
  var PREFIX = "jw-sports-";
  var styleInjected = false;

  function fmt(value) {
    var parts = value.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts[0] + "." + parts[1];
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function positionCSS(pos) {
    switch (pos) {
      case "top-left": return "top:20px;left:20px;";
      case "top-right": return "top:20px;right:20px;";
      case "bottom-left": return "bottom:20px;left:20px;";
      case "bottom-right": return "bottom:20px;right:20px;";
      case "bottom-center": return "bottom:20px;left:50%;transform:translateX(-50%);";
      case "top-center":
      default: return "top:20px;left:50%;transform:translateX(-50%);";
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function injectCSS() {
    if (styleInjected) return;
    styleInjected = true;

    var css = [
      /* --- Stadium lights pulse --- */
      "@keyframes " + PREFIX + "light-pulse {",
      "  0%, 100% { opacity: 0.03; }",
      "  50% { opacity: 0.06; }",
      "}",

      /* --- Sweep animation --- */
      "@keyframes " + PREFIX + "sweep {",
      "  0%   { background-position: -100% 0; }",
      "  100% { background-position: 200% 0; }",
      "}",

      /* --- Root widget --- */
      "." + PREFIX + "root {",
      "  width: 210px;",
      "  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;",
      "  background:",
      "    repeating-linear-gradient(",
      "      90deg,",
      "      rgba(255,255,255,0.01) 0px,",
      "      rgba(255,255,255,0.01) 1px,",
      "      transparent 1px,",
      "      transparent 8px",
      "    ),",
      "    linear-gradient(180deg, #0a1e0a 0%, #081808 100%);",
      "  border: 1px solid rgba(255,255,255,0.12);",
      "  border-radius: 8px;",
      "  overflow: hidden;",
      "  z-index: 999999;",
      "  user-select: none;",
      "  box-shadow:",
      "    0 4px 16px rgba(0,0,0,0.5),",
      "    inset 0 0 0 2px rgba(255,255,255,0.04);",
      "  position: relative;",
      "}",

      /* --- Stadium light effects (top corners) --- */
      "." + PREFIX + "light-left,",
      "." + PREFIX + "light-right {",
      "  position: absolute;",
      "  top: 0;",
      "  width: 100px;",
      "  height: 100px;",
      "  pointer-events: none;",
      "  z-index: 2;",
      "  animation: " + PREFIX + "light-pulse 4s ease-in-out infinite;",
      "}",
      "." + PREFIX + "light-left {",
      "  left: 0;",
      "  background: radial-gradient(circle at top left, rgba(255,255,255,0.04), transparent 50%);",
      "}",
      "." + PREFIX + "light-right {",
      "  right: 0;",
      "  background: radial-gradient(circle at top right, rgba(255,255,255,0.04), transparent 50%);",
      "  animation-delay: 2s;",
      "}",

      /* --- Title bar --- */
      "." + PREFIX + "title-bar {",
      "  background: rgba(0,0,0,0.2);",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  padding: 8px 28px 8px 10px;",
      "  position: relative;",
      "  cursor: default;",
      "  z-index: 3;",
      "}",

      "." + PREFIX + "title-text {",
      "  color: #fff;",
      "  font-size: 10px;",
      "  font-weight: 700;",
      "  letter-spacing: 1.5px;",
      "  text-transform: uppercase;",
      "  text-align: center;",
      "  text-shadow: 0 1px 2px rgba(0,0,0,0.4);",
      "}",

      /* --- Title decorative line below --- */
      "." + PREFIX + "title-line {",
      "  position: absolute;",
      "  bottom: 0;",
      "  left: 0;",
      "  right: 0;",
      "  height: 1px;",
      "  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);",
      "}",

      /* --- Close button --- */
      "." + PREFIX + "close {",
      "  position: absolute;",
      "  top: 0;",
      "  right: 0;",
      "  width: 28px;",
      "  height: 100%;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  color: rgba(255,255,255,0.4);",
      "  font-size: 14px;",
      "  font-weight: 700;",
      "  cursor: pointer;",
      "  background: transparent;",
      "  border: none;",
      "  padding: 0;",
      "  line-height: 1;",
      "  z-index: 4;",
      "  transition: color 0.15s ease;",
      "}",
      "." + PREFIX + "close:hover {",
      "  color: rgba(255,255,255,0.7);",
      "}",

      /* --- Collapsible body --- */
      "." + PREFIX + "body {",
      "  transition: max-height 0.25s ease, opacity 0.25s ease;",
      "  max-height: 300px;",
      "  opacity: 1;",
      "  overflow: hidden;",
      "  position: relative;",
      "  z-index: 3;",
      "}",
      "." + PREFIX + "body." + PREFIX + "collapsed {",
      "  max-height: 0;",
      "  opacity: 0;",
      "}",

      /* --- Scoreboard panel --- */
      "." + PREFIX + "board {",
      "  background: #060606;",
      "  border: 1px solid rgba(60,100,60,0.2);",
      "  border-radius: 4px;",
      "  margin: 8px;",
      "  padding: 10px 10px 8px;",
      "  text-align: center;",
      "  box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);",
      "}",

      "." + PREFIX + "currency-label {",
      "  color: #3a7a3a;",
      "  font-size: 8px;",
      "  font-weight: 600;",
      "  letter-spacing: 0.5px;",
      "  margin-bottom: 2px;",
      "}",

      "." + PREFIX + "amount {",
      "  font-family: 'Courier New', Courier, monospace;",
      "  font-size: 20px;",
      "  font-weight: 700;",
      "  color: #e8b820;",
      "  white-space: nowrap;",
      "  text-shadow: 0 0 3px rgba(232,184,32,0.25);",
      "}",

      "." + PREFIX + "accent-line {",
      "  width: 40%;",
      "  height: 1px;",
      "  background: linear-gradient(90deg, transparent, rgba(40,100,40,0.2), transparent);",
      "  margin: 6px auto 0;",
      "}",

      /* --- Sport label --- */
      "." + PREFIX + "sport-label {",
      "  color: #3a7a3a;",
      "  font-size: 8px;",
      "  text-align: center;",
      "  margin: 6px 0 2px;",
      "  font-weight: 600;",
      "  text-transform: capitalize;",
      "  letter-spacing: 1px;",
      "}",

      /* --- Buttons --- */
      "." + PREFIX + "btn {",
      "  display: block;",
      "  width: calc(100% - 16px);",
      "  margin: 8px 8px 10px;",
      "  padding: 0;",
      "  height: 32px;",
      "  line-height: 32px;",
      "  border-radius: 6px;",
      "  font-size: 12px;",
      "  font-weight: 700;",
      "  letter-spacing: 0.5px;",
      "  text-transform: uppercase;",
      "  cursor: pointer;",
      "  text-align: center;",
      "  transition: filter 0.15s ease;",
      "}",
      "." + PREFIX + "btn:hover {",
      "  filter: brightness(1.1);",
      "}",

      "." + PREFIX + "btn-in {",
      "  background: linear-gradient(180deg, #1a6a20, #124a14);",
      "  color: #fff;",
      "  border: 1px solid rgba(0,0,0,0.3);",
      "}",

      "." + PREFIX + "btn-out {",
      "  background: #0a1a0a;",
      "  color: #3a5a3a;",
      "  border: 1px solid rgba(255,255,255,0.05);",
      "  box-shadow: none;",
      "}",

      /* --- Sweep overlay --- */
      "." + PREFIX + "sweep-wrap {",
      "  position: absolute; top: 0; left: 0; right: 0; bottom: 0;",
      "  overflow: hidden; border-radius: 8px; pointer-events: none; z-index: 3;",
      "}",
      "." + PREFIX + "sweep {",
      "  position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
      "  background: linear-gradient(110deg,",
      "    transparent 0%, transparent 40%,",
      "    rgba(200,255,200,0.06) 45%,",
      "    rgba(220,255,220,0.15) 49%,",
      "    rgba(255,255,255,0.22) 50%,",
      "    rgba(220,255,220,0.15) 51%,",
      "    rgba(200,255,200,0.06) 55%,",
      "    transparent 60%, transparent 100%);",
      "  background-size: 200% 100%;",
      "  background-repeat: no-repeat;",
      "  animation: " + PREFIX + "sweep 2.5s ease-in infinite;",
      "}"
    ].join("\n");

    var tag = document.createElement("style");
    tag.setAttribute("data-jw", "sports");
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  /* ============================
     Widget constructor
     ============================ */
  function Widget(cfg) {
    this.cfg = {};
    for (var k in DEFAULTS) {
      this.cfg[k] = cfg && cfg[k] !== undefined ? cfg[k] : DEFAULTS[k];
    }
    this.amount = this.cfg.amount;
    this.optedIn = localStorage.getItem(LS_KEY) === "1";
    this.minimised = false;
    this.timers = [];
    this.dom = {};
    this._dragging = false;
    this._dragOffsetX = 0;
    this._dragOffsetY = 0;
    this._container = null;
    this._boundDragMove = null;
    this._boundDragEnd = null;
    this._boundTouchMove = null;
    this._boundTouchEnd = null;
  }

  /* ============================
     Build DOM
     ============================ */
  Widget.prototype.build = function () {
    var c = this.cfg;

    injectCSS();

    var root = el("div", PREFIX + "root");

    /* Stadium light effects */
    root.appendChild(el("div", PREFIX + "light-left"));
    root.appendChild(el("div", PREFIX + "light-right"));

    /* Sweep overlay */
    var sweepWrap = el("div", PREFIX + "sweep-wrap");
    sweepWrap.appendChild(el("div", PREFIX + "sweep"));
    root.appendChild(sweepWrap);

    /* Position */
    if (c.containerId) {
      root.style.position = "absolute";
    } else {
      root.style.position = "fixed";
      root.style.cssText += positionCSS(c.position);
    }

    /* Title bar */
    var titleBar = el("div", PREFIX + "title-bar");
    titleBar.appendChild(el("span", PREFIX + "title-text", "SPORTS JACKPOT"));
    titleBar.appendChild(el("div", PREFIX + "title-line"));

    var closeBtn = el("button", PREFIX + "close", "x");
    closeBtn.title = "Minimise";
    titleBar.appendChild(closeBtn);
    root.appendChild(titleBar);

    /* Body */
    var body = el("div", PREFIX + "body");

    /* Scoreboard */
    var board = el("div", PREFIX + "board");
    var currLabel = el("div", PREFIX + "currency-label", c.currencySymbol);
    var amountEl = el("div", PREFIX + "amount", fmt(this.amount));
    var accentLine = el("div", PREFIX + "accent-line");
    board.appendChild(currLabel);
    board.appendChild(amountEl);
    board.appendChild(accentLine);
    body.appendChild(board);

    /* Sport label */
    var sportLabel = el("div", PREFIX + "sport-label", capitalize(c.sport));
    body.appendChild(sportLabel);

    /* Button */
    var btn = el("button", "", "");
    this._applyBtnState(btn);
    body.appendChild(btn);

    root.appendChild(body);

    this.dom.root = root;
    this.dom.titleBar = titleBar;
    this.dom.body = body;
    this.dom.amount = amountEl;
    this.dom.btn = btn;
    this.dom.close = closeBtn;
  };

  Widget.prototype._applyBtnState = function (btn) {
    if (!btn) btn = this.dom.btn;
    if (this.optedIn) {
      btn.className = PREFIX + "btn " + PREFIX + "btn-out";
      btn.textContent = "OPT OUT";
    } else {
      btn.className = PREFIX + "btn " + PREFIX + "btn-in";
      btn.textContent = "OPT IN";
    }
  };

  /* ============================
     Attach to DOM
     ============================ */
  Widget.prototype.attach = function () {
    var target;
    if (this.cfg.containerId) {
      target = document.getElementById(this.cfg.containerId);
    }
    if (!target) target = document.body;
    target.appendChild(this.dom.root);
    this._container = target;
  };

  /* ============================
     Event bindings
     ============================ */
  Widget.prototype.bind = function () {
    var self = this;

    /* Close / minimise */
    this.dom.close.addEventListener("click", function (e) {
      e.stopPropagation();
      self.minimised = !self.minimised;
      if (self.minimised) {
        self.dom.body.classList.add(PREFIX + "collapsed");
      } else {
        self.dom.body.classList.remove(PREFIX + "collapsed");
      }
    });

    /* Opt in / out */
    this.dom.btn.addEventListener("click", function () {
      self.optedIn = !self.optedIn;
      localStorage.setItem(LS_KEY, self.optedIn ? "1" : "0");
      self._applyBtnState();
      if (self.optedIn && typeof self.cfg.onOptIn === "function") {
        self.cfg.onOptIn();
      }
      if (!self.optedIn && typeof self.cfg.onOptOut === "function") {
        self.cfg.onOptOut();
      }
    });

    /* Jackpot increment */
    var incTimer = setInterval(function () {
      self.amount += self.cfg.incrementRate;
      self.dom.amount.textContent = fmt(self.amount);
    }, this.cfg.incrementInterval);
    this.timers.push(incTimer);

    /* Drag and drop */
    if (this.cfg.draggable) {
      this._initDraggable();
    }
  };

  /* ============================
     Drag and drop
     ============================ */
  Widget.prototype._initDraggable = function () {
    var self = this;
    var widget = this.dom.root;
    var titleBar = this.dom.titleBar;
    var container = this._container;
    var offsetX = 0;
    var offsetY = 0;

    titleBar.style.cursor = "grab";

    function onStart(clientX, clientY) {
      self._dragging = true;
      titleBar.style.cursor = "grabbing";

      var containerRect = container.getBoundingClientRect();
      var widgetRect = widget.getBoundingClientRect();

      offsetX = clientX - widgetRect.left;
      offsetY = clientY - widgetRect.top;

      /* If this is the first drag, snap widget to absolute coordinates */
      var newLeft = widgetRect.left - containerRect.left;
      var newTop = widgetRect.top - containerRect.top;
      widget.style.left = newLeft + "px";
      widget.style.top = newTop + "px";
      widget.style.right = "auto";
      widget.style.bottom = "auto";
      widget.style.transform = "none";
    }

    function onMove(clientX, clientY) {
      if (!self._dragging) return;

      var containerRect = container.getBoundingClientRect();
      var newLeft = clientX - offsetX - containerRect.left;
      var newTop = clientY - offsetY - containerRect.top;

      /* Clamp within container bounds */
      newLeft = Math.max(0, Math.min(newLeft, containerRect.width - widget.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, containerRect.height - widget.offsetHeight));

      widget.style.left = newLeft + "px";
      widget.style.top = newTop + "px";
      widget.style.right = "auto";
      widget.style.bottom = "auto";
      widget.style.transform = "none";
    }

    function onEnd() {
      if (!self._dragging) return;
      self._dragging = false;
      titleBar.style.cursor = "grab";
    }

    /* Mouse events */
    function mouseDown(e) {
      if (e.target === self.dom.close) return;
      e.preventDefault();
      onStart(e.clientX, e.clientY);
    }

    function mouseMove(e) {
      onMove(e.clientX, e.clientY);
    }

    function mouseUp() {
      onEnd();
    }

    /* Touch events */
    function touchStart(e) {
      if (e.target === self.dom.close) return;
      var t = e.touches[0];
      onStart(t.clientX, t.clientY);
    }

    function touchMove(e) {
      if (!self._dragging) return;
      e.preventDefault();
      var t = e.touches[0];
      onMove(t.clientX, t.clientY);
    }

    function touchEnd() {
      onEnd();
    }

    titleBar.addEventListener("mousedown", mouseDown);
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);

    titleBar.addEventListener("touchstart", touchStart, { passive: true });
    document.addEventListener("touchmove", touchMove, { passive: false });
    document.addEventListener("touchend", touchEnd);

    /* Store references for cleanup */
    this._boundMouseDown = mouseDown;
    this._boundDragMove = mouseMove;
    this._boundDragEnd = mouseUp;
    this._boundTouchStart = touchStart;
    this._boundTouchMove = touchMove;
    this._boundTouchEnd = touchEnd;
  };

  /* ============================
     Destroy
     ============================ */
  Widget.prototype.destroy = function () {
    for (var i = 0; i < this.timers.length; i++) {
      clearInterval(this.timers[i]);
    }
    this.timers = [];

    if (this._boundDragMove) {
      document.removeEventListener("mousemove", this._boundDragMove);
      document.removeEventListener("mouseup", this._boundDragEnd);
    }
    if (this._boundTouchMove) {
      document.removeEventListener("touchmove", this._boundTouchMove);
      document.removeEventListener("touchend", this._boundTouchEnd);
    }

    if (this.dom.root && this.dom.root.parentNode) {
      this.dom.root.parentNode.removeChild(this.dom.root);
    }
  };

  /* ============================
     Public API
     ============================ */
  var instance = null;

  function doInit(config) {
    if (instance) instance.destroy();
    instance = new Widget(config);
    instance.build();
    instance.attach();
    instance.bind();
    return {
      destroy: function () {
        instance.destroy();
        instance = null;
      }
    };
  }

  window.JackpotSportsWidget = {
    init: function (config) {
      if (document.readyState === "loading") {
        var result = {};
        var pending = true;
        document.addEventListener("DOMContentLoaded", function () {
          var handle = doInit(config);
          result.destroy = handle.destroy;
          pending = false;
        });
        result.destroy = function () {
          if (!pending && instance) {
            instance.destroy();
            instance = null;
          }
        };
        return result;
      }
      return doInit(config);
    }
  };
})();
