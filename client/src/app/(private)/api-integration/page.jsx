"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/common/PageHeader";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/common/Button";
import { useToast } from "@/components/common/ToastProvider";
import {
  SERVER,
  LIVE_ENDPOINTS,
  SERVER_ERRORS,
  SCHEMAS,
  MODULES,
  OPERATIONS,
  AUTH_FACTS,
  GAPS,
  buildOpenApi,
} from "@/features/api-integration/apiSpec";
import {
  MethodBadge,
  KindBadge,
  KIND_META,
  Pill,
  SectionLabel,
  CodeBlock,
  FieldTable,
  OpBlock,
  SchemaLink,
  TryItOut,
  NoAuthNote,
} from "@/features/api-integration/ApiBlocks";

import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import DataObjectIcon from "@mui/icons-material/DataObject";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const BASE_URL_KEY = "seller_desk_api_base_url";

const TABS = [
  { id: "endpoints", label: "Endpoints", icon: CloudDoneOutlinedIcon },
  { id: "operations", label: "Client operations", icon: StorageOutlinedIcon },
  { id: "schemas", label: "Schemas", icon: DataObjectIcon },
  { id: "auth", label: "Authentication", icon: LockOutlinedIcon },
  { id: "errors", label: "Errors", icon: ErrorOutlineIcon },
  { id: "gaps", label: "Gaps", icon: ReportProblemOutlinedIcon },
];

const SEVERITY = {
  high: "bg-rose-500/10 text-rose-700",
  medium: "bg-amber-500/10 text-amber-700",
  low: "bg-slate-500/10 text-slate-700",
};

const surfaceStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-card)",
};
const muted = { color: "var(--text-tertiary)" };
const secondary = { color: "var(--text-secondary)" };
const primary = { color: "var(--text-primary)" };

const opKey = (op) => `${op.module}:${op.action}`;

export default function ApiIntegrationPage() {
  const toast = useToast();
  const [tab, setTab] = useState("endpoints");
  const [query, setQuery] = useState("");
  const [baseUrl, setBaseUrl] = useState(SERVER.defaultBaseUrl);
  const [open, setOpen] = useState(() => new Set(["get-root"]));
  const [kindFilter, setKindFilter] = useState("all");

  // Remember the base URL per browser (convenience only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BASE_URL_KEY);
      if (saved) setBaseUrl(saved);
    } catch {}
  }, []);
  const updateBaseUrl = (value) => {
    setBaseUrl(value);
    try {
      localStorage.setItem(BASE_URL_KEY, value);
    } catch {}
  };

  const toggle = (id) =>
    setOpen((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openSchema = (name) => {
    setTab("schemas");
    setQuery("");
    setOpen((cur) => new Set(cur).add(`schema:${name}`));
    setTimeout(() => document.getElementById(`schema-${name}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const downloadOpenApi = () => {
    const blob = new Blob([JSON.stringify(buildOpenApi(baseUrl), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sellerdesk-openapi.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("OpenAPI spec downloaded");
  };

  const q = query.trim().toLowerCase();
  const matchesOp = (op) =>
    (kindFilter === "all" || op.kind === kindFilter) &&
    (!q || [op.action, op.summary, op.module, op.payload, ...(op.usedIn || []), ...(op.notes || []), ...(op.effects || [])].join(" ").toLowerCase().includes(q));

  const visibleOps = useMemo(() => OPERATIONS.filter(matchesOp), [q, kindFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleSchemas = useMemo(
    () =>
      Object.entries(SCHEMAS).filter(
        ([name, s]) => !q || [name, s.source, s.note, s.storageKey, ...s.fields.map((fd) => `${fd.name} ${fd.note}`)].join(" ").toLowerCase().includes(q)
      ),
    [q]
  );

  const opCount = OPERATIONS.length;
  const writeCount = OPERATIONS.filter((o) => o.kind !== "read").length;

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="API Integration"
        subtitle="Swagger-style reference for the SellerDesk server, the operations the app performs today, and what an API still needs."
        breadcrumbs={[{ label: "Workspace" }, { label: "API Integration" }]}
        badge="OpenAPI 3.0"
        actions={
          <Button variant="outline" tone="neutral" startIcon={<FileDownloadOutlinedIcon />} onClick={downloadOpenApi}>
            OpenAPI JSON
          </Button>
        }
      />

      {/* Reality check */}
      <div className="flex gap-3 rounded-2xl p-4 text-[13px] leading-relaxed bg-amber-500/10 ring-1 ring-amber-500/30" style={secondary}>
        <InfoOutlinedIcon className="mt-0.5 shrink-0 text-amber-600" sx={{ fontSize: 20 }} />
        <p>
          <strong style={primary}>The server has one live endpoint.</strong> {SERVER.framework} in{" "}
          <span className="font-mono">{SERVER.entry}</span> serves only <span className="font-mono">GET /</span>. Every module (products, orders,
          inventory and the rest) runs in the browser through Redux and saves to localStorage, so those {opCount} operations are documented below as{" "}
          <em>client operations without an HTTP endpoint</em>. No URLs have been invented for them.
        </p>
      </div>

      {/* At a glance */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 [&>*]:min-w-0">
        {[
          { label: "Live endpoints", value: LIVE_ENDPOINTS.length, note: "GET / on Express", dot: "bg-emerald-500" },
          { label: "Operations without API", value: opCount, note: `${writeCount} writes, ${opCount - writeCount} reads`, dot: "bg-amber-500" },
          { label: "Schemas", value: Object.keys(SCHEMAS).length, note: "server, database and client", dot: "bg-blue-500" },
          { label: "Open gaps", value: GAPS.length, note: `${GAPS.filter((g) => g.severity === "high").length} high severity`, dot: "bg-rose-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={surfaceStyle}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={muted}>
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </div>
            <div className="font-display mt-1 text-2xl font-bold" style={primary}>{s.value}</div>
            <div className="text-[11px]" style={muted}>{s.note}</div>
          </div>
        ))}
      </div>

      <section className="min-w-0 rounded-2xl" style={surfaceStyle}>
        {/* Tabs + server */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="flex min-w-0 max-w-full gap-1 overflow-x-auto rounded-xl p-1" style={{ backgroundColor: "var(--bg-surface2)" }} role="tablist" aria-label="Sections">
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(t.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                  style={active ? { backgroundColor: "var(--bg-surface)", color: "var(--text-primary)", boxShadow: "var(--shadow-card)" } : secondary}
                >
                  <Icon sx={{ fontSize: 16 }} />
                  {t.label}
                </button>
              );
            })}
          </div>
          <label className="flex min-w-0 items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={muted}>
            Server
            <input
              value={baseUrl}
              onChange={(e) => updateBaseUrl(e.target.value)}
              spellCheck={false}
              aria-label="Server base URL"
              className="w-full min-w-0 rounded-lg px-2.5 py-1.5 font-mono text-[12px] normal-case tracking-normal focus:outline-none focus:ring-2 focus:ring-brand-500/20 lg:w-64"
              style={{ backgroundColor: "var(--bg-surface2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </label>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* ── Endpoints ─────────────────────────────────────────── */}
          {tab === "endpoints" && (
            <>
              <GroupHeading title="System" subtitle={`${SERVER.entry} · port from ${SERVER.portSource}`} right={<Pill className="bg-emerald-500/10 text-emerald-700">live</Pill>} />
              {LIVE_ENDPOINTS.map((ep) => (
                <OpBlock
                  key={ep.id}
                  id={ep.id}
                  badge={<MethodBadge method={ep.method} />}
                  title={ep.path}
                  summary={ep.summary}
                  tone="rgb(59 130 246 / 0.35)"
                  right={<NoAuthNote />}
                  open={open.has(ep.id)}
                  onToggle={() => toggle(ep.id)}
                >
                  <p className="text-[13px] leading-relaxed" style={secondary}>{ep.description}</p>
                  <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
                    <div className="space-y-4">
                      <div>
                        <SectionLabel>Parameters</SectionLabel>
                        {ep.parameters.length === 0 && ep.headers.length === 0 ? (
                          <p className="text-[12px]" style={muted}>No parameters.</p>
                        ) : (
                          <FieldTable showRequired fields={ep.headers.map((h) => ({ name: h.name, type: `${h.type} (${h.in})`, required: h.required, note: h.note }))} />
                        )}
                      </div>
                      <div>
                        <SectionLabel>Request body</SectionLabel>
                        <p className="text-[12px]" style={muted}>None.</p>
                      </div>
                      <div>
                        <SectionLabel>Responses</SectionLabel>
                        <div className="space-y-2">
                          {ep.responses.map((r) => (
                            <div key={r.status} className="rounded-xl p-3" style={{ border: "1px solid var(--border)" }}>
                              <div className="flex flex-wrap items-center gap-2 text-[12px]">
                                <span className="font-mono font-bold text-emerald-600">{r.status}</span>
                                <span style={secondary}>{r.description}</span>
                                {r.schema && (
                                  <span className="ml-auto text-[11px]" style={muted}>
                                    schema <SchemaLink name={r.schema} onOpen={openSchema} />
                                  </span>
                                )}
                              </div>
                              {r.contentType && <div className="mt-1 font-mono text-[11px]" style={muted}>{r.contentType}</div>}
                              {r.example && <div className="mt-2"><CodeBlock value={r.example} label="Example" /></div>}
                            </div>
                          ))}
                          <p className="text-[12px]" style={muted}>
                            Errors (400, 404, 413, 500) come from Express defaults; see the <TabLink onClick={() => setTab("errors")}>Errors</TabLink> tab.
                          </p>
                        </div>
                      </div>
                      <div>
                        <SectionLabel>Also answered on this path</SectionLabel>
                        <ul className="space-y-1.5">
                          {ep.alsoAnswers.map((a) => (
                            <li key={a.method} className="flex items-start gap-2 text-[12px]" style={secondary}>
                              <MethodBadge method={a.method} className="shrink-0 !min-w-[72px]" />
                              <span>{a.note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <SectionLabel>Try it out</SectionLabel>
                      <TryItOut baseUrl={baseUrl} method={ep.method} path={ep.path} headerFields={ep.headers.map((h) => ({ name: h.name, placeholder: 'W/"36-j+drWa5QPjf+lyBLSpkImb29Uyk"' }))} />
                    </div>
                  </div>
                </OpBlock>
              ))}

              <div className="rounded-xl p-4 text-[12px] leading-relaxed" style={{ backgroundColor: "var(--bg-surface2)", border: "1px dashed var(--border-strong)", ...secondary }}>
                <strong style={primary}>No other routes are registered.</strong> Paths such as <span className="font-mono">/api/products</span> or{" "}
                <span className="font-mono">/api/orders</span> return 404. What the app does per module, and the data each operation needs, is listed under{" "}
                <TabLink onClick={() => setTab("operations")}>Client operations</TabLink>.
              </div>
            </>
          )}

          {/* ── Client operations ─────────────────────────────────── */}
          {tab === "operations" && (
            <>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="max-w-2xl text-[12px] leading-relaxed" style={secondary}>
                  Each row is a Redux action or state read that a page uses today. They run in the browser and persist to localStorage. Payloads, examples and
                  validation are taken from the dialogs and slices. Effects are the automatic follow-ups in <span className="font-mono">store/syncListeners.js</span>.
                </p>
                <SearchInput value={query} onChange={setQuery} placeholder="Search actions, fields, pages..." className="md:max-w-xs" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["all", ...Object.keys(KIND_META)].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKindFilter(k)}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition"
                    style={kindFilter === k ? { backgroundColor: "var(--text-primary)", color: "var(--bg-surface)" } : { backgroundColor: "var(--bg-surface2)", ...secondary }}
                  >
                    {k === "all" ? `All (${OPERATIONS.length})` : `${KIND_META[k].label} (${OPERATIONS.filter((o) => o.kind === k).length})`}
                  </button>
                ))}
              </div>

              {MODULES.map((m) => {
                const ops = visibleOps.filter((o) => o.module === m.id);
                if (!ops.length) return null;
                return (
                  <div key={m.id} className="space-y-2">
                    <GroupHeading
                      title={m.name}
                      subtitle={<>state.{m.slice} · schemas {m.schemas.map((s, i) => <React.Fragment key={s}>{i > 0 && ", "}<SchemaLink name={s} onOpen={openSchema} /></React.Fragment>)}</>}
                      right={<Pill className="bg-amber-500/10 text-amber-700">no endpoint</Pill>}
                    />
                    {ops.map((op) => (
                      <OperationRow key={opKey(op)} op={op} open={open.has(opKey(op))} onToggle={() => toggle(opKey(op))} onOpenSchema={openSchema} />
                    ))}
                  </div>
                );
              })}
              {visibleOps.length === 0 && <Empty text="No operations match this search." />}
              <p className="text-[12px]" style={muted}>
                Dashboard and Reports only read and aggregate products, orders and finance data in the browser; they write nothing.
              </p>
            </>
          )}

          {/* ── Schemas ───────────────────────────────────────────── */}
          {tab === "schemas" && (
            <>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="max-w-2xl text-[12px] leading-relaxed" style={secondary}>
                  <Pill className="bg-emerald-500/10 text-emerald-700">server</Pill> returned by a live endpoint ·{" "}
                  <Pill className="bg-purple-500/10 text-purple-700">database</Pill> Prisma model ·{" "}
                  <Pill className="bg-blue-500/10 text-blue-700">client</Pill> record shape held in the browser
                </p>
                <SearchInput value={query} onChange={setQuery} placeholder="Search schemas and fields..." className="md:max-w-xs" />
              </div>
              {visibleSchemas.map(([name, s]) => (
                <OpBlock
                  key={name}
                  id={`schema-${name}`}
                  badge={<DataObjectIcon sx={{ fontSize: 20 }} className="text-blue-500" />}
                  title={name}
                  summary={s.source}
                  right={
                    <>
                      <Pill className={s.kind === "server" ? "bg-emerald-500/10 text-emerald-700" : s.kind === "database" ? "bg-purple-500/10 text-purple-700" : "bg-blue-500/10 text-blue-700"}>{s.kind}</Pill>
                      <span className="text-[11px]" style={muted}>{s.fields.length} fields</span>
                    </>
                  }
                  open={open.has(`schema:${name}`)}
                  onToggle={() => toggle(`schema:${name}`)}
                >
                  {s.note && <p className="text-[12px]" style={secondary}>{s.note}</p>}
                  {s.storageKey && (
                    <p className="text-[12px]" style={muted}>
                      Saved in localStorage as <span className="font-mono" style={primary}>{s.storageKey}</span>
                    </p>
                  )}
                  <FieldTable fields={s.fields} />
                </OpBlock>
              ))}
              {visibleSchemas.length === 0 && <Empty text="No schemas match this search." />}
            </>
          )}

          {/* ── Authentication ────────────────────────────────────── */}
          {tab === "auth" && (
            <>
              <div className="flex gap-3 rounded-xl p-4 text-[13px] leading-relaxed bg-rose-500/10 ring-1 ring-rose-500/30" style={secondary}>
                <LockOutlinedIcon className="mt-0.5 shrink-0 text-rose-600" sx={{ fontSize: 20 }} />
                <p>
                  <strong style={primary}>No authentication or authorization is implemented.</strong> No token, API key, cookie or header is needed to call the
                  server, and there are no permissions to check. The OpenAPI export marks <span className="font-mono">GET /</span> with{" "}
                  <span className="font-mono">security: []</span>.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 [&>*]:min-w-0">
                {AUTH_FACTS.map((a) => (
                  <div key={a.label} className="rounded-xl p-4" style={{ border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12px] font-semibold" style={primary}>{a.label}</span>
                      <Pill>{a.value}</Pill>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed" style={secondary}>{a.detail}</p>
                  </div>
                ))}
              </div>
              <div>
                <SectionLabel>Request headers accepted today</SectionLabel>
                <FieldTable
                  showRequired
                  fields={[
                    { name: "Content-Type", type: "string", required: false, note: "application/json bodies are parsed by express.json() (no route reads them yet)." },
                    { name: "If-None-Match", type: "string", required: false, note: "Conditional GET; matching ETag returns 304." },
                  ]}
                />
              </div>
            </>
          )}

          {/* ── Errors ────────────────────────────────────────────── */}
          {tab === "errors" && (
            <>
              <p className="max-w-3xl text-[12px] leading-relaxed" style={secondary}>
                The server has no custom error handler, so errors use Express&apos;s default HTML page, not JSON. Each entry below was captured by running the
                server locally.
              </p>
              {SERVER_ERRORS.map((e) => (
                <OpBlock
                  key={e.status}
                  id={`err-${e.status}`}
                  badge={<span className={`inline-flex min-w-[64px] justify-center rounded-md px-2 py-1 font-mono text-[12px] font-bold ring-1 ${e.status >= 500 ? "bg-rose-500/10 text-rose-700 ring-rose-500/30" : "bg-amber-500/10 text-amber-700 ring-amber-500/30"}`}>{e.status}</span>}
                  title={e.title}
                  summary={e.when}
                  right={e.risk ? <Pill className="bg-rose-500/10 text-rose-700">leaks stack trace</Pill> : null}
                  open={open.has(`err-${e.status}`)}
                  onToggle={() => toggle(`err-${e.status}`)}
                >
                  <p className="text-[12px] leading-relaxed" style={secondary}>{e.when}</p>
                  <div className="font-mono text-[11px]" style={muted}>Content-Type: {e.contentType}</div>
                  {e.risk && <p className="rounded-lg p-2.5 text-[12px] bg-rose-500/10 text-rose-800">{e.risk}</p>}
                  {e.body && <CodeBlock value={e.body} label="Response body (paths shortened)" maxHeight={220} />}
                  {e.tryIt && (
                    <TryItOut
                      baseUrl={baseUrl}
                      method={e.tryIt.method}
                      path={e.tryIt.path}
                      contentType={e.tryIt.contentType}
                      body={e.tryIt.body}
                      editableBody={Boolean(e.tryIt.body)}
                    />
                  )}
                </OpBlock>
              ))}

              <div>
                <SectionLabel>Client-side validation messages (shown in forms, never sent to a server)</SectionLabel>
                <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
                  <table className="w-full min-w-[560px] text-left text-[12px]">
                    <thead style={{ backgroundColor: "var(--bg-surface2)" }}>
                      <tr style={muted}>
                        <th className="px-3 py-2 font-semibold">Operation</th>
                        <th className="px-3 py-2 font-semibold">Field</th>
                        <th className="px-3 py-2 font-semibold">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {OPERATIONS.filter((o) => Array.isArray(o.validation)).flatMap((o) =>
                        o.validation.map(([field, msg]) => (
                          <tr key={`${o.action}-${field}-${msg}`} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                            <td className="px-3 py-2 font-mono" style={primary}>{o.action}</td>
                            <td className="px-3 py-2 font-mono text-purple-700">{field}</td>
                            <td className="px-3 py-2" style={secondary}>{msg}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── Gaps ──────────────────────────────────────────────── */}
          {tab === "gaps" && (
            <>
              <p className="max-w-3xl text-[12px] leading-relaxed" style={secondary}>
                Missing or undocumented pieces found while reviewing the server, the Prisma schema, the Redux slices and the sync layer.
              </p>
              <div className="grid gap-3 md:grid-cols-2 [&>*]:min-w-0">
                {GAPS.map((g) => (
                  <div key={g.title} className="rounded-xl p-4" style={{ border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold" style={primary}>{g.title}</span>
                      <Pill className={SEVERITY[g.severity]}>{g.severity}</Pill>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-relaxed" style={secondary}>{g.detail}</p>
                  </div>
                ))}
              </div>
              <div>
                <SectionLabel>Operations that need an endpoint, by module</SectionLabel>
                <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
                  <table className="w-full min-w-[520px] text-left text-[12px]">
                    <thead style={{ backgroundColor: "var(--bg-surface2)" }}>
                      <tr style={muted}>
                        <th className="px-3 py-2 font-semibold">Module</th>
                        {Object.values(KIND_META).map((k) => (
                          <th key={k.label} className="px-3 py-2 text-right font-semibold">{k.label}</th>
                        ))}
                        <th className="px-3 py-2 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map((m) => {
                        const ops = OPERATIONS.filter((o) => o.module === m.id && !o.internal && !o.unused);
                        return (
                          <tr key={m.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                            <td className="px-3 py-2 font-semibold" style={primary}>{m.name}</td>
                            {Object.keys(KIND_META).map((k) => (
                              <td key={k} className="px-3 py-2 text-right tabular-nums" style={secondary}>
                                {ops.filter((o) => o.kind === k).length || "·"}
                              </td>
                            ))}
                            <td className="px-3 py-2 text-right font-semibold tabular-nums" style={primary}>{ops.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-[11px]" style={muted}>Excludes internal sync-layer actions and actions that no page dispatches.</p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function OperationRow({ op, open, onToggle, onOpenSchema }) {
  const tags = (
    <>
      {op.internal && <Pill className="bg-purple-500/10 text-purple-700">internal</Pill>}
      {op.unused && <Pill className="bg-slate-500/10 text-slate-700">not dispatched</Pill>}
      {op.effects?.length > 0 && <Pill className="bg-blue-500/10 text-blue-700">{op.effects.length} effect{op.effects.length > 1 ? "s" : ""}</Pill>}
    </>
  );
  return (
    <OpBlock badge={<KindBadge kind={op.kind} />} title={op.action} summary={op.summary} right={tags} open={open} onToggle={onToggle}>
      <div className="rounded-lg p-2.5 text-[12px] bg-amber-500/10 text-amber-800">
        No HTTP endpoint. {op.kind === "read" ? "Read from the Redux store with useSelector." : `Runs in the browser via dispatch(${op.action.split("/")[1] || op.action}(payload)) and is saved to localStorage.`}
      </div>
      <div className="grid gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="space-y-4">
          {op.returns && (
            <div>
              <SectionLabel>Returns</SectionLabel>
              <span className="text-[12px]" style={secondary}>
                {op.returns.split(/(\w+)/).map((part, i) => (SCHEMAS[part] ? <SchemaLink key={i} name={part} onOpen={onOpenSchema} /> : <React.Fragment key={i}>{part}</React.Fragment>))}
              </span>
            </div>
          )}
          {op.fields && (
            <div>
              <SectionLabel>Payload fields</SectionLabel>
              <FieldTable fields={op.fields} showRequired />
            </div>
          )}
          {!op.fields && op.payload && (
            <div>
              <SectionLabel>Payload</SectionLabel>
              <span className="text-[12px]" style={secondary}>
                {op.payload.split(/(\w+)/).map((part, i) => (SCHEMAS[part] ? <SchemaLink key={i} name={part} onOpen={onOpenSchema} /> : <React.Fragment key={i}>{part}</React.Fragment>))}
              </span>
            </div>
          )}
          {op.validation && (
            <div>
              <SectionLabel>Validation</SectionLabel>
              {Array.isArray(op.validation) ? (
                <ul className="space-y-1">
                  {op.validation.map(([field, msg]) => (
                    <li key={`${field}-${msg}`} className="text-[12px]" style={secondary}>
                      <span className="font-mono font-semibold text-purple-700">{field}</span> · {msg}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[12px]" style={secondary}>{op.validation}</p>
              )}
            </div>
          )}
          {op.effects && (
            <div>
              <SectionLabel>Side effects (sync layer)</SectionLabel>
              <ul className="list-disc space-y-1 pl-4 text-[12px]" style={secondary}>
                {op.effects.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}
          {op.notes && (
            <div>
              <SectionLabel>Notes</SectionLabel>
              <ul className="list-disc space-y-1 pl-4 text-[12px]" style={secondary}>
                {op.notes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          )}
          <div>
            <SectionLabel>Used in</SectionLabel>
            {op.usedIn.length ? (
              <div className="flex flex-wrap gap-1">
                {op.usedIn.map((u) => (
                  <span key={u} className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-slate-500/10 text-slate-700">{u}</span>
                ))}
              </div>
            ) : (
              <p className="text-[12px]" style={muted}>Defined in the slice, but no page dispatches it.</p>
            )}
          </div>
        </div>
        <div>
          {op.example !== undefined && op.example !== null ? (
            <CodeBlock value={op.example} label="Example payload" />
          ) : (
            op.kind !== "read" && <p className="text-[12px]" style={muted}>No payload.</p>
          )}
        </div>
      </div>
    </OpBlock>
  );
}

function GroupHeading({ title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2 pt-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="pb-2">
        <h2 className="text-sm font-bold" style={primary}>{title}</h2>
        {subtitle && <div className="text-[11px]" style={muted}>{subtitle}</div>}
      </div>
      <div className="pb-2">{right}</div>
    </div>
  );
}

function TabLink({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="font-semibold text-blue-600 hover:underline">
      {children}
    </button>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-xl p-6 text-center text-[12px]" style={{ backgroundColor: "var(--bg-surface2)", ...muted }}>
      {text}
    </div>
  );
}
