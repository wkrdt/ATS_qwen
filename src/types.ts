export interface Company {
  id: string;
  name: string;
  address: string;
  contact: string;
  contactEmail?: string;
  contactPhone?: string;
  website: string;
  createdAt: number;
  updatedAt: number;
}

/* ==================== Clients & Requisitions Types ==================== */

export type ReqStatus = "OPEN" | "ON_HOLD" | "CLOSED" | "CANCELLED";
export type PhaseCode = string;
export type PhaseConfig = { code: PhaseCode; enabled: boolean; required: boolean };

export type ContractStatus = "SIGNED" | "DRAFT" | "EXPIRED";

export interface Client {
  id: string;
  companyName: string;
  website: string;
  picName: string;
  picPosition: string;
  picEmail: string;
  picPhoneWA: string;
  contractStart: string; // ISO date
  contractEnd: string; // ISO date
  contractStatus: ContractStatus;
  contractFileName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Requisition {
  id: string;
  clientId: string;
  positionName: string;
  department: string;
  level: string;
  headcount: number;
  filledCount: number;
  minSalary: number; // full IDR
  maxSalary: number; // full IDR
  targetDate: string; // ISO date
  employmentType: string;
  hiringManagerName: string;
  hiringManagerEmail: string;
  jobDescription: string;
  requiredSkills: string;
  sourcingChannels: string[];
  status: ReqStatus;
  holdSince?: string; // ISO date
  createdAt: number;
  updatedAt: number;
  workLocation: string;
  workArrangement: string;
  phases: PhaseConfig[];
}

export interface Resource {
  id: string;
  clientId: string;
  resourceName: string;
  resourceType: string;
  url: string;
  accountUsername: string;
  credentialReference: string; // vault reference only
  accessStatus: "ACTIVE" | "PENDING" | "REVOKED";
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Application {
  id: string;
  requisitionId: string;
  active: boolean;
  phase: PhaseCode;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLog {
  id: string;
  entityType: "requisition" | "phase_config";
  entityId: string;
  previousValue: unknown;
  newValue: unknown;
  reason: string;
  consultant: string;
  timestamp: number;
}

export type DocumentType = "Main Contract" | "Addendum" | "Revision" | "Extension" | "Other";

export interface Contract {
  id: string;
  companyId: string;
  documentType: DocumentType;
  startDate: number;
  endDate: number;
  documentUrl?: string;
  notes?: string;
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
  contracts: Contract[];
  activity: Activity[];
  clients: Client[];
  requisitions: Requisition[];
  resources: Resource[];
  applications: Application[];
  auditLogs: AuditLog[];
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

/* ==================== Requisitions Constants ==================== */

export const PHASES: Record<PhaseCode, { name: string; color: string }> = {
  INTAKE: { name: "Intake", color: "bg-pine-100 text-pine-700 border-pine-200" },
  JOB_ANALYSIS: { name: "Job Analysis", color: "bg-sea-100 text-sea-700 border-sea-200" },
  SOURCING: { name: "Sourcing", color: "bg-gold-100 text-gold-700 border-gold-200" },
  SCREENING: { name: "Screening", color: "bg-sky-100 text-sky-700 border-sky-200" },
  USER_INTERVIEW: { name: "User Interview", color: "bg-violet-100 text-violet-700 border-violet-200" },
  OFFER: { name: "Offer", color: "bg-rose-100 text-rose-700 border-rose-200" },
  ONBOARDING: { name: "Onboarding", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export const DEFAULT_FLOW: PhaseCode[] = ["INTAKE", "JOB_ANALYSIS", "SOURCING", "SCREENING", "USER_INTERVIEW", "OFFER", "ONBOARDING"];

export const OPTIONAL_PHASES: PhaseCode[] = ["JOB_ANALYSIS", "SOURCING", "SCREENING"];

export const REQ_TRANSITIONS: Record<ReqStatus, ReqStatus[]> = {
  OPEN: ["ON_HOLD", "CLOSED", "CANCELLED"],
  ON_HOLD: ["OPEN", "CANCELLED"],
  CLOSED: [],
  CANCELLED: [],
};

export const STATUS_META_REQ: Record<ReqStatus, string> = {
  OPEN: "bg-pine-100 text-pine-700 border-pine-200",
  ON_HOLD: "bg-gold-100 text-gold-700 border-gold-200",
  CLOSED: "bg-sea-100 text-sea-700 border-sea-200",
  CANCELLED: "bg-clay-100 text-clay-700 border-clay-200",
};

export const CONTRACT_STATUS_META: Record<ContractStatus, string> = {
  SIGNED: "bg-pine-100 text-pine-700 border-pine-200",
  DRAFT: "bg-gold-100 text-gold-700 border-gold-200",
  EXPIRED: "bg-clay-100 text-clay-700 border-clay-200",
};
