import React, { useState, useMemo } from "react";
import type { Client, Resource, ContractStatus } from "../types";
import { CONTRACT_STATUS_META } from "../types";
import { useStore } from "../store";
import { fmtISODate, daysUntil } from "../lib/utils";
import { Btn, Chip, EmptyState, Field, IconBtn, Select, SlideOver, TextInput, TextArea } from "../components/ui";
import {
  IconBuilding,
  IconCheck,
  IconChevronDown,
  IconFile,
  IconGlobe,
  IconLink,
  IconLock,
  IconMail,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
  IconUser,
  IconX,
} from "../components/icons";

/* ==================== New Client Modal ==================== */

interface ClientInput {
  companyName: string;
  website: string;
  picName: string;
  picPosition: string;
  picEmail: string;
  picPhoneWA: string;
  contractStart: string;
  contractEnd: string;
}

const EMPTY_CLIENT: ClientInput = {
  companyName: "",
  website: "",
  picName: "",
  picPosition: "",
  picEmail: "",
  picPhoneWA: "",
  contractStart: new Date().toISOString().split("T")[0],
  contractEnd: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split("T")[0],
};

function NewClientModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: ClientInput) => void;
}) {
  const [form, setForm] = useState<ClientInput>(EMPTY_CLIENT);
  const [errors, setErrors] = useState<{ companyName?: string; picName?: string }>({});

  React.useEffect(() => {
    if (open) {
      setForm(EMPTY_CLIENT);
      setErrors({});
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.companyName.trim()) next.companyName = "Company name is required.";
    if (!form.picName.trim()) next.picName = "PIC name is required.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-pine-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-pop relative w-full max-w-lg rounded-xl border border-line bg-card p-6 shadow-pop">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-gold-600 uppercase">New Client</p>
            <h3 className="font-display mt-1 text-xl font-bold text-ink">Add Client & Contract</h3>
          </div>
          <IconBtn label="Close" onClick={onClose}>
            <IconX size={17} />
          </IconBtn>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Company name *" error={errors.companyName}>
            <TextInput
              autoFocus
              value={form.companyName}
              invalid={!!errors.companyName}
              onChange={(e) => {
                setForm((f) => ({ ...f, companyName: e.target.value }));
                setErrors((er) => ({ ...er, companyName: undefined }));
              }}
              placeholder="e.g. PT Sumber Makmur"
            />
          </Field>
          <Field label="Website">
            <TextInput
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="https://example.com"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="PIC name *" error={errors.picName}>
              <TextInput
                value={form.picName}
                invalid={!!errors.picName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, picName: e.target.value }));
                  setErrors((er) => ({ ...er, picName: undefined }));
                }}
                placeholder="Contact person"
              />
            </Field>
            <Field label="PIC position">
              <TextInput
                value={form.picPosition}
                onChange={(e) => setForm((f) => ({ ...f, picPosition: e.target.value }))}
                placeholder="e.g. HR Manager"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="PIC email">
              <TextInput
                type="email"
                value={form.picEmail}
                onChange={(e) => setForm((f) => ({ ...f, picEmail: e.target.value }))}
                placeholder="pic@company.com"
              />
            </Field>
            <Field label="PIC WhatsApp">
              <TextInput
                value={form.picPhoneWA}
                onChange={(e) => setForm((f) => ({ ...f, picPhoneWA: e.target.value }))}
                placeholder="+62 xxx"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contract start">
              <TextInput
                type="date"
                value={form.contractStart}
                onChange={(e) => setForm((f) => ({ ...f, contractStart: e.target.value }))}
              />
            </Field>
            <Field label="Contract end">
              <TextInput
                type="date"
                value={form.contractEnd}
                onChange={(e) => setForm((f) => ({ ...f, contractEnd: e.target.value }))}
              />
            </Field>
          </div>
          <p className="rounded-lg border border-pine-200 bg-pine-50 px-3 py-2.5 text-xs leading-relaxed text-pine-700">
            Creates a private Drive folder <span className="font-mono">ATS/Clients/{`{ClientID}`}/</span> for documents.
          </p>
          <div className="flex justify-end border-t border-line pt-4">
            <Btn type="submit">Create Client</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==================== Add Resource Modal ==================== */

interface ResourceInput {
  clientId: string;
  resourceName: string;
  resourceType: string;
  url: string;
  accountUsername: string;
  credentialReference: string;
  notes: string;
}

const EMPTY_RESOURCE: Omit<ResourceInput, "clientId"> = {
  resourceName: "",
  resourceType: "LinkedIn Recruiter",
  url: "",
  accountUsername: "",
  credentialReference: "",
  notes: "",
};

function AddResourceModal({
  open,
  onClose,
  clientId,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  onSubmit: (input: ResourceInput) => void;
}) {
  const [form, setForm] = useState<Omit<ResourceInput, "clientId">>(EMPTY_RESOURCE);
  const [errors, setErrors] = useState<{ resourceName?: string; credentialReference?: string }>({});

  React.useEffect(() => {
    if (open) {
      setForm(EMPTY_RESOURCE);
      setErrors({});
    }
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.resourceName.trim()) next.resourceName = "Resource name is required.";
    if (!form.credentialReference.trim()) next.credentialReference = "Vault reference is required.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ ...form, clientId });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-pine-950/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-pop relative w-full max-w-lg rounded-xl border border-line bg-card p-6 shadow-pop">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-gold-600 uppercase">Sourcing Resource</p>
            <h3 className="font-display mt-1 text-xl font-bold text-ink">Add Sourcing Resource</h3>
          </div>
          <IconBtn label="Close" onClick={onClose}>
            <IconX size={17} />
          </IconBtn>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Resource name *" error={errors.resourceName}>
            <TextInput
              autoFocus
              value={form.resourceName}
              invalid={!!errors.resourceName}
              onChange={(e) => {
                setForm((f) => ({ ...f, resourceName: e.target.value }));
                setErrors((er) => ({ ...er, resourceName: undefined }));
              }}
              placeholder="e.g. LinkedIn Recruiter Lite"
            />
          </Field>
          <Field label="Type">
            <Select
              value={form.resourceType}
              onChange={(e) => setForm((f) => ({ ...f, resourceType: e.target.value }))}
            >
              <option>LinkedIn Recruiter</option>
              <option>Job Board</option>
              <option>Database</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field label="URL">
            <TextInput
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Account username">
              <TextInput
                value={form.accountUsername}
                onChange={(e) => setForm((f) => ({ ...f, accountUsername: e.target.value }))}
                placeholder="user@company.com"
              />
            </Field>
            <Field label="Credential reference *" error={errors.credentialReference}>
              <TextInput
                value={form.credentialReference}
                invalid={!!errors.credentialReference}
                onChange={(e) => {
                  setForm((f) => ({ ...f, credentialReference: e.target.value }));
                  setErrors((er) => ({ ...er, credentialReference: undefined }));
                }}
                placeholder="VAULT:ln-recruiter-nusa"
              />
            </Field>
          </div>
          <Field label="Notes">
            <TextArea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Additional info..."
            />
          </Field>
          <p className="rounded-lg border border-gold-200 bg-gold-50 px-3 py-2.5 text-xs leading-relaxed text-gold-700">
            <IconLock size={13} className="inline mr-1" />
            Store vault references only — no plaintext passwords.
          </p>
          <div className="flex justify-end border-t border-line pt-4">
            <Btn type="submit">Add Resource</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==================== Client Card ==================== */

function ClientCard({
  client,
  reqCount,
  openReqCount,
  onUploadContract,
  onAddResource,
}: {
  client: Client;
  reqCount: number;
  openReqCount: number;
  onUploadContract: (clientId: string, file: File) => void;
  onAddResource: (clientId: string) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5 MB.");
      return;
    }
    onUploadContract(client.id, file);
    e.target.value = "";
  };

  const statusMeta = CONTRACT_STATUS_META[client.contractStatus];

  return (
    <div className="anim-rise flex flex-col justify-between rounded-xl border border-line bg-card p-4 shadow-lift hover:shadow-hover">
      <div>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={client.companyName} size="lg" />
            <div>
              <h3 className="font-semibold text-ink">{client.companyName}</h3>
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-mist hover:text-pine-600"
                >
                  <IconGlobe size={12} />
                  {new URL(client.website).hostname.replace(/^www\./, "")}
                </a>
              )}
            </div>
          </div>
          <Chip className={statusMeta}>{client.contractStatus}</Chip>
        </div>

        <div className="mb-3 space-y-1 text-sm">
          <div className="flex items-center gap-2 text-mist">
            <IconUser size={14} />
            <span className="font-medium text-ink">{client.picName}</span>
            {client.picPosition && <span className="text-faint">· {client.picPosition}</span>}
          </div>
          {client.picEmail && (
            <div className="flex items-center gap-2 text-mist">
              <IconMail size={14} />
              <a href={`mailto:${client.picEmail}`} className="hover:text-pine-600">
                {client.picEmail}
              </a>
            </div>
          )}
          {client.picPhoneWA && (
            <div className="flex items-center gap-2 text-mist">
              <IconPhone size={14} />
              <span>{client.picPhoneWA}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-faint">
            <IconLink size={12} />
            <span>
              {fmtISODate(client.contractStart)} → {fmtISODate(client.contractEnd)}
              {" · "}
              {daysUntil(client.contractEnd)}d left
            </span>
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <Chip className="border-line bg-paper font-mono text-[11px] text-mist">
            {reqCount} requisitions
          </Chip>
          {openReqCount > 0 && (
            <Chip className="border-pine-200 bg-pine-100 font-mono text-[11px] text-pine-700">
              {openReqCount} open
            </Chip>
          )}
        </div>

        <div className="mb-3 rounded-lg border border-linedark bg-paper/50 p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconFile size={15} className="text-mist" />
              <span className="text-sm text-ink">
                {client.contractFileName || "No contract on file"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <Btn
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <IconUpload size={14} />
          {client.contractFileName ? "Replace" : "Upload"} contract
        </Btn>
        <Btn variant="ghost" size="sm" onClick={() => onAddResource(client.id)}>
          <IconPlus size={14} />
          Add resource
        </Btn>
      </div>
    </div>
  );
}

/* ==================== Resources Table ==================== */

function ResourcesTable({
  resources,
  onDelete,
}: {
  resources: Resource[];
  onDelete: (id: string) => void;
}) {
  if (resources.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-linedark bg-card/60 px-6 py-8 text-center">
        <p className="text-sm text-mist">No sourcing resources configured.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-lift">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-paper/80">
            {["Resource", "Type", "Account", "Credential Ref", "Status", "Actions"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 font-mono text-[10.5px] font-semibold tracking-[0.13em] text-mist uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.id} className="border-b border-line/70 transition-colors last:border-0 hover:bg-pine-50/60">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-ink">{r.resourceName}</p>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-mist hover:text-pine-600">
                      {r.url}
                    </a>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-mist">{r.resourceType}</td>
              <td className="px-4 py-3">
                <span className="text-sm text-ink">{r.accountUsername || "—"}</span>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs text-faint">{r.credentialReference}</span>
              </td>
              <td className="px-4 py-3">
                <Chip
                  className={
                    r.accessStatus === "ACTIVE"
                      ? "border-pine-200 bg-pine-100 text-pine-700"
                      : r.accessStatus === "PENDING"
                      ? "border-gold-200 bg-gold-100 text-gold-700"
                      : "border-clay-200 bg-clay-100 text-clay-700"
                  }
                >
                  {r.accessStatus}
                </Chip>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <IconBtn tone="danger" label="Remove" onClick={() => onDelete(r.id)}>
                    <IconTrash size={15} />
                  </IconBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==================== Clients Page ==================== */

export function ClientsPage() {
  const { db, clientsById, addClient, uploadContract, addResource, toast, askConfirm } = useStore();
  const [query, setQuery] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [resourceClientId, setResourceClientId] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.clients
      .filter((c) => !q || c.companyName.toLowerCase().includes(q) || c.picName.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [db.clients, query]);

  const getReqCounts = (clientId: string) => {
    const reqs = db.requisitions.filter((r) => r.clientId === clientId);
    return { total: reqs.length, open: reqs.filter((r) => r.status === "OPEN").length };
  };

  const handleAddClient = (input: ClientInput) => {
    addClient(input);
    toast("success", "Client added", `${input.companyName} is now in your workspace.`);
  };

  const handleUploadContract = (clientId: string, file: File) => {
    uploadContract(clientId, file);
    toast("success", "Contract uploaded", `${file.name} saved to client folder.`);
  };

  const handleAddResource = (input: ResourceInput) => {
    addResource(input);
    toast("success", "Resource added", `${input.resourceName} configured.`);
  };

  const handleDeleteResource = (id: string) => {
    const resource = db.resources.find((r) => r.id === id);
    askConfirm({
      title: `Remove "${resource?.resourceName}"?`,
      message: "The resource will be removed from this client.",
      confirmLabel: "Remove",
      danger: true,
      onConfirm: () => {
        // TODO: implement deleteResource in store
        toast("info", "Resource removed", `${resource?.resourceName} was deleted.`);
      },
    });
  };

  const clientResources = (clientId: string) => db.resources.filter((r) => r.clientId === clientId);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold-600 uppercase">
            Clients & Contracts
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-ink md:text-[34px]">Clients</h1>
          <p className="mt-1 text-sm text-mist">
            {db.clients.length} clients · {db.clients.filter((c) => c.contractStatus === "SIGNED").length} signed contracts
          </p>
        </div>
        <Btn onClick={() => setNewClientOpen(true)}>
          <IconPlus size={16} />
          New client
        </Btn>
      </header>

      <div className="relative min-w-[200px] sm:max-w-[260px]">
        <IconSearch size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients..."
          className="pl-9"
          aria-label="Search clients"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-faint hover:text-ink"
          >
            <IconX size={14} />
          </button>
        )}
      </div>

      {db.clients.length === 0 ? (
        <EmptyState
          icon={<IconBuilding size={24} />}
          title="No clients yet"
          desc="Add your first client to start managing contracts and requisitions."
        >
          <Btn onClick={() => setNewClientOpen(true)}>
            <IconPlus size={16} />
            Add client
          </Btn>
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredClients.map((client) => {
              const { total, open } = getReqCounts(client.id);
              return (
                <ClientCard
                  key={client.id}
                  client={client}
                  reqCount={total}
                  openReqCount={open}
                  onUploadContract={handleUploadContract}
                  onAddResource={setResourceClientId}
                />
              );
            })}
          </div>

          {/* Resources section for selected client */}
          {resourceClientId && (
            <div className="rounded-xl border border-line bg-paper/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink">
                  Sourcing Resources · {clientsById.get(resourceClientId)?.companyName}
                </h3>
                <IconBtn label="Close" onClick={() => setResourceClientId(null)}>
                  <IconX size={17} />
                </IconBtn>
              </div>
              <ResourcesTable
                resources={clientResources(resourceClientId)}
                onDelete={handleDeleteResource}
              />
              <div className="mt-3 flex justify-end">
                <Btn size="sm" onClick={() => {}}>
                  <IconPlus size={14} />
                  Add resource
                </Btn>
              </div>
            </div>
          )}
        </>
      )}

      <NewClientModal
        open={newClientOpen}
        onClose={() => setNewClientOpen(false)}
        onSubmit={handleAddClient}
      />

      {resourceClientId && (
        <AddResourceModal
          open={!!resourceClientId}
          onClose={() => setResourceClientId(null)}
          clientId={resourceClientId}
          onSubmit={handleAddResource}
        />
      )}
    </div>
  );
}

// Simple avatar component for client cards
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const tones = [
    "bg-pine-100 text-pine-700 border-pine-200",
    "bg-gold-100 text-gold-700 border-gold-200",
    "bg-sea-100 text-sea-700 border-sea-200",
    "bg-clay-100 text-clay-600 border-clay-200",
    "bg-pine-800 text-pine-200 border-pine-700",
  ];
  const tone = tones[h % tones.length];
  const cls = size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-11 w-11 text-sm" : "h-9 w-9 text-xs";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-lg border font-semibold tracking-wide ${tone} ${cls}`}>
      {name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?"}
    </span>
  );
}
