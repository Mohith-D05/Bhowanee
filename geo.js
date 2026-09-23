/* ============================================================
   Bhowanee — Maharashtra Approximate District GeoJSON
   Simplified polygons for prototype choropleth maps.
   Coordinates are [longitude, latitude] in GeoJSON order.
   ============================================================ */

window.MH_GEO = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "nashik", name: "Nashik", region: "north" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.25,19.55],[73.60,19.48],[74.20,19.50],[75.05,19.52],
          [75.20,19.80],[75.15,20.45],[74.85,21.00],[74.10,21.05],[73.65,20.90],
          [73.25,20.50],[73.25,19.55]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "pune", name: "Pune", region: "west" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.20,17.82],[73.90,17.78],[74.60,17.85],[75.20,17.92],
          [75.15,18.55],[74.90,19.00],[74.10,19.10],[73.30,19.05],[73.20,18.50],
          [73.20,17.82]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "nagpur", name: "Nagpur", region: "east" },
      geometry: {
        type: "Polygon",
        coordinates: [[[78.40,20.55],[79.30,20.50],[80.00,20.60],[80.05,21.10],
          [79.80,21.75],[79.00,21.80],[78.40,21.60],[78.30,21.00],[78.40,20.55]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "thane", name: "Thane", region: "konkan" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.75,18.85],[73.10,18.80],[73.75,18.90],[73.80,19.40],
          [73.70,20.05],[73.20,20.10],[72.80,19.80],[72.75,19.20],[72.75,18.85]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "amravati", name: "Amravati", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[77.00,20.25],[77.80,20.20],[78.50,20.28],[78.60,20.80],
          [78.55,21.65],[77.80,21.70],[77.00,21.60],[76.90,21.00],[77.00,20.25]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "sambhajinagar", name: "Sambhajinagar", region: "marathwada" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.60,18.85],[75.30,18.80],[76.20,18.88],[76.30,19.40],
          [76.20,20.35],[75.50,20.45],[74.65,20.40],[74.55,19.70],[74.60,18.85]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "latur", name: "Latur", region: "marathwada" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.05,17.62],[76.80,17.58],[77.55,17.65],[77.60,18.20],
          [77.50,18.85],[76.80,18.90],[76.05,18.85],[75.95,18.20],[76.05,17.62]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "kolhapur", name: "Kolhapur", region: "west" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.62,15.75],[74.20,15.70],[74.90,15.80],[74.95,16.50],
          [74.85,17.10],[74.20,17.15],[73.65,17.05],[73.60,16.40],[73.62,15.75]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "solapur", name: "Solapur", region: "south" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.80,16.82],[75.60,16.78],[76.30,16.85],[76.35,17.45],
          [76.25,18.10],[75.55,18.15],[74.85,18.10],[74.78,17.40],[74.80,16.82]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "ahmednagar", name: "Ahmednagar", region: "west" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.80,18.55],[74.55,18.50],[75.20,18.58],[75.25,19.15],
          [75.10,19.85],[74.40,19.90],[73.85,19.80],[73.78,19.10],[73.80,18.55]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "jalgaon", name: "Jalgaon", region: "north" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.80,20.55],[75.50,20.50],[76.50,20.55],[76.55,21.10],
          [76.40,21.60],[75.60,21.65],[74.85,21.55],[74.78,21.00],[74.80,20.55]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "buldhana", name: "Buldhana", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.30,20.20],[77.00,20.18],[77.80,20.25],[77.85,20.80],
          [77.75,21.30],[77.00,21.35],[76.30,21.25],[76.22,20.68],[76.30,20.20]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "wardha", name: "Wardha", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[78.40,20.25],[79.00,20.20],[79.50,20.28],[79.55,20.85],
          [79.45,21.30],[78.85,21.35],[78.38,21.20],[78.32,20.65],[78.40,20.25]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "chandrapur", name: "Chandrapur", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[79.05,19.52],[79.70,19.48],[80.30,19.55],[80.38,20.05],
          [80.30,20.55],[79.70,20.60],[79.05,20.52],[78.98,20.00],[79.05,19.52]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "gadchiroli", name: "Gadchiroli", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[79.80,19.05],[80.40,19.00],[80.90,19.08],[80.92,19.70],
          [80.80,20.55],[80.25,20.60],[79.75,20.50],[79.72,19.80],[79.80,19.05]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "bhandara", name: "Bhandara", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[79.30,21.05],[80.00,21.00],[80.65,21.08],[80.68,21.60],
          [80.55,21.90],[79.90,21.95],[79.30,21.85],[79.22,21.42],[79.30,21.05]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "gondiya", name: "Gondiya", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[79.92,21.05],[80.60,21.00],[81.00,21.08],[81.02,21.68],
          [80.88,22.00],[80.22,22.05],[79.90,21.90],[79.85,21.42],[79.92,21.05]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "yavatmal", name: "Yavatmal", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[77.60,19.95],[78.30,19.90],[79.00,19.98],[79.05,20.55],
          [78.95,21.05],[78.20,21.10],[77.60,21.00],[77.52,20.40],[77.60,19.95]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "washim", name: "Washim", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.85,19.90],[77.50,19.85],[78.00,19.93],[78.05,20.45],
          [77.95,20.80],[77.30,20.85],[76.82,20.75],[76.78,20.25],[76.85,19.90]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "akola", name: "Akola", region: "vidarbha" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.60,20.25],[77.30,20.20],[77.80,20.28],[77.85,20.85],
          [77.75,21.10],[77.05,21.15],[76.58,21.05],[76.52,20.55],[76.60,20.25]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "nanded", name: "Nanded", region: "marathwada" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.80,18.25],[77.55,18.20],[78.00,18.28],[78.05,18.85],
          [77.95,19.65],[77.25,19.70],[76.78,19.60],[76.72,18.92],[76.80,18.25]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "parbhani", name: "Parbhani", region: "marathwada" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.20,18.80],[76.90,18.75],[77.55,18.83],[77.60,19.45],
          [77.48,19.80],[76.75,19.85],[76.18,19.75],[76.12,19.18],[76.20,18.80]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "hingoli", name: "Hingoli", region: "marathwada" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.80,19.45],[77.40,19.40],[77.85,19.48],[77.90,19.95],
          [77.82,20.32],[77.15,20.38],[76.78,20.28],[76.72,19.72],[76.80,19.45]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "jalna", name: "Jalna", region: "marathwada" },
      geometry: {
        type: "Polygon",
        coordinates: [[[75.40,19.45],[76.10,19.40],[76.55,19.48],[76.60,19.98],
          [76.50,20.48],[75.78,20.53],[75.38,20.42],[75.32,19.80],[75.40,19.45]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "beed", name: "Beed", region: "marathwada" },
      geometry: {
        type: "Polygon",
        coordinates: [[[75.00,18.25],[75.70,18.20],[76.30,18.28],[76.35,18.88],
          [76.25,19.45],[75.55,19.50],[75.02,19.40],[74.95,18.72],[75.00,18.25]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "osmanabad", name: "Dharashiv", region: "marathwada" },
      geometry: {
        type: "Polygon",
        coordinates: [[[75.72,17.65],[76.40,17.60],[77.00,17.68],[77.05,18.25],
          [76.95,18.88],[76.28,18.92],[75.70,18.82],[75.62,18.18],[75.72,17.65]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "satara", name: "Satara", region: "west" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.48,17.10],[74.15,17.05],[74.90,17.12],[74.95,17.72],
          [74.85,18.48],[74.18,18.52],[73.50,18.42],[73.42,17.78],[73.48,17.10]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "sangli", name: "Sangli", region: "west" },
      geometry: {
        type: "Polygon",
        coordinates: [[[74.00,16.50],[74.70,16.45],[75.40,16.52],[75.45,17.12],
          [75.35,17.62],[74.65,17.68],[74.02,17.58],[73.95,16.90],[74.00,16.50]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "raigad", name: "Raigad", region: "konkan" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.82,17.85],[73.40,17.80],[73.80,17.88],[73.85,18.45],
          [73.75,19.00],[73.10,19.05],[72.80,18.95],[72.75,18.30],[72.82,17.85]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "ratnagiri", name: "Ratnagiri", region: "konkan" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.18,16.22],[73.60,16.18],[74.00,16.25],[74.05,16.85],
          [73.95,17.82],[73.35,17.88],[73.15,17.78],[73.10,17.08],[73.18,16.22]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "sindhudurg", name: "Sindhudurg", region: "konkan" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.55,15.62],[73.90,15.58],[74.25,15.65],[74.30,16.15],
          [74.20,16.62],[73.65,16.68],[73.52,16.55],[73.48,16.00],[73.55,15.62]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "dhule", name: "Dhule", region: "north" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.75,20.52],[74.40,20.48],[75.00,20.55],[75.05,21.10],
          [74.92,21.58],[74.25,21.62],[73.72,21.52],[73.68,20.92],[73.75,20.52]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "nandurbar", name: "Nandurbar", region: "north" },
      geometry: {
        type: "Polygon",
        coordinates: [[[73.35,21.05],[73.90,21.00],[74.30,21.08],[74.35,21.55],
          [74.22,22.00],[73.60,22.05],[73.32,21.95],[73.28,21.42],[73.35,21.05]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "mumbai", name: "Mumbai", region: "konkan" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.78,18.88],[73.00,18.85],[73.05,19.10],[72.98,19.25],
          [72.80,19.22],[72.72,19.05],[72.78,18.88]]]
      }
    },
    {
      type: "Feature",
      properties: { id: "mumbaisuburban", name: "Mumbai Suburban", region: "konkan" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.78,19.08],[73.05,19.05],[73.12,19.35],[73.00,19.55],
          [72.82,19.52],[72.72,19.35],[72.78,19.08]]]
      }
    }
  ]
};

/* District centroids used for fallback markers and zoom targets */
window.MH_CENTROIDS = {
  nashik:         { lat: 20.00, lng: 73.79, name: "Nashik" },
  pune:           { lat: 18.52, lng: 73.86, name: "Pune" },
  nagpur:         { lat: 21.15, lng: 79.09, name: "Nagpur" },
  thane:          { lat: 19.22, lng: 73.15, name: "Thane" },
  amravati:       { lat: 20.93, lng: 77.75, name: "Amravati" },
  sambhajinagar:  { lat: 19.88, lng: 75.34, name: "Sambhajinagar" },
  latur:          { lat: 18.40, lng: 76.56, name: "Latur" },
  kolhapur:       { lat: 16.70, lng: 74.23, name: "Kolhapur" },
  solapur:        { lat: 17.68, lng: 75.90, name: "Solapur" },
  ahmednagar:     { lat: 19.09, lng: 74.74, name: "Ahmednagar" },
  jalgaon:        { lat: 21.00, lng: 75.56, name: "Jalgaon" },
  buldhana:       { lat: 20.53, lng: 76.18, name: "Buldhana" },
  wardha:         { lat: 20.75, lng: 78.60, name: "Wardha" },
  chandrapur:     { lat: 19.96, lng: 79.30, name: "Chandrapur" },
  gadchiroli:     { lat: 20.18, lng: 80.00, name: "Gadchiroli" },
  bhandara:       { lat: 21.17, lng: 79.65, name: "Bhandara" },
  gondiya:        { lat: 21.46, lng: 80.19, name: "Gondiya" },
  yavatmal:       { lat: 20.39, lng: 78.12, name: "Yavatmal" },
  washim:         { lat: 20.11, lng: 77.13, name: "Washim" },
  akola:          { lat: 20.71, lng: 77.00, name: "Akola" },
  nanded:         { lat: 19.15, lng: 77.32, name: "Nanded" },
  parbhani:       { lat: 19.27, lng: 76.78, name: "Parbhani" },
  hingoli:        { lat: 19.72, lng: 77.15, name: "Hingoli" },
  jalna:          { lat: 19.84, lng: 75.88, name: "Jalna" },
  beed:           { lat: 18.99, lng: 75.76, name: "Beed" },
  osmanabad:      { lat: 18.18, lng: 76.04, name: "Dharashiv" },
  satara:         { lat: 17.69, lng: 74.00, name: "Satara" },
  sangli:         { lat: 16.86, lng: 74.57, name: "Sangli" },
  raigad:         { lat: 18.52, lng: 73.17, name: "Raigad" },
  ratnagiri:      { lat: 16.99, lng: 73.31, name: "Ratnagiri" },
  sindhudurg:     { lat: 16.35, lng: 73.74, name: "Sindhudurg" },
  dhule:          { lat: 20.90, lng: 74.78, name: "Dhule" },
  nandurbar:      { lat: 21.37, lng: 74.24, name: "Nandurbar" },
  mumbai:         { lat: 19.07, lng: 72.87, name: "Mumbai" },
  mumbaisuburban: { lat: 19.18, lng: 72.96, name: "Mumbai Suburban" }
};

/* ============================================================
   Bhowanee — Dindori Cadastral Revenue Map Data
   High-fidelity revenue survey/gat land parcels, water nala,
   village cart road, gaothan settlement, talav and hissa boundaries.
   ============================================================ */
window.DINDORI_CADASTRAL = {
  center: [20.1600, 74.0100],
  defaultZoom: 16,
  minZoom: 14,
  maxZoom: 19,
  villageName: "Pimpalgaon Baswant",
  taluka: "Niphad",
  district: "Nashik",

  road: {
    name: "Cart Track / Road",
    coords: [
      [20.1588, 74.0040], [20.1586, 74.0075], [20.1581, 74.0114], [20.1575, 74.0140], [20.1566, 74.0180],
      [20.1560, 74.0180], [20.1568, 74.0140], [20.1573, 74.0114], [20.1578, 74.0075], [20.1581, 74.0040]
    ],
    labelCoords: [20.1579, 74.0055]
  },

  stream: {
    name: "Water Stream (Nala)",
    coords: [
      [20.1625, 74.0035], [20.1615, 74.0055], [20.1602, 74.0073], [20.1587, 74.0078],
      [20.1576, 74.0082], [20.1560, 74.0090], [20.1545, 74.0102], [20.1528, 74.0115],
      [20.1524, 74.0124], [20.1540, 74.0112], [20.1558, 74.0099], [20.1574, 74.0090],
      [20.1585, 74.0086], [20.1600, 74.0080], [20.1612, 74.0062], [20.1622, 74.0042]
    ],
    labelCoords: [20.1595, 74.0076]
  },

  settlement: {
    name: "Village Settlement",
    coords: [
      [20.1576, 74.0042], [20.1573, 74.0070], [20.1545, 74.0064], [20.1548, 74.0040]
    ],
    labelCoords: [20.1562, 74.0052]
  },

  pond: {
    name: "Farm Pond",
    coords: [
      [20.1580, 74.0136], [20.1579, 74.0149], [20.1571, 74.0147], [20.1572, 74.0134]
    ],
    labelCoords: [20.1576, 74.0141]
  },

  parcels: [
    {
      gat: "125",
      aliasGats: ["118"],
      contractId: "c1",
      farmer: "Prakash Sonawane",
      crop: "Onion",
      stage: "bids",
      area: 2.4,
      unit: "Acres",
      hissa: "1",
      soil: "Medium Black Soil",
      water: "Nala Canal + Borewell",
      status: "Active Contract",
      coords: [
        [20.1587, 74.0078], [20.1581, 74.0114], [20.1604, 74.0125], [20.1610, 74.0085]
      ],
      centroid: [20.1596, 74.0100],
      sublines: [
        [[20.1584, 74.0096], [20.1607, 74.0105]]
      ]
    },
    {
      gat: "124",
      farmer: "Vithal Bhor",
      crop: "Grapes",
      stage: "harvest",
      area: 2.8,
      unit: "Acres",
      hissa: "1/A",
      soil: "Sandy Loam",
      water: "Drip Irrigation",
      coords: [
        [20.1590, 74.0040], [20.1587, 74.0072], [20.1612, 74.0068], [20.1615, 74.0040]
      ],
      centroid: [20.1601, 74.0055]
    },
    {
      gat: "122",
      farmer: "Sunita Shinde",
      crop: "Pomegranate",
      stage: "growing",
      area: 3.1,
      unit: "Acres",
      hissa: "2",
      soil: "Red Clay Loam",
      water: "Farm Pond",
      coords: [
        [20.1615, 74.0040], [20.1612, 74.0068], [20.1640, 74.0064], [20.1642, 74.0040]
      ],
      centroid: [20.1627, 74.0052]
    },
    {
      gat: "123",
      aliasGats: ["147"],
      contractId: "c2",
      farmer: "Sushila Ahire",
      crop: "Onion",
      stage: "harvest",
      area: 1.8,
      unit: "Acres",
      hissa: "1",
      soil: "Clay Loam",
      water: "Open Well",
      status: "Active Contract",
      coords: [
        [20.1612, 74.0068], [20.1608, 74.0108], [20.1645, 74.0104], [20.1640, 74.0064]
      ],
      centroid: [20.1626, 74.0086],
      sublines: [
        [[20.1625, 74.0066], [20.1622, 74.0106]]
      ]
    },
    {
      gat: "126",
      farmer: "Eknath Khairnar",
      crop: "Sugarcane",
      stage: "growing",
      area: 1.4,
      unit: "Acres",
      hissa: "1",
      soil: "Deep Black",
      water: "Canal Lift",
      coords: [
        [20.1608, 74.0108], [20.1606, 74.0118], [20.1647, 74.0114], [20.1645, 74.0104]
      ],
      centroid: [20.1627, 74.0111],
      sublines: [
        [[20.1607, 74.0113], [20.1646, 74.0109]]
      ]
    },
    {
      gat: "127",
      farmer: "Popat More",
      crop: "Wheat",
      stage: "growing",
      area: 1.6,
      unit: "Acres",
      hissa: "1",
      soil: "Alluvial Loam",
      water: "Borewell",
      coords: [
        [20.1606, 74.0118], [20.1604, 74.0128], [20.1645, 74.0124], [20.1647, 74.0114]
      ],
      centroid: [20.1625, 74.0121],
      sublines: [
        [[20.1605, 74.0123], [20.1646, 74.0119]]
      ]
    },
    {
      gat: "128",
      aliasGats: ["212"],
      contractId: "c3",
      farmer: "Raju Patil",
      crop: "Tomato",
      stage: "growing",
      area: 1.2,
      unit: "Acres",
      hissa: "2/B",
      soil: "Fertile Loam",
      water: "Drip",
      status: "Active Contract",
      coords: [
        [20.1628, 74.0128], [20.1624, 74.0165], [20.1655, 74.0160], [20.1645, 74.0124]
      ],
      centroid: [20.1638, 74.0144]
    },
    {
      gat: "129",
      aliasGats: ["289"],
      contractId: "c4",
      farmer: "Meena Bhosale",
      crop: "Soybean",
      stage: "growing",
      area: 3.0,
      unit: "Acres",
      hissa: "1",
      soil: "Black Cotton",
      water: "Rainfed + Well",
      status: "Active Contract",
      coords: [
        [20.1602, 74.0128], [20.1598, 74.0168], [20.1624, 74.0165], [20.1628, 74.0128]
      ],
      centroid: [20.1613, 74.0148],
      sublines: [
        [[20.1613, 74.0128], [20.1611, 74.0167]]
      ]
    },
    {
      gat: "131",
      farmer: "Ashok Deshmukh",
      crop: "Vegetables",
      stage: "notsown",
      area: 0.9,
      unit: "Acres",
      hissa: "1",
      soil: "Medium Loam",
      water: "Well",
      coords: [
        [20.1581, 74.0114], [20.1579, 74.0128], [20.1602, 74.0128], [20.1604, 74.0125]
      ],
      centroid: [20.1591, 74.0122]
    },
    {
      gat: "135",
      farmer: "Krishi Talav & Bagayat",
      crop: "Chilli & Orchard",
      stage: "growing",
      area: 3.5,
      unit: "Acres",
      hissa: "1",
      soil: "Black Loam",
      water: "Farm Pond + Lift",
      coords: [
        [20.1579, 74.0128], [20.1572, 74.0165], [20.1598, 74.0168], [20.1602, 74.0128]
      ],
      centroid: [20.1588, 74.0146],
      sublines: [
        [[20.1575, 74.0146], [20.1600, 74.0148]]
      ]
    },
    {
      gat: "136",
      farmer: "Ramkrishna Bagul",
      crop: "Wheat",
      stage: "harvest",
      area: 1.8,
      unit: "Acres",
      hissa: "1",
      soil: "Medium",
      water: "Well",
      coords: [
        [20.1572, 74.0165], [20.1567, 74.0185], [20.1615, 74.0185], [20.1598, 74.0168]
      ],
      centroid: [20.1591, 74.0176]
    },
    {
      gat: "5_XX_1",
      farmer: "Govt Common Pasture / Gairan",
      crop: "Grassland",
      stage: "closed",
      area: 5.2,
      unit: "Acres",
      hissa: "Govt",
      soil: "Rocky Shallow",
      water: "Natural Drainage",
      coords: [
        [20.1640, 74.0060], [20.1645, 74.0100], [20.1660, 74.0098], [20.1655, 74.0058]
      ],
      centroid: [20.1651, 74.0079]
    },
    {
      gat: "4",
      farmer: "Forest & Orchard Zone",
      crop: "Mango / Teak",
      stage: "closed",
      area: 4.5,
      unit: "Acres",
      hissa: "1",
      soil: "Lateritic",
      water: "Rainfed",
      coords: [
        [20.1646, 74.0120], [20.1655, 74.0165], [20.1670, 74.0160], [20.1662, 74.0115]
      ],
      centroid: [20.1658, 74.0140]
    },
    {
      gat: "68",
      farmer: "Suresh Gangurde",
      crop: "Maize",
      stage: "growing",
      area: 2.5,
      unit: "Acres",
      hissa: "2",
      soil: "Medium Black",
      water: "Borewell",
      coords: [
        [20.1555, 74.0040], [20.1552, 74.0075], [20.1578, 74.0076], [20.1581, 74.0040]
      ],
      centroid: [20.1566, 74.0058]
    },
    {
      gat: "66",
      aliasGats: ["332"],
      contractId: "c5",
      farmer: "Dnyaneshwar Jadhav",
      crop: "Onion",
      stage: "issue",
      area: 2.0,
      unit: "Acres",
      hissa: "1/A",
      soil: "Heavy Black",
      water: "Nala Seepage",
      status: "Active Contract",
      coords: [
        [20.1550, 74.0080], [20.1548, 74.0115], [20.1573, 74.0114], [20.1578, 74.0078]
      ],
      centroid: [20.1562, 74.0096],
      sublines: [
        [[20.1562, 74.0080], [20.1560, 74.0115]]
      ]
    },
    {
      gat: "48",
      farmer: "Ramdas Gaikwad",
      crop: "Fallow / Pulses",
      stage: "notsown",
      area: 1.1,
      unit: "Acres",
      hissa: "1",
      soil: "Medium",
      water: "Rainfed",
      coords: [
        [20.1562, 74.0115], [20.1560, 74.0126], [20.1574, 74.0125], [20.1575, 74.0115]
      ],
      centroid: [20.1568, 74.0120]
    },
    {
      gat: "49",
      farmer: "Bhaskar Dhatrak",
      crop: "Soybean",
      stage: "growing",
      area: 2.0,
      unit: "Acres",
      hissa: "1",
      soil: "Medium Black",
      water: "Nala Canal",
      coords: [
        [20.1530, 74.0085], [20.1528, 74.0118], [20.1548, 74.0115], [20.1550, 74.0080]
      ],
      centroid: [20.1539, 74.0100]
    },
    {
      gat: "47",
      aliasGats: ["401"],
      contractId: "c6",
      farmer: "Savita Gaikwad",
      crop: "Pulses",
      stage: "notsown",
      area: 1.5,
      unit: "Acres",
      hissa: "1",
      soil: "Light Reddish Loam",
      water: "Rainfed",
      status: "Active Contract",
      coords: [
        [20.1528, 74.0118], [20.1525, 74.0160], [20.1560, 74.0155], [20.1562, 74.0115]
      ],
      centroid: [20.1544, 74.0138]
    },
    {
      gat: "121",
      farmer: "Govind Khairnar",
      crop: "Grapes",
      stage: "growing",
      area: 2.2,
      unit: "Acres",
      hissa: "1",
      soil: "Red Clay Loam",
      water: "Drip",
      coords: [
        [20.1642, 74.0040], [20.1640, 74.0064], [20.1668, 74.0062], [20.1670, 74.0038]
      ],
      centroid: [20.1655, 74.0051]
    },
    {
      gat: "120/B",
      farmer: "Kailas Pawar",
      crop: "Guava",
      stage: "growing",
      area: 1.9,
      unit: "Acres",
      hissa: "B",
      soil: "Medium Loam",
      water: "Well",
      coords: [
        [20.1615, 74.0008], [20.1615, 74.0040], [20.1642, 74.0040], [20.1644, 74.0008]
      ],
      centroid: [20.1629, 74.0024]
    },
    {
      gat: "134",
      farmer: "Shantaram Jagtap",
      crop: "Tomato",
      stage: "harvest",
      area: 2.1,
      unit: "Acres",
      hissa: "1",
      soil: "Black Loam",
      water: "Open Well",
      coords: [
        [20.1558, 74.0128], [20.1553, 74.0162], [20.1572, 74.0165], [20.1579, 74.0128]
      ],
      centroid: [20.1566, 74.0145]
    },
    {
      gat: "133",
      farmer: "Babu Shinde",
      crop: "Onion",
      stage: "growing",
      area: 1.7,
      unit: "Acres",
      hissa: "1",
      soil: "Clay Loam",
      water: "Nala Canal",
      coords: [
        [20.1558, 74.0102], [20.1558, 74.0128], [20.1579, 74.0128], [20.1576, 74.0102]
      ],
      centroid: [20.1568, 74.0115]
    },
    {
      gat: "146",
      farmer: "Pandurang More",
      crop: "Bajra",
      stage: "notsown",
      area: 1.4,
      unit: "Acres",
      hissa: "1",
      soil: "Light Sandy",
      water: "Rainfed",
      coords: [
        [20.1553, 74.0162], [20.1546, 74.0185], [20.1565, 74.0185], [20.1572, 74.0165]
      ],
      centroid: [20.1559, 74.0173]
    },
    {
      gat: "103",
      farmer: "Dattu Wagh",
      crop: "Soybean",
      stage: "growing",
      area: 2.6,
      unit: "Acres",
      hissa: "1",
      soil: "Black Cotton",
      water: "Borewell",
      coords: [
        [20.1518, 74.0130], [20.1515, 74.0170], [20.1545, 74.0168], [20.1548, 74.0130]
      ],
      centroid: [20.1531, 74.0150]
    }
  ],
  locality: {
    name: "Navalihala",
    coords: [20.1546, 74.0185]
  }
};
