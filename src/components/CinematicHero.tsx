"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { ScrollIndicator } from "@/components/experience/ScrollIndicator";
import { easeEditorial } from "@/lib/motionPresets";

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 60, damping: 32 });
  const smy = useSpring(my, { stiffness: 60, damping: 32 });
  const shiftX = useTransform(smx, [0, 1], [18, -18]);
  const shiftY = useTransform(smy, [0, 1], [10, -10]);
  const bg = useMotionTemplate`radial-gradient(90% 70% at ${smx}% ${smy}%, rgba(255,255,255,0.14) 0%, transparent 58%)`;

  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const titleBlur = useTransform(
    scrollYProgress,
    [0, 0.45],
    reduce ? ["blur(0px)", "blur(0px)"] : ["blur(0px)", "blur(6px)"]
  );

  useEffect(() => {
    if (reduce) return;
    function onMove(e: MouseEvent) {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduce]);

  return (
    <section
      ref={sectionRef}
      className="experience-hero relative flex min-h-[100svh] flex-col justify-end overflow-hidden px-4 pb-28 pt-28 sm:px-8 sm:pb-32"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid-size opacity-[0.14]"
        style={{ opacity: heroOpacity }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: bg, opacity: heroOpacity }}
        aria-hidden
      />
      <motion.div
        className="experience-hero__vignette pointer-events-none absolute inset-0"
        style={{ opacity: heroOpacity }}
        aria-hidden
      />

      <motion.div
        style={{
          opacity: heroOpacity,
          y: heroY,
          scale: heroScale,
        }}
        className="relative mx-auto w-full max-w-7xl"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeEditorial }}
          className="mb-5 font-display text-[10px] font-semibold uppercase tracking-[0.55em] text-[#2a6080] sm:text-xs"
        >
          National Dex · 1996
        </motion.p>
        <div className="overflow-hidden">
          <motion.h1
            style={{ filter: titleBlur }}
            className="font-display text-shadow-pokemon text-[clamp(3.4rem,15vw,10rem)] font-extrabold leading-[0.86] tracking-[-0.04em] text-white"
          >
            <motion.span
              style={{ x: reduce ? 0 : shiftX, y: reduce ? 0 : shiftY }}
              className="inline-block"
              initial={{ opacity: 0, y: "42%" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.05, delay: 0.06, ease: easeEditorial }}
            >
              KANTO
            </motion.span>
          </motion.h1>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.14, ease: easeEditorial }}
          className="text-shadow-pokemon mt-3 font-display text-[clamp(1.55rem,6.5vw,3.75rem)] font-bold uppercase tracking-[0.32em] text-white/92"
        >
          Gen I
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.22, ease: easeEditorial }}
          className="experience-hero__lede mt-10 max-w-xl font-serif text-lg leading-relaxed text-[#1a3348]/88 sm:text-xl"
        >
          Uma Pokédex para percorrer devagar — como uma rota entre relva e céu. Toque
          em qualquer criatura para abrir a ficha com movimento fluido.
        </motion.p>
      </motion.div>

      <ScrollIndicator target={sectionRef} />
    </section>
  );
}
