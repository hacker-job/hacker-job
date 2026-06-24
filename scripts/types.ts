// Shared data types — used by the scripts (store/update/…) and the frontend.

export interface Job {
  id: number;
  author: string | null;
  ts: number; // created_at_i (unix seconds)
  company: string;
  roles: string[];
  location: string | null;
  remote_type: string | null;
  remote_regions: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  tech_stack: string[];
  job_type: string | null;
  visa: number | null;
  text: string;
}

export interface JobsManifest {
  months: string[]; // newest first
  count: number;
  generated: string;
}

export interface TrendPoint { x: string; y: number }

export interface KeywordSeries {
  key: string;
  label: string;
  default: boolean;
  data: TrendPoint[];
}

export interface Trends {
  meta: { months: number; from: string; to: string };
  volume: TrendPoint[]; // job posts per month
  salary: TrendPoint[];
  keywords: KeywordSeries[];
}

export interface Hacker {
  login: string;
  name?: string;
  avatar?: string;
  url?: string;
  bio?: string;
}

export interface Founder {
  login: string;
  name: string | null;
  avatar: string;
  bio: string | null;
  blog: string | null;
  twitter: string | null;
  location: string | null;
  company: string | null;
  followers: number;
  html_url: string;
  readme: string;
}
