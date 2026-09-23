/* ============================================================
   Bhowanee — Shared UI Components (components.js)
   BidBoard, OTP modal, toast notifications, contract card,
   and stage chip helpers. Import after data.js and market.js.
   ============================================================ */

window.BhComp = (function () {
  'use strict';

  /* ── Toast notifications ──────────────────────────────────── */
  function toast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3500;
    var area = document.getElementById('toast-area');
    if (!area) {
      area = document.createElement('div');
      area.id = 'toast-area';
      document.body.appendChild(area);
    }
    var t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = message;
    area.appendChild(t);
    setTimeout(function () {
      t.style.transition = '300ms';
      t.style.opacity = '0';
      setTimeout(function () { area.removeChild(t); }, 310);
    }, duration);
  }

  /* ── OTP Modal ────────────────────────────────────────────── */
  var OTP_OVERLAY = null;
  var OTP_CB = null;

  function ensureOTPModal() {
    if (OTP_OVERLAY) return;
    OTP_OVERLAY = document.createElement('div');
    OTP_OVERLAY.className = 'modal-overlay';
    OTP_OVERLAY.setAttribute('hidden', '');
    OTP_OVERLAY.innerHTML = [
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="otp-title">',
      '  <h3 id="otp-title">Farmer confirmation required</h3>',
      '  <p id="otp-farmer" class="modal-sub"></p>',
      '  <div class="alert" id="otp-sms-block">',
      '    <p id="otp-sms-text" style="font-size:15px;line-height:1.5"></p>',
      '    <p style="margin-top:8px;font-size:13.5px;color:var(--ink-soft)">Demo: reply 1 to confirm, 2 to decline.</p>',
      '  </div>',
      '  <div class="field" style="margin-top:16px">',
      '    <label for="otp-reply">Farmer reply (1 = agree, 2 = no)</label>',
      '    <input id="otp-reply" inputmode="numeric" maxlength="1" placeholder="1 or 2">',
      '  </div>',
      '  <p class="field-msg err" id="otp-err" style="margin-top:6px"></p>',
      '  <div class="modal-actions">',
      '    <button class="btn" type="button" id="otp-submit">Submit</button>',
      '    <button class="btn secondary" type="button" id="otp-cancel">Cancel</button>',
      '  </div>',
      '</div>'
    ].join('');
    document.body.appendChild(OTP_OVERLAY);

    document.getElementById('otp-submit').addEventListener('click', function () {
      var val = (document.getElementById('otp-reply').value || '').trim();
      if (val === '1') {
        OTP_OVERLAY.setAttribute('hidden', '');
        document.getElementById('otp-reply').value = '';
        document.getElementById('otp-err').textContent = '';
        if (OTP_CB) OTP_CB(true);
      } else if (val === '2') {
        OTP_OVERLAY.setAttribute('hidden', '');
        document.getElementById('otp-reply').value = '';
        if (OTP_CB) OTP_CB(false);
        toast('Farmer declined the change.', 'warn');
      } else {
        document.getElementById('otp-err').textContent = 'Enter 1 to agree or 2 to say no.';
      }
    });

    document.getElementById('otp-cancel').addEventListener('click', function () {
      OTP_OVERLAY.setAttribute('hidden', '');
      document.getElementById('otp-reply').value = '';
      document.getElementById('otp-err').textContent = '';
      if (OTP_CB) OTP_CB(false);
    });

    document.getElementById('otp-reply').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('otp-submit').click();
    });
  }

  // Wire BD's OTP requirement
  if (typeof BD !== 'undefined') {
    BD.on('otpRequired', function (detail) {
      showOTP(detail.farmerName, detail.message, detail.callback);
    });
  }

  function showOTP(farmerName, message, cb) {
    ensureOTPModal();
    OTP_CB = cb;
    document.getElementById('otp-farmer').textContent = 'For farmer: ' + farmerName;
    document.getElementById('otp-sms-text').textContent =
      'SMS to ' + farmerName + ': "Bhowanee: ' + message + ' Reply 1 to agree or 2 to say no."';
    document.getElementById('otp-err').textContent = '';
    document.getElementById('otp-reply').value = '';
    OTP_OVERLAY.removeAttribute('hidden');
    document.getElementById('otp-reply').focus();
  }

  /* ── Bid Board ────────────────────────────────────────────── */
  /**
   * renderBidBoard(svgEl, opts)
   * opts: {
   *   farmerPrice: number,
   *   mandiPrice: number,
   *   bids: [{buyer, price, timestamp}],
   *   crop: string,
   *   width: number  (viewBox width, default 640)
   *   height: number (viewBox height, default 300)
   * }
   */
  function renderBidBoard(svgEl, opts) {
    var farmerPrice = opts.farmerPrice || 0;
    var mandiPrice  = opts.mandiPrice  || 0;
    var bids        = opts.bids        || [];
    var W           = opts.width  || 640;
    var H           = opts.height || 300;

    // Y scale
    var prices = bids.map(function (b) { return b.price; }).concat([farmerPrice, mandiPrice].filter(Boolean));
    if (!prices.length) prices = [2000];
    var lo  = Math.floor((Math.min.apply(null, prices) - 80)  / 100) * 100;
    var hi  = Math.ceil( (Math.max.apply(null, prices) + 80)  / 100) * 100;
    if (hi <= lo) hi = lo + 200;
    var step = (hi - lo) > 600 ? 200 : 100;

    function yPos(p) { return 250 - (p - lo) / (hi - lo) * 205; }
    var n = bids.length;
    function xPos(i) { return 60 + 470 * (i + 1) / (n + 1); }

    var html = '<g class="axis">';
    for (var v = lo; v <= hi; v += step) {
      var yv = yPos(v);
      html += '<line x1="60" y1="' + yv + '" x2="540" y2="' + yv + '" stroke="' + (v === lo ? '#1C2452' : '#C7CDD8') + '" stroke-width="' + (v === lo ? 1.5 : 1) + '"/>';
      html += '<text x="52" y="' + (yv + 4) + '" text-anchor="end" font-size="12" fill="#4B5375">' + v.toLocaleString('en-IN') + '</text>';
    }
    html += '<text x="8" y="28" font-size="12" font-weight="600" fill="#4B5375">₹/qt</text>';
    html += '<text x="295" y="292" text-anchor="middle" font-size="12" fill="#4B5375">Bids, oldest to newest</text>';
    html += '</g>';

    // Mandi price dashed line
    if (mandiPrice) {
      var ym = yPos(mandiPrice);
      html += '<line x1="60" y1="' + ym + '" x2="540" y2="' + ym + '" stroke="#6B4E3A" stroke-width="2" stroke-dasharray="7 5"/>';
    }

    // Highest bid step line + dots
    var topPrice = 0, topBidIdx = -1, bidPath = '', bidDots = '';
    bids.forEach(function (b, i) {
      var xi = xPos(i), yi = yPos(b.price);
      var isTop = b.price > topPrice;
      if (i === 0) { bidPath = 'M' + xi + ',' + yi; }
      else if (isTop) { bidPath += ' H' + xi + ' V' + yi; }
      if (isTop) {
        topPrice = b.price;
        topBidIdx = i;
        bidDots += '<circle cx="' + xi + '" cy="' + yi + '" r="6" fill="#D99A06"><title>' + b.buyer + ': ₹' + Number(b.price).toLocaleString('en-IN') + '</title></circle>';
      } else {
        bidDots += '<circle cx="' + xi + '" cy="' + yi + '" r="4.5" fill="#F9FAF7" stroke="#D99A06" stroke-width="2"><title>' + b.buyer + ': ₹' + Number(b.price).toLocaleString('en-IN') + '</title></circle>';
      }
    });
    if (n && topPrice) {
      bidPath += ' H540';
      html += '<path d="' + bidPath + '" fill="none" stroke="#D99A06" stroke-width="3.5" stroke-linejoin="round"/>';
    }
    html += bidDots;

    // Farmer price solid line
    if (farmerPrice) {
      var yf = yPos(farmerPrice);
      html += '<line x1="60" y1="' + yf + '" x2="540" y2="' + yf + '" stroke="#1C2452" stroke-width="3.5"/>';
    }

    // Right-side labels (collision avoidance)
    var labs = [];
    if (farmerPrice) labs.push({ y: yPos(farmerPrice), text: 'Your price ₹' + Number(farmerPrice).toLocaleString('en-IN'), color: '#1C2452', weight: '600' });
    if (topPrice)    labs.push({ y: yPos(topPrice),    text: 'Highest offer ₹' + Number(topPrice).toLocaleString('en-IN'), color: '#8A5F00', weight: '500' });
    if (mandiPrice)  labs.push({ y: yPos(mandiPrice),  text: 'Mandi today ₹' + Number(mandiPrice).toLocaleString('en-IN'), color: '#6B4E3A', weight: '400' });
    labs.sort(function (a, b) { return a.y - b.y; });
    for (var k = 1; k < labs.length; k++) {
      if (labs[k].y - labs[k - 1].y < 16) labs[k].y = labs[k - 1].y + 16;
    }
    labs.forEach(function (l) {
      html += '<text x="548" y="' + (l.y + 4) + '" font-size="12.5" font-weight="' + l.weight + '" fill="' + l.color + '">' + escSVG(l.text) + '</text>';
    });

    svgEl.innerHTML = html;
    return { topPrice: topPrice, n: n };
  }

  function escSVG(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ── Contract stage chip HTML ─────────────────────────────── */
  function stageChip(stage) {
    if (!stage || typeof BD === 'undefined') return '';
    return '<span class="chip ' + BD.stageClass(stage) + '">' + BD.stageLabel(stage) + '</span>';
  }

  /* ── Agri Intelligence: Soil Analysis HTML ───────────────── */
  function soilAnalysisHTML(soil) {
    if (!soil) return '<p class="text-soft" style="padding:10px">No soil record available for this parcel.</p>';
    var npk = soil.npk || {};
    var n = npk.n || { val: 240, max: 280, rating: 'Medium', unit: 'kg/ha' };
    var p = npk.p || { val: 20, max: 25, rating: 'Optimal', unit: 'kg/ha' };
    var k = npk.k || { val: 320, max: 350, rating: 'High', unit: 'kg/ha' };

    var nPct = Math.min(100, Math.round((n.val / (n.max || 300)) * 100));
    var pPct = Math.min(100, Math.round((p.val / (p.max || 30)) * 100));
    var kPct = Math.min(100, Math.round((k.val / (k.max || 400)) * 100));

    var microList = (soil.micronutrients || []).map(function (m) {
      return '<div class="micro-chip"><span class="micro-name">' + escSVG(m.name) + '</span><span class="micro-val">' + escSVG(m.val) + '</span><span class="micro-badge">' + escSVG(m.status) + '</span></div>';
    }).join('');

    var phPercent = Math.min(95, Math.max(5, ((soil.ph - 5) / 4) * 100));

    return [
      '<div class="agri-card soil-card">',
      '  <div class="agri-card-head">',
      '    <div>',
      '      <span class="agri-card-title">🧪 Soil Health Analysis</span>',
      '      <div class="agri-card-sub">' + escSVG(soil.labName || 'District Lab') + ' · ' + escSVG(soil.testDate || '') + '</div>',
      '    </div>',
      '    <span class="badge" style="background:#E0F2FE;color:#0369A1;font-size:11px;font-weight:700">' + escSVG(soil.shcNumber || 'SHC-OK') + '</span>',
      '  </div>',

      '  <div class="soil-stats-row">',
      '    <div class="soil-stat-box">',
      '      <div class="soil-stat-label">Soil Reaction (pH)</div>',
      '      <div class="soil-stat-val">' + soil.ph + '</div>',
      '      <div class="soil-stat-tag text-ok">' + escSVG(soil.phStatus) + '</div>',
      '      <div class="ph-track" title="pH scale from 5.0 (acidic) to 9.0 (alkaline)"><div class="ph-needle" style="left:' + phPercent + '%"></div></div>',
      '    </div>',
      '    <div class="soil-stat-box">',
      '      <div class="soil-stat-label">Organic Carbon (OC)</div>',
      '      <div class="soil-stat-val">' + soil.oc + '%</div>',
      '      <div class="soil-stat-tag">' + escSVG(soil.ocStatus) + '</div>',
      '    </div>',
      '    <div class="soil-stat-box">',
      '      <div class="soil-stat-label">Electrical Cond. (EC)</div>',
      '      <div class="soil-stat-val">' + soil.ec + ' <small>dS/m</small></div>',
      '      <div class="soil-stat-tag">' + escSVG(soil.ecStatus) + '</div>',
      '    </div>',
      '    <div class="soil-stat-box">',
      '      <div class="soil-stat-label">Field Moisture</div>',
      '      <div class="soil-stat-val">' + soil.moisture + '%</div>',
      '      <div class="soil-stat-tag text-ok">' + escSVG(soil.moistureStatus) + '</div>',
      '    </div>',
      '  </div>',

      '  <div class="soil-section-title">Macro Nutrients (N-P-K Available Levels)</div>',
      '  <div class="npk-grid">',
      '    <div class="npk-row">',
      '      <div class="npk-info"><span>Available Nitrogen (N)</span><b>' + n.val + ' ' + (n.unit || 'kg/ha') + ' · <i class="tag-rate">' + n.rating + '</i></b></div>',
      '      <div class="npk-bar-bg"><div class="npk-bar-fill npk-n" style="width:' + nPct + '%"></div></div>',
      '    </div>',
      '    <div class="npk-row">',
      '      <div class="npk-info"><span>Available Phosphorus (P₂O₅)</span><b>' + p.val + ' ' + (p.unit || 'kg/ha') + ' · <i class="tag-rate">' + p.rating + '</i></b></div>',
      '      <div class="npk-bar-bg"><div class="npk-bar-fill npk-p" style="width:' + pPct + '%"></div></div>',
      '    </div>',
      '    <div class="npk-row">',
      '      <div class="npk-info"><span>Available Potassium (K₂O)</span><b>' + k.val + ' ' + (k.unit || 'kg/ha') + ' · <i class="tag-rate">' + k.rating + '</i></b></div>',
      '      <div class="npk-bar-bg"><div class="npk-bar-fill npk-k" style="width:' + kPct + '%"></div></div>',
      '    </div>',
      '  </div>',

      '  <div class="soil-section-title" style="margin-top:14px">Essential Micronutrients</div>',
      '  <div class="micro-grid">' + microList + '</div>',

      '  <div class="agri-advisory-box" style="margin-top:14px">',
      '    <div class="agri-advisory-head">🌱 Agronomist Soil Advisory</div>',
      '    <p>' + escSVG(soil.advisory || '') + '</p>',
      '  </div>',
      '</div>'
    ].join('');
  }

  /* ── Agri Intelligence: Climatic Condition HTML ──────────── */
  function climateHTML(climate) {
    if (!climate) return '<p class="text-soft" style="padding:10px">No climate telemetry available for this parcel.</p>';
    var fcast = (climate.forecast5Day || []).map(function (f) {
      return [
        '<div class="forecast-day-card">',
        '  <div class="f-day">' + escSVG(f.day) + '</div>',
        '  <div class="f-icon">' + f.icon + '</div>',
        '  <div class="f-temps"><b>' + f.high + '°</b> / <span>' + f.low + '°</span></div>',
        '  <div class="f-rain">💧 ' + escSVG(f.rainProb) + '</div>',
        '  <div class="f-desc">' + escSVG(f.desc) + '</div>',
        '</div>'
      ].join('');
    }).join('');

    return [
      '<div class="agri-card climate-card">',
      '  <div class="agri-card-head">',
      '    <div>',
      '      <span class="agri-card-title">🌤️ Micro-Climate & Weather</span>',
      '      <div class="agri-card-sub">' + escSVG(climate.station || 'Local AWS Station') + ' · ' + escSVG(climate.lastUpdated || 'Live') + '</div>',
      '    </div>',
      '    <span class="badge" style="background:#ECFDF5;color:#047857;font-size:11px;font-weight:700">● LIVE TELEMETRY</span>',
      '  </div>',

      '  <div class="climate-hero">',
      '    <div class="climate-hero-left">',
      '      <span class="climate-hero-icon">' + (climate.icon || '🌤️') + '</span>',
      '      <div>',
      '        <div class="climate-temp-big">' + climate.temp + '<span style="font-size:22px">°C</span></div>',
      '        <div class="climate-condition">' + escSVG(climate.condition) + ' · Feels like ' + climate.tempFeels + '°C</div>',
      '      </div>',
      '    </div>',
      '    <div class="climate-hero-right">',
      '      <div>High: <b>' + climate.tempHigh + '°C</b></div>',
      '      <div>Low: <b>' + climate.tempLow + '°C</b></div>',
      '      <div>Dew Point: <b>' + escSVG(climate.dewPoint || '19.2°C') + '</b></div>',
      '    </div>',
      '  </div>',

      '  <div class="climate-grid">',
      '    <div class="climate-item"><label>Relative Humidity</label><b>' + climate.humidity + '%</b><span>' + escSVG(climate.humidityStatus || 'Moderate') + '</span></div>',
      '    <div class="climate-item"><label>Wind Speed & Dir</label><b>' + escSVG(climate.wind) + '</b><span>Surface breeze</span></div>',
      '    <div class="climate-item"><label>Evapotranspiration</label><b>' + escSVG(climate.et0 || '4.2 mm/d') + '</b><span>ET₀ daily loss</span></div>',
      '    <div class="climate-item"><label>Rainfall (Season)</label><b>' + escSVG(climate.rain ? climate.rain.seasonTotal : '685 mm') + '</b><span class="text-ok">' + escSVG(climate.rain ? climate.rain.normalPct : '+8% Normal') + '</span></div>',
      '  </div>',

      '  <div class="soil-section-title" style="margin-top:14px">5-Day Agro-Weather Forecast</div>',
      '  <div class="forecast-row">' + fcast + '</div>',

      '  <div class="agri-advisory-box alert-warn" style="margin-top:14px">',
      '    <div class="agri-advisory-head" style="color:#B45309">⚠️ Agro-Climatic Advisory</div>',
      '    <p>' + escSVG(climate.agroAdvisory || '') + '</p>',
      '  </div>',
      '</div>'
    ].join('');
  }

  /* ── Agri Intelligence: Crop Cycles History HTML ─────────── */
  function cropCyclesHTML(cycles) {
    if (!cycles || !cycles.length) return '<p class="text-soft" style="padding:10px">No historical crop cycles logged.</p>';

    var cards = cycles.map(function (c) {
      var isCurrent = c.status && c.status.toLowerCase().indexOf('current') >= 0;
      var statusBadge = isCurrent
        ? '<span class="badge" style="background:#DCFCE7;color:#15803D;font-weight:700">Current Standing</span>'
        : '<span class="badge" style="background:#F3F4F6;color:#4B5563">Completed</span>';

      return [
        '<div class="cycle-card' + (isCurrent ? ' cycle-current' : '') + '">',
        '  <div class="cycle-head">',
        '    <div class="cycle-season"><b>' + escSVG(c.season) + '</b> — <span class="cycle-crop-name">' + escSVG(c.crop) + '</span></div>',
        '    ' + statusBadge,
        '  </div>',
        '  <div class="cycle-meta-grid">',
        '    <div><label>Area Cultivated</label><span>' + escSVG(c.area) + '</span></div>',
        '    <div><label>Sowing → Harvest</label><span>' + escSVG(c.sowing) + ' → ' + escSVG(c.harvest) + '</span></div>',
        '    <div><label>Yield Recorded</label><span style="font-weight:700;color:var(--ink)">' + escSVG(c.yield || '—') + '</span></div>',
        '    <div><label>Mandi Realization</label><span style="font-weight:700;color:var(--turmeric-text)">' + escSVG(c.rate || '—') + '</span></div>',
        '    <div><label>Gross Revenue</label><span>' + escSVG(c.revenue || '—') + '</span></div>',
        '    <div><label>Net Profit Margin</label><span style="font-weight:700;color:var(--field)">' + escSVG(c.netMargin || '—') + '</span></div>',
        '  </div>',
        c.inputs ? '  <div class="cycle-inputs"><label>Inputs & Fertigation:</label> <span>' + escSVG(c.inputs) + '</span></div>' : '',
        c.soilImpact ? '  <div class="cycle-impact"><span class="cycle-impact-icon">🔄</span> <div><b>Soil & Rotation Impact:</b> ' + escSVG(c.soilImpact) + '</div></div>' : '',
        '</div>'
      ].join('');
    }).join('');

    return [
      '<div class="agri-card cycles-card">',
      '  <div class="agri-card-head">',
      '    <div>',
      '      <span class="agri-card-title">🔄 Crop Cycles & History</span>',
      '      <div class="agri-card-sub">Multi-season rotational pedigree and agronomic performance</div>',
      '    </div>',
      '    <span class="badge" style="background:#FEF3C7;color:#92400E;font-size:11px;font-weight:700">' + cycles.length + ' CYCLES LOGGED</span>',
      '  </div>',
      '  <div class="cycles-list">' + cards + '</div>',
      '</div>'
    ].join('');
  }

  /* ── Agri Intelligence: Tab Navigation HTML ──────────────── */
  function agriTabBarHTML(activeTab) {
    activeTab = activeTab || 'contract';
    var tabs = [
      { id: 'contract', label: '📋 Contract & Lot' },
      { id: 'soil',     label: '🧪 Soil Analysis' },
      { id: 'climate',  label: '🌤️ Climatic Condition' },
      { id: 'cycles',   label: '🔄 Crop Cycles' }
    ];
    return '<div class="agri-tab-strip" role="tablist">' +
      tabs.map(function (t) {
        var act = t.id === activeTab ? ' active' : '';
        return '<button type="button" class="agri-tab-btn' + act + '" data-agritab="' + t.id + '">' + t.label + '</button>';
      }).join('') +
    '</div>';
  }

  /* ── Contract card HTML ───────────────────────────────────── */
  function contractCardHTML(contract, lots, bids) {
    var lot = lots && lots.length ? lots[0] : null;
    var highBid = lot ? (bids || []).filter(function (b) { return b.lotId === lot.id; }).reduce(function (m, b) { return b.price > m ? b.price : m; }, 0) : 0;
    return [
      '<div class="card-title">Gat ' + escSVG(contract.gat) + ', ' + escSVG(contract.village) + '</div>',
      '<div style="margin-top:4px">' + stageChip(contract.stage) + '</div>',
      '<dl class="detail-grid" style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;font-size:15px">',
      '  <div><dt style="color:var(--ink-soft);font-size:13px">Farmer</dt><dd style="margin:0;font-weight:600">' + escSVG(contract.farmer.name) + '</dd></div>',
      '  <div><dt style="color:var(--ink-soft);font-size:13px">Crop</dt><dd style="margin:0;font-weight:600">' + escSVG(contract.crop) + '</dd></div>',
      '  <div><dt style="color:var(--ink-soft);font-size:13px">Area</dt><dd style="margin:0">' + contract.area + ' acres</dd></div>',
      '  <div><dt style="color:var(--ink-soft);font-size:13px">Lease ends</dt><dd style="margin:0">' + (contract.leaseDates ? contract.leaseDates.end : '—') + '</dd></div>',
      lot ? '  <div><dt style="color:var(--ink-soft);font-size:13px">Lot grade</dt><dd style="margin:0">Grade ' + lot.grade + ', ' + lot.weightQt + ' qt</dd></div>' : '',
      lot && lot.farmerPrice ? '  <div><dt style="color:var(--ink-soft);font-size:13px">Farmer price</dt><dd style="margin:0;font-weight:600">₹' + Number(lot.farmerPrice).toLocaleString('en-IN') + '</dd></div>' : '',
      highBid ? '  <div><dt style="color:var(--ink-soft);font-size:13px">Highest bid</dt><dd style="margin:0;color:var(--turmeric-text);font-weight:600">₹' + Number(highBid).toLocaleString('en-IN') + '</dd></div>' : '',
      '</dl>',
      contract.notes ? '<div class="alert" style="margin-top:12px;font-size:14px">' + escSVG(contract.notes) + '</div>' : ''
    ].join('');
  }

  /* ── Leaflet map helpers ──────────────────────────────────── */
  /**
   * initDrillMap(mapEl, opts)
   * opts: {
   *   center: [lat, lng],
   *   zoom: number,
   *   districtData: {id: {contracts, farmers, acres, ...}},
   *   onDistrictClick: function(districtId, districtName)
   * }
   */
  function initDrillMap(mapEl, opts) {
    if (typeof L === 'undefined') { mapEl.innerHTML = '<p style="padding:20px;color:var(--ink-soft)">Leaflet.js not loaded. Map requires an internet connection for tiles.</p>'; return null; }

    var map = L.map(mapEl, { zoomControl: true, attributionControl: true }).setView(opts.center || [19.7, 75.7], opts.zoom || 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);

    return map;
  }

  /**
   * addChoropleth(map, districtData, opts)
   * Adds district polygons from MH_GEO coloured by contract count.
   */
  function addChoropleth(map, districtData, opts) {
    if (!window.MH_GEO || typeof L === 'undefined') return null;
    opts = opts || {};

    var BINS = [
      { max: 50,  fill: '#DDE1F0' },
      { max: 100, fill: '#B9C1E3' },
      { max: 200, fill: '#8F9BD0' },
      { max: 300, fill: '#5E6DB3' },
      { max: Infinity, fill: '#33408A' }
    ];

    function colorFor(count) {
      for (var i = 0; i < BINS.length; i++) {
        if (count < BINS[i].max) return BINS[i].fill;
      }
      return BINS[BINS.length - 1].fill;
    }

    var geoLayer = L.geoJSON(window.MH_GEO, {
      style: function (feature) {
        var dd = districtData[feature.properties.id];
        var count = dd ? dd.contracts : 0;
        return {
          fillColor: colorFor(count),
          fillOpacity: 0.72,
          color: '#1C2452',
          weight: 1.5
        };
      },
      onEachFeature: function (feature, layer) {
        var dd = districtData[feature.properties.id];
        var name = feature.properties.name;
        layer.bindTooltip(
          '<b>' + name + '</b><br>' +
          (dd ? dd.contracts + ' contracts · ' + dd.farmers + ' farmers · ' + dd.acres + ' acres' : 'No data'),
          { sticky: true, className: 'leaflet-bhowanee-tip' }
        );
        layer.on('click', function () {
          if (opts.onDistrictClick) opts.onDistrictClick(feature.properties.id, name, dd);
          map.fitBounds(layer.getBounds(), { padding: [30, 30] });
        });
      }
    }).addTo(map);

    return geoLayer;
  }

  /* ── Sparkline SVG ────────────────────────────────────────── */
  function sparkline(values, opts) {
    opts = opts || {};
    var w = opts.width || 120, h = opts.height || 36, stroke = opts.stroke || '#D99A06';
    var lo = Math.min.apply(null, values), hi = Math.max.apply(null, values);
    if (hi === lo) { lo -= 10; hi += 10; }
    var pts = values.map(function (v, i) {
      var x = Math.round(i / (values.length - 1) * w);
      var y = Math.round(h - (v - lo) / (hi - lo) * h);
      return x + ',' + y;
    }).join(' ');
    return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><polyline points="' + pts + '" fill="none" stroke="' + stroke + '" stroke-width="2" stroke-linejoin="round"/></svg>';
  }

  /* ── Public API ───────────────────────────────────────────── */
  return {
    toast: toast,
    showOTP: showOTP,
    renderBidBoard: renderBidBoard,
    stageChip: stageChip,
    contractCardHTML: contractCardHTML,
    soilAnalysisHTML: soilAnalysisHTML,
    climateHTML: climateHTML,
    cropCyclesHTML: cropCyclesHTML,
    agriTabBarHTML: agriTabBarHTML,
    initDrillMap: initDrillMap,
    addChoropleth: addChoropleth,
    sparkline: sparkline,
    esc: escSVG
  };
})();
