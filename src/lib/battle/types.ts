import type { MoveDef } from "./moves";

export type BattleMoveInstance = MoveDef & { currentPp: number };

export type BattlePokemon = {
  speciesId: number;
  /** Slug PokeAPI / Showdown para cries (ex. bulbasaur). */
  speciesSlug: string;
  displayName: string;
  types: string[];
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  moves: BattleMoveInstance[];
  fainted: boolean;
  /** Sprite URLs (FRLG-style); backs = player, fronts = foe */
  spriteFront: string;
  spriteBack: string;
};

export type BattleSide = "player" | "opponent";

export type BattleLogLine = {
  text: string;
  side?: BattleSide;
};
