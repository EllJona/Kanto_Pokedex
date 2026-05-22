export type DamageCategory = "physical" | "special";

export type MoveDef = {
  id: string;
  name: string;
  type: string;
  power: number;
  pp: number;
  category: DamageCategory;
};

export const MOVES: Record<string, MoveDef> = {
  tackle: {
    id: "tackle",
    name: "TACKLE",
    type: "normal",
    power: 35,
    pp: 35,
    category: "physical",
  },
  growl: {
    id: "growl",
    name: "GROWL",
    type: "normal",
    power: 0,
    pp: 40,
    category: "physical",
  },
  scratch: {
    id: "scratch",
    name: "SCRATCH",
    type: "normal",
    power: 40,
    pp: 35,
    category: "physical",
  },
  ember: {
    id: "ember",
    name: "EMBER",
    type: "fire",
    power: 40,
    pp: 25,
    category: "special",
  },
  flamethrower: {
    id: "flamethrower",
    name: "FLAMETHROWER",
    type: "fire",
    power: 95,
    pp: 15,
    category: "special",
  },
  water_gun: {
    id: "water_gun",
    name: "WATER GUN",
    type: "water",
    power: 40,
    pp: 25,
    category: "special",
  },
  bubble: {
    id: "bubble",
    name: "BUBBLE",
    type: "water",
    power: 20,
    pp: 30,
    category: "special",
  },
  thunder_shock: {
    id: "thunder_shock",
    name: "THUNDER SHOCK",
    type: "electric",
    power: 40,
    pp: 30,
    category: "special",
  },
  quick_attack: {
    id: "quick_attack",
    name: "QUICK ATTACK",
    type: "normal",
    power: 40,
    pp: 30,
    category: "physical",
  },
  vine_whip: {
    id: "vine_whip",
    name: "VINE WHIP",
    type: "grass",
    power: 35,
    pp: 10,
    category: "physical",
  },
  razor_leaf: {
    id: "razor_leaf",
    name: "RAZOR LEAF",
    type: "grass",
    power: 55,
    pp: 25,
    category: "physical",
  },
  leech_seed: {
    id: "leech_seed",
    name: "LEECH SEED",
    type: "grass",
    power: 20,
    pp: 10,
    category: "physical",
  },
  acid: {
    id: "acid",
    name: "ACID",
    type: "poison",
    power: 40,
    pp: 30,
    category: "special",
  },
  sludge: {
    id: "sludge",
    name: "SLUDGE",
    type: "poison",
    power: 65,
    pp: 20,
    category: "physical",
  },
  peck: {
    id: "peck",
    name: "PECK",
    type: "flying",
    power: 35,
    pp: 35,
    category: "physical",
  },
  gust: {
    id: "gust",
    name: "GUST",
    type: "flying",
    power: 40,
    pp: 35,
    category: "special",
  },
  confusion: {
    id: "confusion",
    name: "CONFUSION",
    type: "psychic",
    power: 50,
    pp: 25,
    category: "special",
  },
  psybeam: {
    id: "psybeam",
    name: "PSYBEAM",
    type: "psychic",
    power: 65,
    pp: 20,
    category: "special",
  },
  rock_throw: {
    id: "rock_throw",
    name: "ROCK THROW",
    type: "rock",
    power: 50,
    pp: 15,
    category: "physical",
  },
  dig: {
    id: "dig",
    name: "DIG",
    type: "ground",
    power: 60,
    pp: 10,
    category: "physical",
  },
  bite: {
    id: "bite",
    name: "BITE",
    type: "normal",
    power: 60,
    pp: 25,
    category: "physical",
  },
  mega_punch: {
    id: "mega_punch",
    name: "MEGA PUNCH",
    type: "normal",
    power: 80,
    pp: 20,
    category: "physical",
  },
  ice_beam: {
    id: "ice_beam",
    name: "ICE BEAM",
    type: "ice",
    power: 95,
    pp: 10,
    category: "special",
  },
  thunderbolt: {
    id: "thunderbolt",
    name: "THUNDERBOLT",
    type: "electric",
    power: 95,
    pp: 15,
    category: "special",
  },
  body_slam: {
    id: "body_slam",
    name: "BODY SLAM",
    type: "normal",
    power: 85,
    pp: 15,
    category: "physical",
  },
  hyper_beam: {
    id: "hyper_beam",
    name: "HYPER BEAM",
    type: "normal",
    power: 150,
    pp: 5,
    category: "physical",
  },
  karate_chop: {
    id: "karate_chop",
    name: "KARATE CHOP",
    type: "fighting",
    power: 50,
    pp: 25,
    category: "physical",
  },
  low_kick: {
    id: "low_kick",
    name: "LOW KICK",
    type: "fighting",
    power: 50,
    pp: 20,
    category: "physical",
  },
  pin_missile: {
    id: "pin_missile",
    name: "PIN MISSILE",
    type: "bug",
    power: 25,
    pp: 20,
    category: "physical",
  },
  string_shot: {
    id: "string_shot",
    name: "STRING SHOT",
    type: "bug",
    power: 0,
    pp: 40,
    category: "physical",
  },
  dragon_rage: {
    id: "dragon_rage",
    name: "DRAGON RAGE",
    type: "dragon",
    power: 40,
    pp: 10,
    category: "special",
  },
  lick: {
    id: "lick",
    name: "LICK",
    type: "ghost",
    power: 20,
    pp: 30,
    category: "physical",
  },
  wing_attack: {
    id: "wing_attack",
    name: "WING ATTACK",
    type: "flying",
    power: 60,
    pp: 35,
    category: "physical",
  },
  steel_wing: {
    id: "steel_wing",
    name: "STEEL WING",
    type: "steel",
    power: 70,
    pp: 25,
    category: "physical",
  },
  slam: {
    id: "slam",
    name: "SLAM",
    type: "normal",
    power: 80,
    pp: 20,
    category: "physical",
  },
  tail_whip: {
    id: "tail_whip",
    name: "TAIL WHIP",
    type: "normal",
    power: 0,
    pp: 30,
    category: "physical",
  },
  sand_attack: {
    id: "sand_attack",
    name: "SAND-ATTACK",
    type: "ground",
    power: 0,
    pp: 15,
    category: "physical",
  },
  sing: {
    id: "sing",
    name: "SING",
    type: "normal",
    power: 0,
    pp: 15,
    category: "physical",
  },
  pound: {
    id: "pound",
    name: "POUND",
    type: "normal",
    power: 40,
    pp: 35,
    category: "physical",
  },
  double_slap: {
    id: "double_slap",
    name: "DOUBLESLAP",
    type: "normal",
    power: 15,
    pp: 10,
    category: "physical",
  },
};

/** Gen I não tem Steel ofensivo “clássico”; se aparecer, trata como normal para multiplicador. */
export function resolveMoveTypeForChart(moveType: string): string {
  if (moveType === "steel") return "normal";
  return moveType;
}

export function pickMoveset(speciesId: number, types: string[]): MoveDef[] {
  const primary = types[0] ?? "normal";
  const bySpecies: Record<number, string[]> = {
    1: ["tackle", "growl", "vine_whip", "leech_seed"],
    4: ["scratch", "growl", "ember", "leech_seed"],
    7: ["tackle", "tail_whip", "bubble", "water_gun"],
    25: ["thunder_shock", "growl", "quick_attack", "thunderbolt"],
    26: ["thunder_shock", "quick_attack", "slam", "thunderbolt"],
    39: ["sing", "pound", "double_slap", "body_slam"],
    133: ["tackle", "sand_attack", "quick_attack", "bite"],
  };

  const keys = bySpecies[speciesId];
  if (keys) {
    return keys
      .map((k) => MOVES[k as keyof typeof MOVES])
      .filter((m): m is MoveDef => Boolean(m));
  }

  return defaultMovesByPrimary(primary);
}

function defaultMovesByPrimary(primary: string): MoveDef[] {
  const p = primary.toLowerCase();
  const pools: Record<string, string[]> = {
    electric: ["thunder_shock", "quick_attack", "thunderbolt", "tackle"],
    grass: ["vine_whip", "razor_leaf", "leech_seed", "tackle"],
    poison: ["acid", "sludge", "tackle", "bite"],
    fire: ["ember", "flamethrower", "scratch", "tackle"],
    water: ["water_gun", "bubble", "tackle", "body_slam"],
    normal: ["tackle", "quick_attack", "bite", "body_slam"],
    flying: ["peck", "gust", "wing_attack", "quick_attack"],
    psychic: ["confusion", "psybeam", "tackle", "body_slam"],
    bug: ["pin_missile", "string_shot", "tackle", "bite"],
    rock: ["rock_throw", "tackle", "body_slam", "dig"],
    ground: ["dig", "tackle", "rock_throw", "body_slam"],
    fighting: ["karate_chop", "low_kick", "mega_punch", "body_slam"],
    ice: ["ice_beam", "body_slam", "tackle", "bite"],
    dragon: ["dragon_rage", "body_slam", "tackle", "bite"],
    ghost: ["lick", "confusion", "tackle", "bite"],
  };
  const ids = pools[p] ?? ["tackle", "quick_attack", "bite", "body_slam"];
  return ids
    .map((id) => MOVES[id as keyof typeof MOVES])
    .filter((m): m is MoveDef => Boolean(m));
}
