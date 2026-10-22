/* ============================================================
   Bhowanee — Dynamic Charts Engine (charts.js)
   Groww / Zerodha-style interactive, animated charts.
   
   Features:
   - Smooth animated line draw on load
   - Crosshair cursor with floating tooltip
   - Time-period selector tabs (1D, 1W, 1M, 3M, 1Y)
   - Green/Red theming based on gain/loss
   - Animated area gradient fill
   - Live price ticker with micro-animations
   - Interactive hover data points
   - Responsive canvas with DPI awareness
   ============================================================ */

window.BhChart = (function () {
  'use strict';

  /* ── Color Palette ─────────────────────────────────────── */
  var COLORS = {
    gain: '#00C853',
    gainLight: 'rgba(0, 200, 83, 0.12)',
    gainGlow: 'rgba(0, 200, 83, 0.35)',
    loss: '#FF1744',
    lossLight: 'rgba(255, 23, 68, 0.12)',
    lossGlow: 'rgba(255, 23, 68, 0.35)',
    neutral: '#1C2452',
    neutralLight: 'rgba(28, 36, 82, 0.08)',
    grid: '#F0F2F5',
    gridStrong: '#E5E8ED',
    textPrimary: '#1C2452',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    bg: '#FFFFFF',
    crosshair: '#9CA3AF',
    tooltipBg: 'rgba(28, 36, 82, 0.94)',
    tooltipText: '#FFFFFF'
  };

  /* ── Utility: High-DPI Canvas Setup ─────────────────────── */
  function setupCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = Math.round(rect.width);
    var h = Math.round(rect.height);
    if (!w || !h) {
      return { ctx: canvas.getContext('2d'), w: 0, h: 0, dpr: dpr, ready: false };
    }
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    var ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    return { ctx: ctx, w: w, h: h, dpr: dpr, ready: true };
  }

  /* ── Utility: Format currency ───────────────────────────── */
  function fmtPrice(v) {
    if (v >= 100000) return '₹' + (v / 100000).toFixed(2) + 'L';
    return '₹' + Number(v).toLocaleString('en-IN');
  }

  function fmtNum(v) {
    return Number(v).toLocaleString('en-IN');
  }

  /* ── Easing Functions ───────────────────────────────────── */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* ── Data Generation Helpers ───────────────────────────── */
  function generateIntradayData(basePrice, volatility, points) {
    var data = [];
    var price = basePrice;
    var startHour = 9, startMin = 0;
    var totalMins = 360; // 9 AM - 3 PM = 360 mins
    var step = totalMins / (points - 1);

    for (var i = 0; i < points; i++) {
      var mins = Math.round(startHour * 60 + startMin + i * step);
      var h = Math.floor(mins / 60);
      var m = mins % 60;
      var change = (Math.random() - 0.48) * volatility;
      price = Math.max(price * 0.95, Math.min(price * 1.05, price + change));
      data.push({
        time: (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m,
        price: Math.round(price * 100) / 100,
        volume: Math.round(Math.random() * 50 + 5)
      });
    }
    return data;
  }

  function generateHistoricalData(basePrice, volatility, days) {
    var data = [];
    var price = basePrice;
    var now = new Date();

    for (var i = days; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var change = (Math.random() - 0.47) * volatility;
      price = Math.max(price * 0.92, Math.min(price * 1.08, price + change));
      data.push({
        date: d,
        dateStr: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        price: Math.round(price * 100) / 100,
        volume: Math.round(Math.random() * 100 + 20),
        open: Math.round((price + (Math.random() - 0.5) * volatility * 0.5) * 100) / 100,
        high: Math.round((price + Math.random() * volatility * 0.5) * 100) / 100,
        low: Math.round((price - Math.random() * volatility * 0.5) * 100) / 100
      });
    }
    return data;
  }

  /* ── Core: Interactive Line Chart ──────────────────────── */
  /**
   * Creates a Groww/Zerodha-style interactive chart.
   * @param {HTMLElement} container - The container element
   * @param {Object} config - Configuration object
   * config: {
   *   title: string,
   *   subtitle: string,
   *   data: {1D: [...], 1W: [...], ...} or auto-generated,
   *   basePrice: number,
   *   volatility: number,
   *   unit: string (default 'Rs/Qt'),
   *   showVolume: boolean,
   *   showPeriodSelector: boolean,
   *   theme: 'auto' | 'gain' | 'loss' | 'neutral',
   *   height: number,
   *   onPriceChange: function(price, change, pct)
   * }
   */
  function createLineChart(container, config) {
    config = config || {};
    var basePrice = config.basePrice || 2000;
    var volatility = config.volatility || 40;
    var unit = config.unit || 'Rs/Qt';
    var height = config.height || 280;
    var showVolume = config.showVolume !== false;
    var showPeriodSelector = config.showPeriodSelector !== false;

    // Generate data for all periods if not provided
    var allData = config.data || {
      '1D': generateIntradayData(basePrice, volatility, 78),
      '1W': generateHistoricalData(basePrice, volatility * 1.5, 7),
      '1M': generateHistoricalData(basePrice, volatility * 2, 30),
      '3M': generateHistoricalData(basePrice, volatility * 3, 90),
      '1Y': generateHistoricalData(basePrice, volatility * 5, 365)
    };

    var activePeriod = '1D';
    var currentData = allData[activePeriod];
    var animProgress = 0;
    var animFrame = null;
    var hoverIndex = -1;
    var isHovering = false;

    // Build DOM
    container.innerHTML = '';
    container.style.position = 'relative';

    // Header with live price
    var header = document.createElement('div');
    header.className = 'bh-chart-header';
    header.innerHTML = [
      '<div class="bh-chart-title-row">',
      '  <div>',
      config.title ? '    <div class="bh-chart-title">' + config.title + '</div>' : '',
      config.subtitle ? '    <div class="bh-chart-subtitle">' + config.subtitle + '</div>' : '',
      '  </div>',
      '  <div class="bh-chart-price-display">',
      '    <span class="bh-chart-current-price" id="cp-' + container.id + '"></span>',
      '    <span class="bh-chart-change" id="cc-' + container.id + '"></span>',
      '  </div>',
      '</div>'
    ].join('');
    container.appendChild(header);

    // Period selector tabs
    if (showPeriodSelector) {
      var tabs = document.createElement('div');
      tabs.className = 'bh-chart-period-tabs';
      var periods = Object.keys(allData);
      periods.forEach(function (p) {
        var btn = document.createElement('button');
        btn.className = 'bh-period-btn' + (p === activePeriod ? ' active' : '');
        btn.textContent = p;
        btn.dataset.period = p;
        btn.addEventListener('click', function () {
          activePeriod = p;
          currentData = allData[p];
          hoverIndex = -1;
          isHovering = false;
          tabs.querySelectorAll('.bh-period-btn').forEach(function (b) {
            b.classList.toggle('active', b.dataset.period === p);
          });
          startAnimation();
          updatePriceDisplay(-1);
        });
        tabs.appendChild(btn);
      });
      container.appendChild(tabs);
    }

    // Canvas wrapper
    var canvasWrap = document.createElement('div');
    canvasWrap.className = 'bh-chart-canvas-wrap';
    canvasWrap.style.height = height + 'px';
    canvasWrap.style.position = 'relative';

    var canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.cursor = 'crosshair';
    canvasWrap.appendChild(canvas);

    // Tooltip element
    var tooltip = document.createElement('div');
    tooltip.className = 'bh-chart-tooltip';
    tooltip.style.display = 'none';
    canvasWrap.appendChild(tooltip);

    container.appendChild(canvasWrap);

    // Canvas physical size (set once per draw call, cached)
    var _cachedW = 0, _cachedH = 0, _cachedCtx = null;

    function ensureCanvasReady() {
      var rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      var dpr = window.devicePixelRatio || 1;
      var w = Math.round(rect.width);
      var h = Math.round(rect.height);
      if (_cachedW !== w || _cachedH !== h) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        _cachedCtx = canvas.getContext('2d');
        _cachedCtx.scale(dpr, dpr);
        _cachedW = w;
        _cachedH = h;
      }
      return true;
    }

    // Compute chart metrics (reads from cached dimensions, no canvas resize)
    function getMetrics() {
      var w = _cachedW, h = _cachedH;
      if (!w || !h) return null;
      var ctx = _cachedCtx;
      var pad = { top: 16, right: 12, bottom: showVolume ? 52 : 28, left: 56 };
      var chartW = w - pad.left - pad.right;
      var chartH = (showVolume ? h * 0.72 : h) - pad.top - pad.bottom;
      var volumeH = showVolume ? h * 0.18 : 0;
      var volumeTop = pad.top + chartH + 10;

      var prices = currentData.map(function (d) { return d.price; });
      var minP = Math.min.apply(null, prices);
      var maxP = Math.max.apply(null, prices);
      var priceRange = maxP - minP || 1;
      var paddedMin = minP - priceRange * 0.08;
      var paddedMax = maxP + priceRange * 0.08;
      var paddedRange = paddedMax - paddedMin;

      var volumes = currentData.map(function (d) { return d.volume || 0; });
      var maxVol = Math.max.apply(null, volumes) || 1;

      return {
        ctx: ctx, w: w, h: h, dpr: window.devicePixelRatio || 1,
        pad: pad, chartW: chartW, chartH: chartH,
        volumeH: volumeH, volumeTop: volumeTop,
        minP: paddedMin, maxP: paddedMax, priceRange: paddedRange,
        maxVol: maxVol
      };
    }

    function xPos(i, m) {
      return m.pad.left + (i / (currentData.length - 1)) * m.chartW;
    }

    function yPos(price, m) {
      return m.pad.top + m.chartH - ((price - m.minP) / m.priceRange) * m.chartH;
    }

    // Determine trend color
    function getTrend() {
      if (!currentData.length) return 'neutral';
      var first = currentData[0].price;
      var last = currentData[currentData.length - 1].price;
      if (config.theme && config.theme !== 'auto') return config.theme;
      return last >= first ? 'gain' : 'loss';
    }

    function getColors() {
      var trend = getTrend();
      return {
        line: trend === 'gain' ? COLORS.gain : (trend === 'loss' ? COLORS.loss : COLORS.neutral),
        fill: trend === 'gain' ? COLORS.gainLight : (trend === 'loss' ? COLORS.lossLight : COLORS.neutralLight),
        glow: trend === 'gain' ? COLORS.gainGlow : (trend === 'loss' ? COLORS.lossGlow : 'rgba(28,36,82,0.2)'),
        dot: trend === 'gain' ? COLORS.gain : (trend === 'loss' ? COLORS.loss : COLORS.neutral)
      };
    }

    // Draw the chart
    function draw() {
      if (!currentData.length) return;
      if (!ensureCanvasReady()) return; // canvas not yet visible
      var m = getMetrics();
      if (!m) return;
      var ctx = m.ctx;
      var colors = getColors();
      var visibleCount = Math.max(1, Math.floor(currentData.length * animProgress));

      ctx.clearRect(0, 0, m.w, m.h);

      // Grid lines (horizontal)
      var gridSteps = 4;
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (var g = 0; g <= gridSteps; g++) {
        var gy = m.pad.top + (m.chartH / gridSteps) * g;
        ctx.beginPath();
        ctx.moveTo(m.pad.left, gy);
        ctx.lineTo(m.pad.left + m.chartW, gy);
        ctx.stroke();

        // Y-axis labels
        var priceVal = m.maxP - (m.priceRange / gridSteps) * g;
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = '500 10px "Google Sans", Inter, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(fmtPrice(priceVal), m.pad.left - 8, gy + 4);
      }

      // Area gradient fill
      ctx.beginPath();
      for (var i = 0; i < visibleCount; i++) {
        var x = xPos(i, m);
        var y = yPos(currentData[i].price, m);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      var lastX = xPos(visibleCount - 1, m);
      ctx.lineTo(lastX, m.pad.top + m.chartH);
      ctx.lineTo(xPos(0, m), m.pad.top + m.chartH);
      ctx.closePath();

      var areaGrad = ctx.createLinearGradient(0, m.pad.top, 0, m.pad.top + m.chartH);
      areaGrad.addColorStop(0, colors.fill);
      areaGrad.addColorStop(0.6, colors.fill.replace(/[\d.]+\)$/, '0.04)'));
      areaGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (var j = 0; j < visibleCount; j++) {
        var lx = xPos(j, m);
        var ly = yPos(currentData[j].price, m);
        if (j === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      }
      ctx.stroke();

      // Last point glow (animated pulse when fully drawn)
      if (animProgress >= 1 && visibleCount > 0) {
        var lpx = xPos(visibleCount - 1, m);
        var lpy = yPos(currentData[visibleCount - 1].price, m);
        var pulse = 0.5 + 0.5 * Math.sin(Date.now() / 400);
        
        ctx.beginPath();
        ctx.arc(lpx, lpy, 6 + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lpx, lpy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = colors.line;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Volume bars
      if (showVolume && m.volumeH > 10) {
        var barWidth = Math.max(1, m.chartW / currentData.length * 0.6);
        for (var vi = 0; vi < visibleCount; vi++) {
          var vx = xPos(vi, m) - barWidth / 2;
          var volH = (currentData[vi].volume / m.maxVol) * m.volumeH;
          var vy = m.volumeTop + m.volumeH - volH;

          var isUp = vi > 0 ? currentData[vi].price >= currentData[vi - 1].price : true;
          ctx.fillStyle = isUp ? 'rgba(0,200,83,0.25)' : 'rgba(255,23,68,0.25)';
          ctx.fillRect(vx, vy, barWidth, volH);
        }

        // Volume label
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = '500 9px "Google Sans", Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Volume', m.pad.left, m.volumeTop - 2);
      }

      // X-axis time labels
      var labelCount = Math.min(6, currentData.length);
      var labelStep = Math.max(1, Math.floor(currentData.length / labelCount));
      ctx.fillStyle = COLORS.textMuted;
      ctx.font = '500 10px "Google Sans", Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (var li = 0; li < currentData.length; li += labelStep) {
        var lbx = xPos(li, m);
        var label = currentData[li].time || currentData[li].dateStr || '';
        ctx.fillText(label, lbx, m.pad.top + m.chartH + (showVolume ? m.volumeH + 24 : 18));
      }

      // Crosshair + hover
      if (isHovering && hoverIndex >= 0 && hoverIndex < currentData.length) {
        var hx = xPos(hoverIndex, m);
        var hy = yPos(currentData[hoverIndex].price, m);

        // Vertical line
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = COLORS.crosshair;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx, m.pad.top);
        ctx.lineTo(hx, m.pad.top + m.chartH);
        ctx.stroke();

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(m.pad.left, hy);
        ctx.lineTo(m.pad.left + m.chartW, hy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hover dot
        ctx.beginPath();
        ctx.arc(hx, hy, 6, 0, Math.PI * 2);
        ctx.fillStyle = colors.glow;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, Math.PI * 2);
        ctx.fillStyle = colors.line;
        ctx.fill();
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Price tag on Y-axis
        ctx.fillStyle = COLORS.tooltipBg;
        var tagW = 52, tagH = 20;
        var tagY = hy - tagH / 2;
        ctx.beginPath();
        ctx.roundRect(0, tagY, tagW, tagH, 3);
        ctx.fill();
        ctx.fillStyle = COLORS.tooltipText;
        ctx.font = '600 10px "Google Sans", Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(fmtPrice(currentData[hoverIndex].price), tagW / 2, tagY + 14);
      }
    }

    // Animation loop
    function startAnimation() {
      animProgress = 0;
      if (animFrame) cancelAnimationFrame(animFrame);
      var startTime = Date.now();
      var duration = 800;

      function tick() {
        var elapsed = Date.now() - startTime;
        animProgress = Math.min(1, easeOutCubic(elapsed / duration));
        draw();
        if (animProgress < 1) {
          animFrame = requestAnimationFrame(tick);
        } else {
          // Start pulse animation
          pulseLoop();
        }
      }
      animFrame = requestAnimationFrame(tick);
    }

    var pulseActive = false;
    function pulseLoop() {
      if (pulseActive) return;
      pulseActive = true;
      function pulse() {
        if (!pulseActive) return;
        draw();
        animFrame = requestAnimationFrame(pulse);
      }
      pulse();
    }

    function stopPulse() {
      pulseActive = false;
      if (animFrame) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
    }

    // Update price display
    function updatePriceDisplay(idx) {
      var priceEl = document.getElementById('cp-' + container.id);
      var changeEl = document.getElementById('cc-' + container.id);
      if (!priceEl || !changeEl || !currentData.length) return;

      var first = currentData[0].price;
      var current = idx >= 0 && idx < currentData.length ? currentData[idx].price : currentData[currentData.length - 1].price;
      var diff = current - first;
      var pct = (diff / first * 100).toFixed(2);
      var isUp = diff >= 0;

      priceEl.textContent = fmtPrice(current);
      priceEl.style.color = COLORS.textPrimary;

      changeEl.textContent = (isUp ? '+' : '') + fmtPrice(diff) + ' (' + (isUp ? '+' : '') + pct + '%)';
      changeEl.style.color = isUp ? COLORS.gain : COLORS.loss;
      changeEl.style.background = isUp ? COLORS.gainLight : COLORS.lossLight;

      if (config.onPriceChange) {
        config.onPriceChange(current, diff, parseFloat(pct));
      }
    }

    // Tooltip content
    function updateTooltip(idx, mouseX) {
      if (idx < 0 || idx >= currentData.length) {
        tooltip.style.display = 'none';
        return;
      }
      var d = currentData[idx];
      var first = currentData[0].price;
      var diff = d.price - first;
      var pct = (diff / first * 100).toFixed(2);
      var isUp = diff >= 0;

      var html = '<div class="bh-tt-price">' + fmtPrice(d.price) + '</div>';
      html += '<div class="bh-tt-change" style="color:' + (isUp ? COLORS.gain : COLORS.loss) + '">';
      html += (isUp ? '▲' : '▼') + ' ' + (isUp ? '+' : '') + fmtPrice(Math.abs(diff)) + ' (' + (isUp ? '+' : '') + pct + '%)';
      html += '</div>';
      html += '<div class="bh-tt-time">' + (d.time || d.dateStr || '') + '</div>';
      if (d.volume) html += '<div class="bh-tt-vol">Vol: ' + fmtNum(d.volume) + ' Qt</div>';
      if (d.open !== undefined) {
        html += '<div class="bh-tt-ohlc">O:' + fmtPrice(d.open) + ' H:' + fmtPrice(d.high) + ' L:' + fmtPrice(d.low) + '</div>';
      }

      tooltip.innerHTML = html;
      tooltip.style.display = 'block';

      // Position tooltip
      var rect = canvasWrap.getBoundingClientRect();
      var ttW = tooltip.offsetWidth;
      var left = mouseX + 16;
      if (left + ttW > rect.width - 8) left = mouseX - ttW - 16;
      tooltip.style.left = Math.max(4, left) + 'px';
      tooltip.style.top = '10px';
    }

    // Mouse handlers
    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var logicalW = _cachedW || rect.width;
      var m = getMetrics();
      if (!m) return;

      // Find nearest data point
      var relX = mouseX - m.pad.left;
      var idx = Math.round((relX / m.chartW) * (currentData.length - 1));
      idx = Math.max(0, Math.min(currentData.length - 1, idx));

      if (idx !== hoverIndex || !isHovering) {
        hoverIndex = idx;
        isHovering = true;
        updatePriceDisplay(idx);
        updateTooltip(idx, mouseX);
        if (animProgress >= 1) draw();
      }
    });

    canvas.addEventListener('mouseleave', function () {
      isHovering = false;
      hoverIndex = -1;
      tooltip.style.display = 'none';
      updatePriceDisplay(-1);
      if (animProgress >= 1) draw();
    });

    // Touch support
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      var touch = e.touches[0];
      var rect = canvas.getBoundingClientRect();
      var mouseX = touch.clientX - rect.left;
      var m = getMetrics();
      var relX = mouseX - m.pad.left;
      var idx = Math.round((relX / m.chartW) * (currentData.length - 1));
      idx = Math.max(0, Math.min(currentData.length - 1, idx));
      hoverIndex = idx;
      isHovering = true;
      updatePriceDisplay(idx);
      updateTooltip(idx, mouseX);
      if (animProgress >= 1) draw();
    }, { passive: false });

    canvas.addEventListener('touchend', function () {
      isHovering = false;
      hoverIndex = -1;
      tooltip.style.display = 'none';
      updatePriceDisplay(-1);
      if (animProgress >= 1) draw();
    });

    // Resize handler
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        draw();
      }, 100);
    });

    // Initial draw
    startAnimation();
    updatePriceDisplay(-1);

    return {
      refresh: function (newData) {
        if (newData) {
          Object.keys(newData).forEach(function (k) { allData[k] = newData[k]; });
          currentData = allData[activePeriod];
        }
        startAnimation();
        updatePriceDisplay(-1);
      },
      updateData: function (period, data) {
        allData[period] = data;
        if (period === activePeriod) {
          currentData = data;
          draw();
          updatePriceDisplay(-1);
        }
      },
      addPoint: function (point) {
        currentData.push(point);
        draw();
        updatePriceDisplay(-1);
      },
      destroy: function () {
        stopPulse();
        container.innerHTML = '';
      }
    };
  }

  /* ── Bar Chart (Volume / Day-wise) ─────────────────────── */
  function createBarChart(container, config) {
    config = config || {};
    var height = config.height || 240;
    var data = config.data || [];
    var animProgress = 0;
    var animFrame = null;
    var hoverIndex = -1;

    container.innerHTML = '';
    container.style.position = 'relative';

    if (config.title) {
      var header = document.createElement('div');
      header.className = 'bh-chart-header';
      header.innerHTML = '<div class="bh-chart-title">' + config.title + '</div>' +
        (config.subtitle ? '<div class="bh-chart-subtitle">' + config.subtitle + '</div>' : '');
      container.appendChild(header);
    }

    var canvasWrap = document.createElement('div');
    canvasWrap.style.height = height + 'px';
    canvasWrap.style.position = 'relative';

    var canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.cursor = 'crosshair';
    canvasWrap.appendChild(canvas);

    var tooltip = document.createElement('div');
    tooltip.className = 'bh-chart-tooltip';
    tooltip.style.display = 'none';
    canvasWrap.appendChild(tooltip);

    container.appendChild(canvasWrap);

    function draw() {
      if (!data.length) return;
      var s = setupCanvas(canvas);
      if (!s.ready) return;
      var ctx = s.ctx;
      var pad = { top: 20, right: 16, bottom: 40, left: 48 };
      var chartW = s.w - pad.left - pad.right;
      var chartH = s.h - pad.top - pad.bottom;

      var values = data.map(function (d) { return d.value || d.vol || 0; });
      var maxVal = Math.max.apply(null, values) * 1.15;

      var barGap = chartW / data.length;
      var barW = barGap * 0.55;

      ctx.clearRect(0, 0, s.w, s.h);

      // Grid
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      for (var g = 0; g <= 4; g++) {
        var gy = pad.top + (chartH / 4) * g;
        ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(pad.left + chartW, gy); ctx.stroke();
        var gv = maxVal - (maxVal / 4) * g;
        ctx.fillStyle = COLORS.textMuted;
        ctx.font = '500 10px "Google Sans", Inter, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(gv), pad.left - 6, gy + 4);
      }

      // Bars
      data.forEach(function (d, i) {
        var val = d.value || d.vol || 0;
        var barH = (val / maxVal) * chartH * easeOutCubic(animProgress);
        var x = pad.left + i * barGap + (barGap - barW) / 2;
        var y = pad.top + chartH - barH;
        var r = Math.min(4, barW / 3);

        var isHovered = i === hoverIndex;

        // Bar gradient
        var grad = ctx.createLinearGradient(0, y, 0, y + barH);
        if (isHovered) {
          grad.addColorStop(0, '#2546B0');
          grad.addColorStop(1, '#1C2452');
        } else {
          grad.addColorStop(0, 'rgba(28, 36, 82, 0.75)');
          grad.addColorStop(1, 'rgba(28, 36, 82, 0.95)');
        }
        ctx.fillStyle = grad;

        // Rounded top bar
        ctx.beginPath();
        ctx.moveTo(x, y + barH);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + barW - r, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx.lineTo(x + barW, y + barH);
        ctx.closePath();
        ctx.fill();

        // Hover glow
        if (isHovered) {
          ctx.shadowColor = 'rgba(37, 70, 176, 0.3)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Value on top
        if (animProgress > 0.8) {
          var labelOpacity = Math.min(1, (animProgress - 0.8) / 0.2);
          ctx.globalAlpha = labelOpacity;
          ctx.fillStyle = isHovered ? '#2546B0' : COLORS.textPrimary;
          ctx.font = 'bold 11px "Google Sans", Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(val, x + barW / 2, y - 6);
          ctx.globalAlpha = 1;
        }

        // X-axis labels
        ctx.fillStyle = COLORS.textPrimary;
        ctx.font = '600 11px "Google Sans", Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.label || d.day || '', x + barW / 2, pad.top + chartH + 16);

        if (d.sublabel || d.date) {
          ctx.fillStyle = COLORS.textMuted;
          ctx.font = '500 9px "Google Sans", Inter, system-ui, sans-serif';
          ctx.fillText(d.sublabel || d.date || '', x + barW / 2, pad.top + chartH + 28);
        }
      });
    }

    function startAnimation() {
      animProgress = 0;
      if (animFrame) cancelAnimationFrame(animFrame);
      var startTime = Date.now();
      var duration = 700;
      function tick() {
        var elapsed = Date.now() - startTime;
        animProgress = Math.min(1, easeOutCubic(elapsed / duration));
        draw();
        if (animProgress < 1) animFrame = requestAnimationFrame(tick);
      }
      animFrame = requestAnimationFrame(tick);
    }

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      var mouseX = e.clientX - rect.left;
      var pad = { left: 48, right: 16 };
      var chartW = rect.width - pad.left - pad.right;
      var barGap = chartW / data.length;
      var idx = Math.floor((mouseX - pad.left) / barGap);
      idx = Math.max(-1, Math.min(data.length - 1, idx));

      if (idx !== hoverIndex) {
        hoverIndex = idx;
        draw();
        if (idx >= 0 && data[idx]) {
          var d = data[idx];
          tooltip.innerHTML = '<div class="bh-tt-price">' + fmtNum(d.value || d.vol || 0) + ' ' + (config.unit || 'Qt') + '</div>' +
            '<div class="bh-tt-time">' + (d.label || d.day || '') + ' ' + (d.sublabel || d.date || '') + '</div>' +
            (d.bids ? '<div class="bh-tt-vol">' + d.bids + ' bids · High: ₹' + (d.high || '') + '</div>' : '');
          tooltip.style.display = 'block';
          tooltip.style.left = Math.max(4, Math.min(mouseX + 12, rect.width - tooltip.offsetWidth - 8)) + 'px';
          tooltip.style.top = '10px';
        } else {
          tooltip.style.display = 'none';
        }
      }
    });

    canvas.addEventListener('mouseleave', function () {
      hoverIndex = -1;
      tooltip.style.display = 'none';
      draw();
    });

    startAnimation();

    return {
      refresh: function (newData) {
        if (newData) data = newData;
        startAnimation();
      },
      destroy: function () {
        if (animFrame) cancelAnimationFrame(animFrame);
        container.innerHTML = '';
      }
    };
  }

  /* ── Donut / Pie Chart ─────────────────────────────────── */
  function createDonutChart(container, config) {
    config = config || {};
    var height = config.height || 220;
    var data = config.data || [];
    var animProgress = 0;
    var animFrame = null;
    var hoverIndex = -1;

    var defaultColors = ['#1C2452', '#2546B0', '#D99A06', '#00C853', '#FF6B35', '#8B5CF6', '#06B6D4'];

    container.innerHTML = '';
    container.style.position = 'relative';

    if (config.title) {
      var header = document.createElement('div');
      header.className = 'bh-chart-header';
      header.innerHTML = '<div class="bh-chart-title">' + config.title + '</div>' +
        (config.subtitle ? '<div class="bh-chart-subtitle">' + config.subtitle + '</div>' : '');
      container.appendChild(header);
    }

    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '20px';

    var canvasWrap = document.createElement('div');
    canvasWrap.style.width = height + 'px';
    canvasWrap.style.height = height + 'px';
    canvasWrap.style.flexShrink = '0';

    var canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = 'pointer';
    canvasWrap.appendChild(canvas);
    row.appendChild(canvasWrap);

    // Legend
    var legend = document.createElement('div');
    legend.className = 'bh-chart-legend';
    data.forEach(function (d, i) {
      var item = document.createElement('div');
      item.className = 'bh-legend-item';
      item.innerHTML = '<span class="bh-legend-dot" style="background:' + (d.color || defaultColors[i % defaultColors.length]) + '"></span>' +
        '<span class="bh-legend-label">' + d.label + '</span>' +
        '<span class="bh-legend-value">' + d.value + (config.unit ? ' ' + config.unit : '') + '</span>';
      legend.appendChild(item);
    });
    row.appendChild(legend);
    container.appendChild(row);

    var total = data.reduce(function (s, d) { return s + d.value; }, 0);

    function draw() {
      if (!data.length || total === 0) return;
      var s = setupCanvas(canvas);
      if (!s.ready) return;
      var ctx = s.ctx;
      var cx = s.w / 2, cy = s.h / 2;
      var outerR = Math.min(cx, cy) - 10;
      var innerR = outerR * 0.58;

      ctx.clearRect(0, 0, s.w, s.h);

      var startAngle = -Math.PI / 2;
      var maxAngle = Math.PI * 2 * easeOutCubic(animProgress);

      data.forEach(function (d, i) {
        var sliceAngle = (d.value / total) * maxAngle;
        var endAngle = startAngle + sliceAngle;
        var isHovered = i === hoverIndex;
        var r = isHovered ? outerR + 4 : outerR;

        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = d.color || defaultColors[i % defaultColors.length];
        if (isHovered) {
          ctx.shadowColor = 'rgba(0,0,0,0.15)';
          ctx.shadowBlur = 10;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        startAngle = endAngle;
      });

      // Center text
      if (config.centerLabel) {
        ctx.fillStyle = COLORS.textPrimary;
        ctx.font = 'bold 18px "Google Sans", Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(config.centerLabel, cx, cy + 2);
        if (config.centerSub) {
          ctx.fillStyle = COLORS.textSecondary;
          ctx.font = '500 11px "Google Sans", Inter, system-ui, sans-serif';
          ctx.fillText(config.centerSub, cx, cy + 18);
        }
      }
    }

    function startAnimation() {
      animProgress = 0;
      if (animFrame) cancelAnimationFrame(animFrame);
      var startTime = Date.now();
      function tick() {
        animProgress = Math.min(1, easeOutCubic((Date.now() - startTime) / 900));
        draw();
        if (animProgress < 1) animFrame = requestAnimationFrame(tick);
      }
      animFrame = requestAnimationFrame(tick);
    }

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left - rect.width / 2;
      var my = e.clientY - rect.top - rect.height / 2;
      var angle = Math.atan2(my, mx) + Math.PI / 2;
      if (angle < 0) angle += Math.PI * 2;

      var cumAngle = 0;
      var found = -1;
      for (var i = 0; i < data.length; i++) {
        var sliceAngle = (data[i].value / total) * Math.PI * 2;
        if (angle >= cumAngle && angle < cumAngle + sliceAngle) { found = i; break; }
        cumAngle += sliceAngle;
      }

      if (found !== hoverIndex) {
        hoverIndex = found;
        draw();
      }
    });

    canvas.addEventListener('mouseleave', function () {
      hoverIndex = -1;
      draw();
    });

    startAnimation();

    return {
      refresh: function (newData) {
        if (newData) { data = newData; total = data.reduce(function (s, d) { return s + d.value; }, 0); }
        startAnimation();
      },
      destroy: function () {
        if (animFrame) cancelAnimationFrame(animFrame);
        container.innerHTML = '';
      }
    };
  }

  /* ── Live Ticker Bar ───────────────────────────────────── */
  function createLiveTicker(container, config) {
    config = config || {};
    var items = config.items || [];
    
    container.innerHTML = '';
    container.className = (container.className || '') + ' bh-live-ticker';

    var track = document.createElement('div');
    track.className = 'bh-ticker-track';

    items.forEach(function (item) {
      var chip = document.createElement('div');
      chip.className = 'bh-ticker-chip';
      var isUp = item.change >= 0;
      chip.innerHTML = '<span class="bh-ticker-name">' + item.name + '</span>' +
        '<span class="bh-ticker-price">' + fmtPrice(item.price) + '</span>' +
        '<span class="bh-ticker-change" style="color:' + (isUp ? COLORS.gain : COLORS.loss) + '">' +
        (isUp ? '▲' : '▼') + ' ' + Math.abs(item.change).toFixed(1) + '%</span>';
      track.appendChild(chip);
    });

    // Duplicate for seamless scroll
    items.forEach(function (item) {
      var chip = document.createElement('div');
      chip.className = 'bh-ticker-chip';
      var isUp = item.change >= 0;
      chip.innerHTML = '<span class="bh-ticker-name">' + item.name + '</span>' +
        '<span class="bh-ticker-price">' + fmtPrice(item.price) + '</span>' +
        '<span class="bh-ticker-change" style="color:' + (isUp ? COLORS.gain : COLORS.loss) + '">' +
        (isUp ? '▲' : '▼') + ' ' + Math.abs(item.change).toFixed(1) + '%</span>';
      track.appendChild(chip);
    });

    container.appendChild(track);

    return {
      update: function (newItems) {
        items = newItems;
        createLiveTicker(container, { items: items });
      }
    };
  }

  /* ── CSS Injection ────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('bh-charts-css')) return;
    var style = document.createElement('style');
    style.id = 'bh-charts-css';
    style.textContent = [
      '.bh-chart-header { margin-bottom: 12px; }',
      '.bh-chart-title-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; }',
      '.bh-chart-title { font-family: var(--font-slab, "Google Sans Display", system-ui); font-size: 16px; font-weight: 700; color: #1C2452; margin-bottom: 2px; }',
      '.bh-chart-subtitle { font-size: 12.5px; color: #6B7280; }',
      '.bh-chart-price-display { text-align: right; }',
      '.bh-chart-current-price { font-family: var(--font-slab, "Google Sans Display", system-ui); font-size: 24px; font-weight: 700; color: #1C2452; display: block; line-height: 1.1; }',
      '.bh-chart-change { display: inline-block; font-size: 12.5px; font-weight: 600; padding: 2px 8px; border-radius: 4px; margin-top: 4px; transition: all 0.2s ease; }',
      '.bh-chart-period-tabs { display: flex; gap: 4px; margin-bottom: 12px; background: #F3F4F6; padding: 3px; border-radius: 8px; width: fit-content; }',
      '.bh-period-btn { border: none; background: transparent; padding: 6px 14px; font: 600 12.5px "Google Sans", Inter, system-ui, sans-serif; color: #6B7280; cursor: pointer; border-radius: 6px; transition: all 0.2s ease; }',
      '.bh-period-btn:hover { color: #1C2452; background: rgba(255,255,255,0.5); }',
      '.bh-period-btn.active { background: #FFFFFF; color: #1C2452; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }',
      '.bh-chart-canvas-wrap { border-radius: 8px; overflow: hidden; }',
      '.bh-chart-tooltip { position: absolute; z-index: 10; background: rgba(28,36,82,0.94); backdrop-filter: blur(8px); color: #fff; padding: 10px 14px; border-radius: 8px; font-size: 12px; pointer-events: none; box-shadow: 0 8px 24px rgba(0,0,0,0.18); min-width: 140px; transition: opacity 0.15s ease; }',
      '.bh-tt-price { font-family: var(--font-slab, "Google Sans Display", system-ui); font-size: 17px; font-weight: 700; margin-bottom: 2px; }',
      '.bh-tt-change { font-size: 12px; font-weight: 600; margin-bottom: 4px; }',
      '.bh-tt-time { font-size: 11px; color: rgba(255,255,255,0.65); margin-bottom: 2px; }',
      '.bh-tt-vol { font-size: 11px; color: rgba(255,255,255,0.55); }',
      '.bh-tt-ohlc { font-size: 10px; color: rgba(255,255,255,0.45); margin-top: 2px; }',
      '.bh-chart-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }',
      '.bh-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }',
      '.bh-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }',
      '.bh-legend-label { color: #4B5563; flex: 1; }',
      '.bh-legend-value { font-weight: 700; color: #1C2452; }',
      '.bh-live-ticker { overflow: hidden; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 0; }',
      '.bh-ticker-track { display: flex; gap: 20px; animation: bhTickerScroll 25s linear infinite; white-space: nowrap; }',
      '.bh-ticker-chip { display: flex; align-items: center; gap: 8px; padding: 4px 12px; font-size: 13px; flex-shrink: 0; }',
      '.bh-ticker-name { font-weight: 600; color: #1C2452; }',
      '.bh-ticker-price { font-weight: 700; color: #374151; }',
      '.bh-ticker-change { font-weight: 600; font-size: 12px; }',
      '@keyframes bhTickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }',
      '.bh-live-ticker:hover .bh-ticker-track { animation-play-state: paused; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Auto-inject on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  /* ── Public API ────────────────────────────────────────── */
  return {
    createLineChart: createLineChart,
    createBarChart: createBarChart,
    createDonutChart: createDonutChart,
    createLiveTicker: createLiveTicker,
    generateIntradayData: generateIntradayData,
    generateHistoricalData: generateHistoricalData,
    COLORS: COLORS,
    fmtPrice: fmtPrice
  };
})();
