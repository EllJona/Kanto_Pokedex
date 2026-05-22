import type { PokemonSummary } from "@/lib/pokeapi";

const REQUIRED = new Set(["electric", "grass", "poison"]);

export function filterOpponentPool(summaries: PokemonSummary[]): PokemonSummary[] {
  return summaries.filter((p) =>
    p.types.some((t) => REQUIRED.has(t.toLowerCase()))
  );
}

/** 5 espécies distintas aleatórias do pool (Elétrico/Planta/Veneno). */
export function rollOpponentTeam(pool: PokemonSummary[]): PokemonSummary[] {
  if (pool.length < 5) {
    throw new Error("Pool insuficiente para gerar oponente.");
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const seen = new Set<number>();
  const out: PokemonSummary[] = [];
  for (const p of shuffled) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length === 5) break;
  }
  if (out.length < 5) {
    for (const p of pool) {
      if (out.length === 5) break;
      if (!seen.has(p.id)) {
        seen.add(p.id);
        out.push(p);
      }
    }
  }
  return out.slice(0, 5);
}
