/* global React */
(function () {
const { useState: useS_, useEffect: useE_ } = React;

// ─────────────────────────────────────────────────────────────────
// Chat surface — top half of right rail
// ─────────────────────────────────────────────────────────────────
function Chat({ persona, agentTask, onSuggest }) {
  const [draft, setDraft] = useS_("");

  const suggestions = persona === "emergency"
    ? ["Who needs welfare checks?", "Activate warming hubs", "Notify dialysis patients"]
    : persona === "homeowner"
    ? ["Will my heat stay on?", "Best time to top up EV?", "Shed schedule for tonight"]
    : ["Why L4Y first?", "Draft a crew plan for top 4", "Notify vulnerable in L4Z"];

  return (
    <div className="flex flex-col" style={{ background: "var(--canvas)", height: "100%", overflow: "hidden" }}>
      {/* header */}
      <div className="flex items-start justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--rule)" }}>
        <div className="flex items-start gap-3">
          <span style={{ width: 26, height: 26, background: "var(--cyan-soft)", border: "1px solid var(--cyan)", color: "var(--cyan)", display: "inline-grid", placeItems: "center", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 16 }}>K</span>
          <div>
            <div className="flex items-baseline gap-2">
              <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 15 }}>Kardashev</span>
              <span style={{ width: 6, height: 6, background: "var(--cyan)", borderRadius: 0, display: "inline-block" }}/>
            </div>
            <div className="mono caps" style={{ fontSize: 9.5, color: "var(--ink-muted)", letterSpacing: "0.12em", marginTop: 2 }}>
              Coordinator · 5 specialists ready
            </div>
          </div>
        </div>
        <button className="mono caps" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.1em" }}>↻ Reset</button>
      </div>

      {/* agent state-render strip */}
      <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--rule)", background: "var(--paper)" }}>
        <AgentStrip task={agentTask}/>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-auto thin-scroll px-4 py-4" style={{ minHeight: 0 }}>
        {/* user msg */}
        <div className="flex justify-end mb-3">
          <div className="px-3 py-2" style={{ maxWidth: "85%", background: "var(--paper)", border: "1px solid var(--rule)", fontSize: 12.5, lineHeight: 1.45 }}>
            Which FSAs need crews staged tonight?
          </div>
        </div>
        {/* agent msg */}
        <div className="flex mb-3">
          <div className="pl-3" style={{ maxWidth: "92%", borderLeft: "2px solid var(--cyan)" }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink)" }}>
              Four FSAs cross the <span className="mono tnum">0.55</span> staging threshold in the next 24 h —
              <span className="mono"> L4Y, L4Z, L5A, L5B</span> in Alectra's Vaughan / Mississauga corridor.
              ForecastAgent re-composed the UDE per-FSA against the live ECCC freezing-rain front;
              the composed model now matches the Wanik 2017 baseline within ±0.06 on held-out storms,
              with sharpest disagreement on L4Y (high canopy × old feeder grid).
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="mono caps" style={{ fontSize: 9, padding: "3px 6px", background: "var(--cyan-soft)", color: "var(--cyan)", letterSpacing: "0.12em" }}>
                ↳ rank_fsas
              </span>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.06em" }}>
                ForecastAgent · 1.4 s
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--cyan)" }}>✓</span>
            </div>
          </div>
        </div>
        {/* user follow-up */}
        <div className="flex justify-end mb-3">
          <div className="px-3 py-2" style={{ maxWidth: "85%", background: "var(--paper)", border: "1px solid var(--rule)", fontSize: 12.5, lineHeight: 1.45 }}>
            Compose the UDE for L4Y and explain the residual.
          </div>
        </div>
        <div className="flex mb-2">
          <div className="pl-3" style={{ maxWidth: "92%", borderLeft: "2px solid var(--cyan)" }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.55 }}>
              Composed. The known terms cover wind-driven mechanical stress and feeder density;
              the learned residual <span className="mono">N<sub>θ</sub></span> picks up the
              canopy × ice-accretion interaction we couldn't analytically derive.
              Inference ran in <span className="mono tnum">47 ms</span> — see the Brief panel below.
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="mono caps" style={{ fontSize: 9, padding: "3px 6px", background: "var(--cyan-soft)", color: "var(--cyan)", letterSpacing: "0.12em" }}>↳ compose_ude</span>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-muted)" }}>ForecastAgent · 0.7 s</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--cyan)" }}>✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* input + suggestions */}
      <div className="px-4 py-3" style={{ borderTop: "1px solid var(--rule)", background: "var(--paper)" }}>
        <div className="flex items-center gap-2" style={{ background: "var(--canvas)", border: "1px solid var(--rule-strong)" }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Ask Kardashev…"
            className="flex-1 px-3 py-2 outline-none"
            style={{ background: "transparent", fontFamily: "inherit", fontSize: 12.5, border: "none" }}
          />
          <button className="mono caps px-3" style={{ fontSize: 10, color: "var(--cyan)", borderLeft: "1px solid var(--rule-strong)", height: 32, letterSpacing: "0.12em" }}>↵ Send</button>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {suggestions.map(s => (
            <button key={s} className="prompt-chip" onClick={() => onSuggest(s)}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// agent state render: shows multi-agent orchestration line
function AgentStrip({ task }) {
  const [phase, setPhase] = useS_(0);
  useE_(() => {
    if (!task) return;
    setPhase(0);
    const ids = [];
    task.phases.forEach((_, i) => {
      ids.push(setTimeout(() => setPhase(i + 1), 700 * (i + 1)));
    });
    return () => ids.forEach(clearTimeout);
  }, [task]);

  if (!task) {
    return (
      <div className="flex items-center gap-2 mono" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.08em" }}>
        <span style={{ width: 6, height: 6, background: "var(--cyan)" }}/>
        Coordinator · idle · awaiting prompt
      </div>
    );
  }
  const done = phase >= task.phases.length;
  return (
    <div className="flex items-center gap-2 mono" style={{ fontSize: 10, letterSpacing: "0.06em" }}>
      <span className={done ? "" : "blink"} style={{ width: 6, height: 6, background: done ? "var(--cyan)" : "var(--burnt)" }}/>
      <span style={{ color: "var(--ink-soft)" }}>
        Coordinator → {task.phases.map((p, i) => (
          <span key={i} style={{ color: i < phase ? "var(--cyan)" : i === phase ? "var(--burnt)" : "var(--ink-muted)" }}>
            {p}{i < task.phases.length - 1 ? " · " : ""}
          </span>
        ))} {done && <span style={{ color: "var(--cyan)" }}>✓</span>}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Bottom ranked FSA table
// ─────────────────────────────────────────────────────────────────
const { FSA_DATA: F3, riskColor: rcT } = window.KARDASHEV_DATA;

function BottomTable({ persona, selected, onPick }) {
  const opsColumns = ["FSA", "RISK", "CUSTOMERS", "VULNERABLE", "CANOPY", "DWELLING AGE", "DEPOT", "RECOMMENDATION"];
  const emergencyColumns = ["FSA", "RISK", "VULNERABLE", "MEDICAL EQUIP", "WELFARE HUBS", "RECOMMENDATION"];

  const cols = persona === "emergency" ? emergencyColumns : opsColumns;
  const rows = [...F3].sort((a,b) => b.risk - a.risk);

  return (
    <div style={{ borderTop: "1px solid var(--rule)", background: "var(--canvas)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div className="flex items-center justify-between px-5 py-2.5" style={{ borderBottom: "1px solid var(--rule)" }}>
        <div className="flex items-center gap-3">
          <span className="mono caps" style={{ fontSize: 10, letterSpacing: "0.14em" }}>Ranked FSAs</span>
          <span className="mono caps" style={{ fontSize: 9, color: "var(--ink-muted)", letterSpacing: "0.12em" }}>
            8 of 247 · sorted by RISK ↓
          </span>
        </div>
        <div className="flex items-center gap-3 mono caps" style={{ fontSize: 9, color: "var(--ink-muted)", letterSpacing: "0.12em" }}>
          <span>Lens · {persona}</span>
          <button style={{ border: "1px solid var(--rule)", padding: "3px 8px" }}>⌕ Filter</button>
          <button style={{ border: "1px solid var(--rule)", padding: "3px 8px" }}>↓ Export</button>
        </div>
      </div>
      <div className="overflow-auto thin-scroll" style={{ flex: 1 }}>
        <table className="ranked">
          <thead>
            <tr>
              {cols.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(fsa => (
              <tr key={fsa.code} onClick={() => onPick(fsa.code)} className={selected === fsa.code ? "selected" : ""}>
                <td className="mono" style={{ fontWeight: 500, letterSpacing: "0.04em" }}>
                  <div className="flex items-baseline gap-2">
                    <span>{fsa.code}</span>
                    <span style={{ color: "var(--ink-muted)", fontSize: 10.5, fontFamily: "Geist", letterSpacing: 0 }}>{fsa.name}</span>
                  </div>
                </td>
                <td>
                  <span className="mono tnum inline-flex items-center gap-2" style={{
                    fontSize: 11.5, padding: "2px 8px",
                    background: "rgba(0,0,0,0)",
                    border: `1px solid ${rcT(fsa.risk)}`,
                    color: rcT(fsa.risk),
                  }}>
                    <span style={{ width: 6, height: 6, background: rcT(fsa.risk) }}/>
                    {fsa.risk.toFixed(2)}
                  </span>
                </td>
                {persona !== "emergency" && <td className="mono tnum">{fsa.customers.toLocaleString()}</td>}
                <td className="mono tnum">{fsa.vulnerable.toLocaleString()}</td>
                {persona !== "emergency" && <td className="mono tnum">{fsa.canopy} %</td>}
                {persona !== "emergency" && <td className="mono tnum">{fsa.dwellingAge}</td>}
                {persona === "emergency" && <td className="mono tnum">{Math.round(fsa.vulnerable * 0.06)}</td>}
                {persona === "emergency" && <td className="mono tnum">{fsa.depot === "C" ? 2 : 3}</td>}
                {persona !== "emergency" && <td className="mono caps" style={{ fontSize: 10, letterSpacing: "0.1em" }}>{fsa.depot === "—" ? "—" : `DEPOT ${fsa.depot}`}</td>}
                <td style={{ color: "var(--ink-soft)" }}>{fsa.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-2 mono caps" style={{ borderTop: "1px solid var(--rule)", fontSize: 8.5, color: "var(--ink-muted)", letterSpacing: "0.14em" }}>
        Sources · ECCC MSC GeoMet · StatCan 2021 · Toronto UTC 2018 · Hydro One outage history (Wanik 2017 form · synthetic baseline)
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Schedule UDE training modal
// ─────────────────────────────────────────────────────────────────
function ScheduleModal({ open, onClose }) {
  const [fsa, setFsa] = useS_("M5V");
  const [queued, setQueued] = useS_(false);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, background: "var(--canvas)", border: "1px solid var(--rule-strong)", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--rule)" }}>
          <div>
            <div className="mono caps" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.14em" }}>Schedule UDE Training</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 20, marginTop: 2 }}>queue a region for offline training</div>
          </div>
          <button onClick={onClose} className="mono" style={{ fontSize: 16, color: "var(--ink-muted)" }}>×</button>
        </div>
        <div className="px-5 py-4">
          {!queued ? (
            <>
              <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--ink-soft)" }}>
                Training a new UDE takes <span className="mono">30–45 min</span> on a single A100 GPU and is not live in this demo. We'll queue the job, run it against StatCan + ECCC + historical outage data, and notify you when weights are ready for inference.
              </p>
              <div className="mt-4">
                <label className="mono caps block" style={{ fontSize: 9.5, color: "var(--ink-muted)", letterSpacing: "0.12em", marginBottom: 6 }}>FSA</label>
                <select value={fsa} onChange={e => setFsa(e.target.value)} className="mono w-full" style={{ background: "var(--paper)", border: "1px solid var(--rule-strong)", padding: "8px 10px", fontSize: 12, letterSpacing: "0.04em" }}>
                  {["M5V (Downtown TO)", "M4C (East York)", "L6T (Brampton)", "N2J (Waterloo)", "K1A (Ottawa)", "P3A (Sudbury)"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="mt-4 mono caps" style={{ fontSize: 9.5, color: "var(--ink-muted)", letterSpacing: "0.12em" }}>Estimated cost</div>
              <div className="mono tnum mt-1" style={{ fontSize: 13 }}>1 × A100 · 38 min · $4.20 compute · 0 carbon (renewable)</div>
              <div className="flex gap-2 mt-5 justify-end">
                <button className="btn ghost" onClick={onClose}>Cancel</button>
                <button className="btn cyan" onClick={() => setQueued(true)}>Queue training job →</button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, lineHeight: 1.55 }}>
              <div className="flex items-center gap-2 mono" style={{ color: "var(--cyan)" }}>
                <span style={{ width: 18, height: 18, background: "var(--cyan)", color: "#fff", display: "inline-grid", placeItems: "center", fontSize: 10 }}>✓</span>
                Queued · job ID UDE-TRN-2025-0328-001
              </div>
              <p className="mt-3" style={{ color: "var(--ink-soft)" }}>
                You'll receive a notification when weights are ready. Inference will be available in <span className="mono">~38 minutes</span>.
              </p>
              <div className="flex justify-end mt-4">
                <button className="btn ghost" onClick={onClose}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.Chat = Chat;
window.BottomTable = BottomTable;
window.ScheduleModal = ScheduleModal;
})();
