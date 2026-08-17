# TalentLedger

A compact applicant tracking system for an **independent hiring consultant** handling a boutique
volume of mandates (<10 positions/month). Built with React + Vite + TypeScript + Tailwind, backed by
**Google Sheets** via a **Google Apps Script** web app. tes push

```
src/          → the web app (React frontend)
appsscript/   → Code.gs, the Google Sheets backend you paste into Apps Script
```

---

## 1 · Get the source onto your machine

You only need the **source files**, not `node_modules/` or `dist/`. The folder to keep is:

```
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
├── .gitignore
├── README.md
├── appsscript/
│   └── Code.gs
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types.ts
    ├── store.tsx
    ├── data/
    ├── lib/
    ├── components/
    └── pages/
```

If your editor/IDE offers a **"Download ZIP"** or **"Export project"** action, use it and delete
`node_modules/` and `dist/` from the archive afterwards — everything else stays.

## 2 · Upload to GitHub **manually** (no terminal, no `git`)

1. Go to <https://github.com/new> → name the repo (e.g. `talentledger`) → **Create repository**.
   *Tick "Add a README"* so the repo starts with one commit (needed for the web uploader).
2. On the repo page click **"uploading an existing file"** (or *Add file → Upload files*).
3. Drag the **contents of the project folder** into the drop zone.
   - Do **not** drag the outer folder itself — open it and drag the items *inside*.
   - The web uploader skips empty folders and hidden files, so add `.gitignore` via
     *Add file → Create new file* and paste its content if you want it tracked.
4. Click **Commit changes**.

### If creating a repo fails

- **New account / not verified** — verify your email, wait a few minutes, retry.
- **Organisation blocks repo creation** — ask the org owner to create it and add you as a
  collaborator, or use a personal account.
- **Still blocked** — you can host the code on **GitLab** or **Bitbucket** (same drag-and-drop
  upload flow) or use **GitHub Desktop** (*File → New repository → Publish*).

## 3 · Run the app locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build (output in dist/)
```

## 3b · Publish on GitHub Pages (automatic)

Yes — the built app is fully static, so Pages hosts it directly. The repo includes a workflow at
`.github/workflows/deploy.yml` that builds and publishes on **every push**:

1. **Get the workflow file into the repo.** The web uploader skips hidden folders, so create it
   manually: *Add file → Create new file*, type the filename exactly as
   `.github/workflows/deploy.yml`, paste its content, **Commit**.
2. **Turn Pages on:** repo **Settings → Pages** (left menu) → *Build and deployment → Source:*
   choose **GitHub Actions**.
3. Push any change (or use *Actions → Deploy to GitHub Pages → Run workflow*).
4. After ~1–2 minutes the site is live at:

   ```
   https://<your-username>.github.io/<repo-name>/
   ```

Notes:

- The workflow builds with `--base=./`, so it works for **any repo name** — no `vite.config` edits.
- The app talks to **your** Google Sheet from the Pages URL (Apps Script allows cross-origin
  calls from static hosts). The Sheet URL stays in each visitor's browser (localStorage) — nothing
  sensitive is committed, and each person connects their own sheet via **Sheets sync**.
- Want one shared database for a whole team? Everyone pastes the **same** Apps Script `/exec` URL
  into their browser — the Sheet becomes the shared source of truth.

## 4 · Set up the Google Sheets backend

1. Create a new Google Sheet (name it anything, e.g. `TalentLedger DB`).
2. Open **Extensions → Apps Script**, delete the default code, and paste the entire contents of
   [`appsscript/Code.gs`](appsscript/Code.gs). Save (⌘/Ctrl-S).
3. Click **Deploy → New deployment → Web app** and set:
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*
4. Click **Deploy**, authorise the script, and copy the **Web app URL**
   (ends in `/exec`).
5. Back in the app, open **Sheets sync** (sidebar) → paste the URL → **Connect**.
   The three sheets (`Companies`, `Positions`, `Candidates`) are created automatically on first sync.

> Until you connect a sheet, all data autosaves locally in your browser — nothing is lost.

## Sheet schema

| Sheet | Columns |
|-------|---------|
| **Companies** | `id` · `name` · `address` · `contact` · `website` · `createdAt` · `updatedAt` |
| **Positions** | `id` · `companyId` · `title` · `type` · `status` · `salary` · `openedAt` · `createdAt` · `updatedAt` |
| **Candidates** | `id` · `name` · `email` · `phone` · `positionId` · `stage` · `source` · `note` · `createdAt` · `updatedAt` |

Timestamps are epoch milliseconds. `Positions.companyId` → `Companies.id`,
`Candidates.positionId` → `Positions.id` (blank = unassigned).
