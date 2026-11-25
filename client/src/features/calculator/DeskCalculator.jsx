"use client";

import React, { useCallback, useRef, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";

/**
 * Desk-style business calculator (chain / immediate-execution logic, like a
 * physical desk calculator). Extras for sellers:
 *   TAX+ / TAX-  add or remove GST at the selected rate (tap the rate to cycle)
 *   MU           mark-up: cost ÷ margin MU  -> price that gives that margin
 *                        cost × markup MU   -> cost plus that markup
 *   %            a + b%  /  a - b%  /  a × b%  /  a ÷ b%  (business percent)
 *   GT           grand total of every "=" since the last AC
 *   MRC          recall memory; press twice to clear it
 *
 * Keyboard works while the calculator has focus: digits, + - * /, Enter or =,
 * %, Backspace, Delete (C) and Escape (AC).
 *
 * Props
 *   onApply(field, value)  optional; shows "Use as cost / price" shortcuts
 */

const MAX_DIGITS = 12;
const GST_RATES = [5, 12, 18, 28];
const OP_SYMBOL = { "+": "+", "-": "−", "*": "×", "/": "÷" };

const clean = (n) => (Number.isFinite(n) ? parseFloat(n.toPrecision(12)) : NaN);

const compute = (a, op, b) => {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return b;
  }
};

// Group the integer part Indian-style, keep the typed fraction as-is so a
// trailing "." or "0" stays visible while typing.
const formatEntry = (str) => {
  if (str === "Error") return str;
  const neg = str.startsWith("-");
  const body = neg ? str.slice(1) : str;
  const [int, frac] = body.split(".");
  const grouped = Number(int || 0).toLocaleString("en-IN");
  return `${neg ? "-" : ""}${grouped}${frac !== undefined ? `.${frac}` : ""}`;
};

const toEntry = (n) => {
  const v = clean(n);
  if (!Number.isFinite(v)) return "Error";
  if (Math.abs(v) >= 10 ** MAX_DIGITS) return "Error";
  // Fit within the display: cap decimals so total digits <= MAX_DIGITS.
  const intDigits = Math.max(1, Math.floor(Math.abs(v)).toString().length);
  const decimals = Math.max(0, Math.min(10, MAX_DIGITS - intDigits));
  return String(parseFloat(v.toFixed(decimals)));
};

const INITIAL = {
  entry: "0",
  acc: null,
  op: null,
  waiting: false,
  tape: "",
  lastOp: null, // for repeated "="
  lastOperand: null,
  memory: 0,
  gt: 0,
  mrcArmed: false,
};

export default function DeskCalculator({ onApply, className = "" }) {
  const [s, setS] = useState(INITIAL);
  const [rateIdx, setRateIdx] = useState(2); // 18%
  const [pressed, setPressed] = useState(null);
  const rootRef = useRef(null);
  const rate = GST_RATES[rateIdx];

  const isError = s.entry === "Error";
  const current = isError ? 0 : Number(s.entry);

  const press = useCallback(
    (key) => {
      setS((prev) => {
        const st = { ...prev, mrcArmed: false };
        const cur = prev.entry === "Error" ? 0 : Number(prev.entry);
        const fmt = (n) => formatEntry(toEntry(n));

        // After an error only clearing keys work.
        if (prev.entry === "Error" && !["AC", "C"].includes(key)) return prev;

        const finish = (value, tape) => ({
          ...st,
          entry: toEntry(value),
          acc: null,
          op: null,
          waiting: true,
          tape,
        });

        if (/^\d$/.test(key) || key === "00") {
          if (prev.waiting) return { ...st, entry: key === "00" ? "0" : key, waiting: false };
          const digits = prev.entry.replace(/[-.]/g, "").length;
          if (digits + key.length > MAX_DIGITS) return prev;
          const next = prev.entry === "0" ? (key === "00" ? "0" : key) : prev.entry + key;
          return { ...st, entry: prev.entry === "-0" ? `-${key}` : next };
        }

        switch (key) {
          case ".":
            if (prev.waiting) return { ...st, entry: "0.", waiting: false };
            if (prev.entry.includes(".")) return prev;
            return { ...st, entry: `${prev.entry}.` };

          case "back":
            if (prev.waiting) return prev;
            {
              const next = prev.entry.slice(0, -1);
              return { ...st, entry: next === "" || next === "-" ? "0" : next };
            }

          case "C":
            return { ...st, entry: "0", waiting: false, ...(prev.entry === "Error" ? { acc: null, op: null, tape: "" } : {}) };

          case "AC":
            return { ...INITIAL, memory: prev.memory };

          case "neg":
            if (prev.entry === "0") return prev;
            return { ...st, entry: prev.entry.startsWith("-") ? prev.entry.slice(1) : `-${prev.entry}` };

          case "+":
          case "-":
          case "*":
          case "/": {
            if (prev.op && prev.waiting) {
              return { ...st, op: key, tape: `${fmt(prev.acc)} ${OP_SYMBOL[key]}` };
            }
            const acc = prev.op ? clean(compute(prev.acc, prev.op, cur)) : cur;
            if (!Number.isFinite(acc)) return { ...st, entry: "Error", acc: null, op: null, tape: "" };
            return {
              ...st,
              acc,
              op: key,
              entry: toEntry(acc),
              waiting: true,
              tape: `${fmt(acc)} ${OP_SYMBOL[key]}`,
            };
          }

          case "=": {
            if (prev.op) {
              // "5 + =" uses the shown value (5) as the operand, like a desk calculator.
              const operand = cur;
              const value = clean(compute(prev.acc, prev.op, operand));
              const tape = `${fmt(prev.acc)} ${OP_SYMBOL[prev.op]} ${fmt(operand)} =`;
              const out = finish(value, tape);
              return {
                ...out,
                lastOp: prev.op,
                lastOperand: operand,
                gt: Number.isFinite(value) ? clean(prev.gt + value) : prev.gt,
              };
            }
            if (prev.lastOp) {
              // Constant calculation: repeat the last operation.
              const value = clean(compute(cur, prev.lastOp, prev.lastOperand));
              const tape = `${fmt(cur)} ${OP_SYMBOL[prev.lastOp]} ${fmt(prev.lastOperand)} =`;
              return { ...finish(value, tape), gt: Number.isFinite(value) ? clean(prev.gt + value) : prev.gt };
            }
            return { ...st, waiting: true };
          }

          case "%": {
            if (!prev.op) return finish(cur / 100, `${fmt(cur)} %`);
            const a = prev.acc;
            const map = {
              "+": [a + (a * cur) / 100, `${fmt(a)} + ${fmt(cur)}%`],
              "-": [a - (a * cur) / 100, `${fmt(a)} − ${fmt(cur)}%`],
              "*": [(a * cur) / 100, `${fmt(a)} × ${fmt(cur)}%`],
              "/": [cur === 0 ? NaN : (a / cur) * 100, `${fmt(a)} is what % of ${fmt(cur)}`],
            };
            const [value, tape] = map[prev.op];
            return finish(value, tape);
          }

          case "sqrt":
            if (cur < 0) return { ...st, entry: "Error", tape: "√ of a negative number" };
            return { ...st, entry: toEntry(Math.sqrt(cur)), waiting: true, tape: `√${fmt(cur)}` };

          case "MU": {
            // cost ÷ margin% MU -> price; cost × markup% MU -> cost + markup
            if (prev.op === "/") {
              if (cur >= 100) return { ...st, entry: "Error", acc: null, op: null, tape: "Margin must be under 100%" };
              return finish(prev.acc / (1 - cur / 100), `${fmt(prev.acc)} at ${fmt(cur)}% margin`);
            }
            if (prev.op === "*") {
              return finish(prev.acc * (1 + cur / 100), `${fmt(prev.acc)} + ${fmt(cur)}% markup`);
            }
            return { ...st, tape: "MU: cost ÷ margin% MU" };
          }

          case "TAX+":
            return finish(cur * (1 + rate / 100), `${fmt(cur)} + ${rate}% GST`);

          case "TAX-":
            return finish(cur / (1 + rate / 100), `${fmt(cur)} excl. ${rate}% GST`);

          case "GT":
            return { ...st, entry: toEntry(prev.gt), waiting: true, tape: "Grand total" };

          case "M+":
          case "M-": {
            let value = cur;
            let base = st;
            if (prev.op && !prev.waiting) {
              value = clean(compute(prev.acc, prev.op, cur));
              base = finish(value, `${fmt(prev.acc)} ${OP_SYMBOL[prev.op]} ${fmt(cur)} =`);
            }
            if (!Number.isFinite(value)) return { ...st, entry: "Error" };
            return {
              ...base,
              entry: toEntry(value),
              waiting: true,
              memory: clean(prev.memory + (key === "M+" ? value : -value)),
              tape: `${key === "M+" ? "Added to" : "Subtracted from"} memory`,
            };
          }

          case "MRC":
            if (prev.mrcArmed) return { ...st, memory: 0, tape: "Memory cleared" };
            return { ...st, entry: toEntry(prev.memory), waiting: true, mrcArmed: true, tape: "Memory recall" };

          default:
            return prev;
        }
      });
    },
    [rate]
  );

  const flash = (key) => {
    setPressed(key);
    window.setTimeout(() => setPressed((p) => (p === key ? null : p)), 120);
  };

  const handleKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const map = {
      Enter: "=", "=": "=", Backspace: "back", Delete: "C", Escape: "AC",
      "+": "+", "-": "-", "*": "*", x: "*", "/": "/", "%": "%", ".": ".", ",": ".",
    };
    const key = /^\d$/.test(e.key) ? e.key : map[e.key];
    if (!key) return;
    e.preventDefault();
    flash(key);
    press(key);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(isError ? "" : String(current));
    } catch {
      /* clipboard unavailable; ignore */
    }
  };

  // label, key, variant, aria
  const rows = [
    [["MU", "MU", "fn", "Mark-up"], ["GT", "GT", "fn", "Grand total"], ["TAX−", "TAX-", "fn", `Remove ${rate}% GST`], ["TAX+", "TAX+", "fn", `Add ${rate}% GST`], [<BackspaceOutlinedIcon key="b" sx={{ fontSize: 17 }} />, "back", "fn", "Backspace"]],
    [["MRC", "MRC", "fn", "Memory recall, press twice to clear"], ["M−", "M-", "fn", "Memory minus"], ["M+", "M+", "fn", "Memory plus"], ["%", "%", "op", "Percent"], ["√", "sqrt", "op", "Square root"]],
    [["C", "C", "clear", "Clear entry"], ["7", "7"], ["8", "8"], ["9", "9"], ["÷", "/", "op", "Divide"]],
    [["AC", "AC", "clear", "All clear"], ["4", "4"], ["5", "5"], ["6", "6"], ["×", "*", "op", "Multiply"]],
    [["±", "neg", "fn", "Change sign"], ["1", "1"], ["2", "2"], ["3", "3"], ["−", "-", "op", "Subtract"]],
    [["0", "0"], ["00", "00"], [".", ".", "num", "Decimal point"], ["=", "=", "eq", "Equals"], ["+", "+", "op", "Add"]],
  ];

  const display = isError ? "Error" : formatEntry(s.entry);

  return (
    <section
      ref={rootRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Desk calculator"
      className={`sd-calc rounded-2xl p-4 sm:p-5 outline-none ${className}`}
    >
      {/* Brand strip + solar cell */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-sm font-bold tracking-wide" style={{ color: "var(--text-primary)" }}>
            SellerDesk <span className="font-sans text-[10px] font-semibold tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>DC-12</span>
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            12 digits · GST · Mark-up
          </div>
        </div>
        <div className="sd-calc-solar" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => <span key={i} />)}
        </div>
      </div>

      {/* LCD */}
      <div className="sd-calc-lcd rounded-xl px-3 pb-2 pt-1.5" aria-live="polite">
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold tracking-wider">
          <div className="flex items-center gap-2">
            <span className={s.memory !== 0 ? "" : "opacity-15"}>M</span>
            <span className={s.gt !== 0 ? "" : "opacity-15"}>GT</span>
            <span className={isError ? "" : "opacity-15"}>E</span>
            <span className={s.op ? "" : "opacity-15"}>{s.op ? OP_SYMBOL[s.op] : "+"}</span>
          </div>
          <button
            type="button"
            onClick={() => setRateIdx((i) => (i + 1) % GST_RATES.length)}
            className="rounded px-1 hover:underline"
            title="Change GST rate used by TAX+ / TAX−"
          >
            GST {rate}%
          </button>
        </div>
        <div className="mt-0.5 h-4 truncate text-right text-[11px] opacity-70">{s.tape}</div>
        <div
          className="sd-calc-digits truncate text-right text-[2rem] leading-tight sm:text-[2.25rem]"
          title={display}
        >
          {display}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-2.5 flex items-center justify-end gap-1.5 text-[11px]">
        {onApply && !isError && (
          <>
            <button type="button" className="sd-calc-link" onClick={() => onApply("purchasePrice", String(current))}>
              Use as cost
            </button>
            <button type="button" className="sd-calc-link" onClick={() => onApply("sellingPrice", String(current))}>
              Use as price
            </button>
          </>
        )}
        <button type="button" className="sd-calc-link" onClick={copy} aria-label="Copy result">
          <ContentCopyIcon sx={{ fontSize: 13 }} />
        </button>
      </div>

      {/* Keypad */}
      <div className="mt-3 grid grid-cols-5 gap-2" role="group" aria-label="Calculator keys">
        {rows.flat().map(([label, key, variant = "num", aria]) => (
          <button
            key={key}
            type="button"
            aria-label={aria || (typeof label === "string" ? label : key)}
            title={aria}
            onClick={() => {
              flash(key);
              press(key);
              rootRef.current?.focus({ preventScroll: true });
            }}
            className={`sd-calc-key sd-calc-key--${variant} ${
              variant === "fn" ? "h-8 text-[11px]" : variant === "op" || variant === "eq" ? "h-11 text-2xl" : "h-11 text-lg"
            } ${
              pressed === key ? "is-pressed" : ""
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
