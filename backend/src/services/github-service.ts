const GITHUB_API = "https://api.github.com";
const CACHE_DURATION_MS = 60 * 60 * 1000;

let cachedStats: { value: GitHubStats; expiresAt: number } | null = null;

export interface GitHubStats {
  topRepos: { name: string; url: string; stars: number }[];
  languages: { name: string; percentage: number }[];
  recentCommits: number;
}

function getUsername(profileUrl: string) {
  const match = profileUrl.split("/").filter(Boolean);
  return match[match.length - 1];
}

export async function loadGitHubStats(profileUrl: string): Promise<GitHubStats> {
  if (cachedStats && cachedStats.expiresAt > Date.now()) {
    return cachedStats.value;
  }

  const username = getUsername(profileUrl);
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json"
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const reposResponse = await fetch(
    `${GITHUB_API}/users/${username}/repos?per_page=6&sort=updated`,
    { headers }
  );

  if (!reposResponse.ok) {
    return {
      topRepos: [],
      languages: [],
      recentCommits: 0
    };
  }

  const repos = (await reposResponse.json()) as {
    name: string;
    html_url: string;
    stargazers_count: number;
    languages_url: string;
  }[];

  const topRepos = repos.map((repo) => ({
    name: repo.name,
    url: repo.html_url,
    stars: repo.stargazers_count
  }));

  const languageCounts: Record<string, number> = {};
  let recentCommits = 0;

  for (const repo of repos) {
    const languagesResponse = await fetch(repo.languages_url, { headers });
    if (languagesResponse.ok) {
      const languageData = (await languagesResponse.json()) as Record<string, number>;
      Object.entries(languageData).forEach(([language, count]) => {
        languageCounts[language] = (languageCounts[language] ?? 0) + count;
      });
    }
  }

  const total = Object.values(languageCounts).reduce((sum, value) => sum + value, 0);
  const languages = Object.entries(languageCounts)
    .map(([name, value]) => ({
      name,
      percentage: total ? Math.round((value / total) * 100) : 0
    }))
    .slice(0, 5);

  const stats: GitHubStats = {
    topRepos,
    languages,
    recentCommits
  };

  cachedStats = { value: stats, expiresAt: Date.now() + CACHE_DURATION_MS };
  return stats;
}
