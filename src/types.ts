export interface Company {
  id: string;
  name: string;
  address: string;
  contact: string;
  contactEmail?: string;
  contactPhone?: string;
  website: string;
  // PIC details
  picName?: string;
  picPosition?: string;
  picEmail?: string;
  picPhoneWA?: string;
  // Contract details
  contractStart?: number; // ISO timestamp
  contractEnd?: number; // ISO timestamp
  contractStatus?: "SIGNED" | "PENDING" | "EXPIRED" | "TERMINATED";
  contractFileName?: string;
  contractDriveFileId?: string;
  contractLocalCacheId?: string;
  // Active state (soft-delete replacement)
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// Audit log entry for tracking changes
export interface AuditLogEntry {
  id: string;
  entityType: "Position" | "Company" | "Candidate";
  entityId: string;
  field: string;
  oldValue: string;
  newValue: string;
  actor: string;
  reason: string;
  timestamp: number;
}

// Sourcing resource for a company (stored in separate sheet)
export interface SourcingResource {
  id: string;
  companyId: string;
  resourceName: string;
  resourceType: string; // e.g. "LinkedIn Recruiter", "Job board"
  url: string;
  accountUsername: string;
  credentialReference: string; // VAULT reference only - never plaintext
  accessStatus: "ACTIVE" | "PENDING" | "REVOKED";
  notes?: string;
  createdAt: number;
  updatedAt: number;
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
export type PositionLevel = "Junior" | "Mid" | "Senior" | "Lead" | "Manager";
export type WorkArrangement = "On-site" | "Hybrid" | "Remote";

// Phase in recruitment pipeline
export interface RecruitmentPhase {
  code: Stage;
  enabled: boolean;
  required: boolean;
}

export interface Position {
  id: string;
  companyId: string;
  title: string;
  // New fields per PRD
  department?: string;
  level?: PositionLevel;
  headcount: number;
  filledCount: number;
  minSalary: number; // full integer IDR
  maxSalary: number; // full integer IDR
  employmentType: PositionType;
  workLocation?: string;
  workArrangement?: WorkArrangement;
  targetDate?: number; // ISO timestamp
  hiringManagerName?: string;
  hiringManagerEmail?: string;
  jobDescription?: string;
  requiredSkills?: string[];
  sourcingChannels?: string[];
  // Status tracking
  status: PositionStatus;
  holdSince?: number; // ISO timestamp when moved to On Hold
  // Pipeline phases
  phases: RecruitmentPhase[];
  // Legacy salary field for backward compatibility (display only)
  salary?: string;
  // Timestamps
  openedAt: number;
  createdAt: number;
  updatedAt: number;
}

// Allowed status transitions matrix
export const STATUS_TRANSITIONS: Record<PositionStatus, PositionStatus[]> = {
  Open: ["On Hold", "Filled", "Cancelled"],
  "On Hold": ["Open", "Cancelled"],
  Filled: ["Open"],
  Cancelled: ["Open"],
};

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
  sourcingResources: SourcingResource[];
  activity: Activity[];
  auditLog: AuditLogEntry[];
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
