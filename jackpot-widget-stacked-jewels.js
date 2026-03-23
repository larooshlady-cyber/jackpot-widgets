(function () {
  "use strict";

  var DEFAULTS = {
    name: "Jackpot Jewels",
    tiers: [
      { name: "Gold", amount: 1000000.00, color: "#FFD700" },
      { name: "Silver", amount: 10000.00, color: "#C0C0C0" },
      { name: "Bronze", amount: 100.00, color: "#CD7F32" }
    ],
    currency: "EUR",
    currencySymbol: "EUR",
    incrementRate: 0.50,
    incrementInterval: 2500,
    position: "top-left",
    containerId: null,
    draggable: true,
    onOptIn: null,
    onOptOut: null
  };

  var LS_KEY = "jackpot_stacked_jewels_optin";
  var STYLE_ID = "jw-sjewels-style";

  function buildCSS() {
    return [
      /* Sparkle keyframes — subtle pulse, max 0.4 opacity */
      "@keyframes jw-sjewels-sparkle {",
      "  0%, 100% { opacity: 0; transform: scale(0.8); }",
      "  50% { opacity: 0.4; transform: scale(1); }",
      "}",

      /* Light sweep — gold-tinted band crossing the card */
      "@keyframes jw-sjewels-sweep {",
      "  0%   { background-position: -100% 0; }",
      "  100% { background-position: 200% 0; }",
      "}",

      /* Title shimmer — slow 5s vertical cycle */
      "@keyframes jw-sjewels-shimmer {",
      "  0% { background-position: 0% 0%; }",
      "  50% { background-position: 0% 100%; }",
      "  100% { background-position: 0% 0%; }",
      "}",

      /* Card */
      ".jw-sjewels-card {",
      "  width: 200px;",
      "  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;",
      "  background: #08081a;",
      "  border-radius: 10px;",
      "  border: 1px solid #8a6a18;",
      "  overflow: visible;",
      "  user-select: none;",
      "  z-index: 999999;",
      "  box-shadow: 0 0 0 1px #8a6a18, 0 0 0 2px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.5);",
      "  position: relative;",
      "}",

      /* Corner diamonds — top corners via card pseudo-elements */
      ".jw-sjewels-card::before,",
      ".jw-sjewels-card::after {",
      "  content: '';",
      "  position: absolute;",
      "  width: 5px;",
      "  height: 5px;",
      "  background: #8a6a18;",
      "  transform: rotate(45deg);",
      "  z-index: 2;",
      "  pointer-events: none;",
      "}",
      ".jw-sjewels-card::before {",
      "  top: -3px;",
      "  left: -3px;",
      "}",
      ".jw-sjewels-card::after {",
      "  top: -3px;",
      "  right: -3px;",
      "}",

      /* Inner wrapper for bottom corner diamonds */
      ".jw-sjewels-inner {",
      "  position: relative;",
      "  border-radius: 9px;",
      "  overflow: hidden;",
      "}",
      ".jw-sjewels-inner::before,",
      ".jw-sjewels-inner::after {",
      "  content: '';",
      "  position: absolute;",
      "  width: 5px;",
      "  height: 5px;",
      "  background: #8a6a18;",
      "  transform: rotate(45deg);",
      "  z-index: 2;",
      "  pointer-events: none;",
      "}",
      ".jw-sjewels-inner::before {",
      "  bottom: -3px;",
      "  left: -3px;",
      "}",
      ".jw-sjewels-inner::after {",
      "  bottom: -3px;",
      "  right: -3px;",
      "}",

      /* Sparkle dots */
      ".jw-sjewels-sparkle {",
      "  position: absolute;",
      "  width: 1.5px;",
      "  height: 1.5px;",
      "  border-radius: 50%;",
      "  background: #8a6a18;",
      "  pointer-events: none;",
      "  animation: jw-sjewels-sparkle 3s ease-in-out infinite;",
      "  z-index: 3;",
      "}",

      /* Positioning */
      ".jw-sjewels-fixed {",
      "  position: fixed;",
      "}",
      ".jw-sjewels-absolute {",
      "  position: absolute;",
      "}",
      ".jw-sjewels-in-container {",
      "  position: relative;",
      "}",
      ".jw-sjewels-pos-top-left { top: 18px; left: 18px; }",
      ".jw-sjewels-pos-top-right { top: 18px; right: 18px; }",
      ".jw-sjewels-pos-bottom-left { bottom: 18px; left: 18px; }",
      ".jw-sjewels-pos-bottom-right { bottom: 18px; right: 18px; }",

      /* Title bar */
      ".jw-sjewels-titlebar {",
      "  position: relative;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: center;",
      "  padding: 10px 8px;",
      "  background: linear-gradient(180deg, #10101e, #0c0c18);",
      "  cursor: default;",
      "}",
      ".jw-sjewels-titlebar.jw-sjewels-draggable {",
      "  cursor: grab;",
      "}",
      ".jw-sjewels-titlebar.jw-sjewels-dragging {",
      "  cursor: grabbing;",
      "}",

      /* Decorative separator below title bar */
      ".jw-sjewels-separator {",
      "  height: 1px;",
      "  background: linear-gradient(90deg, transparent, rgba(138,106,24,0.15), transparent);",
      "}",

      /* Title text with metallic gold gradient + slow shimmer */
      ".jw-sjewels-title {",
      "  font-size: 11px;",
      "  font-weight: 700;",
      "  letter-spacing: 1px;",
      "  text-transform: uppercase;",
      "  background: linear-gradient(180deg, #e8d088, #b08828, #e8d088);",
      "  background-size: 100% 200%;",
      "  -webkit-background-clip: text;",
      "  -webkit-text-fill-color: transparent;",
      "  background-clip: text;",
      "  text-shadow: none;",
      "  white-space: nowrap;",
      "  animation: jw-sjewels-shimmer 5s ease-in-out infinite;",
      "}",

      /* Diamond flankers */
      ".jw-sjewels-title-diamond {",
      "  color: #8a6a18;",
      "  font-size: 7px;",
      "  margin: 0 5px;",
      "  line-height: 1;",
      "}",

      /* Minimize / close button */
      ".jw-sjewels-minimize {",
      "  position: absolute;",
      "  top: 50%;",
      "  right: 8px;",
      "  transform: translateY(-50%);",
      "  background: none;",
      "  border: none;",
      "  color: #8a6a18;",
      "  opacity: 0.4;",
      "  font-size: 13px;",
      "  line-height: 1;",
      "  cursor: pointer;",
      "  padding: 2px 4px;",
      "  font-family: inherit;",
      "  z-index: 5;",
      "}",
      ".jw-sjewels-minimize:hover {",
      "  opacity: 0.7;",
      "}",

      /* Body */
      ".jw-sjewels-body {",
      "  overflow: hidden;",
      "  max-height: 400px;",
      "  transition: max-height 0.3s ease, opacity 0.3s ease;",
      "  opacity: 1;",
      "}",
      ".jw-sjewels-body.jw-sjewels-collapsed {",
      "  max-height: 0;",
      "  opacity: 0;",
      "}",

      /* Tiers container */
      ".jw-sjewels-tiers {",
      "  padding: 0;",
      "  margin: 0;",
      "}",

      /* Tier row */
      ".jw-sjewels-tier {",
      "  position: relative;",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: space-between;",
      "  padding: 9px 10px 9px 10px;",
      "  border-left: 3px solid var(--jw-tier-accent);",
      "  transition: background 0.2s ease;",
      "}",
      /* Tier background tint at 2% opacity */
      ".jw-sjewels-tier::before {",
      "  content: '';",
      "  position: absolute;",
      "  top: 0;",
      "  left: 0;",
      "  right: 0;",
      "  bottom: 0;",
      "  background: var(--jw-tier-color);",
      "  opacity: 0.02;",
      "  pointer-events: none;",
      "  transition: opacity 0.2s ease;",
      "}",
      ".jw-sjewels-tier:hover::before {",
      "  opacity: 0.03;",
      "}",

      /* Gold tier special sizing */
      ".jw-sjewels-tier-gold {",
      "  padding: 11px 10px 11px 10px;",
      "}",
      ".jw-sjewels-tier-gold .jw-sjewels-tier-amount {",
      "  font-size: 15px;",
      "}",

      /* Silver tier */
      ".jw-sjewels-tier-silver {",
      "  padding: 9px 10px 9px 10px;",
      "}",
      ".jw-sjewels-tier-silver .jw-sjewels-tier-amount {",
      "  font-size: 13px;",
      "}",

      /* Bronze tier */
      ".jw-sjewels-tier-bronze {",
      "  padding: 8px 10px 8px 10px;",
      "}",
      ".jw-sjewels-tier-bronze .jw-sjewels-tier-amount {",
      "  font-size: 11px;",
      "}",

      /* Separator between tiers */
      ".jw-sjewels-tier + .jw-sjewels-tier {",
      "  border-top: 1px solid rgba(255,255,255,0.04);",
      "}",

      /* Tier left section with name */
      ".jw-sjewels-tier-left {",
      "  display: flex;",
      "  align-items: center;",
      "}",

      /* Tier name */
      ".jw-sjewels-tier-name {",
      "  font-size: 9px;",
      "  font-weight: 700;",
      "  text-transform: uppercase;",
      "  color: var(--jw-tier-name);",
      "  letter-spacing: 0.5px;",
      "}",

      /* Tier amount */
      ".jw-sjewels-tier-amount {",
      "  font-family: 'Courier New', Courier, monospace;",
      "  font-weight: 700;",
      "  font-size: 14px;",
      "  color: #ffffff;",
      "  text-align: right;",
      "}",

      /* Opt button wrap */
      ".jw-sjewels-opt-wrap {",
      "  padding: 8px 10px 12px;",
      "}",

      /* Opt button */
      ".jw-sjewels-opt-btn {",
      "  display: block;",
      "  width: 100%;",
      "  height: 32px;",
      "  border-radius: 6px;",
      "  font-family: inherit;",
      "  font-size: 11px;",
      "  font-weight: 700;",
      "  letter-spacing: 1px;",
      "  text-transform: uppercase;",
      "  cursor: pointer;",
      "  transition: filter 0.2s ease;",
      "}",
      /* OPT IN state */
      ".jw-sjewels-opt-btn.jw-sjewels-opt-available {",
      "  background: linear-gradient(180deg, #9a7a10, #705808);",
      "  color: #ffffff;",
      "  border: 1px solid rgba(0,0,0,0.3);",
      "  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);",
      "}",
      ".jw-sjewels-opt-btn.jw-sjewels-opt-available:hover {",
      "  filter: brightness(1.08);",
      "}",
      /* OPT OUT state */
      ".jw-sjewels-opt-btn.jw-sjewels-opted-in {",
      "  background: #0c0c18;",
      "  color: #6a5a30;",
      "  border: 1px solid rgba(255,255,255,0.05);",
      "}",
      ".jw-sjewels-opt-btn.jw-sjewels-opted-in:hover {",
      "  filter: brightness(1.1);",
      "}",

      /* Sweep overlay — gold-tinted light band */
      ".jw-sjewels-sweep-wrap {",
      "  position: absolute; top: 0; left: 0; right: 0; bottom: 0;",
      "  overflow: hidden; border-radius: 10px; pointer-events: none; z-index: 3;",
      "}",
      ".jw-sjewels-sweep {",
      "  position: absolute; top: 0; left: 0; width: 100%; height: 100%;",
      "  background: linear-gradient(110deg,",
      "    transparent 0%, transparent 40%,",
      "    rgba(255,215,0,0.08) 45%,",
      "    rgba(255,240,180,0.2) 49%,",
      "    rgba(255,255,230,0.3) 50%,",
      "    rgba(255,240,180,0.2) 51%,",
      "    rgba(255,215,0,0.08) 55%,",
      "    transparent 60%, transparent 100%);",
      "  background-size: 200% 100%;",
      "  background-repeat: no-repeat;",
      "  animation: jw-sjewels-sweep 2.5s ease-in infinite;",
      "}"
    ].join("\n");
  }

  function merge(base, over) {
    var out = {};
    var k;
    for (k in base) {
      if (base.hasOwnProperty(k)) out[k] = base[k];
    }
    for (k in over) {
      if (over.hasOwnProperty(k) && over[k] !== undefined) out[k] = over[k];
    }
    return out;
  }

  function formatAmount(symbol, value) {
    var parts = value.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts[0] + "." + parts[1] + " " + symbol;
  }

  function posClass(pos) {
    var valid = {
      "top-left": 1,
      "top-right": 1,
      "bottom-left": 1,
      "bottom-right": 1
    };
    return valid[pos] ? "jw-sjewels-pos-" + pos : "jw-sjewels-pos-top-left";
  }

  function escapeHTML(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /**
   * Convert a hex color to an rgba string at a given opacity.
   */
  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }

  /* ---- Drag logic ---- */
  function makeDraggable(widget, handle, minimizeBtn, container) {
    var dragging = false;
    var offsetX = 0;
    var offsetY = 0;

    function onStart(e) {
      if (e.target === minimizeBtn) return;
      e.preventDefault();
      dragging = true;

      var point = e.touches ? e.touches[0] : e;
      var widgetRect = widget.getBoundingClientRect();
      offsetX = point.clientX - widgetRect.left;
      offsetY = point.clientY - widgetRect.top;

      handle.classList.add("jw-sjewels-dragging");
    }

    function onMove(e) {
      if (!dragging) return;
      e.preventDefault();

      var point = e.touches ? e.touches[0] : e;

      if (container) {
        var containerRect = container.getBoundingClientRect();
        var newLeft = point.clientX - offsetX - containerRect.left;
        var newTop = point.clientY - offsetY - containerRect.top;
        newLeft = Math.max(0, Math.min(newLeft, containerRect.width - widget.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, containerRect.height - widget.offsetHeight));
        widget.style.left = newLeft + "px";
        widget.style.top = newTop + "px";
      } else {
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var newLeft = point.clientX - offsetX;
        var newTop = point.clientY - offsetY;
        newLeft = Math.max(0, Math.min(newLeft, vw - widget.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, vh - widget.offsetHeight));
        widget.style.left = newLeft + "px";
        widget.style.top = newTop + "px";
      }

      widget.style.right = "auto";
      widget.style.bottom = "auto";
      widget.style.transform = "none";
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove("jw-sjewels-dragging");
    }

    handle.addEventListener("mousedown", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);

    handle.addEventListener("touchstart", onStart, { passive: false });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);

    return function cleanup() {
      handle.removeEventListener("mousedown", onStart);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      handle.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }

  /* ---- Widget ---- */
  function Widget(cfg) {
    this.cfg = merge(DEFAULTS, cfg);
    this.amounts = [];
    this.els = {};
    this.optedIn = false;
    this.collapsed = false;
    this.timer = null;
    this._cleanupDrag = null;
    this._host = null;

    for (var i = 0; i < this.cfg.tiers.length; i++) {
      this.amounts.push(this.cfg.tiers[i].amount);
    }
  }

  Widget.prototype.init = function () {
    this._injectCSS();
    this._build();
    this._loadState();
    this._renderOptBtn();
    this._startTicker();
  };

  Widget.prototype._injectCSS = function () {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = buildCSS();
    document.head.appendChild(s);
  };

  Widget.prototype._build = function () {
    var c = this.cfg;
    var self = this;

    /* card */
    var card = document.createElement("div");
    card.className = "jw-sjewels-card";

    var inContainer = false;
    var host = null;
    if (c.containerId) {
      host = document.getElementById(c.containerId);
      if (host) {
        inContainer = true;
        card.classList.add("jw-sjewels-absolute");
        /* Ensure container is positioned */
        var hostPos = window.getComputedStyle(host).position;
        if (hostPos === "static") {
          host.style.position = "relative";
        }
        this._host = host;
      }
    }

    if (!inContainer) {
      card.classList.add("jw-sjewels-fixed");
      card.classList.add(posClass(c.position));
    }

    /* Inner wrapper for bottom corner diamonds */
    var inner = document.createElement("div");
    inner.className = "jw-sjewels-inner";

    /* Sparkle dots — only 3, gold only, staggered across 3s cycle */
    var sparklePositions = [
      { top: "12%", left: "90%", delay: "0s" },
      { top: "52%", left: "5%",  delay: "1s" },
      { top: "85%", left: "65%", delay: "2s" }
    ];
    for (var s = 0; s < sparklePositions.length; s++) {
      var dot = document.createElement("div");
      dot.className = "jw-sjewels-sparkle";
      dot.style.top = sparklePositions[s].top;
      dot.style.left = sparklePositions[s].left;
      dot.style.animationDelay = sparklePositions[s].delay;
      card.appendChild(dot);
    }

    /* title bar */
    var titlebar = document.createElement("div");
    titlebar.className = "jw-sjewels-titlebar";
    if (c.draggable) {
      titlebar.classList.add("jw-sjewels-draggable");
    }

    /* Diamond + Title + Diamond */
    var diamondLeft = document.createElement("span");
    diamondLeft.className = "jw-sjewels-title-diamond";
    diamondLeft.textContent = "\u25C6";
    titlebar.appendChild(diamondLeft);

    var titleSpan = document.createElement("span");
    titleSpan.className = "jw-sjewels-title";
    titleSpan.textContent = escapeHTML(c.name).toUpperCase();
    titlebar.appendChild(titleSpan);

    var diamondRight = document.createElement("span");
    diamondRight.className = "jw-sjewels-title-diamond";
    diamondRight.textContent = "\u25C6";
    titlebar.appendChild(diamondRight);

    /* minimize / close button */
    var minBtn = document.createElement("button");
    minBtn.className = "jw-sjewels-minimize";
    minBtn.textContent = "x";
    minBtn.title = "Minimize";
    minBtn.type = "button";
    minBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      self._toggle();
    });
    titlebar.appendChild(minBtn);

    inner.appendChild(titlebar);

    /* Decorative separator below title bar */
    var separator = document.createElement("div");
    separator.className = "jw-sjewels-separator";
    inner.appendChild(separator);

    /* body */
    var body = document.createElement("div");
    body.className = "jw-sjewels-body";

    /* tiers */
    var tiersWrap = document.createElement("div");
    tiersWrap.className = "jw-sjewels-tiers";
    this.els.amountEls = [];

    var tierClasses = ["gold", "silver", "bronze"];
    for (var i = 0; i < c.tiers.length; i++) {
      var t = c.tiers[i];
      var row = document.createElement("div");
      row.className = "jw-sjewels-tier";
      if (tierClasses[i]) {
        row.classList.add("jw-sjewels-tier-" + tierClasses[i]);
      }
      row.style.setProperty("--jw-tier-color", t.color);
      /* Left accent at 50% tier color opacity */
      row.style.setProperty("--jw-tier-accent", hexToRgba(t.color, 0.5));
      /* Tier name at 70% opacity */
      row.style.setProperty("--jw-tier-name", hexToRgba(t.color, 0.7));

      /* Left side: tier name */
      var leftDiv = document.createElement("div");
      leftDiv.className = "jw-sjewels-tier-left";

      var nameSpan = document.createElement("span");
      nameSpan.className = "jw-sjewels-tier-name";
      nameSpan.textContent = t.name;
      leftDiv.appendChild(nameSpan);

      /* Right side: amount */
      var amtSpan = document.createElement("span");
      amtSpan.className = "jw-sjewels-tier-amount";
      amtSpan.textContent = formatAmount(c.currencySymbol, this.amounts[i]);

      row.appendChild(leftDiv);
      row.appendChild(amtSpan);
      tiersWrap.appendChild(row);
      this.els.amountEls.push(amtSpan);
    }

    body.appendChild(tiersWrap);

    /* opt button wrap */
    var optWrap = document.createElement("div");
    optWrap.className = "jw-sjewels-opt-wrap";

    var btn = document.createElement("button");
    btn.className = "jw-sjewels-opt-btn";
    btn.type = "button";
    btn.addEventListener("click", function () {
      self._toggleOpt();
    });
    optWrap.appendChild(btn);
    body.appendChild(optWrap);

    this.els.body = body;
    this.els.optBtn = btn;

    inner.appendChild(body);
    card.appendChild(inner);

    /* Sweep overlay — gold-tinted light band */
    var sweepWrap = document.createElement("div");
    sweepWrap.className = "jw-sjewels-sweep-wrap";
    var sweepDiv = document.createElement("div");
    sweepDiv.className = "jw-sjewels-sweep";
    sweepWrap.appendChild(sweepDiv);
    card.appendChild(sweepWrap);

    /* mount */
    if (inContainer) {
      host.appendChild(card);
    } else {
      document.body.appendChild(card);
    }

    this.els.card = card;
    this.els.titlebar = titlebar;
    this.els.minBtn = minBtn;

    /* draggable */
    if (c.draggable) {
      var dragContainer = inContainer ? host : null;
      this._cleanupDrag = makeDraggable(card, titlebar, minBtn, dragContainer);
    }
  };

  Widget.prototype._toggle = function () {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.els.body.classList.add("jw-sjewels-collapsed");
      this.els.minBtn.textContent = "+";
      this.els.minBtn.title = "Expand";
    } else {
      this.els.body.classList.remove("jw-sjewels-collapsed");
      this.els.minBtn.textContent = "x";
      this.els.minBtn.title = "Minimize";
    }
  };

  Widget.prototype._loadState = function () {
    try {
      this.optedIn = localStorage.getItem(LS_KEY) === "1";
    } catch (e) {
      this.optedIn = false;
    }
  };

  Widget.prototype._saveState = function () {
    try {
      if (this.optedIn) {
        localStorage.setItem(LS_KEY, "1");
      } else {
        localStorage.removeItem(LS_KEY);
      }
    } catch (e) {
      /* silent */
    }
  };

  Widget.prototype._toggleOpt = function () {
    this.optedIn = !this.optedIn;
    this._saveState();
    this._renderOptBtn();

    if (this.optedIn && typeof this.cfg.onOptIn === "function") {
      this.cfg.onOptIn();
    }
    if (!this.optedIn && typeof this.cfg.onOptOut === "function") {
      this.cfg.onOptOut();
    }
  };

  Widget.prototype._renderOptBtn = function () {
    var btn = this.els.optBtn;
    if (this.optedIn) {
      btn.className = "jw-sjewels-opt-btn jw-sjewels-opted-in";
      btn.textContent = "OPT OUT";
    } else {
      btn.className = "jw-sjewels-opt-btn jw-sjewels-opt-available";
      btn.textContent = "OPT IN";
    }
  };

  Widget.prototype._startTicker = function () {
    var self = this;
    var rate = this.cfg.incrementRate;
    var multipliers = [1, 0.3, 0.05];

    this.timer = setInterval(function () {
      for (var i = 0; i < self.amounts.length; i++) {
        var m = multipliers[i] !== undefined ? multipliers[i] : 0.01;
        self.amounts[i] += rate * m;

        var el = self.els.amountEls[i];
        el.textContent = formatAmount(self.cfg.currencySymbol, self.amounts[i]);
      }
    }, this.cfg.incrementInterval);
  };

  Widget.prototype.destroy = function () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this._cleanupDrag) {
      this._cleanupDrag();
      this._cleanupDrag = null;
    }
    if (this.els.card && this.els.card.parentNode) {
      this.els.card.parentNode.removeChild(this.els.card);
    }
    var styleEl = document.getElementById(STYLE_ID);
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
  };

  /* ---- Public API ---- */
  function initWidget(config) {
    var w = new Widget(config || {});

    function mount() {
      w.init();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount);
    } else {
      mount();
    }

    return {
      destroy: function () {
        w.destroy();
      }
    };
  }

  window.JackpotStackedJewelsWidget = {
    init: initWidget
  };
})();
