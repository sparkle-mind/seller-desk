"use client";

import React from "react";
import EmptyState from "./EmptyState";

export default function RecordCardView({
  items = [],
  columns = [],
  fields = [],
  title,
  subtitle,
  keyField = "id",
  onCardClick,
  emptyMessage = "No records found.",
}) {
  if (!items.length) {
    return <EmptyState title="No records found" description={emptyMessage} />;
  }

  const visibleFields = fields
    .map((key) => columns.find((column) => column.key === key))
    .filter(Boolean);
  const actionsColumn = columns.find((column) => column.key === "actions");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <article
          key={item[keyField] ?? index}
          onClick={(event) => {
            if (
              onCardClick &&
              !event.target.closest("a, button, input, select, textarea")
            ) {
              onCardClick(item);
            }
          }}
          onKeyDown={(event) => {
            if (
              onCardClick &&
              (event.key === "Enter" || event.key === " ") &&
              !event.target.closest("a, button, input, select, textarea")
            ) {
              event.preventDefault();
              onCardClick(item);
            }
          }}
          tabIndex={onCardClick ? 0 : undefined}
          className={`sd-stagger-item rounded-2xl p-4 ${onCardClick ? "sd-hover-card cursor-pointer" : ""}`}
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="min-w-0">
            <h2 className="text-sm font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
              {typeof title === "function" ? title(item) : item[title] ?? item[keyField]}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                {typeof subtitle === "function" ? subtitle(item) : item[subtitle]}
              </p>
            )}
          </div>

          {visibleFields.length > 0 && (
            <dl className="mt-4 space-y-3">
              {visibleFields.map((column) => (
                <div
                  key={column.key}
                  className="flex items-start justify-between gap-3 text-xs"
                >
                  <dt className="shrink-0" style={{ color: "var(--text-tertiary)" }}>
                    {column.label}
                  </dt>
                  <dd className="min-w-0 text-right" style={{ color: "var(--text-secondary)" }}>
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key] ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {actionsColumn?.render && (
            <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
              {actionsColumn.render(item.actions, item)}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
