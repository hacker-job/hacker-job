/**
 * Full rebuild (no database): walk every "Who is hiring?" thread and ensure each
 * month's JSONL file has all posts parsed. Idempotent — already-stored posts are
 * skipped, so re-running only fills gaps. This is the disaster-recovery path; the
 * committed data/ is the normal dataset.
 *
 *   npm run jobs:backfill            # parses everything missing (expensive!)
 *   npm run jobs:backfill 2025       # only months starting with "2025"
 */
import { allHiringThreads, fetchThreadPosts } from "./hn.js";
import { analyzePosts } from "./analyzeJobs.js";
import { loadMonth, writeMonth, writeManifest, writeTrends } from "./store.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fetch a thread, analyze posts not already stored, and merge into its month file. */
async function processThread(storyId: string, month: string): Promise<{ added: number; failed: number }> {
  const posts = await fetchThreadPosts(storyId);
  const existing = loadMonth(month);
  const known = new Set(existing.map((j) => j.id));
  const fresh = posts.filter((p) => !known.has(p.id));
  if (!fresh.length) return { added: 0, failed: 0 };

  const { jobs, failedIds } = await analyzePosts(fresh);
  if (jobs.length) writeMonth(month, [...existing, ...jobs]);
  return { added: jobs.length, failed: failedIds.size };
}

async function main() {
  const prefix = process.argv[2] || "";
  const threads = (await allHiringThreads())
    .map((h) => ({ id: h.objectID, month: h.created_at.slice(0, 7) }))
    .filter((t) => t.month.startsWith(prefix))
    .sort((a, b) => a.month.localeCompare(b.month));

  console.log(`Processing ${threads.length} thread(s)${prefix ? ` matching "${prefix}"` : ""}...`);

  let totalAdded = 0;
  for (const t of threads) {
    const { added, failed } = await processThread(t.id, t.month);
    if (added || failed) console.log(`  ${t.month}: +${added}${failed ? ` (${failed} failed)` : ""}`);
    totalAdded += added;
    await sleep(150);
  }

  const { count } = writeManifest();
  writeTrends();
  console.log(`Done. Added ${totalAdded} post(s). Store holds ${count.toLocaleString()} jobs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
