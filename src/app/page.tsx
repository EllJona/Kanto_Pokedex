import { PokedexExperience } from "@/components/PokedexExperience";
import { getKantoSummaries } from "@/lib/pokeapi";

export const dynamic = "force-dynamic";
export const revalidate = 86_400;

export default async function Home() {
  let pokemon: Awaited<ReturnType<typeof getKantoSummaries>> = [];
  let loadError: string | null = null;

  try {
    pokemon = await getKantoSummaries();
  } catch (err) {
    console.error("[Home] getKantoSummaries", err);
    const msg = err instanceof Error ? err.message : String(err);
    const looksNetwork =
      /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|network/i.test(msg);
    loadError = looksNetwork
      ? "Não foi possível conectar à PokéAPI. Confira sua internet, VPN ou firewall e tente de novo."
      : "Não foi possível carregar os Pokémon agora. Tente novamente em instantes.";
  }

  return (
    <PokedexExperience initialPokemon={pokemon} loadError={loadError} />
  );
}
