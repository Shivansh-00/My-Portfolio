"use client";

import { useEffect, useState } from "react";
import type { GitHubStats, LeetCodeStats } from "@/types/api";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SmoothCounter, TiltCard } from "./motion-primitives";
import { headingReveal, fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { fetchGitHubStats, fetchLeetCodeStats } from "@/lib/fetch-stats";

function LeetCodeDifficulty({
  label, value, total, color, delay, inView,
}: {
  label: string; value: number; total: number; color: string; delay: number; inView: boolean;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses: Record<string, string> = {
    green: "from-neon-green to-neon-green/50 shadow-neon-green/30",
    yellow: "from-neon-yellow to-neon-orange/50 shadow-neon-yellow/30",
    red: "from-neon-red to-neon-magenta/50 shadow-neon-red/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, filter: "blur(4px)" }}
      animate={inView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-2 group"
    >
      <div className="flex justify-between items-center">
        <span className="font-gaming text-xs uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
          {label}
        </span>
        <span className="font-mono text-sm neon-text-cyan">
          <SmoothCounter target={value} started={inView} />
        </span>
      </div>
      <div className="xp-bar overflow-hidden">
        <motion.div
          className={`xp-bar-fill bg-gradient-to-r ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 1.4, delay: delay + 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ boxShadow: `0 0 10px var(--tw-shadow-color)` }}
        />
      </div>
    </motion.div>
  );
}

export default function StatsSection({ github: initialGithub, leetcode: initialLeetcode }: { github: GitHubStats; leetcode: LeetCodeStats }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });
  const [github, setGithub] = useState<GitHubStats>(initialGithub);
  const [leetcode, setLeetcode] = useState<LeetCodeStats>(initialLeetcode);

  useEffect(() => {
    fetchGitHubStats().then((data) => {
      if (data.recentCommits > 0 || data.topRepos.length > 0) setGithub(data);
    });
    fetchLeetCodeStats().then((data) => {
      if (data.totalSolved > 0) setLeetcode(data);
    });
  }, []);

  const totalProblems = (leetcode.easy + leetcode.medium + leetcode.hard) || 1;

  return (
    <section id="stats" ref={ref} className="gaming-section py-20 lg:pl-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.h2
          variants={headingReveal} initial="hidden" animate={inView ? "visible" : "hidden"}
          className="section-heading mb-12"
        >Web Stats</motion.h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* GitHub Card */}
          <TiltCard tiltAmount={5}>
            <motion.div
              variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}
              className="gaming-card relative neon-pulse-border"
            >
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-br" />

              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-10 h-10 border border-neon-cyan/30 rounded-sm flex items-center justify-center"
                  whileHover={{ rotate: 180, borderColor: "rgba(220,20,60,0.8)" }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-xl">⬡</span>
                </motion.div>
                <div>
                  <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-cyan">GitHub Pulse</h3>
                  <p className="font-mono text-xs text-slate-500">WEB_LOG::COMMITS</p>
                </div>
              </div>

              <motion.div
                className="bg-gaming-dark/50 border border-gaming-border p-4 mb-6"
                whileHover={{ borderColor: "rgba(220,20,60,0.4)", boxShadow: "inset 0 0 20px rgba(220,20,60,0.05)" }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-mono text-xs text-slate-500 mb-1">RECENT_COMMITS:</p>
                <p className="font-gaming text-3xl neon-text-cyan">
                  <SmoothCounter target={github.recentCommits} started={inView} />
                </p>
              </motion.div>

              <motion.div
                className="space-y-3"
                variants={staggerContainer(0.08, 0.4)}
                initial="hidden" animate={inView ? "visible" : "hidden"}
              >
                <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">Top Repositories</p>
                {github.topRepos.slice(0, 4).map((repo) => (
                  <motion.a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={staggerItem}
                    whileHover={{ x: 6, borderColor: "rgba(220,20,60,0.5)" }}
                    className="flex items-center justify-between p-3 bg-gaming-dark/30 border border-gaming-border transition-all duration-300 group"
                  >
                    <span className="font-body text-sm text-slate-300 group-hover:text-neon-cyan transition-colors">{repo.name}</span>
                    <span className="font-mono text-xs neon-text-yellow flex items-center gap-1">★ {repo.stars}</span>
                  </motion.a>
                ))}
              </motion.div>

              {github.languages.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">Language Distribution</p>
                  <div className="flex h-2 rounded-full overflow-hidden border border-gaming-border">
                    {github.languages.slice(0, 5).map((lang, i) => {
                      const colors = ["#DC143C", "#1E90FF", "#39ff14", "#ff6a00", "#a855f7"];
                      return (
                        <motion.div
                          key={lang.name}
                          initial={{ width: 0 }}
                          animate={inView ? { width: `${lang.percentage}%` } : {}}
                          transition={{ duration: 1.2, delay: 0.8 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full"
                          style={{ backgroundColor: colors[i] }}
                          title={`${lang.name}: ${lang.percentage}%`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {github.languages.slice(0, 5).map((lang, i) => {
                      const colors = ["#DC143C", "#1E90FF", "#39ff14", "#ff6a00", "#a855f7"];
                      return (
                        <span key={lang.name} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                          <span className="text-slate-400">{lang.name} {lang.percentage}%</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </TiltCard>

          {/* LeetCode Card */}
          <TiltCard tiltAmount={5}>
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="gaming-card gaming-card-magenta relative neon-pulse-border"
            >
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-br" />

              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  className="w-10 h-10 border border-neon-magenta/30 rounded-sm flex items-center justify-center"
                  whileHover={{ rotate: 180, borderColor: "rgba(30,144,255,0.8)" }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-xl">◈</span>
                </motion.div>
                <div>
                  <h3 className="font-gaming text-sm uppercase tracking-widest neon-text-magenta">LeetCode Arena</h3>
                  <p className="font-mono text-xs text-slate-500">CHALLENGE_LOG::SOLVED</p>
                </div>
              </div>

              <motion.div
                className="bg-gaming-dark/50 border border-gaming-border p-4 mb-6"
                whileHover={{ borderColor: "rgba(30,144,255,0.4)", boxShadow: "inset 0 0 20px rgba(30,144,255,0.05)" }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-mono text-xs text-slate-500 mb-1">TOTAL_SOLVED:</p>
                <p className="font-gaming text-3xl neon-text-magenta">
                  <SmoothCounter target={leetcode.totalSolved} started={inView} />
                </p>
              </motion.div>

              <div className="space-y-5">
                <LeetCodeDifficulty label="Easy" value={leetcode.easy} total={totalProblems} color="green" delay={0.5} inView={inView} />
                <LeetCodeDifficulty label="Medium" value={leetcode.medium} total={totalProblems} color="yellow" delay={0.7} inView={inView} />
                <LeetCodeDifficulty label="Hard" value={leetcode.hard} total={totalProblems} color="red" delay={0.9} inView={inView} />
              </div>

              <div className="mt-8 flex justify-center">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1a1a2e" strokeWidth="2" />
                    <motion.circle cx="18" cy="18" r="15.915" fill="none" stroke="#39ff14" strokeWidth="2"
                      strokeDasharray={`${(leetcode.easy/totalProblems)*100} ${100-(leetcode.easy/totalProblems)*100}`}
                      initial={{ strokeDasharray: "0 100" }}
                      animate={inView ? { strokeDasharray: `${(leetcode.easy/totalProblems)*100} ${100-(leetcode.easy/totalProblems)*100}` } : {}}
                      transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <motion.circle cx="18" cy="18" r="15.915" fill="none" stroke="#ffe600" strokeWidth="2"
                      strokeDasharray={`${(leetcode.medium/totalProblems)*100} ${100-(leetcode.medium/totalProblems)*100}`}
                      strokeDashoffset={`${-((leetcode.easy/totalProblems)*100)}`}
                      initial={{ strokeDasharray: "0 100" }}
                      animate={inView ? { strokeDasharray: `${(leetcode.medium/totalProblems)*100} ${100-(leetcode.medium/totalProblems)*100}` } : {}}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    />
                    <motion.circle cx="18" cy="18" r="15.915" fill="none" stroke="#ff073a" strokeWidth="2"
                      strokeDasharray={`${(leetcode.hard/totalProblems)*100} ${100-(leetcode.hard/totalProblems)*100}`}
                      strokeDashoffset={`${-(((leetcode.easy+leetcode.medium)/totalProblems)*100)}`}
                      initial={{ strokeDasharray: "0 100" }}
                      animate={inView ? { strokeDasharray: `${(leetcode.hard/totalProblems)*100} ${100-(leetcode.hard/totalProblems)*100}` } : {}}
                      transition={{ duration: 1.5, delay: 0.9 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-gaming text-xl neon-text-magenta">
                      <SmoothCounter target={leetcode.totalSolved} started={inView} />
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">SOLVED</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
