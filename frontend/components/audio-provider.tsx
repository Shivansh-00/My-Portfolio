"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getAudioEngine, type SoundName } from "@/lib/audio-engine";

interface AudioContextValue {
  isPlaying: boolean;
  isMuted: boolean;
  toggleAmbient: () => void;
  toggleMute: () => void;
  playSfx: (name: SoundName) => void;
}

const AudioCtx = createContext<AudioContextValue>({
  isPlaying: false,
  isMuted: false,
  toggleAmbient: () => {},
  toggleMute: () => {},
  playSfx: () => {},
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const engineRef = useRef<ReturnType<typeof getAudioEngine> | null>(null);
  const initRef = useRef(false);

  // Lazy-init engine only on client after first user gesture
  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = getAudioEngine();
    }
    return engineRef.current;
  }, []);

  // Initialize audio context on first user interaction (browser autoplay policy)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!initRef.current) {
        initRef.current = true;
        getEngine().init();
      }
    };
    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, { once: true });
    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [getEngine]);

  const toggleAmbient = useCallback(() => {
    const engine = getEngine();
    if (engine.isPlaying) {
      engine.stopAmbient();
      setIsPlaying(false);
    } else {
      engine.init(); // ensure context is alive
      engine.startAmbient();
      setIsPlaying(true);
    }
  }, [getEngine]);

  const toggleMute = useCallback(() => {
    const muted = getEngine().toggleMute();
    setIsMuted(muted);
  }, [getEngine]);

  const playSfx = useCallback((name: SoundName) => {
    getEngine().playSfx(name);
  }, [getEngine]);

  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
    };
  }, []);

  return (
    <AudioCtx.Provider
      value={{ isPlaying, isMuted, toggleAmbient, toggleMute, playSfx }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
