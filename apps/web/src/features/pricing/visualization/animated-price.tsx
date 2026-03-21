"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { priceSpring } from "@/lib/motion";

interface AnimatedPriceProps {
  value: number;
  className?: string;
  prefix?: string;
}

export function AnimatedPrice({ value, className = "", prefix = "$" }: AnimatedPriceProps) {
  const motionValue = useMotionValue(0);
  const prevValue = useRef(0);

  const display = useTransform(
    motionValue,
    (current) => `${prefix}${Math.round(current).toLocaleString()}`,
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      ...priceSpring,
      duration: 0.6,
    });
    prevValue.current = value;
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span className={className}>{display}</motion.span>;
}
