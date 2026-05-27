/* global React, Recharts */
(function () {
const { useState: useState_b, useEffect: useEffect_b, useMemo: useMemo_b } = React;
const {
  LineChart, Line, Area, AreaChart, XAxis, YAxis, ReferenceLine, Tooltip,
  CartesianGrid, ResponsiveContainer, ComposedChart
} = window.Recharts;

const { UDE_SERIES, BRACE_SERIES, FSA_DATA: F2, riskColor: rcB, sparkFor } = window.KARDASHEV_DATA;

// ─────────────────────────────────────────────────────────────────
// Brief panel header
// ─────────────────────────────────────────────────────────────────
function BriefHeader({ active, onPick }) {
  const tabs = [
    { id: "ude",    label: "UDE" },
    { id: "rank",   label: "Forecast" },
    { id: "plan",   label: "Crew Plan" },
    { id: "comms",  label: "Comms" },
    { id: "trace",  label: "Trace" },
  ];
  return (
    <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid var(--rule)", background: "var(--canvas)" }}>
      <div className="flex items-center gap-3">
        <span className="mono caps" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.14em" }}>Brief</span>
        <div className="flex items-center gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => onPick(t.id)}
              className="mono caps"
              style={{
                fontSize: 9.5,
                letterSpacing: "0.1em",
                color: active === t.id ? "var(--ink)" : "var(--ink-muted)",
                borderBottom: active === t.id ? "1.5px solid var(--burnt)" : "1.5px solid transparent",
                paddingBottom: 2,
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mono" style={{ fontSize: 11, color: "var(--ink-muted)" }}>
        <button title="Open" style={{ width: 22, height: 22, border: "1px solid var(--rule)" }}>↗</button>
        <button title="Copy" style={{ width: 22, height: 22, border: "1px solid var(--rule)" }}>⎘</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tool card shell with lifecycle accent
// ─────────────────────────────────────────────────────────────────
function ToolCard({ title, subtitle, agent, lifecycle, children }) {
  // lifecycle: 'inProgress' | 'executing' | 'complete'
  const isPulse = lifecycle === "inProgress";
  const isExec = lifecycle === "executing";
  const isComplete = lifecycle === "complete";

  return (
    <div className="relative" style={{ background: "var(--canvas)" }}>
      {/* left accent bar */}
      <div
        className={"absolute top-0 bottom-0 left-0 " + (isPulse ? "pulse-bar" : "")}
        style={{ width: 2, background: "var(--burnt)" }}
      />
      {/* marching ants top border if executing */}
      {isExec && <div className="march-ants" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />}
      <div className={"pl-5 pr-4 py-4 " + (isComplete ? "shimmer" : "")} style={{ position: "relative" }}>
        <div className="flex items-baseline justify-between">
          <h4 className="mono caps" style={{ fontSize: 10.5, letterSpacing: "0.14em" }}>{title}</h4>
          {agent && <span className="mono caps" style={{ fontSize: 9, color: "var(--cyan)", letterSpacing: "0.12em" }}>{agent} ✓</span>}
        </div>
        {subtitle && <div className="mt-1" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{subtitle}</div>}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 1. UDEComposition card
// ─────────────────────────────────────────────────────────────────
function UDECard({ selectedFSA, onSchedule }) {
  const [showSR3, setShowSR3] = useState_b(false);

  return (
    <ToolCard
      title={`UDE · Outage Rate Model · ${selectedFSA.code}`}
      subtitle={`Composed by ForecastAgent · inference 47 ms · ${selectedFSA.name}`}
      agent="ForecastAgent"
      lifecycle="complete"
    >
      <div className="eq-block">
        <div className="mono tnum" style={{ fontSize: 13, lineHeight: 1.4, color: "var(--ink)" }}>
          <span style={{ color: "var(--ink-soft)" }}>dO(t)/dt</span> &nbsp;=&nbsp;
          β<sub>w</sub>·W(t) &nbsp;+&nbsp;
          β<sub>c</sub>·C(x) &nbsp;+&nbsp;
          <span style={{ color: "var(--cyan)" }}>N<sub>θ</sub>(W,C,A,t)</span> &nbsp;−&nbsp;
          γ·O(t)
        </div>
        <div className="mono mt-2" style={{ fontSize: 9.5, color: "var(--ink-muted)", letterSpacing: "0.08em" }}>
          └─KNOWN──┘&nbsp;&nbsp;└─KNOWN─┘&nbsp;&nbsp;&nbsp;└──LEARNED RESIDUAL──┘&nbsp;&nbsp;└KNOWN┘
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1" style={{ fontSize: 11 }}>
        <div className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, background: "var(--burnt)" }}/>
          <span className="caps mono" style={{ fontSize: 9.5, color: "var(--ink-muted)", letterSpacing: "0.1em" }}>Known Physics</span>
          <span style={{ color: "var(--ink-soft)" }}>· ECCC freezing-rain accretion + StatCan feeder density</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ width: 8, height: 8, background: "var(--cyan)" }}/>
          <span className="caps mono" style={{ fontSize: 9.5, color: "var(--ink-muted)", letterSpacing: "0.1em" }}>Learned Residual</span>
          <span style={{ color: "var(--ink-soft)" }}>· 4 200 FSA-storm pairs · Ontario 2018–2024</span>
        </div>
      </div>

      {/* Recharts */}
      <div className="mt-3" style={{ height: 130, background: "var(--paper)", border: "1px solid var(--rule)", padding: "8px 6px 0 6px" }}>
        <ResponsiveContainer>
          <ComposedChart data={UDE_SERIES} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="t" tickFormatter={(v) => `${v}h`} tick={{ fill: "var(--ink-muted)", fontSize: 9, fontFamily: "Geist Mono" }} stroke="var(--rule-strong)"/>
            <YAxis domain={[0, 1]} tick={{ fill: "var(--ink-muted)", fontSize: 9, fontFamily: "Geist Mono" }} stroke="var(--rule-strong)" tickFormatter={v => v.toFixed(1)}/>
            <Area dataKey="hi" stroke="none" fill="var(--cyan)" fillOpacity={0.08}/>
            <Area dataKey="lo" stroke="none" fill="var(--canvas)" fillOpacity={1}/>
            <Line type="monotone" dataKey="wanik" stroke="var(--ink-muted)" strokeDasharray="3 3" strokeWidth={1.2} dot={false}/>
            <Line type="monotone" dataKey="ude"   stroke="var(--cyan)" strokeWidth={1.8} dot={false}/>
            <ReferenceLine x={-12} stroke="var(--burnt)" strokeDasharray="2 2" label={{ value: "PEAK", position: "top", fill: "var(--burnt)", fontSize: 9, fontFamily: "Geist Mono" }}/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-3 mt-2 mono" style={{ fontSize: 9, color: "var(--ink-muted)", letterSpacing: "0.1em" }}>
        <span className="flex items-center gap-1.5"><span style={{ width: 14, height: 1.5, background: "var(--cyan)" }}/>UDE</span>
        <span className="flex items-center gap-1.5"><span style={{ width: 14, height: 0, borderTop: "1.5px dashed var(--ink-muted)" }}/>WANIK 2017</span>
        <span className="flex items-center gap-1.5"><span style={{ width: 14, height: 8, background: "var(--cyan)", opacity: 0.15 }}/>95 % CI</span>
      </div>

      {showSR3 && (
        <div className="mt-3 eq-block" style={{ borderColor: "var(--cyan)" }}>
          <div className="mono caps" style={{ fontSize: 9, color: "var(--cyan)", letterSpacing: "0.14em", marginBottom: 6 }}>Symbolic Recovery · SR3</div>
          <div className="mono tnum" style={{ fontSize: 12 }}>
            N<sub>θ</sub> ≈ 0.42·C·W² + 0.08·C²
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-soft)", marginTop: 4 }}>
            R² = 0.91 · matches Wanik 2017 within ±0.08 · tested on 14 held-out storms
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button className="btn primary">↻ Re-run inference</button>
        <button className="btn ghost" onClick={() => setShowSR3(s => !s)}>
          {showSR3 ? "Hide" : "Show"} learned form
        </button>
        <button className="btn cyan" onClick={onSchedule}>⤴ Schedule new FSA</button>
      </div>
    </ToolCard>
  );
}

// ─────────────────────────────────────────────────────────────────
// 2. RankedFSAs card
// ─────────────────────────────────────────────────────────────────
function Sparkline({ values, color }) {
  const W = 60, H = 22;
  const max = Math.max(...values);
  const path = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={W} height={H}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

function RankedCard({ onPick }) {
  const top = [...F2].sort((a,b) => b.risk - a.risk).slice(0, 5);
  return (
    <ToolCard title="Forecast · Top FSAs · Next 72 h" agent="ForecastAgent" lifecycle="complete">
      <div className="flex flex-col">
        {top.map((fsa, i) => (
          <div key={fsa.code} className="flex items-center gap-3 py-2.5" style={{ borderBottom: i < top.length - 1 ? "1px solid var(--rule)" : "none" }}>
            <span style={{ width: 3, alignSelf: "stretch", background: rcB(fsa.risk) }}/>
            <span className="mono" style={{ fontSize: 12, width: 44, letterSpacing: "0.04em" }}>{fsa.code}</span>
            <Sparkline values={sparkFor(fsa.risk)} color={rcB(fsa.risk)}/>
            <span className="mono tnum flex-1 text-right" style={{ fontSize: 16, color: "var(--ink)" }}>{fsa.risk.toFixed(2)}</span>
            <button className="mono" onClick={() => onPick(fsa.code)} style={{ fontSize: 14, width: 22, height: 22, border: "1px solid var(--rule-strong)", color: "var(--ink-soft)" }}>→</button>
          </div>
        ))}
      </div>
    </ToolCard>
  );
}

// ─────────────────────────────────────────────────────────────────
// 3. CrewPlan card with renderAndWaitForResponse
// ─────────────────────────────────────────────────────────────────
function PlanCard() {
  const [state, setState] = useState_b("review"); // review | dispatched

  if (state === "dispatched") {
    return (
      <ToolCard title="Crew Pre-Positioning · PlannerAgent" agent="PlannerAgent" lifecycle="complete">
        <div className="flex items-center gap-2 mono" style={{ fontSize: 12, color: "var(--cyan)" }}>
          <span style={{ width: 16, height: 16, background: "var(--cyan)", color: "#fff", display: "inline-grid", placeItems: "center", fontSize: 10 }}>✓</span>
          Dispatched · 10 assignments queued · 1 mutual-aid filed
        </div>
        <div className="mt-3 mono" style={{ fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.04em" }}>
          Workforce IDs ASG-4810 through ASG-4819 · Mutual aid ref TH-MA-2025-0328
        </div>
        <button className="btn ghost mt-3" onClick={() => setState("review")}>← Review plan</button>
      </ToolCard>
    );
  }

  return (
    <ToolCard title="Crew Pre-Positioning · PlannerAgent" agent="PlannerAgent" lifecycle="complete">
      <div className="mono" style={{ fontSize: 11.5, lineHeight: 1.55 }}>
        <PlanLine bold="4 crews → Depot A (L4Y)" detail="12,400 customers · 0.81 risk"/>
        <PlanLine bold="3 crews → Depot B (L5A)" detail="11,200 customers · 0.69 risk"/>
        <PlanLine bold="3 crews → Depot C (K9H)" detail="6,800 customers · 0.52 risk"/>
        <PlanLine bold="Mutual aid · 35 crews from Toronto Hydro" detail="lead 12 h · file by 14:00 today" warn/>
      </div>
      <div className="mt-3 mono" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.06em" }}>
        ↳ Verified vs Workforce roster · 12 internal + 35 requested = 47 crews
      </div>

      {/* renderAndWaitForResponse block */}
      <div className="mt-4 p-3" style={{ border: "1px solid var(--burnt)", background: "var(--burnt-soft)" }}>
        <div className="mono caps" style={{ fontSize: 10, color: "var(--burnt)", letterSpacing: "0.14em" }}>Confirm before dispatch</div>
        <div className="mt-1" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
          This will send <b>10 Workforce assignments</b> and <b>1 mutual-aid request</b>. Irreversible until 14:00 cancellation window.
        </div>
        <div className="flex gap-2 mt-3">
          <button className="btn ghost">Edit plan</button>
          <button className="btn ghost">Cancel</button>
          <button className="btn primary-solid" onClick={() => setState("dispatched")}>Approve →</button>
        </div>
      </div>
    </ToolCard>
  );
}
function PlanLine({ bold, detail, warn }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span style={{ color: "var(--burnt)" }}>›</span>
      <span style={{ color: warn ? "var(--burnt)" : "var(--ink)", fontWeight: 500 }}>{bold}</span>
      <span style={{ color: "var(--ink-muted)" }}>· {detail}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 4. CustomerNotifications card
// ─────────────────────────────────────────────────────────────────
function CommsCard({ targetFSA }) {
  const [state, setState] = useState_b("review");
  if (state === "sent") {
    return (
      <ToolCard title={`Customer Notifications · CommsAgent · ${targetFSA.code}`} agent="CommsAgent" lifecycle="complete">
        <div className="flex items-center gap-2 mono" style={{ fontSize: 12, color: "var(--cyan)" }}>
          <span style={{ width: 16, height: 16, background: "var(--cyan)", color: "#fff", display: "inline-grid", placeItems: "center", fontSize: 10 }}>✓</span>
          Sent to 2,187 households · SMS · 14:02 local
        </div>
      </ToolCard>
    );
  }
  return (
    <ToolCard title={`Customer Notifications · CommsAgent · ${targetFSA.code}`} agent="CommsAgent" lifecycle="complete">
      <div className="mono caps" style={{ fontSize: 9.5, color: "var(--ink-muted)", letterSpacing: "0.12em" }}>Audience</div>
      <div style={{ fontSize: 12, marginTop: 2 }}>Targeting 2,187 vulnerable households · seniors 75+ · electric heat · low-income</div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 2 }}>↳ StatCan 2021 · OEB low-income register · CMHC SHS</div>

      <div className="mt-3 p-3" style={{ background: "var(--paper)", border: "1px solid var(--rule)", fontFamily: "Geist", fontStyle: "italic", fontSize: 12, lineHeight: 1.5 }}>
        <span style={{ color: "var(--ink-muted)" }}>“</span>
        Hydro One alert — your area (L4Z) has elevated outage risk Fri evening to Sat AM. If you depend on electric medical equipment, please call <span className="mono tnum" style={{ fontStyle: "normal" }}>1-888-664-9376</span> to register for priority restoration. Warming hubs: Maple Library, Concord Rec Centre.
        <span style={{ color: "var(--ink-muted)" }}>”</span>
      </div>

      <div className="mt-3 p-3" style={{ border: "1px solid var(--burnt)", background: "var(--burnt-soft)" }}>
        <div className="mono caps" style={{ fontSize: 10, color: "var(--burnt)", letterSpacing: "0.14em" }}>Confirm Send</div>
        <div className="flex gap-2 mt-2">
          <button className="btn ghost">Edit copy</button>
          <button className="btn ghost">Cancel</button>
          <button className="btn primary-solid" onClick={() => setState("sent")}>Send to 2,187 →</button>
        </div>
      </div>
    </ToolCard>
  );
}

// ─────────────────────────────────────────────────────────────────
// 5. UtilityTrace card
// ─────────────────────────────────────────────────────────────────
function TraceCard() {
  return (
    <ToolCard title="Utility Network Trace · TraceAgent · feeder FDR-118" subtitle="Downstream isolation trace · per Utility Network 5.1" agent="TraceAgent" lifecycle="complete">
      <div className="p-3" style={{ background: "var(--paper)", border: "1px solid var(--rule)" }}>
        <svg viewBox="0 0 320 110" width="100%" height="110">
          {/* trunk */}
          <line x1="10" y1="55" x2="310" y2="55" stroke="var(--ink-soft)" strokeWidth="1.2"/>
          {/* branches */}
          <line x1="80"  y1="55" x2="80"  y2="20"  stroke="var(--ink-soft)" strokeWidth="1"/>
          <line x1="80"  y1="20" x2="160" y2="20"  stroke="var(--ink-soft)" strokeWidth="1"/>
          <line x1="140" y1="55" x2="140" y2="90"  stroke="var(--burnt)"   strokeWidth="1.6"/>
          <line x1="140" y1="90" x2="240" y2="90"  stroke="var(--burnt)"   strokeWidth="1.6"/>
          <line x1="220" y1="55" x2="220" y2="22"  stroke="var(--ink-soft)" strokeWidth="1"/>
          {/* nodes */}
          {[40, 120, 200, 280].map(x => <rect key={x} x={x-3} y="52" width="6" height="6" fill="var(--ink)"/>)}
          <rect x="137" y="87" width="6" height="6" fill="var(--burnt)"/>
          <rect x="237" y="87" width="6" height="6" fill="var(--burnt)"/>
          {/* fault */}
          <g transform="translate(190, 90)">
            <circle r="6" fill="var(--burnt)"/>
            <circle r="11" fill="none" stroke="var(--burnt)" strokeWidth="1" opacity="0.4"/>
            <text x="0" y="-12" textAnchor="middle" className="mono" fill="var(--burnt)" fontSize="8" style={{ letterSpacing: "0.12em" }}>FAULT</text>
          </g>
          {/* labels */}
          <text x="10"  y="68" className="mono" fill="var(--ink-muted)" fontSize="8">R-118-A</text>
          <text x="270" y="68" className="mono" fill="var(--ink-muted)" fontSize="8">TIE-117</text>
        </svg>
      </div>
      <div className="mono mt-3" style={{ fontSize: 11.5, lineHeight: 1.6 }}>
        <Row k="Protective devices downstream" v="6"/>
        <Row k="Customers if isolated upstream" v="2,184"/>
        <Row k="Recommended action" v="isolate at R-118-A · restore via tie to FDR-117" wrap/>
      </div>
      <button className="btn ghost mt-3">Open in ArcGIS Pro →</button>
    </ToolCard>
  );
}
function Row({ k, v, wrap }) {
  return (
    <div className="flex items-baseline gap-3 py-1" style={{ borderBottom: "1px dotted var(--rule)" }}>
      <span style={{ color: "var(--ink-muted)", fontSize: 10.5, letterSpacing: "0.06em" }}>{k}</span>
      <span className={"flex-1 tnum" + (wrap ? " text-right" : " text-right")} style={{ color: wrap ? "var(--ink-soft)" : "var(--ink)" }}>{v}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 6. Homeowner teaser
// ─────────────────────────────────────────────────────────────────
function HomeownerCard() {
  return (
    <ToolCard title="Your Home · L4Y 3R5 · Finale Build" subtitle="Physics-grounded indoor temperature during simulated outage" agent="Brace" lifecycle="complete">
      <div style={{ height: 180, background: "var(--paper)", border: "1px solid var(--rule)", padding: "8px 6px 0 6px" }}>
        <ResponsiveContainer>
          <LineChart data={BRACE_SERIES} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--rule)" strokeDasharray="2 4" vertical={false}/>
            <XAxis dataKey="h" tickFormatter={v => `${v}h`} tick={{ fill: "var(--ink-muted)", fontSize: 9, fontFamily: "Geist Mono" }} stroke="var(--rule-strong)"/>
            <YAxis tick={{ fill: "var(--ink-muted)", fontSize: 9, fontFamily: "Geist Mono" }} stroke="var(--rule-strong)" tickFormatter={v => `${v}°`}/>
            <ReferenceLine y={4} stroke="var(--burnt)" strokeDasharray="2 2" label={{ value: "Pipe-freeze risk", fontSize: 9, fill: "var(--burnt)", fontFamily: "Geist Mono", position: "insideBottomLeft" }}/>
            <Line type="monotone" dataKey="naive"    stroke="#8A2F1A"      strokeWidth={1.6} dot={false}/>
            <Line type="monotone" dataKey="shedEv"   stroke="var(--burnt)" strokeWidth={1.6} dot={false}/>
            <Line type="monotone" dataKey="shedHp"   stroke="var(--amber)" strokeWidth={1.6} dot={false}/>
            <Line type="monotone" dataKey="shedBoth" stroke="var(--cyan)"  strokeWidth={1.8} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-2 mono" style={{ fontSize: 9, color: "var(--ink-muted)", letterSpacing: "0.1em" }}>
        <Lg c="#8A2F1A">NAIVE</Lg><Lg c="var(--burnt)">SHED EV</Lg><Lg c="var(--amber)">SHED HP</Lg><Lg c="var(--cyan)">SHED BOTH</Lg>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button className="btn cyan">See full Brace model →</button>
        <span className="mono caps" style={{ fontSize: 9, padding: "3px 6px", background: "var(--cyan-soft)", color: "var(--cyan)", letterSpacing: "0.14em" }}>Finale</span>
      </div>
    </ToolCard>
  );
}
function Lg({ c, children }) {
  return <span className="flex items-center gap-1.5"><span style={{ width: 14, height: 1.5, background: c }}/>{children}</span>;
}

window.BriefHeader = BriefHeader;
window.UDECard = UDECard;
window.RankedCard = RankedCard;
window.PlanCard = PlanCard;
window.CommsCard = CommsCard;
window.TraceCard = TraceCard;
window.HomeownerCard = HomeownerCard;
})();
