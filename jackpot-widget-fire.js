/**
 * Fire Jackpot Widget
 * Hybrid CSS fire body + canvas brushstroke particles + light sweep.
 * No external dependencies.
 *
 * Usage:
 *   var ctrl = JackpotFireWidget.init({ ... });
 *   ctrl.destroy();
 */
(function () {
  "use strict";

  var DEFAULTS = {
    name: "Fire Jackpot",
    amount: 195.64,
    currency: "GHS",
    currencySymbol: "GHS",
    incrementRate: 0.01,
    incrementInterval: 3000,
    position: "top-left",
    containerId: null,
    draggable: true,
    onOptIn: null,
    onOptOut: null
  };

  var STORAGE_KEY = "jackpot_fire_optin";
  var P = "jw-fire-";

  /* ------------------------------------------------------------------ */
  /*  Brushstroke Canvas Particle Engine (floating embers/sparks)         */
  /* ------------------------------------------------------------------ */
  var PALETTE_BASE = [
    { r: 245, g: 167, b: 66 },
    { r: 232, g: 90,  b: 25 },
    { r: 255, g: 62,  b: 0 },
    { r: 191, g: 34,  b: 34 },
    { r: 80,  g: 20,  b: 70 }
  ];

  function FireEngine(canvas, w, h) {
    this.cvs = canvas;
    this.ctx = canvas.getContext("2d");
    this.w = w;
    this.h = h;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    this.ctx.scale(dpr, dpr);
    this.particles = [];
    this.palette = [];
    this.time = 0;
    this.raf = null;
    this.running = false;
    this._tick = this._tick.bind(this);
    this._seedParticles();
  }

  FireEngine.prototype._seedParticles = function () {
    for (var i = 0; i < 30; i++) {
      this.particles.push(this._makeParticle(true));
    }
  };

  FireEngine.prototype._makeParticle = function (randomY) {
    var w = this.w;
    var h = this.h;
    var cx = w / 2;
    var spread = (Math.random() + Math.random()) / 2;
    var side = Math.random() < 0.5 ? -1 : 1;
    var x = cx + side * spread * (w * 0.42);
    return {
      x: x,
      y: randomY ? (Math.random() * h) : (h + Math.random() * 10),
      size: 3 + Math.random() * 12,
      opacity: 0.1 + Math.random() * 0.4,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: -(0.4 + Math.random() * 1.2),
      colorIndex: Math.floor(Math.random() * PALETTE_BASE.length),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      sway: 0.2 + Math.random() * 0.4,
      swaySpeed: 0.005 + Math.random() * 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      lifespan: 80 + Math.random() * 120,
      maxLife: 0
    };
  };

  FireEngine.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this._tick();
  };

  FireEngine.prototype.stop = function () {
    this.running = false;
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
  };

  FireEngine.prototype._updatePalette = function () {
    var t = this.time;
    this.palette = [];
    for (var i = 0; i < PALETTE_BASE.length; i++) {
      var c = PALETTE_BASE[i];
      var tt = t + i * 0.5;
      this.palette.push({
        r: Math.min(255, Math.max(0, c.r + Math.sin(tt) * 15)),
        g: Math.min(255, Math.max(0, c.g + Math.sin(tt + 1) * 15)),
        b: Math.min(255, Math.max(0, c.b + Math.sin(tt + 2) * 15))
      });
    }
  };

  FireEngine.prototype._drawBrushstroke = function (x, y, size, rotation, color, opacity) {
    var ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    var grad = ctx.createLinearGradient(0, -size, 0, size);
    grad.addColorStop(0, "rgba(" + color.r + "," + color.g + "," + color.b + ",0)");
    grad.addColorStop(0.5, "rgba(" + color.r + "," + color.g + "," + color.b + "," + opacity + ")");
    grad.addColorStop(1, "rgba(" + color.r + "," + color.g + "," + color.b + ",0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-size / 3, -size);
    ctx.quadraticCurveTo(size / 2, 0, -size / 3, size);
    ctx.quadraticCurveTo(size / 2, 0, size / 3, -size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + (opacity * 0.6) + ")";
    ctx.beginPath();
    ctx.ellipse(size / 6, 0, size / 4, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  FireEngine.prototype._tick = function () {
    if (!this.running) return;
    var ctx = this.ctx;
    var w = this.w;
    var h = this.h;
    this.time += 0.01;
    this._updatePalette();
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      p.x += p.speedX + Math.sin(this.time * p.swaySpeed * 60 + p.swayOffset) * p.sway;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.lifespan -= 1;
      if (p.maxLife === 0) p.maxLife = p.lifespan + 1;
      var lifeFactor = Math.max(0, p.lifespan / p.maxLife);
      var curSize = p.size * lifeFactor;
      var curOpacity = p.opacity * lifeFactor;
      if (p.lifespan > 0 && curSize > 0.5) {
        this._drawBrushstroke(p.x, p.y, curSize, p.rotation, this.palette[p.colorIndex], curOpacity);
      }
      if (p.lifespan <= 0 || p.y < -20) {
        this.particles[i] = this._makeParticle(false);
        this.particles[i].maxLife = this.particles[i].lifespan;
      }
    }
    this.raf = requestAnimationFrame(this._tick);
  };

  /* ------------------------------------------------------------------ */
  /*  CSS                                                                */
  /* ------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById(P + "styles")) return;
    var css = [];

    /* ---------- title shimmer ---------- */
    css.push(
      "@keyframes " + P + "shimmer {" +
      "  0%   { background-position: 0% 50%; }" +
      "  100% { background-position: 200% 50%; }" +
      "}"
    );

    /* ---------- light sweep (blik) — background-position sweep ---------- */
    css.push(
      "@keyframes " + P + "sweep {" +
      "  0%   { background-position: -100% 0; }" +
      "  100% { background-position: 200% 0; }" +
      "}"
    );

    /* ---------- box glow pulse ---------- */
    css.push(
      "@keyframes " + P + "box-glow {" +
      "  0%   { box-shadow: 0 2px 16px rgba(160,50,0,0.15), inset 0 0 20px rgba(255,100,20,0.06); }" +
      "  50%  { box-shadow: 0 2px 16px rgba(160,50,0,0.35), inset 0 0 20px rgba(255,100,20,0.06); }" +
      "  100% { box-shadow: 0 2px 16px rgba(160,50,0,0.15), inset 0 0 20px rgba(255,100,20,0.06); }" +
      "}"
    );

    /* ---------- widget shell ---------- */
    css.push(
      "." + P + "widget {" +
      "  z-index: 999999;" +
      "  width: 210px;" +
      "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;" +
      "  border-radius: 12px;" +
      "  background: linear-gradient(180deg, #2c0a00 0%, #180400 60%, #0c0200 100%);" +
      "  border: 1px solid rgba(180,80,20,0.4);" +
      "  box-shadow: 0 2px 16px rgba(160,50,0,0.25), inset 0 0 20px rgba(255,100,20,0.06);" +
      "  animation: " + P + "box-glow 3s ease-in-out infinite;" +
      "  overflow: visible;" +
      "  user-select: none;" +
      "  -webkit-user-select: none;" +
      "}"
    );

    /* positioning modes */
    css.push(
      "." + P + "widget." + P + "fixed { position: fixed; }",
      "." + P + "widget." + P + "contained { position: absolute; }"
    );

    /* initial positions */
    css.push(
      "." + P + "widget." + P + "pos-top-left     { top: 10px; left: 10px; }",
      "." + P + "widget." + P + "pos-top-right    { top: 10px; right: 10px; }",
      "." + P + "widget." + P + "pos-top-center   { top: 10px; left: 50%; transform: translateX(-50%); }",
      "." + P + "widget." + P + "pos-bottom-left  { bottom: 10px; left: 10px; }",
      "." + P + "widget." + P + "pos-bottom-right { bottom: 10px; right: 10px; }"
    );

    /* ---------- fire wrap (canvas particles) ---------- */
    css.push(
      "." + P + "fire-wrap {" +
      "  position: relative;" +
      "  width: 100%;" +
      "  height: 0;" +
      "  overflow: visible;" +
      "  pointer-events: none;" +
      "}",
      "." + P + "fire-canvas {" +
      "  position: absolute;" +
      "  bottom: 0;" +
      "  left: -5px;" +
      "  pointer-events: none;" +
      "}"
    );

    /* ---------- header / title bar ---------- */
    css.push(
      "." + P + "header {" +
      "  position: relative;" +
      "  display: flex;" +
      "  align-items: center;" +
      "  justify-content: center;" +
      "  padding: 10px 28px 6px 12px;" +
      "  cursor: pointer;" +
      "  background: transparent;" +
      "}"
    );
    css.push(
      "." + P + "title-wrap { text-align: center; }"
    );
    css.push(
      "." + P + "title {" +
      "  font-size: 12px;" +
      "  font-weight: 700;" +
      "  letter-spacing: 2px;" +
      "  text-transform: uppercase;" +
      "  line-height: 1;" +
      "  background: linear-gradient(90deg, #ffd54f, #ff8f00, #ffd54f);" +
      "  background-size: 200% 100%;" +
      "  -webkit-background-clip: text;" +
      "  -webkit-text-fill-color: transparent;" +
      "  background-clip: text;" +
      "  color: transparent;" +
      "  animation: " + P + "shimmer 3s linear infinite;" +
      "}"
    );
    css.push(
      "." + P + "sep {" +
      "  height: 1px;" +
      "  margin: 6px 20px 0;" +
      "  background: linear-gradient(90deg, transparent, rgba(255,140,0,0.3), transparent);" +
      "}"
    );

    /* ---------- close button ---------- */
    css.push(
      "." + P + "close-btn {" +
      "  position: absolute;" +
      "  top: 50%;" +
      "  right: 6px;" +
      "  transform: translateY(-50%);" +
      "  width: 18px;" +
      "  height: 18px;" +
      "  border: none;" +
      "  background: none;" +
      "  color: #fff;" +
      "  opacity: 0.5;" +
      "  font-size: 12px;" +
      "  line-height: 18px;" +
      "  text-align: center;" +
      "  cursor: pointer;" +
      "  padding: 0;" +
      "  z-index: 4;" +
      "  transition: opacity 0.15s;" +
      "}",
      "." + P + "close-btn:hover { opacity: 0.8; }"
    );

    /* ---------- body ---------- */
    css.push(
      "." + P + "body {" +
      "  overflow: hidden;" +
      "  padding: 10px 14px 14px;" +
      "}",
      "." + P + "body." + P + "collapsed { display: none; }"
    );

    /* ---------- amount ---------- */
    css.push(
      "." + P + "amount-wrap { text-align: center; padding: 4px 0 6px; }"
    );
    css.push(
      "." + P + "amount {" +
      "  font-size: 22px;" +
      "  font-weight: 700;" +
      "  color: #fff;" +
      "  font-family: 'Courier New', Courier, monospace;" +
      "  line-height: 1.2;" +
      "  text-shadow: 0 0 8px rgba(255,120,0,0.3);" +
      "}"
    );
    css.push(
      "." + P + "sep2 {" +
      "  height: 1px;" +
      "  margin: 4px 20px 0;" +
      "  background: linear-gradient(90deg, transparent, rgba(255,140,0,0.3), transparent);" +
      "}"
    );

    /* ---------- status ---------- */
    css.push(
      "." + P + "status {" +
      "  text-align: center; font-size: 10px; color: #bb8855; margin: 6px 0 10px; min-height: 14px;" +
      "}"
    );

    /* ---------- buttons ---------- */
    css.push(
      "." + P + "btn {" +
      "  display: block; width: 100%; height: 34px; border: none; border-radius: 8px;" +
      "  font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;" +
      "  cursor: pointer; text-align: center; line-height: 34px; padding: 0; transition: filter 0.15s;" +
      "}",
      "." + P + "btn:hover { filter: brightness(1.08); }"
    );
    css.push(
      "." + P + "btn-optin {" +
      "  background: linear-gradient(180deg, #e05a1a, #b84010); color: #fff; border: 1px solid rgba(255,255,255,0.1);" +
      "}"
    );
    css.push(
      "." + P + "btn-optout {" +
      "  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #886655;" +
      "}"
    );

    /* ---------- drag states ---------- */
    css.push(
      "." + P + "header." + P + "draggable { cursor: grab; }",
      "." + P + "header." + P + "draggable." + P + "dragging { cursor: grabbing; }"
    );

    /* ---------- light sweep (blik) overlay ---------- */
    css.push(
      "." + P + "blik-wrap {" +
      "  position: absolute; top: 0; left: 0; right: 0; bottom: 0;" +
      "  overflow: hidden; border-radius: 12px; pointer-events: none; z-index: 3;" +
      "}",
      "." + P + "sweep {" +
      "  position: absolute; top: 0; left: 0; width: 100%; height: 100%;" +
      "  background: linear-gradient(110deg," +
      "    transparent 0%," +
      "    transparent 40%," +
      "    rgba(255,220,160,0.15) 45%," +
      "    rgba(255,250,240,0.35) 49%," +
      "    rgba(255,255,255,0.45) 50%," +
      "    rgba(255,250,240,0.35) 51%," +
      "    rgba(255,220,160,0.15) 55%," +
      "    transparent 60%," +
      "    transparent 100%);" +
      "  background-size: 200% 100%;" +
      "  background-repeat: no-repeat;" +
      "  animation: " + P + "sweep 2.5s ease-in infinite;" +
      "}"
    );

    var style = document.createElement("style");
    style.id = P + "styles";
    style.textContent = css.join("\n");
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ */
  /*  Build DOM                                                          */
  /* ------------------------------------------------------------------ */
  function buildWidget(cfg) {
    var el = document.createElement("div");
    el.className = P + "widget";

    /* Canvas fire wrap — brushstroke particles overflow upward */
    var fireWrap = document.createElement("div");
    fireWrap.className = P + "fire-wrap";

    var canvas = document.createElement("canvas");
    canvas.className = P + "fire-canvas";
    fireWrap.appendChild(canvas);

    el.appendChild(fireWrap);

    /* Light sweep (blik) */
    var blikWrap = document.createElement("div");
    blikWrap.className = P + "blik-wrap";
    var sweep = document.createElement("div");
    sweep.className = P + "sweep";
    blikWrap.appendChild(sweep);
    el.appendChild(blikWrap);

    /* Header + body */
    var headerHtml =
      '<div class="' + P + 'header">' +
        '<span class="' + P + 'title-wrap">' +
          '<span class="' + P + 'title">' + escapeHtml(cfg.name.toUpperCase()) + '</span>' +
        '</span>' +
        '<button class="' + P + 'close-btn" aria-label="Minimize">x</button>' +
      '</div>' +
      '<div class="' + P + 'sep"></div>' +
      '<div class="' + P + 'body">' +
        '<div class="' + P + 'amount-wrap">' +
          '<span class="' + P + 'amount"></span>' +
        '</div>' +
        '<div class="' + P + 'sep2"></div>' +
        '<div class="' + P + 'status"></div>' +
        '<button class="' + P + 'btn"></button>' +
      '</div>';

    var temp = document.createElement("div");
    temp.innerHTML = headerHtml;
    while (temp.firstChild) {
      el.appendChild(temp.firstChild);
    }

    el._canvas = canvas;
    return el;
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */
  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function formatAmount(n, symbol) {
    var parts = n.toFixed(2).split(".");
    var intPart = parts[0];
    var decPart = parts[1];
    var formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return symbol + " " + formatted + "." + decPart;
  }

  function getOptIn() {
    try { return localStorage.getItem(STORAGE_KEY) === "1"; }
    catch (_) { return false; }
  }

  function setOptIn(val) {
    try { localStorage.setItem(STORAGE_KEY, val ? "1" : "0"); }
    catch (_) { /* */ }
  }

  /* ------------------------------------------------------------------ */
  /*  Widget controller                                                  */
  /* ------------------------------------------------------------------ */
  function createController(cfg) {
    injectStyles();

    var widget = buildWidget(cfg);
    var currentAmount = cfg.amount;
    var optedIn = getOptIn();
    var collapsed = false;
    var tickTimer = null;
    var fireEngine = null;

    var headerEl = widget.querySelector("." + P + "header");
    var amountEl = widget.querySelector("." + P + "amount");
    var statusEl = widget.querySelector("." + P + "status");
    var btnEl    = widget.querySelector("." + P + "btn");
    var closeBtn = widget.querySelector("." + P + "close-btn");
    var bodyEl   = widget.querySelector("." + P + "body");
    var canvas   = widget._canvas;

    function renderOptState() {
      if (optedIn) {
        statusEl.textContent = "You're in, good luck!";
        btnEl.textContent = "OPT OUT";
        btnEl.className = P + "btn " + P + "btn-optout";
      } else {
        statusEl.textContent = "Tap to join";
        btnEl.textContent = "OPT IN";
        btnEl.className = P + "btn " + P + "btn-optin";
      }
    }

    function renderAmount() {
      amountEl.textContent = formatAmount(currentAmount, cfg.currencySymbol);
    }

    function initFireEngine() {
      fireEngine = new FireEngine(canvas, 220, 60);
      fireEngine.start();
    }

    function startTick() {
      stopTick();
      tickTimer = setInterval(function () {
        currentAmount += cfg.incrementRate;
        renderAmount();
      }, cfg.incrementInterval);
    }

    function stopTick() {
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    }

    btnEl.addEventListener("click", function (e) {
      e.stopPropagation();
      optedIn = !optedIn;
      setOptIn(optedIn);
      renderOptState();
      if (optedIn && typeof cfg.onOptIn === "function") cfg.onOptIn();
      if (!optedIn && typeof cfg.onOptOut === "function") cfg.onOptOut();
    });

    closeBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      collapsed = !collapsed;
      if (collapsed) bodyEl.classList.add(P + "collapsed");
      else bodyEl.classList.remove(P + "collapsed");
    });

    headerEl.addEventListener("click", function (e) {
      if (collapsed && e.target !== closeBtn) {
        collapsed = false;
        bodyEl.classList.remove(P + "collapsed");
      }
    });

    /* ---- drag and drop ---- */
    var dragCleanup = [];

    function setupDrag() {
      if (!cfg.draggable) return;
      headerEl.classList.add(P + "draggable");

      var dragging = false, offsetX = 0, offsetY = 0, widgetW = 0, widgetH = 0, isFixed = false;

      function getContainer() { return widget.parentNode; }

      function convertToLeftTop() {
        var wRect = widget.getBoundingClientRect();
        var container = getContainer();
        if (isFixed) {
          widget.style.left = wRect.left + "px";
          widget.style.top = wRect.top + "px";
        } else {
          var cRect = container.getBoundingClientRect();
          widget.style.left = (wRect.left - cRect.left) + "px";
          widget.style.top = (wRect.top - cRect.top) + "px";
        }
        widget.style.right = "auto";
        widget.style.bottom = "auto";
        widget.style.transform = "none";
        widget.classList.remove(P + "pos-" + cfg.position);
      }

      function onStart(clientX, clientY, e) {
        if (e && (e.target === closeBtn || closeBtn.contains(e.target))) return;
        dragging = true;
        isFixed = widget.classList.contains(P + "fixed");
        var wRect = widget.getBoundingClientRect();
        widgetW = wRect.width; widgetH = wRect.height;
        convertToLeftTop();
        var wRect2 = widget.getBoundingClientRect();
        offsetX = clientX - wRect2.left;
        offsetY = clientY - wRect2.top;
        headerEl.classList.add(P + "dragging");
      }

      function onMove(clientX, clientY) {
        if (!dragging) return;
        var container = getContainer();
        var newLeft, newTop;
        if (isFixed) {
          newLeft = clientX - offsetX;
          newTop = clientY - offsetY;
          newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - widgetW));
          newTop = Math.max(0, Math.min(newTop, window.innerHeight - widgetH));
        } else {
          var cRect = container.getBoundingClientRect();
          newLeft = clientX - offsetX - cRect.left;
          newTop = clientY - offsetY - cRect.top;
          newLeft = Math.max(0, Math.min(newLeft, cRect.width - widgetW));
          newTop = Math.max(0, Math.min(newTop, cRect.height - widgetH));
        }
        widget.style.left = newLeft + "px";
        widget.style.top = newTop + "px";
        widget.style.right = "auto";
        widget.style.bottom = "auto";
      }

      function onEnd() {
        if (!dragging) return;
        dragging = false;
        headerEl.classList.remove(P + "dragging");
      }

      function onMouseDown(e) {
        if (e.target === closeBtn || closeBtn.contains(e.target)) return;
        e.preventDefault();
        onStart(e.clientX, e.clientY, e);
      }
      function onMouseMove(e) { if (!dragging) return; e.preventDefault(); onMove(e.clientX, e.clientY); }
      function onMouseUp() { onEnd(); }

      headerEl.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      function onTouchStart(e) {
        if (e.target === closeBtn || closeBtn.contains(e.target)) return;
        var t = e.touches[0]; onStart(t.clientX, t.clientY, e);
      }
      function onTouchMove(e) { if (!dragging) return; e.preventDefault(); var t = e.touches[0]; onMove(t.clientX, t.clientY); }
      function onTouchEnd() { onEnd(); }

      headerEl.addEventListener("touchstart", onTouchStart, { passive: true });
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onTouchEnd);

      dragCleanup.push(function () {
        headerEl.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        headerEl.removeEventListener("touchstart", onTouchStart);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      });
    }

    function mount() {
      var container = null;
      if (cfg.containerId) {
        container = document.getElementById(cfg.containerId);
        if (container) {
          var pos = getComputedStyle(container).position;
          if (pos === "static") container.style.position = "relative";
          widget.classList.add(P + "contained");
        }
      }
      if (!container) {
        container = document.body;
        widget.classList.add(P + "fixed");
      }
      widget.classList.add(P + "pos-" + cfg.position);
      container.appendChild(widget);
      renderOptState();
      renderAmount();
      startTick();
      setupDrag();
      initFireEngine();
    }

    return {
      mount: mount,
      destroy: function () {
        stopTick();
        if (fireEngine) { fireEngine.stop(); fireEngine = null; }
        for (var i = 0; i < dragCleanup.length; i++) dragCleanup[i]();
        dragCleanup = [];
        if (widget.parentNode) widget.parentNode.removeChild(widget);
      },
      setAmount: function (val) { currentAmount = val; renderAmount(); },
      getAmount: function () { return currentAmount; },
      isOptedIn: function () { return optedIn; }
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Public interface                                                   */
  /* ------------------------------------------------------------------ */
  window.JackpotFireWidget = {
    init: function (userConfig) {
      var cfg = {};
      for (var k in DEFAULTS) {
        if (DEFAULTS.hasOwnProperty(k)) {
          cfg[k] = userConfig && userConfig.hasOwnProperty(k) ? userConfig[k] : DEFAULTS[k];
        }
      }
      var ctrl = createController(cfg);
      if (document.readyState === "complete" || document.readyState === "interactive") {
        ctrl.mount();
      } else {
        document.addEventListener("DOMContentLoaded", function () { ctrl.mount(); });
      }
      return ctrl;
    }
  };
})();
