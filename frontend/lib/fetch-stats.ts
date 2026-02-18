import type { GitHubStats, LeetCodeStats } from "@/types/api";
import { staticGithub, staticLeetcode } from "@/lib/static-data";

const GITHUB_USERNAME = "Shivansh-00";
const LEETCODE_USERNAME = "YjPHT2lSCY";

/* ═══════════════════════════════════════════════════════════
   Detect environment — client-side fetches go through our
   own /api/ routes (which handle caching + auth tokens).
   Server-side fetches hit external APIs directly.
   ═══════════════════════════════════════════════════════════ */
const isServer = typeof window === "undefined";

/* ═══════════════════════════════════════════════════════════
   In-memory cache — survives across quick re-renders / retries.
   ═══════════════════════════════════════════════════════════ */
interface CacheEntry<T> {
  data: T;
  ts: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 min
let ghCache: CacheEntry<GitHubStats> | null = null;
let lcCache: CacheEntry<LeetCodeStats> | null = null;

function isFresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return !!entry && Date.now() - entry.ts < CACHE_TTL;
}

function hasGH(d: GitHubStats) {
  return d.recentCommits > 0 || d.topRepos.length > 0;
}
function hasLC(d: LeetCodeStats) {
  return d.totalSolved > 0;
}

/* ═══════════════════════════════════════════════════════════
   GitHub
   ═══════════════════════════════════════════════════════════ */

/** Direct call to api.github.com (server-side only, supports GITHUB_TOKEN) */
async function fetchGitHubDirect(): Promise<GitHubStats> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const [reposRes, eventsRes] = await Promise.all([
    fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      { headers, signal: controller.signal, next: { revalidate: 300 } }
    ),
    fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`,
      { headers, signal: controller.signal, next: { revalidate: 300 } }
    ),
  ]);
  clearTimeout(timeout);

  if (!reposRes.ok || !eventsRes.ok) throw new Error(`GitHub API ${reposRes.status}/${eventsRes.status}`);

  const repos: Array<{
    name: string; html_url: string; stargazers_count: number;
    fork: boolean; language: string | null; size: number;
  }> = await reposRes.json();

  const events: Array<{ type: string }> = await eventsRes.json();

  const ownRepos = repos.filter((r) => !r.fork);
  const topRepos = [...ownRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((r) => ({ name: r.name, url: r.html_url, stars: r.stargazers_count }));

  const langMap: Record<string, number> = {};
  for (const repo of ownRepos) {
    if (repo.language) langMap[repo.language] = (langMap[repo.language] || 0) + repo.size;
  }
  const totalSize = Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(langMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, size]) => ({ name, percentage: Math.round((size / totalSize) * 100) }));

  const recentCommits = events.filter((e) => e.type === "PushEvent").length;
  return { topRepos, languages, recentCommits };
}

/** Call our own /api/github/stats route (client-side — avoids CORS + rate limits) */
async function fetchGitHubViaProxy(): Promise<GitHubStats> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const res = await fetch("/api/github/stats", { signal: controller.signal });
  clearTimeout(timeout);
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  return res.json();
}

export async function fetchGitHubStats(): Promise<GitHubStats> {
  if (isFresh(ghCache)) return ghCache.data;

  try {
    const data = isServer ? await fetchGitHubDirect() : await fetchGitHubViaProxy();
    if (hasGH(data)) {
      ghCache = { data, ts: Date.now() };
      return data;
    }
  } catch (err) {
    console.warn("GitHub fetch failed:", err);
  }

  // Return stale cache if available
  if (ghCache?.data && hasGH(ghCache.data)) return ghCache.data;

  return staticGithub;
}

/* ═══════════════════════════════════════════════════════════
   LeetCode
   ═══════════════════════════════════════════════════════════ */

/** Direct calls to external LeetCode APIs (server-side) */
async function fetchLeetCodeDirect(): Promise<LeetCodeStats> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const apis = [
    `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`,
    `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`,
  ];

  for (const url of apis) {
    try {
      const res = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } });
      if (!res.ok) continue;
      const data = await res.json();

      if (data.totalSolved !== undefined) {
        clearTimeout(timeout);
        return { totalSolved: data.totalSolved ?? 0, easy: data.easySolved ?? 0, medium: data.mediumSolved ?? 0, hard: data.hardSolved ?? 0 };
      }
      if (data.solvedProblem !== undefined) {
        clearTimeout(timeout);
        return { totalSolved: data.solvedProblem ?? 0, easy: data.easySolved ?? 0, medium: data.mediumSolved ?? 0, hard: data.hardSolved ?? 0 };
      }
    } catch { continue; }
  }
  clearTimeout(timeout);

  // GraphQL fallback
  try {
    const query = {
      query: `query userProblemsSolved($username: String!) { matchedUser(username: $username) { submitStatsGlobal { acSubmissionNum { difficulty count } } } }`,
      variables: { username: LEETCODE_USERNAME },
    };
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query), next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const stats = json.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
      if (stats) {
        const c = (d: string) => stats.find((s: { difficulty: string; count: number }) => s.difficulty === d)?.count ?? 0;
        return { totalSolved: c("All"), easy: c("Easy"), medium: c("Medium"), hard: c("Hard") };
      }
    }
  } catch { /* ignore */ }

  throw new Error("All LeetCode APIs failed");
}

/** Call our own /api/leetcode/stats route (client-side) */
async function fetchLeetCodeViaProxy(): Promise<LeetCodeStats> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const res = await fetch("/api/leetcode/stats", { signal: controller.signal });
  clearTimeout(timeout);
  if (!res.ok) throw new Error(`Proxy ${res.status}`);
  return res.json();
}

export async function fetchLeetCodeStats(): Promise<LeetCodeStats> {
  if (isFresh(lcCache)) return lcCache.data;

  try {
    const data = isServer ? await fetchLeetCodeDirect() : await fetchLeetCodeViaProxy();
    if (hasLC(data)) {
      lcCache = { data, ts: Date.now() };
      return data;
    }
  } catch (err) {
    console.warn("LeetCode fetch failed:", err);
  }

  // Return stale cache if available
  if (lcCache?.data && hasLC(lcCache.data)) return lcCache.data;

  return staticLeetcode;
}
