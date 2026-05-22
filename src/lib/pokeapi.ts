const API = "https://pokeapi.co/api/v2";

export const revalidatePokemon = 86_400;

export type ApiNamed = { name: string; url: string };

export type ApiPokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
    };
  };
  types: { slot: number; type: ApiNamed }[];
  stats: { base_stat: number; effort: number; stat: ApiNamed }[];
  species: ApiNamed;
};

export type ApiSpecies = {
  id: number;
  name: string;
  evolution_chain: { url: string };
};

export type ChainLink = {
  species: ApiNamed;
  evolves_to: ChainLink[];
};

export type ApiEvolutionChain = {
  chain: ChainLink;
};

export type PokemonSummary = {
  id: number;
  name: string;
  types: string[];
  sprite: string;
};

/** Official artwork (PokéAPI / repositório de sprites). */
export function officialArtworkUrl(p: ApiPokemon): string {
  return (
    p.sprites.other?.["official-artwork"]?.front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
  );
}

export function mapToSummary(p: ApiPokemon): PokemonSummary {
  const types = [...p.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);
  return {
    id: p.id,
    name: p.name,
    types,
    sprite: officialArtworkUrl(p),
  };
}

export async function fetchPokemon(id: number): Promise<ApiPokemon> {
  const res = await fetch(`${API}/pokemon/${id}`, {
    next: { revalidate: revalidatePokemon },
  });
  if (!res.ok) throw new Error(`Pokémon ${id} não encontrado`);
  return res.json();
}

/** Cliente / sem cache Next — para telas interativas (ex.: batalha). */
export async function fetchPokemonClient(id: number): Promise<ApiPokemon> {
  const res = await fetch(`${API}/pokemon/${id}`);
  if (!res.ok) throw new Error(`Pokémon ${id} não encontrado`);
  return res.json();
}

export async function fetchSpecies(id: number): Promise<ApiSpecies> {
  const res = await fetch(`${API}/pokemon-species/${id}`, {
    next: { revalidate: revalidatePokemon },
  });
  if (!res.ok) throw new Error(`Espécie ${id} não encontrada`);
  return res.json();
}

export async function fetchEvolutionChain(
  chainUrl: string
): Promise<ApiEvolutionChain> {
  const res = await fetch(chainUrl, { next: { revalidate: revalidatePokemon } });
  if (!res.ok) throw new Error("Cadeia de evolução indisponível");
  return res.json();
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      if (i < attempts - 1) await sleep(500 * (i + 1));
    }
  }
  throw last;
}

async function getKantoSummariesOnce(): Promise<PokemonSummary[]> {
  const ids = Array.from({ length: 151 }, (_, i) => i + 1);
  const batchSize = 30;
  const results: ApiPokemon[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const slice = ids.slice(i, i + batchSize);
    const chunk = await Promise.all(
      slice.map((id) =>
        fetch(`${API}/pokemon/${id}`, {
          next: { revalidate: revalidatePokemon },
        }).then((r) => {
          if (!r.ok) throw new Error(`Falha ao buscar #${id}`);
          return r.json() as Promise<ApiPokemon>;
        })
      )
    );
    results.push(...chunk);
  }

  return results.sort((a, b) => a.id - b.id).map(mapToSummary);
}

/** Lista Kanto com retries (falhas transitórias de rede / TLS). */
export async function getKantoSummaries(): Promise<PokemonSummary[]> {
  return withRetry(() => getKantoSummariesOnce(), 3);
}

export function speciesIdFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? parseInt(m[1], 10) : 0;
}

export function flattenEvolutionChain(chain: ChainLink): {
  id: number;
  name: string;
}[] {
  const out: { id: number; name: string }[] = [];

  function walk(node: ChainLink) {
    out.push({
      id: speciesIdFromUrl(node.species.url),
      name: node.species.name,
    });
    node.evolves_to.forEach(walk);
  }

  walk(chain);
  return out;
}

export function findEvolutionNeighbors(
  chain: ChainLink,
  currentSpeciesId: number
): { prev: { id: number; name: string } | null; next: { id: number; name: string }[] } {
  function findNode(
    node: ChainLink,
    parent: ChainLink | null
  ): { node: ChainLink; parent: ChainLink | null } | null {
    if (speciesIdFromUrl(node.species.url) === currentSpeciesId) {
      return { node, parent };
    }
    for (const ev of node.evolves_to) {
      const hit = findNode(ev, node);
      if (hit) return hit;
    }
    return null;
  }

  const hit = findNode(chain, null);
  if (!hit) return { prev: null, next: [] };

  const prev = hit.parent
    ? {
        id: speciesIdFromUrl(hit.parent.species.url),
        name: hit.parent.species.name,
      }
    : null;

  const next = hit.node.evolves_to.map((ev) => ({
    id: speciesIdFromUrl(ev.species.url),
    name: ev.species.name,
  }));

  return { prev, next };
}
