import type { DB } from "../types";

/**
 * Thin client for the deployed Apps Script Web App.
 * POSTs use text/plain to avoid CORS preflight (Apps Script-friendly);
 * the script parses e.postData.contents as JSON.
 */

async function withTimeout(ms: number): Promise<AbortSignal> {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function gsGet(baseUrl: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const url = new URL(baseUrl);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { method: "GET", signal: await withTimeout(9000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = (await res.json()) as Record<string, unknown>;
  if (!body.ok) throw new Error(String(body.error ?? "Script returned an error"));
  return body;
}

async function gsPost(baseUrl: string, payload: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    signal: await withTimeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = (await res.json()) as Record<string, unknown>;
  if (!body.ok) throw new Error(String(body.error ?? "Script returned an error"));
  return body;
}

export function ping(url: string): Promise<Record<string, unknown>> {
  return gsGet(url, { action: "ping" });
}

export interface RemoteDB {
  Companies: Record<string, unknown>[];
  Positions: Record<string, unknown>[];
  Candidates: Record<string, unknown>[];
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function str(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}

/** Coerces raw sheet rows into typed app records. */
export async function getAll(url: string): Promise<DB> {
  const body = (await gsGet(url, { action: "getAll" })) as unknown as { data: RemoteDB };
  const d = body.data;
  return {
    companies: (d.Companies ?? []).map((r) => ({
      id: str(r.id),
      name: str(r.name),
      address: str(r.address),
      contact: str(r.contact),
      website: str(r.website),
      createdAt: num(r.createdAt),
      updatedAt: num(r.updatedAt),
    })),
    positions: (d.Positions ?? []).map((r) => ({
      id: str(r.id),
      companyId: str(r.companyId),
      title: str(r.title),
      type: (str(r.type) || "Full-time") as DB["positions"][number]["type"],
      status: (str(r.status) || "Open") as DB["positions"][number]["status"],
      salary: str(r.salary),
      openedAt: num(r.openedAt),
      createdAt: num(r.createdAt),
      updatedAt: num(r.updatedAt),
    })),
    candidates: (d.Candidates ?? []).map((r) => ({
      id: str(r.id),
      name: str(r.name),
      email: str(r.email),
      phone: str(r.phone),
      positionId: str(r.positionId) || null,
      stage: (str(r.stage) || "Sourced") as DB["candidates"][number]["stage"],
      source: str(r.source) || "Other",
      note: str(r.note),
      createdAt: num(r.createdAt),
      updatedAt: num(r.updatedAt),
    })),
    activity: [],
  };
}

export function replaceAll(url: string, db: DB): Promise<Record<string, unknown>> {
  return gsPost(url, {
    action: "replaceAll",
    data: { Companies: db.companies, Positions: db.positions, Candidates: db.candidates },
  });
}

export type SheetName = "Companies" | "Positions" | "Candidates";

export function upsert(url: string, sheet: SheetName, record: unknown): Promise<Record<string, unknown>> {
  return gsPost(url, { action: "upsert", sheet, record });
}

export function removeRecord(url: string, sheet: SheetName, id: string): Promise<Record<string, unknown>> {
  return gsPost(url, { action: "remove", sheet, id });
}
