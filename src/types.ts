export interface Company {
  id: string;
  name: string;
  address: string;
  contact: string;
  website: string;
  createdAt: number;
  updatedAt: number;
}

export type PositionType = "Full-time" | "Part-time" | "Contract";
export type PositionStatus = "Open" | "On Hold" | "Filled" | "Cancelled";

export interface Position {
  id: string;
  companyId: string;
  title: string;
  type: PositionType;
  status: PositionStatus;
  salary: string;
  openedAt: number;
  createdAt: number;
  updatedAt: number;
}

export type Stage = "Sourced" | "Screened" | "Interview" | "Offer" | "Placed" | "Rejected";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  positionId: string | null;
  stage: Stage;
  source: string;
  note: string;
  createdAt: number;
  updatedAt: number;
}

export type ActivityKind = "company" | "position" | "candidate" | "sync";

export interface Activity {
  id: string;
  kind: ActivityKind;
  message: string;
  at: number;
}

export interface DB {
  companies: Company[];
  positions: Position[];
  candidates: Candidate[];
  activity: Activity[];
}

export interface Settings {
  sheetUrl: string;
  connected: boolean;
  lastSyncAt: number | null;
}

export type Page = "dashboard" | "companies" | "positions" | "candidates" | "setup";

/* ---------------- display metadata ---------------- */

export const ACTIVE_STAGES: Stage[] = ["Sourced", "Screened", "Interview", "Offer", "Placed"];
export const ALL_STAGES: Stage[] = [...ACTIVE_STAGES, "Rejected"];

export const STAGE_META: Record<Stage, { chip: string; dot: string; bar: string; head: string }> = {
  Sourced: {
    chip: "bg-[#ecebe2] text-mist border-linedark/70",
    dot: "bg-faint",
    bar: "bg-faint",
    head: "text-mist",
  },
  Screened: {
    chip: "bg-sea-100 text-sea-700 border-sea-200",
    dot: "bg-sea-500",
    bar: "bg-sea-500",
    head: "text-sea-600",
  },
  Interview: {
    chip: "bg-gold-100 text-gold-700 border-gold-200",
    dot: "bg-gold-500",
    bar: "bg-gold-500",
    head: "text-gold-600",
  },
  Offer: {
    chip: "bg-gold-200/70 text-[#7a4d0c] border-gold-300",
    dot: "bg-gold-600",
    bar: "bg-gold-600",
    head: "text-gold-700",
  },
  Placed: {
    chip: "bg-pine-100 text-pine-700 border-pine-200",
    dot: "bg-pine-500",
    bar: "bg-pine-500",
    head: "text-pine-600",
  },
  Rejected: {
    chip: "bg-clay-100 text-clay-700 border-clay-200",
    dot: "bg-clay-500",
    bar: "bg-clay-500",
    head: "text-clay-600",
  },
};

export const POSITION_TYPES: PositionType[] = ["Full-time", "Part-time", "Contract"];
export const POSITION_STATUSES: PositionStatus[] = ["Open", "On Hold", "Filled", "Cancelled"];

export const STATUS_META: Record<PositionStatus, string> = {
  Open: "bg-pine-100 text-pine-700 border-pine-200",
  "On Hold": "bg-gold-100 text-gold-700 border-gold-200",
  Filled: "bg-sea-100 text-sea-700 border-sea-200",
  Cancelled: "bg-[#ecebe2] text-mist border-linedark/70",
};

export const SOURCES = ["LinkedIn", "Referral", "Job Board", "Direct", "Talent Pool", "Other"];
