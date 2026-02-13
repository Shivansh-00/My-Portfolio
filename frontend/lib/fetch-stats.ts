import type { GitHubStats, LeetCodeStats } from "@/types/api";

const GITHUB_USERNAME = "Shivansh-00";
const LEETCODE_USERNAME = "YjPHT2lSCY";

/* ── GitHub Public API ── */
export async function fetchGitHubStats(): Promise<GitHubStats> {
  try {
    const [reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`, {
        headers: { Accept: "application/vnd.github.v3+json" },
      }),
    ]);

    if (!reposRes.ok || !eventsRes.ok) throw new Error("GitHub API error");

    const repos: Array<{
      name: string;
      html_url: string;
      stargazers_count: number;
      fork: boolean;
      language: string | null;
      size: number;
    }> = await reposRes.json();

    const events: Array<{ type: string }> = await eventsRes.json();

    // Top repos by stars (exclude forks)
    const ownRepos = repos.filter((r) => !r.fork);
    const topRepos = [...ownRepos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({ name: r.name, url: r.html_url, stars: r.stargazers_count }));

    // Language distribution
    const langMap: Record<string, number> = {};
    for (const repo of ownRepos) {
      if (repo.language) {
        langMap[repo.language] = (langMap[repo.language] || 0) + repo.size;
      }
    }
    const totalSize = Object.values(langMap).reduce((a, b) => a + b, 0) || 1;
    const languages = Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, size]) => ({
        name,
        percentage: Math.round((size / totalSize) * 100),
      }));

    // Recent commits (PushEvents in last 100 events)
    const recentCommits = events.filter((e) => e.type === "PushEvent").length;

    return { topRepos, languages, recentCommits };
  } catch (err) {
    console.warn("GitHub fetch failed, using fallback:", err);
    return { topRepos: [], languages: [], recentCommits: 0 };
  }
}

/* ── LeetCode Public API ── */
export async function fetchLeetCodeStats(): Promise<LeetCodeStats> {
  // Try multiple free LeetCode stat APIs as fallbacks
  const apis = [
    `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`,
    `https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`,
  ];

  for (const url of apis) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      // leetcode-stats-api format
      if (data.totalSolved !== undefined) {
        return {
          totalSolved: data.totalSolved ?? 0,
          easy: data.easySolved ?? 0,
          medium: data.mediumSolved ?? 0,
          hard: data.hardSolved ?? 0,
        };
      }

      // alfa-leetcode-api format
      if (data.solvedProblem !== undefined) {
        return {
          totalSolved: data.solvedProblem ?? 0,
          easy: data.easySolved ?? 0,
          medium: data.mediumSolved ?? 0,
          hard: data.hardSolved ?? 0,
        };
      }
    } catch {
      continue;
    }
  }

  // Final fallback: try LeetCode GraphQL directly via proxy
  try {
    const query = {
      query: `query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
      }`,
      variables: { username: LEETCODE_USERNAME },
    };

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });

    if (res.ok) {
      const json = await res.json();
      const stats = json.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
      if (stats) {
        const findCount = (diff: string) =>
          stats.find((s: { difficulty: string; count: number }) => s.difficulty === diff)?.count ?? 0;
        return {
          totalSolved: findCount("All"),
          easy: findCount("Easy"),
          medium: findCount("Medium"),
          hard: findCount("Hard"),
        };
      }
    }
  } catch {
    // ignore
  }

  console.warn("All LeetCode APIs failed, using fallback");
  return { totalSolved: 0, easy: 0, medium: 0, hard: 0 };
}
