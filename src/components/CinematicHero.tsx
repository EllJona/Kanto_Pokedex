"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

export function CinematicHero() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 80, damping: 28 });
  const smy = useSpring(my, { stiffness: 80, damping: 28 });
  const shiftX = useTransform(smx, [0, 1], [22, -22]);
  const shiftY = useTransform(smy, [0, 1], [14, -14]);
  const bg = useMotionTemplate`radial-gradient(90% 70% at ${smx}% ${smy}%, rgba(255,255,255,0.18) 0%, transparent 55%)`;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    function onMove(e: MouseEvent) {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <section className="relative min-h-[88vh] overflow-hidden px-4 pb-16 pt-28 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid-size opacity-[0.22]"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: bg }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 font-display text-[10px] font-semibold uppercase tracking-[0.45em] text-[#2a6080] sm:text-xs"
        >
          National Dex · 1996
        </motion.p>
        <div className="overflow-hidden">
          <h1 className="font-display text-shadow-pokemon text-[clamp(3.2rem,14vw,9rem)] font-extrabold leading-[0.88] tracking-[-0.04em] text-white">
            <motion.span
              style={{ x: shiftX, y: shiftY }}
              className="inline-block"
              initial={{ opacity: 0, y: "40%" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              KANTO
            </motion.span>
          </h1>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-shadow-pokemon mt-2 font-display text-[clamp(1.5rem,6vw,3.5rem)] font-bold uppercase tracking-[0.28em] text-white/90"
        >
          Gen I
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-xl text-sm leading-relaxed text-[#1e4a68]/90 sm:text-base"
        >
          Uma Pokédex editorial — vidro, sombra e os 151 originais. Toque em qualquer
          peça para abrir a ficha com animação fluida.
        </motion.p>
      </div>
    </section>
  );
}
