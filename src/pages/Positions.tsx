import React, { useMemo, useState } from "react";
import type { Position, PositionStatus } from "../types";
import { POSITION_STATUSES, POSITION_TYPES, STATUS_META } from "../types";
import { useStore, type PositionInput } from "../store";
import { fmtDate, timeAgo } from "../lib/utils";
import { Avatar, Btn, Chip, EmptyState, Field, IconBtn, Select, SlideOver, TextInput } from "../components/ui";
import {
  IconBriefcase,
  IconCheck,
  IconChevronDown,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "../components/icons";

const STATUS_DOT: Record<PositionStatus, string> = {
  Open: "bg-pine-500",
  "On Hold": "bg-gold-500",
  Filled: "bg-sea-500",
  Cancelled: "bg-faint",
};

function StatusMenu({ status, onChange }: { status: PositionStatus; onChange: (s: PositionStatus) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all hover:brightness-95 active:scale-95 ${STATUS_META[status]}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
        {status}
        <IconChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <button
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close status menu"
            tabIndex={-1}
          />
          <div
            role="listbox"
            className="anim-pop absolute top-full left-0 z-20 mt-1.5 w-40 rounded-lg border border-line bg-card p-1 shadow-pop"
          >
            {POSITION_STATUSES.map((s) => (
              <button
                key={s}
                role="option"
                aria-selected={s === status}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-pine-50"
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
                  {s}
                </span>
                {s === status && <IconCheck size={13} className="text-pine-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PositionForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: PositionInput;
  submitLabel: string;
  onSubmit: (v: PositionInput) => void;
}) {
  const { db } = useStore();
  const [form, setForm] = useState<PositionInput>(initial);
  const [errors, setErrors] = useState<{ title?: string; companyId?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.title.trim()) next.title = "Give the position a title.";
    if (!form.companyId) next.companyId = "Pick the client this role belongs to.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ ...form, title: form.title.trim(), salary: form.salary.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Position title" error={errors.title}>
        <TextInput
          autoFocus
          value={form.title}
          invalid={!!errors.title}
          onChange={(e) => {
            setForm((f) => ({ ...f, title: e.target.value }));
            setErrors((er) => ({ ...er, title: undefined }));
          }}
          placeholder="e.g. Supply Chain Analyst"
        />
      </Field>
      <Field label="Client company" error={errors.companyId}>
        <Select
          value={form.companyId}
          invalid={!!errors.companyId}
          onChange={(e) => {
            setForm((f) => ({ ...f, companyId: e.target.value }));
            setErrors((er) => ({ ...er, companyId: undefined }));
          }}
        >
          <option value="">Select a client…</option>
          {db.companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PositionInput["type"] }))}>
            {POSITION_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PositionInput["status"] }))}
          >
            {POSITION_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Salary / fee range" hint="free text">
        <TextInput value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} placeholder="e.g. SGD 6.5 – 8k" />
      </Field>
      <p className="rounded-lg border border-pine-200 bg-pine-50 px-3 py-2.5 text-xs leading-relaxed text-pine-700">
        Saved to the <span className="font-mono font-semibold">Positions</span> sheet, linked to the client by{" "}
        <span className="font-mono">companyId</span>.
      </p>
      <div className="flex justify-end border-t border-line pt-4">
        <Btn type="submit">{submitLabel}</Btn>
      </div>
    </form>
  );
}

const EMPTY = (companyId = ""): PositionInput => ({
  companyId,
  title: "",
  type: "Full-time",
  status: "Open",
  salary: "",
});

export function PositionsPage() {
  const { db, companiesById, addPosition, updatePosition, setPositionStatus, deletePosition, toast, askConfirm } =
    useStore();
  const [query, setQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [panel, setPanel] = useState<{ mode: "add" } | { mode: "edit"; position: Position } | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.positions
      .filter((p) => {
        const company = companiesById.get(p.companyId);
        const matchQ =
          !q || p.title.toLowerCase().includes(q) || (company?.name.toLowerCase().includes(q) ?? false);
        const matchC = companyFilter === "all" || p.companyId === companyFilter;
        const matchS = statusFilter === "all" || p.status === statusFilter;
        return matchQ && matchC && matchS;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [db.positions, companiesById, query, companyFilter, statusFilter]);

  const flash = (id: string) => {
    setFlashId(id);
    window.setTimeout(() => setFlashId(null), 1500);
  };

  const candidatesFor = (id: string) => db.candidates.filter((k) => k.positionId === id).length;

  const handleDelete = (p: Position) => {
    const linked = candidatesFor(p.id);
    askConfirm({
      title: `Remove “${p.title}”?`,
      message: linked
        ? `${linked} linked candidate${linked === 1 ? "" : "s"} will stay in your pipeline as unassigned.`
        : "The position row will be removed from the Positions sheet.",
      confirmLabel: "Remove position",
      danger: true,
      onConfirm: () => {
        deletePosition(p.id);
        toast("info", "Position removed", `${p.title} was deleted.`);
      },
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold-600 uppercase">
            Roles · Positions sheet
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-ink md:text-[34px]">Positions</h1>
          <p className="mt-1 text-sm text-mist">
            {db.positions.filter((p) => p.status === "Open").length} open of {db.positions.length} total — sized for
            under ten mandates a month.
          </p>
        </div>
        <Btn onClick={() => setPanel({ mode: "add" })}>
          <IconPlus size={16} /> Open position
        </Btn>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[260px]">
          <IconSearch size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or client…"
            className="pl-9"
            aria-label="Search positions"
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
        <Select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="w-auto max-w-[200px]" aria-label="Filter by company">
          <option value="all">All clients</option>
          {db.companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto" aria-label="Filter by status">
          <option value="all">Any status</option>
          {POSITION_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <span className="ml-auto font-mono text-[11px] text-faint">
          {filtered.length} of {db.positions.length} shown
        </span>
      </div>

      {db.positions.length === 0 ? (
        <EmptyState
          icon={<IconBriefcase size={24} />}
          title="No open mandates"
          desc="Open your first position against a client. No clients yet? Add one on the Companies page first."
        >
          <Btn onClick={() => setPanel({ mode: "add" })}>
            <IconPlus size={16} /> Open a position
          </Btn>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-linedark bg-card/60 px-6 py-12 text-center">
          <p className="text-sm text-mist">No positions match the current filters.</p>
          <Btn
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => {
              setQuery("");
              setCompanyFilter("all");
              setStatusFilter("all");
            }}
          >
            Reset filters
          </Btn>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-lift">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/80">
                {["Position", "Client", "Status", "Salary / fee", "Candidates", "Opened", "Edit"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 font-mono text-[10.5px] font-semibold tracking-[0.13em] text-mist uppercase ${
                      h === "Edit" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const company = companiesById.get(p.companyId);
                return (
                  <tr
                    key={p.id}
                    className={`anim-rise border-b border-line/70 transition-colors last:border-0 hover:bg-pine-50/60 ${
                      flashId === p.id ? "anim-flashrow" : ""
                    }`}
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.title} />
                        <div>
                          <p className="font-semibold text-ink">{p.title}</p>
                          <p className="mt-0.5 font-mono text-[10.5px] text-faint">{p.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {company ? (
                        <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink">
                          <Avatar name={company.name} size="sm" />
                          {company.name}
                        </span>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusMenu status={p.status} onChange={(s) => setPositionStatus(p.id, s)} />
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[12.5px] text-mist">{p.salary || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Chip className="border-line bg-paper font-mono text-[11px] text-mist">
                        {candidatesFor(p.id)} linked
                      </Chip>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-mist">
                      {fmtDate(p.openedAt)}
                      <span className="block font-mono text-[10.5px] text-faint">{timeAgo(p.openedAt)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn tone="brand" label={`Edit ${p.title}`} onClick={() => setPanel({ mode: "edit", position: p })}>
                          <IconPencil size={15} />
                        </IconBtn>
                        <IconBtn tone="danger" label={`Remove ${p.title}`} onClick={() => handleDelete(p)}>
                          <IconTrash size={15} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <SlideOver
        open={panel !== null}
        onClose={() => setPanel(null)}
        kicker={panel?.mode === "edit" ? "Edit position" : "New mandate"}
        title={panel?.mode === "edit" ? panel.position.title : "Open position"}
      >
        {panel?.mode === "add" &&
          (db.companies.length === 0 ? (
            <div className="rounded-lg border border-gold-200 bg-gold-100 px-4 py-3 text-sm leading-relaxed text-gold-700">
              You need at least one client before opening a position. Head to the{" "}
              <strong>Companies</strong> page and add the company first.
            </div>
          ) : (
            <PositionForm
              initial={EMPTY(db.companies[0]?.id ?? "")}
              submitLabel="Open position"
              onSubmit={(v) => {
                const id = addPosition(v);
                setPanel(null);
                toast("success", "Position opened", `${v.title} is live on your board.`);
                flash(id);
              }}
            />
          ))}
        {panel?.mode === "edit" && (
          <PositionForm
            key={panel.position.id}
            initial={{
              companyId: panel.position.companyId,
              title: panel.position.title,
              type: panel.position.type,
              status: panel.position.status,
              salary: panel.position.salary,
            }}
            submitLabel="Save changes"
            onSubmit={(v) => {
              updatePosition(panel.position.id, v);
              setPanel(null);
              toast("success", "Position updated", `${v.title} saved.`);
              flash(panel.position.id);
            }}
          />
        )}
      </SlideOver>
    </div>
  );
}
