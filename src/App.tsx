import React, { useEffect, useState } from "react";
import type { Page } from "./types";
import { StoreProvider, useStore } from "./store";
import { timeAgo } from "./lib/utils";
import { ConfirmDialog, ToastStack } from "./components/ui";
import {
  IconBriefcase,
  IconBuilding,
  IconGrid,
  IconTable,
  IconUsers,
  LogoMark,
} from "./components/icons";
import { DashboardPage } from "./pages/Dashboard";
import { CompaniesPage } from "./pages/Companies";
import { PositionsPage } from "./pages/Positions";
import { CandidatesPage } from "./pages/Candidates";
import { SetupPage } from "./pages/Setup";

const LS_PAGE = "talentledger.page.v1";

interface NavDef {
  id: Page;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

function NavItem({
  active,
  onClick,
  icon,
  label,
  count,
  dot,
}: NavDef & { active: boolean; onClick: () => void; dot?: string }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 active:scale-[0.98] ${
        active ? "bg-pine-800 text-paper" : "text-pine-200/75 hover:bg-pine-900 hover:text-paper"
      }`}
    >
      {active && <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r bg-gold-500" />}
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
      {count !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10.5px] font-semibold tabular-nums ${
            active ? "bg-pine-700 text-pine-100" : "bg-pine-900 text-pine-300"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function Shell() {
  const { db, syncState, settings } = useStore();
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem(LS_PAGE) as Page | null;
    return saved && ["dashboard", "companies", "positions", "candidates", "setup"].includes(saved)
      ? saved
      : "dashboard";
  });
  useEffect(() => {
    localStorage.setItem(LS_PAGE, page);
  }, [page]);

  const nav: NavDef[] = [
    { id: "dashboard", label: "Dashboard", icon: <IconGrid size={17} /> },
    { id: "companies", label: "Companies", icon: <IconBuilding size={17} />, count: db.companies.length },
    { id: "positions", label: "Positions", icon: <IconBriefcase size={17} />, count: db.positions.length },
    { id: "candidates", label: "Candidates", icon: <IconUsers size={17} />, count: db.candidates.length },
  ];

  const syncDot = {
    local: "bg-paper/30",
    connected: "bg-pine-400",
    syncing: "bg-gold-400 anim-pulse",
    error: "bg-clay-500",
  }[syncState];

  const brand = (
    <div className="flex items-center gap-3">
      <LogoMark size={34} />
      <div>
        <p className="font-display text-[17px] leading-none font-bold tracking-tight">TalentLedger</p>
        <p className="mt-1 font-mono text-[9.5px] font-medium tracking-[0.16em] text-pine-400 uppercase">
          Freelance recruiter ATS
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* -------- sidebar (desktop) -------- */}
      <aside className="sidegrid sticky top-0 hidden h-screen w-[242px] shrink-0 flex-col border-r border-pine-800 bg-pine-950 text-paper md:flex">
        <div className="border-b border-pine-800/70 px-5 py-5">{brand}</div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 font-mono text-[9.5px] font-semibold tracking-[0.18em] text-pine-500 uppercase">
            Workspace
          </p>
          {nav.map((n) => (
            <NavItem key={n.id} {...n} active={page === n.id} onClick={() => setPage(n.id)} />
          ))}
          <p className="px-3 pt-5 pb-2 font-mono text-[9.5px] font-semibold tracking-[0.18em] text-pine-500 uppercase">
            Backend
          </p>
          <NavItem
            id="setup"
            label="Sheets sync"
            icon={<IconTable size={17} />}
            dot={syncDot}
            active={page === "setup"}
            onClick={() => setPage("setup")}
          />
        </nav>

        <div className="border-t border-pine-800/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gold-600/50 bg-gold-500 text-xs font-bold text-pine-950">
              DR
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">Dana Reyes</p>
              <p className="text-[11px] text-pine-300/80">Independent hiring consultant</p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-1.5 font-mono text-[10.5px] text-pine-400">
            <span className={`h-1.5 w-1.5 rounded-full ${syncDot === "bg-paper/30" ? "bg-gold-400" : syncDot}`} />
            {settings.connected
              ? `Sheet · ${settings.lastSyncAt ? `synced ${timeAgo(settings.lastSyncAt)}` : "connected"}`
              : "Autosaved in this browser"}
          </p>
        </div>
      </aside>

      {/* -------- main column -------- */}
      <div className="min-w-0 flex-1">
        {/* mobile header */}
        <div className="sticky top-0 z-40 border-b border-pine-800 bg-pine-950 text-paper md:hidden">
          <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
            <LogoMark size={28} />
            <p className="font-display text-[15px] font-bold">TalentLedger</p>
            <span className={`ml-auto h-2 w-2 rounded-full ${syncDot}`} aria-label="Sync status" />
          </div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
            {[...nav, { id: "setup" as Page, label: "Sheets sync", icon: <IconTable size={15} /> }].map((n) => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  page === n.id ? "bg-pine-700 text-paper" : "text-pine-200/80 hover:bg-pine-900"
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <main className="relative">
          <div className="wash pointer-events-none absolute inset-x-0 top-0 h-[440px]" aria-hidden="true" />
          <div className="dotgrid relative mx-auto max-w-[1180px] px-4 py-6 md:px-8 md:py-9">
            <div key={page} className="anim-rise">
              {page === "dashboard" && <DashboardPage navigate={setPage} />}
              {page === "companies" && <CompaniesPage />}
              {page === "positions" && <PositionsPage />}
              {page === "candidates" && <CandidatesPage />}
              {page === "setup" && <SetupPage />}
            </div>
          </div>
        </main>
      </div>

      <ToastStack />
      <ConfirmDialog />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
