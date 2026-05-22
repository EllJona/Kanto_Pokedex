"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { AudioToggle } from "@/components/AudioToggle";
import { useAudio } from "@/components/providers/AudioProvider";

type Props = {
  onLogoClick: () => void;
};

export function FloatingNav({ onLogoClick }: Props) {
  const { playClick } = useAudio();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const dy = y - lastY.current;
    lastY.current = y;
    if (y < 80) {
      setHidden(false);
      return;
    }
    if (dy > 6) setHidden(true);
    if (dy < -6) setHidden(false);
  });

  return (
    <motion.header
      initial={false}
      animate={{
        y: hidden ? -120 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className="pointer-events-none fixed left-0 right-0 top-0 z-[90] flex justify-center px-4 pt-5"
    >
      <nav className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/20 bg-black/55 px-2 py-2 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => {
            playClick();
            onLogoClick();
          }}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 transition hover:bg-white/10"
        >
          <Sparkles className="h-4 w-4 text-amber-400" aria-hidden />
          <span className="font-display text-[11px] sm:text-xs">Kanto</span>
        </button>
        <span className="h-4 w-px bg-white/20" aria-hidden />
        <Link
          href="/"
          onClick={() => playClick()}
          className="rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-white/70 transition hover:bg-white/10 hover:text-white sm:text-xs"
        >
          Grid
        </Link>
        <Link
          href="/battle"
          onClick={() => playClick()}
          className="rounded-full px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-white/70 transition hover:bg-white/10 hover:text-white sm:text-xs"
        >
          Batalha
        </Link>
        <a
          href="https://pokeapi.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-full px-3 py-2 text-[10px] font-medium text-white/55 transition hover:bg-white/10 hover:text-white/90 sm:text-xs"
        >
          API
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
        <span className="h-4 w-px bg-white/20" aria-hidden />
        <AudioToggle />
      </nav>
    </motion.header>
  );
}
