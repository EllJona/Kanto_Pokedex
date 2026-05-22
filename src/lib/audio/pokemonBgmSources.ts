/** Trilhas Pokémon (Showdown CDN) — fallback se não houver MP3 em public/. */
export const SHOWDOWN_AUDIO_BASE =
  "https://play.pokemonshowdown.com/audio" as const;

export const POKEMON_BGM = {
  /** Pokédex / home — líder de ginásio Kanto (BW2). */
  dex: {
    local: "/audio/dex-ambient.mp3",
    remote: `${SHOWDOWN_AUDIO_BASE}/bw2-kanto-gym-leader.mp3`,
  },
  /** Aba batalha — escolha de equipa (rival DPP, mais calmo). */
  battleMenu: {
    local: "/audio/battle-gba-theme.mp3",
    remote: `${SHOWDOWN_AUDIO_BASE}/dpp-rival.mp3`,
  },
  /** Durante o combate GBA. */
  battleFight: {
    local: "/battle/trainer-battle.mp3",
    remote: `${SHOWDOWN_AUDIO_BASE}/hgss-kanto-trainer.mp3`,
  },
} as const;
