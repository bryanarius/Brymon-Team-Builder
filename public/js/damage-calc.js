"use strict";

/*
 * Brymon's adapter around @smogon/calc (public/vendor/smogon-calc), the
 * calculator behind Pokémon Showdown. It turns a Brymon set (PokéAPI names,
 * builder stat keys) into the library's objects and its results into plain
 * data for the page to render. The battle mechanics all live in the library.
 */

const CALC_GENERATION = 9;

const CALC_DEFAULT_LEVEL = 100;

// Builder stat keys -> the library's.
const BUILDER_STAT_TO_CALC_STAT = {
  hp: "hp",
  attack: "atk",
  defense: "def",
  specialAttack: "spa",
  specialDefense: "spd",
  speed: "spe",
};

function getCalcGeneration() {
  return calc.Generations.get(CALC_GENERATION);
}

/*
 * Forms go through their Showdown name ("tauros-paldea-combat-breed" ->
 * "Tauros-Paldea-Combat"). PokéAPI also names some default forms where
 * Showdown doesn't ("keldeo-ordinary" is just "Keldeo"), so trailing parts
 * are dropped until a species matches.
 */
function findCalcSpecies(gen, pokemonName) {
  const parts = String(toShowdownSpecies(pokemonName) ?? pokemonName).split(
    "-",
  );

  while (parts.length > 0) {
    const species = gen.species.get(calc.toID(parts.join("-")));

    if (species) {
      return species;
    }

    parts.pop();
  }

  return null;
}

/*
 * The library matches abilities, items, and natures by their exact name
 * ("Choice Band") and silently ignores anything else ("choice-band"), so
 * every slug is looked up first. Unknown or empty values become undefined.
 */
function findCalcName(table, slug) {
  return slug ? table.get(calc.toID(slug))?.name : undefined;
}

function toCalcStats(builderStats) {
  if (!builderStats) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(BUILDER_STAT_TO_CALC_STAT)
      .filter(([builderStat]) => builderStats[builderStat] !== undefined)
      .map(([builderStat, calcStat]) => [
        calcStat,
        Number(builderStats[builderStat]),
      ]),
  );
}

/*
 * set: { name, level, ability, item, nature, evs, ivs, boosts, teraType }
 * with PokéAPI slugs and builder stat keys, as the team builder stores them.
 */
function createCalcPokemon(gen, set) {
  const species = findCalcSpecies(gen, set.name);

  if (!species) {
    throw new Error(`Unknown Pokémon for the damage calculator: ${set.name}`);
  }

  return new calc.Pokemon(gen, species.name, {
    level: set.level ?? CALC_DEFAULT_LEVEL,
    ability: findCalcName(gen.abilities, set.ability),
    item: findCalcName(gen.items, set.item),
    nature: findCalcName(gen.natures, set.nature),
    evs: toCalcStats(set.evs),
    ivs: toCalcStats(set.ivs),
    boosts: toCalcStats(set.boosts),
    teraType: set.teraType ? capitalizeHyphenatedWords(set.teraType) : undefined,
  });
}

/*
 * One result per move: the damage range in HP and as a percent of the
 * defender's max HP, plus the library's KO chance and description.
 * Status moves and immunities come back with zero damage and no KO text.
 */
function calculateMoveDamage(gen, attacker, defender, moveSlug, field) {
  const moveName = findCalcName(gen.moves, moveSlug);

  if (!moveName) {
    return null;
  }

  const move = new calc.Move(gen, moveName);
  const result = calc.calculate(
    gen,
    attacker,
    defender,
    move,
    new calc.Field(field ?? {}),
  );

  const [minDamage, maxDamage] = result.range();
  const maxHp = defender.maxHP();

  return {
    move: moveName,
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

function calculateDamage(attackerSet, defenderSet, field = {}) {
  const gen = getCalcGeneration();
  const attacker = createCalcPokemon(gen, attackerSet);
  const defender = createCalcPokemon(gen, defenderSet);

  return (attackerSet.moves ?? [])
    .map((move) => calculateMoveDamage(gen, attacker, defender, move, field))
    .filter(Boolean);
}
