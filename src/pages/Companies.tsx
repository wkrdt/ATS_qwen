import React, { useMemo, useState } from "react";
import type { Company, Contract } from "../types";
import { useStore, type CompanyInput } from "../store";
import { fmtDate, hostOf, normalizeUrl, timeAgo } from "../lib/utils";
import { Avatar, Btn, Chip, EmptyState, Field, IconBtn, Select, SlideOver, TextArea, TextInput } from "../components/ui";
import {
  IconBuilding,
  IconCalendar,
  IconDownload,
  IconExternal,
  IconGlobe,
  IconMail,
  IconPencil,
  IconPhone,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
  IconUser,
  IconX,
} from "../components/icons";

const EMPTY_INPUT: CompanyInput = { name: "", address: "", contact: "", contactEmail: "", contactPhone: "", website: "" };

function CompanyForm({
  initial,
  submitLabel,
  onSubmit,
}: {
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
        <TextInput
          autoFocus
          value={form.name}
          invalid={!!errors.name}
          onChange={set("name")}
          placeholder="e.g. Northwind Robotics"
        />
      </Field>
      <Field label="Company address" hint="optional">
        <TextArea
          rows={2}
          value={form.address}
          onChange={set("address")}
          placeholder="Street, city, country"
        />
      </Field>
      <Field label="Company contact person" hint="optional">
        <TextInput value={form.contact} onChange={set("contact")} placeholder="Who do you talk to?" />
      </Field>
      <Field label="Contact email" hint="optional">
        <TextInput
          value={form.contactEmail}
          onChange={set("contactEmail")}
          placeholder="email@company.com"
          inputMode="email"
        />
      </Field>
      <Field label="Contact phone" hint="optional">
        <TextInput
          value={form.contactPhone}
          onChange={set("contactPhone")}
          placeholder="+1 (555) 123-4567"
          inputMode="tel"
        />
      </Field>
      <Field label="Company page" error={errors.website} hint="web page of the company">
        <TextInput
          value={form.website}
          invalid={!!errors.website}
          onChange={set("website")}
          placeholder="https://…"
          inputMode="url"
        />
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

interface SourcingResource {
  id: string;
  name: string;
  type: string;
  url: string;
  companyId: string;
  account: string;
  credentialRef: string;
  status: "ACTIVE" | "PENDING";
}

const SOURCING_RESOURCES: SourcingResource[] = [
  {
    id: "sr-1",
    name: "LinkedIn Recruiter Seat",
    type: "Sourcing platform",
    url: "linkedin.com/recruiter",
    companyId: "nusa-fintech",
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
    account: "oscar@kiranaretail.id",
    credentialRef: "VAULT:js-kirana",
    status: "ACTIVE",
  },
];

export function CompaniesPage() {
  const { db, addCompany, updateCompany, deleteCompany, toast, askConfirm } = useStore();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [panel, setPanel] = useState<{ mode: "add" } | { mode: "edit"; company: Company } | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

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

  return (
    <div className="space-y-5">
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
        <Btn onClick={() => setPanel({ mode: "add" })}>
          <IconPlus size={16} /> Add company
        </Btn>
      </header>

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
        <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-lift">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/80">
                {["Company name", "Company address", "Company contact person", "Contact email", "Contact phone", "Company page"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 font-mono text-[10.5px] font-semibold tracking-[0.13em] text-mist uppercase"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-mono text-[10.5px] font-semibold tracking-[0.13em] text-mist uppercase">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`anim-rise group border-b border-line/70 transition-colors last:border-0 hover:bg-pine-50/60 ${
                    flashId === c.id ? "anim-flashrow" : ""
                  }`}
                  style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} />
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">{c.name}</p>
                        <p className="mt-0.5 font-mono text-[10.5px] text-faint">
                          {c.id} · updated {timeAgo(c.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[280px] px-5 py-3.5 align-top text-[13px] leading-relaxed text-mist">
                    {c.address ? (
                      <span className="line-clamp-2" title={c.address}>
                        {c.address}
                      </span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    {c.contact ? (
                      <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sea-100 text-sea-600">
                          <IconUser size={13} />
                        </span>
                        {c.contact}
                      </span>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    {c.contactEmail ? (
                      <a
                        href={`mailto:${c.contactEmail}`}
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sea-700 hover:underline"
                      >
                        <IconMail size={13} className="shrink-0 opacity-70" />
                        {c.contactEmail}
                      </a>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    {c.contactPhone ? (
                      <a
                        href={`tel:${c.contactPhone}`}
                        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-sea-700 hover:underline"
                      >
                        <IconPhone size={13} className="shrink-0 opacity-70" />
                        {c.contactPhone}
                      </a>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    {c.website ? (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group/link inline-flex max-w-[240px] items-center gap-1.5 rounded-md border border-sea-200 bg-sea-100 px-2.5 py-1 text-xs font-semibold text-sea-700 transition-colors hover:border-sea-500 hover:bg-sea-200"
                        title={c.website}
                      >
                        <IconGlobe size={13} className="shrink-0" />
                        <span className="truncate">{hostOf(c.website)}</span>
                        <IconExternal size={12} className="shrink-0 opacity-50 transition-opacity group-hover/link:opacity-100" />
                      </a>
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <div className="flex items-center justify-end gap-1">
                      <Chip className="mr-1 hidden border-line bg-paper font-mono text-[10px] text-faint lg:inline-flex">
                        since {fmtDate(c.createdAt)}
                      </Chip>
                      <IconBtn tone="brand" label={`Edit ${c.name}`} onClick={() => setPanel({ mode: "edit", company: c })}>
                        <IconPencil size={15} />
                      </IconBtn>
                      <IconBtn tone="danger" label={`Remove ${c.name}`} onClick={() => handleDelete(c)}>
                        <IconTrash size={15} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
}
