"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HubIcon from "@mui/icons-material/Hub";
import Button from "@/components/common/Button";
import { FLOWS, TONES, moduleById } from "./flowData";

const STEP_MS = 2200;

/**
 * Business flows as steppers. Pick a flow, then click a step or press Play to
 * walk through it. Each step names the page, the Redux actions it dispatches
 * and the slices it changes.
 */
export default function FlowExplorer({ flowId, onFlowChange, onShowOnMap, matches }) {
  const flow = FLOWS.find((f) => f.id === flowId) || FLOWS[0];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // New flow: start from the first step
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [flow.id]);

  // Auto-advance while playing; stop on the last step
  useEffect(() => {
    if (!playing) return undefined;
    if (step >= flow.steps.length - 1) {
      setPlaying(false);
      return undefined;
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, step, flow.steps.length]);

  const togglePlay = () => {
    if (!playing && step >= flow.steps.length - 1) setStep(0);
    setPlaying((p) => !p);
  };

  const tone = TONES[flow.tone];
  const current = flow.steps[step];
  const currentModule = current.module ? moduleById(current.module) : null;

  return (
    <div className="space-y-5">
      {/* Flow picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5" role="tablist" aria-label="Business flows">
        {FLOWS.map((f) => {
          const t = TONES[f.tone];
          const active = f.id === flow.id;
          const dim = matches && !matches.has(`flow:${f.id}`);
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFlowChange(f.id)}
              className={`vf-node rounded-xl p-3 text-left ${active ? `ring-2 ${t.ring}` : ""}`}
              style={{ opacity: dim ? 0.35 : 1 }}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {f.title}
                </span>
                <span className="ml-auto text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {f.steps.length} steps
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {f.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Stepper */}
      <div className="rounded-2xl p-4 sm:p-5" style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border-subtle)" }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {flow.title}
          </h3>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              tone="neutral"
              onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}
              disabled={step === 0}
              aria-label="Previous step"
              className="!min-w-0 !px-2"
            >
              <ChevronLeftIcon fontSize="small" />
            </Button>
            <Button onClick={togglePlay} startIcon={playing ? <PauseIcon /> : <PlayArrowIcon />}>
              {playing ? "Pause" : step >= flow.steps.length - 1 ? "Replay" : "Play"}
            </Button>
            <Button
              variant="outline"
              tone="neutral"
              onClick={() => { setPlaying(false); setStep((s) => Math.min(flow.steps.length - 1, s + 1)); }}
              disabled={step >= flow.steps.length - 1}
              aria-label="Next step"
              className="!min-w-0 !px-2"
            >
              <ChevronRightIcon fontSize="small" />
            </Button>
          </div>
        </div>

        <ol className="flex flex-col md:flex-row md:items-stretch gap-2 md:gap-0">
          {flow.steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const mod = s.module ? moduleById(s.module) : null;
            return (
              <li key={i} className="flex md:flex-1 md:flex-col items-start md:items-stretch gap-3 md:gap-0 min-w-0">
                {/* Rail */}
                <div className="flex md:flex-row flex-col items-center md:w-full self-stretch md:self-auto">
                  <button
                    type="button"
                    onClick={() => { setPlaying(false); setStep(i); }}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    aria-current={active ? "step" : undefined}
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                      active ? `${tone.dot} text-white scale-110 shadow-md` : done ? `${tone.soft} ${tone.text}` : ""
                    }`}
                    style={!active && !done ? { backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-tertiary)" } : undefined}
                  >
                    {i + 1}
                  </button>
                  {i < flow.steps.length - 1 && (
                    <div className="relative flex-1 md:h-0.5 md:w-auto w-0.5 min-h-[16px] md:min-h-0 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                      <div
                        className={`absolute inset-0 ${tone.dot} origin-left md:origin-left transition-transform duration-500`}
                        style={{ transform: done ? "scale(1)" : "scale(0)" }}
                      />
                    </div>
                  )}
                </div>
                {/* Label */}
                <button
                  type="button"
                  onClick={() => { setPlaying(false); setStep(i); }}
                  className="md:mt-2.5 md:pr-3 text-left min-w-0 pb-2 md:pb-0"
                >
                  <div className="text-[12px] font-semibold leading-snug" style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {s.title}
                  </div>
                  {mod && (
                    <div className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                      {mod.name}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        {/* Active step detail */}
        <div
          key={`${flow.id}-${step}`}
          className="vf-enter mt-4 rounded-xl p-4"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${tone.text}`}>
                Step {step + 1} of {flow.steps.length}
              </div>
              <div className="mt-0.5 text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {current.title}
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {current.detail}
              </p>
            </div>
            {currentModule && (
              <div className="flex gap-1.5">
                <Button variant="ghost" startIcon={<HubIcon />} onClick={() => onShowOnMap(currentModule.id)}>
                  Show on map
                </Button>
                <Button component={Link} href={currentModule.href} variant="soft" endIcon={<OpenInNewIcon />}>
                  Open {currentModule.name}
                </Button>
              </div>
            )}
          </div>

          {(current.actions.length > 0 || current.slices.length > 0) && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {current.actions.length > 0 && (
                <ChipGroup label="Dispatches" items={current.actions} mono className="bg-emerald-500/10 text-emerald-700" />
              )}
              {current.slices.length > 0 && (
                <ChipGroup label="Changes state" items={current.slices.map((id) => `state.${id}`)} mono className="bg-blue-500/10 text-blue-700" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChipGroup({ label, items, mono, className = "", onItemClick }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const key = typeof item === "string" ? item : item.id;
          const text = typeof item === "string" ? item : item.label;
          const cls = `rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${mono ? "font-mono" : ""} ${className}`;
          return onItemClick ? (
            <button key={key} type="button" onClick={() => onItemClick(item)} className={`${cls} transition hover:brightness-95 hover:underline`}>
              {text}
            </button>
          ) : (
            <span key={key} className={cls}>
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
}
