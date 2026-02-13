"use client";

import { useCallback, useRef } from "react";
import { useAudio } from "@/components/audio-provider";
import type { SoundName } from "@/lib/audio-engine";

/**
 * Professional SFX hook with throttled events, haptic feedback,
 * and convenient event handler spreads.
 *
 * Usage:
 *   const sfx = useSfx();
 *   <button {...sfx.hover} onClick={() => { sfx.play("click"); }}>
 *   <NavLink {...sfx.hover} onClick={() => sfx.play("navigate")}>
 */
export function useSfx() {
  const { playSfx } = useAudio();
  const lastHover = useRef(0);
  const lastClick = useRef(0);

  const play = useCallback(
    (name: SoundName) => {
      playSfx(name);
      // Haptic feedback for mobile (very short vibration)
      if ("vibrate" in navigator) {
        try { navigator.vibrate(8); } catch {}
      }
    },
    [playSfx]
  );

  // Throttled hover (max once per 70ms)
  const hover = {
    onMouseEnter: useCallback(() => {
      const now = Date.now();
      if (now - lastHover.current > 70) {
        playSfx("hover");
        lastHover.current = now;
      }
    }, [playSfx]),
  };

  // Throttled click sound (max once per 50ms to prevent double)
  const click = {
    onMouseDown: useCallback(() => {
      const now = Date.now();
      if (now - lastClick.current > 50) {
        playSfx("click");
        lastClick.current = now;
      }
    }, [playSfx]),
  };

  return { play, hover, click };
}
