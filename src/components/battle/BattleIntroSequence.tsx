"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAudio } from "@/components/providers/AudioProvider";
import type { BattlePokemon } from "@/lib/battle/types";
import { foeFrontSpriteUrls } from "@/lib/battle/spriteUrls";
import "./gba-battle.css";

type Props = {
  playerLead: BattlePokemon;
  oppLead: BattlePokemon;
  onComplete: () => void;
};

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const STEP_MS: Record<Step, number> = {
  0: 700,
  1: 1100,
  2: 1200,
  3: 1100,
  4: 900,
  5: 650,
};

export function BattleIntroSequence({
  playerLead,
  oppLead,
  onComplete,
}: Props) {
  const { playBattleSfx } = useAudio();
  const [step, setStep] = useState<Step>(0);

  useEffect(() => {
    if (step === 2) playBattleSfx("send-out", { speciesSlug: oppLead.speciesSlug });
    if (step === 3) playBattleSfx("send-out", { speciesSlug: playerLead.speciesSlug });
  }, [step, oppLead.speciesSlug, playerLead.speciesSlug, playBattleSfx]);

  useEffect(() => {
    if (step >= 5) {
      const t = setTimeout(onComplete, STEP_MS[5]);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => (s + 1) as Step), STEP_MS[step]);
    return () => clearTimeout(t);
  }, [step, onComplete]);

  const oppUrls = foeFrontSpriteUrls(oppLead.speciesId);
  const playerUrls = foeFrontSpriteUrls(playerLead.speciesId);

  return (
    <motion.div
      className="gba-root fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,#1a3828_0%,#050805_70%)]" />

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="flash"
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.92, 0] }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative z-[1] flex w-full max-w-6xl flex-col items-center px-6 sm:px-10">
        <AnimatePresence mode="wait">
          {step >= 1 && step <= 4 ? (
            <motion.p
              key={`line-${step}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="gba-panel gba-intro-dialog mb-10 w-full max-w-2xl rounded-lg border-4 border-[#101010] px-6 py-5 text-center text-[#101010] sm:px-8 sm:py-6"
            >
              {step === 1 && "Um treinador desafiador apareceu!"}
              {step === 2 &&
                `O oponente enviou ${oppLead.displayName}!`}
              {step === 3 && `Go! ${playerLead.displayName}!`}
              {step === 4 && "Prepare-se!"}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <div className="gba-intro-arena gba-intro-arena-grid w-full max-w-4xl px-2 sm:px-12">
          <div className="gba-intro-slot gba-intro-slot--player">
            <AnimatePresence>
              {step >= 3 ? (
                <motion.div
                  key="player"
                  className="flex w-full flex-col items-center"
                  initial={{ opacity: 0, x: -120, scale: 0.6 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <IntroSprite urls={playerUrls} alt={playerLead.displayName} />
                  <p className="gba-intro-name">{playerLead.displayName}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="gba-intro-slot gba-intro-slot--vs">
            <AnimatePresence>
              {step === 4 ? (
                <motion.div
                  key="vs"
                  className="flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.2, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.4 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                >
                  <span className="gba-intro-vs font-display font-black tracking-tighter text-amber-300">
                    VS
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="gba-intro-slot gba-intro-slot--foe">
            <AnimatePresence>
              {step >= 2 ? (
                <motion.div
                  key="foe"
                  className="flex w-full flex-col items-center"
                  initial={{ opacity: 0, x: 120, scale: 0.6 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <IntroSprite urls={oppUrls} alt={oppLead.displayName} />
                  <p className="gba-intro-name">{oppLead.displayName}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {step === 5 ? (
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : null}
      </div>
    </motion.div>
  );
}

function IntroSprite({ urls, alt }: { urls: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const url = urls[Math.min(i, urls.length - 1)] ?? "";

  return (
    <div className="gba-intro-sprite-wrap">
      <div className="gba-intro-sprite-shadow" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        draggable={false}
        onError={() => setI((p) => (p + 1 < urls.length ? p + 1 : p))}
        className="gba-intro-sprite-img [image-rendering:pixelated]"
      />
    </div>
  );
}
