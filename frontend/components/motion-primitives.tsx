"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   MAGNETIC CURSOR   — follows cursor with elastic spring 
   ═══════════════════════════════════════════════════════════ */

export function MagneticCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { stiffness: 300, damping: 28, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    const over = () => setHovered(true);
    const out = () => setHovered(false);

    window.addEventListener("mousemove", move);
    document.querySelectorAll("a,button,[data-magnetic]").forEach((el) => {
      el.addEventListener("mouseenter", over);
      el.addEventListener("mouseleave", out);
    });
    return () => {
      window.removeEventListener("mousemove", move);
      document.querySelectorAll("a,button,[data-magnetic]").forEach((el) => {
        el.removeEventListener("mouseenter", over);
        el.removeEventListener("mouseleave", out);
      });
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Outer glow ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen hidden lg:block"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            width: hovered ? 56 : 36,
            height: hovered ? 56 : 36,
            borderColor: hovered
              ? "rgba(136,150,168,0.6)"
              : "rgba(212,168,83,0.4)",
            backgroundColor: hovered
              ? "rgba(136,150,168,0.05)"
              : "rgba(212,168,83,0.02)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="rounded-full border"
        />
      </motion.div>
      {/* Inner dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-neon-cyan pointer-events-none z-[9999] hidden lg:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            boxShadow: hovered
              ? "0 0 20px rgba(136,150,168,0.8)"
              : "0 0 10px rgba(212,168,83,0.6)",
          }}
          className="w-full h-full rounded-full"
        />
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   TILT CARD  — 3D perspective tilt on mouse hover
   ═══════════════════════════════════════════════════════════ */

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glare?: boolean;
}

export function TiltCard({
  children,
  className = "",
  tiltAmount = 10,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouse = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      rotateX.set((y - 0.5) * -tiltAmount);
      rotateY.set((x - 0.5) * tiltAmount);
      glareX.set(x * 100);
      glareY.set(y * 100);
    },
    [rotateX, rotateY, glareX, glareY, tiltAmount]
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }, [rotateX, rotateY, glareX, glareY]);

  const glareOpacity = useTransform(
    [glareX, glareY],
    ([x, y]: number[]) => {
      const dist = Math.sqrt(
        Math.pow((x as number) - 50, 2) + Math.pow((y as number) - 50, 2)
      );
      return Math.min(dist / 100, 0.15);
    }
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative ${className}`}
    >
      {children}
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-inherit z-10"
          style={{
            opacity: glareOpacity,
            background: `radial-gradient(circle at var(--gx) var(--gy),
              rgba(212,168,83,0.25) 0%, transparent 60%)`,
            // @ts-ignore
            "--gx": useTransform(glareX, (v) => `${v}%`),
            "--gy": useTransform(glareY, (v) => `${v}%`),
          }}
        />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING PARTICLES — ambient background particles
   ═══════════════════════════════════════════════════════════ */

export function FloatingParticles({ count = 30 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    color:
      i % 3 === 0
        ? "rgba(212,168,83,0.3)"
        : i % 3 === 1
        ? "rgba(136,150,168,0.2)"
        : "rgba(57,255,20,0.2)",
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -80, -30, -100, 0],
            x: [0, 30, -20, 15, 0],
            opacity: [0, 0.8, 0.4, 0.7, 0],
            scale: [0.5, 1.2, 0.8, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED TEXT   — character-by-character reveal
   ═══════════════════════════════════════════════════════════ */

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function AnimatedText({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.03,
}: AnimatedTextProps) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          variants={{
            hidden: {
              opacity: 0,
              y: 30,
              rotateX: -90,
              filter: "blur(6px)",
            },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
          style={{ display: char === " " ? "inline" : "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVEAL ON SCROLL  — wrapper that triggers on viewport entry
   ═══════════════════════════════════════════════════════════ */

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale";
  duration?: number;
}

const directionMap = {
  up: { y: 50 },
  down: { y: -50 },
  left: { x: -60 },
  right: { x: 60 },
  scale: { scale: 0.85 },
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.7,
}: RevealProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        filter: "blur(6px)",
        ...directionMap[direction],
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SMOOTH COUNTER  — animated number counting up 
   ═══════════════════════════════════════════════════════════ */

export function SmoothCounter({
  target,
  duration = 2000,
  started,
}: {
  target: number;
  duration?: number;
  started: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, target, duration]);

  return <>{count}</>;
}
