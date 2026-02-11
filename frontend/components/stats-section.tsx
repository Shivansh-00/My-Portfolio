"use client";

import type { GitHubStats, LeetCodeStats } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

function AnimatedCounter({
  target,
  duration = 2000,
  started,
}: {
  target: number;
  duration?: number;
  started: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <>{count}</>;
}

function LeetCodeDifficulty({
  label,
  value,
  total,
  color,
  delay,
  inView,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  delay: number;
  inView: boolean;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses: Record<string, string> = {
    green: "from-neon-green to-neon-green/50 shadow-neon-green/30",
    yellow: "from-neon-yellow to-neon-orange/50 shadow-neon-yellow/30",
    red: "from-neon-red to-neon-magenta/50 shadow-neon-red/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="space-y-2"
    >
      <div className="flex justify-between items-center">
        <span className="font-gaming text-xs uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <span className="font-mono text-sm neon-text-cyan">
          <AnimatedCounter target={value} started={inView} />
        </span>
      </div>
      <div className="xp-bar">
        <motion.div
          className={`xp-bar-fill bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          style={{ boxShadow: `0 0 10px var(--tw-shadow-color)` }}
        />
      </div>
    </motion.div>
  );
}

export default function StatsSection({
  github,
  leetcode,
}: {
  github: GitHubStats;
  leetcode: LeetCodeStats;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const totalProblems = (leetcode.easy + leetcode.medium + leetcode.hard) || 1;

  return (
    <section id="stats" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="section-heading mb-12"
        >
          Player Stats
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* GitHub Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="gaming-card relative"
          >
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-br" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-neon-cyan/30 rounded-sm flex items-center justify-center">
                <span className="text-xl">⬡</span>
              </div>
              <div>
                <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-cyan">
                  GitHub Pulse
                </h3>
                <p className="font-mono text-xs text-slate-500">
                  COMBAT_LOG::COMMITS
                </p>
              </div>
            </div>

            {/* Commits counter */}
            <div className="bg-gaming-dark/50 border border-gaming-border p-4 mb-6">
              <p className="font-mono text-xs text-slate-500 mb-1">
                RECENT_COMMITS:
              </p>
              <p className="font-gaming text-3xl neon-text-cyan">
                <AnimatedCounter
                  target={github.recentCommits}
                  started={inView}
                />
              </p>
            </div>

            {/* Top repos */}
            <div className="space-y-3">
              <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                Top Repositories
              </p>
              {github.topRepos.slice(0, 4).map((repo, i) => (
                <motion.a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gaming-dark/30 border border-gaming-border
                           hover:border-neon-cyan/40 transition-all duration-300 group"
                >
                  <span className="font-body text-sm text-slate-300 group-hover:text-neon-cyan transition-colors">
                    {repo.name}
                  </span>
                  <span className="font-mono text-xs neon-text-yellow flex items-center gap-1">
                    ★ {repo.stars}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Language bars */}
            {github.languages.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                  Language Distribution
                </p>
                <div className="flex h-2 rounded-full overflow-hidden border border-gaming-border">
                  {github.languages.slice(0, 5).map((lang, i) => {
                    const colors = [
                      "#00f0ff",
                      "#ff00e5",
                      "#39ff14",
                      "#ff6a00",
                      "#a855f7",
                    ];
                    return (
                      <motion.div
                        key={lang.name}
                        initial={{ width: 0 }}
                        animate={
                          inView ? { width: `${lang.percentage}%` } : {}
                        }
                        transition={{
                          duration: 1,
                          delay: 0.8 + i * 0.1,
                          ease: "easeOut",
                        }}
                        className="h-full"
                        style={{ backgroundColor: colors[i] }}
                        title={`${lang.name}: ${lang.percentage}%`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  {github.languages.slice(0, 5).map((lang, i) => {
                    const colors = [
                      "#00f0ff",
                      "#ff00e5",
                      "#39ff14",
                      "#ff6a00",
                      "#a855f7",
                    ];
                    return (
                      <span key={lang.name} className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors[i] }}
                        />
                        <span className="text-slate-400">
                          {lang.name} {lang.percentage}%
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* LeetCode Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="gaming-card gaming-card-magenta relative"
          >
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-br" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-neon-magenta/30 rounded-sm flex items-center justify-center">
                <span className="text-xl">◈</span>
              </div>
              <div>
                <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-magenta">
                  LeetCode Arena
                </h3>
                <p className="font-mono text-xs text-slate-500">
                  CHALLENGE_LOG::SOLVED
                </p>
              </div>
            </div>

            {/* Total solved */}
            <div className="bg-gaming-dark/50 border border-gaming-border p-4 mb-6">
              <p className="font-mono text-xs text-slate-500 mb-1">
                TOTAL_SOLVED:
              </p>
              <p className="font-gaming text-3xl neon-text-magenta">
                <AnimatedCounter
                  target={leetcode.totalSolved}
                  started={inView}
                />
              </p>
            </div>

            {/* Difficulty bars */}
            <div className="space-y-5">
              <LeetCodeDifficulty
                label="Easy"
                value={leetcode.easy}
                total={totalProblems}
                color="green"
                delay={0.5}
                inView={inView}
              />
              <LeetCodeDifficulty
                label="Medium"
                value={leetcode.medium}
                total={totalProblems}
                color="yellow"
                delay={0.7}
                inView={inView}
              />
              <LeetCodeDifficulty
                label="Hard"
                value={leetcode.hard}
                total={totalProblems}
                color="red"
                delay={0.9}
                inView={inView}
              />
            </div>

            {/* Pie-like visual */}
            <div className="mt-8 flex justify-center">
              <div className="relative w-32 h-32">
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full -rotate-90"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#1a1a2e"
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#39ff14"
                    strokeWidth="2"
                    strokeDasharray={`${(leetcode.easy / totalProblems) * 100} ${100 - (leetcode.easy / totalProblems) * 100}`}
                    strokeDashoffset="0"
                    initial={{ strokeDasharray: "0 100" }}
                    animate={
                      inView
                        ? {
                            strokeDasharray: `${(leetcode.easy / totalProblems) * 100} ${100 - (leetcode.easy / totalProblems) * 100}`,
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#ffe600"
                    strokeWidth="2"
                    strokeDasharray={`${(leetcode.medium / totalProblems) * 100} ${100 - (leetcode.medium / totalProblems) * 100}`}
                    strokeDashoffset={`${-((leetcode.easy / totalProblems) * 100)}`}
                    initial={{ strokeDasharray: "0 100" }}
                    animate={
                      inView
                        ? {
                            strokeDasharray: `${(leetcode.medium / totalProblems) * 100} ${100 - (leetcode.medium / totalProblems) * 100}`,
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, delay: 0.7 }}
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#ff073a"
                    strokeWidth="2"
                    strokeDasharray={`${(leetcode.hard / totalProblems) * 100} ${100 - (leetcode.hard / totalProblems) * 100}`}
                    strokeDashoffset={`${-(((leetcode.easy + leetcode.medium) / totalProblems) * 100)}`}
                    initial={{ strokeDasharray: "0 100" }}
                    animate={
                      inView
                        ? {
                            strokeDasharray: `${(leetcode.hard / totalProblems) * 100} ${100 - (leetcode.hard / totalProblems) * 100}`,
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, delay: 0.9 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-gaming text-xl neon-text-magenta">
                    <AnimatedCounter
                      target={leetcode.totalSolved}
                      started={inView}
                    />
                  </span>
                  <span className="font-mono text-[9px] text-slate-500">
                    SOLVED
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
