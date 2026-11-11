/*
|--------------------------------------------------------------------------
| Team Analysis
|--------------------------------------------------------------------------
|
| The calculations behind the analysis panel on a saved team's page:
| shared weaknesses, immunities, type coverage, and role balance. Every
| function here takes plain data (PokéAPI responses and the team's saved
| sets) and returns plain data. Fetching and rendering live elsewhere.
|
*/

export const ATTACKING_TYPES = [
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
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof ATTACKING_TYPES)[number];

export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

/** The fields of PokéAPI's /pokemon/{id} response that the analysis reads. */
export type PokeApiPokemon = {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

type NamedResource = { name: string };

/** The fields of PokéAPI's /type/{name} response that the analysis reads. */
export type PokeApiType = {
  name: string;
  damage_relations: {
    double_damage_to: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
};

/** One saved slot, as teams/show.php embeds it ($teamPokemonData). */
export type TeamPokemon = {
  pokemonApiId: number;
  name?: string | null;
  nature?: string | null;
  ability?: string | null;
  moves?: string[];
  evs?: Partial<Record<StatName, number>>;
};

export type FindingKind = "warning" | "positive" | "neutral";

export type Finding = { kind: FindingKind; message: string };

/** A team member listed under a type or role, e.g. "weak to Rock (4×)". */
export type PokemonEntry = { name: string; multiplier?: number };

export type TypeGroup = { type: string; pokemon: PokemonEntry[] };

export function formatTypeName(typeName: string): string {
  return typeName.charAt(0).toUpperCase() + typeName.slice(1);
}

/*
|--------------------------------------------------------------------------
| Defense
|--------------------------------------------------------------------------
*/

export type TypeMultipliers = {
  name: string;
  multiplierMap: Record<PokemonType, number>;
};

/**
 * One entry per team slot (not keyed by name, so two of the same species
 * both count), including each Pokémon's ability. `details` and
 * `teamPokemon` are in slot order.
 */
export function buildTypeMultiplierMap(
  details: PokeApiPokemon[],
  teamPokemon: TeamPokemon[],
): TypeMultipliers[] {
  return details.map((pokemon, index) => {
    const types = pokemon.types.map((entry) => entry.type.name);
    const ability = teamPokemon[index]?.ability ?? "";

    return {
      name: pokemon.name,
      multiplierMap: Object.fromEntries(
        ATTACKING_TYPES.map((typeName) => [
          typeName,
          getTypeMultiplier(typeName, types, ability),
        ]),
      ) as Record<PokemonType, number>,
    };
  });
}

export type DefensiveAnalysis = {
  sharedWeaknesses: Record<PokemonType, PokemonEntry[]>;
  immunities: Record<PokemonType, PokemonEntry[]>;
};

export function analyzeTeamDefense(
  multipliers: TypeMultipliers[],
): DefensiveAnalysis {
  const sharedWeaknesses = emptyTypeRecord<PokemonEntry>();
  const immunities = emptyTypeRecord<PokemonEntry>();

  multipliers.forEach(({ name, multiplierMap }) => {
    ATTACKING_TYPES.forEach((typeName) => {
      const multiplier = multiplierMap[typeName];

      if (multiplier > 1) {
        sharedWeaknesses[typeName].push({ name, multiplier });
      }

      if (multiplier === 0) {
        immunities[typeName].push({ name, multiplier });
      }
    });
  });

  return { sharedWeaknesses, immunities };
}

/** Types that hit two or more team members super effectively, worst first. */
export function listSharedWeaknesses(analysis: DefensiveAnalysis): TypeGroup[] {
  return toSortedGroups(analysis.sharedWeaknesses, 2);
}

/** Types that at least one team member is immune to, most first. */
export function listImmunities(analysis: DefensiveAnalysis): TypeGroup[] {
  return toSortedGroups(analysis.immunities, 1);
}

export type WeaknessSeverity = {
  level: "minor" | "moderate" | "major";
  label: string;
};

export function getWeaknessSeverity(count: number): WeaknessSeverity {
  if (count >= 4) {
    return { level: "major", label: "Major" };
  }

  if (count === 3) {
    return { level: "moderate", label: "Moderate" };
  }

  return { level: "minor", label: "Minor" };
}

export type Resistance = { type: string; kind: "resist" | "immune" };

/**
 * For each attacking type, the defending types that resist it or are
 * immune to it. `allTypeData` is PokéAPI's /type response for every type.
 */
export function buildResistanceMap(
  allTypeData: PokeApiType[],
): Record<PokemonType, Resistance[]> {
  // Keyed by string so PokéAPI names outside the 18 types are skipped.
  const resistanceMap: Record<string, Resistance[]> =
    emptyTypeRecord<Resistance>();

  allTypeData.forEach((typeData) => {
    const defendingType = typeData.name;

    typeData.damage_relations.half_damage_from.forEach(({ name }) => {
      resistanceMap[name]?.push({ type: defendingType, kind: "resist" });
    });

    typeData.damage_relations.no_damage_from.forEach(({ name }) => {
      resistanceMap[name]?.push({ type: defendingType, kind: "immune" });
    });
  });

  return resistanceMap as Record<PokemonType, Resistance[]>;
}

/**
 * "Consider a pokemon that is immune (Flying) or resistant (Bug, Grass)
 * to Ground.", or null when no type helps.
 */
export function buildRecommendation(
  typeName: string,
  resistances: Resistance[] = [],
): string | null {
  const typeNamesOfKind = (kind: Resistance["kind"]) =>
    resistances
      .filter((entry) => entry.kind === kind)
      .map((entry) => formatTypeName(entry.type))
      .sort();

  const immuneTypes = typeNamesOfKind("immune");
  const resistTypes = typeNamesOfKind("resist");
  const parts: string[] = [];

  if (immuneTypes.length > 0) {
    parts.push(`immune (${immuneTypes.join(", ")})`);
  }

  if (resistTypes.length > 0) {
    parts.push(`resistant (${resistTypes.join(", ")})`);
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    `Consider a pokemon that is ${parts.join(" or ")} ` +
    `to ${formatTypeName(typeName)}.`
  );
}

/** Each type on the team and who has it, most common first. */
export function groupTeamTypes(details: PokeApiPokemon[]): TypeGroup[] {
  const typePokemonMap: Record<string, PokemonEntry[]> = {};

  details.forEach((pokemon) => {
    pokemon.types.forEach(({ type }) => {
      (typePokemonMap[type.name] ??= []).push({ name: pokemon.name });
    });
  });

  return toSortedGroups(typePokemonMap, 1);
}

export function getTeamTypeCounts(
  details: PokeApiPokemon[],
): Record<string, number> {
  const typeCounts: Record<string, number> = {};

  details.forEach((pokemon) => {
    pokemon.types.forEach(({ type }) => {
      typeCounts[type.name] = (typeCounts[type.name] ?? 0) + 1;
    });
  });

  return typeCounts;
}

/** Highest multiplier first, then alphabetical. */
export function sortPokemonEntries(pokemon: PokemonEntry[]): PokemonEntry[] {
  return pokemon.slice().sort((first, second) => {
    const firstMultiplier = first.multiplier ?? 0;
    const secondMultiplier = second.multiplier ?? 0;

    if (secondMultiplier !== firstMultiplier) {
      return secondMultiplier - firstMultiplier;
    }

    return first.name.localeCompare(second.name);
  });
}

function emptyTypeRecord<T>(): Record<PokemonType, T[]> {
  return Object.fromEntries(
    ATTACKING_TYPES.map((typeName) => [typeName, [] as T[]]),
  ) as Record<PokemonType, T[]>;
}

function toSortedGroups(
  record: Record<string, PokemonEntry[]>,
  minimumCount: number,
): TypeGroup[] {
  return Object.entries(record)
    .filter(([, pokemon]) => pokemon.length >= minimumCount)
    .sort((first, second) => second[1].length - first[1].length)
    .map(([type, pokemon]) => ({ type, pokemon }));
}

/*
|--------------------------------------------------------------------------
| Offense
|--------------------------------------------------------------------------
*/

/** Every move on the team, once each. */
export function teamMoveNames(teamPokemon: TeamPokemon[]): string[] {
  return [...new Set(teamPokemon.flatMap((pokemon) => pokemon.moves ?? []))];
}

export type TypeCoverage = { covered: string[]; gaps: PokemonType[] };

/**
 * The types the team's moves hit super effectively. `moveTypeData` is
 * PokéAPI's /type response for each type the team has a move of.
 */
export function findTypeCoverage(moveTypeData: PokeApiType[]): TypeCoverage {
  const covered = new Set<string>();

  moveTypeData.forEach((typeData) => {
    typeData.damage_relations.double_damage_to.forEach(({ name }) => {
      covered.add(name);
    });
  });

  return {
    covered: [...covered],
    gaps: ATTACKING_TYPES.filter((typeName) => !covered.has(typeName)),
  };
}

/*
|--------------------------------------------------------------------------
| Roles
|--------------------------------------------------------------------------
*/

export type Role =
  | "physical-attacker"
  | "special-attacker"
  | "wall"
  | "balanced"
  | "setup"
  | "pivot"
  | "speed-control"
  | "hazard-setter"
  | "hazard-removal"
  | "cleric"
  | "recovery";

export type SpeedTier = "fast" | "mid" | "slow";

export const ROLE_ORDER: Role[] = [
  "physical-attacker",
  "special-attacker",
  "wall",
  "balanced",
  "setup",
  "pivot",
  "speed-control",
  "hazard-setter",
  "hazard-removal",
  "cleric",
  "recovery",
];

export const ROLE_LABELS: Record<Role, string> = {
  "physical-attacker": "Physical Attacker",
  "special-attacker": "Special Attacker",
  wall: "Wall / Tank",
  balanced: "Balanced Pivot",
  setup: "Setup Sweeper",
  pivot: "Pivot",
  "speed-control": "Speed Control",
  "hazard-setter": "Hazard Setter",
  "hazard-removal": "Hazard Removal",
  cleric: "Cleric",
  recovery: "Reliable Recovery",
};

const NEUTRAL_NATURES = new Set([
  "hardy",
  "docile",
  "serious",
  "bashful",
  "quirky",
]);

const NATURE_MODIFIERS: Record<string, { plus: StatName; minus: StatName }> = {
  adamant: { plus: "attack", minus: "special-attack" },
  brave: { plus: "attack", minus: "speed" },
  lonely: { plus: "attack", minus: "defense" },
  naughty: { plus: "attack", minus: "special-defense" },
  bold: { plus: "defense", minus: "attack" },
  relaxed: { plus: "defense", minus: "speed" },
  impish: { plus: "defense", minus: "special-attack" },
  lax: { plus: "defense", minus: "special-defense" },
  modest: { plus: "special-attack", minus: "attack" },
  mild: { plus: "special-attack", minus: "defense" },
  quiet: { plus: "special-attack", minus: "speed" },
  rash: { plus: "special-attack", minus: "special-defense" },
  calm: { plus: "special-defense", minus: "attack" },
  gentle: { plus: "special-defense", minus: "defense" },
  sassy: { plus: "special-defense", minus: "speed" },
  careful: { plus: "special-defense", minus: "special-attack" },
  timid: { plus: "speed", minus: "attack" },
  hasty: { plus: "speed", minus: "defense" },
  jolly: { plus: "speed", minus: "special-attack" },
  naive: { plus: "speed", minus: "special-defense" },
};

// Moves that give a Pokémon a role on top of its stats.
const UTILITY_MOVES: Partial<Record<Role, Set<string>>> = {
  "hazard-setter": new Set([
    "stealth-rock",
    "spikes",
    "toxic-spikes",
    "sticky-web",
    "stone-axe",
    "ceaseless-edge",
  ]),
  "hazard-removal": new Set([
    "rapid-spin",
    "defog",
    "tidy-up",
    "mortal-spin",
    "court-change",
  ]),
  pivot: new Set([
    "u-turn",
    "volt-switch",
    "flip-turn",
    "teleport",
    "parting-shot",
    "baton-pass",
    "chilly-reception",
    "shed-tail",
  ]),
  "speed-control": new Set([
    "tailwind",
    "trick-room",
    "thunder-wave",
    "icy-wind",
    "electroweb",
    "glare",
    "nuzzle",
    "bulldoze",
    "scary-face",
    "sticky-web",
  ]),
  cleric: new Set([
    "wish",
    "heal-bell",
    "aromatherapy",
    "healing-wish",
    "lunar-dance",
    "jungle-healing",
    "life-dew",
    "floral-healing",
  ]),
  setup: new Set([
    "swords-dance",
    "dragon-dance",
    "nasty-plot",
    "calm-mind",
    "quiver-dance",
    "bulk-up",
    "coil",
    "shift-gear",
    "agility",
    "rock-polish",
    "autotomize",
    "work-up",
    "hone-claws",
    "victory-dance",
    "no-retreat",
    "clangorous-soul",
    "geomancy",
    "tail-glow",
    "shell-smash",
    "belly-drum",
    "fillet-away",
    "take-heart",
    "growth",
    "curse",
  ]),
  recovery: new Set([
    "recover",
    "roost",
    "slack-off",
    "soft-boiled",
    "synthesis",
    "moonlight",
    "morning-sun",
    "milk-drink",
    "shore-up",
    "strength-sap",
    "rest",
  ]),
};

function getBaseStats(details: PokeApiPokemon): Record<string, number> {
  return Object.fromEntries(
    details.stats.map((entry) => [entry.stat.name, entry.base_stat]),
  );
}

export function natureStatMultiplier(
  nature: string,
  statName: StatName,
): number {
  if (!nature || NEUTRAL_NATURES.has(nature)) {
    return 1;
  }

  const modifier = NATURE_MODIFIERS[nature];

  if (modifier?.plus === statName) {
    return 1.1;
  }

  if (modifier?.minus === statName) {
    return 0.9;
  }

  return 1;
}

/*
 * A rough level-100 stat (31 IVs) for comparing a Pokémon's offense with
 * its bulk. It doesn't need to match the in-game number exactly.
 */
function effectiveStat(
  baseStat: number | undefined,
  ev: number | undefined,
  multiplier: number,
): number {
  return (2 * (baseStat ?? 0) + 31 + Math.floor((ev ?? 0) / 4)) * multiplier;
}

export type Classification = { roles: Role[]; speed: SpeedTier };

export function classifyPokemon(
  details: PokeApiPokemon,
  config: TeamPokemon,
): Classification {
  const base = getBaseStats(details);
  const nature = (config.nature ?? "").toLowerCase();
  const evs = config.evs ?? {};

  const stat = (statName: StatName) =>
    effectiveStat(
      base[statName],
      evs[statName],
      natureStatMultiplier(nature, statName),
    );

  const attack = stat("attack");
  const specialAttack = stat("special-attack");
  const hp = stat("hp");
  const defense = stat("defense");
  const specialDefense = stat("special-defense");

  const offense = Math.max(attack, specialAttack);
  const bulk = (hp + defense + specialDefense) / 3;
  const ratio = bulk === 0 ? 1 : offense / bulk;

  const roles = new Set<Role>();

  if (ratio >= 1.08) {
    roles.add(
      attack >= specialAttack ? "physical-attacker" : "special-attacker",
    );
  } else if (ratio <= 0.92) {
    roles.add("wall");
  } else {
    roles.add("balanced");
  }

  const baseSpeed = base.speed ?? 0;
  const speedInvested =
    (evs.speed ?? 0) >= 200 || natureStatMultiplier(nature, "speed") > 1;

  let speed: SpeedTier = "mid";

  if (baseSpeed >= 100 || (baseSpeed >= 80 && speedInvested)) {
    speed = "fast";
  } else if (baseSpeed <= 55 && !speedInvested) {
    speed = "slow";
  }

  (config.moves ?? []).forEach((moveName) => {
    const move = String(moveName).toLowerCase();

    Object.entries(UTILITY_MOVES).forEach(([role, moveSet]) => {
      if (moveSet.has(move)) {
        roles.add(role as Role);
      }
    });
  });

  return { roles: [...roles], speed };
}

export type RoleBalance = {
  roleMembers: Record<Role, PokemonEntry[]>;
  findings: Finding[];
  teamSize: number;
};

export function computeRoleBalance(
  details: PokeApiPokemon[],
  teamPokemon: TeamPokemon[],
): RoleBalance {
  const detailsById = new Map(details.map((entry) => [entry.id, entry]));

  const configs: TeamPokemon[] =
    teamPokemon.length > 0
      ? teamPokemon
      : details.map((entry) => ({
          pokemonApiId: entry.id,
          name: entry.name,
          nature: null,
          evs: {},
          moves: [],
        }));

  const perPokemon = configs.map((config) => {
    const pokemonDetails = detailsById.get(config.pokemonApiId);
    const name =
      config.name || pokemonDetails?.name || `#${config.pokemonApiId}`;

    if (!pokemonDetails) {
      return { name, roles: [] as Role[], speed: "mid" as SpeedTier };
    }

    return { name, ...classifyPokemon(pokemonDetails, config) };
  });

  const roleMembers = Object.fromEntries(
    ROLE_ORDER.map((role) => [role, [] as PokemonEntry[]]),
  ) as Record<Role, PokemonEntry[]>;

  perPokemon.forEach((entry) => {
    entry.roles.forEach((role) => {
      roleMembers[role].push({ name: entry.name });
    });
  });

  const speeds = perPokemon.map((entry) => entry.speed);

  return {
    roleMembers,
    findings: buildRoleFindings(roleMembers, speeds, perPokemon.length),
    teamSize: perPokemon.length,
  };
}

export function buildRoleFindings(
  roleMembers: Record<Role, PokemonEntry[]>,
  speeds: SpeedTier[],
  teamSize: number,
): Finding[] {
  const count = (role: Role) => roleMembers[role].length;
  const findings: Finding[] = [];

  const physical = count("physical-attacker");
  const special = count("special-attacker");
  const walls = count("wall");

  if (teamSize >= 4 && physical >= teamSize - 1 && special === 0) {
    findings.push({
      kind: "warning",
      message:
        `${physical} of ${teamSize} Pokémon are physical attackers ` +
        `and none are special — a single physical wall can check ` +
        `most of the team.`,
    });
  } else if (teamSize >= 4 && special >= teamSize - 1 && physical === 0) {
    findings.push({
      kind: "warning",
      message:
        `${special} of ${teamSize} Pokémon are special attackers ` +
        `and none are physical — a single special wall can check ` +
        `most of the team.`,
    });
  } else if (physical > 0 && special > 0) {
    findings.push({
      kind: "positive",
      message:
        `Offense is split across ${physical} physical and ` +
        `${special} special ` +
        `${special === 1 ? "attacker" : "attackers"}, ` +
        `which is harder to wall.`,
    });
  }

  if (teamSize >= 5 && walls === 0) {
    findings.push({
      kind: "warning",
      message:
        "No defensive walls — nothing on the team can switch into " +
        "strong attackers repeatedly.",
    });
  }

  if (count("hazard-removal") === 0) {
    findings.push({
      kind: "warning",
      message:
        "No hazard removal (Rapid Spin / Defog) — entry hazards will " +
        "chip the team on every switch-in.",
    });
  }

  if (count("hazard-setter") > 0) {
    findings.push({
      kind: "positive",
      message: `${count("hazard-setter")} Pokémon can set entry hazards.`,
    });
  }

  const fast = speeds.filter((tier) => tier === "fast").length;
  const slow = speeds.filter((tier) => tier === "slow").length;

  if (count("speed-control") === 0 && fast <= 1 && slow >= 3) {
    findings.push({
      kind: "warning",
      message:
        `${slow} Pokémon are slow and the team has no speed control ` +
        `(Tailwind, Trick Room, paralysis) — faster teams move first.`,
    });
  }

  if (count("pivot") === 0 && teamSize >= 5) {
    findings.push({
      kind: "neutral",
      message:
        "No pivoting moves (U-turn, Volt Switch) — it will be harder " +
        "to bring threats in safely.",
    });
  }

  if (findings.length === 0) {
    findings.push({
      kind: "positive",
      message: "The team has a well-rounded spread of roles.",
    });
  }

  return findings;
}

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

/**
 * The bullet points at the top of the panel: the worst shared weaknesses,
 * the most useful immunities, type variety, and the biggest role warnings.
 */
export function buildTeamSummary(
  analysis: DefensiveAnalysis,
  details: PokeApiPokemon[],
  roleFindings: Finding[] = [],
): Finding[] {
  const findings: Finding[] = [];

  listSharedWeaknesses(analysis)
    .slice(0, 3)
    .forEach(({ type, pokemon }) => {
      const severity = getWeaknessSeverity(pokemon.length);

      findings.push({
        kind: "warning",
        message:
          `${formatTypeName(type)} is a ` +
          `${severity.label.toLowerCase()} shared weakness ` +
          `for ${pokemon.length} Pokémon.`,
      });
    });

  listImmunities(analysis)
    .slice(0, 2)
    .forEach(({ type, pokemon }) => {
      const count = pokemon.length;

      findings.push({
        kind: "positive",
        message:
          `${count} ${count === 1 ? "Pokémon is" : "Pokémon are"} ` +
          `immune to ${formatTypeName(type)}.`,
      });
    });

  const typeCounts = getTeamTypeCounts(details);
  const mostCommonType = Object.entries(typeCounts).sort(
    (first, second) => second[1] - first[1],
  )[0];

  if (mostCommonType) {
    const [typeName, count] = mostCommonType;

    findings.push(
      count > 1
        ? {
            kind: "neutral",
            message:
              `${formatTypeName(typeName)} is the team’s most ` +
              `common type, appearing on ${count} Pokémon.`,
          }
        : {
            kind: "positive",
            message:
              `The team has strong type diversity with ` +
              `${Object.keys(typeCounts).length} unique types.`,
          },
    );
  }

  roleFindings
    .filter((finding) => finding.kind === "warning")
    .slice(0, 2)
    .forEach((finding) => {
      findings.push({ kind: "warning", message: finding.message });
    });

  if (findings.length === 0) {
    findings.push({
      kind: "positive",
      message: "No major defensive concerns were found.",
    });
  }

  return findings;
}
