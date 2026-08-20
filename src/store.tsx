import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ActivityKind, Candidate, Company, Contract, DB, Position, Settings, Stage } from "./types";
import { mergeById, uid } from "./lib/utils";
import * as api from "./lib/api";
import type { SheetName } from "./lib/api";
import { buildSeed, EMPTY_DB } from "./data/seed";

const LS_DB = "talentledger.db.v1";
const LS_SETTINGS = "talentledger.settings.v1";
const MAX_ACTIVITY = 60;

// Embedded Google Sheet URL from environment variable (if available)
const EMBEDDED_SHEET_URL = import.meta.env.ATS_sheet || "";

export type SyncState = "local" | "connected" | "syncing" | "error";

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  desc?: string;
}

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

export interface CompanyInput {
  name: string;
  address: string;
  contact: string;
  contactEmail?: string;
  contactPhone?: string;
  website: string;
}
export interface PositionInput {
  companyId: string;
  title: string;
  type: Position["type"];
  status: Position["status"];
  salary: string;
}
export interface CandidateInput {
  name: string;
  email: string;
  phone: string;
  positionId: string | null;
  stage: Stage;
  source: string;
  note: string;
}
export interface ContractInput {
  companyId: string;
  documentType: Contract["documentType"];
  startDate: number;
  endDate: number;
  documentUrl?: string;
  notes?: string;
}

interface StoreValue {
  db: DB;
  settings: Settings;
  syncState: SyncState;
  toasts: Toast[];
  confirm: ConfirmRequest | null;
  companiesById: Map<string, Company>;
  positionsById: Map<string, Position>;
  contractsByCompany: Map<string, Contract[]>;

  toast: (kind: Toast["kind"], title: string, desc?: string) => void;
  dismissToast: (id: string) => void;
  askConfirm: (req: ConfirmRequest) => void;
  resolveConfirm: (ok: boolean) => void;

  addCompany: (input: CompanyInput) => string;
  updateCompany: (id: string, input: CompanyInput) => void;
  deleteCompany: (id: string) => void;

  addPosition: (input: PositionInput) => string;
  updatePosition: (id: string, input: PositionInput) => void;
  setPositionStatus: (id: string, status: Position["status"]) => void;
  deletePosition: (id: string) => void;

  addCandidate: (input: CandidateInput) => string;
  updateCandidate: (id: string, input: CandidateInput) => void;
  setCandidateStage: (id: string, stage: Stage) => void;
  deleteCandidate: (id: string) => void;

  addContract: (input: ContractInput) => string;
  updateContract: (id: string, input: ContractInput) => void;
  deleteContract: (id: string) => void;

  connect: (url: string) => Promise<string | null>;
  disconnect: () => void;
  syncNow: () => Promise<void>;
  resetDemo: () => void;
  clearAll: () => void;
}

const StoreCtx = createContext<StoreValue | null>(null);

function loadDb(): DB {
  try {
    const raw = localStorage.getItem(LS_DB);
    if (!raw) return buildSeed();
    const parsed = JSON.parse(raw) as DB;
    if (
      Array.isArray(parsed.companies) &&
      Array.isArray(parsed.positions) &&
      Array.isArray(parsed.candidates) &&
      Array.isArray(parsed.contracts) &&
      Array.isArray(parsed.activity)
    )
      return parsed;
    return buildSeed();
  } catch {
    return buildSeed();
  }
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS);
    if (raw) {
      const s = JSON.parse(raw) as Settings;
      if (typeof s.sheetUrl === "string")
        return { sheetUrl: s.sheetUrl, connected: !!s.connected, lastSyncAt: s.lastSyncAt ?? null };
    }
  } catch {
    /* ignore */
  }
  // If an embedded sheet URL is provided via environment variable, use it as default
  if (EMBEDDED_SHEET_URL) {
    return { sheetUrl: EMBEDDED_SHEET_URL, connected: true, lastSyncAt: null };
  }
  return { sheetUrl: "", connected: false, lastSyncAt: null };
}

const defaultSettings: Settings = { sheetUrl: "", connected: false, lastSyncAt: null };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(loadDb);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [syncState, setSyncState] = useState<SyncState>(() =>
    loadSettings().connected ? "connected" : "local"
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const dbRef = useRef(db);
  const settingsRef = useRef(settings);
  useEffect(() => {
    dbRef.current = db;
    localStorage.setItem(LS_DB, JSON.stringify(db));
  }, [db]);
  useEffect(() => {
    settingsRef.current = settings;
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  /* ---------------- toasts & confirms ---------------- */

  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (kind: Toast["kind"], title: string, desc?: string) => {
      const id = uid("t");
      setToasts((t) => [...t.slice(-3), { id, kind, title, desc }]);
      window.setTimeout(() => dismissToast(id), 4600);
    },
    [dismissToast]
  );

  const askConfirm = useCallback((req: ConfirmRequest) => setConfirm(req), []);
  const resolveConfirm = useCallback((ok: boolean) => {
    setConfirm((c) => {
      if (ok && c) c.onConfirm();
      return null;
    });
  }, []);

  /* ---------------- remote sync plumbing ---------------- */

  const markSynced = useCallback(() => {
    setSyncState("connected");
    setSettings((s) => ({ ...s, lastSyncAt: Date.now() }));
  }, []);

  const pushRecord = useCallback(
    (sheet: SheetName, record: unknown, label: string) => {
      const s = settingsRef.current;
      if (!s.connected || !s.sheetUrl) return;
      setSyncState("syncing");
      api
        .upsert(s.sheetUrl, sheet, record)
        .then(markSynced)
        .catch(() => {
          setSyncState("error");
          toast("error", "Sheet sync failed", `${label} is saved locally — run “Sync now” to retry.`);
        });
    },
    [markSynced, toast]
  );

  const pushRemove = useCallback(
    (sheet: SheetName, id: string, label: string) => {
      const s = settingsRef.current;
      if (!s.connected || !s.sheetUrl) return;
      setSyncState("syncing");
      api
        .removeRecord(s.sheetUrl, sheet, id)
        .then(markSynced)
        .catch(() => {
          setSyncState("error");
          toast("error", "Sheet sync failed", `${label} is saved locally — run “Sync now” to retry.`);
        });
    },
    [markSynced, toast]
  );

  const pushSnapshot = useCallback(
    (next: DB, label: string) => {
      const s = settingsRef.current;
      if (!s.connected || !s.sheetUrl) return;
      setSyncState("syncing");
      api
        .replaceAll(s.sheetUrl, next)
        .then(markSynced)
        .catch(() => {
          setSyncState("error");
          toast("error", "Sheet sync failed", `${label} is saved locally — run “Sync now” to retry.`);
        });
    },
    [markSynced, toast]
  );

  /* ---------------- activity log ---------------- */

  const withLog = (d: DB, kind: ActivityKind, message: string): DB => ({
    ...d,
    activity: [{ id: uid("a"), kind, message, at: Date.now() }, ...d.activity].slice(0, MAX_ACTIVITY),
  });

  /* ---------------- companies ---------------- */

  const addCompany = useCallback(
    (input: CompanyInput) => {
      const now = Date.now();
      const rec: Company = { id: uid("c"), ...input, createdAt: now, updatedAt: now };
      setDb((d) =>
        withLog({ ...d, companies: [...d.companies, rec] }, "company", `${rec.name} added as a client`)
      );
      pushRecord("Companies", rec, rec.name);
      return rec.id;
    },
    [pushRecord]
  );

  const updateCompany = useCallback(
    (id: string, input: CompanyInput) => {
      let rec: Company | null = null;
      setDb((d) => {
        const companies = d.companies.map((c) =>
          c.id === id ? ((rec = { ...c, ...input, updatedAt: Date.now() }), rec) : c
        );
        return withLog({ ...d, companies }, "company", `${input.name} details updated`);
      });
      if (rec) pushRecord("Companies", rec, input.name);
    },
    [pushRecord]
  );

  const deleteCompany = useCallback(
    (id: string) => {
      const d = dbRef.current;
      const company = d.companies.find((c) => c.id === id);
      const posIds = new Set(d.positions.filter((p) => p.companyId === id).map((p) => p.id));
      const next: DB = {
        ...d,
        companies: d.companies.filter((c) => c.id !== id),
        positions: d.positions.filter((p) => p.companyId !== id),
        candidates: d.candidates.map((k) =>
          k.positionId && posIds.has(k.positionId) ? { ...k, positionId: null } : k
        ),
      };
      setDb(withLog(next, "company", `${company?.name ?? "Client"} removed from workspace`));
      pushSnapshot(next, "The change");
    },
    [pushSnapshot]
  );

  /* ---------------- positions ---------------- */

  const addPosition = useCallback(
    (input: PositionInput) => {
      const now = Date.now();
      const rec: Position = { id: uid("p"), ...input, openedAt: now, createdAt: now, updatedAt: now };
      const client = dbRef.current.companies.find((c) => c.id === input.companyId)?.name ?? "client";
      setDb((d) =>
        withLog({ ...d, positions: [...d.positions, rec] }, "position", `${rec.title} opened at ${client}`)
      );
      pushRecord("Positions", rec, rec.title);
      return rec.id;
    },
    [pushRecord]
  );

  const updatePosition = useCallback(
    (id: string, input: PositionInput) => {
      let rec: Position | null = null;
      setDb((d) => {
        const positions = d.positions.map((p) =>
          p.id === id ? ((rec = { ...p, ...input, updatedAt: Date.now() }), rec) : p
        );
        return withLog({ ...d, positions }, "position", `${input.title} updated`);
      });
      if (rec) pushRecord("Positions", rec, input.title);
    },
    [pushRecord]
  );

  const setPositionStatus = useCallback(
    (id: string, status: Position["status"]) => {
      const existing = dbRef.current.positions.find((p) => p.id === id);
      if (!existing || existing.status === status) return;
      const rec: Position = { ...existing, status, updatedAt: Date.now() };
      setDb((d) =>
        withLog(
          { ...d, positions: d.positions.map((p) => (p.id === id ? rec : p)) },
          "position",
          `${rec.title} marked ${status}`
        )
      );
      pushRecord("Positions", rec, rec.title);
    },
    [pushRecord]
  );

  const deletePosition = useCallback(
    (id: string) => {
      const d = dbRef.current;
      const pos = d.positions.find((p) => p.id === id);
      const next: DB = {
        ...d,
        positions: d.positions.filter((p) => p.id !== id),
        candidates: d.candidates.map((k) => (k.positionId === id ? { ...k, positionId: null } : k)),
      };
      setDb(withLog(next, "position", `${pos?.title ?? "Position"} removed`));
      pushSnapshot(next, "The change");
    },
    [pushSnapshot]
  );

  /* ---------------- candidates ---------------- */

  const addCandidate = useCallback(
    (input: CandidateInput) => {
      const now = Date.now();
      const rec: Candidate = { id: uid("k"), ...input, createdAt: now, updatedAt: now };
      setDb((d) =>
        withLog(
          { ...d, candidates: [...d.candidates, rec] },
          "candidate",
          `${rec.name} sourced via ${rec.source}`
        )
      );
      pushRecord("Candidates", rec, rec.name);
      return rec.id;
    },
    [pushRecord]
  );

  const updateCandidate = useCallback(
    (id: string, input: CandidateInput) => {
      let rec: Candidate | null = null;
      setDb((d) => {
        const candidates = d.candidates.map((k) =>
          k.id === id ? ((rec = { ...k, ...input, updatedAt: Date.now() }), rec) : k
        );
        return withLog({ ...d, candidates }, "candidate", `${input.name} profile updated`);
      });
      if (rec) pushRecord("Candidates", rec, input.name);
    },
    [pushRecord]
  );

  const setCandidateStage = useCallback(
    (id: string, stage: Stage) => {
      const existing = dbRef.current.candidates.find((k) => k.id === id);
      if (!existing || existing.stage === stage) return;
      const rec: Candidate = { ...existing, stage, updatedAt: Date.now() };
      setDb((d) =>
        withLog(
          { ...d, candidates: d.candidates.map((k) => (k.id === id ? rec : k)) },
          "candidate",
          `${rec.name} moved to ${stage}`
        )
      );
      pushRecord("Candidates", rec, rec.name);
    },
    [pushRecord]
  );

  const deleteCandidate = useCallback(
    (id: string) => {
      const d = dbRef.current;
      const k = d.candidates.find((c) => c.id === id);
      const next: DB = { ...d, candidates: d.candidates.filter((c) => c.id !== id) };
      setDb(withLog(next, "candidate", `${k?.name ?? "Candidate"} removed from pipeline`));
      pushRemove("Candidates", id, "The deletion");
    },
    [pushRemove]
  );

  /* ---------------- contracts ---------------- */

  const addContract = useCallback(
    (input: ContractInput) => {
      const now = Date.now();
      const rec: Contract = { id: uid("ct"), ...input, createdAt: now, updatedAt: now };
      const company = dbRef.current.companies.find((c) => c.id === input.companyId)?.name ?? "client";
      setDb((d) =>
        withLog({ ...d, contracts: [...d.contracts, rec] }, "company", `${rec.documentType} added for ${company}`)
      );
      pushRecord("Contracts", rec, rec.documentType);
      return rec.id;
    },
    [pushRecord]
  );

  const updateContract = useCallback(
    (id: string, input: ContractInput) => {
      let rec: Contract | null = null;
      setDb((d) => {
        const contracts = d.contracts.map((ct) =>
          ct.id === id ? ((rec = { ...ct, ...input, updatedAt: Date.now() }), rec) : ct
        );
        return withLog({ ...d, contracts }, "company", `${input.documentType} updated`);
      });
      if (rec) pushRecord("Contracts", rec, input.documentType);
    },
    [pushRecord]
  );

  const deleteContract = useCallback(
    (id: string) => {
      const d = dbRef.current;
      const ct = d.contracts.find((c) => c.id === id);
      const next: DB = { ...d, contracts: d.contracts.filter((c) => c.id !== id) };
      setDb(withLog(next, "company", `${ct?.documentType ?? "Contract"} removed`));
      pushRemove("Contracts", id, "The deletion");
    },
    [pushRemove]
  );

  /* ---------------- google sheets connection ---------------- */

  const performMerge = useCallback(async (url: string, announce: boolean) => {
    const remote = await api.getAll(url);
    const local = dbRef.current;
    const merged: DB = {
      companies: mergeById(local.companies, remote.companies),
      positions: mergeById(local.positions, remote.positions),
      candidates: mergeById(local.candidates, remote.candidates),
      contracts: mergeById(local.contracts, remote.contracts),
      activity: local.activity,
    };
    await api.replaceAll(url, merged);
    setDb(withLog(merged, "sync", announce ? "Google Sheet connected — data merged" : "Synced with Google Sheet"));
    setSettings((s) => ({ ...s, sheetUrl: url, connected: true, lastSyncAt: Date.now() }));
    setSyncState("connected");
  }, []);

  const connect = useCallback(
    async (rawUrl: string): Promise<string | null> => {
      const url = rawUrl.trim();
      setSyncState("syncing");
      try {
        await api.ping(url);
        await performMerge(url, true);
        toast("success", "Connected to Google Sheets", "Every change now syncs to your spreadsheet.");
        return null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not reach the script";
        setSyncState(settingsRef.current.connected ? "error" : "local");
        return msg === "Failed to fetch" ? "No response — check the URL and that access is set to “Anyone”." : msg;
      }
    },
    [performMerge, toast]
  );

  const syncNow = useCallback(async () => {
    const s = settingsRef.current;
    if (!s.connected || !s.sheetUrl) return;
    setSyncState("syncing");
    try {
      await performMerge(s.sheetUrl, false);
      toast("success", "Workspace synced", "Local and sheet are now identical.");
    } catch (err) {
      setSyncState("error");
      toast("error", "Sync failed", err instanceof Error ? err.message : "Check your connection.");
    }
  }, [performMerge, toast]);

  /* background sync on load when already connected */
  const bootSynced = useRef(false);
  useEffect(() => {
    if (bootSynced.current) return;
    bootSynced.current = true;
    const s = settingsRef.current;
    if (s.connected && s.sheetUrl) {
      setSyncState("syncing");
      performMerge(s.sheetUrl, false).catch(() => setSyncState("error"));
    }
  }, [performMerge]);

  const disconnect = useCallback(() => {
    setSettings(defaultSettings);
    setSyncState("local");
    setDb((d) => withLog(d, "sync", "Google Sheets disconnected — working locally"));
    toast("info", "Disconnected", "Your data stays safe in this browser.");
  }, [toast]);

  const resetDemo = useCallback(() => {
    const next = buildSeed();
    setDb(withLog(next, "sync", "Demo data restored"));
    pushSnapshot(next, "The reset");
    toast("success", "Demo data restored");
  }, [pushSnapshot, toast]);

  const clearAll = useCallback(() => {
    const next: DB = { ...EMPTY_DB };
    setDb(withLog(next, "sync", "Workspace cleared"));
    pushSnapshot(next, "The clear");
    toast("info", "Workspace cleared", "Add your first client to get going.");
  }, [pushSnapshot, toast]);

  /* ---------------- lookup maps ---------------- */

  const companiesById = useMemo(() => new Map(db.companies.map((c) => [c.id, c])), [db.companies]);
  const positionsById = useMemo(() => new Map(db.positions.map((p) => [p.id, p])), [db.positions]);
  const contractsByCompany = useMemo(() => {
    const map = new Map<string, Contract[]>();
    db.contracts.forEach((ct) => {
      const arr = map.get(ct.companyId) ?? [];
      arr.push(ct);
      map.set(ct.companyId, arr);
    });
    return map;
  }, [db.contracts]);

  const value: StoreValue = {
    db,
    settings,
    syncState,
    toasts,
    confirm,
    companiesById,
    positionsById,
    contractsByCompany,
    toast,
    dismissToast,
    askConfirm,
    resolveConfirm,
    addCompany,
    updateCompany,
    deleteCompany,
    addPosition,
    updatePosition,
    setPositionStatus,
    deletePosition,
    addCandidate,
    updateCandidate,
    setCandidateStage,
    deleteCandidate,
    addContract,
    updateContract,
    deleteContract,
    connect,
    disconnect,
    syncNow,
    resetDemo,
    clearAll,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
