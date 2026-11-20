"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { shallowEqual, useSelector } from "react-redux";
import PageHeader from "@/components/common/PageHeader";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/common/Button";
import IconButton from "@/components/common/IconButton";
import SystemMap from "@/features/visual-flow/SystemMap";
import FlowExplorer, { ChipGroup } from "@/features/visual-flow/FlowExplorer";
import SiteMap from "@/features/visual-flow/SiteMap";
import { FLOWS, SYNC_RULES, MODULES, SITEMAP, SLICES, TONES, moduleById, sliceById } from "@/features/visual-flow/flowData";

import HubIcon from "@mui/icons-material/Hub";
import RouteIcon from "@mui/icons-material/Route";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const VIEWS = [
  { id: "map", label: "System map", icon: HubIcon, hint: "How pages connect to data" },
  { id: "flows", label: "Business flows", icon: RouteIcon, hint: "Step-by-step journeys" },
  { id: "sitemap", label: "Sitemap", icon: AccountTreeIcon, hint: "Every route, one click away" },
];

const surfaceStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-card)",
};

export default function VisualFlowPage() {
  const [view, setView] = useState("map");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // { type: "module" | "slice", id }
  const [hovered, setHovered] = useState(null);
  const [flowId, setFlowId] = useState(FLOWS[1].id);
  const [showReads, setShowReads] = useState(true);
  const [showWrites, setShowWrites] = useState(true);
  const [showSync, setShowSync] = useState(true);

  // Live record counts straight from the store
  const counts = useSelector(
    (state) => ({
      products: state.products.items.length,
      inventory: state.inventory.movements.length,
      orders: state.orders.items.length,
      shippingReturns: state.shippingReturns.shipments.length + state.shippingReturns.returns.length + state.shippingReturns.rtos.length,
      suppliersPurchases: state.suppliersPurchases.suppliers.length + state.suppliersPurchases.purchases.length,
      finance: state.finance.expenses.length + state.finance.settlements.length,
      settings: 1,
      notifications: state.notifications.items.length,
    }),
    shallowEqual
  );

  // Search across modules, slices and flows (null = no filter)
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const has = (...parts) => parts.flat().join(" ").toLowerCase().includes(q);
    const set = new Set();
    MODULES.forEach((m) => has(m.name, m.summary, m.href, m.actions, m.dialogs) && set.add(`module:${m.id}`));
    SLICES.forEach((s) => has(s.name, s.holds, s.storageKey) && set.add(`slice:${s.id}`));
    FLOWS.forEach((f) => has(f.title, f.summary, f.steps.map((st) => [st.title, st.detail, st.actions])) && set.add(`flow:${f.id}`));
    return set;
  }, [query]);

  const focus = hovered || selected;

  const showOnMap = (moduleId) => {
    setView("map");
    setSelected({ type: "module", id: moduleId });
  };
  const openFlow = (id) => {
    setFlowId(id);
    setView("flows");
  };

  const totalRoutes = SITEMAP.reduce((n, g) => n + g.routes.length + g.routes.reduce((c, r) => c + (r.children?.length || 0), 0), 0);

  return (
    <div className="space-y-6">
      <style>{`
        .vf-node { background-color: var(--bg-surface); border: 1px solid var(--border); transition: border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease, transform 160ms ease; }
        .vf-node:not(.vf-static):hover { border-color: var(--border-strong); box-shadow: var(--shadow-card); }
        .vf-node:not(.vf-static):active { transform: scale(0.99); }
        .vf-node:focus-visible { outline: 2px solid var(--brand-500); outline-offset: 2px; }
        @keyframes vf-dash { to { stroke-dashoffset: -24; } }
        .vf-flow { stroke-dasharray: 8 4; animation: vf-dash 0.9s linear infinite; }
        .vf-enter { animation: sd-rise-sm 260ms var(--ease-out) both; }
        @media (prefers-reduced-motion: reduce) { .vf-flow, .vf-enter { animation: none; } }
      `}</style>

      <PageHeader
        title="How SellerDesk Works"
        subtitle="Explore how pages, data and business processes connect. Hover or click anything to trace it."
        breadcrumbs={[{ label: "Visual Flow" }]}
      />

      {/* At a glance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Feature modules", value: MODULES.length, note: "pages in the sidebar", tone: "blue" },
          { label: "Redux slices", value: SLICES.length, note: "saved to localStorage", tone: "emerald" },
          { label: "Business flows", value: FLOWS.length, note: "walk-throughs below", tone: "amber" },
          { label: "Routes", value: totalRoutes, note: "public, auth and app", tone: "purple" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={surfaceStyle}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              <span className={`h-1.5 w-1.5 rounded-full ${TONES[s.tone].dot}`} />
              {s.label}
            </div>
            <div className="font-display mt-1 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {s.value}
            </div>
            <div className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {s.note}
            </div>
          </div>
        ))}
      </div>

      {/* Big picture: the 4 layers */}
      <section className="rounded-2xl p-4 sm:p-5" style={surfaceStyle}>
        <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          The big picture
        </h2>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-0">
          {[
            { title: "Public site & sign-in", body: "Landing, pricing and auth pages. Signing in opens the seller app.", tone: "slate" },
            { title: "App shell", body: "Sidebar, header and notification bell wrap every app page.", tone: "blue" },
            { title: "Feature pages & dialogs", body: "Each module reads data and dispatches actions through forms and dialogs.", tone: "amber" },
            { title: "Store + sync layer → localStorage", body: "Eight slices hold all data, sync rules keep them consistent, and every change is saved in the browser.", tone: "emerald" },
          ].map((layer, i, arr) => (
            <li key={layer.title} className="flex md:flex-col items-stretch">
              <div className="flex flex-1 md:flex-row items-center">
                <div className={`flex-1 rounded-xl p-3 ring-1 ${TONES[layer.tone].soft} ${TONES[layer.tone].ring}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${TONES[layer.tone].text}`}>Layer {i + 1}</div>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{layer.title}</div>
                  <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{layer.body}</p>
                </div>
                {i < arr.length - 1 && (
                  <span className="hidden md:block px-1.5 text-lg" style={{ color: "var(--text-tertiary)" }} aria-hidden="true">→</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Explorer */}
      <section className="rounded-2xl" style={surfaceStyle}>
        <div className="flex flex-col gap-3 p-4 sm:p-5 md:flex-row md:items-center md:justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex gap-1 rounded-xl p-1 overflow-x-auto" style={{ backgroundColor: "var(--bg-surface2)" }} role="tablist" aria-label="Views">
            {VIEWS.map((v) => {
              const active = view === v.id;
              const Icon = v.icon;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setView(v.id)}
                  title={v.hint}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                  style={active ? { backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", boxShadow: "var(--shadow-card)" } : { color: "var(--text-secondary)" }}
                >
                  <Icon sx={{ fontSize: 16 }} />
                  {v.label}
                </button>
              );
            })}
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder="Search pages, data, actions..." className="md:max-w-xs" />
        </div>

        <div className="p-4 sm:p-5">
          {view === "map" && (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
              <div className="min-w-0">
                {/* Legend + filters */}
                <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                  <LegendToggle checked={showReads} onChange={setShowReads} color="rgb(59 130 246)" dashed label="Reads data" />
                  <LegendToggle checked={showWrites} onChange={setShowWrites} color="rgb(16 185 129)" label="Writes data" />
                  <LegendToggle checked={showSync} onChange={setShowSync} color="rgb(168 85 247)" dash="2 3" label="Updated via sync" />
                  <span className="flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                    <TouchAppIcon sx={{ fontSize: 14 }} />
                    Hover to preview, click to pin
                  </span>
                </div>
                <SystemMap
                  focus={focus}
                  onFocus={setHovered}
                  selected={selected}
                  onSelect={setSelected}
                  matches={matches}
                  counts={counts}
                  showReads={showReads}
                  showWrites={showWrites}
                  showSync={showSync}
                  ruleCount={SYNC_RULES.length}
                />
              </div>
              <DetailsPanel
                selected={selected}
                counts={counts}
                onSelect={setSelected}
                onOpenFlow={openFlow}
              />
            </div>
          )}

          {view === "flows" && (
            <FlowExplorer flowId={flowId} onFlowChange={setFlowId} onShowOnMap={showOnMap} matches={matches} />
          )}

          {view === "sitemap" && <SiteMap query={query} />}
        </div>
      </section>

      {/* Sync rules */}
      <section className="rounded-2xl p-4 sm:p-5" style={surfaceStyle}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              <SyncAltIcon sx={{ fontSize: 18 }} className="text-purple-500" />
              Automatic sync rules
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
              When one feature changes, these keep the rest of the app in step. They run in{" "}
              <span className="font-mono">src/store/syncListeners.js</span>, whichever page triggers them.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-700">
            <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
            All 4 earlier gaps fixed
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {SYNC_RULES.map((r) => (
            <button
              key={r.trigger}
              type="button"
              onClick={() => showOnMap(r.module)}
              className="vf-node rounded-xl p-3.5 text-left flex flex-col"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-purple-600">When</div>
              <div className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{r.trigger}</div>
              <p className="mt-1 text-[11px] leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>{r.effect}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {r.slices.map((id) => (
                  <span key={id} className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-purple-500/10 text-purple-700">
                    state.{id}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[11px] font-semibold text-blue-600">Show {moduleById(r.module)?.name} on map →</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function LegendToggle({ checked, onChange, color, dashed, dash, label }) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 accent-current" style={{ accentColor: color }} />
      <svg width="22" height="6" aria-hidden="true">
        <line x1="0" y1="3" x2="22" y2="3" stroke={color} strokeWidth="2" strokeDasharray={dash || (dashed ? "4 3" : undefined)} />
      </svg>
      {label}
    </label>
  );
}

function DetailsPanel({ selected, counts, onSelect, onOpenFlow }) {
  if (!selected) {
    return (
      <aside className="rounded-2xl p-5 self-start xl:sticky xl:top-20" style={{ backgroundColor: "var(--bg-surface2)", border: "1px dashed var(--border-strong)" }}>
        <HubIcon className="text-blue-500" />
        <div className="mt-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Pick something to inspect</div>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Click a module to see the data it reads and writes, the actions it dispatches and the flows it is part of.
          Click a slice to see every page that depends on it.
        </p>
      </aside>
    );
  }

  const shell = (title, subtitle, body, footer) => (
    <aside key={`${selected.type}-${selected.id}`} className="vf-enter rounded-2xl p-5 self-start xl:sticky xl:top-20" style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{subtitle}</div>
          <div className="text-base font-bold break-words" style={{ color: "var(--text-primary)" }}>{title}</div>
        </div>
        <IconButton label="Clear selection" onClick={() => onSelect(null)} className="-mr-1.5 -mt-1">
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </div>
      <div className="mt-3 space-y-4">{body}</div>
      {footer && <div className="mt-5">{footer}</div>}
    </aside>
  );

  if (selected.type === "module") {
    const m = moduleById(selected.id);
    const flows = FLOWS.filter((f) => f.steps.some((s) => s.module === m.id));
    const rules = SYNC_RULES.filter((r) => r.module === m.id);
    const sliceChip = (id) => ({ id, label: `state.${id}` });
    return shell(
      m.name,
      "Feature module",
      <>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{m.summary}</p>
        {m.reads.length > 0 && (
          <ChipGroup label="Reads" items={m.reads.map(sliceChip)} mono className="bg-blue-500/10 text-blue-700" onItemClick={(c) => onSelect({ type: "slice", id: c.id })} />
        )}
        {m.writes.length > 0 && (
          <ChipGroup label="Writes" items={m.writes.map(sliceChip)} mono className="bg-emerald-500/10 text-emerald-700" onItemClick={(c) => onSelect({ type: "slice", id: c.id })} />
        )}
        {m.syncWrites?.length > 0 && (
          <ChipGroup label="Also updates via sync" items={m.syncWrites.map(sliceChip)} mono className="bg-purple-500/10 text-purple-700" onItemClick={(c) => onSelect({ type: "slice", id: c.id })} />
        )}
        {m.actions.length > 0 && <ChipGroup label="Dispatches" items={m.actions} mono className="bg-slate-500/10 text-slate-700" />}
        {m.dialogs.length > 0 && <ChipGroup label="Dialogs" items={m.dialogs} className="bg-purple-500/10 text-purple-700" />}
        {m.detailRoutes.length > 0 && (
          <ChipGroup label="Detail pages" items={m.detailRoutes.map((d) => d.pattern)} mono className="bg-slate-500/10 text-slate-700" />
        )}
        {flows.length > 0 && (
          <ChipGroup label="Part of flows" items={flows.map((f) => ({ id: f.id, label: f.title }))} className="bg-amber-500/10 text-amber-700" onItemClick={(f) => onOpenFlow(f.id)} />
        )}
        {rules.length > 0 && (
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Sync rules it triggers
            </div>
            <ul className="space-y-1.5">
              {rules.map((r) => (
                <li key={r.trigger} className="rounded-lg p-2 text-[11px] bg-purple-500/10" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-semibold text-purple-700">{r.trigger}: </span>
                  {r.effect}
                </li>
              ))}
            </ul>
          </div>
        )}
      </>,
      <Button component={Link} href={m.href} fullWidth endIcon={<OpenInNewIcon />}>
        Open {m.name}
      </Button>
    );
  }

  const s = sliceById(selected.id);
  const readers = MODULES.filter((m) => m.reads.includes(s.id));
  const writers = MODULES.filter((m) => m.writes.includes(s.id));
  const syncers = MODULES.filter((m) => m.syncWrites?.includes(s.id) && !m.writes.includes(s.id));
  const flows = FLOWS.filter((f) => f.steps.some((st) => st.slices.includes(s.id)));
  const modChip = (m) => ({ id: m.id, label: m.name });
  return shell(
    `state.${s.name}`,
    "Redux slice",
    <>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.holds}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[11px]">
        <dt style={{ color: "var(--text-tertiary)" }}>Records now</dt>
        <dd className="font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{counts[s.id]}</dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Saved as</dt>
        <dd className="font-mono break-all" style={{ color: "var(--text-primary)" }}>{s.storageKey}</dd>
        <dt style={{ color: "var(--text-tertiary)" }}>Seed</dt>
        <dd className="font-mono break-all" style={{ color: "var(--text-primary)" }}>{s.seed}</dd>
      </dl>
      {readers.length > 0 && (
        <ChipGroup label={`Read by ${readers.length}`} items={readers.map(modChip)} className="bg-blue-500/10 text-blue-700" onItemClick={(c) => onSelect({ type: "module", id: c.id })} />
      )}
      {writers.length > 0 && (
        <ChipGroup label={`Written by ${writers.length}`} items={writers.map(modChip)} className="bg-emerald-500/10 text-emerald-700" onItemClick={(c) => onSelect({ type: "module", id: c.id })} />
      )}
      {syncers.length > 0 && (
        <ChipGroup label={`Updated via sync from ${syncers.length}`} items={syncers.map(modChip)} className="bg-purple-500/10 text-purple-700" onItemClick={(c) => onSelect({ type: "module", id: c.id })} />
      )}
      {flows.length > 0 && (
        <ChipGroup label="Changed in flows" items={flows.map((f) => ({ id: f.id, label: f.title }))} className="bg-amber-500/10 text-amber-700" onItemClick={(f) => onOpenFlow(f.id)} />
      )}
    </>
  );
}
