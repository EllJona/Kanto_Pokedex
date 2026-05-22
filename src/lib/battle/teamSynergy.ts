import type { ApiPokemon } from "@/lib/pokeapi";
import { typeMultiplier } from "@/lib/battle/gen1TypeMultiplier";

const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

const STAT_LABELS: Record<(typeof STAT_KEYS)[number], string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "SPE",
};

const ATTACK_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
] as const;

export type RadarStat = { stat: string; value: number; fullMark: number };

export type TeamSynergyReport = {
  radar: RadarStat[];
  weaknesses: { type: string; score: number }[];
  resistances: { type: string; score: number }[];
  summary: string;
  coverageScore: number;
};

function getStat(p: ApiPokemon, name: string): number {
  return p.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
}

export function averageTeamStats(team: ApiPokemon[]): RadarStat[] {
  if (!team.length) {
    return STAT_KEYS.map((k) => ({
      stat: STAT_LABELS[k],
      value: 0,
      fullMark: 255,
    }));
  }
  return STAT_KEYS.map((k) => {
    const sum = team.reduce((a, p) => a + getStat(p, k), 0);
    return {
      stat: STAT_LABELS[k],
      value: Math.round(sum / team.length),
      fullMark: 255,
    };
  });
}

/** Cobertura defensiva: quantos Pokémon do time sofrem ≥2× de cada tipo de ataque. */
export function analyzeTeamSynergy(team: ApiPokemon[]): TeamSynergyReport {
  const radar = averageTeamStats(team);
  if (!team.length) {
    return {
      radar,
      weaknesses: [],
      resistances: [],
      summary: "Monte seu time de 5 Pokémon para ver a análise tática.",
      coverageScore: 0,
    };
  }

  const typings = team.map((p) =>
    p.types.map((t) => t.type.name.toLowerCase())
  );

  const weaknessScores: { type: string; score: number }[] = [];
  const resistScores: { type: string; score: number }[] = [];

  for (const atk of ATTACK_TYPES) {
    let weakCount = 0;
    let resistCount = 0;
    for (const types of typings) {
      const m = typeMultiplier(atk, types);
      if (m >= 2) weakCount++;
      if (m <= 0.5 && m > 0) resistCount++;
      if (m === 0) resistCount++;
    }
    if (weakCount >= 2) {
      weaknessScores.push({ type: atk, score: weakCount });
    }
    if (resistCount >= 3) {
      resistScores.push({ type: atk, score: resistCount });
    }
  }

  weaknessScores.sort((a, b) => b.score - a.score);
  resistScores.sort((a, b) => b.score - a.score);

  const uniqueTypes = new Set(typings.flat());
  const coverageScore = Math.min(
    100,
    Math.round((uniqueTypes.size / 8) * 40 + (5 - weaknessScores.length) * 12)
  );

  let summary: string;
  if (weaknessScores.length === 0) {
    summary =
      "Cobertura sólida: nenhum tipo ameaça mais de um Pokémon ao mesmo tempo. Mantenha diversidade ofensiva.";
  } else {
    const top = weaknessScores
      .slice(0, 3)
      .map((w) => w.type)
      .join(", ");
    summary = `Atenção: o time é vulnerável a ataques ${top}. Considere um slot com tipo que resista ou impeça esses golpes.`;
  }

  if (resistScores.length > 0) {
    const r = resistScores
      .slice(0, 2)
      .map((x) => x.type)
      .join(", ");
    summary += ` Pontos fortes contra ${r}.`;
  }

  return {
    radar,
    weaknesses: weaknessScores,
    resistances: resistScores,
    summary,
    coverageScore,
  };
}
