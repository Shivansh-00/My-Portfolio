"use client";

import { useCallback, useRef } from "react";
import { useAudio } from "@/components/audio-provider";
import type { SoundName } from "@/lib/audio-engine";

/**
 * Hook for adding gaming sound effects to UI elements.
 * Returns event handlers you can spread onto any element.
 *
 * Usage:
 *   const sfx = useSfx();
 *   <button {...sfx.hover} onClick={() => { sfx.play("click"); doStuff(); }}>
 */
export function useSfx() {
  const { playSfx } = useAudio();
  const lastHover = useRef(0);

  const play = useCallback(
    (name: SoundName) => playSfx(name),
    [playSfx]
  );

  // Throttled hover sound (max once per 80ms to avoid spam)
  const hover = {
    onMouseEnter: useCallback(() => {
      const now = Date.now();
      if (now - lastHover.current > 80) {
        playSfx("hover");
        lastHover.current = now;
      }
    }, [playSfx]),
  };

  const click = {
    onMouseDown: useCallback(() => {
      playSfx("click");
    }, [playSfx]),
  };

  return { play, hover, click };
}
