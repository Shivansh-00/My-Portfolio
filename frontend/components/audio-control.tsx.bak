"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/components/audio-provider";

export default function AudioControl() {
  const { isPlaying, isMuted, toggleAmbient, toggleMute } = useAudio();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="gaming-card !p-4 mb-2 min-w-[200px]"
          >
            <div className="hud-corner hud-corner-tl" />
            <div className="hud-corner hud-corner-br" />

            <p className="font-gaming text-[10px] uppercase tracking-widest text-slate-500 mb-4">
              Audio Control
            </p>

            {/* Ambient toggle */}
            <button
              onClick={toggleAmbient}
              className="flex items-center justify-between w-full py-2 px-3 mb-2
                         border border-gaming-border hover:border-neon-cyan/40
                         transition-all duration-300 group"
            >
              <span className="font-mono text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                AMBIENT
              </span>
              <span
                className={`font-gaming text-[10px] tracking-widest ${
                  isPlaying ? "neon-text-green" : "text-slate-600"
                }`}
              >
                {isPlaying ? "■ ON" : "▶ OFF"}
              </span>
            </button>

            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className="flex items-center justify-between w-full py-2 px-3
                         border border-gaming-border hover:border-neon-cyan/40
                         transition-all duration-300 group"
            >
              <span className="font-mono text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                MASTER
              </span>
              <span
                className={`font-gaming text-[10px] tracking-widest ${
                  isMuted ? "text-neon-red" : "neon-text-cyan"
                }`}
              >
                {isMuted ? "MUTED" : "ACTIVE"}
              </span>
            </button>

            {/* Visualizer bars */}
            <div className="flex items-end gap-[2px] mt-4 h-4 justify-center">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-[3px] rounded-full ${
                    isPlaying && !isMuted ? "bg-neon-cyan" : "bg-slate-700"
                  }`}
                  animate={
                    isPlaying && !isMuted
                      ? {
                          height: [
                            `${4 + Math.random() * 12}px`,
                            `${4 + Math.random() * 12}px`,
                            `${4 + Math.random() * 12}px`,
                          ],
                        }
                      : { height: "3px" }
                  }
                  transition={
                    isPlaying && !isMuted
                      ? {
                          duration: 0.4 + Math.random() * 0.3,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }
                      : { duration: 0.3 }
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main toggle button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-12 h-12 border rounded-sm flex items-center justify-center
                    transition-all duration-300 backdrop-blur-sm
                    ${
                      isPlaying && !isMuted
                        ? "border-neon-cyan/50 bg-gaming-card/90 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        : "border-gaming-border bg-gaming-card/80"
                    }`}
      >
        {/* Animated rings when playing */}
        {isPlaying && !isMuted && (
          <>
            <motion.div
              className="absolute inset-0 border border-neon-cyan/20 rounded-sm"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 border border-neon-cyan/10 rounded-sm"
              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.3,
              }}
            />
          </>
        )}

        {/* Icon */}
        <span
          className={`text-lg ${
            isPlaying && !isMuted ? "neon-text-cyan" : "text-slate-600"
          }`}
        >
          {isMuted ? "🔇" : isPlaying ? "🔊" : "🔈"}
        </span>
      </motion.button>
    </div>
  );
}
