/* global React */
(function () {
const { useState, useMemo, useRef, useEffect } = React;
const D = window.K2_DATA;

// ─────────────────────────────────────────────────────────────────
// TOP BAR
// ─────────────────────────────────────────────────────────────────
function TopBar({ onSearch, onToggleLeft, onToggleRight, leftCollapsed, rightCollapsed, onReset }) {
  return (
    <div className="topbar">
      <button className="tb-btn tb-toggle" onClick={onToggleLeft} title={leftCollapsed ? "Expand layers" : "Collapse layers"}>
        <span style={{ fontFamily: "Geist Mono", fontSize: 13 }}>{leftCollapsed ? "›" : "‹"}</span>
      </button>
      <div className="brand">
        <span className="brand-mark">K</span>
        <span>Kardashev</span>
      </div>
      <div className="crumbs">
        <span>Ontario Storm Ops</span>
        <span className="sep">/</span>
        <span style={{ color: "var(--ink-2)" }}>Ice Storm · Mar 28–Apr 2 2025</span>
      </div>
      <div className="tb-search">
        <span style={{ fontSize: 12 }}>⌕</span>
        <span>Search places, assets, layers…</span>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--ink-4)" }}>⌘ K</span>
      </div>
      <div className="tb-buttons">
        <button className="tb-btn" title="Reset the demo to its initial state" onClick={onReset}>
          <span style={{ fontFamily: "Geist Mono", fontSize: 12, marginRight: 4 }}>↻</span>
          Reset demo
        </button>
        <button className="tb-btn" title="Save view">Save view</button>
        <button className="tb-btn" title="Share">Share</button>
        <button className="tb-btn primary">Publish</button>
      </div>
      <button className="tb-btn tb-toggle" onClick={onToggleRight} title={rightCollapsed ? "Open agent" : "Collapse agent"}>
        <span style={{ fontFamily: "Geist Mono", fontSize: 13 }}>{rightCollapsed ? "‹" : "›"}</span>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LEFT — LAYERS TREE + LEGEND + BASEMAP
// ─────────────────────────────────────────────────────────────────
function LayerTree({ layers, toggleLayer, removeLayer, zoomTo, timeHour, totalOut, onCollapse }) {
  const grouped = useMemo(() => {
    const m = {};
    layers.forEach(l => { (m[l.group] ??= []).push(l); });
    return m;
  }, [layers]);

  const groupOrder = ["Reference", "Operations", "Weather", "Network", "Damage", "Response", "Demographics", "Environment"];
  const orderedGroups = Object.entries(grouped).sort(
    ([a], [b]) => (groupOrder.indexOf(a) === -1 ? 99 : groupOrder.indexOf(a))
                - (groupOrder.indexOf(b) === -1 ? 99 : groupOrder.indexOf(b))
  );

  return (
    <div className="layers">
      <div className="panel-header">
        <span className="panel-title">Layers</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="panel-sub">{layers.length} · {layers.filter(l => l.on).length} on</span>
          {onCollapse && (
            <button className="panel-collapse" onClick={onCollapse} title="Collapse">‹</button>
          )}
        </span>
      </div>

      {/* Active scenario card */}
      <div className="scenario">
        <div className="label">Active Event</div>
        <div className="name">Mar 28 – Apr 2 2025 · Ice Storm</div>
        <div className="meta">
          <span><small>Out · live</small><b className="warn">{(totalOut/1000).toFixed(0)} K</b></span>
          <span><small>Regions hit</small><b>11 / 247</b></span>
          <span><small>Emergencies</small><b className="warn">5</b></span>
          <span><small>Poles broken</small><b>2,700+</b></span>
        </div>
      </div>

      <div className="layer-tree thin-scroll">
        {orderedGroups.map(([group, items]) => (
          <div className="layer-group" key={group}>
            <div className="layer-group-head">
              <span className="chev">▼</span>
              <span>{group}</span>
              <span className="count">{items.length}</span>
            </div>
            <div className="layer-items">
              {items.map(l => (
                <div
                  key={l.id}
                  className={"layer-item" + (l.byAgent ? " added-by-agent" : "")}
                  onClick={(e) => { if (e.target.tagName !== "BUTTON") toggleLayer(l.id); }}
                  title={l.name}
                >
                  <span className={"cbx" + (l.on ? " on" : "")}/>
                  {l.gradient
                    ? <span className="swatch" style={{ background: `linear-gradient(90deg, ${l.gradient.join(",")})` }}/>
                    : <span className="swatch" style={{ background: l.swatch }}/>
                  }
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.name}</span>
                  {l.byAgent && (
                    <div className="actions">
                      <button title="Zoom to" onClick={() => zoomTo(l.id)}>⊕</button>
                      <button title="Remove"  onClick={() => removeLayer(l.id)}>×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// LEGEND (over the map)
// ─────────────────────────────────────────────────────────────────
function Legend({ layers }) {
  const showRisk    = layers.find(l => l.id === "risk")?.on;
  const showIce     = layers.find(l => l.id === "iceAccretion")?.on;
  const showWarn    = layers.find(l => l.id === "warnings")?.on;
  if (!showRisk && !showIce && !showWarn) return null;
  return (
    <div className="legend-card">
      <div className="head">
        <span className="ttl">Legend</span>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-4)" }}>auto</span>
      </div>
      <div className="body">
        {showRisk && (
          <div style={{ marginBottom: 8 }}>
            <div className="mono caps" style={{ fontSize: 9, color: "var(--ink-4)", marginBottom: 4, letterSpacing: "0.12em" }}>Customers out</div>
            <div className="legend-row"><span className="swatch" style={{ background: "#2E7D5B" }}/><span className="lab mono tnum">&lt; 25 %</span></div>
            <div className="legend-row"><span className="swatch" style={{ background: "#C99A2E" }}/><span className="lab mono tnum">25 – 50 %</span></div>
            <div className="legend-row"><span className="swatch" style={{ background: "#D9682E" }}/><span className="lab mono tnum">50 – 75 %</span></div>
            <div className="legend-row"><span className="swatch" style={{ background: "#A82A1A" }}/><span className="lab mono tnum">&gt; 75 %</span></div>
          </div>
        )}
        {showIce && (
          <div style={{ marginBottom: 8 }}>
            <div className="mono caps" style={{ fontSize: 9, color: "var(--ink-4)", marginBottom: 4, letterSpacing: "0.12em" }}>Ice accretion</div>
            <div className="legend-row"><span className="swatch" style={{ background: "#D9E8FF" }}/><span className="lab mono tnum">2 – 8 mm</span></div>
            <div className="legend-row"><span className="swatch" style={{ background: "#84B8FF" }}/><span className="lab mono tnum">8 – 15 mm</span></div>
            <div className="legend-row"><span className="swatch" style={{ background: "#3777E6" }}/><span className="lab mono tnum">15 – 22 mm</span></div>
            <div className="legend-row"><span className="swatch" style={{ background: "#1B3FB0" }}/><span className="lab mono tnum">&gt; 22 mm</span></div>
          </div>
        )}
        {showWarn && (
          <div>
            <div className="mono caps" style={{ fontSize: 9, color: "var(--ink-4)", marginBottom: 4, letterSpacing: "0.12em" }}>ECCC warnings</div>
            <div className="legend-row"><span className="swatch" style={{ background: "rgba(217, 153, 60, 0.4)", border: "1px dashed #D9993C" }}/><span className="lab" style={{ fontSize: 11 }}>Statement</span></div>
            <div className="legend-row"><span className="swatch" style={{ background: "rgba(217, 104, 46, 0.4)", border: "1px dashed #D9682E" }}/><span className="lab" style={{ fontSize: 11 }}>Warning</span></div>
            <div className="legend-row"><span className="swatch" style={{ background: "rgba(168, 42, 26, 0.4)", border: "1px dashed #A82A1A" }}/><span className="lab" style={{ fontSize: 11 }}>Extreme</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// BOOKMARKS DROPDOWN (top-left of map)
// ─────────────────────────────────────────────────────────────────
function Bookmarks({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = D.BOOKMARKS.find(b => b.id === value) || D.BOOKMARKS[0];
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    setTimeout(() => window.addEventListener("click", close, { once: true }), 0);
  }, [open]);
  return (
    <div style={{ position: "relative" }}>
      <button className="bookmark-btn" onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}>
        <span style={{ fontSize: 13 }}>⌖</span>
        <span>{cur.label}</span>
        <span style={{ marginLeft: 4, color: "var(--ink-4)", fontSize: 9 }}>▾</span>
      </button>
      {open && (
        <div className="bookmark-dropdown">
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--rule)", fontFamily: "Geist Mono", fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Spatial Bookmarks
          </div>
          {D.BOOKMARKS.map(b => (
            <div key={b.id} className="bookmark-item"
              onClick={() => { onChange(b.id); setOpen(false); }}>
              <span>{b.label}</span>
              <span className="meta">{b.scale.toFixed(2)}×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// BASEMAP GALLERY (bottom-right of map)
// ─────────────────────────────────────────────────────────────────
function BasemapGallery({ value, onChange }) {
  return (
    <div className="basemap-gallery">
      <div className="ttl">Basemap</div>
      {D.BASEMAPS.map(b => (
        <div key={b.id} className={"basemap-tile" + (b.id === value ? " active" : "")} onClick={() => onChange(b.id)}>
          <span className="swatch" style={{
            background: b.id === "topo" ? "linear-gradient(135deg, " + b.bg + ", " + b.land + ")" :
                        b.id === "imagery" ? "linear-gradient(135deg, #1B2A1E, #2B3A2E)" :
                        b.bg,
          }}/>
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TIME SLIDER (along map bottom)
// ─────────────────────────────────────────────────────────────────
function TimeSlider({ hour, setHour, playing, setPlaying }) {
  const minH = 0, maxH = 113;
  const trackRef = useRef(null);
  const cur = D.TIMELINE.reduce((a, b) => Math.abs(b.h - hour) < Math.abs(a.h - hour) ? b : a);
  const pct = ((hour - minH) / (maxH - minH)) * 100;

  function onTrack(e) {
    const rect = trackRef.current.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHour(Math.round(minH + p * (maxH - minH)));
  }
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setHour(h => {
        const next = h + 2;
        if (next > maxH) { setPlaying(false); return maxH; }
        return next;
      });
    }, 280);
    return () => clearInterval(id);
  }, [playing]);

  const ticks = ["Fri 19:00", "Fri 23:00", "Sat 04:00", "Sat 10:00", "Sat 18:00", "Sun 02:00", "Sun 09:00", "Sun 17:00", "Mon 06:00", "Mon 18:00", "Tue 12:00", "Wed 12:00"];

  return (
    <div className="timeslider">
      <button className="ts-play" onClick={() => setPlaying(p => !p)}>
        {playing ? "■" : "▶"}
      </button>
      <div className="ts-track" ref={trackRef} onMouseDown={(e) => { onTrack(e); const move = (ev) => onTrack(ev); window.addEventListener("mousemove", move); window.addEventListener("mouseup", () => window.removeEventListener("mousemove", move), { once: true }); }}>
        <div className="ts-line">
          <div className="ts-fill" style={{ width: `${pct}%` }}/>
          <div className="ts-thumb" style={{ left: `${pct}%` }}/>
          {/* event ticks */}
          {D.TIMELINE.map(e => (
            <span key={e.h} className="ts-event-tick" style={{ left: `${(e.h/maxH)*100}%` }}/>
          ))}
        </div>
        <div className="ts-ticks">
          {ticks.map(t => <span key={t}>{t.replace("Fri ", "F·").replace("Sat ", "S·").replace("Sun ", "U·").replace("Mon ", "M·").replace("Tue ", "T·").replace("Wed ", "W·")}</span>)}
        </div>
      </div>
      <div className="ts-readout">
        <div>{cur.t}</div>
        <div><span className="total">{(cur.totalOut/1000).toFixed(0)}K</span> <span style={{ color: "rgba(255,255,255,0.55)" }}>out · {cur.peakIce}mm peak</span></div>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9.5, marginTop: 2 }}>{cur.label.slice(0, 38)}{cur.label.length > 38 ? "…" : ""}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// INSPECTOR (top-right of map, appears on region click)
// ─────────────────────────────────────────────────────────────────
function Inspector({ region, timeHour, onClose, askAgent }) {
  if (!region) return null;
  const out = D.regionOutAt(region, timeHour);
  const mm = D.regionIceAt(region, timeHour);
  const poles = Math.round(region.poles * D.timeFactor(timeHour));
  return (
    <div className="inspector">
      <div className="inspector-head">
        <div>
          <span className="mono caps" style={{ fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.14em" }}>Feature</span>
          <div className="ttl" style={{ fontSize: 14, marginTop: 2 }}>{region.centroid}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{region.name} · {region.utility}</div>
        </div>
        <button className="close" onClick={onClose}>×</button>
      </div>
      <div className="inspector-body">
        <KV k="Customers out · now"  v={out.toLocaleString()} accent={D.outageColor(out, region.peakOut)}/>
        <KV k="Peak (so far)"         v={region.peakOut.toLocaleString()}/>
        <KV k="Customers · total"     v={region.customers.toLocaleString()}/>
        <KV k="Ice accretion · now"   v={`${mm} mm`}/>
        <KV k="Broken poles"          v={poles}/>
        <KV k="Vulnerable households" v={region.vulnerable.toLocaleString()}/>
        <KV k="Warming centres"       v={region.warming}/>
        <KV k="State of emergency"    v={region.soe ? "Active" : "—"} accent={region.soe ? "var(--risk)" : "var(--ink-3)"}/>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <button className="btn" style={{ width: "100%", justifyContent: "center" }}
            onClick={() => askAgent(`Notify vulnerable households in ${region.centroid}`)}>
            ↗ Stage notifications for {region.centroid}
          </button>
          <button className="btn ghost" style={{ width: "100%", justifyContent: "center" }}
            onClick={() => askAgent(`Buffer 5km around broken poles in ${region.centroid}`)}>
            Run Near Me · 5km buffer
          </button>
        </div>
      </div>
    </div>
  );
}
function KV({ k, v, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dotted var(--rule)", fontSize: 11.5 }}>
      <span className="mono caps" style={{ color: "var(--ink-4)", letterSpacing: "0.1em" }}>{k}</span>
      <span className="mono tnum" style={{ color: accent || "var(--ink)" }}>{v}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// STATUS BAR
// ─────────────────────────────────────────────────────────────────
function StatusBar({ basemap, bookmark, timeHour }) {
  const bm = D.BASEMAPS.find(b => b.id === basemap);
  const bk = D.BOOKMARKS.find(b => b.id === bookmark);
  const t = D.TIMELINE.reduce((a, b) => Math.abs(b.h - timeHour) < Math.abs(a.h - timeHour) ? b : a);
  return (
    <div className="statusbar">
      <span className="item">EPSG:3857 · Web Mercator</span>
      <span className="sep"/>
      <span className="item tnum">44.36° N · 78.74° W</span>
      <span className="sep"/>
      <span className="item">Scale 1 : {(1200000/(bk?.scale || 1)/1000).toFixed(0)}K</span>
      <span className="sep"/>
      <span className="item">Extent · {bk?.label || "—"}</span>
      <span className="sep"/>
      <span className="item">Basemap · {bm?.label}</span>
      <span style={{ marginLeft: "auto" }} className="item">Time · {t.t}</span>
      <span className="item" style={{ color: "var(--accept)" }}>
        <span className="live-dot" style={{ display: "inline-block", width: 6, height: 6, background: "var(--accept)", marginRight: 6 }}/>
        live · OMS sync
      </span>
      <span className="sep"/>
      <span className="item">Auto-saved</span>
    </div>
  );
}

window.K2_PANELS = { TopBar, LayerTree, Legend, Bookmarks, BasemapGallery, TimeSlider, Inspector, StatusBar };
})();
