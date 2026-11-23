"use client";

import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Button from "@/components/common/Button";
import { SCHEMAS } from "./apiSpec";

// ─── Tones ───────────────────────────────────────────────────────────────────

const METHOD_TONE = {
  GET: "bg-blue-500/10 text-blue-700 ring-blue-500/30",
  HEAD: "bg-blue-500/10 text-blue-700 ring-blue-500/30",
  OPTIONS: "bg-slate-500/10 text-slate-700 ring-slate-500/30",
  POST: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30",
  PUT: "bg-amber-500/10 text-amber-700 ring-amber-500/30",
  PATCH: "bg-purple-500/10 text-purple-700 ring-purple-500/30",
  DELETE: "bg-rose-500/10 text-rose-700 ring-rose-500/30",
};

export const KIND_META = {
  read: { label: "Read", tone: "bg-blue-500/10 text-blue-700 ring-blue-500/30" },
  create: { label: "Create", tone: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30" },
  update: { label: "Update", tone: "bg-amber-500/10 text-amber-700 ring-amber-500/30" },
  delete: { label: "Delete", tone: "bg-rose-500/10 text-rose-700 ring-rose-500/30" },
  action: { label: "Action", tone: "bg-purple-500/10 text-purple-700 ring-purple-500/30" },
};

const statusTone = (status) =>
  status >= 500 ? "text-rose-600" : status >= 400 ? "text-amber-600" : status >= 300 ? "text-blue-600" : "text-emerald-600";

const muted = { color: "var(--text-tertiary)" };
const secondary = { color: "var(--text-secondary)" };
const primary = { color: "var(--text-primary)" };

// ─── Small pieces ────────────────────────────────────────────────────────────

export function MethodBadge({ method, className = "" }) {
  return (
    <span className={`inline-flex min-w-[64px] justify-center rounded-md px-2 py-1 font-mono text-[11px] font-bold ring-1 ${METHOD_TONE[method] || METHOD_TONE.OPTIONS} ${className}`}>
      {method}
    </span>
  );
}

export function KindBadge({ kind }) {
  const meta = KIND_META[kind] || KIND_META.action;
  return (
    <span className={`inline-flex min-w-[64px] justify-center rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${meta.tone}`}>
      {meta.label}
    </span>
  );
}

export function Pill({ children, className = "bg-slate-500/10 text-slate-700" }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}>{children}</span>;
}

export function SectionLabel({ children }) {
  return (
    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider" style={muted}>
      {children}
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      // Clipboard can be blocked (insecure origin / permissions); nothing else to do.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition hover:opacity-80"
      style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
      aria-label={label}
    >
      {done ? <CheckIcon sx={{ fontSize: 12 }} className="text-emerald-500" /> : <ContentCopyIcon sx={{ fontSize: 12 }} />}
      {done ? "Copied" : label}
    </button>
  );
}

export function CodeBlock({ value, label, maxHeight = 320 }) {
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <div className="min-w-0 overflow-hidden rounded-xl" style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between gap-2 px-3 py-1.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <span className="truncate text-[10px] font-semibold uppercase tracking-wider" style={muted}>
          {label}
        </span>
        <CopyButton text={text} />
      </div>
      <pre className="overflow-auto p-3 font-mono text-[11.5px] leading-relaxed" style={{ ...primary, maxHeight }}>
        {text}
      </pre>
    </div>
  );
}

export function FieldTable({ fields, showRequired = false }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full min-w-[480px] text-left text-[12px]">
        <thead style={{ backgroundColor: "var(--bg-surface2)" }}>
          <tr style={muted}>
            <th className="px-3 py-2 font-semibold">Field</th>
            <th className="px-3 py-2 font-semibold">Type</th>
            {showRequired && <th className="px-3 py-2 font-semibold">Required</th>}
            <th className="px-3 py-2 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((fd) => (
            <tr key={fd.name} style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <td className="px-3 py-2 font-mono font-semibold" style={primary}>{fd.name}</td>
              <td className="px-3 py-2 font-mono text-purple-700">{fd.type}</td>
              {showRequired && (
                <td className="px-3 py-2">{fd.required ? <Pill className="bg-rose-500/10 text-rose-700">required</Pill> : <span style={muted}>optional</span>}</td>
              )}
              <td className="px-3 py-2" style={secondary}>{fd.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Collapsible Swagger-style row
export function OpBlock({ id, badge, title, summary, right, tone = "var(--border)", open, onToggle, children }) {
  return (
    <div id={id} className="scroll-mt-24 overflow-hidden rounded-xl" style={{ border: `1px solid ${tone}`, backgroundColor: "var(--bg-surface)" }}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:brightness-[0.98]">
        {badge}
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[13px] font-semibold" style={primary}>{title}</div>
          {summary && <div className="truncate text-[12px]" style={secondary}>{summary}</div>}
        </div>
        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">{right}</div>
        <ExpandMoreIcon sx={{ fontSize: 20 }} style={{ ...muted, transform: open ? "rotate(180deg)" : "none", transition: "transform 160ms ease" }} />
      </button>
      {open && (
        <div className="space-y-4 px-3 pb-4 pt-3 sm:px-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function SchemaLink({ name, onOpen }) {
  if (!SCHEMAS[name]) return <span className="font-mono">{name}</span>;
  return (
    <button type="button" onClick={() => onOpen?.(name)} className="font-mono font-semibold text-blue-600 hover:underline">
      {name}
    </button>
  );
}

// ─── Try it out ──────────────────────────────────────────────────────────────

const joinUrl = (base, path) => `${String(base || "").replace(/\/+$/, "")}${path}`;

export function buildCurl({ baseUrl, method, path, contentType, body, headers = {} }) {
  const parts = [`curl -i -X ${method} "${joinUrl(baseUrl, path)}"`];
  if (contentType) parts.push(`-H "Content-Type: ${contentType}"`);
  Object.entries(headers).forEach(([k, v]) => v && parts.push(`-H '${k}: ${v}'`));
  if (body) parts.push(`-d '${body}'`);
  return parts.join(" \\\n  ");
}

async function sendRequest({ baseUrl, method, path, contentType, body, headers = {} }) {
  const url = joinUrl(baseUrl, path);
  const started = performance.now();
  const reqHeaders = { ...headers };
  if (contentType) reqHeaders["Content-Type"] = contentType;
  Object.keys(reqHeaders).forEach((k) => !reqHeaders[k] && delete reqHeaders[k]);
  try {
    const res = await fetch(url, { method, headers: reqHeaders, body: body || undefined, cache: "no-store" });
    const text = method === "HEAD" ? "" : await res.text();
    const visibleHeaders = {};
    res.headers.forEach((v, k) => {
      visibleHeaders[k] = v;
    });
    return { kind: "ok", status: res.status, statusText: res.statusText, ms: Math.round(performance.now() - started), headers: visibleHeaders, body: text, url };
  } catch (err) {
    // A thrown fetch is either a CORS block or an unreachable server. A
    // no-cors probe tells them apart: it resolves (opaque) if the server answered.
    try {
      await fetch(url, { mode: "no-cors", cache: "no-store" });
      return { kind: "cors", ms: Math.round(performance.now() - started), url };
    } catch {
      return { kind: "network", ms: Math.round(performance.now() - started), url, message: String(err?.message || err) };
    }
  }
}

const prettyBody = (text) => {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
};

export function TryItOut({ baseUrl, method, path, contentType, body: initialBody = "", headerFields = [], editableBody = false }) {
  const [body, setBody] = useState(initialBody);
  const [headers, setHeaders] = useState(() => Object.fromEntries(headerFields.map((h) => [h.name, ""])));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const run = async () => {
    setBusy(true);
    setResult(null);
    setResult(await sendRequest({ baseUrl, method, path, contentType, body, headers }));
    setBusy(false);
  };

  const curl = buildCurl({ baseUrl, method, path, contentType, body, headers });

  return (
    <div className="space-y-3 rounded-xl p-3" style={{ backgroundColor: "var(--bg-surface2)", border: "1px dashed var(--border-strong)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <MethodBadge method={method} />
          <span className="truncate font-mono text-[12px]" style={primary}>{joinUrl(baseUrl, path)}</span>
        </div>
        <Button startIcon={<PlayArrowIcon />} onClick={run} loading={busy}>
          Execute
        </Button>
      </div>

      {headerFields.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {headerFields.map((h) => (
            <label key={h.name} className="block text-[11px]" style={secondary}>
              <span className="font-mono font-semibold">{h.name}</span> <span style={muted}>(header, optional)</span>
              <input
                value={headers[h.name]}
                onChange={(e) => setHeaders((cur) => ({ ...cur, [h.name]: e.target.value }))}
                placeholder={h.placeholder || ""}
                className="mt-1 w-full rounded-lg px-2.5 py-1.5 font-mono text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
            </label>
          ))}
        </div>
      )}

      {editableBody && (
        <label className="block text-[11px]" style={secondary}>
          Request body <span style={muted}>({contentType})</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            spellCheck={false}
            className="mt-1 w-full rounded-lg px-2.5 py-1.5 font-mono text-[12px] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          />
        </label>
      )}

      <CodeBlock value={curl} label="curl" />

      {result && result.kind === "ok" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
            <span className={`font-mono text-sm font-bold ${statusTone(result.status)}`}>
              {result.status} {result.statusText}
            </span>
            <span style={muted}>{result.ms} ms</span>
          </div>
          <CodeBlock value={result.body ? prettyBody(result.body) : "(empty body)"} label={`Response body · ${result.headers["content-type"] || "no content-type"}`} />
          <CodeBlock value={Object.entries(result.headers).map(([k, v]) => `${k}: ${v}`).join("\n") || "(none readable)"} label="Response headers (readable by the browser)" maxHeight={160} />
        </div>
      )}
      {result && result.kind === "cors" && (
        <div className="rounded-lg p-3 text-[12px] leading-relaxed bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/30">
          <strong>Server reached, response blocked by CORS.</strong> The server answered, but it sends no Access-Control-Allow-Origin header, so the browser
          will not let this page read the response. Run the curl command above in a terminal to see the full response.
        </div>
      )}
      {result && result.kind === "network" && (
        <div className="rounded-lg p-3 text-[12px] leading-relaxed bg-rose-500/10 text-rose-800 ring-1 ring-rose-500/30">
          <strong>Could not reach {result.url}.</strong> Start the server with <span className="font-mono">cd server &amp;&amp; npm run dev</span>, or check the base URL.
        </div>
      )}
    </div>
  );
}

export function NoAuthNote() {
  return (
    <div className="flex items-center gap-1.5 text-[11px]" style={muted}>
      <LockOpenIcon sx={{ fontSize: 14 }} />
      No authentication
    </div>
  );
}
