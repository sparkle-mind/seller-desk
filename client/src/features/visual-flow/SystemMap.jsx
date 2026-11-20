"use client";

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import StorageIcon from "@mui/icons-material/Storage";
import DatasetIcon from "@mui/icons-material/Dataset";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import { MODULES, SLICES, TONES } from "./flowData";

// One edge per module/slice pair: "read", "write", "both" or "sync"
// ("sync" = changed automatically by the sync layer after this module acts)
const EDGES = MODULES.flatMap((m) => {
  const sync = m.syncWrites || [];
  const ids = new Set([...m.reads, ...m.writes, ...sync]);
  return [...ids].map((sliceId) => {
    const r = m.reads.includes(sliceId);
    const w = m.writes.includes(sliceId);
    const kind = w ? (r ? "both" : "write") : sync.includes(sliceId) ? "sync" : "read";
    return { from: m.id, to: sliceId, kind };
  });
});

export const EDGE_COLORS = {
  read: "rgb(59 130 246)",
  write: "rgb(16 185 129)",
  sync: "rgb(168 85 247)",
};

function edgeColor(kind) {
  return kind === "both" ? EDGE_COLORS.write : EDGE_COLORS[kind];
}

const EDGE_DASH = { read: "5 5", sync: "2 4" };

/**
 * Three-column node graph: feature modules -> Redux slices -> storage.
 * Edges are measured from the DOM so the drawing follows the real layout.
 * Below `lg` the columns stack and the curves are hidden; highlighting and
 * the details panel still explain the connections.
 */
export default function SystemMap({ focus, onFocus, selected, onSelect, matches, counts, showReads, showWrites, showSync, ruleCount }) {
  const containerRef = useRef(null);
  const nodeRefs = useRef({});
  const [geo, setGeo] = useState({ paths: [], storage: [], width: 0, height: 0 });

  const setNodeRef = (key) => (el) => {
    if (el) nodeRefs.current[key] = el;
    else delete nodeRefs.current[key];
  };

  const measure = useCallback(() => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return;
    const rect = (key) => nodeRefs.current[key]?.getBoundingClientRect();

    const curve = (x1, y1, x2, y2) => {
      const dx = Math.max(30, (x2 - x1) * 0.5);
      return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    };

    const paths = EDGES.map((e) => {
      const a = rect(`m:${e.from}`);
      const b = rect(`s:${e.to}`);
      if (!a || !b) return null;
      return {
        ...e,
        d: curve(a.right - box.left, a.top + a.height / 2 - box.top, b.left - box.left, b.top + b.height / 2 - box.top),
      };
    }).filter(Boolean);

    const store = rect("storage");
    const storage = store
      ? SLICES.map((s) => {
          const r = rect(`s:${s.id}`);
          if (!r) return null;
          return {
            id: s.id,
            d: curve(r.right - box.left, r.top + r.height / 2 - box.top, store.left - box.left, store.top + store.height / 2 - box.top),
          };
        }).filter(Boolean)
      : [];

    setGeo({ paths, storage, width: box.width, height: box.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // What is lit up right now
  const lit = useMemo(() => {
    if (!focus) return null;
    const edges = EDGES.filter((e) => (focus.type === "module" ? e.from === focus.id : e.to === focus.id));
    return {
      modules: new Set(focus.type === "module" ? [focus.id] : edges.map((e) => e.from)),
      slices: new Set(focus.type === "slice" ? [focus.id] : edges.map((e) => e.to)),
      edgeKeys: new Set(edges.map((e) => `${e.from}>${e.to}`)),
    };
  }, [focus]);

  const visibleKind = (kind) =>
    ({ both: showReads || showWrites, read: showReads, write: showWrites, sync: showSync })[kind];

  const nodeState = (type, id) => {
    const isSelected = selected?.type === type && selected?.id === id;
    const dimmedBySearch = matches && !matches.has(`${type}:${id}`);
    const dimmedByFocus = lit && !(type === "module" ? lit.modules.has(id) : lit.slices.has(id));
    return { isSelected, dimmed: dimmedBySearch || dimmedByFocus };
  };

  const nodeHandlers = (type, id) => ({
    onMouseEnter: () => onFocus({ type, id }),
    onMouseLeave: () => onFocus(null),
    onFocus: () => onFocus({ type, id }),
    onBlur: () => onFocus(null),
    onClick: () => onSelect(selected?.type === type && selected?.id === id ? null : { type, id }),
  });

  return (
    <div ref={containerRef} className="relative">
      {/* Edges */}
      <svg
        className="pointer-events-none absolute inset-0 hidden lg:block"
        width={geo.width}
        height={geo.height}
        aria-hidden="true"
      >
        {geo.storage.map((p) => {
          const on = lit?.slices.has(p.id);
          return (
            <path
              key={`st-${p.id}`}
              d={p.d}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth={on ? 1.6 : 1}
              strokeDasharray="2 4"
              opacity={lit ? (on ? 0.9 : 0.15) : 0.45}
            />
          );
        })}
        {geo.paths.map((p) => {
          if (!visibleKind(p.kind)) return null;
          const key = `${p.from}>${p.to}`;
          const on = lit?.edgeKeys.has(key);
          return (
            <path
              key={key}
              d={p.d}
              fill="none"
              stroke={edgeColor(p.kind)}
              strokeWidth={on ? 2.2 : 1.2}
              strokeDasharray={EDGE_DASH[p.kind]}
              strokeLinecap="round"
              className={on && (p.kind === "write" || p.kind === "both") ? "vf-flow" : undefined}
              opacity={lit ? (on ? 0.95 : 0.06) : 0.28}
              style={{ transition: "opacity 160ms ease, stroke-width 160ms ease" }}
            />
          );
        })}
      </svg>

      <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] gap-6 lg:gap-x-20">
        {/* Modules */}
        <div>
          <ColumnTitle label="Feature modules" hint="Pages in the sidebar" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {MODULES.map((m) => {
              const t = TONES[m.tone];
              const { isSelected, dimmed } = nodeState("module", m.id);
              return (
                <button
                  key={m.id}
                  ref={setNodeRef(`m:${m.id}`)}
                  type="button"
                  {...nodeHandlers("module", m.id)}
                  aria-pressed={isSelected}
                  className={`vf-node group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left ${isSelected ? `ring-2 ${t.ring}` : ""}`}
                  style={{ opacity: dimmed ? 0.35 : 1 }}
                >
                  <span className={`h-8 w-1 shrink-0 rounded-full ${t.dot}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      {m.name}
                    </span>
                    <span className="block text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      reads {m.reads.length} · writes {m.writes.length}
                      {m.syncWrites?.length ? ` · syncs ${m.syncWrites.length}` : ""}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slices */}
        <div>
          <ColumnTitle label="Redux store" hint="One slice per data domain" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3 lg:pt-6">
            {SLICES.map((s) => {
              const { isSelected, dimmed } = nodeState("slice", s.id);
              return (
                <button
                  key={s.id}
                  ref={setNodeRef(`s:${s.id}`)}
                  type="button"
                  {...nodeHandlers("slice", s.id)}
                  aria-pressed={isSelected}
                  className={`vf-node flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left ${isSelected ? "ring-2 ring-blue-500/40" : ""}`}
                  style={{ opacity: dimmed ? 0.35 : 1 }}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      state.{s.name}
                    </span>
                    <span className="block truncate text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {s.holds}
                    </span>
                  </span>
                  {counts?.[s.id] !== undefined && (
                    <span
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                      style={{ backgroundColor: "var(--bg-surface2)", color: "var(--text-secondary)" }}
                      title="Records in the store right now"
                    >
                      {counts[s.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Storage */}
        <div className="flex flex-col">
          <ColumnTitle label="Persistence" hint="Where the data lives" />
          <div className="flex flex-1 flex-col justify-center gap-3">
            <div className="vf-node vf-static rounded-xl p-3.5 ring-1 ring-purple-500/30">
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                <SyncAltIcon sx={{ fontSize: 18 }} className="text-purple-500" />
                Sync layer
              </div>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                <span className="font-mono">store/syncListeners.js</span> runs {ruleCount} rules after actions, so one
                page's change updates stock, shipments, returns and alerts everywhere (purple lines).
              </p>
            </div>
            <div ref={setNodeRef("storage")} className="vf-node vf-static rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                <StorageIcon sx={{ fontSize: 18 }} className="text-blue-500" />
                Browser localStorage
              </div>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                Every reducer saves its slice under a <span className="font-mono">seller_desk_*</span> key, so
                changes survive a refresh. There is no backend call yet.
              </p>
            </div>
            <div className="vf-node vf-static rounded-xl p-3.5">
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                <DatasetIcon sx={{ fontSize: 18 }} className="text-amber-500" />
                Demo seed data
              </div>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                <span className="font-mono">src/data/*.js</span> fills a slice when its key is empty, and again after
                Reset Demo Data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColumnTitle({ label, hint }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </div>
      <div className="text-[11px]" style={{ color: "var(--text-tertiary)", opacity: 0.8 }}>
        {hint}
      </div>
    </div>
  );
}
