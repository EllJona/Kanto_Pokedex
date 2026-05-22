/** Tipos Gen I (sem Steel/Dark/Fairy). Multiplicador ataque→defesa único. */
const ORDER = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
] as const;

/** Linha = tipo do movimento, coluna = tipo defensor (parcial). */
const MATRIX: number[][] = [
  //       N  F  W  E  G  I Fi Po G Fl Ps Bu R Gh D
  /* N */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 0, 1],
  /* F */ [1, 0.5, 0.5, 1, 2, 2, 1, 1, 1, 1, 1, 2, 0.5, 1, 0.5],
  /* W */ [1, 2, 0.5, 1, 0.5, 1, 1, 1, 2, 1, 1, 1, 2, 1, 0.5],
  /* E */ [1, 1, 2, 0.5, 0.5, 1, 1, 1, 0, 2, 1, 1, 1, 1, 0.5],
  /* G */ [1, 0.5, 2, 0.5, 0.5, 1, 1, 0.5, 2, 0.5, 1, 0.5, 2, 1, 0.5],
  /* I */ [1, 0.5, 0.5, 1, 2, 0.5, 1, 1, 2, 2, 1, 1, 1, 1, 2],
  /*Fi*/ [2, 1, 1, 1, 1, 2, 1, 0.5, 1, 0.5, 0.5, 0.5, 2, 0, 1],
  /* P */ [1, 1, 1, 1, 2, 1, 1, 0.5, 0.5, 1, 1, 1, 0.5, 0.5, 1],
  /* G */ [1, 2, 1, 0, 2, 1, 1, 2, 1, 0, 1, 0.5, 2, 1, 1],
  /*Fl*/ [1, 1, 1, 0.5, 2, 1, 2, 1, 1, 1, 1, 2, 0.5, 1, 1],
  /*Ps*/ [1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 0.5, 1, 1, 1, 1],
  /* B */ [1, 0.5, 1, 1, 2, 1, 0.5, 0.5, 1, 0.5, 2, 1, 1, 0.5, 1],
  /* R */ [1, 2, 1, 1, 1, 2, 0.5, 1, 0.5, 2, 1, 2, 1, 1, 1],
  /*Gh*/ [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1],
  /* D */ [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
];

function idx(t: string): number {
  const i = ORDER.indexOf(t as (typeof ORDER)[number]);
  return i >= 0 ? i : -1;
}

/** Multiplicador combinado (Gen I: produto nos dois tipos). */
export function typeMultiplier(moveType: string, defenderTypes: string[]): number {
  const mt = moveType.toLowerCase();
  const ia = idx(mt);
  if (ia < 0) return 1;
  let m = 1;
  for (const d of defenderTypes) {
    const j = idx(d.toLowerCase());
    if (j < 0) continue;
    m *= MATRIX[ia][j];
  }
  return m;
}

export function effectivenessLabel(mult: number): "super" | "resisted" | "immune" | "normal" {
  if (mult === 0) return "immune";
  if (mult > 1) return "super";
  if (mult < 1) return "resisted";
  return "normal";
}
