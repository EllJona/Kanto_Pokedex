import { computeDamage } from "@/lib/battle/damage";
import type { BattleSfxCue } from "@/lib/audio/battleSfx";
import type { BattleMoveInstance, BattlePokemon } from "@/lib/battle/types";
import type { SimState, Winner } from "@/lib/battle/simState";

export type VfxVariant = "electric" | "grass" | "fire" | "poison" | "neutral";

export type BattlePlaybackStep =
  | { kind: "text"; text: string; ms?: number; faintSlug?: string }
  | { kind: "dash"; side: "player" | "opponent"; ms?: number }
  | { kind: "vfx"; variant: VfxVariant; target: "foe" | "player"; ms?: number }
  | {
      kind: "impact";
      target: "foe" | "player";
      crit: boolean;
      physical?: boolean;
      ms?: number;
    }
  | { kind: "screenFlash"; ms?: number }
  | { kind: "hp"; target: "foe" | "player"; ratio: number; ms?: number }
  | { kind: "sfx"; cue: BattleSfxCue; speciesSlug?: string };

function cloneTeam(team: BattlePokemon[]): BattlePokemon[] {
  return team.map((m) => ({
    ...m,
    moves: m.moves.map((mv) => ({ ...mv })),
  }));
}

function allFainted(team: BattlePokemon[]) {
  return team.every((m) => m.fainted);
}

function nextAlive(team: BattlePokemon[], prefer: number): number {
  for (let k = 0; k < team.length; k++) {
    const i = (prefer + k) % team.length;
    if (!team[i].fainted) return i;
  }
  return prefer;
}

function pickOffensiveMove(mon: BattlePokemon): BattleMoveInstance {
  const candidates = mon.moves.filter((m) => m.power > 0 && m.currentPp > 0);
  const pool = candidates.length ? candidates : mon.moves.filter((m) => m.currentPp > 0);
  if (!pool.length) return mon.moves[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

function findPlayerMove(
  p: BattlePokemon,
  moveId: string
): BattleMoveInstance | null {
  const m = p.moves.find((x) => x.id === moveId);
  return m && m.currentPp > 0 ? m : null;
}

function moveTypeToVfx(t: string): VfxVariant {
  const x = t.toLowerCase();
  if (x === "electric") return "electric";
  if (x === "grass") return "grass";
  if (x === "fire") return "fire";
  if (x === "poison") return "poison";
  return "neutral";
}

export function planBattleRound(
  prev: SimState,
  playerMoveId: string
): { next: SimState; steps: BattlePlaybackStep[] } | null {
  if (prev.winner) return null;

  const startPI = prev.pActive;
  const startOI = prev.oActive;
  const log = [...prev.log];
  const playerTeam = cloneTeam(prev.playerTeam);
  const oppTeam = cloneTeam(prev.oppTeam);
  let pActive = nextAlive(playerTeam, prev.pActive);
  let oActive = nextAlive(oppTeam, prev.oActive);

  const p = playerTeam[pActive];
  const o = oppTeam[oActive];
  if (!p || !o) {
    return {
      next: {
        ...prev,
        winner: allFainted(playerTeam) ? "opponent" : "player",
      },
      steps: [],
    };
  }

  const chosen = findPlayerMove(p, playerMoveId);
  if (!chosen) return null;

  const steps: BattlePlaybackStep[] = [];
  const playerFirst = p.speed >= o.speed;
  type Side = "player" | "opponent";
  const turnOrder: Side[] = playerFirst
    ? ["player", "opponent"]
    : ["opponent", "player"];

  let winner: Winner = null;
  let lastHitTarget: "player" | "foe" | null = null;

  const applyOne = (side: Side, move: BattleMoveInstance) => {
    pActive = nextAlive(playerTeam, pActive);
    oActive = nextAlive(oppTeam, oActive);
    const atkMon = side === "player" ? playerTeam[pActive] : oppTeam[oActive];
    const defMon = side === "player" ? oppTeam[oActive] : playerTeam[pActive];
    if (!atkMon || !defMon || atkMon.fainted || defMon.fainted) return;

    const atkLabel =
      side === "opponent" ? `Enemy ${atkMon.displayName}` : atkMon.displayName;

    steps.push({ kind: "text", text: `${atkLabel} used ${move.name}!`, ms: 520 });

    if (side === "player") {
      const mi = playerTeam[pActive].moves.findIndex((x) => x.id === move.id);
      if (mi >= 0 && playerTeam[pActive].moves[mi].currentPp > 0) {
        playerTeam[pActive].moves[mi] = {
          ...playerTeam[pActive].moves[mi],
          currentPp: playerTeam[pActive].moves[mi].currentPp - 1,
        };
      }
    }

    if (move.power <= 0) {
      log.push(`${atkLabel} used ${move.name}!`);
      log.push("But nothing happened!");
      steps.push({ kind: "text", text: "But nothing happened!", ms: 420 });
      return;
    }

    const { damage, mult, label, crit } = computeDamage(atkMon, defMon, move);
    log.push(`${atkLabel} used ${move.name}!`);

    if (mult === 0) {
      log.push(`It doesn't affect ${defMon.displayName}!`);
      steps.push({
        kind: "text",
        text: `It doesn't affect ${defMon.displayName}!`,
        ms: 480,
      });
      steps.push({ kind: "sfx", cue: "ineffective" });
      return;
    }

    const target: "foe" | "player" = side === "player" ? "foe" : "player";
    const physicalDash =
      move.category === "physical" && move.power > 0;

    if (physicalDash) {
      steps.push({ kind: "dash", side, ms: 340 });
    }

    const vfxVariant = moveTypeToVfx(move.type);
    steps.push({
      kind: "vfx",
      variant: vfxVariant,
      target,
      ms: 480,
    });
    steps.push({
      kind: "sfx",
      cue: `attack-${vfxVariant}` as BattleSfxCue,
      speciesSlug: atkMon.speciesSlug,
    });

    if (crit) {
      log.push("A critical hit!");
      steps.push({ kind: "screenFlash", ms: 100 });
    }

    steps.push({
      kind: "impact",
      target,
      crit,
      physical: physicalDash,
      ms: 280,
    });
    if (crit) {
      steps.push({ kind: "text", text: "A critical hit!", ms: 320 });
    }

    const defMax = defMon.maxHp;
    const nh = Math.max(0, defMon.currentHp - damage);
    const ratio = defMax > 0 ? nh / defMax : 0;

    if (side === "player") {
      oppTeam[oActive] = { ...defMon, currentHp: nh, fainted: nh === 0 };
    } else {
      playerTeam[pActive] = { ...defMon, currentHp: nh, fainted: nh === 0 };
    }

    if (damage > 0) {
      lastHitTarget = side === "player" ? "foe" : "player";
    }

    steps.push({ kind: "hp", target, ratio, ms: 720 });

    if (label === "super") {
      log.push("It's super effective!");
      steps.push({ kind: "text", text: "It's super effective!", ms: 420 });
      steps.push({ kind: "sfx", cue: "super-effective" });
    } else if (label === "resisted") {
      log.push("It's not very effective…");
      steps.push({ kind: "text", text: "It's not very effective…", ms: 420 });
      steps.push({ kind: "sfx", cue: "ineffective" });
    }

    const defMonName = defMon.displayName;
    if (side === "player") {
      if (oppTeam[oActive].fainted) {
        log.push(`Enemy ${defMonName} fainted!`);
        steps.push({
          kind: "text",
          text: `Enemy ${defMonName} fainted!`,
          ms: 520,
          faintSlug: defMon.speciesSlug,
        });
      }
    } else if (playerTeam[pActive].fainted) {
      log.push(`${defMonName} fainted!`);
      steps.push({
        kind: "text",
        text: `${defMonName} fainted!`,
        ms: 520,
        faintSlug: defMon.speciesSlug,
      });
    }
  };

  for (const side of turnOrder) {
    if (allFainted(oppTeam)) {
      winner = "player";
      log.push("Sua equipe venceu!");
      steps.push({ kind: "text", text: "Sua equipe venceu!", ms: 600 });
      steps.push({ kind: "sfx", cue: "victory" });
      break;
    }
    if (allFainted(playerTeam)) {
      winner = "opponent";
      log.push("A equipe oponente venceu!");
      steps.push({ kind: "text", text: "A equipe oponente venceu!", ms: 600 });
      steps.push({ kind: "sfx", cue: "defeat" });
      break;
    }

    const move =
      side === "player" ? chosen : pickOffensiveMove(oppTeam[oActive]);
    applyOne(side, move);

    if (allFainted(oppTeam)) {
      winner = "player";
      log.push("Sua equipe venceu!");
      steps.push({ kind: "text", text: "Sua equipe venceu!", ms: 600 });
      steps.push({ kind: "sfx", cue: "victory" });
      break;
    }
    if (allFainted(playerTeam)) {
      winner = "opponent";
      log.push("A equipe oponente venceu!");
      steps.push({ kind: "text", text: "A equipe oponente venceu!", ms: 600 });
      steps.push({ kind: "sfx", cue: "defeat" });
      break;
    }
  }

  pActive = nextAlive(playerTeam, pActive);
  oActive = nextAlive(oppTeam, oActive);

  if (!winner) {
    if (pActive !== startPI && !playerTeam[pActive].fainted) {
      const mon = playerTeam[pActive];
      const t = `Go! ${mon.displayName}!`;
      log.push(t);
      steps.push({ kind: "text", text: t, ms: 480 });
      steps.push({
        kind: "sfx",
        cue: "send-out",
        speciesSlug: mon.speciesSlug,
      });
    }
    if (oActive !== startOI && !oppTeam[oActive].fainted) {
      const mon = oppTeam[oActive];
      const t = `Enemy sent out ${mon.displayName}!`;
      log.push(t);
      steps.push({ kind: "text", text: t, ms: 480 });
      steps.push({
        kind: "sfx",
        cue: "send-out",
        speciesSlug: mon.speciesSlug,
      });
    }
  }

  const next: SimState = {
    playerTeam,
    oppTeam,
    pActive,
    oActive,
    log: log.slice(-40),
    winner,
    roundKey: prev.roundKey + 1,
    lastHitTarget,
  };

  return { next, steps };
}
