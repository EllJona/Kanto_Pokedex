"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import type { BattlePokemon } from "@/lib/battle/types";
import type { SimState } from "@/lib/battle/simState";

export type { SimState } from "@/lib/battle/simState";

function cloneTeam(team: BattlePokemon[]): BattlePokemon[] {
  return team.map((m) => ({
    ...m,
    moves: m.moves.map((mv) => ({ ...mv })),
  }));
}

function initialState(player: BattlePokemon[], opp: BattlePokemon[]): SimState {
  const pt = cloneTeam(player);
  const ot = cloneTeam(opp);
  return {
    playerTeam: pt,
    oppTeam: ot,
    pActive: 0,
    oActive: 0,
    log: ["Wild Pokémon appeared!", `Go! ${pt[0].displayName}!`],
    winner: null,
    roundKey: 0,
    lastHitTarget: null,
  };
}

export function useBattleSimulation(
  player: BattlePokemon[] | null,
  opp: BattlePokemon[] | null
) {
  const [state, setState] = useState<SimState | null>(null);

  useLayoutEffect(() => {
    if (!player || !opp) {
      setState(null);
      return;
    }
    setState(initialState(player, opp));
  }, [player, opp]);

  const commitRound = useCallback((next: SimState) => {
    setState(next);
  }, []);

  return { state, commitRound };
}
