import type { ApiEvolutionChain, ApiPokemon, ApiSpecies } from "@/lib/pokeapi";

const API = "https://pokeapi.co/api/v2";

export type PokemonDetailBundle = {
  pokemon: ApiPokemon;
  species: ApiSpecies;
  chain: ApiEvolutionChain;
};

const cache = new Map<number, PokemonDetailBundle>();
const inflight = new Map<number, Promise<PokemonDetailBundle>>();

export function getCachedPokemonDetail(
  id: number
): PokemonDetailBundle | undefined {
  return cache.get(id);
}

async function fetchBundle(id: number): Promise<PokemonDetailBundle> {
  const [pRes, sRes] = await Promise.all([
    fetch(`${API}/pokemon/${id}`),
    fetch(`${API}/pokemon-species/${id}`),
  ]);
  if (!pRes.ok || !sRes.ok) throw new Error("Falha ao carregar");
  const pokemon = (await pRes.json()) as ApiPokemon;
  const species = (await sRes.json()) as ApiSpecies;
  const cRes = await fetch(species.evolution_chain.url);
  if (!cRes.ok) throw new Error("Evolução indisponível");
  const chain = (await cRes.json()) as ApiEvolutionChain;
  return { pokemon, species, chain };
}

export function prefetchPokemonDetail(id: number): void {
  if (cache.has(id) || inflight.has(id)) return;
  const p = fetchBundle(id)
    .then((bundle) => {
      cache.set(id, bundle);
      return bundle;
    })
    .finally(() => {
      inflight.delete(id);
    });
  inflight.set(id, p);
}

export async function loadPokemonDetail(
  id: number
): Promise<PokemonDetailBundle> {
  const hit = cache.get(id);
  if (hit) return hit;
  const pending = inflight.get(id);
  if (pending) return pending;
  const p = fetchBundle(id).then((bundle) => {
    cache.set(id, bundle);
    return bundle;
  });
  inflight.set(id, p);
  try {
    return await p;
  } finally {
    inflight.delete(id);
  }
}
