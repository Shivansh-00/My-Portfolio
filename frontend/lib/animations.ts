import type { Variants, Transition } from "framer-motion";

/* ═══════════════════════════════════════════════════════════
   CORE ANIMATION PRESETS
   Powerful, reusable Framer Motion animation configs
   ═══════════════════════════════════════════════════════════ */

// ── Smooth spring config ──
export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 0.8,
};

export const snappySpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const bouncySpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 15,
};

// ── Easing curves ──
export const easings = {
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  power3: [0.22, 1, 0.36, 1] as const,
  power4: [0.16, 1, 0.3, 1] as const,
  elastic: [0.68, -0.55, 0.265, 1.55] as const,
  expo: [0.7, 0, 0.84, 0] as const,
};

// ── Fade Variants ──
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: easings.smooth },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: easings.power3 },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: easings.power3 },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -60, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: easings.power3 },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 60, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: easings.power3 },
  },
};

// ── Scale Variants ──
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: easings.power4 },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

// ── Stagger Container ──
export const staggerContainer = (
  staggerDelay = 0.1,
  delayChildren = 0.2
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

// ── Stagger Items ──
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: easings.power3 },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// ── Glitch / Cyber effect ──
export const glitchReveal: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    skewX: -10,
    filter: "blur(12px) brightness(2)",
  },
  visible: {
    opacity: 1,
    x: 0,
    skewX: 0,
    filter: "blur(0px) brightness(1)",
    transition: { duration: 0.8, ease: easings.power3 },
  },
};

// ── Card hover preset ──
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: easings.power3 },
  },
  hover: {
    scale: 1.03,
    y: -8,
    transition: { duration: 0.3, ease: easings.power4 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// ── Section heading ──
export const headingReveal: Variants = {
  hidden: {
    opacity: 0,
    x: -40,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: easings.power3,
    },
  },
};

// ── Line draw animation ──
export const lineDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeInOut" },
  },
};

// ── Bar fill ──
export const barFill = (width: string, delay = 0): Variants => ({
  hidden: { width: "0%" },
  visible: {
    width,
    transition: {
      duration: 1.2,
      delay,
      ease: easings.power3,
    },
  },
});

// ── Float animation (for decorative elements) ──
export const floatAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// ── Pulse glow ──
export const pulseGlow = {
  boxShadow: [
    "0 0 5px rgba(212,168,83,0.2)",
    "0 0 30px rgba(212,168,83,0.6), 0 0 60px rgba(212,168,83,0.2)",
    "0 0 5px rgba(212,168,83,0.2)",
  ],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// ── Text character-by-character stagger ──
export const textContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

export const textChar: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: easings.power3,
    },
  },
};
