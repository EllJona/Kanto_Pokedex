import { BattlePageClient } from "@/components/battle/BattlePageClient";
import { getKantoSummaries } from "@/lib/pokeapi";

export const dynamic = "force-dynamic";

export default async function BattlePage() {
  let summaries: Awaited<ReturnType<typeof getKantoSummaries>> = [];
  let loadError: string | null = null;
  try {
    summaries = await getKantoSummaries();
  } catch {
    loadError =
      "Não foi possível carregar a lista de Pokémon. Verifique a conexão.";
  }

  return (
    <BattlePageClient initialSummaries={summaries} loadError={loadError} />
  );
}
