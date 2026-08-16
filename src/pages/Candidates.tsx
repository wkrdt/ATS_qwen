import React, { useMemo, useState } from "react";
import type { Candidate, Stage } from "../types";
import { ACTIVE_STAGES, SOURCES, STAGE_META } from "../types";
import { useStore, type CandidateInput } from "../store";
import { timeAgo } from "../lib/utils";
import { Avatar, Btn, Chip, EmptyState, Field, IconBtn, Select, SlideOver, TextArea, TextInput } from "../components/ui";
import {
  IconBriefcase,
  IconGrip,
  IconMail,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
  IconX,
} from "../components/icons";

const EMPTY: CandidateInput = {
  name: "",
  email: "",
  phone: "",
  positionId: null,
  stage: "Sourced",
  source: "LinkedIn",
  note: "",
};

function CandidateForm({
  initial,
  editingId,
  onSubmit,
}: {
  initial: CandidateInput;
  editingId?: string;
  onSubmit: (v: CandidateInput) => void;
}) {
  const { db, companiesById, deleteCandidate, toast, askConfirm } = useStore();
  const [form, setForm] = useState<CandidateInput>(initial);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Candidate name is required.";
    if (!form.email.trim()) next.email = "An email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "That email doesn't look right.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), note: form.note.trim() });
  };

  const grouped = db.companies
    .map((c) => ({ company: c, positions: db.positions.filter((p) => p.companyId === c.id) }))
    .filter((g) => g.positions.length > 0);

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Full name" error={errors.name}>
        <TextInput
          autoFocus
          value={form.name}
          invalid={!!errors.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }));
            setErrors((er) => ({ ...er, name: undefined }));
          }}
          placeholder="e.g. Aisyah Putri"
        />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Email" error={errors.email}>
          <TextInput
            value={form.email}
            invalid={!!errors.email}
            onChange={(e) => {
              setForm((f) => ({ ...f, email: e.target.value }));
              setErrors((er) => ({ ...er, email: undefined }));
            }}
            placeholder="name@mail.com"
            inputMode="email"
          />
        </Field>
        <Field label="Phone" hint="optional">
          <TextInput value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+62 …" />
        </Field>
      </div>
      <Field label="Position">
        <Select
          value={form.positionId ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, positionId: e.target.value || null }))}
        >
          <option value="">Unassigned</option>
          {grouped.map((g) => (
            <optgroup key={g.company.id} label={g.company.name}>
              {g.positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stage">
          <Select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as Stage }))}>
            {[...ACTIVE_STAGES, "Rejected" as Stage].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Source">
          <Select value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
            {SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Notes" hint="optional">
        <TextArea rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Salary expectations, notice period, impressions…" />
      </Field>
      {editingId && (
        <div className="flex items-center justify-between border-t border-line pt-4">
          <Btn
            type="button"
            variant="dangerGhost"
            size="sm"
            onClick={() =>
              askConfirm({
                title: `Remove ${form.name || "this candidate"}?`,
                message: "They will be removed from the pipeline and from the Candidates sheet.",
                confirmLabel: "Remove candidate",
                danger: true,
                onConfirm: () => {
                  deleteCandidate(editingId);
                  toast("info", "Candidate removed", `${form.name || "Candidate"} deleted.`);
                },
              })
            }
          >
            <IconTrash size={14} /> Remove
          </Btn>
          <Btn type="submit">Save changes</Btn>
        </div>
      )}
      {!editingId && (
        <div className="flex justify-end border-t border-line pt-4">
          <Btn type="submit">Add to pipeline</Btn>
        </div>
      )}
    </form>
  );
}

export function CandidatesPage() {
  const { db, companiesById, positionsById, addCandidate, updateCandidate, setCandidateStage, toast } = useStore();
  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState("all");
  const [showRejected, setShowRejected] = useState(false);
  const [panel, setPanel] = useState<{ mode: "add" } | { mode: "edit"; candidate: Candidate } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const rejectedCount = db.candidates.filter((k) => k.stage === "Rejected").length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.candidates.filter((k) => {
      if (!showRejected && k.stage === "Rejected") return false;
      if (posFilter !== "all" && k.positionId !== posFilter) return false;
      if (!q) return true;
      const pos = k.positionId ? positionsById.get(k.positionId) : null;
      return (
        k.name.toLowerCase().includes(q) ||
        k.email.toLowerCase().includes(q) ||
        k.source.toLowerCase().includes(q) ||
        (pos?.title.toLowerCase().includes(q) ?? false)
      );
    });
  }, [db.candidates, positionsById, query, posFilter, showRejected]);

  const columns: Stage[] = showRejected ? [...ACTIVE_STAGES, "Rejected"] : ACTIVE_STAGES;
  const byStage = (s: Stage) => visible.filter((k) => k.stage === s).sort((a, b) => b.updatedAt - a.updatedAt);

  const positionLabel = (k: Candidate) => {
    if (!k.positionId) return "Unassigned";
    const p = positionsById.get(k.positionId);
    if (!p) return "Unassigned";
    const c = companiesById.get(p.companyId);
    return `${p.title} · ${c?.name ?? ""}`;
  };

  const handleDrop = (stage: Stage) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragId;
    setOverStage(null);
    setDragId(null);
    if (!id) return;
    const cand = db.candidates.find((k) => k.id === id);
    if (!cand || cand.stage === stage) return;
    setCandidateStage(id, stage);
    toast(
      stage === "Rejected" ? "info" : "success",
      stage === "Placed" ? "Placement made" : `Moved to ${stage}`,
      `${cand.name} — ${positionLabel(cand)}`
    );
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold-600 uppercase">
            Pipeline · Candidates sheet
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-ink md:text-[34px]">Candidates</h1>
          <p className="mt-1 text-sm text-mist">
            Drag cards between stages — {db.candidates.filter((k) => k.stage !== "Rejected" && k.stage !== "Placed").length}{" "}
            active in play.
          </p>
        </div>
        <Btn onClick={() => setPanel({ mode: "add" })}>
          <IconPlus size={16} /> Add candidate
        </Btn>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[260px]">
          <IconSearch size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, source…"
            className="pl-9"
            aria-label="Search candidates"
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
        <Select value={posFilter} onChange={(e) => setPosFilter(e.target.value)} className="w-auto max-w-[240px]" aria-label="Filter by position">
          <option value="all">All positions</option>
          {db.positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {companiesById.get(p.companyId)?.name ?? ""}
            </option>
          ))}
        </Select>
        <button
          onClick={() => setShowRejected((s) => !s)}
          aria-pressed={showRejected}
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-[13px] font-medium transition-all active:scale-[0.97] ${
            showRejected
              ? "border-clay-200 bg-clay-100 text-clay-700"
              : "border-linedark bg-card text-mist hover:bg-ink/5"
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${showRejected ? "bg-clay-500" : "bg-linedark"}`} />
          Rejected ({rejectedCount})
        </button>
      </div>

      {db.candidates.length === 0 ? (
        <EmptyState
          icon={<IconUsers size={24} />}
          title="Your pipeline is empty"
          desc="Source your first candidate and drag them from Sourced all the way to Placed."
        >
          <Btn onClick={() => setPanel({ mode: "add" })}>
            <IconPlus size={16} /> Add candidate
          </Btn>
        </EmptyState>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1 pb-3">
          <div className="flex min-w-max items-start gap-3">
            {columns.map((stage) => {
              const cards = byStage(stage);
              const meta = STAGE_META[stage];
              const isOver = overStage === stage;
              return (
                <section
                  key={stage}
                  aria-label={`${stage} column`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverStage(stage);
                  }}
                  onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                  onDrop={handleDrop(stage)}
                  className={`w-[272px] shrink-0 rounded-xl border transition-all duration-200 ${
                    isOver
                      ? "border-pine-400 bg-pine-50 ring-2 ring-pine-200"
                      : stage === "Rejected"
                        ? "border-clay-200/70 bg-clay-100/30"
                        : "border-line bg-[#eae8dd]/60"
                  }`}
                >
                  <header className={`flex items-center gap-2 px-3.5 pt-3.5 pb-2 ${meta.head}`}>
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    <h2 className="text-[13px] font-bold tracking-wide uppercase">{stage}</h2>
                    <span className="ml-auto rounded-md border border-line bg-card px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-mist">
                      {cards.length}
                    </span>
                  </header>
                  <div className="min-h-[140px] space-y-2 px-2.5 pb-2.5">
                    {cards.length === 0 && (
                      <p
                        className={`rounded-lg border border-dashed px-3 py-6 text-center text-xs ${
                          isOver ? "border-pine-400 text-pine-600" : "border-linedark/70 text-faint"
                        }`}
                      >
                        {isOver ? "Drop here" : "Empty"}
                      </p>
                    )}
                    {cards.map((k) => (
                      <article
                        key={k.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", k.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragId(k.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStage(null);
                        }}
                        className={`group cursor-grab rounded-lg border border-line bg-card p-3 shadow-sm transition-all duration-200 select-none hover:-translate-y-0.5 hover:border-pine-300 hover:shadow-lift active:cursor-grabbing ${
                          dragId === k.id ? "rotate-1 opacity-50" : ""
                        } ${k.stage === "Rejected" ? "opacity-75" : ""}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <IconGrip size={14} className="mt-1 shrink-0 text-linedark transition-colors group-hover:text-faint" />
                          <Avatar name={k.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13.5px] font-semibold text-ink">{k.name}</p>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-mist">
                              <IconBriefcase size={11} className="shrink-0 text-faint" />
                              <span className="truncate">{positionLabel(k)}</span>
                            </p>
                          </div>
                          <IconBtn
                            tone="brand"
                            label={`Edit ${k.name}`}
                            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                            onClick={() => setPanel({ mode: "edit", candidate: k })}
                          >
                            <IconPencil size={13} />
                          </IconBtn>
                        </div>
                        <div className="mt-2.5 flex items-center gap-1.5 pl-[26px]">
                          <Chip className={`${meta.chip} text-[10.5px]`}>{k.source}</Chip>
                          {k.email && (
                            <span className="flex min-w-0 items-center gap-1 text-[10.5px] text-faint">
                              <IconMail size={11} className="shrink-0" />
                              <span className="truncate">{k.email}</span>
                            </span>
                          )}
                          <span className="ml-auto shrink-0 font-mono text-[10px] text-faint">{timeAgo(k.updatedAt)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      <SlideOver
        open={panel !== null}
        onClose={() => setPanel(null)}
        kicker={panel?.mode === "edit" ? "Edit candidate" : "New candidate"}
        title={panel?.mode === "edit" ? panel.candidate.name : "Add candidate"}
      >
        {panel?.mode === "add" && (
          <CandidateForm
            initial={EMPTY}
            onSubmit={(v) => {
              addCandidate(v);
              setPanel(null);
              toast("success", "Candidate added", `${v.name} joined the ${v.stage} stage.`);
            }}
          />
        )}
        {panel?.mode === "edit" && (
          <CandidateForm
            key={panel.candidate.id}
            editingId={panel.candidate.id}
            initial={{
              name: panel.candidate.name,
              email: panel.candidate.email,
              phone: panel.candidate.phone,
              positionId: panel.candidate.positionId,
              stage: panel.candidate.stage,
              source: panel.candidate.source,
              note: panel.candidate.note,
            }}
            onSubmit={(v) => {
              updateCandidate(panel.candidate.id, v);
              setPanel(null);
              toast("success", "Candidate updated", `${v.name} saved.`);
            }}
          />
        )}
      </SlideOver>
    </div>
  );
}
