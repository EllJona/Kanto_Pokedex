/** Trilhas Pokémon (Showdown CDN) — fallback se não houver MP3 em public/audio/. */
export const SHOWDOWN_AUDIO_BASE =
  "https://play.pokemonshowdown.com/audio" as const;

export const POKEMON_BGM = {
  /** Pokédex / home — tema calmo (Centro Pokémon / rival DPP). */
  dex: {
    local: "/audio/dex-ambient.mp3",
    remote: [
      `${SHOWDOWN_AUDIO_BASE}/xy-rival.mp3`,
      `${SHOWDOWN_AUDIO_BASE}/dpp-rival.mp3`,
    ],
  },
  /** Aba batalha — escolha de equipa (rival DPP). */
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
