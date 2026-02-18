import { NextResponse } from "next/server";
import { staticGithub } from "@/lib/static-data";

const GITHUB_API = "https://api.github.com";

interface GitHubRepo {
  name: string;
  html_url: string;
  stargazers_count: number;
  fork: boolean;
  language: string | null;
  size: number;
  languages_url: string;
}

/* ── Server-side response cache so repeated client requests don't re-hit GitHub ── */
let cachedResponse: { data: Record<string, unknown>; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function GET() {
  // Return cached response if fresh
  if (cachedResponse && Date.now() - cachedResponse.ts < CACHE_TTL) {
    return NextResponse.json(cachedResponse.data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  }

  try {
    const username = "Shivansh-00";
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const reposRes = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`,
      { headers, signal: controller.signal, next: { revalidate: 300 } }
    );

    if (!reposRes.ok) {
      clearTimeout(timeout);
      // If rate-limited, return stale cache if available
      if (cachedResponse) {
        return NextResponse.json(cachedResponse.data, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
        });
      }
      return NextResponse.json(staticGithub);
    }

    const repos = (await reposRes.json()) as GitHubRepo[];
    const ownRepos = repos.filter((r) => !r.fork);

    const topRepos = [...ownRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        url: r.html_url,
        stars: r.stargazers_count,
      }));

    const langMap: Record<string, number> = {};
    for (const repo of ownRepos) {
      if (repo.language) {
        langMap[repo.language] = (langMap[repo.language] || 0) + repo.size;
      }
    }
    const totalSize =
      Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, size]) => ({
        name,
        percentage: Math.round((size / totalSize) * 100),
      }));

    const eventsRes = await fetch(
      `${GITHUB_API}/users/${username}/events?per_page=100`,
      { headers, signal: controller.signal, next: { revalidate: 300 } }
    );
    clearTimeout(timeout);

    let recentCommits = 0;
    if (eventsRes.ok) {
      const events = (await eventsRes.json()) as { type: string }[];
      recentCommits = events.filter((e) => e.type === "PushEvent").length;
    }

    const data = { topRepos, languages, recentCommits };
    cachedResponse = { data, ts: Date.now() };

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    // On any error, return stale cache if available
    if (cachedResponse) {
      return NextResponse.json(cachedResponse.data, {
        headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" },
      });
    }
    return NextResponse.json(staticGithub);
  }
}
