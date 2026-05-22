"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { BattlePokemon } from "@/lib/battle/types";

const TYPE_THEME: Record<
  string,
  { c1: string; c2: string; c3: string; particle: string }
> = {
  fire: {
    c1: "#3a0606",
    c2: "#8a1510",
    c3: "#d84818",
    particle: "rgba(255,180,60,0.45)",
  },
  water: {
    c1: "#061428",
    c2: "#103868",
    c3: "#2878c8",
    particle: "rgba(120,200,255,0.35)",
  },
  grass: {
    c1: "#061808",
    c2: "#184818",
    c3: "#387028",
    particle: "rgba(140,220,120,0.35)",
  },
  electric: {
    c1: "#181004",
    c2: "#484010",
    c3: "#786820",
    particle: "rgba(255,230,80,0.4)",
  },
  poison: {
    c1: "#120618",
    c2: "#381848",
    c3: "#602878",
    particle: "rgba(200,120,255,0.3)",
  },
  ice: {
    c1: "#061018",
    c2: "#204060",
    c3: "#5090b0",
    particle: "rgba(200,240,255,0.35)",
  },
  psychic: {
    c1: "#180818",
    c2: "#482058",
    c3: "#884888",
    particle: "rgba(255,120,200,0.25)",
  },
  normal: {
    c1: "#0a0a10",
    c2: "#282830",
    c3: "#484858",
    particle: "rgba(255,255,255,0.12)",
  },
};

function dominantType(a: BattlePokemon, b: BattlePokemon): string {
  const w = (t: string) => {
    const k = t.toLowerCase();
    if (["fire", "water", "grass", "electric", "poison"].includes(k)) return k;
    return "normal";
  };
  const ta = w(a.types[0] ?? "normal");
  const tb = w(b.types[0] ?? "normal");
  if (ta !== "normal") return ta;
  if (tb !== "normal") return tb;
  return a.types[1] ? w(a.types[1]) : tb;
}

type Props = {
  playerMon: BattlePokemon;
  foeMon: BattlePokemon;
  children: React.ReactNode;
};

export function BattleArenaDynamic({ playerMon, foeMon, children }: Props) {
  const [glow, setGlow] = useState({ x: 50, y: 42 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const key = dominantType(playerMon, foeMon);
  const theme = TYPE_THEME[key] ?? TYPE_THEME.normal;

  const bgStyle = useMemo(
    () =>
      ({
        background: `radial-gradient(120% 85% at ${glow.x}% ${glow.y}%, ${theme.c3}44 0%, ${theme.c2}66 36%, ${theme.c1} 72%, #020204 100%)`,
      }) as React.CSSProperties,
    [glow.x, glow.y, theme]
  );

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    setGlow({
      x: 28 + px * 0.44,
      y: 22 + py * 0.4,
    });
    setParallax({
      x: (px / 100 - 0.5) * 22,
      y: (py / 100 - 0.5) * 16,
    });
  };

  const onLeave = () => {
    setGlow({ x: 50, y: 42 });
    setParallax({ x: 0, y: 0 });
  };

  const particleStyle = useMemo(
    () =>
      ({
        "--p": theme.particle,
        "--c2": theme.c2,
      }) as React.CSSProperties,
    [theme]
  );

  return (
    <div
      className="battle-arena-wrap relative overflow-hidden rounded-lg"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="battle-arena-bg pointer-events-none absolute inset-0 z-0 transition-[background] duration-500"
        style={bgStyle}
      />
      <div
        className="battle-arena-particles pointer-events-none absolute inset-0 z-[1]"
        style={particleStyle}
      />
      <motion.div
        className="pointer-events-none absolute -left-[6%] top-[5%] z-[2] h-[24%] w-[58%] opacity-[0.2] will-change-transform"
        style={{
          transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.25}px, 0)`,
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.55) 0%, transparent 65%)",
        }}
        animate={{ opacity: [0.16, 0.26, 0.16] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="pointer-events-none absolute -right-[8%] bottom-[32%] z-[2] h-[34%] w-[52%] opacity-[0.14] will-change-transform"
        style={{
          transform: `translate3d(${-parallax.x * 0.35}px, ${-parallax.y * 0.2}px, 0)`,
          background:
            "linear-gradient(200deg, transparent 0%, rgba(0,0,0,0.55) 100%)",
          clipPath: "polygon(15% 100%, 100% 35%, 100% 100%)",
        }}
      />
      <div className="relative z-[5]">{children}</div>
      <div
        className="pointer-events-none absolute inset-0 z-[40] rounded-lg shadow-[inset_0_0_100px_rgba(0,0,0,0.72)]"
        aria-hidden
      />
    </div>
  );
}
