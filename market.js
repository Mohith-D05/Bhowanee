/* ============================================================
   Bhowanee - Market Intelligence (market.js)
   Phase 1: data layer only. No dashboard screen.
   Feeds mandi prices on the bid board and farmer set-price screen.
   ============================================================ */

window.Market = (function () {
  'use strict';

  var MANDI_PRICES = {
    Onion:   { price: 1880, unit: 'quintal', trend: 'stable',   change: +20  },
    Tomato:  { price: 2200, unit: 'quintal', trend: 'rising',   change: +120 },
    Soybean: { price: 4800, unit: 'quintal', trend: 'falling',  change: -80  },
    Pulses:  { price: 6200, unit: 'quintal', trend: 'rising',   change: +150 }
  };

  // Simulated daily series (last 14 days) for sparklines
  var PRICE_HISTORY = {
    Onion:   [1720,1750,1800,1790,1810,1830,1820,1860,1850,1870,1880,1875,1885,1880],
    Tomato:  [1900,1950,2000,2050,2080,2100,2120,2150,2160,2180,2200,2210,2200,2200],
    Soybean: [5100,5050,5000,4980,4960,4940,4920,4900,4880,4860,4840,4820,4810,4800],
    Pulses:  [5800,5850,5900,5950,5980,6000,6050,6080,6100,6120,6150,6180,6190,6200]
  };

  var DEMAND_TRENDS = {
    Onion:   { trend: 'High demand', buyers: 42, forwardOrders: 18, note: 'Quick commerce demand up 15% this month.' },
    Tomato:  { trend: 'Rising',      buyers: 28, forwardOrders: 9,  note: 'Hotel and restaurant demand recovering after festive season.' },
    Soybean: { trend: 'Steady',      buyers: 15, forwardOrders: 6,  note: 'FMCG buyers holding forward positions.' },
    Pulses:  { trend: 'Rising',      buyers: 22, forwardOrders: 12, note: 'Export demand from South-East Asia pushing prices up.' }
  };

  var SALE_WINDOW_ALERTS = [
    { crop: 'Onion',  district: 'nashik',  message: 'Nashik mandi onion price is 12% above 30-day average. Good window to list.', ts: '09:15' },
    { crop: 'Pulses', district: 'latur',   message: 'Latur pulses at season high. Forward buyers active.', ts: '11:40' }
  ];

  return {
    getPrice: function (crop) {
      return MANDI_PRICES[crop] || { price: 2000, unit: 'quintal', trend: 'unknown', change: 0 };
    },

    getPriceHistory: function (crop) {
      return PRICE_HISTORY[crop] || [];
    },

    getDemandTrend: function (crop) {
      return DEMAND_TRENDS[crop] || { trend: 'Unknown', buyers: 0, forwardOrders: 0, note: '' };
    },

    getSaleWindowAlerts: function (district) {
      if (!district) return SALE_WINDOW_ALERTS;
      return SALE_WINDOW_ALERTS.filter(function (a) { return a.district === district; });
    },

    // Prompt level: 'ok' | 'warn-high' | 'warn-low'
    pricePrompt: function (crop, farmerPrice) {
      var ref = this.getPrice(crop);
      if (!ref || !farmerPrice) return { level: 'ok', text: '' };
      var diff = Math.round((farmerPrice - ref.price) / ref.price * 100);
      if (diff > 10)  return { level: 'warn-high', diff: diff, refPrice: ref.price };
      if (diff < -10) return { level: 'warn-low',  diff: Math.abs(diff), refPrice: ref.price };
      return { level: 'ok', text: '' };
    },

    // Returns a human-readable string for the bid board
    bidBoardNote: function (farmerPrice, highestBid, crop) {
      if (!highestBid) return 'No bids yet. Buyers can see your price.';
      var mandiPrice = this.getPrice(crop).price;
      var diff = farmerPrice - highestBid;
      if (diff <= 0) return 'A bid has reached your price. The lot has closed.';
      return 'Highest offer is ₹' + Number(highestBid).toLocaleString('en-IN') + '. That is ₹' + diff.toLocaleString('en-IN') + ' below your price. Mandi today is ₹' + mandiPrice.toLocaleString('en-IN') + '.';
    },

    allCrops: function () { return Object.keys(MANDI_PRICES); }
  };
})();
