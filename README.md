# hacker-job-trends

> Searchable jobs and hiring trends from Hacker News [Ask HN: Who is Hiring?](https://news.ycombinator.com/submitted?id=whoishiring) posts.

Every month HN's "Who is Hiring?" thread collects hundreds of job posts, but they
live in free-text comments — impossible to search, filter, or compare over time.
This project parses those comments into structured data with an LLM and serves a
React app on top of it.

## The site

Three pages:

- **Jobs** — recent openings, newest first. Full-text search plus filters for
  remote type, salary, location, visa sponsorship, and internships. Every job
  links back to its original HN comment, and has a "Report an issue" button
  (fields are AI-extracted and occasionally wrong). Loads recent months first and
  lazy-loads older ones on demand.
- **Trends** — average salary over time, and keyword popularity (% of each month's
  posts mentioning React, Python, Rust, AI, remote, … — toggle keywords to compare).
- **Hackers** — GitHub sponsors of [@timqian](https://github.com/sponsors/timqian).

## Layout

```
data/                 # the dataset (committed) — source of truth, no database
  jobs/<month>.json   #   one JSONL file per month: raw HN text + AI-extracted fields
  jobs/index.json     #   manifest of available months   (derived)
  trends.json         #   salary + keyword series         (derived)
  hackers.json        #   GitHub sponsors
scripts/              # Node/TS pipeline (update, backfill, derive, hackers, store)
  types.ts            #   shared data types — imported by both scripts and frontend
frontend/             # Vite + React + TS app → builds to frontend/dist
```

Data and app are fully decoupled: the React app fetches `data/*` at runtime, so a
data refresh needs no app rebuild (and vice-versa). Each job record carries both
the raw comment and the AI-extracted fields, so the app reads them directly — no
separate copy. A daily refresh only rewrites the current month's file, so past
months stay byte-identical and git diffs stay tiny.

> The top-level `site/` folder is the previous hand-written static version, kept
> for reference; the live app is `frontend/`.

## Develop

Clone shallow and main-only — the old branches are heavy, and `main` carries the
full committed dataset, so you don't need any history:

```bash
git clone --depth 1 --single-branch --branch main git@github.com:hacker-job/hacker-job-trends.git
```

Requires Node 18+.

```bash
# the app (React)
cd frontend && npm install && npm run dev   # http://localhost:5173

# the data pipeline (run from the repo root)
npm install
```

The dev server serves the repo-root `data/` at `/data/*` automatically, so the
app has live data while you work on it.

## Data pipeline

There is no database. The month files under `data/jobs/` *are* the dataset —
each line is one job with the raw HN text and the AI-extracted fields. They're
committed, so the dataset travels with the repo.

**Daily incremental update** — pull new posts from the *current* "Who is hiring?"
thread (people keep posting all month), AI-parse them, and append to the month's
file:

```bash
npm run update     # current thread → parse new posts → append to data/jobs/<month>.json
```

`update` also refreshes the manifest and `trends.json`; just commit `data/`
afterwards. If you change the derivation itself (e.g. the keyword list in
`scripts/store.ts`), run `npm run derive` to regenerate those without new data.

**Full rebuild from scratch** (disaster recovery) — walk every historical
"Who is hiring?" thread and parse anything missing. Idempotent and expensive:

```bash
npm run backfill        # all months (re-parses gaps only)
npm run backfill 2025   # just months starting with "2025"
```

LLM extraction uses the `openai` client; configure the endpoint/model via env
(`LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL` — defaults target a local LM Studio
server).

To refresh the Hackers list (needs a token belonging to the sponsored account):

```bash
GITHUB_TOKEN=ghp_xxx npm run hackers   # → data/hackers.json
```

## Automation

[`.github/workflows/update.yml`](.github/workflows/update.yml) runs `npm run
update` daily (13:00 UTC, or on manual dispatch) and commits the refreshed
`data/` back to the repo. No database to stash — the commit *is* the persistence.

It needs an OpenAI-compatible LLM endpoint, set as repo **secrets**:

| Secret | Example |
|---|---|
| `LLM_BASE_URL` | `https://api.openai.com/v1` |
| `LLM_API_KEY`  | your key |
| `LLM_MODEL`    | `gpt-4o-mini` |

## Deploy

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publishes to GitHub
Pages on every push to `main`: it builds `frontend/`, copies the dataset into
`dist/data/`, adds a `404.html` SPA fallback, and deploys. The daily data commit
triggers a redeploy, so the live site stays current. The custom domain is set via
[`frontend/public/CNAME`](frontend/public/CNAME).

Enable it once under **Settings → Pages → Source: GitHub Actions**.

## License

[MIT](./LICENSE)
