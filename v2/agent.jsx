/* global React */
(function () {
const { useState, useRef, useEffect } = React;
const D = window.K2_DATA;

// ─────────────────────────────────────────────────────────────────
// AGENT PANEL
// ─────────────────────────────────────────────────────────────────
function AgentPanel({ messages, onSend, applyProposal, rejectProposal, undoProposal, thinking, onCollapse }) {
  const [draft, setDraft] = useState("");
  const [examplesOpen, setExamplesOpen] = useState(false);
  const threadRef = useRef(null);
  useEffect(() => {
    threadRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages, thinking]);

  const submit = () => {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  };

  const suggestionGroups = [
    {
      label: "Map · layers",
      items: [
        "Show where outages are spreading right now",
        "Add ice accretion isobands from ECCC",
        "Show broken poles by region",
        "Toggle a light basemap so I can read place names",
      ],
    },
    {
      label: "Time · compare",
      items: [
        "Replay the storm from Friday 19:00 to Sunday peak",
        "Compare Saturday noon to Sunday morning side-by-side",
        "Jump to Sunday 09:00 — when emergencies were declared",
        "Show me the second-wave on April 2",
      ],
    },
    {
      label: "Analyze · respond",
      items: [
        "Filter to regions with more than 15mm of ice",
        "Buffer 5km around broken poles in Peterborough County",
        "Compare top 5 regions by customers out",
        "Stage notifications for vulnerable households in Orillia",
        "Plan mutual-aid routing to Muskoka",
        "Bookmark the hardest-hit corridor",
      ],
    },
  ];

  return (
    <div className="agent">
      <div className="agent-head">
        <div className="name">
          <span className="agent-mark">K</span>
          <span>Kardashev</span>
          <span className="gen-ui-tag" title="Agent-User Interaction protocol"><span className="pip"/>AG-UI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="agent-status"><span className="live-dot"/>{thinking ? "thinking…" : "5 tools · ready"}</span>
          {onCollapse && (
            <button className="panel-collapse" onClick={onCollapse} title="Collapse" style={{ background: "transparent", border: "1px solid var(--rule)", width: 22, height: 22, cursor: "pointer", color: "var(--ink-3)" }}>›</button>
          )}
        </div>
      </div>

      <div className="agent-thread thin-scroll" ref={threadRef}>
        {messages.map((m, i) => (
          <Message key={i} m={m} applyProposal={applyProposal} rejectProposal={rejectProposal} undoProposal={undoProposal}/>
        ))}
        {thinking && (
          <div className="typing-indicator">
            <span style={{ width: 22, height: 22, background: "var(--agent-soft)", border: "1px solid var(--agent-line)", color: "var(--agent)", display: "grid", placeItems: "center", fontFamily: "'Geist Mono', monospace", fontSize: 11 }}>K</span>
            <span>Kardashev is composing</span>
            <span className="typing-dots"><span/><span/><span/></span>
          </div>
        )}
      </div>

      <div className="composer">
        {examplesOpen && (
          <div className="examples-sheet thin-scroll">
            <div className="examples-head">
              <span className="mono caps" style={{ fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.14em" }}>Try one of these</span>
              <button className="examples-close" onClick={() => setExamplesOpen(false)} title="Close">×</button>
            </div>
            {suggestionGroups.map(g => (
              <div key={g.label} className="examples-group">
                <div className="mono caps examples-group-label">{g.label}</div>
                <div className="suggestions">
                  {g.items.map(s => (
                    <button key={s} className="suggestion" onClick={() => { onSend(s); setExamplesOpen(false); }}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="composer-input">
          <button
            className={"composer-examples-btn" + (examplesOpen ? " active" : "")}
            onClick={() => setExamplesOpen(o => !o)}
            title="Show example prompts"
          >
            <span style={{ fontFamily: "Geist Mono", fontSize: 13 }}>{examplesOpen ? "×" : "✦"}</span>
          </button>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Ask Kardashev to change the map…"
          />
          <button className="send" onClick={submit}>Send ↵</button>
        </div>
      </div>
    </div>
  );
}

function Message({ m, applyProposal, rejectProposal, undoProposal }) {
  if (m.role === "user") {
    return <div className="msg-user">{m.text}</div>;
  }
  return (
    <div className="msg-agent">
      <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
      {m.tool && <div className="tool-trace">↳ {m.tool}</div>}
      {m.proposal && (
        <Proposal
          proposal={m.proposal}
          onAccept={() => applyProposal(m.proposal.id)}
          onReject={() => rejectProposal(m.proposal.id)}
          onUndo={() => undoProposal(m.proposal.id)}
        />
      )}
      {m.fsaCard && <FSACard region={m.fsaCard}/>}
      {m.chart   && <InlineChart data={m.chart}/>}
    </div>
  );
}

// ─── Proposal card (DECLARATIVE gen UI) ─────────────────────────
function Proposal({ proposal, onAccept, onReject, onUndo }) {
  const { id, label, actions, status, applied } = proposal;
  return (
    <div className={"proposal" + (status === "applied" ? " applied" : status === "rejected" ? " rejected" : "")}>
      <div className="proposal-head">
        <span className="ttl">
          {status === "applied" ? "✓ Applied" : status === "rejected" ? "✗ Rejected" : "Proposed Map Edits"}
        </span>
        <span className="meta"><b>{actions.length}</b> {actions.length === 1 ? "edit" : "edits"} · {label}</span>
      </div>
      <div className="proposal-actions">
        {actions.map((a, i) => (
          <div className="action-row" key={i}>
            <span className={"action-sigil " + a.kind}>{a.sigil}</span>
            <span className="action-verb">{a.verb}</span>
            <span className="action-detail">
              {a.detail}
              {a.effect && <span className="effect">⤷ {a.effect}</span>}
            </span>
          </div>
        ))}
      </div>
      {status === undefined && (
        <div className="proposal-foot">
          <button className="btn reject" onClick={onReject}>Reject</button>
          <button className="btn accept" onClick={onAccept}>Accept all →</button>
          <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 10.5, color: "var(--ink-4)", fontFamily: "Geist Mono", letterSpacing: "0.06em" }}>
            ⌘ ↵ to accept
          </span>
        </div>
      )}
      {status === "applied" && (
        <div className="proposal-foot">
          <span style={{ fontSize: 11, fontFamily: "Geist Mono", color: "var(--accept)", letterSpacing: "0.04em" }}>
            ✓ Map updated · {actions.length} edits applied
          </span>
          <button className="btn ghost" style={{ marginLeft: "auto" }} onClick={onUndo}>Undo</button>
        </div>
      )}
      {status === "rejected" && (
        <div className="proposal-foot">
          <span style={{ fontSize: 11, fontFamily: "Geist Mono", color: "var(--ink-3)" }}>Rejected · map unchanged</span>
        </div>
      )}
    </div>
  );
}

// ─── FSA card (CONTROLLED gen UI) ────────────────────────────────
function FSACard({ region }) {
  const r = region;
  return (
    <div className="fsa-card">
      <div className="fsa-card-head">
        <div>
          <span className="code">{r.centroid}</span>
          <span className="name" style={{ marginLeft: 6 }}>· {r.name}</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: D.outageColor(r.currentOut, r.peakOut), letterSpacing: "0.04em" }}>
          ● {r.ice >= 22 ? "EXTREME" : r.ice >= 15 ? "HIGH" : r.ice >= 8 ? "ELEVATED" : "MILD"}
        </span>
      </div>
      <div className="fsa-card-body">
        <div className="cell"><div className="k">Out · now</div><div className="v" style={{ color: D.outageColor(r.currentOut, r.peakOut) }}>{(r.currentOut/1000).toFixed(1)}K</div></div>
        <div className="cell"><div className="k">Peak so far</div><div className="v">{(r.peakOut/1000).toFixed(0)}K</div></div>
        <div className="cell"><div className="k">Ice accretion</div><div className="v">{r.ice} mm</div></div>
        <div className="cell"><div className="k">Broken poles</div><div className="v">{r.poles}</div></div>
        <div className="cell"><div className="k">Vulnerable hh</div><div className="v">{r.vulnerable.toLocaleString()}</div></div>
        <div className="cell"><div className="k">Warming centres</div><div className="v">{r.warming}</div></div>
      </div>
      {r.soe && (
        <div className="fsa-card-foot" style={{ background: "rgba(168, 42, 26, 0.06)", borderTop: "1px solid var(--rule)" }}>
          <span className="mono caps" style={{ fontSize: 9.5, color: "var(--risk)", letterSpacing: "0.12em" }}>State of Emergency Active</span>
        </div>
      )}
    </div>
  );
}

// ─── Inline chart (OPEN-ENDED gen UI) ───────────────────────────
function InlineChart({ data }) {
  const max = Math.max(...data.bars.map(b => b.value));
  return (
    <div className="inline-chart">
      <div className="cap">{data.title}</div>
      {data.bars.map(b => (
        <div className="bar-row" key={b.label}>
          <span style={{ color: "var(--ink-2)", fontSize: 11 }}>{b.label}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${(b.value/max)*100}%`, background: b.color || "var(--risk)" }}/>
          </span>
          <span className="tnum" style={{ textAlign: "right", color: "var(--ink-2)" }}>{b.display}</span>
        </div>
      ))}
      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--ink-4)", fontFamily: "Geist Mono", letterSpacing: "0.06em" }}>
        ↳ chart_widget · 0.4 s
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ROUTER — maps free-text prompts to agent responses
// ─────────────────────────────────────────────────────────────────
function routePrompt(text, state) {
  const t = text.toLowerCase();

  // Outage / risk overlay
  if (/outage|risk|spread|where.*likely/.test(t) && !/april 2|second/.test(t)) {
    return [{
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
          { kind: "zoom", sigil: "↗",  verb: "Zoom to",       detail: "Hardest-Hit Corridor bookmark", effect: "Center on central Ontario · 1.45×" },
        ],
      },
    }];
  }

  // ICE accretion
  if (/ice.*accretion|isoband|ice.*mm|freezing.*rain.*layer/.test(t)) {
    return [{
      role: "agent",
      text: "ECCC ice-accretion isobands for the storm. Lindsay tops out at 25 mm, Peterborough at 20 mm, Orillia at 19 mm, Barrie at 15 mm — Toronto stayed at 4 mm and was largely spared. I'll add the three warning bands too so the watch / warning / extreme zones read cleanly.",
      tool: "fetchECCC · GeoMet · 0.6 s",
      proposal: {
        id: "ice-overlay",
        label: "WeatherAgent",
        actions: [
          { kind: "add", sigil: "+", verb: "Add layer", detail: "Ice Accretion · isobands", effect: "Choropleth by mm of ice" },
          { kind: "add", sigil: "+", verb: "Add layer", detail: "ECCC Freezing-Rain Warnings", effect: "3 nested polygons · statement / warning / extreme" },
        ],
      },
    }];
  }

  // Broken poles
  if (/pole|broken|damage|asset/.test(t)) {
    return [{
      role: "agent",
      text: "Pole-break clusters from the FieldOps inspection feed. Across all of Ontario, ~2,700 poles broke during the storm — the densest clusters sit in Peterborough County (420), Muskoka (410), Kawartha Lakes (360), and Kingston (320).",
      tool: "queryFieldOps · 0.7 s",
      proposal: {
        id: "poles-overlay",
        label: "FieldOpsAgent",
        actions: [
          { kind: "add",  sigil: "+", verb: "Add layer",     detail: "Broken Poles · 2,700+", effect: "Point cluster per region" },
          { kind: "set",  sigil: "~", verb: "Symbolize",     detail: "Risk choropleth — proportional to poles", effect: "Underlying fill recoloured" },
        ],
      },
    }];
  }

  // Basemap switch
  if (/basemap|light theme|dark theme|imagery|satellite|topo/.test(t)) {
    let target = "light";
    if (/imagery|satellite|aerial/.test(t)) target = "imagery";
    else if (/topo/.test(t)) target = "topo";
    else if (/dark/.test(t)) target = "dark";
    return [{
      role: "agent",
      text: `Switching to the ${target === "dark" ? "Dark Gray Canvas" : target === "imagery" ? "Imagery hybrid" : target === "topo" ? "Topographic" : "Light Gray Canvas"} basemap. This is your default basemap for ${target === "light" ? "daytime ops rooms — place names will read more clearly." : target === "imagery" ? "field validation against aerial imagery." : target === "topo" ? "terrain context, useful for off-road feeder access." : "night operations and high-contrast data overlays."}`,
      tool: "setBasemap · 0.1 s",
      proposal: {
        id: "basemap-" + target,
        label: "MapAgent",
        actions: [
          { kind: "set", sigil: "~", verb: "Set basemap", detail: `${target === "dark" ? "Dark Gray Canvas" : target === "imagery" ? "Imagery (Hybrid)" : target === "topo" ? "Topographic" : "Light Gray Canvas"}`, effect: "Affects label and stroke contrast" },
        ],
      },
    }];
  }

  // Time replay
  if (/replay|playback|play.*storm|animate/.test(t)) {
    return [{
      role: "agent",
      text: "I'll replay the storm from Friday 19:00 through Sunday 17:00 — that captures the ramp, the peak (Sunday 09:00 at ~401K customers out), and the early restoration. The time slider will scrub automatically.",
      tool: "setTimeRange · 0.1 s",
      proposal: {
        id: "replay-storm",
        label: "MapAgent",
        actions: [
          { kind: "set",  sigil: "~", verb: "Set time",   detail: "Fri Mar 28 · 19:00", effect: "Initial state · 4,200 out" },
          { kind: "sym",  sigil: "▶", verb: "Animate",    detail: "Through Sun Mar 30 · 17:00", effect: "12 timestamps · 8s playback" },
          { kind: "add",  sigil: "+", verb: "Add layer",  detail: "Outage Density · time-aware",   effect: "Re-paints at each tick" },
        ],
      },
    }];
  }

  // Swipe / compare timestamps
  if (/swipe|compare.*saturday|compare.*sunday|side.by.side|before.*after|swipe.*compare/.test(t)) {
    return [{
      role: "agent",
      text: "Enabling a swipe comparison: left half locks to Saturday noon (174K out), right half to Sunday morning (401K out). Drag the divider to scrub the boundary. Same as the Esri Swipe widget, just time-aware.",
      tool: "enableSwipe · 0.2 s",
      proposal: {
        id: "swipe-sat-sun",
        label: "MapAgent",
        actions: [
          { kind: "add", sigil: "+", verb: "Enable swipe",  detail: "Saturday Mar 29 · 10:00 ↔ Sunday Mar 30 · 09:00", effect: "Vertical divider · drag to compare" },
          { kind: "add", sigil: "+", verb: "Add layer",     detail: "Outage Density on both sides",  effect: "Independent time per pane" },
        ],
      },
    }];
  }

  // States of emergency / Sunday 09:00
  if (/state.*of.*emergency|soe|emergencies were|sunday 09|peak.*sunday|peak.*storm|sunday morning/.test(t)) {
    return [{
      role: "agent",
      text: "Jumping to Sunday Mar 30 · 09:00 — the moment five municipalities declared states of emergency: Peterborough, Orillia, Oro-Medonte, Brock, and the District of Muskoka. Hydro One reports 401,000 customers without power across the province at this instant.",
      tool: "setTime · 0.1 s",
      proposal: {
        id: "soe-peak",
        label: "MapAgent",
        actions: [
          { kind: "set", sigil: "~",  verb: "Set time",   detail: "Sun Mar 30 · 09:00", effect: "Peak customers-out · 401K" },
          { kind: "add", sigil: "+",  verb: "Add layer",  detail: "States of Emergency · markers",       effect: "5 SoE flags across central Ontario" },
          { kind: "add", sigil: "+",  verb: "Add layer",  detail: "Warming Centres · live",              effect: "Reception centres mapped" },
        ],
      },
    }];
  }

  // April 2 second wave
  if (/april 2|second.*wave|second.*round|wednesday/.test(t)) {
    return [{
      role: "agent",
      text: "Jumping to Wed Apr 02 · 12:00 — the second freezing-rain band hit central Ontario after restoration was already underway. Re-outages spiked in Orillia and Muskoka.",
      tool: "setTime · 0.1 s",
      proposal: {
        id: "april2-wave",
        label: "MapAgent",
        actions: [
          { kind: "set", sigil: "~", verb: "Set time",  detail: "Wed Apr 02 · 12:00",   effect: "Second wave · 92K out" },
          { kind: "add", sigil: "+", verb: "Add layer", detail: "ECCC Freezing-Rain Warnings", effect: "Re-issued for central ON" },
        ],
      },
    }];
  }

  // Filter
  if (/filter.*ice|filter.*15mm|filter.*more than|filter.*risk|filter.*high/.test(t)) {
    const threshold = /15/.test(t) ? 15 : /20/.test(t) ? 20 : /10/.test(t) ? 10 : 15;
    return [{
      role: "agent",
      text: `Filtering the LDC Service Areas layer to show only regions with at least ${threshold} mm of ice accretion. Toronto, Mississauga, Vaughan and Ottawa will fade out — keeping focus on the hard-hit corridor.`,
      tool: "applyFilter · FeatureLayer · 0.2 s",
      proposal: {
        id: "filter-ice",
        label: "FilterAgent",
        actions: [
          { kind: "set", sigil: "~", verb: "Apply filter", detail: `iceAccretion ≥ ${threshold} mm`, effect: `${D.REGIONS.filter(r => r.ice >= threshold).length} of 11 regions visible` },
        ],
      },
    }];
  }

  // Near Me buffer
  if (/buffer|near me|within|km around|radius/.test(t)) {
    const match = t.match(/around .*?in (\w+)/i) || t.match(/in (\w+)/i);
    const target = match ? match[1].toLowerCase() : "peterborough";
    const region = D.REGIONS.find(r => r.centroid.toLowerCase().includes(target)) || D.REGIONS.find(r => r.id === "PETB");
    const km = /5\s?km/.test(t) ? 5 : /10\s?km/.test(t) ? 10 : 5;
    return [{
      role: "agent",
      text: `Running Near Me for ${region.centroid}: a ${km} km buffer around the pole-break cluster. Inside the ring you'll see ${Math.round(region.poles * 0.6)} of the broken poles, ${Math.round(region.vulnerable * 0.4).toLocaleString()} vulnerable households, and ${region.warming} warming centres.`,
      tool: "nearMe · 0.5 s · " + region.id,
      proposal: {
        id: "buffer-" + region.id,
        label: "AnalysisAgent",
        actions: [
          { kind: "add",  sigil: "+", verb: "Draw buffer", detail: `${km} km ring · centroid of ${region.centroid}`, effect: "Annotation on map" },
          { kind: "add",  sigil: "+", verb: "Add layer",   detail: "Broken Poles inside buffer", effect: `${Math.round(region.poles * 0.6)} features` },
          { kind: "zoom", sigil: "↗", verb: "Zoom to",     detail: "Buffer extent",              effect: `${region.centroid} · 1.7×` },
        ],
        meta: { regionId: region.id, km },
      },
    }];
  }

  // Compare top 5
  if (/compare.*top|top.*regions|top.*5|rank/.test(t)) {
    const top = [...D.REGIONS].sort((a,b) => b.currentOut - a.currentOut).slice(0, 5);
    return [{
      role: "agent",
      text: "Top 5 regions by customers currently without power. Peterborough County leads at 19.8K, then Kawartha Lakes (Lindsay) at 17.2K, then Muskoka, Barrie, and Haliburton. This drives the crew-routing priorities.",
      tool: "rankRegions · 0.5 s",
      chart: {
        title: "Customers without power · current",
        bars: top.map(r => ({
          label: r.centroid,
          value: r.currentOut,
          display: (r.currentOut/1000).toFixed(1) + "K",
          color: D.outageColor(r.currentOut, r.peakOut),
        })),
      },
    }];
  }

  // Inspect a region
  if (/inspect|tell me about|details.*for|look at/.test(t)) {
    const candidates = D.REGIONS.find(r => t.includes(r.centroid.toLowerCase()))
                    || D.REGIONS.find(r => t.includes(r.id.toLowerCase()))
                    || D.REGIONS.find(r => t.includes(r.name.toLowerCase().split(" ")[0]))
                    || D.REGIONS[0];
    return [{
      role: "agent",
      text: `${candidates.name} (${candidates.utility}) — ${candidates.currentOut.toLocaleString()} customers currently out of ${candidates.customers.toLocaleString()} total. Ice accretion peaked at ${candidates.ice} mm, ${candidates.poles} poles broke, ${candidates.warming} warming centres are active.`,
      tool: "fetchFeature · ArcGIS Feature Service · 0.3 s",
      fsaCard: candidates,
    }];
  }

  // Notifications / vulnerable households
  if (/notify|notification|customer|vulnerable|sms|warming|medical/.test(t)) {
    const m = t.match(/in (\w+)/i);
    const target = m ? m[1].toLowerCase() : "orillia";
    const region = D.REGIONS.find(r => r.centroid.toLowerCase().includes(target)) || D.REGIONS.find(r => r.id === "ORIL");
    return [{
      role: "agent",
      text: `I can target the ${region.vulnerable.toLocaleString()} vulnerable households in ${region.centroid} — seniors 75+, medical-equipment registrants, and low-income households. This is irreversible, so I'll stage it as an edit you approve.`,
      tool: "draftNotifications · CommsAgent · 1.1 s",
      proposal: {
        id: "notify-" + region.id,
        label: "CommsAgent",
        actions: [
          { kind: "add", sigil: "+", verb: "Add layer",  detail: `Vulnerable households · ${region.centroid}`, effect: `${region.vulnerable.toLocaleString()} features highlighted` },
          { kind: "sym", sigil: "~", verb: "Stage SMS",  detail: "Draft message for medical-equipment registrants", effect: "Hydro One callback: 1-800-434-1235" },
          { kind: "sym", sigil: "~", verb: "Stage email", detail: "Bilingual EN/FR · warming-centre addresses", effect: `${region.warming} centres referenced` },
        ],
        meta: { regionId: region.id },
      },
    }];
  }

  // Mutual aid
  if (/mutual.*aid|crew.*routing|route.*crews|mutual.*assistance|plan.*crews/.test(t)) {
    const m = t.match(/to (\w+)/i);
    const target = m ? m[1].toLowerCase() : "muskoka";
    const region = D.REGIONS.find(r => r.name.toLowerCase().includes(target)) || D.REGIONS.find(r => r.id === "MUSK");
    return [{
      role: "agent",
      text: `Routing mutual-aid crews to ${region.name}. Hydro One has 30 utility partners under their mutual-assistance program — Alectra, Toronto Hydro, Hydro Ottawa, Epcor, New Brunswick Power, and 25 others. For ${region.name} I'd pre-stage ~14 crews drawn from the southern utilities (12 h lead time) plus 6 forestry crews.`,
      tool: "planMutualAid · 0.8 s",
      proposal: {
        id: "mutual-" + region.id,
        label: "PlannerAgent",
        actions: [
          { kind: "add",  sigil: "+", verb: "Add layer",   detail: "Mutual Aid Crew Origins · 30 utilities", effect: "Lines to incident regions" },
          { kind: "add",  sigil: "+", verb: "Stage dispatch", detail: `14 line crews + 6 forestry · ${region.centroid}`,  effect: "Workforce queue · pending approval" },
          { kind: "zoom", sigil: "↗", verb: "Zoom to",     detail: region.name,                              effect: `${region.centroid} · 1.55×` },
        ],
        meta: { regionId: region.id },
      },
    }];
  }

  // Bookmark
  if (/bookmark/.test(t)) {
    return [{
      role: "agent",
      text: "Bookmarking the Hardest-Hit Corridor extent — center on central Ontario at 1.45× scale. The Esri Bookmark widget will let you return here in one click after panning around.",
      tool: "createBookmark · 0.1 s",
      proposal: {
        id: "bookmark-corridor",
        label: "MapAgent",
        actions: [
          { kind: "add",  sigil: "+", verb: "Save bookmark", detail: "Hardest-Hit Corridor · 1.45×",   effect: "Persisted to web map" },
          { kind: "zoom", sigil: "↗", verb: "Zoom to",       detail: "Hardest-Hit Corridor",            effect: "Apply now" },
        ],
      },
    }];
  }

  // Default
  return [{
    role: "agent",
    text: "I can change the map for you — add and remove layers, filter features, switch basemaps, scrub time, run spatial analysis, draw buffers, and stage customer notifications. Try one of the suggestions below, or ask me directly.",
  }];
}

window.K2_AGENT = { AgentPanel, routePrompt };
})();
