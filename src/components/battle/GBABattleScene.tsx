"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  planBattleRound,
  type BattlePlaybackStep,
  type VfxVariant,
} from "@/lib/battle/planRound";
import type { SimState } from "@/lib/battle/simState";
import {
  foeFrontSpriteUrls,
  miniFrontSpriteUrls,
  playerBackSpriteUrls,
} from "@/lib/battle/spriteUrls";
import { useAudio } from "@/components/providers/AudioProvider";
import { primeBattleSfxFromGesture } from "@/lib/audio/battleSfx";
import { BattleArenaBackground } from "./BattleArenaBackground";
import { BattlePixelSprite } from "./BattlePixelSprite";
import { BattleResultOverlay } from "./BattleResultOverlay";
import { BattleVfxLayer } from "./BattleVfxLayer";
import "./gba-battle.css";

type Props = {
  sim: SimState;
  onCommitRound: (next: SimState) => void;
  onExit: () => void;
};

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

type MenuView = "main" | "fight" | "pokemon";

function defaultMs(step: BattlePlaybackStep): number {
  switch (step.kind) {
    case "text":
      return step.ms ?? 500;
    case "dash":
      return step.ms ?? 340;
    case "vfx":
      return step.ms ?? 480;
    case "impact":
      return step.ms ?? 280;
    case "screenFlash":
      return step.ms ?? 120;
    case "hp":
      return step.ms ?? 720;
    default:
      return 400;
  }
}

function hpColor(ratio: number) {
  if (ratio > 0.5) return "#6bdc5a";
  if (ratio > 0.2) return "#f8d030";
  return "#f85838";
}

function GBAHpBar({
  ratio,
  displayRatio,
  label,
}: {
  ratio: number;
  displayRatio?: number;
  label: string;
}) {
  const r = displayRatio ?? ratio;
  const pct = Math.max(0, Math.min(100, r * 100));
  return (
    <div className="gba-hp-shell">
      <div className="gba-hp-label">{label}</div>
      <div className="gba-hp-track">
        <motion.div
          className="gba-hp-fill"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{
            background: `linear-gradient(180deg, ${hpColor(r)} 0%, #205020 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function MiniIcon({
  mon,
  active,
}: {
  mon: { speciesId: number; displayName: string; fainted: boolean };
  active: boolean;
}) {
  const urls = miniFrontSpriteUrls(mon.speciesId);
  return (
    <div
      className={`relative h-10 w-10 overflow-hidden rounded border-2 bg-[#282010] ${
        active ? "border-amber-300" : "border-[#181010]"
      } ${mon.fainted ? "opacity-35 grayscale" : ""}`}
      title={mon.displayName}
    >
      <BattlePixelSprite
        urls={urls}
        alt={mon.displayName}
        role="mini"
        shakeSignal={0}
        idle={false}
      />
    </div>
  );
}

export function GBABattleScene({ sim, onCommitRound, onExit }: Props) {
  const { playBattleSfx } = useAudio();
  const p = sim.playerTeam[sim.pActive];
  const o = sim.oppTeam[sim.oActive];

  const [playing, setPlaying] = useState(false);
  const [viewLog, setViewLog] = useState<string[] | null>(null);
  const [hpFoeDisplay, setHpFoeDisplay] = useState(
    () => (o.maxHp > 0 ? o.currentHp / o.maxHp : 0)
  );
  const [hpPlayerDisplay, setHpPlayerDisplay] = useState(
    () => (p.maxHp > 0 ? p.currentHp / p.maxHp : 0)
  );
  const [dashSide, setDashSide] = useState<"player" | "opponent" | null>(null);
  const [vfx, setVfx] = useState<{
    variant: VfxVariant;
    target: "foe" | "player";
  } | null>(null);
  const [critFlash, setCritFlash] = useState(false);
  const [menuView, setMenuView] = useState<MenuView>("main");
  const [fled, setFled] = useState(false);
  const [foeShake, setFoeShake] = useState(0);
  const [playerShake, setPlayerShake] = useState(0);
  const [foeFlash, setFoeFlash] = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);

  const playingRef = useRef(false);

  useEffect(() => {
    primeBattleSfxFromGesture();
  }, []);

  useEffect(() => {
    if (playing) return;
    setHpFoeDisplay(o.maxHp > 0 ? o.currentHp / o.maxHp : 0);
    setHpPlayerDisplay(p.maxHp > 0 ? p.currentHp / p.maxHp : 0);
    setViewLog(null);
  }, [sim, p, o, playing]);

  const runPlayback = useCallback(
    async (moveId: string) => {
      if (playingRef.current || sim.winner) return;
      const planned = planBattleRound(sim, moveId);
      if (!planned) return;

      playingRef.current = true;
      setPlaying(true);
      setMenuView("main");
      const { next, steps } = planned;

      let lines = [...sim.log];
      setViewLog(lines);

      let hpF = o.maxHp > 0 ? o.currentHp / o.maxHp : 0;
      let hpP = p.maxHp > 0 ? p.currentHp / p.maxHp : 0;
      setHpFoeDisplay(hpF);
      setHpPlayerDisplay(hpP);

      for (const step of steps) {
        const ms = defaultMs(step);
        switch (step.kind) {
          case "text": {
            lines = [...lines, step.text];
            setViewLog(lines);
            if (step.faintSlug) {
              playBattleSfx("faint", { speciesSlug: step.faintSlug });
            }
            await sleep(ms);
            break;
          }
          case "dash": {
            setDashSide(step.side);
            await sleep(ms);
            setDashSide(null);
            await sleep(80);
            break;
          }
          case "vfx": {
            setVfx({ variant: step.variant, target: step.target });
            await sleep(ms);
            setVfx(null);
            await sleep(40);
            break;
          }
          case "impact": {
            if (step.crit) {
              playBattleSfx("hit-crit");
            } else if (step.physical) {
              playBattleSfx("collision");
            } else {
              playBattleSfx("hit-special");
            }
            if (step.target === "foe") {
              setFoeShake(1);
              setFoeFlash(true);
              setTimeout(() => setFoeFlash(false), 200);
              setTimeout(() => setFoeShake(0), 400);
            } else {
              setPlayerShake(1);
              setPlayerFlash(true);
              setTimeout(() => setPlayerFlash(false), 200);
              setTimeout(() => setPlayerShake(0), 400);
            }
            await sleep(ms);
            break;
          }
          case "screenFlash": {
            setCritFlash(true);
            await sleep(ms);
            setCritFlash(false);
            break;
          }
          case "hp": {
            if (step.target === "foe") hpF = step.ratio;
            else hpP = step.ratio;
            setHpFoeDisplay(hpF);
            setHpPlayerDisplay(hpP);
            await sleep(ms);
            break;
          }
          case "sfx": {
            playBattleSfx(step.cue, {
              speciesSlug: step.speciesSlug,
            });
            break;
          }
          default:
            break;
        }
      }

      onCommitRound(next);
      playingRef.current = false;
      setPlaying(false);
      setDashSide(null);
      setVfx(null);
    },
    [sim, onCommitRound, p, o, playBattleSfx]
  );

  const pRatio = p.maxHp > 0 ? p.currentHp / p.maxHp : 0;
  const oRatio = o.maxHp > 0 ? o.currentHp / o.maxHp : 0;

  const displayMoves = useMemo(() => p.moves.slice(0, 4), [p.moves]);
  const logTail = (viewLog ?? sim.log).slice(-6);
  const canAct = !sim.winner && !p.fainted && !playing && !fled;
  const canPickMove = canAct && menuView === "fight";

  const appendLog = useCallback(
    (line: string) => {
      onCommitRound({
        ...sim,
        log: [...sim.log, line].slice(-40),
      });
    },
    [sim, onCommitRound]
  );

  const switchToPokemon = useCallback(
    (index: number) => {
      if (!canAct || index === sim.pActive) return;
      const mon = sim.playerTeam[index];
      if (mon.fainted) return;
      onCommitRound({
        ...sim,
        pActive: index,
        log: [...sim.log, `Go! ${mon.displayName}!`].slice(-40),
      });
      playBattleSfx("send-out", { speciesSlug: mon.speciesSlug });
      setMenuView("main");
    },
    [canAct, sim, onCommitRound, playBattleSfx]
  );

  return (
    <div className="relative">
      <div className="gba-root mx-auto w-full max-w-[min(100%,1440px)]">
        <div className="gba-frame overflow-visible">
          <BattleArenaBackground>
            <div className="gba-field relative h-full w-full">
              <div className="gba-grass gba-grass-glass" />
              <div className="gba-grass-patch left-[8%]" />
              <div className="gba-grass-patch right-[10%] scale-110" />

              {vfx ? (
                <BattleVfxLayer
                  variant={vfx.variant}
                  target={vfx.target}
                  active
                />
              ) : null}

              <AnimatePresence>
                {critFlash ? (
                  <motion.div
                    key="crit"
                    className="pointer-events-none absolute inset-0 z-[50] bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.55, 0] }}
                    transition={{ duration: 0.14 }}
                  />
                ) : null}
              </AnimatePresence>

              <div className="absolute right-[4%] top-[8%] z-[10] flex w-[42%] max-w-[360px] flex-col items-end sm:top-[12%]">
                <div className="gba-panel-glass rounded-md p-0.5 shadow-lg">
                  <GBAHpBar
                    ratio={oRatio}
                    displayRatio={playing ? hpFoeDisplay : undefined}
                    label={`${o.displayName} Lv${o.level}`}
                  />
                </div>
                <div className="relative mt-3 w-full">
                  <div className="gba-sprite-stage gba-sprite-stage--foe relative z-[1] overflow-visible">
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-[2] rounded-lg bg-red-500/0"
                      animate={{
                        backgroundColor: foeFlash
                          ? "rgba(248,88,56,0.45)"
                          : "rgba(248,88,56,0)",
                      }}
                      transition={{ duration: 0.12 }}
                    />
                    <motion.div
                      className="gba-sprite-figure gba-sprite-figure--foe relative z-[1]"
                      animate={
                        dashSide === "opponent"
                          ? { x: [0, -28, 0] }
                          : { x: 0 }
                      }
                      transition={{ duration: 0.32, ease: "easeInOut" }}
                    >
                      <BattlePixelSprite
                        urls={foeFrontSpriteUrls(o.speciesId)}
                        alt={o.displayName}
                        role="foe"
                        shakeSignal={foeShake}
                        idle={!playing}
                      />
                      <div className="gba-sprite-shadow-ground gba-sprite-shadow-ground--foe" />
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-[6%] left-0 z-[10] w-[62%] max-w-[520px] overflow-visible pl-[2%] sm:bottom-[8%]">
                <div className="gba-panel-glass relative z-20 mb-2 ml-1 w-[max(92%,200px)] rounded-md p-0.5 shadow-lg">
                  <GBAHpBar
                    ratio={pRatio}
                    displayRatio={playing ? hpPlayerDisplay : undefined}
                    label={`${p.displayName} Lv${p.level}`}
                  />
                </div>
                <div className="gba-sprite-stage gba-sprite-stage--player relative overflow-visible">
                  <motion.div
                    className="pointer-events-none absolute inset-0 z-[2] rounded-lg bg-red-500/0"
                    animate={{
                      backgroundColor: playerFlash
                        ? "rgba(248,88,56,0.45)"
                        : "rgba(248,88,56,0)",
                    }}
                    transition={{ duration: 0.12 }}
                  />
                  <motion.div
                    className="gba-sprite-figure gba-sprite-figure--player relative z-[1]"
                    animate={
                      dashSide === "player" ? { x: [0, 36, 0] } : { x: 0 }
                    }
                    transition={{ duration: 0.32, ease: "easeInOut" }}
                  >
                    <BattlePixelSprite
                      urls={playerBackSpriteUrls(p.speciesId)}
                      alt={p.displayName}
                      role="player"
                      shakeSignal={playerShake}
                      idle={!playing}
                    />
                    <div className="gba-sprite-shadow-ground gba-sprite-shadow-ground--player" />
                  </motion.div>
                </div>
              </div>
            </div>
          </BattleArenaBackground>

          <div className="relative z-20 grid grid-cols-1 gap-0 overflow-hidden rounded-b border-t-4 border-[#101010] bg-[#282828]/90 lg:grid-cols-[minmax(0,1fr)_min(54%,600px)]">
            <div className="gba-panel-glass m-2 flex min-h-[min(22vh,200px)] flex-col rounded-lg p-3 sm:m-3 sm:min-h-[min(24vh,220px)] sm:p-4">
              <div className="gba-log flex flex-1 flex-col justify-center">
                {logTail.map((line, i) => (
                  <p key={`${sim.roundKey}-${i}-${line.slice(0, 14)}`}>{line}</p>
                ))}
              </div>
            </div>

            <div className="gba-menu-panel m-2 flex min-h-[min(32vh,300px)] flex-col justify-stretch p-2 sm:m-3 sm:min-h-[min(34vh,340px)] sm:p-3 lg:min-h-[min(36vh,380px)]">
              {menuView === "main" ? (
                <div className="gba-menu-grid h-full">
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => setMenuView("fight")}
                    className="gba-menu-btn disabled:opacity-40"
                  >
                    FIGHT
                  </button>
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => appendLog("You have no items!")}
                    className="gba-menu-btn disabled:opacity-40"
                  >
                    PACK
                  </button>
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => setMenuView("pokemon")}
                    className="gba-menu-btn disabled:opacity-40"
                  >
                    PKMN
                  </button>
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => {
                      appendLog("Got away safely!");
                      setFled(true);
                    }}
                    className="gba-menu-btn disabled:opacity-40"
                  >
                    RUN
                  </button>
                </div>
              ) : menuView === "fight" ? (
                <div className="gba-menu-grid gba-menu-grid--moves h-full">
                  {displayMoves.map((mv) => (
                    <button
                      key={mv.id}
                      type="button"
                      disabled={!canPickMove || mv.currentPp <= 0}
                      onClick={() => {
                        primeBattleSfxFromGesture();
                        setMenuView("main");
                        void runPlayback(mv.id);
                      }}
                      className="gba-move-cell text-left disabled:opacity-40"
                    >
                      <div className="font-bold uppercase tracking-wide">
                        {mv.name}
                      </div>
                      <div className="gba-move-meta">
                        {mv.type} · PP {mv.currentPp}/{mv.pp}
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => setMenuView("main")}
                    className="gba-menu-btn dim col-span-2"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <div className="gba-menu-grid gba-menu-grid--party h-full">
                  {sim.playerTeam.map((mon, i) => (
                    <button
                      key={`sw-${i}-${mon.speciesId}`}
                      type="button"
                      disabled={!canAct || mon.fainted || i === sim.pActive}
                      onClick={() => switchToPokemon(i)}
                      className="gba-move-cell text-left disabled:opacity-35"
                    >
                      {mon.displayName}
                      {mon.fainted ? " (fainted)" : ""}
                      {i === sim.pActive ? " ★" : ""}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={!canAct}
                    onClick={() => setMenuView("main")}
                    className="gba-menu-btn dim"
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/45">
              Seu time
            </p>
            <div className="flex gap-1">
              {sim.playerTeam.map((mon, i) => (
                <MiniIcon
                  key={`p-${i}-${mon.speciesId}`}
                  mon={mon}
                  active={i === sim.pActive && !mon.fainted}
                />
              ))}
            </div>
          </div>
          <div className="text-center text-[10px] uppercase tracking-[0.25em] text-white/35">
            VS
          </div>
          <div className="text-right">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-white/45">
              Oponente
            </p>
            <div className="flex justify-end gap-1">
              {sim.oppTeam.map((mon, i) => (
                <MiniIcon
                  key={`o-${i}-${mon.speciesId}`}
                  mon={mon}
                  active={i === sim.oActive && !mon.fainted}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 hover:text-white"
          >
            Sair da batalha
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {fled ? (
          <BattleResultOverlay
            key="fled"
            variant="fled"
            onConfirm={onExit}
          />
        ) : sim.winner ? (
          <BattleResultOverlay
            key={sim.winner}
            variant={sim.winner === "player" ? "victory" : "defeat"}
            playerTeam={sim.winner === "player" ? sim.playerTeam : undefined}
            onConfirm={onExit}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
