"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/components/audio-provider";
import { useSfx } from "@/lib/use-sfx";
import { getAudioEngine } from "@/lib/audio-engine";

function RealTimeVisualizer({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const draw = () => {
      const engine = getAudioEngine();
      const data = engine.getFrequencyData();
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.clearRect(0, 0, w, h);

      if (data) {
        const barCount = 24;
        const step = Math.floor(data.length / barCount);
        const barW = w / barCount - 1;

        for (let i = 0; i < barCount; i++) {
          const val = data[i * step] / 255;
          const barH = val * h * 0.9 + 1;
          const hue = 180 + i * 3;
          ctx2d.fillStyle = `hsla(${hue}, 100%, 60%, ${0.4 + val * 0.6})`;
          ctx2d.fillRect(i * (barW + 1), h - barH, barW, barH);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={28}
      className="w-full rounded-sm opacity-80"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function AudioControl() {
  const { isPlaying, isMuted, toggleAmbient, toggleMute } = useAudio();
  const sfx = useSfx();
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(35);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [expanded]);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    try { getAudioEngine().setMasterVolume(v / 100); } catch {}
  }, []);

  const handleToggle = useCallback(() => {
    sfx.play("toggle");
    setExpanded((v) => !v);
  }, [sfx]);

  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="gaming-card !p-4 mb-2 min-w-[230px]"
          >
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-br" />

            <p className="font-gaming text-[10px] uppercase tracking-widest text-slate-500 mb-4">
              Audio System v4
            </p>

            {/* Ambient toggle */}
            <button
              onClick={() => { sfx.play("toggle"); toggleAmbient(); }}
              className="flex items-center justify-between w-full py-2 px-3 mb-2
                         border border-gaming-border hover:border-neon-cyan/40
                         transition-all duration-300 group"
            >
              <span className="font-mono text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                AMBIENT
              </span>
              <span className={`font-gaming text-[10px] tracking-widest ${
                isPlaying ? "neon-text-green" : "text-slate-600"
              }`}>
                {isPlaying ? "■ ON" : "▶ OFF"}
              </span>
            </button>

            {/* Mute toggle */}
            <button
              onClick={() => { sfx.play("toggle"); toggleMute(); }}
              className="flex items-center justify-between w-full py-2 px-3 mb-3
                         border border-gaming-border hover:border-neon-cyan/40
                         transition-all duration-300 group"
            >
              <span className="font-mono text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                MASTER
              </span>
              <span className={`font-gaming text-[10px] tracking-widest ${
                isMuted ? "text-neon-red" : "neon-text-cyan"
              }`}>
                {isMuted ? "MUTED" : "ACTIVE"}
              </span>
            </button>

            {/* Volume slider */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-slate-600">VOLUME</span>
                <span className="font-mono text-[10px] neon-text-cyan">{volume}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full h-1.5 appearance-none bg-gaming-dark rounded-full cursor-pointer
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                           [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-neon-cyan [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,240,255,0.6)]"
              />
            </div>

            {/* Real-time visualizer */}
            <RealTimeVisualizer active={isPlaying && !isMuted && expanded} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className={`relative w-12 h-12 border rounded-sm flex items-center justify-center
                    transition-all duration-300 backdrop-blur-sm
                    ${isPlaying && !isMuted
                      ? "border-neon-cyan/50 bg-gaming-card/90 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      : "border-gaming-border bg-gaming-card/80"
                    }`}
      >
        {isPlaying && !isMuted && (
          <>
            <motion.div
              className="absolute inset-0 border border-neon-cyan/20 rounded-sm"
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 border border-neon-cyan/10 rounded-sm"
              animate={{ scale: [1, 1.6], opacity: [0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
            />
          </>
        )}
        <span className={`text-lg ${isPlaying && !isMuted ? "neon-text-cyan" : "text-slate-600"}`}>
          {isMuted ? "🔇" : isPlaying ? "🔊" : "🔈"}
        </span>
      </motion.button>
    </div>
  );
}
