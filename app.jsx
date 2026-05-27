/* global React, ReactDOM */
(function () {
const { useState, useEffect, useMemo, useRef } = React;
const { FSA_DATA } = window.KARDASHEV_DATA;

function App() {
  const [persona, setPersona] = useState("operations"); // operations | emergency | homeowner
  const [tHours, setTHours] = useState(-18);
  const [selected, setSelected] = useState("L4Y");
  const [briefTab, setBriefTab] = useState("ude"); // ude rank plan comms trace
  const [layers, setLayers] = useState({
    outage: true, cone: true, canopy: false, assets: false, history: false, welfare: false,
  });
  const [replay, setReplay] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [agentTask, setAgentTask] = useState({ phases: ["ForecastAgent · composing UDE for L4Y", "PlannerAgent · drafting plan"], done: true });
  const [etaSeconds, setEtaSeconds] = useState(18 * 3600 + 42 * 60 + 11);

  // storm clock decrement
  useEffect(() => {
    const id = setInterval(() => setEtaSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  // replay animation
  useEffect(() => {
    if (!replay) return;
    let start = performance.now();
    let raf;
    const dur = 8000;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      setTHours(Math.round(-72 + p * 72));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setReplay(false);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [replay]);

  // persona switch — set sensible default brief
  useEffect(() => {
    if (persona === "emergency")      setBriefTab("comms");
    else if (persona === "homeowner") setBriefTab("home");
    else                              setBriefTab("ude");
  }, [persona]);

  const selectedFSA = useMemo(() => FSA_DATA.find(f => f.code === selected) || FSA_DATA[0], [selected]);

  const handleSelect = (code) => {
    setSelected(code);
    setBriefTab("ude");
    setAgentTask({ phases: [`ForecastAgent · composing UDE for ${code}`, "Coordinator · resolving"] });
  };

  const handleSuggest = (text) => {
    if (/plan/i.test(text)) { setBriefTab("plan"); setAgentTask({ phases: ["PlannerAgent · pre-positioning", "Workforce · roster check"] }); }
    else if (/notify|vulnerable|welfare|dialysis|warming/i.test(text)) { setBriefTab("comms"); setAgentTask({ phases: ["CommsAgent · drafting", "StatCan · audience filter"] }); }
    else if (/why|first/i.test(text)) { setBriefTab("ude"); }
  };

  const handleJump = (key) => {
    if (key === "fsas" || key === "customers") setBriefTab("rank");
    else if (key === "crews" || key === "gap") setBriefTab("plan");
  };

  // Render brief content
  let briefContent = null;
  if (persona === "homeowner") {
    briefContent = <window.HomeownerCard/>;
  } else if (briefTab === "ude")   briefContent = <window.UDECard selectedFSA={selectedFSA} onSchedule={() => setScheduleOpen(true)} />;
  else if (briefTab === "rank")    briefContent = <window.RankedCard onPick={handleSelect}/>;
  else if (briefTab === "plan")    briefContent = <window.PlanCard/>;
  else if (briefTab === "comms")   briefContent = <window.CommsCard targetFSA={selectedFSA}/>;
  else if (briefTab === "trace")   briefContent = <window.TraceCard/>;
  else if (briefTab === "home")    briefContent = <window.HomeownerCard/>;

  // ─── Homeowner persona uses a simplified layout ─────────
  if (persona === "homeowner") {
    return (
      <>
        <div style={{ display: "grid", gridTemplateRows: "64px 1fr", height: "100%", background: "var(--canvas)" }}>
          <window.TopBar persona={persona} onPersona={setPersona} etaSeconds={etaSeconds}/>
          <div className="flex" style={{ minHeight: 0 }}>
            <div className="flex-1 flex flex-col items-center justify-start p-8 gap-6">
              <div className="text-center">
                <div className="mono caps" style={{ fontSize: 10, color: "var(--cyan)", letterSpacing: "0.14em" }}>Resident View · Finale Preview</div>
                <div className="serif" style={{ fontSize: 36, marginTop: 8 }}>your home, before the storm</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>Enter your postal code to see your personalised resilience plan.</div>
              </div>
              <div className="flex" style={{ width: 480, border: "1px solid var(--rule-strong)", background: "var(--paper)" }}>
                <input defaultValue="L4Y 3R5" className="mono flex-1 px-4 py-3" style={{ background: "transparent", border: "none", outline: "none", fontSize: 16, letterSpacing: "0.08em" }}/>
                <button className="btn cyan" style={{ borderTop: "none", borderRight: "none", borderBottom: "none" }}>Look up →</button>
              </div>
              <div style={{ width: 720, marginTop: 16 }}>
                {briefContent}
              </div>
            </div>
          </div>
        </div>
        <window.ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)}/>
      </>
    );
  }

  return (
    <>
      <div className="shell">
        {/* Row 1: Top bar */}
        <div style={{ gridColumn: "1 / -1" }}>
          <window.TopBar persona={persona} onPersona={setPersona} etaSeconds={etaSeconds}/>
        </div>

        {/* Row 2: Storm summary strip */}
        <div style={{ gridColumn: "1 / -1" }}>
          <window.StormStrip persona={persona} onJump={handleJump}/>
        </div>

        {/* Row 3: Main grid - left rail, map, right rail */}
        <window.LeftRail
          persona={persona}
          tHours={tHours}
          setTHours={setTHours}
          layers={layers}
          setLayers={setLayers}
          replay={replay}
          onReplay={() => setReplay(r => !r)}
        />

        <div style={{ position: "relative", overflow: "hidden" }}>
          <window.MapCanvas
            selected={selected}
            onSelect={handleSelect}
            layers={layers}
            tHours={tHours}
          />
        </div>

        <div style={{ borderLeft: "1px solid var(--rule)", display: "grid", gridTemplateRows: "55% 45%", minHeight: 0, overflow: "hidden" }}>
          <window.Chat persona={persona} agentTask={agentTask} onSuggest={handleSuggest}/>
          <div style={{ borderTop: "1px solid var(--rule)", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            <window.BriefHeader active={briefTab} onPick={setBriefTab}/>
            <div className="thin-scroll" style={{ overflow: "auto", flex: 1 }}>
              {briefContent}
            </div>
          </div>
        </div>

        {/* Row 4: Bottom ranked table */}
        <div style={{ gridColumn: "1 / -1", minHeight: 0, display: "flex" }}>
          <window.BottomTable persona={persona} selected={selected} onPick={handleSelect}/>
        </div>
      </div>
      <window.ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)}/>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
})();
