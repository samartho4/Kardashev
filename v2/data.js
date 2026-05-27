// Kardashev v4 — real Leaflet tiles · Mar 28-31 2025 Ontario ice storm

window.K2_DATA = (function () {

  // Regions with REAL lat/lon and approximate polygon outlines (lat,lng pairs)
  // Polygons hand-drawn from Statistics Canada FSA boundaries (simplified).
  const REGIONS = [
    { id: "MUSK", name: "District of Muskoka",   utility: "Hydro One",     center: [45.04, -79.31], ice: 28, peakOut: 42000, currentOut: 18500, poles: 410, soe: true,  warming: 3, vulnerable: 6800,  customers: 56000,  centroid: "Bracebridge",   bounds: [[44.85,-79.65],[45.35,-78.95]],
      polygon: [[44.94,-79.65],[45.27,-79.55],[45.36,-79.18],[45.24,-78.95],[44.95,-79.00],[44.85,-79.42]] },
    { id: "HALI", name: "Haliburton Highlands",  utility: "Hydro One",     center: [45.04, -78.54], ice: 30, peakOut: 26000, currentOut: 14200, poles: 285, soe: false, warming: 2, vulnerable: 3200,  customers: 31000,  centroid: "Haliburton",
      polygon: [[44.85,-78.95],[45.30,-78.85],[45.32,-78.25],[45.05,-78.05],[44.80,-78.30],[44.78,-78.75]] },
    { id: "ORIL", name: "Orillia & Oro-Medonte", utility: "Hydro One",     center: [44.61, -79.42], ice: 19, peakOut: 31000, currentOut: 12800, poles: 248, soe: true,  warming: 4, vulnerable: 5400,  customers: 44000,  centroid: "Orillia",
      polygon: [[44.50,-79.65],[44.74,-79.62],[44.78,-79.30],[44.65,-79.15],[44.45,-79.20],[44.42,-79.50]] },
    { id: "KAWL", name: "City of Kawartha Lakes",utility: "Hydro One",     center: [44.36, -78.74], ice: 25, peakOut: 38000, currentOut: 17200, poles: 360, soe: true,  warming: 5, vulnerable: 6900,  customers: 54000,  centroid: "Lindsay",
      polygon: [[44.18,-79.05],[44.55,-79.00],[44.65,-78.60],[44.50,-78.30],[44.20,-78.32],[44.10,-78.75]] },
    { id: "PETB", name: "Peterborough County",   utility: "Hydro One",     center: [44.31, -78.32], ice: 20, peakOut: 44000, currentOut: 19800, poles: 420, soe: true,  warming: 6, vulnerable: 7600,  customers: 62000,  centroid: "Peterborough",
      polygon: [[44.14,-78.62],[44.50,-78.55],[44.62,-78.10],[44.45,-77.78],[44.18,-77.85],[44.08,-78.30]] },
    { id: "BANC", name: "Bancroft",              utility: "Hydro One",     center: [45.05, -77.86], ice: 22, peakOut: 22000, currentOut: 11000, poles: 240, soe: false, warming: 1, vulnerable: 3100,  customers: 24000,  centroid: "Bancroft",
      polygon: [[44.85,-78.20],[45.25,-78.15],[45.32,-77.60],[45.18,-77.30],[44.85,-77.35],[44.78,-77.85]] },
    { id: "BARR", name: "Barrie & Innisfil",     utility: "Alectra",       center: [44.39, -79.69], ice: 15, peakOut: 44000, currentOut: 18000, poles: 180, soe: false, warming: 2, vulnerable: 6200,  customers: 78000,  centroid: "Barrie",
      polygon: [[44.25,-79.92],[44.50,-79.92],[44.52,-79.45],[44.42,-79.40],[44.20,-79.45],[44.18,-79.78]] },
    { id: "VAUG", name: "Vaughan & Richmond Hill", utility: "Alectra",     center: [43.84, -79.51], ice: 6,  peakOut: 12000, currentOut: 2400,  poles: 35,  soe: false, warming: 1, vulnerable: 4100,  customers: 145000, centroid: "Vaughan",
      polygon: [[43.78,-79.68],[43.92,-79.68],[43.94,-79.36],[43.88,-79.32],[43.76,-79.36],[43.73,-79.58]] },
    { id: "MISS", name: "Mississauga & Brampton", utility: "Alectra",      center: [43.59, -79.64], ice: 4,  peakOut: 4500,  currentOut: 800,   poles: 12,  soe: false, warming: 0, vulnerable: 6800,  customers: 280000, centroid: "Mississauga",
      polygon: [[43.50,-79.85],[43.73,-79.82],[43.78,-79.50],[43.65,-79.45],[43.48,-79.48],[43.43,-79.70]] },
    { id: "TOR",  name: "City of Toronto",       utility: "Toronto Hydro", center: [43.70, -79.38], ice: 4,  peakOut: 1200,  currentOut: 0,     poles: 4,   soe: false, warming: 0, vulnerable: 24000, customers: 770000, centroid: "Toronto",
      polygon: [[43.58,-79.55],[43.82,-79.50],[43.84,-79.20],[43.74,-79.12],[43.60,-79.18],[43.56,-79.42]] },
    { id: "KING", name: "Kingston & Belleville", utility: "Hydro One",     center: [44.23, -76.49], ice: 18, peakOut: 80000, currentOut: 32000, poles: 320, soe: false, warming: 3, vulnerable: 9200,  customers: 110000, centroid: "Kingston",
      polygon: [[44.05,-77.20],[44.45,-77.10],[44.50,-76.20],[44.32,-75.95],[44.05,-76.00],[43.95,-76.78]] },
    { id: "OTTA", name: "Ottawa & Outaouais",    utility: "Hydro Ottawa",  center: [45.42, -75.70], ice: 8,  peakOut: 5400,  currentOut: 100,   poles: 18,  soe: false, warming: 1, vulnerable: 18000, customers: 360000, centroid: "Ottawa",
      polygon: [[45.25,-76.05],[45.55,-76.00],[45.58,-75.35],[45.45,-75.10],[45.25,-75.20],[45.18,-75.78]] },
  ];

  // Storm timeline (real progression)
  const TIMELINE = [
    { t: "Fri Mar 28 · 19:00", h: 0,   label: "Freezing rain begins · ECCC warnings active",                            totalOut: 4200,   peakIce: 2  },
    { t: "Fri Mar 28 · 23:00", h: 4,   label: "First feeder trips · Muskoka, Haliburton",                                totalOut: 28000,  peakIce: 6  },
    { t: "Sat Mar 29 · 04:00", h: 9,   label: "Outages cascade into Orillia, Kawarthas",                                 totalOut: 92000,  peakIce: 11 },
    { t: "Sat Mar 29 · 10:00", h: 15,  label: "Barrie Alectra peak · 44k out",                                            totalOut: 174000, peakIce: 14 },
    { t: "Sat Mar 29 · 18:00", h: 23,  label: "100K+ across Hydro One territory · ECCC upgrades warnings",                totalOut: 248000, peakIce: 18 },
    { t: "Sun Mar 30 · 02:00", h: 31,  label: "Peak ice in Lindsay (25 mm) · trees down on highways",                     totalOut: 348000, peakIce: 23 },
    { t: "Sun Mar 30 · 09:00", h: 38,  label: "States of emergency: Peterborough, Orillia, Muskoka, Oro-Medonte, Brock", totalOut: 401000, peakIce: 25 },
    { t: "Sun Mar 30 · 17:00", h: 46,  label: "Mutual aid arrives from 30 utility partners",                              totalOut: 374000, peakIce: 25 },
    { t: "Mon Mar 31 · 06:00", h: 59,  label: "Second freezing-rain band approaches",                                     totalOut: 312000, peakIce: 25 },
    { t: "Mon Mar 31 · 18:00", h: 71,  label: "Hydro One: 280K still out · pole count exceeds 2,700",                     totalOut: 284000, peakIce: 25 },
    { t: "Tue Apr 01 · 12:00", h: 89,  label: "Restoration accelerates · helicopter access blocked at Fenelon Falls",     totalOut: 168000, peakIce: 25 },
    { t: "Wed Apr 02 · 12:00", h: 113, label: "Second wave of freezing rain hits · re-outages in Orillia",                totalOut: 92000,  peakIce: 25 },
  ];

  function timeFactor(h) {
    if (h <= 0)   return 0.01;
    if (h <= 38)  return Math.pow(h / 38, 1.6);
    if (h <= 113) return Math.max(0.05, 1 - (h - 38) / 90);
    return 0.05;
  }
  function regionOutAt(r, h)  { return Math.round(r.peakOut * timeFactor(h)); }
  function regionIceAt(r, h)  { return +(r.ice * Math.min(1, h / 31)).toFixed(1); }

  // ECCC freezing-rain warning polygons — lat/lng arrays
  const WARNINGS = [
    { id: "watch", label: "Special Weather Statement",
      polygon: [[43.2,-80.5],[46.0,-80.0],[46.0,-75.0],[43.0,-75.5]],
      color: "#D9993C", fill: "rgba(217, 153, 60, 0.10)" },
    { id: "warning", label: "Freezing Rain Warning · ≥10mm",
      polygon: [[43.5,-80.2],[45.8,-79.8],[45.8,-75.5],[43.4,-76.0]],
      color: "#D9682E", fill: "rgba(217, 104, 46, 0.16)" },
    { id: "extreme", label: "Extreme Ice Accretion · ≥20mm",
      polygon: [[43.95,-79.85],[45.45,-79.55],[45.45,-77.40],[43.95,-77.65]],
      color: "#A82A1A", fill: "rgba(168, 42, 26, 0.22)" },
  ];

  const INITIAL_LAYERS = [
    { id: "boundaries",  group: "Reference",    name: "LDC Service Areas",        on: true,  kind: "boundary",   swatch: "#566976" },
    { id: "labels",      group: "Reference",    name: "Place Labels",              on: true,  kind: "labels",     swatch: "#9099A6" },
    { id: "feeders",     group: "Network",      name: "Distribution Feeders",      on: false, kind: "feeders",    swatch: "#7BC8B8" },
    { id: "substations", group: "Network",      name: "Substations",               on: false, kind: "substations",swatch: "#7BC8B8" },
  ];

  const AGENT_ADDABLE_LAYERS = {
    risk: {
      id: "risk", group: "Operations", name: "Outage Density · live", kind: "risk-choropleth",
      gradient: ["#2E7D5B", "#C99A2E", "#D9682E", "#A82A1A"], byAgent: true, on: true,
    },
    iceAccretion: {
      id: "iceAccretion", group: "Weather", name: "Ice Accretion · ECCC isobands", kind: "ice-isoband",
      gradient: ["#D9E8FF", "#84B8FF", "#3777E6", "#1B3FB0"], byAgent: true, on: true,
    },
    warnings: {
      id: "warnings", group: "Weather", name: "ECCC Freezing-Rain Warnings", kind: "warnings",
      swatch: "#C8542C", byAgent: true, on: true,
    },
    poles: {
      id: "poles", group: "Damage", name: "Broken Poles · 2,700+", kind: "poles",
      swatch: "#A82A1A", byAgent: true, on: true,
    },
    warming: {
      id: "warming", group: "Response", name: "Warming Centres", kind: "warming",
      swatch: "#3A8A82", byAgent: true, on: true,
    },
    soe: {
      id: "soe", group: "Response", name: "States of Emergency", kind: "soe",
      swatch: "#A82A1A", byAgent: true, on: true,
    },
    vulnerable: {
      id: "vulnerable", group: "Demographics", name: "Vulnerable Households · StatCan", kind: "vulnerable",
      swatch: "#5B47E0", byAgent: true, on: true,
    },
    mutualAid: {
      id: "mutualAid", group: "Response", name: "Mutual Aid Crews · 30 utilities", kind: "mutual-aid",
      swatch: "#3A8A82", byAgent: true, on: true,
    },
    outageHistory: {
      id: "outageHistory", group: "Operations", name: "OMS · Open Outages (clustered)", kind: "outage-points",
      swatch: "#D9682E", byAgent: true, on: true,
    },
    customers: {
      id: "customers", group: "Operations", name: "Customers Without Power · bubbles", kind: "customers-bubble",
      swatch: "#D9682E", byAgent: true, on: true,
    },
    canopy: {
      id: "canopy", group: "Environment", name: "Tree Canopy · LIDAR 2018", kind: "canopy",
      swatch: "#2E7D5B", byAgent: true, on: true,
    },
  };

  // Bookmarks — real lat/lon and zoom levels
  const BOOKMARKS = [
    { id: "all",      label: "Southern + Central Ontario", center: [44.5,  -78.5], zoom: 7 },
    { id: "corridor", label: "Hardest-Hit Corridor",        center: [44.7,  -78.5], zoom: 8 },
    { id: "barrie",   label: "Barrie · Alectra peak",        center: [44.39, -79.69], zoom: 11 },
    { id: "peter",    label: "Peterborough County",          center: [44.31, -78.32], zoom: 10 },
    { id: "kawartha", label: "Kawartha Lakes · 25 mm ice",   center: [44.36, -78.74], zoom: 10 },
    { id: "muskoka",  label: "Muskoka & Haliburton",         center: [45.04, -78.93], zoom: 9 },
    { id: "easton",   label: "Eastern Ontario",              center: [44.7,  -76.0],  zoom: 8 },
    { id: "gta",      label: "GTA · mostly spared",          center: [43.72, -79.40], zoom: 10 },
    { id: "lindsay",  label: "Lindsay · 25 mm peak",          center: [44.36, -78.74], zoom: 12 },
    { id: "orillia",  label: "Orillia · State of Emergency",  center: [44.61, -79.42], zoom: 12 },
  ];

  // Real tile providers, no API key required
  const BASEMAPS = [
    { id: "dark",    label: "Dark Gray Canvas",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '© <a href="https://carto.com/attributions">CARTO</a> · © OpenStreetMap',
      subdomains: "abcd", maxZoom: 19, textOnDark: true },
    { id: "light",   label: "Light Gray Canvas",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: '© <a href="https://carto.com/attributions">CARTO</a> · © OpenStreetMap',
      subdomains: "abcd", maxZoom: 19, textOnDark: false },
    { id: "topo",    label: "Topographic",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles © Esri — World Topo Map", maxZoom: 19, textOnDark: false },
    { id: "imagery", label: "Imagery",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles © Esri — Sources: Esri, Maxar, Earthstar Geographics",
      maxZoom: 19, textOnDark: true },
  ];

  function riskColor(r) {
    if (r >= 0.75) return "#A82A1A";
    if (r >= 0.55) return "#D9682E";
    if (r >= 0.40) return "#C99A2E";
    return "#2E7D5B";
  }
  function outageColor(out, peak) {
    return riskColor(peak > 0 ? out / peak : 0);
  }
  function iceColor(mm) {
    if (mm >= 22) return "#1B3FB0";
    if (mm >= 15) return "#3777E6";
    if (mm >= 8)  return "#84B8FF";
    if (mm >= 2)  return "#D9E8FF";
    return "#F2F4F8";
  }

  return {
    REGIONS, TIMELINE, WARNINGS, INITIAL_LAYERS, AGENT_ADDABLE_LAYERS,
    BOOKMARKS, BASEMAPS,
    timeFactor, regionOutAt, regionIceAt, riskColor, outageColor, iceColor,
  };
})();
