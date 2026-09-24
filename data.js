/* ============================================================
   Bhowanee - Central Data Store (data.js)
   All sample data + action functions.
   Actions write to localStorage for persistence across pages.
   IndexedDB queue stores pending actions when offline.
   ============================================================ */

(function () {
  'use strict';

  /* ── Helpers ─────────────────────────────────────────────── */
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function now() { return new Date().toISOString(); }
  function tsLabel() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
  function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  /* ── Initial data ────────────────────────────────────────── */
  var INITIAL = {
    contracts: [
      {
        id: 'c1', village: 'Pimpalgaon', block: 'Dindori', district: 'nashik',
        farmer: { name: 'Prakash Sonawane', phone: '9876543210', lang: 'mr', status: 'active' },
        crop: 'Onion', area: 2.4, leaseDates: { start: '2025-11-01', end: '2026-06-30' },
        stage: 'bids', gat: '125',
        plan: { sow: '2025-11-10', irrigate: '2025-12-05', fertilise: '2026-01-10', harvest: '2026-04-20' },
        tasks: [
          { id: 't1', label: 'Sowing', due: '2025-11-10', done: true },
          { id: 't2', label: 'First irrigation', due: '2025-12-05', done: true },
          { id: 't3', label: 'Fertiliser', due: '2026-01-10', done: true },
          { id: 't4', label: 'Second irrigation', due: '2026-02-15', done: false },
          { id: 't5', label: 'Harvest', due: '2026-04-20', done: false }
        ],
        costs: [
          { id: 'k1', type: 'Seeds', amount: 4200, date: '2025-11-08' },
          { id: 'k2', type: 'Fertiliser', amount: 3100, date: '2026-01-10' },
          { id: 'k3', type: 'Labour', amount: 2800, date: '2025-11-10' }
        ],
        notes: 'Good soil moisture. Expected Grade A output.'
      },
      {
        id: 'c2', village: 'Pimpalgaon', block: 'Dindori', district: 'nashik',
        farmer: { name: 'Sushila Ahire', phone: '8765432109', lang: 'mr', status: 'active' },
        crop: 'Onion', area: 1.8, leaseDates: { start: '2025-11-01', end: '2026-06-30' },
        stage: 'harvest', gat: '123',
        plan: { sow: '2025-11-12', irrigate: '2025-12-08', fertilise: '2026-01-12', harvest: '2026-04-25' },
        tasks: [
          { id: 't6', label: 'Sowing', due: '2025-11-12', done: true },
          { id: 't7', label: 'First irrigation', due: '2025-12-08', done: true },
          { id: 't8', label: 'Fertiliser', due: '2026-01-12', done: false },
          { id: 't9', label: 'Harvest', due: '2026-04-25', done: false }
        ],
        costs: [
          { id: 'k4', type: 'Seeds', amount: 3100, date: '2025-11-10' },
          { id: 'k5', type: 'Labour', amount: 2200, date: '2025-11-12' }
        ],
        notes: 'Issue flagged: water shortage.'
      },
      {
        id: 'c3', village: 'Wadgaon', block: 'Dindori', district: 'nashik',
        farmer: { name: 'Raju Patil', phone: '7654321098', lang: 'en', status: 'active' },
        crop: 'Tomato', area: 1.2, leaseDates: { start: '2026-01-01', end: '2026-08-31' },
        stage: 'growing', gat: '128',
        plan: { sow: '2026-01-15', harvest: '2026-07-20' },
        tasks: [
          { id: 't10', label: 'Sowing', due: '2026-01-15', done: true },
          { id: 't11', label: 'Irrigation', due: '2026-02-20', done: false },
          { id: 't12', label: 'Harvest', due: '2026-07-20', done: false }
        ],
        costs: [{ id: 'k6', type: 'Seeds', amount: 2800, date: '2026-01-12' }],
        notes: ''
      },
      {
        id: 'c4', village: 'Wadgaon', block: 'Dindori', district: 'nashik',
        farmer: { name: 'Meena Bhosale', phone: '9988776655', lang: 'mr', status: 'active' },
        crop: 'Soybean', area: 3.0, leaseDates: { start: '2025-06-01', end: '2026-03-31' },
        stage: 'growing', gat: '129',
        plan: { sow: '2025-06-20', harvest: '2025-10-30' },
        tasks: [
          { id: 't13', label: 'Sowing', due: '2025-06-20', done: true },
          { id: 't14', label: 'Harvest', due: '2025-10-30', done: false }
        ],
        costs: [
          { id: 'k7', type: 'Seeds', amount: 5800, date: '2025-06-18' },
          { id: 'k8', type: 'Fertiliser', amount: 4100, date: '2025-07-10' }
        ],
        notes: ''
      },
      {
        id: 'c5', village: 'Pimpalgaon', block: 'Dindori', district: 'nashik',
        farmer: { name: 'Dnyaneshwar Jadhav', phone: '8899001122', lang: 'mr', status: 'active' },
        crop: 'Onion', area: 2.0, leaseDates: { start: '2025-11-01', end: '2026-06-30' },
        stage: 'issue', gat: '66',
        plan: { sow: '2025-11-15', harvest: '2026-04-30' },
        tasks: [
          { id: 't15', label: 'Sowing', due: '2025-11-15', done: true },
          { id: 't16', label: 'Harvest', due: '2026-04-30', done: false }
        ],
        costs: [{ id: 'k9', type: 'Seeds', amount: 3800, date: '2025-11-12' }],
        notes: 'Crop damage from hailstorm.'
      },
      {
        id: 'c6', village: 'Wadgaon', block: 'Dindori', district: 'nashik',
        farmer: { name: 'Savita Gaikwad', phone: '9000112233', lang: 'mr', status: 'active' },
        crop: 'Pulses', area: 1.5, leaseDates: { start: '2025-09-01', end: '2026-04-30' },
        stage: 'notsown', gat: '47',
        plan: { sow: '2025-09-20', harvest: '2026-02-28' },
        tasks: [{ id: 't17', label: 'Sowing', due: '2025-09-20', done: false }],
        costs: [],
        notes: 'Lease signed. Waiting for sowing.'
      }
    ],

    lots: [
      {
        id: 'l1', contractId: 'c1', grade: 'A', weightQt: 12,
        farmerPrice: 2100, status: 'open', listedAt: '2026-03-01T08:00:00Z',
        photos: ['onion_grade_a.jpg']
      },
      {
        id: 'l2', contractId: 'c2', grade: 'B', weightQt: 8,
        farmerPrice: 1900, status: 'open', listedAt: '2026-03-03T09:00:00Z',
        photos: []
      }
    ],

    bids: [
      { id: 'b1', lotId: 'l1', buyer: 'Buyer A', price: 1750, timestamp: '2026-03-02T10:00:00Z' },
      { id: 'b2', lotId: 'l1', buyer: 'Buyer B', price: 1740, timestamp: '2026-03-02T10:30:00Z' },
      { id: 'b3', lotId: 'l1', buyer: 'Buyer A', price: 1800, timestamp: '2026-03-02T11:00:00Z' },
      { id: 'b4', lotId: 'l1', buyer: 'Buyer C', price: 1930, timestamp: '2026-03-02T13:00:00Z' },
      { id: 'b5', lotId: 'l1', buyer: 'Buyer B', price: 1900, timestamp: '2026-03-02T14:00:00Z' },
      { id: 'b6', lotId: 'l1', buyer: 'Buyer A', price: 1980, timestamp: '2026-03-03T09:00:00Z' },
      { id: 'b7', lotId: 'l1', buyer: 'Buyer C', price: 2040, timestamp: '2026-03-03T11:00:00Z' },
      { id: 'b8', lotId: 'l2', buyer: 'Buyer B', price: 1750, timestamp: '2026-03-04T10:00:00Z' },
      { id: 'b9', lotId: 'l2', buyer: 'Buyer A', price: 1820, timestamp: '2026-03-04T12:00:00Z' }
    ],

    plans: [
      {
        id: 'p1', name: 'Onion, rabi season', term: '5 months', termMonths: 5,
        risk: 'Higher', riskScore: 3, demandSold: 70, expectedReturn: '14 to 18%',
        expectedReturnPct: 16, min: 25000, status: 'Open',
        note: 'One crop, one season, 70% sold before planting.',
        soil: 'Black cotton soil, pH 6.8', water: 'Canal irrigation',
        cropHistory: 'Onion rabi for 3 consecutive seasons',
        buyers: ['Maharashtra FPO Traders', 'National Cold Chain Ltd'],
        timeline: { sow: '2026-11-01', harvest: '2027-04-15', payout: '2027-05-01' }
      },
      {
        id: 'p2', name: 'Mixed pulses and grains', term: '18 months', termMonths: 18,
        risk: 'Lower', riskScore: 1, demandSold: 85, expectedReturn: '9 to 11%',
        expectedReturnPct: 10, min: 50000, status: 'Open',
        note: 'Four crops over three seasons, 85% sold before planting.',
        soil: 'Alluvial loam, pH 7.2', water: 'Drip and rain-fed',
        cropHistory: 'Rotation: tur, wheat, moong over 4 years',
        buyers: ['Agri Commodity Exchange', 'State Warehouse Corp'],
        timeline: { sow: '2026-06-15', harvest: '2027-10-30', payout: '2027-12-15' }
      },
      {
        id: 'p3', name: 'Tomato and soybean', term: '10 months', termMonths: 10,
        risk: 'Medium', riskScore: 2, demandSold: 60, expectedReturn: '11 to 14%',
        expectedReturnPct: 12.5, min: 25000, status: 'Closing soon',
        note: 'Two crops over two seasons, 60% sold before planting.',
        soil: 'Red laterite, pH 6.5', water: 'Borewell',
        cropHistory: 'First soybean cycle on this land',
        buyers: ['Fresh Mart Supply Co'],
        timeline: { sow: '2026-06-01', harvest: '2027-02-28', payout: '2027-03-30' }
      },
      {
        id: 'p4', name: 'Sugarcane, second cut', term: '12 months', termMonths: 12,
        risk: 'Lower', riskScore: 1, demandSold: 95, expectedReturn: '8 to 10%',
        expectedReturnPct: 9, min: 50000, status: 'Full',
        note: 'One crop, 95% sold before planting. No room left.',
        soil: 'Black clay, pH 7.0', water: 'Canal with drip',
        cropHistory: 'Established ratoon from year 2',
        buyers: ['Shree Warana Sugar Factory'],
        timeline: { sow: '2025-10-01', harvest: '2026-09-30', payout: '2026-11-01' }
      }
    ],

    investments: [
      { id: 'i1', planId: 'p2', investor: 'Investor Demo', amount: 100000, date: '2025-12-01', stage: 'Growing', projectedReturn: 110000, actualReturn: null, nextPayout: '2027-12-15' },
      { id: 'i2', planId: 'p3', investor: 'Investor Demo', amount: 50000, date: '2026-01-15', stage: 'Growing', projectedReturn: 56250, actualReturn: null, nextPayout: '2027-03-30' },
      { id: 'i3', planId: 'p4', investor: 'Investor Demo', amount: 75000, date: '2025-10-05', stage: 'Closed', projectedReturn: 82500, actualReturn: 82500, nextPayout: '2026-11-01' }
    ],

    warehouses: [
      { id: 'w1', name: 'Dindori Cold Store', lat: 20.20, lng: 73.83, capacityQt: 5000, usedQt: 4100, contact: '9876543000' },
      { id: 'w2', name: 'Nashik Hub Warehouse', lat: 19.99, lng: 73.79, capacityQt: 8000, usedQt: 2900, contact: '9876543001' },
      { id: 'w3', name: 'Pimpalgaon Storage', lat: 20.33, lng: 73.82, capacityQt: 2000, usedQt: 800, contact: '9876543002' }
    ],

    pickups: [
      { id: 'pk1', lotId: 'l1', contractId: 'c1', farm: 'Gat 118, Pimpalgaon', warehouseId: 'w1', scheduledAt: '2026-04-22T07:00:00Z', status: 'scheduled', vehicle: 'MH-15-AB-1234' },
      { id: 'pk2', lotId: 'l2', contractId: 'c2', farm: 'Gat 147, Pimpalgaon', warehouseId: 'w2', scheduledAt: '2026-04-23T08:00:00Z', status: 'pending', vehicle: '' }
    ],

    handoffs: [
      { id: 'h1', lotId: 'l1', from: 'Farm (Gat 118)', to: 'Dindori Cold Store', weightQt: 12, timestamp: '2026-03-20T10:30:00Z', photo: '', confirmedBy: 'Block Admin' }
    ],

    disputes: [
      { id: 'd1', contractId: 'c1', type: 'Quality', description: 'Buyer C reports 10% of lot is Grade B, not Grade A.', status: 'Open', raisedBy: 'Buyer C', owner: 'Super Admin', raisedAt: '2026-03-18T14:00:00Z', evidence: [] },
      { id: 'd2', contractId: 'c5', type: 'Crop damage', description: 'Hailstorm on March 15 damaged approximately 40% of standing crop.', status: 'Open', raisedBy: 'Block Admin', owner: 'Super Admin', raisedAt: '2026-03-16T09:00:00Z', evidence: [] }
    ],

    payments: [
      { id: 'pay1', contractId: 'c1', lotId: 'l1', amount: 24480, from: 'Buyer C', to: 'Prakash Sonawane', timestamp: '2026-03-21T12:00:00Z', status: 'Settled', method: 'Bank transfer' },
      { id: 'pay2', contractId: 'c3', lotId: null, amount: 8400, from: 'Bhowanee', to: 'Raju Patil', timestamp: '2026-03-10T10:00:00Z', status: 'Pending', method: 'Bank transfer' }
    ],

    auditTrail: [
      { id: 'a1', ts: '10:42', action: 'Set price ₹2,100 on Gat 118 onion lot', by: 'Block Administrator', forFarmer: 'Prakash Sonawane', confirmed: 'Farmer, by SMS reply 1' },
      { id: 'a2', ts: '11:15', action: 'Listed lot - Onion, 12 quintal, Grade A', by: 'Block Administrator', forFarmer: 'Prakash Sonawane', confirmed: 'Farmer, by SMS reply 1' },
      { id: 'a3', ts: '14:30', action: 'Accepted bid ₹2,040 from Buyer C', by: 'Block Administrator', forFarmer: 'Prakash Sonawane', confirmed: 'Farmer, by voice call' }
    ],

    compliance: [
      { id: 'comp1', contractId: 'c1', type: 'Lease renewal', dueDate: '2026-06-30', status: 'Active', notes: '7 months remaining' },
      { id: 'comp2', contractId: 'c2', type: 'Land ceiling check', dueDate: '2026-05-15', status: 'Pending', notes: 'Awaiting district record' },
      { id: 'comp3', contractId: 'c5', type: 'Crop insurance claim', dueDate: '2026-04-01', status: 'Urgent', notes: 'Hailstorm damage - file within 15 days' }
    ],

    kycQueue: [
      { id: 'k1', name: 'Anil Merchant', role: 'Buyer', email: 'anil@freshco.in', status: 'Pending', submittedAt: '2026-03-20T09:00:00Z' },
      { id: 'k2', name: 'Priya Capital', role: 'Investor', email: 'priya@capital.in', status: 'Pending', submittedAt: '2026-03-21T11:00:00Z' }
    ],

    districtData: {
      nashik:        { contracts: 312, farmers: 690, acres: 1420, openBids: 14, disputes: 2, demandQt: 18000, supplyQt: 14200 },
      sambhajinagar: { contracts: 148, farmers: 320, acres: 700,  openBids: 6,  disputes: 1, demandQt: 9000,  supplyQt: 7800  },
      amravati:      { contracts: 76,  farmers: 160, acres: 380,  openBids: 3,  disputes: 0, demandQt: 4500,  supplyQt: 4200  },
      nagpur:        { contracts: 44,  farmers: 90,  acres: 210,  openBids: 1,  disputes: 0, demandQt: 2800,  supplyQt: 2200  },
      thane:         { contracts: 21,  farmers: 45,  acres: 90,   openBids: 0,  disputes: 0, demandQt: 1200,  supplyQt: 900   },
      pune:          { contracts: 265, farmers: 590, acres: 1210, openBids: 11, disputes: 1, demandQt: 15000, supplyQt: 11800 },
      latur:         { contracts: 97,  farmers: 210, acres: 450,  openBids: 4,  disputes: 0, demandQt: 6000,  supplyQt: 5200  },
      kolhapur:      { contracts: 183, farmers: 400, acres: 860,  openBids: 7,  disputes: 1, demandQt: 10500, supplyQt: 9200  },
      solapur:       { contracts: 122, farmers: 270, acres: 560,  openBids: 5,  disputes: 0, demandQt: 7500,  supplyQt: 6800  }
    }
  };

  /* ── Load / save from localStorage ──────────────────────── */
  function load() {
    try {
      var saved = localStorage.getItem('bh_data');
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.contracts) {
          var GAT_MAP = { '118':'125', '147':'123', '212':'128', '289':'129', '332':'66', '401':'47' };
          parsed.contracts.forEach(function(c) {
            if (GAT_MAP[c.gat]) c.gat = GAT_MAP[c.gat];
          });
        }
        return parsed;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(INITIAL));
  }
  function save(store) {
    try { localStorage.setItem('bh_data', JSON.stringify(store)); } catch (e) {}
  }

  var store = load();

  /* ── Event bus ───────────────────────────────────────────── */
  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent('bh:' + name, { detail: detail }));
  }

  /* ── Offline / IndexedDB queue ───────────────────────────── */
  var DB = null;
  (function openDB() {
    if (!window.indexedDB) return;
    var req = indexedDB.open('bhowanee_queue', 1);
    req.onupgradeneeded = function (e) {
      e.target.result.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = function (e) {
      DB = e.target.result;
      flushQueue();
    };
  })();

  function queueAction(action) {
    if (!DB) return;
    var tx = DB.transaction('queue', 'readwrite');
    tx.objectStore('queue').add({ action: action, ts: now() });
  }

  function flushQueue() {
    if (!DB || !navigator.onLine) return;
    var tx = DB.transaction('queue', 'readwrite');
    var store2 = tx.objectStore('queue');
    store2.getAll().onsuccess = function (e) {
      e.target.result.forEach(function (row) {
        // Re-apply pending actions
        try { applyAction(row.action); } catch (ex) {}
        store2.delete(row.id);
      });
      save(store);
      emit('synced', {});
    };
  }

  window.addEventListener('online', function () {
    flushQueue();
    emit('online', {});
  });
  window.addEventListener('offline', function () { emit('offline', {}); });

  function applyAction(a) {
    switch (a.type) {
      case 'setFarmerPrice': _setFarmerPrice(a.lotId, a.price); break;
      case 'placeBid':       _placeBid(a.lotId, a.buyer, a.price); break;
      case 'acceptBid':      _acceptBid(a.lotId, a.bidId); break;
      case 'createLot':      _createLot(a.contractId, a.grade, a.weightQt); break;
      case 'addTask':        _addTask(a.contractId, a.label, a.due); break;
      case 'toggleTask':     _toggleTask(a.taskId); break;
      case 'addCost':        _addCost(a.contractId, a.type, a.amount); break;
      case 'flagIssue':      _flagIssue(a.contractId, a.description); break;
      case 'confirmHandoff': _confirmHandoff(a.lotId, a.from, a.to, a.weightQt); break;
      case 'logLoss':        _logLoss(a.pickupId, a.qty, a.reason); break;
    }
  }

  /* ── Action helpers (internal) ───────────────────────────── */
  function _setFarmerPrice(lotId, price) {
    var lot = store.lots.find(function (l) { return l.id === lotId; });
    if (lot) { lot.farmerPrice = price; lot.status = 'open'; }
  }

  function _placeBid(lotId, buyer, price) {
    var bid = { id: 'b' + uid(), lotId: lotId, buyer: buyer, price: price, timestamp: now() };
    store.bids.push(bid);
    // Auto-close: if bid >= farmer price
    var lot = store.lots.find(function (l) { return l.id === lotId; });
    if (lot && price >= lot.farmerPrice) {
      lot.status = 'closed';
      lot.closedBidId = bid.id;
      lot.closedAt = now();
      // Mark contract stage as closed
      var contract = store.contracts.find(function (c) { return c.id === lot.contractId; });
      if (contract) contract.stage = 'closed';
      // Create payment record
      var payment = {
        id: 'pay' + uid(),
        contractId: lot.contractId,
        lotId: lotId,
        amount: price * lot.weightQt,
        from: buyer,
        to: contract ? contract.farmer.name : 'Farmer',
        timestamp: now(),
        status: 'Pending',
        method: 'Bank transfer'
      };
      store.payments.push(payment);
      emit('lotClosed', { lotId: lotId, bid: bid, payment: payment });
    }
    return bid;
  }

  function _acceptBid(lotId, bidId) {
    var lot = store.lots.find(function (l) { return l.id === lotId; });
    if (!lot) return;
    lot.status = 'closed';
    lot.closedBidId = bidId;
    lot.closedAt = now();
    var contract = store.contracts.find(function (c) { return c.id === lot.contractId; });
    if (contract) contract.stage = 'closed';
    var bid = store.bids.find(function (b) { return b.id === bidId; });
    if (bid) {
      var payment = {
        id: 'pay' + uid(),
        contractId: lot.contractId,
        lotId: lotId,
        amount: bid.price * lot.weightQt,
        from: bid.buyer,
        to: contract ? contract.farmer.name : 'Farmer',
        timestamp: now(),
        status: 'Pending',
        method: 'Bank transfer'
      };
      store.payments.push(payment);
    }
  }

  function _createLot(contractId, grade, weightQt) {
    var lot = { id: 'l' + uid(), contractId: contractId, grade: grade, weightQt: weightQt, farmerPrice: 0, status: 'draft', listedAt: now(), photos: [] };
    store.lots.push(lot);
    var contract = store.contracts.find(function (c) { return c.id === contractId; });
    if (contract) contract.stage = 'harvest';
    return lot;
  }

  function _addTask(contractId, label, due) {
    var task = { id: 't' + uid(), label: label, due: due, done: false };
    var contract = store.contracts.find(function (c) { return c.id === contractId; });
    if (contract) contract.tasks.push(task);
    return task;
  }

  function _toggleTask(taskId) {
    store.contracts.forEach(function (c) {
      c.tasks.forEach(function (t) { if (t.id === taskId) t.done = !t.done; });
    });
  }

  function _addCost(contractId, type, amount) {
    var cost = { id: 'k' + uid(), type: type, amount: amount, date: now().slice(0, 10) };
    var contract = store.contracts.find(function (c) { return c.id === contractId; });
    if (contract) contract.costs.push(cost);
    return cost;
  }

  function _flagIssue(contractId, description) {
    var dispute = { id: 'd' + uid(), contractId: contractId, type: 'Crop issue', description: description, status: 'Open', raisedBy: 'Block Admin', owner: 'Super Admin', raisedAt: now(), evidence: [] };
    store.disputes.push(dispute);
    var contract = store.contracts.find(function (c) { return c.id === contractId; });
    if (contract) contract.stage = 'issue';
    return dispute;
  }

  function _confirmHandoff(lotId, from, to, weightQt) {
    var h = { id: 'h' + uid(), lotId: lotId, from: from, to: to, weightQt: weightQt, timestamp: now(), photo: '', confirmedBy: 'Field staff' };
    store.handoffs.push(h);
    // Update warehouse fill
    var lot = store.lots.find(function (l) { return l.id === lotId; });
    if (lot) {
      var pickup = store.pickups.find(function (p) { return p.lotId === lotId; });
      if (pickup) {
        pickup.status = 'done';
        var wh = store.warehouses.find(function (w) { return w.id === pickup.warehouseId; });
        if (wh) wh.usedQt = Math.min(wh.capacityQt, wh.usedQt + weightQt);
      }
    }
    return h;
  }

  function _logLoss(pickupId, qty, reason) {
    var pickup = store.pickups.find(function (p) { return p.id === pickupId; });
    if (pickup) {
      pickup.lossQt = (pickup.lossQt || 0) + qty;
      pickup.lossReason = reason;
    }
  }

  /* ── Audit trail helper ──────────────────────────────────── */
  function writeAudit(action, by, forFarmer, confirmed) {
    store.auditTrail.push({ id: 'a' + uid(), ts: tsLabel(), action: action, by: by, forFarmer: forFarmer, confirmed: confirmed });
    save(store);
    emit('auditUpdated', {});
  }

  /* ── OTP mock ────────────────────────────────────────────── */
  function mockOTP(farmerName, message, callback) {
    emit('otpRequired', { farmerName: farmerName, message: message, callback: callback });
  }

  /* ── Public API ──────────────────────────────────────────── */
  window.BD = {

    // Read
    getContracts: function (filter) {
      return filter
        ? store.contracts.filter(filter)
        : store.contracts.slice();
    },
    getContract: function (id) { return store.contracts.find(function (c) { return c.id === id; }); },
    getLot: function (id) { return store.lots.find(function (l) { return l.id === id; }); },
    getLotsByContract: function (cid) { return store.lots.filter(function (l) { return l.contractId === cid; }); },
    getOpenLots: function () { return store.lots.filter(function (l) { return l.status === 'open' || l.status === 'draft'; }); },
    getBidsByLot: function (lid) { return store.bids.filter(function (b) { return b.lotId === lid; }); },
    getHighestBid: function (lid) {
      var bids = store.bids.filter(function (b) { return b.lotId === lid; });
      return bids.reduce(function (best, b) { return (!best || b.price > best.price) ? b : best; }, null);
    },
    getPlans: function () { return store.plans.slice(); },
    getPlan: function (id) { return store.plans.find(function (p) { return p.id === id; }); },
    getInvestments: function () { return store.investments.slice(); },
    getWarehouses: function () { return store.warehouses.slice(); },
    getPickups: function () { return store.pickups.slice(); },
    getHandoffs: function () { return store.handoffs.slice(); },
    getDisputes: function () { return store.disputes.slice(); },
    getPayments: function () { return store.payments.slice(); },
    getAuditTrail: function () { return store.auditTrail.slice().reverse(); },
    getCompliance: function () { return store.compliance.slice(); },
    getKYCQueue: function () { return store.kycQueue.slice(); },
    getDistrictData: function () { return store.districtData; },
    getDistrictById: function (id) { return store.districtData[id] || null; },
    fmt: fmt,

    // Write - farmer
    setFarmerPrice: function (lotId, price) {
      _setFarmerPrice(lotId, price);
      save(store);
      emit('priceChanged', { lotId: lotId, price: price });
      if (!navigator.onLine) queueAction({ type: 'setFarmerPrice', lotId: lotId, price: price });
    },

    // Write - bidding
    placeBid: function (lotId, buyer, price) {
      var bid = _placeBid(lotId, buyer, price);
      save(store);
      emit('bidPlaced', { bid: bid });
      if (!navigator.onLine) queueAction({ type: 'placeBid', lotId: lotId, buyer: buyer, price: price });
      return bid;
    },

    acceptBid: function (lotId, bidId, farmerName) {
      mockOTP(farmerName, 'Accept bid ' + fmt(store.bids.find(function(b){return b.id===bidId;}).price) + ' from buyer?', function (confirmed) {
        if (!confirmed) return;
        _acceptBid(lotId, bidId);
        writeAudit('Accepted bid on lot ' + lotId, 'Block Administrator', farmerName, 'Farmer, by SMS reply 1');
        save(store);
        emit('bidAccepted', { lotId: lotId, bidId: bidId });
      });
    },

    // Write - block admin actions for farmer
    setFarmerPriceByAdmin: function (lotId, price, farmerName) {
      mockOTP(farmerName, 'Set price ' + fmt(price) + ' on your lot?', function (confirmed) {
        if (!confirmed) return;
        _setFarmerPrice(lotId, price);
        writeAudit('Set price ' + fmt(price) + ' on lot ' + lotId, 'Block Administrator', farmerName, 'Farmer, by SMS reply 1');
        save(store);
        emit('priceChanged', { lotId: lotId, price: price });
      });
    },

    createLot: function (contractId, grade, weightQt) {
      var contract = store.contracts.find(function (c) { return c.id === contractId; });
      var farmerName = contract ? contract.farmer.name : '-';
      mockOTP(farmerName, 'Create lot: ' + grade + ' grade, ' + weightQt + ' quintal?', function (confirmed) {
        if (!confirmed) return;
        var lot = _createLot(contractId, grade, weightQt);
        writeAudit('Created lot ' + grade + ' grade ' + weightQt + ' qt on contract ' + contractId, 'Block Administrator', farmerName, 'Farmer, by SMS reply 1');
        save(store);
        emit('lotCreated', { lot: lot });
      });
    },

    addTask: function (contractId, label, due) {
      _addTask(contractId, label, due);
      save(store);
      emit('taskAdded', { contractId: contractId });
      if (!navigator.onLine) queueAction({ type: 'addTask', contractId: contractId, label: label, due: due });
    },

    toggleTask: function (taskId) {
      _toggleTask(taskId);
      save(store);
      emit('taskToggled', { taskId: taskId });
      if (!navigator.onLine) queueAction({ type: 'toggleTask', taskId: taskId });
    },

    addCost: function (contractId, type, amount) {
      var cost = _addCost(contractId, type, amount);
      save(store);
      emit('costAdded', { contractId: contractId });
      return cost;
    },

    flagIssue: function (contractId, description) {
      var dispute = _flagIssue(contractId, description);
      save(store);
      emit('issueFlag', { dispute: dispute });
      return dispute;
    },

    // Write - logistics
    confirmHandoff: function (lotId, from, to, weightQt) {
      var h = _confirmHandoff(lotId, from, to, weightQt);
      save(store);
      emit('handoffConfirmed', { handoff: h });
      return h;
    },

    schedulePickup: function (lotId, contractId, farm, warehouseId, scheduledAt) {
      var pickup = { id: 'pk' + uid(), lotId: lotId, contractId: contractId, farm: farm, warehouseId: warehouseId, scheduledAt: scheduledAt, status: 'scheduled', vehicle: '' };
      store.pickups.push(pickup);
      save(store);
      emit('pickupScheduled', { pickup: pickup });
      return pickup;
    },

    logLoss: function (pickupId, qty, reason) {
      _logLoss(pickupId, qty, reason);
      save(store);
      emit('lossLogged', {});
    },

    // Write - investor
    invest: function (planId, amount) {
      var plan = store.plans.find(function (p) { return p.id === planId; });
      if (!plan || plan.status === 'Full') return { ok: false, msg: 'Plan is full.' };
      if (amount < plan.min) return { ok: false, msg: 'Minimum is ' + fmt(plan.min) + '.' };
      var inv = { id: 'i' + uid(), planId: planId, investor: 'Investor Demo', amount: amount, date: now().slice(0, 10), stage: 'Pending', projectedReturn: Math.round(amount * (1 + plan.expectedReturnPct / 100)), actualReturn: null, nextPayout: plan.timeline.payout };
      store.investments.push(inv);
      save(store);
      emit('invested', { investment: inv });
      return { ok: true, inv: inv };
    },

    reinvest: function (investmentId, planId) {
      var inv = store.investments.find(function (i) { return i.id === investmentId; });
      if (!inv || !inv.actualReturn) return { ok: false, msg: 'No payout ready to reinvest.' };
      return this.invest(planId, inv.actualReturn);
    },

    // Write - admin
    resolveDispute: function (disputeId, resolution) {
      var d = store.disputes.find(function (d) { return d.id === disputeId; });
      if (d) { d.status = 'Resolved'; d.resolution = resolution; d.resolvedAt = now(); }
      save(store);
      emit('disputeResolved', { disputeId: disputeId });
    },

    approveKYC: function (kycId) {
      var k = store.kycQueue.find(function (k) { return k.id === kycId; });
      if (k) k.status = 'Approved';
      writeAudit('Approved KYC for ' + (k ? k.name : kycId), 'Super Admin', '-', 'System');
      save(store);
      emit('kycApproved', { kycId: kycId });
    },

    rejectKYC: function (kycId, reason) {
      var k = store.kycQueue.find(function (k) { return k.id === kycId; });
      if (k) { k.status = 'Rejected'; k.rejectionReason = reason; }
      save(store);
      emit('kycRejected', { kycId: kycId });
    },

    settlePayment: function (payId) {
      var p = store.payments.find(function (p) { return p.id === payId; });
      if (p) { p.status = 'Settled'; p.settledAt = now(); }
      writeAudit('Settled payment ' + fmt(p ? p.amount : 0), 'Super Admin', p ? p.to : '-', 'System');
      save(store);
      emit('paymentSettled', { payId: payId });
    },

    // Util
    mandiPrice: function (crop) {
      var prices = { Onion: 1880, Tomato: 2200, Soybean: 4800, Pulses: 6200 };
      return prices[crop] || 2000;
    },

    stageLabel: function (stage) {
      var labels = { notsown: 'Lease signed, not sown', growing: 'Growing', harvest: 'Harvest ready', bids: 'Bids open', issue: 'Issue flagged', closed: 'Closed', paid: 'Paid' };
      return labels[stage] || stage;
    },

    stageClass: function (stage) {
      return 'stage-' + (stage || 'notsown');
    },

    on: function (event, handler) {
      document.addEventListener('bh:' + event, function (e) { handler(e.detail); });
    },

    // Reset to initial (dev helper)
    reset: function () {
      store = JSON.parse(JSON.stringify(INITIAL));
      save(store);
      location.reload();
    },

    /* ── Agricultural Intelligence: Soil, Climate, Crop Cycles ── */
    getAgriProfile: function (gat, fallback) {
      gat = String(gat || (fallback && fallback.gat) || '125');
      var farmerName = (fallback && fallback.farmer) || 'Prakash Sonawane';
      var crop = (fallback && fallback.crop) || 'Onion';
      var area = (fallback && fallback.area) || 2.4;
      var soilType = (fallback && fallback.soil) || 'Medium Black Soil';
      var water = (fallback && fallback.water) || 'Nala Canal + Borewell';

      var PROFILES = {
        '125': {
          soil: {
            shcNumber: 'SHC-MH-2025-11258',
            labName: 'KVK Niphad Soil Testing Lab, Nashik',
            testDate: '14 Jan 2026',
            soilType: 'Medium Black Soil (Vertisol)',
            texture: 'Clay Loam (Clay 42%, Silt 34%, Sand 24%)',
            ph: 7.2,
            phStatus: 'Neutral / Optimal for Onion',
            ec: 0.38,
            ecStatus: 'Normal (Non-saline, < 1.0 dS/m)',
            oc: 0.68,
            ocStatus: 'Medium-High (> 0.5% ideal)',
            moisture: 24,
            moistureStatus: 'Optimal Field Capacity (22-26%)',
            npk: {
              n: { val: 242, min: 140, max: 280, rating: 'Medium', label: 'Nitrogen (N)', unit: 'kg/ha' },
              p: { val: 21.5, min: 10, max: 25, rating: 'Optimal', label: 'Phosphorus (P₂O₅)', unit: 'kg/ha' },
              k: { val: 328, min: 150, max: 350, rating: 'High', label: 'Potassium (K₂O)', unit: 'kg/ha' }
            },
            micronutrients: [
              { name: 'Zinc (Zn)', val: '0.84 ppm', status: 'Adequate', ok: true },
              { name: 'Boron (B)', val: '0.58 ppm', status: 'Sufficient', ok: true },
              { name: 'Iron (Fe)', val: '5.10 ppm', status: 'High', ok: true },
              { name: 'Sulphur (S)', val: '14.8 ppm', status: 'Optimal for Pungency', ok: true }
            ],
            advisory: 'Soil is in prime condition for bulb swelling. Apply 25 kg SSP + 10 kg MOP at current stage. Incorporate 15 kg elemental Sulphur/acre to boost bulb skin firmness, pungency, and storage shelf-life. Avoid additional Urea late in cycle.'
          },
          climate: {
            station: 'Pimpalgaon Baswant AWS (Dindori Taluka)',
            lastUpdated: 'Live telemetry (12 mins ago)',
            temp: 29.4,
            tempFeels: 31.0,
            tempHigh: 33.2,
            tempLow: 19.8,
            humidity: 56,
            humidityStatus: 'Moderate (Safe from leaf blights)',
            wind: '11 km/h WNW',
            condition: 'Clear & Warm',
            icon: '',
            dewPoint: '19.2°C',
            et0: '4.2 mm/day (Reference Evapotranspiration)',
            solarRad: '19.4 MJ/m²',
            rain: {
              seasonTotal: '685 mm',
              normalPct: '+8% vs 10-Yr Normal',
              last24h: '0.0 mm',
              next48hProb: '12% (Negligible shower probability)'
            },
            forecast5Day: [
              { day: 'Wed (Today)', high: 33, low: 20, icon: '', rainProb: '10%', desc: 'Sunny & dry' },
              { day: 'Thu', high: 32, low: 19, icon: '', rainProb: '15%', desc: 'Partly cloudy' },
              { day: 'Fri', high: 31, low: 19, icon: '', rainProb: '20%', desc: 'Breezy PM' },
              { day: 'Sat', high: 32, low: 18, icon: '', rainProb: '5%', desc: 'Clear dry' },
              { day: 'Sun', high: 34, low: 20, icon: '', rainProb: '5%', desc: 'Warm sunny' }
            ],
            agroAdvisory: 'Favorable warm, dry atmospheric conditions for onion bulb curing. Relative humidity (56%) is safely below the sporulation threshold for purple blotch (Alternaria porri). Irrigation can be held for harvest preparation.'
          },
          cropCycles: [
            {
              season: 'Rabi 2025-26',
              crop: 'Onion (Fursungi)',
              status: 'Current Cycle',
              area: '2.4 Acres',
              sowing: '10 Nov 2025',
              harvest: '20 Apr 2026',
              yield: '12.0 qt/acre',
              rate: '₹2,100 / qt',
              revenue: '₹60,480',
              netMargin: '₹42,200',
              inputs: 'Seeds ₹4,200 · Fert ₹3,100 · Labour ₹2,800',
              soilImpact: 'Fibrous bulb root turnover conditioned top 15cm crumb structure.',
              pestAlert: 'Nil. Low thrips pressure managed by neem spray.'
            },
            {
              season: 'Kharif 2025',
              crop: 'Soybean (JS-335)',
              status: 'Completed',
              area: '2.4 Acres',
              sowing: '18 Jun 2025',
              harvest: '25 Oct 2025',
              yield: '8.8 qt/acre',
              rate: '₹4,450 / qt',
              revenue: '₹93,980',
              netMargin: '₹62,100',
              inputs: 'Rhizobium seed inoculant + Single Super Phosphate 100 kg',
              soilImpact: 'Symbiotic nitrogen fixation added ~28 kg available N/ha into soil profile.',
              pestAlert: 'Minor stem borer controlled at vegetative stage.'
            },
            {
              season: 'Rabi 2024-25',
              crop: 'Wheat (Lokwan)',
              status: 'Completed',
              area: '2.4 Acres',
              sowing: '15 Nov 2024',
              harvest: '22 Mar 2025',
              yield: '16.5 qt/acre',
              rate: '₹2,320 / qt',
              revenue: '₹91,870',
              netMargin: '₹56,400',
              inputs: 'NPK 10:26:26 (75 kg) + 2 Urea top dresses',
              soilImpact: 'Dense root biomass enhanced organic humus and prevented compaction.',
              pestAlert: 'Rust resistant variety; clean harvest season.'
            },
            {
              season: 'Kharif 2024',
              crop: 'Tomato (Abhinav)',
              status: 'Completed',
              area: '1.2 Acres',
              sowing: '10 Jul 2024',
              harvest: '15 Nov 2024',
              yield: '175 crates/ac',
              rate: '₹820 / crate',
              revenue: '₹1,43,500',
              netMargin: '₹78,000',
              inputs: 'Drip fertigation + Water soluble 19:19:19 + Boron',
              soilImpact: 'Deep taproot penetrations loosened subsoil plow-layer.',
              pestAlert: 'Early leaf curl controlled via yellow sticky traps.'
            }
          ]
        },
        '124': {
          soil: {
            shcNumber: 'SHC-MH-2025-09841',
            labName: 'National Research Centre for Grapes, Pune / Nashik',
            testDate: '02 Dec 2025',
            soilType: 'Sandy Loam with Gravel Drainage',
            texture: 'Sandy Loam (Sand 58%, Silt 26%, Clay 16%)',
            ph: 7.5,
            phStatus: 'Slightly Alkaline (Ideal for Vitis vinifera)',
            ec: 0.44,
            ecStatus: 'Low Salinity (Safe for grape rootstocks)',
            oc: 0.72,
            ocStatus: 'High Organic Carbon (> 0.7%)',
            moisture: 20,
            moistureStatus: 'Drip regulated (Controlled deficit)',
            npk: {
              n: { val: 195, min: 140, max: 260, rating: 'Low-Medium', label: 'Nitrogen (N)', unit: 'kg/ha' },
              p: { val: 24.0, min: 15, max: 30, rating: 'Optimal', label: 'Phosphorus (P₂O₅)', unit: 'kg/ha' },
              k: { val: 380, min: 250, max: 400, rating: 'High', label: 'Potassium (K₂O)', unit: 'kg/ha' }
            },
            micronutrients: [
              { name: 'Zinc (Zn)', val: '0.92 ppm', status: 'Adequate', ok: true },
              { name: 'Boron (B)', val: '0.70 ppm', status: 'Optimum for Berry Set', ok: true },
              { name: 'Magnesium (Mg)', val: '2.4 meq/L', status: 'Adequate', ok: true },
              { name: 'Calcium (Ca)', val: '14.2 meq/L', status: 'High (Good Berry Crunch)', ok: true }
            ],
            advisory: 'High potassium reserves promote excellent berry brix and sweetness. Continue potassium sulphate drip fertigation. Ensure canopy aeration.'
          },
          climate: {
            station: 'Pimpalgaon Baswant AWS',
            lastUpdated: 'Live telemetry (15 mins ago)',
            temp: 29.8,
            tempFeels: 30.5,
            tempHigh: 33.5,
            tempLow: 19.5,
            humidity: 52,
            humidityStatus: 'Dry (Excellent for grape ripening)',
            wind: '12 km/h W',
            condition: 'Sunny',
            icon: '',
            dewPoint: '17.8°C',
            et0: '4.5 mm/day',
            solarRad: '20.1 MJ/m²',
            rain: { seasonTotal: '670 mm', normalPct: '+6%', last24h: '0.0 mm', next48hProb: '5%' },
            forecast5Day: [
              { day: 'Wed', high: 33, low: 20, icon: '', rainProb: '5%', desc: 'Sunny' },
              { day: 'Thu', high: 33, low: 19, icon: '', rainProb: '5%', desc: 'Warm dry' },
              { day: 'Fri', high: 32, low: 19, icon: '', rainProb: '10%', desc: 'Clear' },
              { day: 'Sat', high: 32, low: 18, icon: '', rainProb: '0%', desc: 'Dry sun' },
              { day: 'Sun', high: 34, low: 20, icon: '', rainProb: '0%', desc: 'Sunny' }
            ],
            agroAdvisory: 'Low relative humidity (52%) minimizes Downy Mildew risk. Perfect conditions for berry enlargement and TSS sugar concentration.'
          },
          cropCycles: [
            { season: '2025-26', crop: 'Thompson Seedless Grapes', status: 'Current Harvest', area: '2.8 Acres', sowing: 'Perennial', harvest: 'Mar 2026', yield: '14.2 tonnes/ac', rate: '₹72 / kg', revenue: '₹2,86,000', netMargin: '₹1,45,000', inputs: 'Drip fertigation + GA3 hormone', soilImpact: 'Permanent sod culture mulching preserved microflora.', pestAlert: 'Nil mildew flags.' },
            { season: '2024-25', crop: 'Thompson Seedless Grapes', status: 'Completed', area: '2.8 Acres', sowing: 'Perennial', harvest: 'Mar 2025', yield: '13.8 tonnes/ac', rate: '₹68 / kg', revenue: '₹2,68,000', netMargin: '₹1,32,000', inputs: 'Organic manure + K fertigation', soilImpact: 'Vermicompost increased soil humic acid by 0.3%.', pestAlert: 'Thrips controlled organically.' }
          ]
        },
        '123': {
          soil: {
            shcNumber: 'SHC-MH-2025-11029',
            labName: 'KVK Niphad Soil Testing Lab, Nashik',
            testDate: '10 Jan 2026',
            soilType: 'Clay Loam (Medium Black)',
            texture: 'Clay Loam (Clay 46%, Silt 32%, Sand 22%)',
            ph: 7.4,
            phStatus: 'Slightly Alkaline / Good',
            ec: 0.40,
            ecStatus: 'Normal (Non-saline)',
            oc: 0.62,
            ocStatus: 'Medium (> 0.5%)',
            moisture: 22,
            moistureStatus: 'Needs Light Irrigation',
            npk: {
              n: { val: 220, min: 140, max: 280, rating: 'Medium', label: 'Nitrogen (N)', unit: 'kg/ha' },
              p: { val: 19.0, min: 10, max: 25, rating: 'Medium', label: 'Phosphorus (P₂O₅)', unit: 'kg/ha' },
              k: { val: 295, min: 150, max: 350, rating: 'Good', label: 'Potassium (K₂O)', unit: 'kg/ha' }
            },
            micronutrients: [
              { name: 'Zinc (Zn)', val: '0.78 ppm', status: 'Adequate', ok: true },
              { name: 'Boron (B)', val: '0.52 ppm', status: 'Sufficient', ok: true },
              { name: 'Iron (Fe)', val: '4.80 ppm', status: 'Adequate', ok: true },
              { name: 'Sulphur (S)', val: '13.2 ppm', status: 'Good', ok: true }
            ],
            advisory: 'Water shortage flagged on contract. Prioritize drip or furrow surge irrigation during early morning to limit evaporation loss.'
          },
          climate: {
            station: 'Pimpalgaon Baswant AWS',
            lastUpdated: 'Live telemetry (12 mins ago)',
            temp: 29.4,
            tempFeels: 31.0,
            tempHigh: 33.2,
            tempLow: 19.8,
            humidity: 56,
            humidityStatus: 'Moderate',
            wind: '11 km/h WNW',
            condition: 'Clear & Warm',
            icon: '',
            dewPoint: '19.2°C',
            et0: '4.2 mm/day',
            solarRad: '19.4 MJ/m²',
            rain: { seasonTotal: '685 mm', normalPct: '+8%', last24h: '0.0 mm', next48hProb: '12%' },
            forecast5Day: [
              { day: 'Wed', high: 33, low: 20, icon: '', rainProb: '10%', desc: 'Sunny & dry' },
              { day: 'Thu', high: 32, low: 19, icon: '', rainProb: '15%', desc: 'Partly cloudy' },
              { day: 'Fri', high: 31, low: 19, icon: '', rainProb: '20%', desc: 'Breezy PM' },
              { day: 'Sat', high: 32, low: 18, icon: '', rainProb: '5%', desc: 'Clear dry' },
              { day: 'Sun', high: 34, low: 20, icon: '', rainProb: '5%', desc: 'Warm sunny' }
            ],
            agroAdvisory: 'High diurnal temperature range (19.8°C to 33.2°C). Soil moisture deficit detected; irrigate within 48h to prevent onion bulb splitting.'
          },
          cropCycles: [
            { season: 'Rabi 2025-26', crop: 'Onion (Late Kharif/Rabi)', status: 'Harvest Ready', area: '1.8 Acres', sowing: '12 Nov 2025', harvest: '25 Apr 2026', yield: '8.0 qt/acre', rate: '₹1,900 / qt', revenue: '₹27,360', netMargin: '₹18,200', inputs: 'Seeds ₹3,100 · Labour ₹2,200', soilImpact: 'Organic mulch preserved soil moisture.', pestAlert: 'Water stress noted.' },
            { season: 'Kharif 2025', crop: 'Bajra (Pearl Millet)', status: 'Completed', area: '1.8 Acres', sowing: '20 Jun 2025', harvest: '15 Oct 2025', yield: '11.2 qt/acre', rate: '₹2,150 / qt', revenue: '₹43,300', netMargin: '₹29,000', inputs: 'Minimal inputs, rainfed', soilImpact: 'Extensive fibrous roots broke clay crust.', pestAlert: 'None.' }
          ]
        }
      };

      // Default profile generator for any other Gat
      if (PROFILES[gat]) {
        return PROFILES[gat];
      }

      // Dynamic profile fallback
      return {
        soil: {
          shcNumber: 'SHC-MH-2025-' + (10000 + (parseInt(gat, 10) || 50)),
          labName: 'Nashik District Agricultural Testing Lab',
          testDate: '12 Jan 2026',
          soilType: soilType,
          texture: 'Loam to Clay Loam (Rich Alluvium)',
          ph: 7.1,
          phStatus: 'Neutral / Highly Productive',
          ec: 0.35,
          ecStatus: 'Normal (Non-saline)',
          oc: 0.65,
          ocStatus: 'Good Organic Matter',
          moisture: 23,
          moistureStatus: 'Adequate Moisture',
          npk: {
            n: { val: 230, min: 140, max: 280, rating: 'Medium', label: 'Nitrogen (N)', unit: 'kg/ha' },
            p: { val: 20.0, min: 10, max: 25, rating: 'Optimal', label: 'Phosphorus (P₂O₅)', unit: 'kg/ha' },
            k: { val: 310, min: 150, max: 350, rating: 'High', label: 'Potassium (K₂O)', unit: 'kg/ha' }
          },
          micronutrients: [
            { name: 'Zinc (Zn)', val: '0.80 ppm', status: 'Adequate', ok: true },
            { name: 'Boron (B)', val: '0.55 ppm', status: 'Sufficient', ok: true },
            { name: 'Iron (Fe)', val: '4.90 ppm', status: 'Adequate', ok: true },
            { name: 'Sulphur (S)', val: '13.5 ppm', status: 'Good', ok: true }
          ],
          advisory: 'Soil conditions are healthy for ' + crop + '. Standard micronutrient spray and compost top dressing recommended.'
        },
        climate: {
          station: 'Pimpalgaon Baswant AWS (Dindori)',
          lastUpdated: 'Live telemetry (10 mins ago)',
          temp: 29.4,
          tempFeels: 31.0,
          tempHigh: 33.2,
          tempLow: 19.8,
          humidity: 56,
          humidityStatus: 'Normal Range',
          wind: '11 km/h WNW',
          condition: 'Partly Cloudy',
          icon: '',
          dewPoint: '19.2°C',
          et0: '4.2 mm/day',
          solarRad: '19.4 MJ/m²',
          rain: { seasonTotal: '685 mm', normalPct: '+8%', last24h: '0.0 mm', next48hProb: '12%' },
          forecast5Day: [
            { day: 'Wed', high: 33, low: 20, icon: '', rainProb: '10%', desc: 'Sunny & dry' },
            { day: 'Thu', high: 32, low: 19, icon: '', rainProb: '15%', desc: 'Partly cloudy' },
            { day: 'Fri', high: 31, low: 19, icon: '', rainProb: '20%', desc: 'Breezy PM' },
            { day: 'Sat', high: 32, low: 18, icon: '', rainProb: '5%', desc: 'Clear dry' },
            { day: 'Sun', high: 34, low: 20, icon: '', rainProb: '5%', desc: 'Warm sunny' }
          ],
          agroAdvisory: 'Optimal weather for ' + crop + ' growth. Morning humidity and solar radiation in favorable balance.'
        },
        cropCycles: [
          { season: 'Rabi 2025-26', crop: crop, status: 'Current Standing Crop', area: area + ' Acres', sowing: 'Nov 2025', harvest: 'Apr 2026', yield: '11.5 qt/acre', rate: '₹2,050 / qt', revenue: '₹47,150', netMargin: '₹31,000', inputs: 'Standard seeds and basal dressing', soilImpact: 'Crop canopy protected soil structure.', pestAlert: 'Normal field monitoring.' },
          { season: 'Kharif 2025', crop: 'Soybean / Pulses', status: 'Completed', area: area + ' Acres', sowing: 'Jun 2025', harvest: 'Oct 2025', yield: '8.2 qt/acre', rate: '₹4,300 / qt', revenue: '₹70,520', netMargin: '₹48,000', inputs: 'Rhizobium seed treatment', soilImpact: 'Legume nodulation enriched soil nitrogen.', pestAlert: 'Clean harvest.' },
          { season: 'Rabi 2024-25', crop: 'Wheat / Gram', status: 'Completed', area: area + ' Acres', sowing: 'Nov 2024', harvest: 'Mar 2025', yield: '15.0 qt/acre', rate: '₹2,250 / qt', revenue: '₹67,500', netMargin: '₹42,000', inputs: 'NPK complex', soilImpact: 'Straw mulching improved moisture retention.', pestAlert: 'None.' }
        ]
      };
    },

    writeAudit: writeAudit,
    mockOTP: mockOTP
  };

})();
