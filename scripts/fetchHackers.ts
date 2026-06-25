/**
 * Build data/hackers.json — all GitHub sponsors of @timqian.
 *
 * Usage:  GITHUB_TOKEN=ghp_xxx npm run hackers:fetch
 *
 * The token must belong to @timqian (sponsor identities are only visible to the
 * sponsorable account). Requires the `read:user` scope.
 */
import fs from "fs";
import path from "path";

const SPONSORABLE = "timqian";
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error("Set GITHUB_TOKEN (the token must belong to the sponsored account).");
  process.exit(1);
}

interface Hacker {
  login: string;
  name?: string;
  avatar?: string;
  url?: string;
  bio?: string;
  location?: string;
  blog?: string;
  twitter?: string;
  readme?: string;
}

// The founder is always listed first, alongside the sponsors.
const FOUNDER: Hacker = {
  login: "timqian",
  name: "Tim Qian",
  avatar: "https://avatars.githubusercontent.com/u/5512552?v=4",
  url: "https://github.com/timqian",
  bio: "Build something I want",
  location: "ChongQing, China",
  blog: "t9t.io",
  twitter: "tim_qian",
};

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data as T;
}

interface SponsorNode {
  login: string;
  name: string | null;
  avatarUrl: string;
  url: string;
  bio?: string | null;
  description?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  twitterUsername?: string | null;
}
interface SponsorsPage {
  user: {
    sponsors: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: SponsorNode[];
    };
  };
}

async function listSponsors(): Promise<SponsorNode[]> {
  const out: SponsorNode[] = [];
  let after: string | null = null;
  do {
    const data: SponsorsPage = await gql<SponsorsPage>(
      `query($login:String!, $after:String) {
        user(login:$login) {
          sponsors(first:100, after:$after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              __typename
              ... on User { login name avatarUrl url bio location websiteUrl twitterUsername }
              ... on Organization { login name avatarUrl url description location websiteUrl twitterUsername }
            }
          }
        }
      }`,
      { login: SPONSORABLE, after }
    );
    const page = data.user.sponsors;
    out.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return out;
}

// A sponsor's GitHub profile README (their <login>/<login> repo), or "" if none.
async function fetchReadme(login: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${login}/${login}/readme`, {
    headers: { Authorization: `bearer ${token}`, Accept: "application/vnd.github.raw+json" },
  });
  return res.ok ? res.text() : "";
}

async function main() {
  const sponsors = await listSponsors();
  console.log(`Found ${sponsors.length} sponsor(s) of @${SPONSORABLE}.`);

  const others = await Promise.all(
    sponsors
      .filter((s) => s.login !== FOUNDER.login)
      .map(async (s) => ({
        login: s.login,
        name: s.name || undefined,
        avatar: s.avatarUrl,
        url: s.url,
        bio: (s.bio || s.description) || undefined,
        location: s.location || undefined,
        blog: s.websiteUrl || undefined,
        twitter: s.twitterUsername || undefined,
        readme: (await fetchReadme(s.login)) || undefined,
      }))
  );

  const founder: Hacker = { ...FOUNDER, readme: (await fetchReadme(FOUNDER.login)) || undefined };
  const hackers: Hacker[] = [founder, ...others];

  const out = path.resolve("data/hackers.json");
  fs.writeFileSync(out, JSON.stringify(hackers, null, 2) + "\n");
  console.log(`Wrote ${hackers.length} hacker(s) → ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
