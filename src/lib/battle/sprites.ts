const GH =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii";

export function frlgFrontUrl(id: number): string {
  return `${GH}/firered-leafgreen/${id}.png`;
}

export function frlgBackUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;
}

export function emeraldBackUrl(id: number): string {
  return `${GH}/emerald/back/${id}.png`;
}
