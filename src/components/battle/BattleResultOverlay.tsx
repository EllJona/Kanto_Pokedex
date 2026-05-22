"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAudio } from "@/components/providers/AudioProvider";
import type { BattlePokemon } from "@/lib/battle/types";
import { miniFrontSpriteUrls } from "@/lib/battle/spriteUrls";
import "./gba-battle.css";

export type BattleResultVariant = "victory" | "defeat" | "fled";

type Props = {
  variant: BattleResultVariant;
  playerTeam?: BattlePokemon[];
  onConfirm: () => void;
};

const COPY: Record<
  BattleResultVariant,
  { title: string; message: string; button: string }
> = {
  victory: {
    title: "Vitória!",
    message: "Sua equipe venceu a batalha!",
    button: "Continuar",
  },
  defeat: {
    title: "Derrota…",
    message: "A equipe oponente venceu desta vez.",
    button: "Tentar de novo",
  },
  fled: {
    title: "Fugiu!",
    message: "Você escapou da batalha em segurança.",
    button: "Sair",
  },
};

function Sparkle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.span
      className="battle-result-sparkle"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6] }}
      transition={{ duration: 1.8, delay, repeat: Infinity, repeatDelay: 0.4 }}
      aria-hidden
    />
  );
}

function TeamRow({ team }: { team: BattlePokemon[] }) {
  const alive = team.filter((m) => !m.fainted);
  if (!alive.length) return null;
  return (
    <div className="battle-result-team">
      <p className="battle-result-team-label">Seu time</p>
      <div className="battle-result-team-icons">
        {alive.map((mon) => (
          <div
            key={mon.speciesId}
            className="battle-result-team-slot"
            title={mon.displayName}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={miniFrontSpriteUrls(mon.speciesId)[0]}
              alt=""
              className="h-full w-full object-contain [image-rendering:pixelated]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BattleResultOverlay({
  variant,
  playerTeam,
  onConfirm,
}: Props) {
  const { playBattleSfx } = useAudio();
  const isWin = variant === "victory";
  const isFled = variant === "fled";
  const copy = COPY[variant];

  useEffect(() => {
    if (isFled) return;
    playBattleSfx(isWin ? "victory" : "defeat");
  }, [isWin, isFled, playBattleSfx]);

  return (
    <motion.div
      className={`battle-result-scrim battle-result-scrim--${variant}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="battle-result-scrim-glow" aria-hidden />

      {isWin ? (
        <>
          <Sparkle delay={0} x="12%" y="18%" />
          <Sparkle delay={0.35} x="78%" y="22%" />
          <Sparkle delay={0.7} x="85%" y="62%" />
          <Sparkle delay={1.1} x="18%" y="70%" />
          <Sparkle delay={0.55} x="50%" y="12%" />
        </>
      ) : null}

      <motion.div
        className={`gba-root battle-result-panel battle-result-panel--${variant}`}
        initial={{ scale: 0.75, y: 48, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
      >
        <div className="battle-result-panel-inner">
          <motion.div
            className={`battle-result-badge battle-result-badge--${variant}`}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.1 }}
          >
            {isWin ? (
              <motion.span
                className="battle-result-badge-icon battle-result-badge-icon--win"
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              >
                ★
              </motion.span>
            ) : isFled ? (
              <span className="battle-result-badge-icon battle-result-badge-icon--fled">
                ↩
              </span>
            ) : (
              <span className="battle-result-badge-icon battle-result-badge-icon--loss">
                ✕
              </span>
            )}
          </motion.div>

          <motion.p
            className={`battle-result-eyebrow battle-result-eyebrow--${variant}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {isWin ? "Parabéns, treinador!" : isFled ? "Batalha encerrada" : "Não desista!"}
          </motion.p>

          <motion.h2
            className={`battle-result-title battle-result-title--${variant}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            {copy.title}
          </motion.h2>

          <motion.p
            className="battle-result-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
          >
            {copy.message}
          </motion.p>

          {isWin && playerTeam?.length ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
            >
              <TeamRow team={playerTeam} />
            </motion.div>
          ) : null}

          <motion.button
            type="button"
            onClick={onConfirm}
            className={`battle-result-btn battle-result-btn--${variant}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {copy.button}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
