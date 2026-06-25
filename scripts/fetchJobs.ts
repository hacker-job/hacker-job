/**
 * Fetch new job posts from the *current* "Who is hiring?" thread and queue them
 * for AI analysis. No AI here — this step is cheap and never fails on parsing.
 *
 *   npm run jobs:fetch         # then `npm run jobs:analyze` to process the queue
 *
 * Posts already stored or already queued are skipped, so it's safe to run
 * repeatedly (e.g. daily).
 */
import { latestHiringStory, fetchThreadPosts } from "./hn.js";
import { loadMonth, loadPending, writePending } from "./store.js";

async function main() {
  const story = await latestHiringStory();
  const month = story.created_at.slice(0, 7);
  console.log(`Current thread: ${story.title} (${story.objectID}, ${month})`);

  const posts = await fetchThreadPosts(story.objectID);
  const stored = new Set(loadMonth(month).map((j) => j.id));
  const pending = loadPending();
  const queued = new Set(pending.map((p) => p.id));

  const fresh = posts
    .filter((p) => !stored.has(p.id) && !queued.has(p.id))
    .map((p) => ({ ...p, month }));

  if (fresh.length) {
    writePending([...pending, ...fresh]);
    console.log(`Queued ${fresh.length} new post(s) → ${pending.length + fresh.length} awaiting analysis.`);
  } else {
    console.log("Nothing new to queue.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
