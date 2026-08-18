import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { initialsOf } from "../lib/utils";
import {
  IconAlert,
  IconCheck,
  IconCloud,
  IconDatabase,
  IconInfo,
  IconSync,
  IconX,
} from "./icons";

/* ---------------- buttons ---------------- */

type BtnVariant = "primary" | "gold" | "outline" | "ghost" | "danger" | "dangerGhost";

const VARIANTS: Record<BtnVariant, string> = {
  primary:
    "bg-pine-800 text-paper border border-pine-700 hover:bg-pine-700 shadow-[0_1px_0_rgb(8_31_23/0.4)]",
  gold: "bg-gold-500 text-pine-950 border border-gold-600/50 hover:bg-gold-400",
  outline: "bg-card text-ink border border-linedark hover:border-pine-400 hover:bg-pine-50",
  ghost: "text-mist border border-transparent hover:bg-ink/5 hover:text-ink",
  danger: "bg-clay-600 text-paper border border-clay-700 hover:bg-clay-500",
  dangerGhost: "text-clay-600 border border-transparent hover:bg-clay-100",
};

export function Btn({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm"
      } ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function IconBtn({
  tone = "neutral",
  label,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "neutral" | "danger" | "brand"; label: string }) {
  const tones = {
    neutral: "text-mist hover:text-ink hover:bg-ink/5 border-transparent",
    danger: "text-mist hover:text-clay-600 hover:bg-clay-100 border-transparent",
    brand: "text-pine-600 hover:text-pine-800 hover:bg-pine-100 border-transparent",
  };
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-all duration-150 active:scale-90 focus-visible:outline-2 focus-visible:outline-gold-500 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------- chip / avatar ---------------- */

export function Chip({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

const AVATAR_TONES = [
  "bg-pine-100 text-pine-700 border-pine-200",
  "bg-gold-100 text-gold-700 border-gold-200",
  "bg-sea-100 text-sea-700 border-sea-200",
  "bg-clay-100 text-clay-600 border-clay-200",
  "bg-pine-800 text-pine-200 border-pine-700",
];

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const tone = AVATAR_TONES[h % AVATAR_TONES.length];
  const cls =
    size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border font-semibold tracking-wide ${tone} ${cls}`}
    >
      {initialsOf(name)}
    </span>
  );
}

/* ---------------- form primitives ---------------- */

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between font-mono text-[11px] font-medium tracking-[0.12em] text-mist uppercase">
        {label}
        {hint ? <span className="normal-case tracking-normal text-faint">{hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-clay-600">
          <IconAlert size={13} /> {error}
        </span>
      ) : null}
    </label>
  );
}

const inputCls = (error?: boolean) =>
  `w-full rounded-lg border bg-card px-3 text-sm text-ink placeholder:text-faint transition-colors focus:outline-none focus:ring-2 ${
    error
      ? "border-clay-500 focus:border-clay-500 focus:ring-clay-100"
      : "border-linedark focus:border-pine-500 focus:ring-pine-100"
  }`;

export function TextInput({
  invalid,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...rest} className={`${inputCls(invalid)} h-10 ${className}`} />;
}

export function TextArea({
  invalid,
  className = "",
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea {...rest} className={`${inputCls(invalid)} py-2 leading-relaxed ${className}`} />;
}

export function Select({
  invalid,
  className = "",
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select {...rest} className={`${inputCls(invalid)} h-10 cursor-pointer appearance-none pr-8 ${className}`}>
      {children}
    </select>
  );
}

/* ---------------- slide-over panel ---------------- */

export function SlideOver({
  open,
  onClose,
  kicker,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  kicker: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!open}>
      <div
        onClick={onClose}
        className="absolute inset-0 bg-pine-950/45 backdrop-blur-[2px] transition-opacity duration-300 opacity-100"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-line bg-paper shadow-pop transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] translate-x-0"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line bg-card px-6 py-5">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-gold-600 uppercase">{kicker}</p>
            <h2 className="font-display mt-1 text-xl font-bold text-ink">{title}</h2>
          </div>
          <IconBtn label="Close panel" onClick={onClose}>
            <IconX size={17} />
          </IconBtn>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-line bg-card px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- empty state ---------------- */

export function EmptyState({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="anim-rise flex flex-col items-center justify-center rounded-xl border border-dashed border-linedark bg-card/60 px-6 py-16 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-pine-200 bg-pine-50 text-pine-600">
        {icon}
      </span>
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-mist">{desc}</p>
      {children ? <div className="mt-5 flex items-center gap-2">{children}</div> : null}
    </div>
  );
}

/* ---------------- sparkline + count-up ---------------- */

export function Sparkline({ values, tone = "pine" }: { values: number[]; tone?: "pine" | "gold" }) {
  const max = Math.max(1, ...values);
  return (
    <span className="flex h-9 items-end gap-[3px]" aria-hidden="true">
      {values.map((v, i) => {
        const last = i === values.length - 1;
        const h = Math.max(4, Math.round((v / max) * 34));
        return (
          <span
            key={i}
            className={`w-[7px] rounded-[2px] ${
              last ? (tone === "gold" ? "bg-gold-500" : "bg-pine-500") : "bg-pine-200"
            }`}
            style={{ height: `${h}px` }}
          />
        );
      })}
    </span>
  );
}

export function useCountUp(target: number, duration = 650): number {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const from = prevRef.current;
    if (from === target) return;
    prevRef.current = target;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ---------------- sync status pill ---------------- */

export function SyncPill({ onClick }: { onClick?: () => void }) {
  const { syncState } = useStore();
  const map = {
    local: { cls: "bg-ink/5 text-mist border-linedark/60", icon: <IconDatabase size={13} />, label: "Local draft" },
    connected: { cls: "bg-pine-100 text-pine-700 border-pine-200", icon: <IconCloud size={13} />, label: "Sheet connected" },
    syncing: { cls: "bg-gold-100 text-gold-700 border-gold-200", icon: <IconSync size={13} className="anim-spin" />, label: "Syncing…" },
    error: { cls: "bg-clay-100 text-clay-700 border-clay-200", icon: <IconAlert size={13} />, label: "Sync issue" },
  } as const;
  const m = map[syncState];
  return (
    <button
      onClick={onClick}
      title="Google Sheets connection"
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors hover:brightness-95 ${m.cls}`}
    >
      {m.icon}
      {m.label}
    </button>
  );
}

/* ---------------- toasts & confirm dialog ---------------- */

export function ToastStack() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-[70] flex w-[min(360px,calc(100vw-40px))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="anim-toastin pointer-events-auto flex items-start gap-3 rounded-xl border border-pine-800 bg-pine-950 px-4 py-3 text-paper shadow-pop"
        >
          <span
            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
              t.kind === "success"
                ? "bg-pine-500/25 text-pine-300"
                : t.kind === "error"
                  ? "bg-clay-500/25 text-clay-200"
                  : "bg-sea-500/25 text-sea-200"
            }`}
          >
            {t.kind === "success" ? <IconCheck size={12} /> : t.kind === "error" ? <IconAlert size={12} /> : <IconInfo size={12} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-tight font-semibold">{t.title}</p>
            {t.desc ? <p className="mt-0.5 text-xs leading-snug text-paper/65">{t.desc}</p> : null}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="rounded p-1 text-paper/50 transition-colors hover:bg-paper/10 hover:text-paper"
          >
            <IconX size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog() {
  const { confirm, resolveConfirm } = useStore();
  if (!confirm) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-pine-950/50 backdrop-blur-[2px]" onClick={() => resolveConfirm(false)} />
      <div
        role="alertdialog"
        aria-modal="true"
        className="anim-pop relative w-full max-w-md rounded-xl border border-line bg-card p-6 shadow-pop"
      >
        <div className="flex items-start gap-4">
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
              confirm.danger ? "border-clay-200 bg-clay-100 text-clay-600" : "border-gold-200 bg-gold-100 text-gold-600"
            }`}
          >
            <IconAlert size={19} />
          </span>
          <div>
            <h3 className="font-display text-lg leading-tight font-bold text-ink">{confirm.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">{confirm.message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Btn variant="outline" onClick={() => resolveConfirm(false)}>
            Cancel
          </Btn>
          <Btn variant={confirm.danger ? "danger" : "primary"} onClick={() => resolveConfirm(true)}>
            {confirm.confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}
