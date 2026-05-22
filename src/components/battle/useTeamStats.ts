"use client";

import { useEffect, useState } from "react";
import { fetchPokemonClient, type PokemonSummary } from "@/lib/pokeapi";
import type { ApiPokemon } from "@/lib/pokeapi";

export function useTeamStats(team: (PokemonSummary | null)[]) {
  const [stats, setStats] = useState<ApiPokemon[]>([]);
  const [loading, setLoading] = useState(false);

  const memberIds = team
    .filter((s): s is PokemonSummary => s !== null)
    .map((s) => s.id);
  const idsKey = memberIds.join(",");

  useEffect(() => {
    const members = team.filter((s): s is PokemonSummary => s !== null);
    if (!members.length) {
      setStats([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void Promise.all(members.map((m) => fetchPokemonClient(m.id)))
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- idsKey deriva de team
  }, [idsKey]);

  return { stats, loading };
}
