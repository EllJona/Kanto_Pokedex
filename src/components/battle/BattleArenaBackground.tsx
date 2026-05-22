"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const BATTLE_BG = "/battle/fundo-batalha.jpg";

type Props = {
  children: React.ReactNode;
};

/** Cenário com imagem do utilizador + parallax leve no rato. */
export function BattleArenaBackground({ children }: Props) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [bgOk, setBgOk] = useState(true);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setParallax({ x: px * 14, y: py * 10 });
  };

  const onLeave = () => setParallax({ x: 0, y: 0 });

  return (
    <div
      className="battle-arena-wrap has-battle-bg relative aspect-[5/3] w-full min-h-[340px] max-h-[min(78vh,720px)] sm:min-h-[400px] lg:min-h-[440px]"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-lg">
        {bgOk ? (
          <motion.img
            src={BATTLE_BG}
            alt=""
            draggable={false}
            className="h-full w-full object-cover object-center will-change-transform"
            style={{
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0) scale(1.06)`,
            }}
            onError={() => setBgOk(false)}
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-b from-sky-400/80 via-emerald-600/70 to-emerald-800"
            aria-hidden
          />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-t from-emerald-950/55 via-transparent to-sky-900/20"
          aria-hidden
        />
        <div
          className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.45)]"
          aria-hidden
        />
      </div>
      <div className="absolute inset-0 z-[5] overflow-visible">{children}</div>
    </div>
  );
}
