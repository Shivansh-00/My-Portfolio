import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    const username = "Shivansh-00";
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const reposRes = await fetch(
      `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!reposRes.ok) {
      return NextResponse.json({
        topRepos: [],
        languages: [],
        recentCommits: 0,
      });
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
      { headers, next: { revalidate: 3600 } }
    );
    let recentCommits = 0;
    if (eventsRes.ok) {
      const events = (await eventsRes.json()) as { type: string }[];
      recentCommits = events.filter((e) => e.type === "PushEvent").length;
    }

    return NextResponse.json({ topRepos, languages, recentCommits });
  } catch {
    return NextResponse.json({
      topRepos: [],
      languages: [],
      recentCommits: 0,
    });
  }
}
