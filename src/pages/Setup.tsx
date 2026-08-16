import React, { useState } from "react";
import { APPS_SCRIPT_CODE, SHEET_SCHEMA } from "../lib/appsscript";
import { useStore } from "../store";
import { fmtClock, timeAgo } from "../lib/utils";
import { Btn, Chip, Field, SyncPill, TextInput } from "../components/ui";
import {
  IconAlert,
  IconCheck,
  IconCloud,
  IconCopy,
  IconDatabase,
  IconLink,
  IconRestore,
  IconSync,
  IconTable,
  IconTrash,
} from "../components/icons";

const STEPS = [
  {
    t: "Create a fresh Google Sheet",
    d: "sheets.new — name it something like “TalentLedger — My Desk”. The script creates the three tabs itself.",
  },
  {
    t: "Open Apps Script and paste the code",
    d: "Extensions → Apps Script. Delete the stub, paste the Code.gs below, save (Ctrl/Cmd + S).",
  },
  {
    t: "Deploy as a Web App",
    d: "Deploy → New deployment → type: Web app. Execute as: Me. Who has access: Anyone. Authorise when asked.",
  },
  {
    t: "Paste the /exec URL and connect",
    d: "Copy the deployment URL (ends in /exec) into the field above. Connect runs a ping, pulls rows and merges.",
  },
];

export function SetupPage() {
  const { settings, syncState, connect, disconnect, syncNow, resetDemo, clearAll, db, askConfirm, toast } =
    useStore();
  const [url, setUrl] = useState(settings.sheetUrl);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const busy = syncState === "syncing";

  const handleConnect = async () => {
    setErr(null);
    if (!url.trim()) {
      setErr("Paste your Apps Script Web App URL first.");
      return;
    }
    const e = await connect(url);
    if (e) setErr(e);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast("error", "Copy failed", "Select the code and copy it manually.");
    }
  };

  const rowsTotal = db.companies.length + db.positions.length + db.candidates.length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-gold-600 uppercase">
            Backend · Google Sheets
          </p>
          <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-ink md:text-[34px]">
            Sheets sync
          </h1>
          <p className="mt-1 max-w-xl text-sm text-mist">
            Your spreadsheet <em>is</em> the database. A tiny Apps Script Web App reads and writes three sheets —
            Companies, Positions, Candidates — with the exact columns this app uses.
          </p>
        </div>
        <SyncPill />
      </header>

      {/* connection card */}
      <section className="anim-rise rounded-xl border border-line bg-card p-5 shadow-lift md:p-6">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${
              settings.connected ? "border-pine-200 bg-pine-100 text-pine-600" : "border-linedark bg-paper text-mist"
            }`}
          >
            {settings.connected ? <IconCloud size={19} /> : <IconDatabase size={19} />}
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink">
              {settings.connected ? "Connected to your spreadsheet" : "Working locally"}
            </h2>
            <p className="text-xs text-mist">
              {settings.connected
                ? `Last synced ${settings.lastSyncAt ? `${timeAgo(settings.lastSyncAt)} (${fmtClock(settings.lastSyncAt)})` : "moments ago"} · every change pushes to the sheet`
                : "Everything you do autosaves in this browser. Connect a sheet to back it up and share it."}
            </p>
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Chip className="border-line bg-paper font-mono text-[11px] text-mist">{rowsTotal} rows</Chip>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <IconLink size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
            <TextInput
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErr(null);
              }}
              placeholder="https://script.google.com/macros/s/…/exec"
              className="pl-9 font-mono text-[12.5px]"
              disabled={busy}
              aria-label="Apps Script Web App URL"
            />
          </div>
          <div className="flex gap-2">
            <Btn onClick={handleConnect} disabled={busy} className="min-w-[110px]">
              {busy ? <IconSync size={15} className="anim-spin" /> : <IconLink size={15} />}
              {settings.connected ? "Reconnect" : "Connect"}
            </Btn>
            {settings.connected && (
              <>
                <Btn variant="gold" onClick={syncNow} disabled={busy} title="Pull from the sheet, merge, push back">
                  {busy ? <IconSync size={15} className="anim-spin" /> : <IconSync size={15} />}
                  Sync now
                </Btn>
                <Btn
                  variant="dangerGhost"
                  onClick={() =>
                    askConfirm({
                      title: "Disconnect Google Sheets?",
                      message:
                        "The app keeps working on the local copy in your browser. Nothing is deleted from your spreadsheet.",
                      confirmLabel: "Disconnect",
                      danger: true,
                      onConfirm: disconnect,
                    })
                  }
                >
                  Disconnect
                </Btn>
              </>
            )}
          </div>
        </div>
        {err && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-clay-200 bg-clay-100 px-3 py-2.5 text-xs leading-relaxed font-medium text-clay-700">
            <IconAlert size={14} className="mt-0.5 shrink-0" /> {err}
          </p>
        )}
        {!settings.connected && !err && (
          <p className="mt-3 text-xs leading-relaxed text-faint">
            Tip: the deployment must allow access to <strong className="text-mist">“Anyone”</strong>, and the URL
            must be the <span className="font-mono">/exec</span> one — not <span className="font-mono">/dev</span>.
          </p>
        )}
      </section>

      {/* steps */}
      <section className="anim-rise grid gap-4 lg:grid-cols-5" style={{ animationDelay: "80ms" }}>
        <div className="rounded-xl border border-line bg-card p-5 shadow-lift lg:col-span-2">
          <h2 className="font-display text-base font-bold text-ink">How to connect in 4 steps</h2>
          <ol className="mt-4 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-3">
                <span className="font-mono mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-gold-300 bg-gold-100 text-[11px] font-bold text-gold-700">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{s.t}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-mist">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* schema */}
        <div className="rounded-xl border border-line bg-card p-5 shadow-lift lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">Sheet schema</h2>
            <span className="font-mono text-[11px] text-faint">1 app field = 1 column</span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {SHEET_SCHEMA.map((s) => (
              <div key={s.sheet} className="rounded-lg border border-line bg-paper/60 p-3">
                <p className="flex items-center gap-1.5 font-mono text-[11.5px] font-bold text-pine-700">
                  <IconTable size={13} /> {s.sheet}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {s.columns.map((c) => (
                    <li key={c.name} className="text-[11px] leading-tight">
                      <span className="font-mono font-semibold text-ink">{c.name}</span>
                      <span className="block text-faint">{c.hint}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* code */}
      <section className="anim-rise overflow-hidden rounded-xl border border-pine-800 bg-pine-950 shadow-lift" style={{ animationDelay: "140ms" }}>
        <div className="flex items-center justify-between border-b border-pine-800 bg-pine-900/60 px-4 py-2.5">
          <p className="font-mono text-[12px] font-semibold text-pine-200">
            Code.gs <span className="ml-2 font-normal text-pine-400">· paste into your sheet's Apps Script project</span>
          </p>
          <button
            onClick={handleCopy}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-all active:scale-95 ${
              copied
                ? "border-pine-400 bg-pine-500/20 text-pine-300"
                : "border-pine-700 bg-pine-800 text-pine-100 hover:bg-pine-700"
            }`}
          >
            {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
            {copied ? "Copied to clipboard" : "Copy code"}
          </button>
        </div>
        <pre className="max-h-[420px] overflow-auto px-4 py-4 font-mono text-[12px] leading-[1.65] whitespace-pre text-pine-100/90">
          {APPS_SCRIPT_CODE}
        </pre>
      </section>

      {/* danger zone */}
      <section className="anim-rise rounded-xl border border-clay-200 bg-card p-5 shadow-lift" style={{ animationDelay: "200ms" }}>
        <h2 className="font-display text-base font-bold text-ink">Workspace data</h2>
        <p className="mt-1 text-xs text-mist">
          Local data lives in this browser. Reset to the sample dataset, or clear everything and start fresh.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn
            variant="outline"
            onClick={() =>
              askConfirm({
                title: "Restore demo data?",
                message: "Your current clients, positions and candidates will be replaced with the sample dataset.",
                confirmLabel: "Restore demo",
                onConfirm: resetDemo,
              })
            }
          >
            <IconRestore size={15} /> Restore demo data
          </Btn>
          <Btn
            variant="dangerGhost"
            onClick={() =>
              askConfirm({
                title: "Clear the whole workspace?",
                message: `All ${rowsTotal} rows (companies, positions, candidates) will be removed from this browser${
                  settings.connected ? " and from the connected sheet on the next sync" : ""
                }. This cannot be undone.`,
                confirmLabel: "Clear everything",
                danger: true,
                onConfirm: clearAll,
              })
            }
          >
            <IconTrash size={15} /> Clear workspace
          </Btn>
        </div>
      </section>
    </div>
  );
}
