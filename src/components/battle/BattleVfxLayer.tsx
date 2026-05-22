"use client";

import { motion } from "framer-motion";
import type { VfxVariant } from "@/lib/battle/planRound";

type Props = {
  variant: VfxVariant;
  target: "foe" | "player";
  active: boolean;
};

/** VFX leve: só transform + opacity (GPU). */
export function BattleVfxLayer({ variant, target, active }: Props) {
  if (!active) return null;

  const anchor =
    target === "foe"
      ? "right-[18%] top-[28%] h-[42%] w-[48%]"
      : "left-[8%] bottom-[12%] h-[48%] w-[55%]";

  return (
    <div
      className={`pointer-events-none absolute z-[25] ${anchor}`}
      aria-hidden
    >
      {variant === "electric" ? <ElectricSparks /> : null}
      {variant === "grass" ? <GrassLeaves /> : null}
      {variant === "fire" ? <FireBurst /> : null}
      {variant === "poison" ? <PoisonBubbles /> : null}
      {variant === "neutral" ? <NeutralBurst /> : null}
    </div>
  );
}

function ElectricSparks() {
  return (
    <div className="relative h-full w-full">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute block h-0.5 w-8 rounded-full bg-[#fff8a0]"
          style={{
            left: `${10 + (i * 9) % 80}%`,
            top: `${15 + (i * 17) % 70}%`,
            rotate: -35 + (i % 4) * 18,
            boxShadow: "0 0 6px #f8d030",
          }}
          initial={{ opacity: 0, scaleX: 0.2, x: -20 }}
          animate={{ opacity: [0, 1, 1, 0], scaleX: [0.2, 1.4, 1, 0.3], x: [-20, 40, 80, 120] }}
          transition={{ duration: 0.45, delay: i * 0.03, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function GrassLeaves() {
  return (
    <div className="relative h-full w-full">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-3 rounded-sm bg-[#58a848]"
          style={{
            left: `${(i * 13) % 85}%`,
            top: `${(i * 19) % 75}%`,
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          }}
          initial={{ opacity: 0, rotate: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.95, 0],
            rotate: [0, 180 + i * 40],
            scale: [0, 1.1, 0.4],
            y: [0, -30 - (i % 5) * 8],
          }}
          transition={{ duration: 0.55, delay: i * 0.025 }}
        />
      ))}
    </div>
  );
}

function FireBurst() {
  return (
    <div className="relative h-full w-full">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gradient-to-t from-[#c04010] to-[#f8a028]"
          style={{
            width: 6 + (i % 4) * 4,
            height: 6 + (i % 4) * 4,
            left: `${40 + Math.cos(i) * 28}%`,
            top: `${35 + Math.sin(i * 0.7) * 25}%`,
          }}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{
            opacity: [0, 0.9, 0],
            scale: [0.2, 1.4, 0.3],
            y: [0, -50 - (i % 6) * 5],
          }}
          transition={{ duration: 0.5, delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}

function PoisonBubbles() {
  return (
    <div className="relative h-full w-full">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full border-2 border-[#a060c8] bg-[#7038a0]/50"
          style={{
            width: 10 + (i % 3) * 6,
            height: 10 + (i % 3) * 6,
            left: `${(i * 11) % 78}%`,
            bottom: `${(i * 7) % 40}%`,
          }}
          initial={{ opacity: 0, scale: 0.3, y: 20 }}
          animate={{
            opacity: [0, 0.85, 0],
            scale: [0.3, 1, 1.2, 0],
            y: [20, -10 - i * 6, -40 - i * 8],
          }}
          transition={{ duration: 0.55, delay: i * 0.04 }}
        />
      ))}
    </div>
  );
}

function NeutralBurst() {
  return (
    <div className="relative h-full w-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-10 rounded-full bg-white/80"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 18}%`,
            rotate: i * 22,
          }}
          initial={{ opacity: 0, scaleX: 0.2 }}
          animate={{ opacity: [0, 0.7, 0], scaleX: [0.2, 1.2, 0.4] }}
          transition={{ duration: 0.35, delay: i * 0.04 }}
        />
      ))}
    </div>
  );
}
