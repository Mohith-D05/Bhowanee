/* ============================================================
   Bhowanee - Auth (auth.js)
   Mock authentication using sessionStorage.
   ============================================================ */

(function () {
  'use strict';

  var SESSION_KEY = 'bh_session';
  var LANG_KEY    = 'bh_lang';

  var ROLE_ROUTES = {
    farmer:    'farmer.html',
    block:     'block.html',
    buyer:     'buyer.html',
    investor:  'investor.html',
    logistics: 'logistics.html',
    storage:   'storage.html',
    team:      'admin.html',
    admin:     'admin.html'
  };

  window.Auth = {
    login: function (role, name, phone) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role: role, name: name, phone: phone || '' }));
    },

    logout: function () {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = 'index.html';
    },

    getSession: function () {
      try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      } catch (e) { return null; }
    },

    require: function (allowedRoles) {
      var session = this.getSession();
      if (!session) {
        window.location.href = 'index.html';
        return null;
      }
      if (allowedRoles) {
        var roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        // Allow 'team' and 'admin' interchangeably
        if (roles.indexOf('team') !== -1 && roles.indexOf('admin') === -1) roles.push('admin');
        if (roles.indexOf('admin') !== -1 && roles.indexOf('team') === -1) roles.push('team');
        if (roles.indexOf(session.role) === -1) {
          window.location.href = ROLE_ROUTES[session.role] || 'index.html';
          return null;
        }
      }
      return session;
    },

    requireRole: function (role) {
      return this.require(Array.isArray(role) ? role : [role]);
    },

    routeFor: function (role) {
      return ROLE_ROUTES[role] || 'index.html';
    },

    // Language preference
    getLang: function () {
      return localStorage.getItem(LANG_KEY) || 'en';
    },

    setLang: function (lang) {
      localStorage.setItem(LANG_KEY, lang);
    },

    // Render user info in topbar elements
    renderTopbar: function (nameEl, roleEl) {
      var s = this.getSession();
      if (!s) return;
      if (nameEl) nameEl.textContent = s.name;
      if (roleEl)  roleEl.textContent = s.role;
    }
  };

  // Offline badge wiring - auto-runs on every page that imports auth.js
  window.addEventListener('DOMContentLoaded', function () {
    var offBadge  = document.getElementById('offline-badge');
    var syncBadge = document.getElementById('sync-badge');

    function updateBadges() {
      if (offBadge)  offBadge.classList.toggle('visible', !navigator.onLine);
      if (syncBadge) syncBadge.classList.toggle('visible', false);
    }

    updateBadges();
    window.addEventListener('online',  updateBadges);
    window.addEventListener('offline', updateBadges);

    if (typeof BD !== 'undefined') {
      BD.on('synced', function () {
        if (syncBadge) {
          syncBadge.textContent = 'Synced';
          syncBadge.classList.add('visible');
          setTimeout(function () { syncBadge.classList.remove('visible'); }, 3000);
        }
      });
    }

    // Language toggle buttons
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      var l = Auth.getLang();
      btn.setAttribute('aria-pressed', btn.dataset.lang === l ? 'true' : 'false');
      btn.addEventListener('click', function () {
        Auth.setLang(btn.dataset.lang);
        document.querySelectorAll('[data-lang]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
      });
    });
  });

})();
