/* global React, L */
(function () {
const { useState, useEffect, useRef } = React;
const D = window.K2_DATA;

// Deterministic pseudo-random (for jittered point clusters)
function jitter(seed, range) {
  const r = Math.abs(Math.sin(seed * 12.9898) * 43758.5453);
  return ((r - Math.floor(r)) - 0.5) * range;
}

// ─────────────────────────────────────────────────────────────────
// MAP — real Leaflet tiles, real lat/lon
// ─────────────────────────────────────────────────────────────────
function MapView({ state, onSelect, onMapReady }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const tileRef      = useRef(null);
  const layerRefs    = useRef({});      // id -> Leaflet layer/group
  const labelRef     = useRef(null);    // place label layer
  const swipeDivRef  = useRef(null);    // swipe divider element
  const swipePanesReady = useRef(false);

  // ─── init map once ─────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [44.5, -78.5],
      zoom: 7,
      minZoom: 5, maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      worldCopyJump: false,
    });
    L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);
    L.control.scale({ position: "bottomleft", imperial: false, maxWidth: 140 }).addTo(map);
    L.control.zoom({ position: "topleft" }).addTo(map);

    // custom panes for stacked draw order
    map.createPane("warnings").style.zIndex = 350;
    map.createPane("regions").style.zIndex  = 400;
    map.createPane("bubbles").style.zIndex  = 460;
    map.createPane("labels").style.zIndex   = 620;

    mapRef.current = map;
    onMapReady?.(map);

    // initial tile layer
    swapBasemap(state.basemap);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── basemap switching ─────────────────────────────────
  function swapBasemap(basemapId) {
    const map = mapRef.current;
    if (!map) return;
    const bm = D.BASEMAPS.find(b => b.id === basemapId) || D.BASEMAPS[0];
    if (tileRef.current) map.removeLayer(tileRef.current);
    const t = L.tileLayer(bm.url, {
      attribution: bm.attribution,
      subdomains: bm.subdomains || "abc",
      maxZoom: bm.maxZoom || 19,
    });
    t.addTo(map);
    tileRef.current = t;
    // force redraw label colors etc. by re-running the layer renderer
    rebuildLayers();
  }
  useEffect(() => { swapBasemap(state.basemap); /* eslint-disable-next-line */ }, [state.basemap]);

  // ─── bookmark / fly-to ─────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const bk = D.BOOKMARKS.find(b => b.id === state.bookmark);
    if (bk) map.flyTo(bk.center, bk.zoom, { duration: 1.0 });
  }, [state.bookmark]);

  // ─── layer rebuild on any state change ─────────────────
  function rebuildLayers() {
    const map = mapRef.current;
    if (!map) return;
    const { layers, timeHour, selected, proposedRegions, annotations, swipe, basemap } = state;
    const bm = D.BASEMAPS.find(b => b.id === basemap) || D.BASEMAPS[0];

    // clear all dynamic layers
    Object.values(layerRefs.current).forEach(l => { try { map.removeLayer(l); } catch {} });
    layerRefs.current = {};

    const layerOn = (id) => layers.find(l => l.id === id)?.on;

    // ── Boundaries ────────────────────────────────────────
    if (layerOn("boundaries")) {
      const g = L.featureGroup([], { pane: "regions" });
      D.REGIONS.forEach(r => {
        const isSelected = selected === r.id;
        const isProposed = proposedRegions?.includes(r.id);
        const poly = L.polygon(r.polygon, {
          pane: "regions",
          color: isProposed ? "#5B47E0" : isSelected ? "#FFFFFF" : (bm.id === "light" || bm.id === "topo" ? "#3F4955" : "#7B8794"),
          weight: isProposed ? 2.2 : isSelected ? 2.2 : 1.0,
          dashArray: isProposed ? "5,4" : null,
          fillOpacity: 0,
          opacity: 0.85,
          interactive: true,
          smoothFactor: 1.5,
        });
        poly.on("click", () => onSelect(r.id));
        poly.on("mouseover", function () { this.setStyle({ fillOpacity: 0.10, fillColor: "#FFFFFF" }); });
        poly.on("mouseout",  function () { this.setStyle({ fillOpacity: 0 }); });
        poly.bindTooltip(
          `<div class="lf-tip">
             <div class="lf-tip-head"><b>${r.centroid}</b><span>${r.utility}</span></div>
             <div class="lf-tip-row"><span>Out · now</span><b style="color:${D.outageColor(D.regionOutAt(r, timeHour), r.peakOut)}">${D.regionOutAt(r, timeHour).toLocaleString()}</b></div>
             <div class="lf-tip-row"><span>Ice accretion</span><b>${D.regionIceAt(r, timeHour)} mm</b></div>
             <div class="lf-tip-row"><span>Broken poles</span><b>${Math.round(r.poles * D.timeFactor(timeHour))}</b></div>
             ${r.soe ? '<div class="lf-tip-soe">State of Emergency</div>' : ""}
           </div>`,
          { sticky: true, direction: "top", offset: [0, -8], className: "lf-tip-wrapper" }
        );
        poly.addTo(g);
      });
      g.addTo(map);
      layerRefs.current.boundaries = g;
    }

    // ── Outage choropleth ─────────────────────────────────
    if (layerOn("risk")) {
      const g = L.featureGroup([], { pane: "regions" });
      D.REGIONS.forEach(r => {
        const out = D.regionOutAt(r, timeHour);
        if (out < 200) return;
        const opacity = Math.min(0.78, 0.18 + (out / r.peakOut) * 0.55);
        L.polygon(r.polygon, {
          pane: "regions",
          color: "#0F1A20", weight: 0,
          fillColor: D.outageColor(out, r.peakOut),
          fillOpacity: opacity,
          interactive: false,
        }).addTo(g);
      });
      g.addTo(map);
      layerRefs.current.risk = g;
    }

    // ── Ice accretion isobands ────────────────────────────
    if (layerOn("iceAccretion")) {
      const g = L.featureGroup([], { pane: "regions" });
      D.REGIONS.forEach(r => {
        const mm = D.regionIceAt(r, timeHour);
        if (mm < 2) return;
        L.polygon(r.polygon, {
          pane: "regions",
          color: "#0F1A20", weight: 0,
          fillColor: D.iceColor(mm),
          fillOpacity: 0.45,
          interactive: false,
        }).addTo(g);
      });
      g.addTo(map);
      layerRefs.current.iceAccretion = g;
    }

    // ── ECCC warning bands ────────────────────────────────
    if (layerOn("warnings")) {
      const g = L.featureGroup([], { pane: "warnings" });
      D.WARNINGS.forEach(w => {
        L.polygon(w.polygon, {
          pane: "warnings",
          color: w.color, weight: 1.2, dashArray: "6,4",
          fillColor: w.color, fillOpacity: 0.10,
          interactive: false,
        }).addTo(g);
      });
      g.addTo(map);
      layerRefs.current.warnings = g;
    }

    // ── Tree canopy ───────────────────────────────────────
    if (layerOn("canopy")) {
      const g = L.featureGroup([], { pane: "regions" });
      D.REGIONS.forEach(r => {
        L.polygon(r.polygon, {
          pane: "regions",
          color: "#2E7D5B", weight: 0,
          fillColor: "#2E7D5B",
          fillOpacity: 0.18,
          interactive: false,
        }).addTo(g);
      });
      g.addTo(map);
      layerRefs.current.canopy = g;
    }

    // ── Customers bubbles ─────────────────────────────────
    if (layerOn("customers")) {
      const g = L.featureGroup([], { pane: "bubbles" });
      D.REGIONS.forEach(r => {
        const out = D.regionOutAt(r, timeHour);
        if (out < 200) return;
        const radius = Math.max(6, Math.sqrt(out) * 0.32);
        const c = L.circleMarker(r.center, {
          pane: "bubbles",
          radius,
          color: "rgba(217, 104, 46, 0.95)",
          weight: 1.2,
          fillColor: "rgba(217, 104, 46, 0.55)",
          fillOpacity: 1,
        });
        c.bindTooltip(
          `<b>${r.centroid}</b><br/>${out.toLocaleString()} customers out`,
          { sticky: false, direction: "top", offset: [0, -4], className: "lf-tip-mini" }
        );
        c.addTo(g);
      });
      g.addTo(map);
      layerRefs.current.customers = g;
    }

    // ── OMS outage points (clustered) ─────────────────────
    if (layerOn("outageHistory")) {
      const g = L.featureGroup([], { pane: "bubbles" });
      D.REGIONS.forEach(r => {
        const out = D.regionOutAt(r, timeHour);
        const n = Math.min(60, Math.round(out / 600));
        for (let i = 0; i < n; i++) {
          const lat = r.center[0] + jitter(r.center[0] * 100 + i * 7, 0.20);
          const lng = r.center[1] + jitter(r.center[1] * 100 + i * 11, 0.30);
          L.circleMarker([lat, lng], {
            pane: "bubbles",
            radius: 2.5,
            color: "#FFFFFF",
            weight: 0.6,
            fillColor: "#D9682E",
            fillOpacity: 0.9,
          }).addTo(g);
        }
      });
      g.addTo(map);
      layerRefs.current.outageHistory = g;
    }

    // ── Broken poles ─────────────────────────────────────
    if (layerOn("poles")) {
      const g = L.featureGroup([], { pane: "bubbles" });
      D.REGIONS.forEach(r => {
        const totalPoles = Math.round(r.poles * D.timeFactor(timeHour));
        const n = Math.min(28, Math.round(totalPoles / 15));
        for (let i = 0; i < n; i++) {
          const lat = r.center[0] + jitter(r.center[0] * 200 + i * 5, 0.16);
          const lng = r.center[1] + jitter(r.center[1] * 200 + i * 13, 0.24);
          const div = L.divIcon({
            className: "pole-icon",
            html: '<span>×</span>',
            iconSize: [12, 12], iconAnchor: [6, 6],
          });
          L.marker([lat, lng], { icon: div, pane: "bubbles" }).addTo(g);
        }
      });
      g.addTo(map);
      layerRefs.current.poles = g;
    }

    // ── Warming centres ──────────────────────────────────
    if (layerOn("warming")) {
      const g = L.featureGroup([], { pane: "bubbles" });
      D.REGIONS.filter(r => r.warming > 0).forEach(r => {
        for (let i = 0; i < r.warming; i++) {
          const lat = r.center[0] + jitter(r.center[0] * 50 + i * 17, 0.12);
          const lng = r.center[1] + jitter(r.center[1] * 50 + i * 23, 0.20);
          const div = L.divIcon({
            className: "warming-icon",
            html: '<span>W</span>',
            iconSize: [14, 14], iconAnchor: [7, 7],
          });
          L.marker([lat, lng], { icon: div, pane: "bubbles" })
            .bindTooltip(`Warming centre · ${r.centroid}`, { direction: "top" })
            .addTo(g);
        }
      });
      g.addTo(map);
      layerRefs.current.warming = g;
    }

    // ── States of emergency ──────────────────────────────
    if (layerOn("soe")) {
      const g = L.featureGroup([], { pane: "bubbles" });
      D.REGIONS.filter(r => r.soe).forEach(r => {
        const div = L.divIcon({
          className: "soe-icon",
          html: '<span>!</span>',
          iconSize: [18, 18], iconAnchor: [9, 9],
        });
        L.marker([r.center[0] + 0.05, r.center[1] - 0.05], { icon: div, pane: "bubbles" })
          .bindTooltip(`State of Emergency · ${r.centroid}`, { direction: "top" })
          .addTo(g);
      });
      g.addTo(map);
      layerRefs.current.soe = g;
    }

    // ── Vulnerable households heatmap ────────────────────
    if (layerOn("vulnerable")) {
      const g = L.featureGroup([], { pane: "regions" });
      D.REGIONS.forEach(r => {
        const factor = Math.sqrt(r.vulnerable) * 0.0006;
        for (const [scale, alpha] of [[2.4, 0.08], [1.4, 0.18], [0.7, 0.32]]) {
          L.circle(r.center, {
            pane: "regions",
            radius: factor * 60000 * scale,
            color: "transparent",
            fillColor: "#5B47E0",
            fillOpacity: alpha,
            interactive: false,
          }).addTo(g);
        }
      });
      g.addTo(map);
      layerRefs.current.vulnerable = g;
    }

    // ── Feeders ──────────────────────────────────────────
    if (layerOn("feeders")) {
      const g = L.featureGroup([], { pane: "regions" });
      D.REGIONS.forEach(r => {
        const [lat, lng] = r.center;
        const pts = [
          [[lat-0.05, lng-0.18], [lat, lng-0.08], [lat+0.04, lng+0.12]],
          [[lat, lng-0.08], [lat+0.08, lng-0.20]],
          [[lat+0.04, lng+0.12], [lat+0.10, lng+0.05]],
        ];
        pts.forEach(line => {
          L.polyline(line, { pane: "regions", color: "#7BC8B8", weight: 1, opacity: 0.7, interactive: false }).addTo(g);
        });
      });
      g.addTo(map);
      layerRefs.current.feeders = g;
    }

    // ── Substations ──────────────────────────────────────
    if (layerOn("substations")) {
      const g = L.featureGroup([], { pane: "bubbles" });
      D.REGIONS.forEach(r => {
        const ssCount = Math.max(1, Math.round(r.customers / 35000));
        for (let i = 0; i < ssCount; i++) {
          const lat = r.center[0] + jitter(r.center[0] * 70 + i * 9, 0.18);
          const lng = r.center[1] + jitter(r.center[1] * 70 + i * 13, 0.28);
          const div = L.divIcon({
            className: "substation-icon",
            html: '',
            iconSize: [8, 8], iconAnchor: [4, 4],
          });
          L.marker([lat, lng], { icon: div, pane: "bubbles" }).addTo(g);
        }
      });
      g.addTo(map);
      layerRefs.current.substations = g;
    }

    // ── Mutual aid (text icon ring near affected centroids) ──
    if (layerOn("mutualAid")) {
      const g = L.featureGroup([], { pane: "bubbles" });
      D.REGIONS.filter(r => r.peakOut > 25000).forEach(r => {
        const div = L.divIcon({
          className: "ma-icon",
          html: '<span>MA</span>',
          iconSize: [22, 22], iconAnchor: [11, 11],
        });
        L.marker([r.center[0] - 0.06, r.center[1] + 0.10], { icon: div, pane: "bubbles" })
          .bindTooltip(`Mutual Aid · ${r.centroid}`, { direction: "top" })
          .addTo(g);
      });
      g.addTo(map);
      layerRefs.current.mutualAid = g;
    }

    // ── Place labels (drawn last on top) ─────────────────
    if (layerOn("labels")) {
      const g = L.featureGroup([], { pane: "labels" });
      D.REGIONS.forEach(r => {
        const div = L.divIcon({
          className: "place-label" + (bm.textOnDark ? " on-dark" : " on-light"),
          html: `<span>${r.centroid}</span>`,
          iconSize: [120, 18], iconAnchor: [60, 9],
        });
        L.marker(r.center, { icon: div, pane: "labels", interactive: false }).addTo(g);
      });
      g.addTo(map);
      layerRefs.current.labels = g;
    }

    // ── Annotations (buffer rings, polys) ────────────────
    if (annotations?.length) {
      const g = L.featureGroup([], { pane: "regions" });
      annotations.forEach(a => {
        if (a.kind === "buffer") {
          L.circle(a.center, {
            pane: "regions",
            radius: a.km * 1000,
            color: "#5B47E0",
            weight: 2, dashArray: "5,4",
            fillColor: "#5B47E0",
            fillOpacity: 0.08,
            interactive: false,
          }).addTo(g);
          L.circleMarker(a.center, {
            pane: "bubbles",
            radius: 3, color: "#5B47E0", fillColor: "#5B47E0", fillOpacity: 1,
          }).bindTooltip(a.label, { direction: "right", offset: [10, 0] }).addTo(g);
        }
      });
      g.addTo(map);
      layerRefs.current.annotations = g;
    }
  }

  // re-render when state changes
  useEffect(() => {
    rebuildLayers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.layers, state.timeHour, state.selected, state.proposedRegions, state.annotations, state.basemap]);

  return (
    <div className="leaflet-host">
      <div ref={containerRef} className="leaflet-container-real"/>
    </div>
  );
}

window.K2_MAP = { MapView };
})();
