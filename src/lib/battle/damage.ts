import type { BattlePokemon } from "./types";
import { resolveMoveTypeForChart } from "./moves";
import { effectivenessLabel, typeMultiplier } from "./gen1TypeMultiplier";

export function computeDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: { power: number; type: string; category: "physical" | "special" }
): {
  damage: number;
  mult: number;
  label: ReturnType<typeof effectivenessLabel>;
  crit: boolean;
} {
  if (move.power <= 0) {
    return { damage: 0, mult: 1, label: "normal", crit: false };
  }
  const att =
    move.category === "physical" ? attacker.attack : attacker.specialAttack;
  const def =
    move.category === "physical" ? defender.defense : defender.specialDefense;
  const chartType = resolveMoveTypeForChart(move.type.toLowerCase());
  const mult = typeMultiplier(chartType, defender.types);
  const label = effectivenessLabel(mult);
  if (mult === 0) {
    return { damage: 0, mult: 0, label: "immune", crit: false };
  }
  const stab = attacker.types.includes(move.type.toLowerCase()) ? 1.5 : 1;
  const ratio = Math.max(0.25, att / Math.max(1, def));
  const raw = ratio * move.power * mult * stab;
  const jitter = 0.92 + Math.random() * 0.16;
  const crit = Math.random() < 0.0625;
  const damage = Math.max(
    1,
    Math.floor(raw * jitter * (crit ? 2 : 1))
  );
  return { damage, mult, label, crit };
}
