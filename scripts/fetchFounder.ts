/**
 * Build data/founder.json — @timqian's public GitHub profile (basic links) plus
 * the timqian/timqian profile README. Rarely changes; run manually:
 *
 *   npm run founder        (optionally with GITHUB_TOKEN to avoid rate limits)
 */
import fs from "fs";
import path from "path";

const USER = "timqian";
const headers: Record<string, string> = {
  "User-Agent": "hacker-job-trends",
  Accept: "application/vnd.github+json",
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function main() {
  const u = await fetch(`https://api.github.com/users/${USER}`, { headers }).then((r) => {
    if (!r.ok) throw new Error(`profile ${r.status}`);
    return r.json();
  });

  const readme = await fetch(`https://api.github.com/repos/${USER}/${USER}/readme`, {
    headers: { ...headers, Accept: "application/vnd.github.raw+json" },
  }).then((r) => (r.ok ? r.text() : ""));

  const founder = {
    login: u.login,
    name: u.name,
    avatar: u.avatar_url,
    bio: u.bio,
    blog: u.blog || null,
    twitter: u.twitter_username || null,
    location: u.location || null,
    company: u.company || null,
    followers: u.followers,
    html_url: u.html_url,
    readme,
  };

  const out = path.resolve("data/founder.json");
  fs.writeFileSync(out, JSON.stringify(founder, null, 2) + "\n");
  console.log(`Wrote ${out} — ${founder.name} (@${founder.login}), readme ${readme.length} chars`);
}

main().catch((e) => { console.error(e); process.exit(1); });
