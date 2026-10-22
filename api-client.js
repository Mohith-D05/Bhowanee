/* ============================================================
   Bhowanee - API Client & Socket.IO Bridge (api-client.js)
   Connects the existing static frontend to the NestJS backend.
   Drop-in: just add <script src="api-client.js"></script> after
   data.js in any HTML page.
   ============================================================ */

window.BhApi = (function () {
  'use strict';

  // ── Configuration ──────────────────────────────────────────
  var isHttp = window.location.protocol === 'http:' || window.location.protocol === 'https:';
  var isCustomPort = window.location.port === '5500' || window.location.port === '5501';
  var defaultBase = (isHttp && !isCustomPort) ? '/api' : 'http://localhost:3000/api';
  var defaultWs = (isHttp && !isCustomPort) ? (window.location.origin || (window.location.protocol + '//' + window.location.host)) : 'http://localhost:3000';

  var BASE = window.BHOWANEE_API_BASE || defaultBase;
  var WS_URL = window.BHOWANEE_WS_URL || defaultWs;
  var TOKEN_KEY = 'bh_access_token';

  // ── Token Management ───────────────────────────────────────
  function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
  function setToken(t) { sessionStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { sessionStorage.removeItem(TOKEN_KEY); }

  // ── HTTP helpers ───────────────────────────────────────────
  function headers(extra) {
    var h = { 'Content-Type': 'application/json' };
    var t = getToken();
    if (t) h['Authorization'] = 'Bearer ' + t;
    if (extra) Object.assign(h, extra);
    return h;
  }

  function handleResponse(res) {
    if (res.status === 401) {
      // Try refresh
      return refreshToken().then(function (ok) {
        if (!ok) {
          clearToken();
          if (window.Auth) window.Auth.logout();
          return Promise.reject({ status: 401, message: 'Session expired.' });
        }
        // Retry original request would need more complex logic;
        // for now, prompt user
        return Promise.reject({ status: 401, message: 'Token refreshed. Please retry.' });
      });
    }
    if (!res.ok) {
      return res.json().then(function (body) {
        return Promise.reject({ status: res.status, message: body.message || 'Request failed.' });
      }).catch(function () {
        return Promise.reject({ status: res.status, message: 'Request failed.' });
      });
    }
    return res.json();
  }

  function get(path) {
    return fetch(BASE + path, { method: 'GET', headers: headers(), credentials: 'include' })
      .then(handleResponse);
  }

  function post(path, body) {
    return fetch(BASE + path, { method: 'POST', headers: headers(), credentials: 'include', body: JSON.stringify(body) })
      .then(handleResponse);
  }

  function patch(path, body) {
    return fetch(BASE + path, { method: 'PATCH', headers: headers(), credentials: 'include', body: JSON.stringify(body) })
      .then(handleResponse);
  }

  // ── Auth API ───────────────────────────────────────────────
  function requestOtp(phone, role) {
    return post('/auth/otp/request', { phone: phone, role: role });
  }

  function verifyOtp(phone, code, role) {
    return post('/auth/otp/verify', { phone: phone, code: code, role: role })
      .then(function (data) {
        setToken(data.accessToken);
        return data;
      });
  }

  function loginWithPassword(email, password, role) {
    return post('/auth/login', { email: email, password: password, role: role })
      .then(function (data) {
        setToken(data.accessToken);
        return data;
      });
  }

  function register(email, password, name, role) {
    return post('/auth/register', { email: email, password: password, name: name, role: role });
  }

  function refreshToken() {
    return fetch(BASE + '/auth/refresh', { method: 'POST', headers: headers(), credentials: 'include' })
      .then(function (res) {
        if (!res.ok) return false;
        return res.json().then(function (data) {
          setToken(data.accessToken);
          return true;
        });
      })
      .catch(function () { return false; });
  }

  function logout() {
    return post('/auth/logout', {}).finally(function () { clearToken(); });
  }

  function getMe() {
    return get('/users/me');
  }

  // ── Contracts ──────────────────────────────────────────────
  function getContracts(filters) {
    var qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return get('/contracts' + qs);
  }

  function getContract(id) { return get('/contracts/' + id); }

  function createContract(data) { return post('/contracts', data); }

  function updateContractStage(id, stage) { return patch('/contracts/' + id + '/stage', { stage: stage }); }

  function addTask(contractId, label, due) { return post('/contracts/' + contractId + '/tasks', { label: label, due: due }); }

  function toggleTask(taskId) { return patch('/contracts/tasks/' + taskId + '/toggle', {}); }

  function addCost(contractId, type, amount) { return post('/contracts/' + contractId + '/costs', { type: type, amount: amount }); }

  function flagIssue(contractId, description) { return post('/contracts/' + contractId + '/flag-issue', { description: description }); }

  // ── Lots ───────────────────────────────────────────────────
  function getLots(filters) {
    var qs = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return get('/lots' + qs);
  }

  function getOpenLots() { return get('/lots/open'); }

  function getLot(id) { return get('/lots/' + id); }

  function createLot(contractId, grade, weightQt) {
    return post('/lots', { contractId: contractId, grade: grade, weightQt: weightQt });
  }

  function setFarmerPrice(lotId, price) { return patch('/lots/' + lotId + '/price', { price: price }); }

  // ── Bids ───────────────────────────────────────────────────
  function getBidsByLot(lotId) { return get('/bids/lot/' + lotId); }

  function getHighestBid(lotId) { return get('/bids/lot/' + lotId + '/highest'); }

  function placeBid(lotId, price) { return post('/bids', { lotId: lotId, price: price }); }

  function acceptBid(lotId, bidId) { return post('/bids/' + lotId + '/accept/' + bidId, {}); }

  // ── Dashboard ──────────────────────────────────────────────
  function getAdminDashboard() { return get('/dashboard/admin'); }

  function getDistrictStats() { return get('/dashboard/districts'); }

  function getDemandSupply() { return get('/dashboard/demand-supply'); }

  function getBlockDashboard() { return get('/dashboard/block'); }

  function getBuyerDashboard() { return get('/dashboard/buyer'); }

  function getInvestorDashboard() { return get('/dashboard/investor'); }

  function getLogisticsDashboard() { return get('/dashboard/logistics'); }

  function getStorageDashboard() { return get('/dashboard/storage'); }

  // ── Plans & Investments ────────────────────────────────────
  function getPlans() { return get('/plans'); }

  function getInvestments() { return get('/investments'); }

  function invest(planId, amount) { return post('/investments', { planId: planId, amount: amount }); }

  // ── Warehouses ─────────────────────────────────────────────
  function getWarehouses() { return get('/warehouses'); }

  function createWarehouse(data) { return post('/warehouses', data); }

  // ── Logistics ──────────────────────────────────────────────
  function getPickups() { return get('/logistics/pickups'); }

  function schedulePickup(data) { return post('/logistics/pickups', data); }

  function getHandoffs() { return get('/logistics/handoffs'); }

  function confirmHandoff(data) { return post('/logistics/handoffs', data); }

  function logLoss(pickupId, qty, reason) { return patch('/logistics/pickups/' + pickupId + '/loss', { qty: qty, reason: reason }); }

  // ── Disputes ───────────────────────────────────────────────
  function getDisputes() { return get('/disputes'); }

  function resolveDispute(id, resolution) { return patch('/disputes/' + id + '/resolve', { resolution: resolution }); }

  // ── Payments ───────────────────────────────────────────────
  function getPayments(status) {
    var qs = status ? '?status=' + status : '';
    return get('/payments' + qs);
  }

  function settlePayment(id) { return patch('/payments/' + id + '/settle', {}); }

  // ── Health ─────────────────────────────────────────────────
  function healthCheck() { return get('/health'); }


  // ══════════════════════════════════════════════════════════
  // Socket.IO Real-time Connection
  // ══════════════════════════════════════════════════════════

  var socket = null;
  var eventHandlers = {};
  var reconnectAttempts = 0;
  var MAX_RECONNECT = 10;

  function connectSocket() {
    if (socket && socket.connected) return;
    if (typeof io === 'undefined') {
      console.warn('[BhApi] Socket.IO client not loaded. Real-time updates disabled.');
      return;
    }

    var token = getToken();
    if (!token) {
      console.warn('[BhApi] No access token. Socket.IO deferred until login.');
      return;
    }

    socket = io(WS_URL, {
      auth: { token: token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: MAX_RECONNECT,
    });

    socket.on('connect', function () {
      console.log('🔌 Socket.IO connected:', socket.id);
      reconnectAttempts = 0;
      updateSyncBadge(true);
    });

    socket.on('disconnect', function (reason) {
      console.log('🔌 Socket.IO disconnected:', reason);
      updateSyncBadge(false);
    });

    socket.on('connect_error', function (err) {
      reconnectAttempts++;
      console.warn('🔌 Socket.IO error (' + reconnectAttempts + '/' + MAX_RECONNECT + '):', err.message);
      updateSyncBadge(false);
    });

    // Register all event listeners
    var events = [
      'bid.placed', 'lot.closed', 'lot.price.changed', 'lot.created',
      'contract.updated', 'dashboard.metrics.updated',
      'payment.settled', 'dispute.resolved', 'kyc.approved',
      'notification.created',
    ];

    events.forEach(function (evt) {
      socket.on(evt, function (data) {
        console.log('📡 [' + evt + ']', data);
        fireHandlers(evt, data);
      });
    });
  }

  function disconnectSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  function subscribeLot(lotId) {
    if (socket && socket.connected) socket.emit('subscribe:lot', lotId);
  }

  function unsubscribeLot(lotId) {
    if (socket && socket.connected) socket.emit('unsubscribe:lot', lotId);
  }

  function on(event, handler) {
    if (!eventHandlers[event]) eventHandlers[event] = [];
    eventHandlers[event].push(handler);
  }

  function off(event, handler) {
    if (!eventHandlers[event]) return;
    eventHandlers[event] = eventHandlers[event].filter(function (h) { return h !== handler; });
  }

  function bridgeToBD(event, data) {
    if (typeof BD === 'undefined' || !BD.store) return;
    try {
      if (event === 'bid.placed') {
        var existingBid = BD.store.bids.find(function (b) { return b.id === data.bidId; });
        if (!existingBid) {
          BD.store.bids.push({
            id: data.bidId,
            lotId: data.lotId,
            buyer: data.buyerName,
            price: data.price,
            timestamp: data.timestamp
          });
          var lot = BD.store.lots.find(function (l) { return l.id === data.lotId; });
          if (lot && data.price >= lot.farmerPrice && lot.farmerPrice > 0) {
            lot.status = 'closed';
            lot.closedBidId = data.bidId;
            lot.closedAt = data.timestamp;
            if (BD.emit) BD.emit('lotClosed', { lotId: data.lotId, bid: { id: data.bidId, price: data.price, buyer: data.buyerName } });
          }
          if (BD.emit) BD.emit('bidPlaced', data);
        }
      } else if (event === 'lot.closed') {
        var lot = BD.store.lots.find(function (l) { return l.id === data.lotId; });
        if (lot) {
          lot.status = 'closed';
          lot.closedBidId = data.bidId;
          lot.closedAt = data.timestamp;
        }
        if (BD.emit) BD.emit('lotClosed', data);
      } else if (event === 'lot.price.changed') {
        var lot = BD.store.lots.find(function (l) { return l.id === data.lotId; });
        if (lot) {
          lot.farmerPrice = data.price;
          lot.status = 'open';
        }
        if (BD.emit) BD.emit('priceChanged', data);
      } else if (event === 'lot.created') {
        var lot = BD.store.lots.find(function (l) { return l.id === data.lotId; });
        if (!lot) {
          BD.store.lots.push({
            id: data.lotId,
            contractId: data.contractId,
            grade: data.grade,
            weightQt: data.weightQt,
            farmerPrice: 0,
            status: 'draft',
            listedAt: data.timestamp,
            photos: []
          });
        }
        if (BD.emit) BD.emit('lotCreated', data);
      } else if (event === 'contract.updated') {
        var contract = BD.store.contracts.find(function (c) { return c.id === data.contractId; });
        if (contract) {
          contract.stage = data.stage;
        }
        if (BD.emit) BD.emit('contractUpdated', data);
      } else if (event === 'dashboard.metrics.updated') {
        if (BD.emit) BD.emit('metricsUpdated', data);
      } else if (event === 'notification.created') {
        if (window.BhComp && typeof BhComp.toast === 'function') {
          BhComp.toast(data.message, data.type || 'info');
        }
      }
    } catch (e) {
      console.warn('[BhApi] bridgeToBD error:', e);
    }
  }

  function fireHandlers(event, data) {
    bridgeToBD(event, data);
    var handlers = eventHandlers[event] || [];
    handlers.forEach(function (h) {
      try { h(data); } catch (e) { console.error('[BhApi] Event handler error:', e); }
    });
    // Also fire wildcard handlers
    var wildcardHandlers = eventHandlers['*'] || [];
    wildcardHandlers.forEach(function (h) {
      try { h(event, data); } catch (e) { console.error('[BhApi] Wildcard handler error:', e); }
    });
  }

  function updateSyncBadge(isLive) {
    var el = document.getElementById('sync-badge');
    if (!el) return;
    if (isLive) {
      el.textContent = 'Live';
      el.className = 'sync-badge';
      el.style.display = '';
    } else {
      el.textContent = 'Reconnecting…';
      el.className = 'sync-badge warn';
    }
  }

  // ── Two-way BD Integration Bridge ─────────────────────────
  var bdHooked = false;
  function hookBDActions() {
    if (bdHooked || typeof BD === 'undefined') return;
    bdHooked = true;

    var origPlaceBid = BD.placeBid;
    BD.placeBid = function (lotId, buyer, price) {
      var res = origPlaceBid.apply(this, arguments);
      if (getToken()) {
        post('/bids', { lotId: lotId, price: price }).catch(function (err) {
          console.warn('[BhApi] placeBid API sync error:', err);
        });
      }
      return res;
    };

    var origSetFarmerPrice = BD.setFarmerPrice;
    BD.setFarmerPrice = function (lotId, price) {
      var res = origSetFarmerPrice.apply(this, arguments);
      if (getToken()) {
        patch('/lots/' + lotId + '/price', { price: price }).catch(function (err) {
          console.warn('[BhApi] setFarmerPrice API sync error:', err);
        });
      }
      return res;
    };

    var origAcceptBid = BD.acceptBid;
    BD.acceptBid = function (lotId, bidId) {
      var res = origAcceptBid.apply(this, arguments);
      if (getToken()) {
        post('/bids/' + lotId + '/accept/' + bidId, {}).catch(function (err) {
          console.warn('[BhApi] acceptBid API sync error:', err);
        });
      }
      return res;
    };

    var origAddTask = BD.addTask;
    BD.addTask = function (contractId, label, due) {
      var res = origAddTask.apply(this, arguments);
      if (getToken()) {
        post('/contracts/' + contractId + '/tasks', { label: label, due: due }).catch(function (err) {
          console.warn('[BhApi] addTask API sync error:', err);
        });
      }
      return res;
    };

    var origToggleTask = BD.toggleTask;
    BD.toggleTask = function (taskId) {
      var res = origToggleTask.apply(this, arguments);
      if (getToken()) {
        patch('/contracts/tasks/' + taskId + '/toggle', {}).catch(function (err) {
          console.warn('[BhApi] toggleTask API sync error:', err);
        });
      }
      return res;
    };

    var origAddCost = BD.addCost;
    BD.addCost = function (contractId, type, amount) {
      var res = origAddCost.apply(this, arguments);
      if (getToken()) {
        post('/contracts/' + contractId + '/costs', { type: type, amount: amount }).catch(function (err) {
          console.warn('[BhApi] addCost API sync error:', err);
        });
      }
      return res;
    };

    var origFlagIssue = BD.flagIssue;
    BD.flagIssue = function (contractId, desc) {
      var res = origFlagIssue.apply(this, arguments);
      if (getToken()) {
        post('/contracts/' + contractId + '/flag-issue', { description: desc }).catch(function (err) {
          console.warn('[BhApi] flagIssue API sync error:', err);
        });
      }
      return res;
    };

    var origCreateLot = BD.createLot;
    BD.createLot = function (contractId, grade, weightQt) {
      var res = origCreateLot.apply(this, arguments);
      if (getToken()) {
        post('/lots', { contractId: contractId, grade: grade, weightQt: weightQt }).catch(function (err) {
          console.warn('[BhApi] createLot API sync error:', err);
        });
      }
      return res;
    };

    console.log('[BhApi] BD actions hooked for live backend synchronization.');
  }

  function syncWithBackend() {
    if (!getToken()) return Promise.resolve(false);
    return Promise.all([
      get('/contracts').catch(function () { return null; }),
      get('/lots').catch(function () { return null; }),
      get('/warehouses').catch(function () { return null; }),
      get('/logistics/pickups').catch(function () { return null; })
    ]).then(function (results) {
      var contracts = results[0];
      var lots = results[1];
      var warehouses = results[2];
      var pickups = results[3];

      if (typeof BD !== 'undefined' && BD.store) {
        if (contracts && contracts.length) BD.store.contracts = contracts;
        if (lots && lots.length) BD.store.lots = lots;
        if (warehouses && warehouses.length) BD.store.warehouses = warehouses;
        if (pickups && pickups.length) BD.store.pickups = pickups;
        if (BD.emit) BD.emit('synced', {});
      }
      return true;
    }).catch(function (e) {
      console.warn('[BhApi] Background sync deferred:', e);
      return false;
    });
  }

  // Auto-init on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      hookBDActions();
      if (getToken()) {
        connectSocket();
        syncWithBackend();
      }
    });
  } else {
    hookBDActions();
    if (getToken()) {
      connectSocket();
      syncWithBackend();
    }
  }


  // ══════════════════════════════════════════════════════════
  // Public API
  // ══════════════════════════════════════════════════════════

  return {
    // Config
    BASE: BASE,
    WS_URL: WS_URL,

    // Token
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    isLoggedIn: function () { return !!getToken(); },

    // Auth
    requestOtp: requestOtp,
    verifyOtp: verifyOtp,
    loginWithPassword: loginWithPassword,
    register: register,
    refreshToken: refreshToken,
    logout: logout,
    getMe: getMe,

    // Contracts
    getContracts: getContracts,
    getContract: getContract,
    createContract: createContract,
    updateContractStage: updateContractStage,
    addTask: addTask,
    toggleTask: toggleTask,
    addCost: addCost,
    flagIssue: flagIssue,

    // Lots
    getLots: getLots,
    getOpenLots: getOpenLots,
    getLot: getLot,
    createLot: createLot,
    setFarmerPrice: setFarmerPrice,

    // Bids
    getBidsByLot: getBidsByLot,
    getHighestBid: getHighestBid,
    placeBid: placeBid,
    acceptBid: acceptBid,

    // Dashboard
    getAdminDashboard: getAdminDashboard,
    getDistrictStats: getDistrictStats,
    getDemandSupply: getDemandSupply,
    getBlockDashboard: getBlockDashboard,
    getBuyerDashboard: getBuyerDashboard,
    getInvestorDashboard: getInvestorDashboard,
    getLogisticsDashboard: getLogisticsDashboard,
    getStorageDashboard: getStorageDashboard,

    // Plans & Investments
    getPlans: getPlans,
    getInvestments: getInvestments,
    invest: invest,

    // Warehouses
    getWarehouses: getWarehouses,
    createWarehouse: createWarehouse,

    // Logistics
    getPickups: getPickups,
    schedulePickup: schedulePickup,
    getHandoffs: getHandoffs,
    confirmHandoff: confirmHandoff,
    logLoss: logLoss,

    // Disputes
    getDisputes: getDisputes,
    resolveDispute: resolveDispute,

    // Payments
    getPayments: getPayments,
    settlePayment: settlePayment,

    // Health
    healthCheck: healthCheck,

    // Socket.IO & Sync
    connect: connectSocket,
    disconnect: disconnectSocket,
    subscribeLot: subscribeLot,
    unsubscribeLot: unsubscribeLot,
    on: on,
    off: off,
    syncWithBackend: syncWithBackend,
    hookBDActions: hookBDActions,
  };
})();
