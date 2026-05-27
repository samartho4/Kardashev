/* global React, ReactDOM */
(function () {
const { useState, useEffect, useMemo, useRef, useCallback } = React;
const D = window.K2_DATA;
const { MapView } = window.K2_MAP;
const { TopBar, LayerTree, Legend, Bookmarks, BasemapGallery, TimeSlider, Inspector, StatusBar } = window.K2_PANELS;
const { AgentPanel, routePrompt } = window.K2_AGENT;

// ─── A resize splitter that drives a numeric state value ────────────
function Splitter({ onDrag, direction = "h" }) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef(0);
  useEffect(() => {
    if (!dragging) return;
    function move(e) {
      const delta = e.clientX - startRef.current;
      startRef.current = e.clientX;
      onDrag(delta);
    }
    function up() { setDragging(false); }
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up, { once: true });
    return () => window.removeEventListener("mousemove", move);
  }, [dragging, onDrag]);
  return (
    <div
      className={"splitter" + (dragging ? " dragging" : "")}
      onMouseDown={(e) => { startRef.current = e.clientX; setDragging(true); }}
    />
  );
}

// ─── Left icon rail (when Layers panel is collapsed) ────────────────
function LeftRail({ pick }) {
  const items = [
    { id: "layers",    label: "Layers",   glyph: "≣" },
    { id: "basemap",   label: "Basemap",  glyph: "◍" },
    { id: "bookmark",  label: "Bookmarks",glyph: "⌖" },
    { id: "legend",    label: "Legend",   glyph: "▤" },
    { id: "tables",    label: "Tables",   glyph: "⌗" },
    { id: "print",     label: "Print",    glyph: "⎙" },
  ];
  return (
    <div className="icon-rail">
      {items.map(it => (
        <button key={it.id} className="icon-rail-btn" onClick={() => pick(it.id)}>
          <span className="gly" style={{ fontSize: 18, fontFamily: "Geist Mono" }}>{it.glyph}</span>
          <span className="lbl">{it.label}</span>
        </button>
      ))}
      <div className="icon-rail-spacer"/>
      <div className="icon-rail-divider"/>
      <button className="icon-rail-btn">
        <span className="gly" style={{ fontSize: 16, fontFamily: "Geist Mono" }}>?</span>
        <span className="lbl">Help</span>
      </button>
    </div>
  );
}

// ─── Right icon rail (when Agent is collapsed) ──────────────────────
function RightRail({ onExpand }) {
  return (
    <div className="icon-rail right">
      <button className="icon-rail-btn active" onClick={onExpand}>
        <span className="gly" style={{
          background: "var(--agent)", color: "white",
          width: 22, height: 22, display: "grid", placeItems: "center",
          fontFamily: "'Geist Mono', monospace", fontSize: 12,
        }}>K</span>
        <span className="lbl">Kardashev agent</span>
      </button>
      <div className="icon-rail-spacer"/>
    </div>
  );
}

function App() {
  // ─── panel layout state ──────────────────────────────────
  const [leftWidth,  setLeftWidth]    = useState(260);
  const [rightWidth, setRightWidth]   = useState(380);
  const [leftCollapsed,  setLeftCollapsed]  = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // ─── core map state ─────────────────────────────────────
  const [layers, setLayers]                   = useState(D.INITIAL_LAYERS);
  const [basemap, setBasemap]                 = useState("dark");
  const [bookmark, setBookmark]               = useState("all");
  const [timeHour, setTimeHour]               = useState(38);
  const [playing, setPlaying]                 = useState(false);
  const [selected, setSelected]               = useState(null);
  const [proposedRegions, setProposedRegions] = useState([]);
  const [annotations, setAnnotations]         = useState([]);
  const [swipe, setSwipe]                     = useState(null);
  const [messages, setMessages]               = useState(() => seedConversation());
  const [proposalSnapshots, setSnapshots]     = useState({});
  const [thinking, setThinking]               = useState(false);

  // ─── derived ─────────────────────────────────────────────
  const totalOut = useMemo(() => {
    return D.REGIONS.reduce((s, r) => s + D.regionOutAt(r, timeHour), 0);
  }, [timeHour]);

  // ─── layer ops ───────────────────────────────────────────
  function toggleLayer(id) {
    setLayers(ls => ls.map(l => l.id === id ? { ...l, on: !l.on } : l));
  }
  function removeLayer(id) {
    setLayers(ls => ls.filter(l => l.id !== id));
  }
  function addLayer(layerDef) {
    setLayers(ls => {
      if (ls.some(l => l.id === layerDef.id)) {
        return ls.map(l => l.id === layerDef.id ? { ...l, on: true } : l);
      }
      return [...ls, { ...layerDef, on: true }];
    });
  }

  // ─── proposal apply ─────────────────────────────────────
  function snapshotNow(id) {
    setSnapshots(s => ({ ...s, [id]: { layers, basemap, bookmark, timeHour, annotations, swipe } }));
  }
  function undoProposal(id) {
    const snap = proposalSnapshots[id];
    if (!snap) return;
    setLayers(snap.layers);
    setBasemap(snap.basemap);
    setBookmark(snap.bookmark);
    setTimeHour(snap.timeHour);
    setAnnotations(snap.annotations);
    setSwipe(snap.swipe);
    setProposedRegions([]);
    setMessages(ms => ms.map(m => m.proposal?.id === id ? { ...m, proposal: { ...m.proposal, status: undefined } } : m));
  }
  function rejectProposal(id) {
    setMessages(ms => ms.map(m => m.proposal?.id === id ? { ...m, proposal: { ...m.proposal, status: "rejected" } } : m));
    setProposedRegions([]);
  }
  function applyProposal(id) {
    snapshotNow(id);
    setMessages(ms => ms.map(m => m.proposal?.id === id ? { ...m, proposal: { ...m.proposal, status: "applied" } } : m));
    setProposedRegions([]);

    const proposalMsg = messages.find(m => m.proposal?.id === id);
    const meta = proposalMsg?.proposal?.meta || {};

    if (id === "outage-overlay") {
      addLayer(D.AGENT_ADDABLE_LAYERS.risk);
      addLayer(D.AGENT_ADDABLE_LAYERS.customers);
      setBookmark("corridor");
      // ── Auto-chain: agent proactively suggests next step (Beat 2) ──
      setTimeout(() => {
        setThinking(true);
        setTimeout(() => {
          setMessages(ms => [...ms, {
            role: "agent",
            text: "Done. Three regions are running above 80 % of peak — Peterborough (44K), Muskoka (42K), Kawartha Lakes (38K). Want me to plan crew positioning? I'll pull in the mutual-aid network, surface the densest pole clusters, and put a 5 km ring around Peterborough so we can see who's inside the priority zone.",
            tool: "context_carry · PlannerAgent · 0.4 s",
            proposal: {
              id: "plan-crews",
              label: "PlannerAgent · multi-action",
              actions: [
                { kind: "add",  sigil: "+", verb: "Add layer", detail: "Mutual Aid Crew Origins · 30 utilities", effect: "Toronto Hydro · Hydro Ottawa · 28 more" },
                { kind: "add",  sigil: "+", verb: "Add layer", detail: "Broken Poles · cluster",                 effect: "420 Peterborough · 410 Muskoka · 360 Lindsay" },
                { kind: "add",  sigil: "+", verb: "Run buffer", detail: "5 km ring around Peterborough centroid", effect: "Spatial analysis · Near Me widget" },
                { kind: "zoom", sigil: "↗", verb: "Zoom to",    detail: "Peterborough County",                    effect: "Center · 1:300K · 1.7×" },
              ],
              meta: { regionId: "PETB" },
            },
          }]);
          setProposedRegions(["PETB", "MUSK", "KAWL"]);
          setThinking(false);
        }, 1400);
      }, 800);
    }
    else if (id === "plan-crews") {
      addLayer(D.AGENT_ADDABLE_LAYERS.mutualAid);
      addLayer(D.AGENT_ADDABLE_LAYERS.poles);
      const petb = D.REGIONS.find(r => r.id === "PETB");
      if (petb) setAnnotations(a => [...a, { kind: "buffer", center: petb.center, km: 5, label: "5 km · Peterborough" }]);
      setBookmark("peter");
      // ── Auto-chain: Beat 3 — human-in-the-loop notifications ──
      setTimeout(() => {
        setThinking(true);
        setTimeout(() => {
          setMessages(ms => [...ms, {
            role: "agent",
            text: "Inside the 5 km buffer I count 2,187 vulnerable households — medical-equipment registrants, seniors 75+, low-income. They're first restoration priority. I've drafted an SMS that references the Hydro One callback line (1-800-434-1235) and the six reception centres in Peterborough County. This action sends real messages, so I'll hold for your approval before anything goes out.",
            tool: "draftNotifications · CommsAgent · 1.1 s",
            proposal: {
              id: "stage-notifications",
              label: "CommsAgent · human-in-the-loop",
              actions: [
                { kind: "add", sigil: "+", verb: "Add layer",  detail: "Vulnerable Households · 2,187 inside buffer", effect: "StatCan 2021 + OEB low-income register" },
                { kind: "add", sigil: "+", verb: "Add layer",  detail: "Warming Centres · 6 in Peterborough County",  effect: "Live reception-centre feed" },
                { kind: "sym", sigil: "~", verb: "Stage SMS",  detail: "Hydro One alert · 1-800-434-1235 callback",   effect: "HOLD for human approval before send" },
              ],
              meta: { regionId: "PETB", requiresApproval: true },
            },
          }]);
          setThinking(false);
        }, 1500);
      }, 900);
    }
    else if (id === "stage-notifications") {
      addLayer(D.AGENT_ADDABLE_LAYERS.vulnerable);
      addLayer(D.AGENT_ADDABLE_LAYERS.warming);
      setProposedRegions(["PETB"]);
      // Beat 3 closes the loop
      setTimeout(() => {
        setThinking(true);
        setTimeout(() => {
          setMessages(ms => [...ms, {
            role: "agent",
            text: "Approved · sent. 2,187 SMS dispatched, 14 mutual-aid crews queued for pre-positioning. Peterborough Op Centre has been pinged with the layer state. I'll keep monitoring — if open outages cross 50K I'll surface a second wave for you.",
            tool: "commitWorkforce · WorkforceAgent · 0.6 s",
          }]);
          setThinking(false);
        }, 1100);
      }, 800);
    }
    else if (id === "ice-overlay") {
      addLayer(D.AGENT_ADDABLE_LAYERS.iceAccretion);
      addLayer(D.AGENT_ADDABLE_LAYERS.warnings);
    }
    else if (id === "poles-overlay") {
      addLayer(D.AGENT_ADDABLE_LAYERS.poles);
      addLayer(D.AGENT_ADDABLE_LAYERS.risk);
    }
    else if (id.startsWith("basemap-")) {
      setBasemap(id.slice("basemap-".length));
    }
    else if (id === "replay-storm") {
      addLayer(D.AGENT_ADDABLE_LAYERS.risk);
      setTimeHour(0);
      setTimeout(() => setPlaying(true), 200);
    }
    else if (id === "swipe-sat-sun") {
      addLayer(D.AGENT_ADDABLE_LAYERS.risk);
      addLayer(D.AGENT_ADDABLE_LAYERS.customers);
      setSwipe({ on: true, x: 0.5, leftHour: 15, rightHour: 38 });
    }
    else if (id === "soe-peak") {
      setTimeHour(38);
      addLayer(D.AGENT_ADDABLE_LAYERS.soe);
      addLayer(D.AGENT_ADDABLE_LAYERS.warming);
      addLayer(D.AGENT_ADDABLE_LAYERS.risk);
    }
    else if (id === "april2-wave") {
      setTimeHour(113);
      addLayer(D.AGENT_ADDABLE_LAYERS.warnings);
      addLayer(D.AGENT_ADDABLE_LAYERS.risk);
    }
    else if (id === "filter-ice") {
      addLayer(D.AGENT_ADDABLE_LAYERS.iceAccretion);
      setProposedRegions(D.REGIONS.filter(r => r.ice >= 15).map(r => r.id));
    }
    else if (id.startsWith("buffer-")) {
      const regionId = meta.regionId;
      const region = D.REGIONS.find(r => r.id === regionId);
      const km = meta.km || 5;
      if (region) {
        setAnnotations(a => [...a, { kind: "buffer", center: region.center, km, label: `${km} km · ${region.centroid}` }]);
        addLayer(D.AGENT_ADDABLE_LAYERS.poles);
        if (regionId === "PETB") setBookmark("peter");
        else if (regionId === "MUSK") setBookmark("muskoka");
        else if (regionId === "KAWL") setBookmark("kawartha");
        else if (regionId === "ORIL") setBookmark("orillia");
        else if (regionId === "BARR") setBookmark("barrie");
      }
    }
    else if (id.startsWith("notify-")) {
      addLayer(D.AGENT_ADDABLE_LAYERS.vulnerable);
      addLayer(D.AGENT_ADDABLE_LAYERS.warming);
      const regionId = meta.regionId;
      if (regionId) {
        setProposedRegions([regionId]);
        if (regionId === "ORIL") setBookmark("orillia");
        else if (regionId === "PETB") setBookmark("peter");
      }
    }
    else if (id.startsWith("mutual-")) {
      addLayer(D.AGENT_ADDABLE_LAYERS.mutualAid);
      const regionId = meta.regionId;
      if (regionId === "MUSK") setBookmark("muskoka");
      else if (regionId === "PETB") setBookmark("peter");
    }
    else if (id === "bookmark-corridor") {
      setBookmark("corridor");
    }
  }

  // ─── Reset to seeded demo state ─────────────────────────
  function resetDemo() {
    setLayers(D.INITIAL_LAYERS);
    setBasemap("dark");
    setBookmark("all");
    setTimeHour(38);
    setPlaying(false);
    setSelected(null);
    setProposedRegions([]);
    setAnnotations([]);
    setSwipe(null);
    setMessages(seedConversation());
    setSnapshots({});
    setThinking(false);
  }

  // ─── chat ──────────────────────────────────────────────
  function onSend(text) {
    setMessages(ms => [...ms, { role: "user", text }]);
    setThinking(true);
    setTimeout(() => {
      const responses = routePrompt(text, { layers, basemap, bookmark, timeHour });
      setMessages(ms => [...ms, ...responses]);
      setThinking(false);
      const proposal = responses.find(r => r.proposal)?.proposal;
      if (proposal?.id === "outage-overlay") {
        setProposedRegions(["MUSK", "HALI", "ORIL", "KAWL", "PETB", "BARR"]);
      } else if (proposal?.id === "poles-overlay") {
        setProposedRegions(["MUSK", "PETB", "KAWL", "KING"]);
      } else if (proposal?.id === "soe-peak") {
        setProposedRegions(D.REGIONS.filter(r => r.soe).map(r => r.id));
      } else if (proposal?.meta?.regionId) {
        setProposedRegions([proposal.meta.regionId]);
      }
    }, 900); // longer delay shows the typing indicator
  }

  const selectedRegion = selected ? D.REGIONS.find(r => r.id === selected) : null;

  // ─── splitter handlers ───────────────────────────────────
  const onDragLeft  = useCallback((dx) => setLeftWidth(w => Math.max(180, Math.min(440, w + dx))), []);
  const onDragRight = useCallback((dx) => setRightWidth(w => Math.max(300, Math.min(560, w - dx))), []);

  // ─── render ──────────────────────────────────────────────
  return (
    <div className="shell">
      <TopBar
        leftCollapsed={leftCollapsed}
        rightCollapsed={rightCollapsed}
        onToggleLeft={() => setLeftCollapsed(c => !c)}
        onToggleRight={() => setRightCollapsed(c => !c)}
        onReset={resetDemo}
      />

      <div className="shell-body">
        {/* LEFT — Layers panel or icon rail */}
        {leftCollapsed ? (
          <LeftRail pick={(id) => setLeftCollapsed(false)}/>
        ) : (
          <>
            <div style={{ width: leftWidth, flex: "0 0 auto", display: "flex", minHeight: 0 }}>
              <LayerTree
                layers={layers}
                toggleLayer={toggleLayer}
                removeLayer={removeLayer}
                zoomTo={(id) => setBookmark("corridor")}
                timeHour={timeHour}
                totalOut={totalOut}
                onCollapse={() => setLeftCollapsed(true)}
              />
            </div>
            <Splitter onDrag={onDragLeft}/>
          </>
        )}

        {/* MAP */}
        <div className="canvas" style={{ position: "relative" }}>
          <MapView
            state={{
              layers, basemap, bookmark, timeHour,
              selected, proposedRegions, annotations, swipe,
            }}
            onSelect={(id) => setSelected(id)}
          />

          {/* Bookmark dropdown (top-left of map) */}
          <div className="bookmark-bar">
            <Bookmarks value={bookmark} onChange={setBookmark}/>
          </div>

          {/* Map tools (top-right) */}
          <div className="map-tools">
            <div className="tool-group">
              <button className="tool-pill" title="Select">Select</button>
              <button className="tool-pill" title="Measure">Measure</button>
              <button className="tool-pill" title="Draw">Draw</button>
            </div>
          </div>

          {selectedRegion && (
            <Inspector
              region={selectedRegion}
              timeHour={timeHour}
              onClose={() => setSelected(null)}
              askAgent={(text) => onSend(text)}
            />
          )}

          <Legend layers={layers}/>
          <BasemapGallery value={basemap} onChange={setBasemap}/>
          <TimeSlider hour={timeHour} setHour={setTimeHour} playing={playing} setPlaying={setPlaying}/>
        </div>

        {/* RIGHT — Agent panel or icon rail */}
        {rightCollapsed ? (
          <RightRail onExpand={() => setRightCollapsed(false)}/>
        ) : (
          <>
            <Splitter onDrag={onDragRight}/>
            <div style={{ width: rightWidth, flex: "0 0 auto", display: "flex", minHeight: 0 }}>
              <AgentPanel
                messages={messages}
                onSend={onSend}
                applyProposal={applyProposal}
                rejectProposal={rejectProposal}
                undoProposal={undoProposal}
                thinking={thinking}
                onCollapse={() => setRightCollapsed(true)}
              />
            </div>
          </>
        )}
      </div>

      <StatusBar basemap={basemap} bookmark={bookmark} timeHour={timeHour}/>
    </div>
  );
}

function seedConversation() {
  return [
    { role: "user", text: "Show me where outages are spreading right now." },
    {
      role: "agent",
      text: "I'm pulling the latest OMS feed and overlaying outage density on the current map. The corridor north of Toronto is the hot zone — Muskoka, Haliburton, Kawartha Lakes and Peterborough are all running above 80 % of peak. Toronto Hydro reports only 4 mm of ice and 1,200 customers affected.",
      tool: "rankRegions · ForecastAgent · 1.4 s",
      proposal: {
        id: "outage-overlay",
        label: "ForecastAgent",
        actions: [
          { kind: "add",  sigil: "+",  verb: "Add layer",     detail: "Outage Density · OMS live", effect: "11 regions styled by % out" },
          { kind: "add",  sigil: "+",  verb: "Add layer",     detail: "Customers Without Power · bubbles", effect: "Sized by absolute count" },
          { kind: "set",  sigil: "~",  verb: "Apply filter",  detail: "Hide regions with < 1,000 out", effect: "Toronto and Ottawa fade out" },
          { kind: "zoom", sigil: "↗",  verb: "Zoom to",       detail: "Hardest-Hit Corridor bookmark", effect: "Center on central Ontario" },
        ],
      },
    },
  ];
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
})();
