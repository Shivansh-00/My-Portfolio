import type { GitHubStats, LeetCodeStats } from "@/types/api";

export default function StatsSection({
  github,
  leetcode
}: {
  github: GitHubStats;
  leetcode: LeetCodeStats;
}) {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="section-card">
        <h2 className="section-title">GitHub Pulse</h2>
        <p className="mt-2 text-sm text-slate-300">
          Recent commits: {github.recentCommits}
        </p>
        <div className="mt-4 space-y-3">
          {github.topRepos.map((repo) => (
            <div key={repo.name} className="flex items-center justify-between">
              <a className="text-brand-500" href={repo.url}>
                {repo.name}
              </a>
              <span className="text-sm text-slate-400">⭐ {repo.stars}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="section-card">
        <h2 className="section-title">LeetCode Overview</h2>
        <p className="mt-2 text-sm text-slate-300">
          Total solved: {leetcode.totalSolved}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
            <p className="text-slate-400">Easy</p>
            <p className="text-lg font-semibold">{leetcode.easy}</p>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
            <p className="text-slate-400">Medium</p>
            <p className="text-lg font-semibold">{leetcode.medium}</p>
          </div>
          <div className="rounded-xl bg-slate-800/60 p-3 text-center">
            <p className="text-slate-400">Hard</p>
            <p className="text-lg font-semibold">{leetcode.hard}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
