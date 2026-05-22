import type { ApiPokemon } from "@/lib/pokeapi";
import { pickMoveset } from "./moves";
import { emeraldBackUrl, frlgBackUrl, frlgFrontUrl } from "./sprites";
import type { BattlePokemon } from "./types";

const IV = 8;

/** Nível fixo de todos os Pokémon na batalha. */
export const BATTLE_LEVEL = 100;

function statAtLevel(base: number, level: number, isHp: boolean): number {
  const inner = Math.floor(((2 * base + IV) * level) / 100);
  return isHp ? inner + level + 10 : inner + 5;
}

function getBase(p: ApiPokemon, name: string): number {
  const s = p.stats.find((x) => x.stat.name === name);
  return s?.base_stat ?? 50;
}

export function buildBattlePokemon(api: ApiPokemon): BattlePokemon {
  const types = [...api.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);
  const displayName = api.name.toUpperCase();
  const baseHp = getBase(api, "hp");
  const baseAtk = getBase(api, "attack");
  const baseDef = getBase(api, "defense");
  const baseSpA = getBase(api, "special-attack");
  const baseSpD = getBase(api, "special-defense");
  const baseSpe = getBase(api, "speed");

  const maxHp = statAtLevel(baseHp, BATTLE_LEVEL, true);
  const moves = pickMoveset(api.id, types).map((m) => ({
    ...m,
    currentPp: m.pp,
  }));

  return {
    speciesId: api.id,
    speciesSlug: api.name,
    displayName,
    types,
    level: BATTLE_LEVEL,
    maxHp,
    currentHp: maxHp,
    attack: statAtLevel(baseAtk, BATTLE_LEVEL, false),
    defense: statAtLevel(baseDef, BATTLE_LEVEL, false),
    specialAttack: statAtLevel(baseSpA, BATTLE_LEVEL, false),
    specialDefense: statAtLevel(baseSpD, BATTLE_LEVEL, false),
    speed: statAtLevel(baseSpe, BATTLE_LEVEL, false),
    moves,
    fainted: false,
    spriteFront: frlgFrontUrl(api.id),
    spriteBack: frlgBackUrl(api.id),
  };
}

export function backFallbackUrl(id: number): string {
  return emeraldBackUrl(id);
}
