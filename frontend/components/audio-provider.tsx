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
  const engineRef = useRef(getAudioEngine());

  const toggleAmbient = useCallback(() => {
    const engine = engineRef.current;
    if (engine.isPlaying) {
      engine.stopAmbient();
      setIsPlaying(false);
    } else {
      engine.startAmbient();
      setIsPlaying(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const muted = engineRef.current.toggleMute();
    setIsMuted(muted);
  }, []);

  const playSfx = useCallback((name: SoundName) => {
    engineRef.current.playSfx(name);
  }, []);

  useEffect(() => {
    return () => {
      engineRef.current.dispose();
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
