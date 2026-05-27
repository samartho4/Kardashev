/* global window */
// Static mock data for Kardashev operations dashboard

const FSA_DATA = [
  // Alectra cluster (south GTA)
  { code: "L4Y", name: "Vaughan",        risk: 0.81, customers: 12400, vulnerable: 2187, canopy: 38, dwellingAge: 1978, depot: "A", utility: "Alectra",   recommendation: "Stage 4 crews · 14:00 today", x: 360, y: 360, polygon: "M295,330 L385,318 L420,360 L405,410 L330,418 L290,378 Z" },
  { code: "L4Z", name: "Maple",          risk: 0.73, customers: 11200, vulnerable: 1842, canopy: 41, dwellingAge: 1982, depot: "A", utility: "Alectra",   recommendation: "Stage 2 crews · notify vulnerable", x: 320, y: 300, polygon: "M250,260 L335,250 L385,280 L385,318 L295,330 L240,310 Z" },
  { code: "L5A", name: "Mississauga E",  risk: 0.69, customers: 14800, vulnerable: 2960, canopy: 28, dwellingAge: 1971, depot: "B", utility: "Alectra",   recommendation: "Stage 3 crews · 14:00 today", x: 250, y: 410, polygon: "M195,388 L270,378 L290,418 L275,460 L210,470 L172,432 Z" },
  { code: "L5B", name: "Mississauga W",  risk: 0.61, customers: 13100, vulnerable: 2102, canopy: 31, dwellingAge: 1968, depot: "B", utility: "Alectra",   recommendation: "Pre-position 2 crews", x: 180, y: 470, polygon: "M125,442 L195,438 L210,470 L195,512 L135,520 L105,488 Z" },
  // Hydro One cluster (north, Lake Simcoe)
  { code: "K9H", name: "Peterborough",   risk: 0.52, customers: 6800,  vulnerable: 1156, canopy: 52, dwellingAge: 1965, depot: "C", utility: "Hydro One", recommendation: "Stage 3 crews · 16:00", x: 595, y: 175, polygon: "M540,150 L620,142 L650,170 L640,210 L575,218 L530,190 Z" },
  { code: "L3V", name: "Orillia",        risk: 0.48, customers: 5200,  vulnerable:  884, canopy: 47, dwellingAge: 1969, depot: "C", utility: "Hydro One", recommendation: "Monitor · 1 crew on standby", x: 425, y: 170, polygon: "M375,145 L460,142 L478,178 L455,210 L395,212 L362,180 Z" },
  { code: "L4N", name: "Barrie",         risk: 0.41, customers: 8400,  vulnerable: 1428, canopy: 35, dwellingAge: 1975, depot: "C", utility: "Hydro One", recommendation: "Monitor", x: 340, y: 215, polygon: "M280,195 L365,188 L390,222 L370,258 L300,260 L270,228 Z" },
  { code: "L9V", name: "Stayner",        risk: 0.34, customers: 3100,  vulnerable:  527, canopy: 58, dwellingAge: 1958, depot: "C", utility: "Hydro One", recommendation: "—", x: 215, y: 235, polygon: "M165,212 L240,208 L260,238 L242,275 L188,278 L150,248 Z" },
];

// risk class color mapping
function riskColor(risk) {
  if (risk >= 0.75) return "var(--grid-4)";
  if (risk >= 0.55) return "var(--grid-3)";
  if (risk >= 0.40) return "var(--grid-2)";
  return "var(--grid-1)";
}
function riskClass(risk) {
  if (risk >= 0.75) return "EXTREME";
  if (risk >= 0.55) return "HIGH";
  if (risk >= 0.40) return "ELEVATED";
  return "MODERATE";
}

// 72h synthetic UDE forecast for L4Y vs Wanik baseline
const UDE_SERIES = (() => {
  const arr = [];
  for (let t = -72; t <= 0; t += 3) {
    const stormProx = Math.max(0, 1 - Math.abs(t + 12) / 60);
    const ude = 0.04 + 0.78 * Math.pow(stormProx, 2.1) + (t === 0 ? 0.04 : 0);
    const wanik = 0.05 + 0.58 * Math.pow(stormProx, 1.7);
    const lo = Math.max(0, ude - 0.08 - 0.04 * stormProx);
    const hi = Math.min(1, ude + 0.07 + 0.04 * stormProx);
    arr.push({ t, ude: +ude.toFixed(3), wanik: +wanik.toFixed(3), lo: +lo.toFixed(3), hi: +hi.toFixed(3) });
  }
  return arr;
})();

// risk sparkline per FSA (rising)
function sparkFor(risk) {
  const arr = [];
  for (let i = 0; i < 24; i++) {
    const p = i / 23;
    const v = Math.max(0.05, risk * Math.pow(p, 1.6) + 0.05 * Math.sin(i * 0.7));
    arr.push(+v.toFixed(3));
  }
  return arr;
}

// indoor temperature during outage (Brace teaser)
const BRACE_SERIES = (() => {
  const arr = [];
  for (let h = 0; h <= 36; h++) {
    const outside = -8 - Math.sin(h / 6) * 3;
    // naive: drops fast
    const naive = Math.max(outside + 1, 21 - h * 0.85);
    // shed EV (keeps hp longer)
    const shedEv = Math.max(outside + 1, 21 - h * 0.55);
    // shed HP (use small backup heat)
    const shedHp = Math.max(outside + 1, 21 - h * 0.40);
    // shed both
    const shedBoth = Math.max(outside + 2, 21 - h * 0.18);
    arr.push({ h, naive: +naive.toFixed(1), shedEv: +shedEv.toFixed(1), shedHp: +shedHp.toFixed(1), shedBoth: +shedBoth.toFixed(1) });
  }
  return arr;
})();

const DEPOTS = [
  { id: "A", label: "DEPOT A", x: 405, y: 348, region: "Vaughan / L4Y" },
  { id: "B", label: "DEPOT B", x: 235, y: 432, region: "Mississauga / L5A" },
  { id: "C", label: "DEPOT C", x: 540, y: 188, region: "Peterborough / K9H" },
];

window.KARDASHEV_DATA = { FSA_DATA, UDE_SERIES, BRACE_SERIES, DEPOTS, riskColor, riskClass, sparkFor };
