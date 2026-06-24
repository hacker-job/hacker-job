// Data access — fetches the committed dataset served at /data/*.
// Types are shared with the scripts (single source of truth).
import type { Job, Trends, JobsManifest, Hacker } from '../../scripts/types'

export type { Job, Trends, JobsManifest, Hacker }

const base = import.meta.env.BASE_URL // '/' (or the configured subpath)

export function getManifest(): Promise<JobsManifest> {
  return fetch(base + 'data/jobs/index.json').then((r) => r.json())
}

export async function getMonth(month: string): Promise<Job[]> {
  const text = await fetch(base + 'data/jobs/' + month + '.json').then((r) => r.text())
  return text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as Job)
}

export function getTrends(): Promise<Trends> {
  return fetch(base + 'data/trends.json').then((r) => r.json())
}

export function getHackers(): Promise<Hacker[]> {
  return fetch(base + 'data/hackers.json').then((r) => r.json())
}
