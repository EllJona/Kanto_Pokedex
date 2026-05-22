/**
 * Efeitos sonoros oficiais de Pokémon FireRed/LeafGreen (rips).
 * Mapeamento: pret/pokefirered include/constants/songs.h → firered_XXXX.wav
 */
export const FRLG_SFX = {
  /** SE_WALL_HIT (7) — pancada física / contato */
  hitPhysical: "/sfx/hit.wav",
  /** SE_M_SCRATCH (148) — golpe especial genérico */
  hitSpecial: "/sfx/hit-special.wav",
  /** SE_POKE_DEAD / SE_FAINT (16) */
  faint: "/sfx/faint.wav",
  /** SE_NOT_EFFECTIVE (12) */
  notEffective: "/sfx/not-effective.wav",
  /** SE_EFFECTIVE (13) */
  effective: "/sfx/effective.wav",
  /** SE_SUPER_EFFECTIVE (14) */
  superEffective: "/sfx/super-effective.wav",
} as const;
