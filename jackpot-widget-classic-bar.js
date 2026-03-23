/**
 * JackpotClassicBarWidget - Multi-Level "Classic Bar" (Bronze, Silver, Gold)
 * Self-contained IIFE: injects its own CSS + HTML. No external dependencies.
 * Premium metallic casino bar with subtle, realistic visuals.
 *
 * Usage:
 *   var ctrl = JackpotClassicBarWidget.init({ name: "Jackpot Jewels", tiers: [...] });
 *   ctrl.destroy();
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /*  Defaults                                                           */
  /* ------------------------------------------------------------------ */
  var DEFAULTS = {
    name: "Jackpot Jewels",
    tiers: [
      { name: "Gold", amount: 5036.41, color: "#FFD700" },
      { name: "Silver", amount: 2056.25, color: "#C0C0C0" },
      { name: "Bronze", amount: 265.91, color: "#CD7F32" }
    ],
    currency: "EUR",
    currencySymbol: "EUR",
    incrementRate: 0.05,
    incrementInterval: 2000,
    position: "top",
    containerId: null,
    draggable: true,
    onOptIn: null,
    onOptOut: null
  };

  var STORAGE_KEY = "jackpot_classic_bar_optin";
  var CSS_INJECTED = false;
  var instanceCount = 0;

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */
  function merge(defaults, overrides) {
    var out = {};
    var k;
    for (k in defaults) {
      if (defaults.hasOwnProperty(k)) {
        out[k] = defaults[k];
      }
    }
    for (k in overrides) {
      if (overrides.hasOwnProperty(k)) {
        out[k] = overrides[k];
      }
    }
    return out;
  }

  function formatAmount(value, symbol) {
    var parts = value.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return symbol + " " + parts[0] + "." + parts[1];
  }

  function getOptIn() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function setOptIn(val) {
    try {
      if (val) {
        localStorage.setItem(STORAGE_KEY, "1");
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (_) {
      /* noop */
    }
  }

  function hexToRgba(hex, alpha) {
    if (hex.charAt(0) === "#") hex = hex.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
  }

  /* ------------------------------------------------------------------ */
  /*  CSS Injection                                                      */
  /* ------------------------------------------------------------------ */
  function injectCSS() {
    if (CSS_INJECTED) return;
    CSS_INJECTED = true;

    var css = [
      /* ---- keyframes ---- */

      /* Gold shine sweep across bar -- subtle 6s cycle */
      "@keyframes jw-cbar-shine {",
      "  0%   { background-position: -100% 0; }",
      "  100% { background-position: 200% 0; }",
      "}",

      /* Per-tier breathing glow -- barely perceptible, 4s cycle */
      "@keyframes jw-cbar-breathe-gold {",
      "  0%, 100% {",
      "    box-shadow:",
      "      inset 0 1px 0 rgba(255,255,255,0.04),",
      "      inset 0 -1px 2px rgba(0,0,0,0.4),",
      "      0 0 0 rgba(255,215,0,0);",
      "  }",
      "  50% {",
      "    box-shadow:",
      "      inset 0 1px 0 rgba(255,255,255,0.04),",
      "      inset 0 -1px 2px rgba(0,0,0,0.4),",
      "      0 0 6px rgba(255,215,0,0.06);",
      "  }",
      "}",

      "@keyframes jw-cbar-breathe-silver {",
      "  0%, 100% {",
      "    box-shadow:",
      "      inset 0 1px 0 rgba(255,255,255,0.04),",
      "      inset 0 -1px 2px rgba(0,0,0,0.4),",
      "      0 0 0 rgba(192,192,192,0);",
      "  }",
      "  50% {",
      "    box-shadow:",
      "      inset 0 1px 0 rgba(255,255,255,0.04),",
      "      inset 0 -1px 2px rgba(0,0,0,0.4),",
      "      0 0 6px rgba(192,192,192,0.06);",
      "  }",
      "}",

      "@keyframes jw-cbar-breathe-bronze {",
      "  0%, 100% {",
      "    box-shadow:",
      "      inset 0 1px 0 rgba(255,255,255,0.04),",
      "      inset 0 -1px 2px rgba(0,0,0,0.4),",
      "      0 0 0 rgba(205,127,50,0);",
      "  }",
      "  50% {",
      "    box-shadow:",
      "      inset 0 1px 0 rgba(255,255,255,0.04),",
      "      inset 0 -1px 2px rgba(0,0,0,0.4),",
      "      0 0 6px rgba(205,127,50,0.06);",
      "  }",
      "}",

      /* Light sweep animation */
      "@keyframes jw-cbar-sweep {",
      "  0%   { background-position: -100% 0; }",
      "  100% { background-position: 200% 0; }",
      "}",

      /* ---- reset ---- */
      ".jw-cbar-wrapper,",
      ".jw-cbar-wrapper * {",
      "  box-sizing: border-box;",
      "  margin: 0;",
      "  padding: 0;",
      "}",

      /* ---- wrapper ---- */
      ".jw-cbar-wrapper {",
      "  width: 100%;",
      "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;",
      "  z-index: 9999;",
      "  user-select: none;",
      "  -webkit-user-select: none;",
      "}",

      /* ---- bar container ---- */
      ".jw-cbar-bar {",
      "  display: flex;",
      "  flex-wrap: wrap;",
      "  align-items: center;",
      "  width: 100%;",
      "  padding: 8px 10px;",
      "  background: linear-gradient(180deg, #0e0e20 0%, #141430 50%, #0e0e20 100%);",
      "  border-top: 1px solid rgba(255,215,0,0.08);",
      "  border-bottom: 1px solid rgba(0,0,0,0.5);",
      "  box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);",
      "  position: relative;",
      "  overflow: hidden;",
      "}",

      /* ---- gold shine sweep overlay -- reduced opacity, 6s cycle ---- */
      ".jw-cbar-bar::after {",
      "  content: '';",
      "  position: absolute;",
      "  top: 0;",
      "  left: 0;",
      "  right: 0;",
      "  bottom: 0;",
      "  background: linear-gradient(",
      "    90deg,",
      "    transparent 0%,",
      "    rgba(255,215,0,0.03) 45%,",
      "    rgba(255,215,0,0.06) 50%,",
      "    rgba(255,215,0,0.03) 55%,",
      "    transparent 100%",
      "  );",
      "  background-size: 200% 100%;",
      "  animation: jw-cbar-shine 6s ease-in-out infinite;",
      "  pointer-events: none;",
      "  z-index: 0;",
      "}",

      /* make all bar children above the shine overlay */
      ".jw-cbar-bar > * {",
      "  position: relative;",
      "  z-index: 1;",
      "}",

      /* ---- top row: name + opt-in (Row 1 / drag handle) ---- */
      ".jw-cbar-toprow {",
      "  display: flex;",
      "  align-items: center;",
      "  justify-content: space-between;",
      "  width: 100%;",
      "  margin-bottom: 6px;",
      "}",

      /* ---- jackpot name -- subtle gold metallic gradient ---- */
      ".jw-cbar-name {",
      "  flex: 1;",
      "  font-size: 12px;",
      "  font-weight: 700;",
      "  letter-spacing: 0.5px;",
      "  text-transform: uppercase;",
      "  background: linear-gradient(135deg, #d4b050 0%, #c49a38 40%, #d4b050 60%, #a88830 100%);",
      "  -webkit-background-clip: text;",
      "  -webkit-text-fill-color: transparent;",
      "  background-clip: text;",
      "  white-space: nowrap;",
      "  line-height: 1;",
      "  text-shadow: none;",
      "}",

      /* ---- drag cursors ---- */
      ".jw-cbar-wrapper.jw-cbar-draggable .jw-cbar-toprow {",
      "  cursor: grab;",
      "}",

      ".jw-cbar-wrapper.jw-cbar-dragging .jw-cbar-toprow {",
      "  cursor: grabbing;",
      "}",

      /* ---- tier badges container (Row 2) ---- */
      ".jw-cbar-tiers {",
      "  display: flex;",
      "  align-items: stretch;",
      "  gap: 6px;",
      "  width: 100%;",
      "}",

      /* ---- single badge ---- */
      ".jw-cbar-badge {",
      "  display: flex;",
      "  flex-direction: column;",
      "  align-items: center;",
      "  justify-content: center;",
      "  flex: 1 1 0;",
      "  min-width: 0;",
      "  padding: 6px 4px;",
      "  border-radius: 6px;",
      "  background: #08081a;",
      "  position: relative;",
      "  overflow: hidden;",
      "}",

      /* per-tier breathing glow -- 4s cycle */
      ".jw-cbar-badge--gold {",
      "  animation: jw-cbar-breathe-gold 4s ease-in-out infinite;",
      "}",

      ".jw-cbar-badge--silver {",
      "  animation: jw-cbar-breathe-silver 4s ease-in-out infinite;",
      "}",

      ".jw-cbar-badge--bronze {",
      "  animation: jw-cbar-breathe-bronze 4s ease-in-out infinite;",
      "}",

      /* coloured top accent line */
      ".jw-cbar-badge-accent {",
      "  position: absolute;",
      "  top: 0;",
      "  left: 0;",
      "  right: 0;",
      "  height: 2px;",
      "}",

      /* tier label */
      ".jw-cbar-badge-label {",
      "  font-size: 7px;",
      "  font-weight: 700;",
      "  text-transform: uppercase;",
      "  letter-spacing: 0.5px;",
      "  line-height: 1;",
      "  margin-bottom: 3px;",
      "  margin-top: 2px;",
      "}",

      /* amount */
      ".jw-cbar-badge-amount {",
      "  font-family: 'Courier New', Courier, monospace;",
      "  font-size: 11px;",
      "  font-weight: 700;",
      "  color: #ffffff;",
      "  white-space: nowrap;",
      "  line-height: 1.2;",
      "  overflow: hidden;",
      "  text-overflow: ellipsis;",
      "  max-width: 100%;",
      "}",

      /* ---- OPT IN button ---- */
      ".jw-cbar-optin {",
      "  flex-shrink: 0;",
      "  padding: 5px 14px;",
      "  border-radius: 6px;",
      "  font-size: 10px;",
      "  font-weight: 700;",
      "  text-transform: uppercase;",
      "  letter-spacing: 0.5px;",
      "  cursor: pointer;",
      "  outline: none;",
      "  white-space: nowrap;",
      "  margin-left: 8px;",
      "  font-family: inherit;",
      "  transition: background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;",
      "}",

      /* active (not yet opted in) -- muted green, no pulse */
      ".jw-cbar-optin--active {",
      "  background: linear-gradient(180deg, #1a8a30, #126a20);",
      "  color: #ffffff;",
      "  border: 1px solid rgba(0,0,0,0.3);",
      "  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);",
      "}",

      ".jw-cbar-optin--active:hover {",
      "  background: linear-gradient(180deg, #1f9a38, #168a28);",
      "  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 1px 4px rgba(0,0,0,0.3);",
      "}",

      /* opted in (muted) */
      ".jw-cbar-optin--opted {",
      "  background: #141430;",
      "  color: #4a4a60;",
      "  border: 1px solid rgba(255,255,255,0.05);",
      "  box-shadow: none;",
      "}",

      ".jw-cbar-optin--opted:hover {",
      "  background: #1a1a38;",
      "  color: #5a5a70;",
      "}",

      /* ---- sweep overlay ---- */
      ".jw-cbar-sweep-wrap {",
      "  position: absolute; top: 0; left: 0; right: 0; bottom: 0;",
      "  overflow: hidden; border-radius: 0; pointer-events: none; z-index: 3;",
      "}",

      ".jw-cbar-sweep {",
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
      "  animation: jw-cbar-sweep 2.5s ease-in infinite;",
      "}",

      ""
    ].join("\n");

    var style = document.createElement("style");
    style.setAttribute("data-jw-cbar", "1");
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ */
  /*  Animated counter                                                   */
  /* ------------------------------------------------------------------ */
  function animateValue(el, from, to, symbol, duration) {
    if (typeof duration === "undefined") duration = 600;
    var start = null;
    var diff = to - from;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      /* ease-out cubic */
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = from + diff * ease;
      el.textContent = formatAmount(current, symbol);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------ */
  /*  Draggable behaviour (container-relative)                           */
  /* ------------------------------------------------------------------ */
  function makeDraggable(widget, handleEl, container) {
    var dragging = false;
    var offsetX = 0;
    var offsetY = 0;

    function onStart(e) {
      var ev = e.touches ? e.touches[0] : e;
      dragging = true;

      var widgetRect = widget.getBoundingClientRect();
      offsetX = ev.clientX - widgetRect.left;
      offsetY = ev.clientY - widgetRect.top;

      widget.classList.add("jw-cbar-dragging");

      if (e.type === "mousedown") {
        document.addEventListener("mousemove", onMove, { passive: false });
        document.addEventListener("mouseup", onEnd);
      } else {
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("touchend", onEnd);
      }

      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      var ev = e.touches ? e.touches[0] : e;

      var containerRect = container.getBoundingClientRect();

      var newLeft = ev.clientX - offsetX - containerRect.left;
      var newTop = ev.clientY - offsetY - containerRect.top;

      /* clamp within container */
      newLeft = Math.max(0, Math.min(newLeft, containerRect.width - widget.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, containerRect.height - widget.offsetHeight));

      widget.style.left = newLeft + "px";
      widget.style.top = newTop + "px";
      widget.style.right = "auto";
      widget.style.bottom = "auto";

      e.preventDefault();
    }

    function onEnd() {
      dragging = false;
      widget.classList.remove("jw-cbar-dragging");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    }

    handleEl.addEventListener("mousedown", onStart);
    handleEl.addEventListener("touchstart", onStart, { passive: false });

    /* return cleanup function */
    return function () {
      handleEl.removeEventListener("mousedown", onStart);
      handleEl.removeEventListener("touchstart", onStart);
      onEnd();
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Map tier name to breathing animation class                         */
  /* ------------------------------------------------------------------ */
  function getBreatheClass(tierName) {
    var lower = tierName.toLowerCase();
    if (lower === "gold") return "jw-cbar-badge--gold";
    if (lower === "silver") return "jw-cbar-badge--silver";
    if (lower === "bronze") return "jw-cbar-badge--bronze";
    return "";
  }

  /* ------------------------------------------------------------------ */
  /*  Widget Instance                                                    */
  /* ------------------------------------------------------------------ */
  function createInstance(config) {
    var cfg = merge(DEFAULTS, config || {});
    var id = "jw-cbar-" + ++instanceCount;
    var optedIn = getOptIn();
    var tierEls = [];
    var currentAmounts = [];
    var intervalId = null;
    var destroyDrag = null;

    /* -- deep-copy tiers -- */
    var tiers = cfg.tiers.map(function (t) {
      return { name: t.name, amount: t.amount, color: t.color };
    });

    tiers.forEach(function (t) {
      currentAmounts.push(t.amount);
    });

    /* -- build DOM -- */
    var wrapper = document.createElement("div");
    wrapper.className = "jw-cbar-wrapper";
    wrapper.id = id;

    if (cfg.draggable) {
      wrapper.classList.add("jw-cbar-draggable");
    }

    var bar = document.createElement("div");
    bar.className = "jw-cbar-bar";

    /* ---- Row 1: name + opt-in button ---- */
    var topRow = document.createElement("div");
    topRow.className = "jw-cbar-toprow";

    var nameEl = document.createElement("div");
    nameEl.className = "jw-cbar-name";
    nameEl.textContent = cfg.name;
    topRow.appendChild(nameEl);

    var btn = document.createElement("button");
    btn.className = "jw-cbar-optin";
    updateOptInButton();

    btn.addEventListener("click", function () {
      optedIn = !optedIn;
      setOptIn(optedIn);
      updateOptInButton();
      if (optedIn && typeof cfg.onOptIn === "function") {
        cfg.onOptIn();
      }
      if (!optedIn && typeof cfg.onOptOut === "function") {
        cfg.onOptOut();
      }
    });
    topRow.appendChild(btn);
    bar.appendChild(topRow);

    /* ---- Row 2: tier badges ---- */
    var tiersContainer = document.createElement("div");
    tiersContainer.className = "jw-cbar-tiers";

    tiers.forEach(function (tier, i) {
      var badge = document.createElement("div");
      badge.className = "jw-cbar-badge";

      var breatheClass = getBreatheClass(tier.name);
      if (breatheClass) {
        badge.classList.add(breatheClass);
      }

      /* Very subtle border using tier color at 12% opacity */
      badge.style.border = "1px solid " + hexToRgba(tier.color, 0.12);
      /* Top accent: 2px solid tier color at 60% opacity */
      badge.style.borderTop = "2px solid " + hexToRgba(tier.color, 0.6);

      /* Top accent bar (absolute positioned) */
      var accent = document.createElement("div");
      accent.className = "jw-cbar-badge-accent";
      accent.style.background = hexToRgba(tier.color, 0.6);
      badge.appendChild(accent);

      /* Tier name label */
      var label = document.createElement("div");
      label.className = "jw-cbar-badge-label";
      label.textContent = tier.name;
      label.style.color = tier.color;
      badge.appendChild(label);

      /* Amount display */
      var amount = document.createElement("div");
      amount.className = "jw-cbar-badge-amount";
      amount.textContent = formatAmount(tier.amount, cfg.currencySymbol);
      badge.appendChild(amount);

      tierEls.push(amount);
      tiersContainer.appendChild(badge);
    });

    bar.appendChild(tiersContainer);

    /* ---- sweep overlay ---- */
    var sweepWrap = document.createElement("div");
    sweepWrap.className = "jw-cbar-sweep-wrap";
    var sweepEl = document.createElement("div");
    sweepEl.className = "jw-cbar-sweep";
    sweepWrap.appendChild(sweepEl);
    bar.appendChild(sweepWrap);

    wrapper.appendChild(bar);

    function updateOptInButton() {
      if (optedIn) {
        btn.className = "jw-cbar-optin jw-cbar-optin--opted";
        btn.textContent = "OPTED IN";
      } else {
        btn.className = "jw-cbar-optin jw-cbar-optin--active";
        btn.textContent = "OPT IN";
      }
    }

    /* -- mount -- */
    var container = null;

    if (cfg.containerId) {
      container = document.getElementById(cfg.containerId);
    }

    if (container) {
      /* inside a container: position absolute for dragging */
      wrapper.style.position = cfg.draggable ? "absolute" : "relative";
      wrapper.style.width = "100%";
      wrapper.style.left = "0";
      if (cfg.position === "bottom") {
        wrapper.style.bottom = "0";
        wrapper.style.top = "auto";
      } else {
        wrapper.style.top = "0";
      }
      container.appendChild(wrapper);
    } else {
      /* no container: fixed to viewport */
      container = document.documentElement;
      wrapper.style.position = "fixed";
      wrapper.style.left = "0";
      wrapper.style.right = "0";
      wrapper.style.zIndex = "9999";
      if (cfg.position === "bottom") {
        wrapper.style.bottom = "0";
        wrapper.style.top = "auto";
      } else {
        wrapper.style.top = "0";
      }
      document.body.appendChild(wrapper);
    }

    /* -- draggable -- */
    if (cfg.draggable) {
      /* container for drag bounds: the explicit container, or document.body for fixed */
      var dragBounds = cfg.containerId
        ? document.getElementById(cfg.containerId)
        : document.documentElement;
      destroyDrag = makeDraggable(wrapper, topRow, dragBounds);
    }

    /* -- increment loop -- */
    /* Gold gets full incrementRate, Silver 0.5x, Bronze 0.2x */
    var tierMultipliers = [1, 0.5, 0.2];

    function startIncrement() {
      if (intervalId) return;
      intervalId = setInterval(function () {
        tiers.forEach(function (tier, i) {
          var oldVal = currentAmounts[i];
          var mult = tierMultipliers[i] !== undefined ? tierMultipliers[i] : 0.1;
          var inc = cfg.incrementRate * mult;
          currentAmounts[i] = oldVal + inc;
          animateValue(tierEls[i], oldVal, currentAmounts[i], cfg.currencySymbol, Math.min(cfg.incrementInterval * 0.45, 900));
        });
      }, cfg.incrementInterval);
    }

    startIncrement();

    /* -- public controller -- */
    return {
      element: wrapper,
      destroy: function () {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        if (destroyDrag) {
          destroyDrag();
          destroyDrag = null;
        }
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      },
      isOptedIn: function () {
        return optedIn;
      }
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */
  function domReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  window.JackpotClassicBarWidget = {
    init: function (config) {
      injectCSS();
      var instance = null;
      domReady(function () {
        instance = createInstance(config);
      });
      /* If DOM was already ready, domReady ran synchronously */
      if (instance) return instance;
      /* DOM not ready yet -- return a proxy that defers to the real instance */
      var proxy = {
        get element() {
          return instance ? instance.element : null;
        },
        destroy: function () {
          if (instance) instance.destroy();
        },
        isOptedIn: function () {
          return instance ? instance.isOptedIn() : false;
        }
      };
      return proxy;
    }
  };
})();
