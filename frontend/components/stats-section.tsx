"use client";

import { useCallback, useEffect, useState } from "react";
import type { GitHubStats, LeetCodeStats } from "@/types/api";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SmoothCounter, TiltCard } from "./motion-primitives";
import { headingReveal, fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { fetchGitHubStats, fetchLeetCodeStats } from "@/lib/fetch-stats";

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

function hasGitHubData(g: GitHubStats) {
  return g.recentCommits > 0 || g.topRepos.length > 0;
}

function hasLeetCodeData(l: LeetCodeStats) {
  return l.totalSolved > 0;
}

/* ─── Skeleton shimmer block ─── */
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`loading-shimmer rounded bg-gaming-border/30 ${className}`} />
  );
}

/* ─── GitHub skeleton ─── */
function GitHubSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-4 w-36" />
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
      <Skeleton className="h-2 w-full mt-4" />
      <div className="flex gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>
    </div>
  );
}

/* ─── LeetCode skeleton ─── */
function LeetCodeSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <Skeleton className="h-20 w-full" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
      <div className="flex justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Error banner with retry ─── */
function ErrorBanner({ label, onRetry, retrying }: { label: string; onRetry: () => void; retrying: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 py-8 text-center"
    >
      <div className="w-12 h-12 border border-neon-red/40 rounded flex items-center justify-center text-2xl text-neon-red/60">
        ⚠
      </div>
      <p className="font-mono text-xs text-slate-500 uppercase tracking-wider">
        {label} data unavailable
      </p>
      <button
        onClick={onRetry}
        disabled={retrying}
        className="font-gaming text-xs uppercase tracking-widest px-4 py-2 border border-neon-cyan/30 text-neon-cyan
                   hover:bg-neon-cyan/10 hover:border-neon-cyan/60 transition-all duration-300 disabled:opacity-40"
      >
        {retrying ? "Retrying…" : "Retry"}
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   LeetCode Difficulty Row
   ═══════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════
   Main Section
   ═══════════════════════════════════════════════════════ */
export default function StatsSection({
  github: initialGithub,
  leetcode: initialLeetcode,
}: {
  github: GitHubStats;
  leetcode: LeetCodeStats;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });
  const [github, setGithub] = useState<GitHubStats>(initialGithub);
  const [leetcode, setLeetcode] = useState<LeetCodeStats>(initialLeetcode);

  const ghHasData = hasGitHubData(github);
  const lcHasData = hasLeetCodeData(leetcode);

  /* If server didn't deliver data (zeros), retry client-side once */
  const [ghLoading, setGhLoading] = useState(!ghHasData);
  const [lcLoading, setLcLoading] = useState(!lcHasData);
  const [ghError, setGhError] = useState(false);
  const [lcError, setLcError] = useState(false);

  const retryGitHub = useCallback(async () => {
    setGhLoading(true);
    setGhError(false);
    try {
      const data = await fetchGitHubStats();
      if (hasGitHubData(data)) {
        setGithub(data);
      } else {
        setGhError(true);
      }
    } catch {
      setGhError(true);
    } finally {
      setGhLoading(false);
    }
  }, []);

  const retryLeetCode = useCallback(async () => {
    setLcLoading(true);
    setLcError(false);
    try {
      const data = await fetchLeetCodeStats();
      if (hasLeetCodeData(data)) {
        setLeetcode(data);
      } else {
        setLcError(true);
      }
    } catch {
      setLcError(true);
    } finally {
      setLcLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ghHasData) retryGitHub();
    else setGhLoading(false);

    if (!lcHasData) retryLeetCode();
    else setLcLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalProblems = (leetcode.easy + leetcode.medium + leetcode.hard) || 1;

  return (
    <section id="stats" ref={ref} className="gaming-section py-12 sm:py-16 md:py-20 lg:pl-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.h2
          variants={headingReveal} initial="hidden" animate={inView ? "visible" : "hidden"}
          className="section-heading mb-8 sm:mb-12"
        >Web Stats</motion.h2>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* ═══ GitHub Card ═══ */}
          <TiltCard tiltAmount={5}>
            <motion.div
              variants={fadeInUp} initial="hidden" animate={inView ? "visible" : "hidden"}
              className="gaming-card relative neon-pulse-border"
            >
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-br" />

              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <motion.div
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-neon-cyan/30 rounded-sm flex items-center justify-center"
                  whileHover={{ rotate: 180, borderColor: "rgba(212,168,83,0.8)" }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-lg sm:text-xl">⬡</span>
                </motion.div>
                <div>
                  <h3 className="font-gaming text-xs sm:text-sm uppercase tracking-widest neon-text-cyan">GitHub Intel</h3>
                  <p className="font-mono text-[10px] sm:text-xs text-slate-500">BAT_LOG::COMMITS</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {ghLoading ? (
                  <motion.div key="gh-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <GitHubSkeleton />
                  </motion.div>
                ) : ghError && !hasGitHubData(github) ? (
                  <motion.div key="gh-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ErrorBanner label="GitHub" onRetry={retryGitHub} retrying={ghLoading} />
                  </motion.div>
                ) : (
                  <motion.div key="gh-data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <motion.div
                      className="bg-gaming-dark/50 border border-gaming-border p-3 sm:p-4 mb-4 sm:mb-6"
                      whileHover={{ borderColor: "rgba(212,168,83,0.4)", boxShadow: "inset 0 0 20px rgba(212,168,83,0.05)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="font-mono text-[10px] sm:text-xs text-slate-500 mb-1">RECENT_COMMITS:</p>
                      <p className="font-gaming text-2xl sm:text-3xl neon-text-cyan">
                        <SmoothCounter target={github.recentCommits} started={inView} />
                      </p>
                    </motion.div>

                    <motion.div
                      className="space-y-2 sm:space-y-3"
                      variants={staggerContainer(0.08, 0.4)}
                      initial="hidden" animate={inView ? "visible" : "hidden"}
                    >
                      <p className="font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">Top Repositories</p>
                      {github.topRepos.slice(0, 4).map((repo) => (
                        <motion.a
                          key={repo.name}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          variants={staggerItem}
                          whileHover={{ x: 6, borderColor: "rgba(212,168,83,0.5)" }}
                          className="flex items-center justify-between p-2.5 sm:p-3 bg-gaming-dark/30 border border-gaming-border transition-all duration-300 group"
                        >
                          <span className="font-body text-xs sm:text-sm text-slate-300 group-hover:text-neon-cyan transition-colors truncate mr-2">{repo.name}</span>
                          <span className="font-mono text-[10px] sm:text-xs neon-text-yellow flex items-center gap-1 shrink-0">★ {repo.stars}</span>
                        </motion.a>
                      ))}
                    </motion.div>

                    {github.languages.length > 0 && (
                      <div className="mt-4 sm:mt-6 space-y-2">
                        <p className="font-mono text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider">Language Distribution</p>
                        <div className="flex h-2 rounded-full overflow-hidden border border-gaming-border">
                          {github.languages.slice(0, 5).map((lang, i) => {
                            const colors = ["#D4A853", "#8896A8", "#39ff14", "#ff6a00", "#a855f7"];
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
                        <div className="flex flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-xs">
                          {github.languages.slice(0, 5).map((lang, i) => {
                            const colors = ["#D4A853", "#8896A8", "#39ff14", "#ff6a00", "#a855f7"];
                            return (
                              <span key={lang.name} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
                                <span className="text-slate-400">{lang.name} {lang.percentage}%</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TiltCard>

          {/* ═══ LeetCode Card ═══ */}
          <TiltCard tiltAmount={5}>
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="gaming-card gaming-card-magenta relative neon-pulse-border"
            >
              <div className="hud-corner hud-corner-tl" />
              <div className="hud-corner hud-corner-br" />

              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <motion.div
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-neon-magenta/30 rounded-sm flex items-center justify-center"
                  whileHover={{ rotate: 180, borderColor: "rgba(136,150,168,0.8)" }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-lg sm:text-xl">◈</span>
                </motion.div>
                <div>
                  <h3 className="font-gaming text-xs sm:text-sm uppercase tracking-widest neon-text-magenta">LeetCode Ops</h3>
                  <p className="font-mono text-[10px] sm:text-xs text-slate-500">CHALLENGE_LOG::SOLVED</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {lcLoading ? (
                  <motion.div key="lc-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <LeetCodeSkeleton />
                  </motion.div>
                ) : lcError && !hasLeetCodeData(leetcode) ? (
                  <motion.div key="lc-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ErrorBanner label="LeetCode" onRetry={retryLeetCode} retrying={lcLoading} />
                  </motion.div>
                ) : (
                  <motion.div key="lc-data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <motion.div
                      className="bg-gaming-dark/50 border border-gaming-border p-3 sm:p-4 mb-4 sm:mb-6"
                      whileHover={{ borderColor: "rgba(136,150,168,0.4)", boxShadow: "inset 0 0 20px rgba(136,150,168,0.05)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="font-mono text-[10px] sm:text-xs text-slate-500 mb-1">TOTAL_SOLVED:</p>
                      <p className="font-gaming text-2xl sm:text-3xl neon-text-magenta">
                        <SmoothCounter target={leetcode.totalSolved} started={inView} />
                      </p>
                    </motion.div>

                    <div className="space-y-4 sm:space-y-5">
                      <LeetCodeDifficulty label="Easy" value={leetcode.easy} total={totalProblems} color="green" delay={0.5} inView={inView} />
                      <LeetCodeDifficulty label="Medium" value={leetcode.medium} total={totalProblems} color="yellow" delay={0.7} inView={inView} />
                      <LeetCodeDifficulty label="Hard" value={leetcode.hard} total={totalProblems} color="red" delay={0.9} inView={inView} />
                    </div>

                    <div className="mt-6 sm:mt-8 flex justify-center">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32">
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
                          <span className="font-gaming text-lg sm:text-xl neon-text-magenta">
                            <SmoothCounter target={leetcode.totalSolved} started={inView} />
                          </span>
                          <span className="font-mono text-[8px] sm:text-[9px] text-slate-500">SOLVED</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
