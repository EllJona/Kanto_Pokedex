"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import Image from "next/image";
import type { PokemonSummary } from "@/lib/pokeapi";
import { TYPE_COLORS, typePrimaryHex } from "@/lib/typeColors";
import { prefetchPokemonDetail } from "@/lib/pokemonDetailCache";
import { useCallback, useRef, useState } from "react";

function formatName(name: string) {
  return name.replace(/-/g, " ");
}

type Props = {
  pokemon: PokemonSummary;
  index: number;
  onOpen: (id: number) => void;
  selected: boolean;
};

export function BentoPokemonCard({ pokemon, index, onOpen, selected }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 260, damping: 22 });
  const sry = useSpring(ry, { stiffness: 260, damping: 22 });
  const primary = pokemon.types[0] ?? "normal";
  const hex = typePrimaryHex(primary);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduce) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx.set(py * -11);
      ry.set(px * 12);
      const holoX = ((e.clientX - r.left) / r.width) * 100;
      const holoY = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--holo-x", `${holoX}%`);
      el.style.setProperty("--holo-y", `${holoY}%`);
    },
    [reduce, rx, ry]
  );

  const onLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
    setHovered(false);
    ref.current?.style.setProperty("--holo-x", "50%");
    ref.current?.style.setProperty("--holo-y", "50%");
  }, [rx, ry]);

  const prefetch = useCallback(() => {
    prefetchPokemonDetail(pokemon.id);
  }, [pokemon.id]);

  return (
    <motion.button
      ref={ref}
      type="button"
      initial={
        reduce
          ? { opacity: 0, y: 24 }
          : { opacity: 0, y: 48, filter: "blur(10px)" }
      }
      whileInView={
        reduce
          ? { opacity: 1, y: 0 }
          : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once: true, margin: "-8%" }}
      transition={{
        duration: reduce ? 0.01 : 0.75,
        delay: reduce ? 0 : Math.min(index * 0.028, 0.35),
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        rotateX: reduce ? 0 : srx,
        rotateY: reduce ? 0 : sry,
        transformStyle: "preserve-3d",
        transformPerspective: 900,
        boxShadow: hovered
          ? `0 0 40px ${hex}44, 0 16px 40px rgba(42,90,140,0.2)`
          : "0 8px 28px rgba(42,90,140,0.12)",
      }}
      whileHover={
        reduce
          ? {}
          : { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 22 } }
      }
      whileTap={{ scale: 0.98 }}
      onMouseMove={onMove}
      onPointerEnter={prefetch}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      onClick={() => onOpen(pokemon.id)}
      className={`group relative flex h-full min-h-[248px] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white/75 p-4 text-left shadow-[0_8px_28px_rgba(42,90,140,0.1)] backdrop-blur-xl transition-colors hover:border-slate-300 hover:bg-white/90 sm:min-h-[260px] ${
        selected ? "ring-2 ring-amber-500/45" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition group-hover:opacity-70"
        style={{
          background: `radial-gradient(80% 60% at 50% 0%, ${hex}38, transparent 70%)`,
        }}
      />
      <div
        className="holo-foil pointer-events-none absolute inset-0 rounded-3xl"
        aria-hidden
      />
      <span className="relative z-[1] font-display text-[10px] font-bold tracking-[0.2em] text-slate-500">
        #{String(pokemon.id).padStart(3, "0")}
      </span>
      <div className="relative z-[1] mt-1 flex flex-1 flex-col items-center justify-end">
        <div className="relative mx-auto h-[132px] w-full max-w-[168px] sm:h-[148px]">
          <Image
            src={pokemon.sprite}
            alt={formatName(pokemon.name)}
            fill
            className="object-contain object-bottom drop-shadow-[0_12px_24px_rgba(30,74,110,0.35)]"
            sizes="(max-width: 640px) 40vw, 168px"
            priority={pokemon.id <= 6}
            unoptimized
          />
        </div>
        <h3 className="relative z-[1] mt-2 w-full text-center font-display text-xs font-bold uppercase leading-snug tracking-wide text-slate-800 sm:text-sm">
          {formatName(pokemon.name)}
        </h3>
        <div className="relative z-[1] mt-2 flex flex-wrap justify-center gap-1">
          {pokemon.types.map((t) => (
            <span
              key={t}
              className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/90"
              style={{ backgroundColor: TYPE_COLORS[t] ?? "#64748b" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
