/* global React */
(function () {
const { useState, useEffect, useRef, useMemo } = React;
const { FSA_DATA, UDE_SERIES, BRACE_SERIES, DEPOTS, riskColor, riskClass, sparkFor } = window.KARDASHEV_DATA;

// ─────────────────────────────────────────────────────────────────
// Top Bar
// ─────────────────────────────────────────────────────────────────
function TopBar({ persona, onPersona, etaSeconds }) {
  const hh = String(Math.floor(etaSeconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((etaSeconds % 3600) / 60)).padStart(2, "0");
  const ss = String(etaSeconds % 60).padStart(2, "0");
  return (
    <div className="flex items-center justify-between px-6 border-b hairline" style={{ borderBottomWidth: 1 }}>
      <div className="flex items-center gap-3">
        <span className="k2013" aria-hidden>
          <i/><i className="off"/><i/>
          <i className="off"/><i/><i className="off"/>
          <i/><i className="off"/><i/>
        </span>
        <span className="serif" style={{ fontSize: 22, lineHeight: 1 }}>Kardashev</span>
        <span className="mono caps" style={{ fontSize: 10, color: "var(--ink-muted)" }}>· Operations Dashboard</span>
      </div>
      <div className="flex items-center gap-4 mono caps" style={{ fontSize: 11 }}>
        <button onClick={() => onPersona("operations")} className={persona === "operations" ? "persona-active" : ""} style={{ color: persona === "operations" ? "var(--ink)" : "var(--ink-muted)" }}>Operations</button>
        <span style={{ color: "var(--rule-strong)" }}>·</span>
        <button onClick={() => onPersona("emergency")} className={persona === "emergency" ? "persona-active" : ""} style={{ color: persona === "emergency" ? "var(--ink)" : "var(--ink-muted)" }}>Emergency</button>
        <span style={{ color: "var(--rule-strong)" }}>·</span>
        <button onClick={() => onPersona("homeowner")} className={persona === "homeowner" ? "persona-active" : ""} style={{ color: persona === "homeowner" ? "var(--ink)" : "var(--ink-muted)" }}>Homeowner <span style={{ color: "var(--cyan)" }}>→ Finale</span></button>
        <span style={{ color: "var(--rule)" }}>|</span>
        <span className="flex items-center gap-2">
          <span className="blink" style={{ width: 8, height: 8, background: "var(--amber)", display: "inline-block" }}/>
          <span>Storm Watch · T-{hh}:{mm}:<span className="tnum">{ss}</span></span>
        </span>
        <span style={{ color: "var(--rule)" }}>|</span>
        <button style={{ width: 22, height: 22, border: "1px solid var(--rule-strong)", color: "var(--ink-soft)", fontSize: 11 }}>?</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Storm Summary Strip (5 indicator cards)
// ─────────────────────────────────────────────────────────────────
function IndicatorCard({ label, value, unit, sub, accent, onClick, last }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 text-left px-6 py-4 row-hover"
      style={{ borderRight: last ? "none" : "1px solid var(--rule)", background: "transparent" }}
    >
      <div className="mono caps" style={{ fontSize: 9.5, color: "var(--ink-muted)" }}>{label}</div>
      <div className="flex items-baseline gap-1 mt-2 tnum mono" style={{ color: accent || "var(--ink)" }}>
        <span style={{ fontSize: 34, lineHeight: 1, fontWeight: 500, letterSpacing: "-0.02em" }}>{value}</span>
        {unit && <span style={{ fontSize: 16, color: accent || "var(--ink-soft)" }}>{unit}</span>}
      </div>
      <div className="mt-1" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{sub}</div>
    </button>
  );
}

function StormStrip({ persona, onJump }) {
  const indicators = [
    { label: "Storm Confidence", value: "87", unit: "%", sub: "ECCC ensemble agreement", key: "confidence" },
    { label: "FSAs at Extreme Risk", value: "4", unit: "", sub: "of 247 in service area", key: "fsas" },
    { label: "Customers Exposed", value: "184", unit: "K", sub: "within risk envelope", key: "customers" },
    { label: persona === "emergency" ? "Welfare Hubs Ready" : "Crews Available", value: persona === "emergency" ? "8" : "12", unit: "", sub: persona === "emergency" ? "23 hub-capable sites" : "47 forecast required", key: "crews" },
    { label: "Mutual-aid Gap", value: "+35", unit: "", sub: "request lead time 12 h", key: "gap", accent: "var(--burnt)" },
  ];
  return (
    <div className="flex items-stretch border-b hairline" style={{ background: "var(--canvas)" }}>
      {indicators.map((it, i) => (
        <IndicatorCard key={it.key} {...it} last={i === indicators.length - 1} onClick={() => onJump(it.key)} />
      ))}
    </div>
  );
}

// Export
window.TopBar = TopBar;
window.StormStrip = StormStrip;
})();
