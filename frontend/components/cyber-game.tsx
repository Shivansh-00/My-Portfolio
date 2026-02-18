"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useAudio } from "@/components/audio-provider";

interface Target {
  id: number; x: number; y: number; size: number; speed: number;
  color: string; points: number; type: "normal" | "fast" | "bonus" | "danger";
  spawnTime: number; lifetime: number;
}

interface Particle {
  id: number; x: number; y: number; vx: number; vy: number; color: string; life: number;
}

interface FloatingScore {
  id: number; x: number; y: number; value: number; color: string;
}

type GameState = "idle" | "playing" | "paused" | "gameover";

const TARGET_COLORS: Record<Target["type"], string> = {
  normal: "#D4A853", fast: "#8896A8", bonus: "#39ff14", danger: "#ff073a",
};

const LEVEL_CONFIG = [
  { name: "BYTE", maxTargets: 3, spawnRate: 1800, speedMul: 1, lifetime: 3000 },
  { name: "KILOBYTE", maxTargets: 4, spawnRate: 1500, speedMul: 1.2, lifetime: 2500 },
  { name: "MEGABYTE", maxTargets: 5, spawnRate: 1200, speedMul: 1.5, lifetime: 2000 },
  { name: "GIGABYTE", maxTargets: 6, spawnRate: 1000, speedMul: 1.8, lifetime: 1800 },
  { name: "TERABYTE", maxTargets: 7, spawnRate: 800, speedMul: 2.2, lifetime: 1500 },
  { name: "PETABYTE", maxTargets: 8, spawnRate: 650, speedMul: 2.6, lifetime: 1200 },
];

export default function CyberGame() {
  const { playSfx } = useAudio();
  const shakeControls = useAnimation();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const floatIdRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cyber-game-highscore");
      if (saved) setHighScore(parseInt(saved, 10));
    } catch {}
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try { localStorage.setItem("cyber-game-highscore", String(score)); } catch {}
    }
  }, [score, highScore]);

  useEffect(() => {
    const newLevel = Math.min(Math.floor(score / 500), LEVEL_CONFIG.length - 1);
    if (newLevel > level && gameState === "playing") {
      setLevel(newLevel);
      setShowLevelUp(true);
      playSfx("levelUp");
      setTimeout(() => setShowLevelUp(false), 2000);
    }
  }, [score, level, gameState, playSfx]);

  const screenShake = useCallback(() => {
    shakeControls.start({
      x: [0, -3, 3, -2, 2, 0],
      y: [0, 2, -2, 1, -1, 0],
      transition: { duration: 0.3 },
    });
  }, [shakeControls]);

  const spawnTarget = useCallback(() => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const config = LEVEL_CONFIG[level];

    setTargets((prev) => {
      if (prev.length >= config.maxTargets) return prev;
      const rand = Math.random();
      let type: Target["type"] = "normal";
      if (rand > 0.92) type = "danger";
      else if (rand > 0.82) type = "bonus";
      else if (rand > 0.6) type = "fast";

      const size = type === "bonus" ? 55 : type === "fast" ? 35 : type === "danger" ? 45 : 44;
      const padding = size + 10;

      return [...prev, {
        id: targetIdRef.current++,
        x: padding + Math.random() * (rect.width - padding * 2),
        y: padding + Math.random() * (rect.height - padding * 2),
        size, speed: (type === "fast" ? 2 : 1) * config.speedMul,
        color: TARGET_COLORS[type],
        points: type === "bonus" ? 200 : type === "fast" ? 150 : type === "danger" ? -100 : 100,
        type, spawnTime: Date.now(),
        lifetime: type === "fast" ? config.lifetime * 0.6 : config.lifetime,
      }];
    });
  }, [level]);

  useEffect(() => {
    if (gameState !== "playing") return;
    cleanupTimerRef.current = setInterval(() => {
      const now = Date.now();
      setTargets((prev) => {
        const expired = prev.filter((t) => now - t.spawnTime > t.lifetime);
        if (expired.length > 0) {
          expired.forEach((t) => {
            if (t.type !== "danger") { setCombo(0); setMisses((m) => m + 1); }
          });
        }
        return prev.filter((t) => now - t.spawnTime <= t.lifetime);
      });
    }, 100);
    return () => { if (cleanupTimerRef.current) clearInterval(cleanupTimerRef.current); };
  }, [gameState]);

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    const newP: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 5;
      newP.push({
        id: particleIdRef.current++, x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        color, life: 1,
      });
    }
    setParticles((prev) => [...prev, ...newP]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => !newP.find((np) => np.id === p.id))), 600);
  }, []);

  const addFloatingScore = useCallback((x: number, y: number, value: number, color: string) => {
    const id = floatIdRef.current++;
    setFloatingScores((prev) => [...prev, { id, x, y, value, color }]);
    setTimeout(() => setFloatingScores((prev) => prev.filter((s) => s.id !== id)), 1000);
  }, []);

  const handleTargetClick = useCallback((target: Target, e: React.MouseEvent) => {
    e.stopPropagation();

    if (target.type === "danger") {
      playSfx("gameMiss");
      screenShake();
      setLives((l) => l - 1);
      setCombo(0);
      setScore((s) => Math.max(0, s + target.points));
      spawnParticles(target.x, target.y, target.color, 14);
      addFloatingScore(target.x, target.y, target.points, target.color);
    } else {
      playSfx("gameHit");
      const comboBonus = Math.floor(combo * 15);
      const totalPoints = target.points + comboBonus;
      setScore((s) => s + totalPoints);
      setCombo((c) => {
        const newCombo = c + 1;
        setMaxCombo((mc) => Math.max(mc, newCombo));
        if (newCombo > 0 && newCombo % 5 === 0) playSfx("combo");
        return newCombo;
      });
      setHits((h) => h + 1);
      spawnParticles(target.x, target.y, target.color, 10);
      addFloatingScore(target.x, target.y, totalPoints, target.color);
    }
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
  }, [combo, playSfx, spawnParticles, addFloatingScore, screenShake]);

  const handleAreaMiss = useCallback(() => {
    if (gameState !== "playing") return;
    playSfx("gameMiss");
    setCombo(0);
    setMisses((m) => m + 1);
  }, [gameState, playSfx]);

  const startGame = useCallback(() => {
    setGameState("playing");
    setScore(0); setCombo(0); setMaxCombo(0); setLives(3);
    setLevel(0); setTargets([]); setParticles([]); setFloatingScores([]);
    setHits(0); setMisses(0); setTimeLeft(60);
    targetIdRef.current = 0;
    playSfx("powerUp");
  }, [playSfx]);

  useEffect(() => {
    if (gameState !== "playing") return;
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setGameState("gameover"); playSfx("gameOver"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (gameTimerRef.current) clearInterval(gameTimerRef.current); };
  }, [gameState, playSfx]);

  useEffect(() => {
    if (gameState !== "playing") return;
    const config = LEVEL_CONFIG[level];
    spawnTimerRef.current = setInterval(spawnTarget, config.spawnRate);
    spawnTarget();
    return () => { if (spawnTimerRef.current) clearInterval(spawnTimerRef.current); };
  }, [gameState, level, spawnTarget]);

  useEffect(() => {
    if (lives <= 0 && gameState === "playing") {
      setGameState("gameover"); playSfx("gameOver");
    }
  }, [lives, gameState, playSfx]);

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
  const config = LEVEL_CONFIG[level];

  return (
    <section id="game" className="gaming-section py-12 md:py-20 lg:pl-20 relative">
      <div className="grid-overlay" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-heading mb-3"
          >WEB DEFENSE</motion.h2>
          <p className="font-mono text-sm text-slate-500">
            {">"}  Eliminate threats // Avoid red targets // Build combos for bonus points
          </p>
        </div>

        <motion.div animate={shakeControls} className="gaming-card !p-0 overflow-hidden holo-shimmer">
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />
          <div className="hud-corner hud-corner-bl" />
          <div className="hud-corner hud-corner-br" />

          {/* HUD */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gaming-border bg-gaming-dark/60">
            <div className="flex items-center gap-6">
              <div className="font-gaming text-xs tracking-widest">
                <span className="text-slate-500">SCORE </span>
                <span className="neon-text-cyan">{score.toLocaleString()}</span>
              </div>
              <div className="font-gaming text-xs tracking-widest">
                <span className="text-slate-500">COMBO </span>
                <motion.span
                  key={combo}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className={combo > 5 ? "neon-text-magenta" : combo > 2 ? "neon-text-green" : "text-slate-300"}
                >x{combo}</motion.span>
              </div>
              <div className="font-gaming text-xs tracking-widest hidden sm:block">
                <span className="text-slate-500">LVL </span>
                <span className="text-neon-orange">{config.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="font-gaming text-xs tracking-widest">
                <span className="text-slate-500">TIME </span>
                <span className={timeLeft <= 10 ? "text-neon-red animate-flicker" : "text-slate-300"}>{timeLeft}s</span>
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div key={i}
                    animate={i >= lives ? { scale: [1, 0.5], opacity: [1, 0.3] } : {}}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i < lives ? "bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.6)]" : "bg-slate-700"
                    }`} />
                ))}
              </div>
            </div>
          </div>

          {/* Game Area */}
          <div ref={gameAreaRef} onClick={handleAreaMiss}
            className="relative w-full h-[400px] sm:h-[450px] bg-gaming-dark/40 overflow-hidden select-none"
            style={{ cursor: gameState === "playing" ? "crosshair" : "default" }}>
            <div className="absolute inset-0 opacity-20"><div className="grid-overlay" /></div>

            {gameState === "idle" && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
                <motion.div animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border border-neon-cyan/30 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 border border-neon-cyan/50 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-neon-cyan rounded-full animate-glow-pulse" />
                  </div>
                </motion.div>
                <div className="text-center">
                  <h3 className="font-gaming text-xl uppercase tracking-widest neon-text-cyan mb-2">Web Defense v4.0</h3>
                  <p className="font-mono text-xs text-slate-500 max-w-xs">
                    Click targets for points. Build combos for {">"}1.5x multiplier.
                    <br /><span className="text-neon-red">Avoid RED targets</span> — they cost lives!
                  </p>
                  {highScore > 0 && (
                    <p className="font-gaming text-xs text-neon-orange mt-3 tracking-wider">
                      HIGH SCORE: {highScore.toLocaleString()}
                    </p>
                  )}
                </div>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); startGame(); }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212,168,83,0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  className="gaming-btn liquid-btn !px-12 !py-4"
                >▶ INITIALIZE</motion.button>
              </motion.div>
            )}

            <AnimatePresence>
              {targets.map((target) => {
                const elapsed = Date.now() - target.spawnTime;
                const lifeRatio = Math.max(0, 1 - elapsed / target.lifetime);
                return (
                  <motion.button key={target.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    onClick={(e) => handleTargetClick(target, e)}
                    className="absolute rounded-full flex items-center justify-center"
                    style={{
                      left: target.x - target.size / 2, top: target.y - target.size / 2,
                      width: target.size, height: target.size,
                      border: `2px solid ${target.color}`,
                      boxShadow: `0 0 ${15 * lifeRatio}px ${target.color}40, inset 0 0 ${10 * lifeRatio}px ${target.color}20`,
                      background: `radial-gradient(circle, ${target.color}15 0%, transparent 70%)`,
                    }}>
                    <div className="rounded-full" style={{
                      width: target.size * 0.4, height: target.size * 0.4,
                      border: `1px solid ${target.color}80`, background: `${target.color}30`,
                    }} />
                    {target.type === "danger" && <span className="absolute font-gaming text-[10px] text-neon-red" style={{ top: -14 }}>⚠</span>}
                    {target.type === "bonus" && <span className="absolute font-gaming text-[10px] text-neon-green" style={{ top: -14 }}>★</span>}
                    <svg className="absolute inset-0" viewBox={`0 0 ${target.size} ${target.size}`}>
                      <circle cx={target.size/2} cy={target.size/2} r={target.size/2-2} fill="none"
                        stroke={target.color} strokeWidth="1"
                        strokeDasharray={`${2*Math.PI*(target.size/2-2)}`}
                        strokeDashoffset={`${2*Math.PI*(target.size/2-2)*(1-lifeRatio)}`}
                        opacity={0.5} style={{ transition: "stroke-dashoffset 0.1s linear" }} />
                    </svg>
                  </motion.button>
                );
              })}
            </AnimatePresence>

            {/* Floating Scores */}
            <AnimatePresence>
              {floatingScores.map((fs) => (
                <motion.div key={fs.id}
                  initial={{ opacity: 1, y: fs.y, x: fs.x }}
                  animate={{ opacity: 0, y: fs.y - 60, scale: 1.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute pointer-events-none font-gaming text-sm tracking-wider z-20"
                  style={{ color: fs.color, textShadow: `0 0 10px ${fs.color}` }}
                >{fs.value > 0 ? `+${fs.value}` : fs.value}</motion.div>
              ))}
            </AnimatePresence>

            {particles.map((p) => (
              <motion.div key={p.id}
                initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
                animate={{ x: p.x + p.vx * 30, y: p.y + p.vy * 30, scale: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
            ))}

            <AnimatePresence>
              {showLevelUp && (
                <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className="text-center">
                    <div className="font-gaming text-3xl neon-text-green tracking-widest">LEVEL UP!</div>
                    <div className="font-gaming text-lg text-neon-orange tracking-wider mt-2">{config.name}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {gameState === "gameover" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center z-20 bg-gaming-dark/80 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center">
                    <h3 className="font-gaming text-3xl uppercase tracking-widest text-neon-red mb-6 chromatic-text">
                      WEB OVERLOAD</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 text-left">
                      <div><span className="font-mono text-xs text-slate-500">FINAL SCORE</span>
                        <p className="font-gaming text-lg neon-text-cyan">{score.toLocaleString()}</p></div>
                      <div><span className="font-mono text-xs text-slate-500">MAX COMBO</span>
                        <p className="font-gaming text-lg neon-text-magenta">x{maxCombo}</p></div>
                      <div><span className="font-mono text-xs text-slate-500">ACCURACY</span>
                        <p className="font-gaming text-lg neon-text-green">{accuracy}%</p></div>
                      <div><span className="font-mono text-xs text-slate-500">LEVEL</span>
                        <p className="font-gaming text-lg text-neon-orange">{config.name}</p></div>
                    </div>
                    {score >= highScore && score > 0 && (
                      <motion.p animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="font-gaming text-sm text-neon-yellow tracking-widest mb-4">
                        ★ NEW HIGH SCORE ★</motion.p>
                    )}
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); startGame(); }}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="gaming-btn liquid-btn !px-10"
                    >↺ REBOOT</motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-gaming-border bg-gaming-dark/60">
            <div className="font-mono text-[10px] text-slate-600">TARGETS: {hits} HIT / {misses} MISS</div>
            <div className="font-mono text-[10px] text-slate-600">ACC: {accuracy}% | HI: {highScore.toLocaleString()}</div>
          </div>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {[
            { color: "#D4A853", label: "STANDARD", pts: "+100" },
            { color: "#8896A8", label: "FAST", pts: "+150" },
            { color: "#39ff14", label: "BONUS", pts: "+200" },
            { color: "#ff073a", label: "DANGER", pts: "-1 LIFE" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full"
                style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }} />
              <span className="font-mono text-[10px] text-slate-500">
                {item.label} <span style={{ color: item.color }}>{item.pts}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
