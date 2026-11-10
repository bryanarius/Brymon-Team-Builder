import {
  calculate,
  Field,
  Generations,
  Move,
  Pokemon,
  toID,
  type StatID,
  type StatsTable,
} from "@smogon/calc";
import type {
  Generation,
  Specie,
  StatusName,
  TypeName,
} from "@smogon/calc/dist/data/interface";

/*
|--------------------------------------------------------------------------
| Damage Calculator Adapter
|--------------------------------------------------------------------------
|
| Brymon's adapter around @smogon/calc, the calculator behind Pokémon
| Showdown. It turns a Brymon set (PokéAPI names, builder stat keys) into
| the library's objects and its results into plain data for the page to
| render. The battle mechanics all live in the library.
|
*/

export const CALC_GENERATION = 9;

export const CALC_DEFAULT_LEVEL = 100;

export type BuilderStat =
  | "hp"
  | "attack"
  | "defense"
  | "specialAttack"
  | "specialDefense"
  | "speed";

// Form inputs hand over strings, so both are accepted.
export type BuilderStats = Partial<Record<BuilderStat, number | string>>;

/**
 * A Pokémon as the team builder stores it: PokéAPI slugs ("choice-band")
 * or the library's own names ("Choice Band"), and builder stat keys.
 */
export type BuilderSet = {
  name: string;
  level?: number;
  ability?: string;
  item?: string;
  nature?: string;
  moves?: string[];
  evs?: BuilderStats;
  ivs?: BuilderStats;
  boosts?: BuilderStats;
  teraType?: string;
  status?: StatusName | "";
};

export type FieldOptions = ConstructorParameters<typeof Field>[0];

export type MoveDamage = {
  move: string;
  type: TypeName;
  category: "Physical" | "Special" | "Status";
  minDamage: number;
  maxDamage: number;
  minPercent: number;
  maxPercent: number;
  koChance: string;
  description: string;
};

// Builder stat keys -> the library's.
export const BUILDER_STAT_TO_CALC_STAT: Record<BuilderStat, StatID> = {
  hp: "hp",
  attack: "atk",
  defense: "def",
  specialAttack: "spa",
  specialDefense: "spd",
  speed: "spe",
};

export function getCalcGeneration(): Generation {
  return Generations.get(CALC_GENERATION);
}

/*
 * Forms go through their Showdown name ("tauros-paldea-combat-breed" ->
 * "Tauros-Paldea-Combat"). PokéAPI also names some default forms where
 * Showdown doesn't ("keldeo-ordinary" is just "Keldeo"), so trailing parts
 * are dropped until a species matches.
 */
export function findCalcSpecies(
  gen: Generation,
  pokemonName: string,
): Specie | null {
  const parts = String(toShowdownSpecies(pokemonName) ?? pokemonName).split(
    "-",
  );

  while (parts.length > 0) {
    const species = gen.species.get(toID(parts.join("-")));

    if (species) {
      return species;
    }

    parts.pop();
  }

  return null;
}

type NamedTable = { get(id: ReturnType<typeof toID>): { name: string } | undefined };

/*
 * The library matches abilities, items, and natures by their exact name
 * ("Choice Band") and silently ignores anything else ("choice-band"), so
 * every slug is looked up first. Unknown or empty values become undefined.
 */
export function findCalcName(
  table: NamedTable,
  slug: string | undefined,
): string | undefined {
  return slug ? table.get(toID(slug))?.name : undefined;
}

function toCalcStats(
  builderStats: BuilderStats | undefined,
): Partial<StatsTable> | undefined {
  if (!builderStats) {
    return undefined;
  }

  const stats: Partial<StatsTable> = {};

  for (const [builderStat, calcStat] of Object.entries(
    BUILDER_STAT_TO_CALC_STAT,
  ) as [BuilderStat, StatID][]) {
    const value = builderStats[builderStat];

    if (value !== undefined) {
      stats[calcStat] = Number(value);
    }
  }

  return stats;
}

export function createCalcPokemon(gen: Generation, set: BuilderSet): Pokemon {
  const species = findCalcSpecies(gen, set.name);

  if (!species) {
    throw new Error(`Unknown Pokémon for the damage calculator: ${set.name}`);
  }

  return new Pokemon(gen, species.name, {
    level: set.level ?? CALC_DEFAULT_LEVEL,
    ability: findCalcName(gen.abilities, set.ability),
    item: findCalcName(gen.items, set.item),
    nature: findCalcName(gen.natures, set.nature),
    evs: toCalcStats(set.evs),
    ivs: toCalcStats(set.ivs),
    boosts: toCalcStats(set.boosts),
    // Looked up like the other names, so a typo can't reach the library.
    teraType: findCalcName(gen.types, set.teraType) as TypeName | undefined,
    status: set.status || undefined,
    // Protosynthesis and Quark Drive stay off without this. "auto" turns
    // them on when the game would: Booster Energy, Sun, or Electric Terrain.
    boostedStat: "auto",
  });
}

export type CalcSet<T extends BuilderSet> = Omit<
  T,
  "name" | "ability" | "item" | "nature" | "moves"
> & {
  name: string;
  ability: string;
  item: string;
  nature: string;
  moves: string[];
};

/*
 * A saved or builder set with every name swapped for the library's own
 * ("choice-band" -> "Choice Band"), for showing in the calculator's inputs.
 * Names the library doesn't know become "". Other fields pass through.
 */
export function toCalcSet<T extends BuilderSet>(
  gen: Generation,
  set: T,
): CalcSet<T> {
  return {
    ...set,
    name: findCalcSpecies(gen, set.name)?.name ?? "",
    ability: findCalcName(gen.abilities, set.ability) ?? "",
    item: findCalcName(gen.items, set.item) ?? "",
    nature: findCalcName(gen.natures, set.nature) ?? "",
    moves: (set.moves ?? []).map(
      (move) => findCalcName(gen.moves, move) ?? "",
    ),
  };
}

/*
 * One result per move: the damage range in HP and as a percent of the
 * defender's max HP, plus the library's KO chance and description.
 * Status moves and immunities come back with zero damage and no KO text.
 */
function calculateMoveDamage(
  gen: Generation,
  attacker: Pokemon,
  defender: Pokemon,
  moveSlug: string,
  field: FieldOptions,
  isCrit: boolean,
): MoveDamage | null {
  const moveName = findCalcName(gen.moves, moveSlug);

  if (!moveName) {
    return null;
  }

  const move = new Move(gen, moveName, { isCrit });
  const result = calculate(gen, attacker, defender, move, new Field(field));

  const [minDamage, maxDamage] = result.range();
  const maxHp = defender.maxHP();

  return {
    move: moveName,
    type: move.type,
    category: move.category,
    minDamage,
    maxDamage,
    minPercent: (minDamage / maxHp) * 100,
    maxPercent: (maxDamage / maxHp) * 100,
    // The library throws when describing a move that does no damage.
    koChance: maxDamage > 0 ? result.kochance().text : "",
    description: maxDamage > 0 ? result.desc() : "",
  };
}

/*
 * field: the library's Field options, e.g. { gameType: "Doubles",
 * weather: "Rain", terrain: "Electric", defenderSide: { isReflect: true } }.
 */
export function calculateDamage(
  attackerSet: BuilderSet,
  defenderSet: BuilderSet,
  field: FieldOptions = {},
  { isCrit = false }: { isCrit?: boolean } = {},
): MoveDamage[] {
  const gen = getCalcGeneration();
  const attacker = createCalcPokemon(gen, attackerSet);
  const defender = createCalcPokemon(gen, defenderSet);

  return (attackerSet.moves ?? [])
    .map((move) =>
      calculateMoveDamage(gen, attacker, defender, move, field, isCrit),
    )
    .filter((result): result is MoveDamage => result !== null);
}
