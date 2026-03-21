import type { Variants, Transition } from "framer-motion";

// base transitions
export const springSmooth: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
  mass: 0.6,
};

// core variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

// step transitions — smooth directional
export const stepForward: Variants = {
  initial: { opacity: 0, x: 40, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: springSmooth },
  exit: { opacity: 0, x: -40, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
};

export const stepBackward: Variants = {
  initial: { opacity: 0, x: -40, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1, transition: springSmooth },
  exit: { opacity: 0, x: 40, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
};

// selection animation — scale + glow feel
export const selectionPop: Variants = {
  unselected: { scale: 1, boxShadow: "0 0 0 0 rgba(167, 199, 231, 0)" },
  selected: {
    scale: 1,
    boxShadow: "0 0 20px rgba(167, 199, 231, 0.25), 0 4px 16px rgba(0, 0, 0, 0.08)",
    transition: springBouncy,
  },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

// price number interpolation config
export const priceSpring: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 0.5,
};
