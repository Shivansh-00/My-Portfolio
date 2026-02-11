"use client";

import dynamic from "next/dynamic";
import GamingNavbar from "@/components/gaming-navbar";
import GamingFooter from "@/components/gaming-footer";
import { AudioProvider } from "@/components/audio-provider";
import AudioControl from "@/components/audio-control";

// Dynamic import to avoid SSR issues with Three.js
const ThreeBackground = dynamic(
  () => import("@/components/three-background"),
  { ssr: false }
);

export default function GamingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AudioProvider>
      <ThreeBackground />
      <GamingNavbar />
      <main className="relative z-10">{children}</main>
      <GamingFooter />
      <AudioControl />
    </AudioProvider>
  );
}
