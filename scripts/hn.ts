/**
 * Hacker News / Algolia access — the network half of the pipeline (no AI here).
 * Finds "Who is hiring?" threads and pulls their top-level posts as raw records.
 */
import { cleanText } from "./store.js";
import type { RawPost } from "./types.js";

const ALGOLIA_SEARCH = "https://hn.algolia.com/api/v1/search";
const ALGOLIA_SEARCH_BY_DATE = "https://hn.algolia.com/api/v1/search_by_date";
const ALGOLIA_ITEMS = "https://hn.algolia.com/api/v1/items";

export interface HiringStory { objectID: string; title: string; created_at: string }
interface AlgoliaComment { id: number; parent_id: number; author: string | null; text: string | null; created_at_i: number }
interface AlgoliaItem { id: number; children: AlgoliaComment[] }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The most recent "Who is hiring?" thread by the whoishiring account. */
export async function latestHiringStory(): Promise<HiringStory> {
  const res = await fetch(`${ALGOLIA_SEARCH_BY_DATE}?tags=story,author_whoishiring&hitsPerPage=20`);
  const data = (await res.json()) as { hits: HiringStory[] };
  const story = data.hits.find((h) => /Who is hiring\?/i.test(h.title));
  if (!story) throw new Error("No recent 'Who is hiring?' thread found.");
  return story;
}

/** Every "Who is hiring?" thread, oldest cursor first (used by backfill). */
export async function allHiringThreads(): Promise<HiringStory[]> {
  const hits: HiringStory[] = [];
  let page = 0;
  while (true) {
    const url = `${ALGOLIA_SEARCH}?tags=story,author_whoishiring&hitsPerPage=1000&page=${page}`;
    const data = (await fetch(url).then((r) => r.json())) as { hits: HiringStory[]; nbPages: number };
    hits.push(...data.hits);
    if (page >= data.nbPages - 1) break;
    page++;
    await sleep(150);
  }
  return hits.filter((h) => /Who is hiring\?/i.test(h.title));
}

/** Top-level posts of a thread as cleaned raw records (text stripped + secrets redacted). */
export async function fetchThreadPosts(storyId: string): Promise<RawPost[]> {
  const item = (await fetch(`${ALGOLIA_ITEMS}/${storyId}`).then((r) => r.json())) as AlgoliaItem;
  return item.children
    .filter((c) => c.parent_id === item.id && c.text)
    .map((c) => ({
      id: c.id,
      author: c.author || null,
      ts: c.created_at_i,
      text: cleanText(c.text),
    }));
}
