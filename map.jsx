/* global React */
(function () {
const { FSA_DATA: F_, DEPOTS: D_, riskColor: rc_ } = window.KARDASHEV_DATA;

function MapCanvas({ selected, onSelect, layers, tHours }) {
  const [tip, setTip] = React.useState(null);
  const wrapRef = React.useRef(null);

  // Risk values scale with time: closer to t=0, higher
  // tHours is negative; -72 is far away, 0 is impact
  const risk = (base) => {
    const proximity = Math.max(0, 1 - Math.abs(tHours + 12) / 60); // peak around T-12
    const scaled = Math.min(0.95, base * (0.55 + 0.55 * proximity));
    return scaled;
  };

  return (
    <div ref={wrapRef} className="hexgrid relative" style={{ background: "var(--paper-dark)", overflow: "hidden", height: "100%" }}>
      {/* basemap chrome top-left */}
      <div className="absolute" style={{ top: 12, left: 12, zIndex: 5 }}>
        <div className="mono caps" style={{
          background: "rgba(11,8,5,0.7)",
          color: "#C4BEB0",
          fontSize: 9,
          padding: "5px 8px",
          border: "1px solid #2A241A",
          letterSpacing: "0.12em",
        }}>
          Basemap · Kardashev Dark Canvas
        </div>
      </div>

      {/* event title strip — top-right */}
      <div className="absolute flex items-center gap-3" style={{ top: 12, right: 12, zIndex: 5 }}>
        <div style={{ width: 8, height: 8, background: "var(--burnt)", boxShadow: "0 0 12px var(--burnt)" }}/>
        <div className="serif" style={{ color: "#F3EFE6", fontSize: 16, lineHeight: 1 }}>
          ice storm advisory
        </div>
        <span className="mono caps" style={{ fontSize: 9, color: "var(--burnt)", letterSpacing: "0.12em" }}>
          ECCC · Mar 28 · 23 mm ice
        </span>
      </div>

      <svg viewBox="0 0 720 580" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
        {/* Lake Ontario / Simcoe — water bodies, very dark */}
        <defs>
          <pattern id="hexpat" width="14" height="12.12" patternUnits="userSpaceOnUse">
            <path d="M7 0 L14 3.5 L14 8.5 L7 12.12 L0 8.5 L0 3.5 Z" fill="none" stroke="#1E1810" strokeWidth="0.3"/>
          </pattern>
          <linearGradient id="coneGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(200,84,44,0)"/>
            <stop offset="100%" stopColor="rgba(200,84,44,0.35)"/>
          </linearGradient>
        </defs>

        {/* hex texture underlay */}
        <rect x="0" y="0" width="720" height="580" fill="url(#hexpat)" opacity="0.6"/>

        {/* southern Ontario landmass outline (stylized) */}
        <path
          d="M40,120 L120,108 L210,112 L300,98 L400,104 L500,118 L600,138 L680,170
             L688,238 L676,310 L660,372 L620,438 L560,490 L490,520 L410,540 L330,548
             L260,540 L180,520 L120,488 L78,442 L52,388 L36,318 L34,242 Z"
          fill="#1E1810"
          stroke="#3A3025"
          strokeWidth="0.6"
        />

        {/* Lake Ontario at bottom */}
        <path
          d="M80,512 L180,540 L300,556 L460,556 L600,532 L680,508 L688,580 L0,580 Z"
          fill="var(--paper-darker)"
        />
        {/* Lake Simcoe (centered, between northern FSAs) */}
        <ellipse cx="300" cy="320" rx="56" ry="32" fill="var(--paper-darker)" />
        <text x="300" y="324" textAnchor="middle" className="mono" fill="#3A3025" fontSize="8" style={{ letterSpacing: "0.18em" }}>LAKE SIMCOE</text>

        {/* Highway / road thin grey lines */}
        <path d="M100,250 Q300,260 540,200" fill="none" stroke="#2A241A" strokeWidth="0.6"/>
        <path d="M180,470 Q360,400 540,180" fill="none" stroke="#2A241A" strokeWidth="0.6"/>
        <path d="M230,540 Q280,440 320,300" fill="none" stroke="#2A241A" strokeWidth="0.6"/>
        <path d="M420,540 Q440,420 440,280" fill="none" stroke="#2A241A" strokeWidth="0.6"/>

        {/* FSA polygons */}
        {F_.map(fsa => {
          const rv = risk(fsa.risk);
          const isSelected = selected === fsa.code;
          return (
            <g key={fsa.code}>
              <path
                d={fsa.polygon}
                className={"fsa-path" + (isSelected ? " selected" : "")}
                fill={layers.outage ? rc_(rv) : "#2A241A"}
                stroke="#0B0805"
                strokeWidth="0.8"
                opacity={layers.outage ? 0.92 : 0.55}
                onMouseEnter={(e) => {
                  const rect = wrapRef.current.getBoundingClientRect();
                  setTip({ fsa, rv, x: e.clientX - rect.left, y: e.clientY - rect.top });
                }}
                onMouseMove={(e) => {
                  const rect = wrapRef.current.getBoundingClientRect();
                  setTip(t => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
                }}
                onMouseLeave={() => setTip(null)}
                onClick={() => onSelect(fsa.code)}
              />
              <text
                x={fsa.x} y={fsa.y + 4}
                textAnchor="middle"
                className="mono"
                fill="#F3EFE6"
                fontSize="11"
                style={{ pointerEvents: "none", letterSpacing: "0.04em", fontWeight: 500 }}
              >
                {fsa.code}
              </text>
            </g>
          );
        })}

        {/* Asset density (feeders) */}
        {layers.assets && (
          <g opacity="0.5">
            {F_.map(fsa => (
              <g key={"a"+fsa.code}>
                <circle cx={fsa.x - 14} cy={fsa.y + 16} r="1" fill="var(--cyan)"/>
                <circle cx={fsa.x + 10} cy={fsa.y - 12} r="1" fill="var(--cyan)"/>
                <circle cx={fsa.x + 20} cy={fsa.y + 10} r="1" fill="var(--cyan)"/>
                <circle cx={fsa.x - 18} cy={fsa.y - 8} r="1" fill="var(--cyan)"/>
              </g>
            ))}
          </g>
        )}

        {/* Storm cone — sweeping east */}
        {layers.cone && (
          <g>
            <path
              d="M-20,180 L760,90 L780,420 L-20,500 Z"
              fill="url(#coneGrad)"
              opacity="0.6"
              style={{ transition: "transform 600ms ease-out" }}
              transform={`translate(${(tHours + 72) * -3}, 0)`}
            />
            {/* direction arrow */}
            <g transform="translate(550, 280)">
              <path d="M0,-12 L36,-12 L36,-22 L60,0 L36,22 L36,12 L0,12 Z" fill="var(--burnt)" opacity="0.7"/>
            </g>
            <text x="560" y="252" className="mono caps" fill="var(--burnt)" fontSize="8" style={{ letterSpacing: "0.18em" }}>STORM DIR · ENE</text>
          </g>
        )}

        {/* Depots */}
        {D_.map(d => (
          <g key={d.id} transform={`translate(${d.x},${d.y})`}>
            {/* warehouse glyph */}
            <rect x="-6" y="-6" width="12" height="12" fill="var(--burnt)" stroke="#0B0805" strokeWidth="0.6"/>
            <path d="M-6,-6 L0,-10 L6,-6" fill="var(--burnt)" stroke="#0B0805" strokeWidth="0.6"/>
            <text x="0" y="20" textAnchor="middle" className="mono" fill="#C4BEB0" fontSize="8" style={{ letterSpacing: "0.14em" }}>
              {d.label}
            </text>
          </g>
        ))}
      </svg>

      {/* attribution + scale + compass */}
      <div className="absolute flex items-end justify-between" style={{ left: 12, right: 12, bottom: 10, zIndex: 5 }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ width: 60, height: 2, background: "#C4BEB0", display: "inline-block" }}/>
            <span className="attrib">0 ── 50 KM</span>
          </div>
          <div className="attrib">ESRI · LIVING ATLAS · ECCC · STATCAN · SYNTHETIC BASELINE (WANIK 2017)</div>
        </div>
        {/* compass rose (original mark) */}
        <div style={{
          width: 38, height: 38,
          border: "1px solid #3A3025",
          background: "rgba(11,8,5,0.6)",
          position: "relative",
        }}>
          <svg viewBox="0 0 38 38" width="38" height="38">
            <path d="M19,4 L23,19 L19,16 L15,19 Z" fill="#C8542C"/>
            <path d="M19,34 L23,19 L19,22 L15,19 Z" fill="#5A4F3F"/>
            <text x="19" y="14" textAnchor="middle" className="mono" fill="#C4BEB0" fontSize="6">N</text>
          </svg>
        </div>
      </div>

      {/* hover tooltip */}
      {tip && (
        <div
          className="map-tip"
          style={{
            left: Math.min(tip.x + 14, (wrapRef.current?.clientWidth || 1000) - 230),
            top: Math.min(tip.y + 14, (wrapRef.current?.clientHeight || 700) - 130),
          }}
        >
          <div className="flex items-baseline justify-between">
            <span className="mono" style={{ fontSize: 13, letterSpacing: "0.04em" }}>{tip.fsa.code}</span>
            <span style={{ fontSize: 11, color: "#A89E8A" }}>· {tip.fsa.name}</span>
          </div>
          <div className="my-2" style={{ height: 1, background: "#2A241A" }}/>
          <div className="grid grid-cols-2 gap-y-1 mono tnum" style={{ fontSize: 10 }}>
            <span style={{ color: "#8A8071" }}>RISK</span>
            <span className="text-right" style={{ color: rc_(tip.rv) }}>{tip.rv.toFixed(2)} ↑</span>
            <span style={{ color: "#8A8071" }}>CUSTOMERS</span>
            <span className="text-right">{tip.fsa.customers.toLocaleString()}</span>
            <span style={{ color: "#8A8071" }}>VULNERABLE</span>
            <span className="text-right">{tip.fsa.vulnerable.toLocaleString()}</span>
            <span style={{ color: "#8A8071" }}>CANOPY</span>
            <span className="text-right">{tip.fsa.canopy} %</span>
          </div>
          <div className="mt-2 mono caps" style={{ fontSize: 9, color: "#8A8071" }}>└ click for detail</div>
        </div>
      )}
    </div>
  );
}

window.MapCanvas = MapCanvas;
})();
