import React, { useMemo, useState } from "react";
import type { Company, Contract } from "../types";
import { useStore, type CompanyInput } from "../store";
import { fmtDate, hostOf, normalizeUrl, timeAgo } from "../lib/utils";
import {
  Avatar, Btn, Chip, EmptyState, Field, IconBtn, Select, SlideOver, TextArea, TextInput
} from "../components/ui";
import {
  IconBuilding, IconCalendar, IconDownload, IconExternal, IconGlobe, IconMail,
  IconPencil, IconPhone, IconPlus, IconSearch, IconTrash, IconUpload, IconUser,
  IconX, IconFile, IconAlertCircle, IconLock
} from "../components/icons";

const EMPTY_INPUT: CompanyInput = {
  name: "", address: "", contact: "", contactEmail: "", contactPhone: "", website: ""
};

// ————— Company form (unchanged) —————
function CompanyForm({ initial, submitLabel, onSubmit }: {
  initial: CompanyInput;
  submitLabel: string;
  onSubmit: (v: CompanyInput) => void;
}) {
  const [form, setForm] = useState<CompanyInput>(initial);
  const [errors, setErrors] = useState<{ name?: string; website?: string }>({});

  const set = (k: keyof CompanyInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { name?: string; website?: string } = {};
    if (!form.name.trim()) next.name = "Company name is required.";
    if (form.website.trim() && !normalizeUrl(form.website)) next.website = "That doesn't look like a valid web address.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({
      name: form.name.trim(),
      address: form.address.trim(),
      contact: form.contact.trim(),
      contactEmail: form.contactEmail?.trim(),
      contactPhone: form.contactPhone?.trim(),
      website: form.website.trim() ? normalizeUrl(form.website) ?? "" : "",
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4" id="company-form">
      <Field label="Company name" error={errors.name}>
        <TextInput autoFocus value={form.name} invalid={!!errors.name} onChange={set("name")} placeholder="e.g. Northwind Robotics" />
      </Field>
      <Field label="Company address" hint="optional">
        <TextArea rows={2} value={form.address} onChange={set("address")} placeholder="Street, city, country" />
      </Field>
      <Field label="Company contact person" hint="optional">
        <TextInput value={form.contact} onChange={set("contact")} placeholder="Who do you talk to?" />
      </Field>
      <Field label="Contact email" hint="optional">
        <TextInput value={form.contactEmail} onChange={set("contactEmail")} placeholder="email@company.com" inputMode="email" />
      </Field>
      <Field label="Contact phone" hint="optional">
        <TextInput value={form.contactPhone} onChange={set("contactPhone")} placeholder="+1 (555) 123-4567" inputMode="tel" />
      </Field>
      <Field label="Company page" error={errors.website} hint="web page of the company">
        <TextInput value={form.website} invalid={!!errors.website} onChange={set("website")} placeholder="https://…" inputMode="url" />
      </Field>
      <button type="submit" className="hidden" aria-hidden="true" />
      <p className="rounded-lg border border-pine-200 bg-pine-50 px-3 py-2.5 text-xs leading-relaxed text-pine-700">
        Saved to the <span className="font-mono font-semibold">Companies</span> sheet — one row per client,
        columns exactly as above.
      </p>
      <div className="flex justify-end border-t border-line pt-4">
        <Btn type="submit">{submitLabel}</Btn>
      </div>
    </form>
  );
}

// ————— Sourcing resource types —————
interface SourcingResource {
  id: string;
  name: string;
  type: string;
  url: string;
  companyId: string;
  companyName: string; // added for direct display
  account: string;
  credentialRef: string;
  status: "ACTIVE" | "PENDING";
}

// Hardcoded sourcing resources (adapted to include companyName)
const SOURCING_RESOURCES: SourcingResource[] = [
  {
    id: "sr-1",
    name: "LinkedIn Recruiter Seat",
    type: "Sourcing platform",
    url: "linkedin.com/recruiter",
    companyId: "nusa-fintech",
    companyName: "Nusa Fintech Group",
    account: "raka@tapak.id",
    credentialRef: "VAULT:ln-recruiter-nusa",
    status: "ACTIVE",
  },
  {
    id: "sr-2",
    name: "Glints Employer Account",
    type: "Job board",
    url: "glints.com/employer",
    companyId: "nusa-fintech",
    companyName: "Nusa Fintech Group",
    account: "talent@nusafintech.co.id",
    credentialRef: "VAULT:glints-nusa",
    status: "ACTIVE",
  },
  {
    id: "sr-3",
    name: "Glints Employer Account",
    type: "Job board",
    url: "glints.com/employer",
    companyId: "samudra-biru",
    companyName: "PT Samudra Biru Logistik",
    account: "people@samudrabiru.co.id",
    credentialRef: "VAULT:glints-samudra",
    status: "PENDING",
  },
  {
    id: "sr-4",
    name: "JobStreet Posting Credits",
    type: "Job board",
    url: "jobstreet.co.id",
    companyId: "kirana-retail",
    companyName: "Kirana Retail Indonesia",
    account: "oscar@kiranaretail.id",
    credentialRef: "VAULT:js-kirana",
    status: "ACTIVE",
  },
];

// Simple form for adding a sourcing resource (optional)
function SourcingResourceForm({ onSubmit }: { onSubmit: (v: SourcingResource) => void }) {
  const { db } = useStore();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [url, setUrl] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [account, setAccount] = useState("");
  const [credentialRef, setCredentialRef] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "PENDING">("ACTIVE");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyId) return;
    const company = db.companies.find((c) => c.id === companyId);
    onSubmit({
      id: `sr-${Date.now()}`,
      name: name.trim(),
      type: type.trim() || "Sourcing platform",
      url: url.trim(),
      companyId,
      companyName: company?.name ?? "",
      account: account.trim(),
      credentialRef: credentialRef.trim() || "VAULT:",
      status,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Resource name" >
        <TextInput autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LinkedIn Recruiter Seat" />
      </Field>
      <Field label="Type" hint="e.g. Job board, Sourcing platform">
        <TextInput value={type} onChange={(e) => setType(e.target.value)} placeholder="Job board" />
      </Field>
      <Field label="URL" hint="domain only">
        <TextInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="linkedin.com/recruiter" />
      </Field>
      <Field label="Client">
        <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          <option value="">Select a client…</option>
          {db.companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Account / login">
        <TextInput value={account} onChange={(e) => setAccount(e.target.value)} placeholder="email@company.com" />
      </Field>
      <Field label="Credential ref" hint="vault reference only">
        <TextInput value={credentialRef} onChange={(e) => setCredentialRef(e.target.value)} placeholder="VAULT:…" />
      </Field>
      <Field label="Access status">
        <Select value={status} onChange={(e) => setStatus(e.target.value as "ACTIVE" | "PENDING")}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PENDING">PENDING</option>
        </Select>
      </Field>
      <div className="flex justify-end border-t border-line pt-4">
        <Btn type="submit">Add resource</Btn>
      </div>
    </form>
  );
}

// ————— Main page —————
export function CompaniesPage() {
  const { db, addCompany, updateCompany, deleteCompany, toast, askConfirm } = useStore();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [panel, setPanel] = useState<{ mode: "add" } | { mode: "edit"; company: Company } | null>(null);
  const [sourcingPanel, setSourcingPanel] = useState<boolean>(false);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [sourcingResources, setSourcingResources] = useState<SourcingResource[]>(SOURCING_RESOURCES);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = db.companies.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q) ||
        c.website.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt));
  }, [db.companies, query, sort]);

  // Generate display codes like CLI-001 based on original index
  const companyCodes = useMemo(() => {
    const map = new Map<string, string>();
    db.companies.forEach((c, i) => {
      map.set(c.id, generateCompanyId(c.name, i));
    });
    return map;
  }, [db.companies]);

  const flash = (id: string) => {
    setFlashId(id);
    window.setTimeout(() => setFlashId(null), 1500);
  };

  const handleAdd = (v: CompanyInput) => {
    const id = addCompany(v);
    setPanel(null);
    toast("success", "Client added", `${v.name} is now in your Companies sheet.`);
    flash(id);
  };

  const handleEdit = (id: string, v: CompanyInput) => {
    updateCompany(id, v);
    setPanel(null);
    toast("success", "Client updated", `${v.name} saved.`);
    flash(id);
  };

  const handleDelete = (c: Company) => {
    const posCount = db.positions.filter((p) => p.companyId === c.id).length;
    const candCount = db.candidates.filter(
      (k) => k.positionId && db.positions.some((p) => p.id === k.positionId && p.companyId === c.id)
    ).length;
    askConfirm({
      title: `Remove ${c.name}?`,
      message:
        `This removes the client row${posCount ? `, its ${posCount} position${posCount === 1 ? "" : "s"}` : ""}${
          candCount ? `, and unlinks ${candCount} candidate${candCount === 1 ? "" : "s"}` : ""
        }. Candidates stay in your pipeline as unassigned.`,
      confirmLabel: "Remove client",
      danger: true,
      onConfirm: () => {
        deleteCompany(c.id);
        toast("info", "Client removed", `${c.name} was deleted.`);
      },
    });
  };

  const getContractForCompany = (companyId: string): Contract | undefined => {
    return db.contracts.find((ct) => ct.companyId === companyId);
  };

  const getPositionCounts = (companyId: string) => {
    const positions = db.positions.filter((p) => p.companyId === companyId);
    const total = positions.length;
    const open = positions.filter((p) => p.status === "Open").length;
    return { total, open };
  };

  const generateCompanyId = (name: string, index: number): string => {
    const parts = name.split(" ").filter((w) => w.length > 2);
    const prefix = parts.length > 0 ? parts[0].slice(0, 3).toUpperCase() : "CLI";
    return `${prefix}-${String(index + 1).padStart(3, "0")}`;
  };

  // Placeholder function for contract upload/replace
  const handleContractUpload = (companyId: string, file: File | null) => {
    if (!file) return;
    // In a real app, you would call a store action to upload and update contract
    toast("info", "Contract upload", `Uploading ${file.name} for client…`);
    // Simulate a delay
    setTimeout(() => {
      toast("success", "Contract updated", "Contract file attached.");
    }, 800);
  };

  const handleAddSourcingResource = (resource: SourcingResource) => {
    setSourcingResources((prev) => [...prev, resource]);
    setSourcingPanel(false);
    toast("success", "Sourcing resource added", `${resource.name} saved.`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold-600 uppercase">
            Clients · Companies sheet
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-ink md:text-[34px]">Companies</h1>
          <p className="mt-1 text-sm text-mist">
            The client organisations you source for — {db.companies.length} on the books.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="ghost" onClick={() => setSourcingPanel(true)}>
            <IconSearch size={16} /> Sourcing resource
          </Btn>
          <Btn onClick={() => setPanel({ mode: "add" })}>
            <IconPlus size={16} /> New client
          </Btn>
        </div>
      </header>

      {/* Search & sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <IconSearch size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, contact, address…"
            className="pl-9"
            aria-label="Search companies"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-faint transition-colors hover:text-ink"
            >
              <IconX size={14} />
            </button>
          )}
        </div>
        <Select value={sort} onChange={(e) => setSort(e.target.value as "recent" | "name")} className="w-auto" aria-label="Sort companies">
          <option value="recent">Recently updated</option>
          <option value="name">Name A–Z</option>
        </Select>
        <span className="ml-auto font-mono text-[11px] text-faint">
          {filtered.length} of {db.companies.length} shown
        </span>
      </div>

      {/* Empty states */}
      {db.companies.length === 0 ? (
        <EmptyState
          icon={<IconBuilding size={24} />}
          title="No clients yet"
          desc="Add your first client company — name, address, contact person and their web page. It becomes a row in the Companies sheet."
        >
          <Btn onClick={() => setPanel({ mode: "add" })}>
            <IconPlus size={16} /> Add your first company
          </Btn>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-linedark bg-card/60 px-6 py-12 text-center">
          <p className="text-sm text-mist">
            Nothing matches <strong className="text-ink">“{query}”</strong>.
          </p>
          <Btn variant="ghost" size="sm" className="mt-3" onClick={() => setQuery("")}>
            Clear search
          </Btn>
        </div>
      ) : (
        <>
          {/* Client cards grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger">
            {filtered.map((c, i) => {
              const contract = getContractForCompany(c.id);
              const { total, open } = getPositionCounts(c.id);
              const code = companyCodes.get(c.id) || c.id;
              const domain = c.website ? hostOf(c.website) : "—";
              const isFlash = flashId === c.id;

              return (
                <div
                  key={c.id}
                  className={`bg-card border border-ink-900/8 rounded-xl p-4 hover:border-moss-300 hover:-translate-y-0.5 transition-all duration-200 ${
                    isFlash ? "anim-flashrow" : ""
                  }`}
                >
                  {/* Top row: name & status */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="font-display font-bold text-[15px] text-ink-900 truncate">{c.name}</div>
                      <div className="text-[11px] text-ink-400 font-mono truncate">
                        {domain} · <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-ink-900/6 text-ink-700 border border-ink-900/8">{code}</span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold uppercase tracking-wide rounded-full px-2 py-1 bg-moss-100 text-moss-800 shrink-0">
                      {contract ? "SIGNED" : "UNSIGNED"}
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="mt-3 text-xs text-ink-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <IconUser size={12} className="shrink-0 text-ink-300" />
                      {c.contact ? `${c.contact} — ${c.contactEmail || "no email"}` : "No contact person"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconMail size={12} className="shrink-0 text-ink-300" />
                      {c.contactEmail || "—"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconCalendar size={12} className="shrink-0 text-ink-300" />
                      {contract ? `${fmtDate(contract.startDate)} → ${fmtDate(contract.endDate)}` : "No contract dates"}
                    </div>
                  </div>

                  {/* Requisition counts */}
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-500">
                    <span className="font-bold text-ink-700">{total}</span> requisitions ·{" "}
                    <span className="font-bold text-moss-700">{open}</span> open
                  </div>

                  {/* Contract file / upload */}
                  <div className="mt-3 pt-3 border-t border-ink-900/6 flex items-center justify-between gap-2">
                    {contract ? (
                      <span className="flex items-center gap-1.5 text-[10.5px] font-mono text-moss-700 min-w-0">
                        <IconFile size={12} className="shrink-0" />
                        <span className="truncate">{contract.documentType || "contract.pdf"}</span>
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-hono-600 font-semibold flex items-center gap-1">
                        <IconAlertCircle size={11} className="shrink-0" />
                        No contract on file
                      </span>
                    )}
                    <label className="text-[10.5px] font-bold text-river-600 hover:text-river-800 cursor-pointer inline-flex items-center gap-1 shrink-0">
                      <IconUpload size={11} className="shrink-0" />
                      {contract ? "Replace" : "Upload"}
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => handleContractUpload(c.id, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>

                  {/* Edit/delete buttons */}
                  <div className="mt-3 pt-3 border-t border-ink-900/6 flex justify-end gap-1">
                    <IconBtn tone="brand" label={`Edit ${c.name}`} onClick={() => setPanel({ mode: "edit", company: c })}>
                      <IconPencil size={14} />
                    </IconBtn>
                    <IconBtn tone="danger" label={`Remove ${c.name}`} onClick={() => handleDelete(c)}>
                      <IconTrash size={14} />
                    </IconBtn>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sourcing resources table */}
          <div className="mt-6 bg-card border border-ink-900/8 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-900/6 flex items-center justify-between">
              <h4 className="font-display font-bold text-sm text-ink-900 flex items-center gap-2">
                <IconSearch size={14} className="shrink-0 text-moss-600" />
                Sourcing resources
              </h4>
              <span className="text-[10.5px] font-semibold text-hono-800 bg-hono-100 rounded-full px-2.5 py-1 flex items-center gap-1">
                <IconLock size={10} className="shrink-0" />
                vault references only — no plaintext passwords
              </span>
            </div>
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-ink-400 border-b border-ink-900/6">
                    <th className="px-4 py-2.5 font-bold">Resource</th>
                    <th className="px-3 py-2.5 font-bold">Client</th>
                    <th className="px-3 py-2.5 font-bold">Account</th>
                    <th className="px-3 py-2.5 font-bold">Credential ref</th>
                    <th className="px-3 py-2.5 font-bold">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {sourcingResources.map((res) => (
                    <tr key={res.id} className="border-b border-ink-900/4 hover:bg-moss-50/60 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-ink-900">{res.name}</div>
                        <div className="text-[10px] text-ink-400">{res.type} · {res.url}</div>
                      </td>
                      <td className="px-3 py-2.5 text-ink-600">{res.companyName}</td>
                      <td className="px-3 py-2.5 font-mono text-[10.5px] text-ink-500">{res.account}</td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-ink-900/6 text-ink-700 border border-ink-900/8">
                          {res.credentialRef}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`text-[9.5px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                            res.status === "ACTIVE"
                              ? "bg-moss-100 text-moss-800"
                              : "bg-hono-100 text-hono-800"
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sourcingResources.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-faint">
                        No sourcing resources yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SlideOver: Add/Edit Company */}
      <SlideOver
        open={panel !== null}
        onClose={() => setPanel(null)}
        kicker={panel?.mode === "edit" ? "Edit client" : "New client"}
        title={panel?.mode === "edit" ? panel.company.name : "Add company"}
      >
        {panel?.mode === "add" && <CompanyForm initial={EMPTY_INPUT} submitLabel="Add company" onSubmit={handleAdd} />}
        {panel?.mode === "edit" && (
          <>
            <CompanyForm
              key={panel.company.id}
              initial={{
                name: panel.company.name,
                address: panel.company.address,
                contact: panel.company.contact,
                contactEmail: panel.company.contactEmail ?? "",
                contactPhone: panel.company.contactPhone ?? "",
                website: panel.company.website,
              }}
              submitLabel="Save changes"
              onSubmit={(v) => handleEdit(panel.company.id, v)}
            />
            <div className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2.5 text-xs text-mist">
              <IconMail size={13} className="shrink-0 text-faint" />
              Positions and candidates linked to this client are untouched when you edit.
            </div>
          </>
        )}
      </SlideOver>

      {/* SlideOver: Add Sourcing Resource */}
      <SlideOver
        open={sourcingPanel}
        onClose={() => setSourcingPanel(false)}
        kicker="Sourcing resource"
        title="Add sourcing resource"
      >
        <SourcingResourceForm onSubmit={handleAddSourcingResource} />
      </SlideOver>
    </div>
  );
}
