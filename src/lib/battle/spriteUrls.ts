const GH3 =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii";
const GH4 =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv";
const GH =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

/**
 * Costas do jogador.
 * FRLG/RS (64×64) vêm cortados na API (ex.: Venusaur sem a base).
 * Prioridade: sprites 96×96 / Gen IV com corpo inteiro → GBA só como fallback.
 */
export function playerBackSpriteUrls(id: number): string[] {
  return [
    `${GH}/back/${id}.png`,
    `${GH4}/heartgold-soulsilver/back/${id}.png`,
    `${GH4}/diamond-pearl/back/${id}.png`,
    `${GH3}/firered-leafgreen/back/${id}.png`,
    `${GH3}/ruby-sapphire/back/${id}.png`,
  ];
}

/** Frente do oponente: FRLG → Emerald → RS. */
export function foeFrontSpriteUrls(id: number): string[] {
  return [
    `${GH3}/firered-leafgreen/${id}.png`,
    `${GH3}/emerald/${id}.png`,
    `${GH3}/ruby-sapphire/${id}.png`,
  ];
}

/** Mini ícones da faixa de time (frente pequena). */
export function miniFrontSpriteUrls(id: number): string[] {
  return foeFrontSpriteUrls(id);
}
