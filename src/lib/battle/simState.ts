import type { BattlePokemon } from "@/lib/battle/types";

export type Winner = "player" | "opponent" | null;

export type SimState = {
  playerTeam: BattlePokemon[];
  oppTeam: BattlePokemon[];
  pActive: number;
  oActive: number;
  log: string[];
  winner: Winner;
  roundKey: number;
  lastHitTarget: "player" | "foe" | null;
};
