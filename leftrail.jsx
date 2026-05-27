/* global React */
(function () {
function LeftRail({ persona, tHours, setTHours, layers, setLayers, replay, onReplay }) {
  const wind = Math.round(28 + Math.max(0, (1 - Math.abs(tHours + 12) / 60)) * 56);
  const ice  = (3 + Math.max(0, (1 - Math.abs(tHours + 12) / 60)) * 28).toFixed(1);
  const pres = Math.round(1010 - Math.max(0, (1 - Math.abs(tHours + 12) / 60)) * 28);

  const TICKS = [-72, -48, -24, -18, -12, -6, 0];

  return (
    <div className="flex flex-col" style={{ borderRight: "1px solid var(--rule)", background: "var(--canvas)", overflow: "auto" }}>
      {/* TIMELINE */}
      <section className="px-5 py-5" style={{ borderBottom: "1px solid var(--rule)" }}>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="mono caps" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.12em" }}>Timeline</h3>
          <span className="mono tnum" style={{ fontSize: 11, color: "var(--burnt)" }}>
            T{tHours >= 0 ? "+" : ""}{tHours}h
          </span>
        </div>

        <input
          type="range"
          min={-72} max={0} step={1}
          value={tHours}
          onChange={e => setTHours(parseInt(e.target.value, 10))}
          className="slider"
        />
        <div className="flex justify-between mono tnum mt-2" style={{ fontSize: 9, color: "var(--ink-muted)" }}>
          {TICKS.map(t => <span key={t}>{t}</span>)}
        </div>

        <div className="mt-5 mono tnum" style={{ fontSize: 11 }}>
          <Reading label="Wind"     value={`${wind} km/h`}   arrow="↗"  warn={wind > 60} />
          <Reading label="Ice Load" value={`${ice} mm`}      arrow=""    warn={parseFloat(ice) > 4} note={parseFloat(ice) > 4 ? `${(parseFloat(ice)/4).toFixed(1)}× warning threshold` : null}/>
          <Reading label="Pressure" value={`${pres} hPa`}    arrow="↘"  warn={pres < 995} />
        </div>
      </section>

      {/* MAP LAYERS */}
      <section className="px-5 py-5" style={{ borderBottom: "1px solid var(--rule)" }}>
        <h3 className="mono caps mb-3" style={{ fontSize: 10, color: "var(--ink-muted)", letterSpacing: "0.12em" }}>Map Layers</h3>
        <div className="flex flex-col gap-2">
          <Chip on={layers.outage}   onClick={() => setLayers(l => ({ ...l, outage: !l.outage }))}   label="Outage Risk"    sub="choropleth"/>
          <Chip on={layers.cone}     onClick={() => setLayers(l => ({ ...l, cone:   !l.cone   }))}   label="Storm Cone"     sub="ECCC Velocity"/>
          <Chip on={layers.canopy}   onClick={() => setLayers(l => ({ ...l, canopy: !l.canopy }))}   label="Tree Canopy"    sub="LIDAR 2018"/>
          <Chip on={layers.assets}   onClick={() => setLayers(l => ({ ...l, assets: !l.assets }))}   label="Asset Density"  sub="feeders"/>
          <Chip on={layers.history}  onClick={() => setLayers(l => ({ ...l, history:!l.history}))}   label="Historical Outages" sub="2018–2024"/>
          <Chip on={layers.welfare}  onClick={() => persona === "emergency" && setLayers(l => ({ ...l, welfare: !l.welfare }))} label="Welfare Hubs"   sub="Emergency only" disabled={persona !== "emergency"}/>
        </div>
      </section>

      {/* REPLAY CTA */}
      <section className="px-5 py-5">
        <button
          onClick={onReplay}
          className="w-full text-left"
          style={{
            border: "1px solid var(--burnt)",
            background: replay ? "var(--burnt-soft)" : "transparent",
            color: "var(--burnt)",
            padding: "16px 14px",
            cursor: "pointer",
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{
              width: 22, height: 22, border: "1px solid var(--burnt)",
              display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9,
            }}>
              {replay ? "■" : "▶"}
            </span>
            <span className="mono caps" style={{ fontSize: 11, letterSpacing: "0.1em" }}>
              {replay ? "Replaying…" : "Replay Mar 28 2025"}
            </span>
          </div>
          <div className="mono mt-2 pl-9" style={{ fontSize: 10, color: "var(--burnt)", opacity: 0.8, letterSpacing: "0.06em" }}>
            12 fps · 180 s · ECCC ground truth
          </div>
        </button>

        {/* footer mini-attribution */}
        <div className="mono caps mt-5" style={{ fontSize: 8.5, color: "var(--ink-muted)", letterSpacing: "0.14em", lineHeight: 1.6 }}>
          Service Territory · 247 FSAs<br/>
          LDC · Alectra + Hydro One<br/>
          Forecast Engine · UDE v0.4.2
        </div>
      </section>
    </div>
  );
}

function Reading({ label, value, arrow, warn, note }) {
  return (
    <div className="flex flex-col mb-3">
      <div className="flex items-center justify-between">
        <span className="mono caps" style={{ fontSize: 9, color: "var(--ink-muted)", letterSpacing: "0.14em" }}>{label}</span>
        <span className="flex items-center gap-2 tnum" style={{ color: warn ? "var(--burnt)" : "var(--ink)" }}>
          <span>{value}</span>
          {arrow && <span style={{ fontSize: 12 }}>{arrow}</span>}
        </span>
      </div>
      {note && <div className="mono" style={{ fontSize: 9, color: "var(--burnt)", marginTop: 2, letterSpacing: "0.04em" }}>{note}</div>}
    </div>
  );
}

function Chip({ on, label, sub, onClick, disabled }) {
  return (
    <button onClick={onClick} className={"chip" + (on ? " on" : "") + (disabled ? " disabled" : "")}>
      <span className="dot"/>
      <span className="flex-1 text-left">
        <span className="caps-tight" style={{ fontSize: 10.5, fontWeight: 500 }}>{label}</span>
        <span className="block mono" style={{ fontSize: 9, color: "var(--ink-muted)", marginTop: 1, letterSpacing: "0.06em" }}>{sub}</span>
      </span>
    </button>
  );
}

window.LeftRail = LeftRail;
})();
