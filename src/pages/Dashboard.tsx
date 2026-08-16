import React from "react";
import type { Page, Stage } from "../types";
import { ACTIVE_STAGES, STAGE_META } from "../types";
import { useStore } from "../store";
import { addedThisWeek, isThisMonth, timeAgo, weekBuckets } from "../lib/utils";
import { Avatar, Chip, EmptyState, Sparkline, SyncPill, useCountUp, Btn } from "../components/ui";
import {
  IconArrowRight,
  IconBriefcase,
  IconBuilding,
  IconInbox,
  IconRestore,
} from "../components/icons";

function StatTile({
  label,
  value,
  sub,
  spark,
  tone,
  delay,
}: {
  label: string;
  value: number;
  sub: string;
  spark: number[];
  tone: "pine" | "gold";
  delay: number;
}) {
  const shown = useCountUp(value);
  return (
    <div
      className="anim-rise rounded-xl border border-line bg-card p-4 shadow-lift transition-transform duration-200 hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10.5px] font-medium tracking-[0.14em] text-mist uppercase">{label}</p>
          <p className="font-display mt-1.5 text-[34px] leading-none font-bold text-ink tabular-nums">{shown}</p>
          <p className="mt-2 text-xs text-mist">{sub}</p>
        </div>
        <Sparkline values={spark} tone={tone} />
      </div>
    </div>
  );
}

const ACTIVITY_DOT: Record<string, string> = {
  company: "bg-gold-500",
  position: "bg-sea-500",
  candidate: "bg-pine-500",
  sync: "bg-faint",
};

export function DashboardPage({ navigate }: { navigate: (p: Page) => void }) {
  const { db, companiesById, resetDemo } = useStore();

  const openPositions = db.positions.filter((p) => p.status === "Open");
  const onHold = db.positions.filter((p) => p.status === "On Hold").length;
  const activeCandidates = db.candidates.filter((k) => k.stage !== "Placed" && k.stage !== "Rejected");
  const atInterview = db.candidates.filter((k) => k.stage === "Interview").length;
  const placedThisMonth = db.candidates.filter((k) => k.stage === "Placed" && isThisMonth(k.updatedAt));
  const placedAll = db.candidates.filter((k) => k.stage === "Placed");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const funnelTotal = activeCandidates.length + placedThisMonth.length;
  const stageCount = (s: Stage) => db.candidates.filter((k) => k.stage === s).length;

  const candidatesFor = (positionId: string) => db.candidates.filter((k) => k.positionId === positionId);
  const hotFor = (positionId: string) =>
    candidatesFor(positionId).filter((k) => k.stage === "Interview" || k.stage === "Offer").length;

  const firstRun = db.companies.length === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold-600 uppercase">{today}</p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-ink md:text-[34px]">
            {greeting}, Dana
          </h1>
          <p className="mt-1 text-sm text-mist">
            Your search desk at boutique volume — {openPositions.length} live{" "}
            {openPositions.length === 1 ? "role" : "roles"}, {activeCandidates.length} in play.
          </p>
        </div>
        <SyncPill onClick={() => navigate("setup")} />
      </header>

      {firstRun ? (
        <section className="anim-rise rounded-xl border border-pine-200 bg-pine-50/70 p-6 md:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-display text-xl font-bold text-ink">Set up your desk in three moves</h2>
              <p className="mt-1 max-w-lg text-sm leading-relaxed text-mist">
                TalentLedger mirrors a Google Sheet one-to-one: every client, position and candidate you add
                becomes a row. Start local, connect the sheet whenever you are ready.
              </p>
            </div>
            <Btn variant="ghost" size="sm" onClick={resetDemo}>
              <IconRestore size={15} /> Restore demo data
            </Btn>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { n: "01", t: "Add a client", d: "Company name, address, contact person and their web page.", go: "companies" as Page },
              { n: "02", t: "Open a position", d: "Attach the role to the client with status and fee range.", go: "positions" as Page },
              { n: "03", t: "Source candidates", d: "Drag people through Sourced → Placed on the pipeline board.", go: "candidates" as Page },
            ].map((s) => (
              <button
                key={s.n}
                onClick={() => navigate(s.go)}
                className="group rounded-lg border border-pine-200 bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-pine-400 hover:shadow-lift"
              >
                <span className="font-mono text-xs font-semibold text-gold-600">{s.n}</span>
                <p className="font-display mt-1 font-bold text-ink group-hover:text-pine-700">{s.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-mist">{s.d}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-pine-600">
                  Go <IconArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatTile
            label="Active clients"
            value={db.companies.length}
            sub={`${addedThisWeek(db.companies)} added this week`}
            spark={weekBuckets(db.companies, 8)}
            tone="pine"
            delay={0}
          />
          <StatTile
            label="Open positions"
            value={openPositions.length}
            sub={`${onHold} on hold · ${db.positions.length} total`}
            spark={weekBuckets(db.positions, 8)}
            tone="pine"
            delay={60}
          />
          <StatTile
            label="In pipeline"
            value={activeCandidates.length}
            sub={`${atInterview} at interview stage`}
            spark={weekBuckets(db.candidates, 8)}
            tone="pine"
            delay={120}
          />
          <StatTile
            label="Placed this month"
            value={placedThisMonth.length}
            sub={`${placedAll.length} placement${placedAll.length === 1 ? "" : "s"} all-time`}
            spark={weekBuckets(placedAll, 8)}
            tone="gold"
            delay={180}
          />
        </section>
      )}

      {!firstRun && (
        <>
          <section className="anim-rise rounded-xl border border-line bg-card p-5 shadow-lift" style={{ animationDelay: "140ms" }}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="font-display text-base font-bold text-ink">Pipeline funnel</h2>
              <span className="font-mono text-[11px] text-faint">{funnelTotal} tracked candidates</span>
            </div>
            {funnelTotal === 0 ? (
              <p className="rounded-lg border border-dashed border-linedark bg-paper/60 px-4 py-6 text-center text-sm text-mist">
                No active candidates yet — source someone to light up the funnel.
              </p>
            ) : (
              <>
                <div className="flex h-3.5 w-full overflow-hidden rounded-full border border-line bg-paper">
                  {ACTIVE_STAGES.map((s, i) => {
                    const c = stageCount(s);
                    if (c === 0) return null;
                    return (
                      <div
                        key={s}
                        className={`${STAGE_META[s].bar} anim-growx h-full`}
                        style={{ width: `${(c / funnelTotal) * 100}%`, animationDelay: `${i * 90}ms` }}
                        title={`${s}: ${c}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {ACTIVE_STAGES.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1.5 text-xs text-mist">
                      <span className={`h-2 w-2 rounded-full ${STAGE_META[s].dot}`} />
                      {s}
                      <strong className="font-mono text-[11px] font-semibold text-ink">{stageCount(s)}</strong>
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-5">
            <div className="anim-rise rounded-xl border border-line bg-card shadow-lift lg:col-span-3" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-display text-base font-bold text-ink">Open positions</h2>
                <button
                  onClick={() => navigate("positions")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-pine-600 transition-colors hover:text-pine-800"
                >
                  Manage <IconArrowRight size={13} />
                </button>
              </div>
              {openPositions.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={<IconBriefcase size={22} />}
                    title="Nothing on the books"
                    desc="Open a position against one of your clients and it will show up here."
                  >
                    <Btn size="sm" onClick={() => navigate("positions")}>
                      Open a position
                    </Btn>
                  </EmptyState>
                </div>
              ) : (
                <ul>
                  {openPositions.slice(0, 5).map((p) => {
                    const company = companiesById.get(p.companyId);
                    const all = candidatesFor(p.id).filter((k) => k.stage !== "Rejected").length;
                    const hot = hotFor(p.id);
                    return (
                      <li key={p.id} className="border-b border-line/70 last:border-0">
                        <button
                          onClick={() => navigate("candidates")}
                          className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-pine-50/60"
                        >
                          <Avatar name={p.title} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink group-hover:text-pine-700">
                              {p.title}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mist">
                              <IconBuilding size={12} className="text-faint" />
                              {company?.name ?? "—"}
                              <span className="text-faint">·</span>
                              <span className="font-mono text-[11px]">{p.salary || "fee tbd"}</span>
                            </p>
                          </div>
                          <div className="hidden w-28 sm:block">
                            <div className="h-1.5 overflow-hidden rounded-full bg-paper">
                              <div
                                className="h-full rounded-full bg-gold-500 transition-all duration-500"
                                style={{ width: all ? `${Math.max(12, (hot / Math.max(1, all)) * 100)}%` : "0%" }}
                              />
                            </div>
                            <p className="mt-1 font-mono text-[10.5px] text-faint">
                              {hot}/{all} in play
                            </p>
                          </div>
                          <Chip className={STAGE_META.Interview.chip}>{all} candidates</Chip>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="anim-rise rounded-xl border border-line bg-card shadow-lift lg:col-span-2" style={{ animationDelay: "260ms" }}>
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-display text-base font-bold text-ink">Recent activity</h2>
              </div>
              {db.activity.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={<IconInbox size={22} />}
                    title="All quiet"
                    desc="Moves you make — new clients, stage changes, syncs — land here."
                  />
                </div>
              ) : (
                <ul className="max-h-[340px] overflow-y-auto px-5 py-4">
                  {db.activity.slice(0, 12).map((a, i) => (
                    <li key={a.id} className="relative flex gap-3 pb-4 last:pb-0">
                      {i < Math.min(db.activity.length, 12) - 1 && (
                        <span className="absolute top-4 left-[5px] h-full w-px bg-line" aria-hidden="true" />
                      )}
                      <span className={`relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 border-card ${ACTIVITY_DOT[a.kind]}`} />
                      <div className="min-w-0">
                        <p className="text-[13px] leading-snug text-ink">{a.message}</p>
                        <p className="mt-0.5 font-mono text-[10.5px] text-faint">{timeAgo(a.at)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <p className="pb-2 text-center font-mono text-[11px] text-faint">
            Built for boutique volume — under ten roles a month, zero noise.
            <button onClick={() => navigate("setup")} className="ml-1 text-pine-600 underline-offset-2 hover:underline">
              Connect Google Sheets →
            </button>
          </p>
        </>
      )}
    </div>
  );
}
