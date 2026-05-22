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
          ? `0 0 36px ${hex}55, 0 12px 32px rgba(0,0,0,0.35)`
          : undefined,
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
      className={`pokemon-card-outline group relative flex h-full min-h-[248px] flex-col overflow-hidden p-4 text-left transition-shadow sm:min-h-[260px] ${
        selected ? "pokemon-card-outline--selected" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25 transition group-hover:opacity-45"
        style={{
          background: `radial-gradient(80% 60% at 50% 20%, ${hex}44, transparent 72%)`,
        }}
      />
      <div
        className="holo-foil pointer-events-none absolute inset-0 rounded-3xl"
        aria-hidden
      />
      <span className="relative z-[1] font-display text-[10px] font-bold tracking-[0.2em] text-white/55">
        #{String(pokemon.id).padStart(3, "0")}
      </span>
      <div className="relative z-[1] mt-1 flex flex-1 flex-col items-center justify-end">
        <div className="relative mx-auto h-[132px] w-full max-w-[168px] sm:h-[148px]">
          <Image
            src={pokemon.sprite}
            alt={formatName(pokemon.name)}
            fill
            className="object-contain object-bottom drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]"
            sizes="(max-width: 640px) 40vw, 168px"
            priority={pokemon.id <= 6}
            unoptimized
          />
        </div>
        <h3 className="text-shadow-pokemon relative z-[1] mt-2 w-full text-center font-display text-xs font-bold uppercase leading-snug tracking-wide text-white sm:text-sm">
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
