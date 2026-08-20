export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtClock(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function isThisMonth(ts: number): boolean {
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

/** Counts per week (oldest → newest) over the last `weeks` weeks, keyed on createdAt. */
export function weekBuckets(items: { createdAt: number }[], weeks: number): number[] {
  const buckets = new Array<number>(weeks).fill(0);
  const now = Date.now();
  const WEEK = 7 * 24 * 3600 * 1000;
  for (const it of items) {
    const diff = now - it.createdAt;
    if (diff < 0) continue;
    const idx = weeks - 1 - Math.floor(diff / WEEK);
    if (idx >= 0 && idx < weeks) buckets[idx] += 1;
  }
  return buckets;
}

export interface HasId {
  id: string;
  createdAt: number;
  updatedAt: number;
}

/** Union two collections; on id collision the most recently updated record wins. */
export function mergeById<T extends HasId>(local: T[], remote: T[]): T[] {
  const map = new Map<string, T>();
  for (const r of remote) map.set(r.id, r);
  for (const l of local) {
    const r = map.get(l.id);
    if (!r || l.updatedAt > r.updatedAt) map.set(l.id, l);
  }
  return [...map.values()].sort((a, b) => a.createdAt - b.createdAt);
}

/** Normalises a user-typed web address; returns a valid absolute URL or null. */
export function normalizeUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?";
}

export function addedThisWeek(items: { createdAt: number }[]): number {
  const WEEK = 7 * 24 * 3600 * 1000;
  const cutoff = Date.now() - WEEK;
  return items.filter((i) => i.createdAt >= cutoff).length;
}

/* ==================== Requisitions Helpers ==================== */

/** Parse ISO date string to timestamp */
export function parseISODate(iso: string): number {
  return new Date(iso).getTime();
}

/** Format full IDR to million IDR display (e.g., 5000000 → "5") */
export function fmtMillionIDR(amount: number): string {
  return (amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

/** Format full IDR with jt suffix */
export function fmtIDR(amount: number): string {
  const million = amount / 1_000_000;
  return `${million.toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
}

/** Days until a target date (from now) */
export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate).getTime();
  const now = Date.now();
  const diff = target - now;
  return Math.ceil(diff / (24 * 3600 * 1000));
}

/** Hours since a given timestamp */
export function hoursSince(ts: number): number {
  const diff = Date.now() - ts;
  return Math.floor(diff / (3600 * 1000));
}

/** Format ISO date to readable string */
export function fmtISODate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Get enabled phases in order from requisition phase config */
export function enabledPhases(phases: { code: string; enabled: boolean }[]): string[] {
  return phases.filter((p) => p.enabled).map((p) => p.code);
}
