import { toID } from "@smogon/calc";
import type { Generation, Nature } from "@smogon/calc/dist/data/interface";
import { getCalcGeneration, type BuilderStat } from "./damage-calc";

/*
|--------------------------------------------------------------------------
| Calculator Data
|--------------------------------------------------------------------------
|
| Option lists and labels the calculator's inputs show. Built once, when
| the page loads, from the library's Gen 9 data.
|
*/

export const gen: Generation = getCalcGeneration();

export const STATS: BuilderStat[] = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
];

export const STAT_LABELS: Record<BuilderStat, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  specialAttack: "SpA",
  specialDefense: "SpD",
  speed: "Spe",
};

const NATURE_STAT_LABELS: Record<string, string> = {
  atk: "Atk",
  def: "Def",
  spa: "SpA",
  spd: "SpD",
  spe: "Spe",
};

export const speciesNames = [...gen.species].map((species) => species.name);

export const abilityNames = [...gen.abilities].map((ability) => ability.name);

export const itemNames = [...gen.items].map((item) => item.name);

// Max Moves and Z-Moves aren't in Scarlet and Violet.
export const moveNames = [...gen.moves]
  .filter((move) => !move.isMax && !move.isZ && move.name !== "(No Move)")
  .map((move) => move.name);

export const natures: Nature[] = [...gen.natures].sort((first, second) =>
  first.name.localeCompare(second.name),
);

export const TERA_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting",
  "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost",
  "Dragon", "Dark", "Steel", "Fairy", "Stellar",
] as const;

export const STATUSES = [
  ["", "Healthy"],
  ["brn", "Burned"],
  ["par", "Paralyzed"],
  ["psn", "Poisoned"],
  ["tox", "Badly poisoned"],
  ["slp", "Asleep"],
  ["frz", "Frozen"],
] as const;

// +6 down to −6.
export const BOOST_LEVELS = Array.from({ length: 13 }, (_, index) => 6 - index);

/*
 * The library's data lists only one ability per Pokémon (Kingambit:
 * Defiant, not Supreme Overlord), so any ability can be picked, as on
 * Showdown's calculator. Choosing a Pokémon starts from that one.
 */
export function getDefaultAbility(speciesName: string): string {
  return gen.species.get(toID(speciesName))?.abilities?.[0] ?? "";
}

/*
|--------------------------------------------------------------------------
| Labels
|--------------------------------------------------------------------------
*/

// "Samurott-Hisui" -> "Hisuian Samurott", the name the rest of Brymon uses.
export function getCalcDisplayName(calcName: string): string {
  return calcName
    ? formatPokemonDisplayName(
        fromShowdownSpecies(normalizeShowdownName(calcName)),
      )
    : "";
}

// "Adamant (+Atk, −SpA)", or "Hardy (neutral)".
export function formatNatureLabel(nature: Nature): string {
  if (!nature.plus || !nature.minus || nature.plus === nature.minus) {
    return `${nature.name} (neutral)`;
  }

  return (
    `${nature.name} (+${NATURE_STAT_LABELS[nature.plus]}, ` +
    `−${NATURE_STAT_LABELS[nature.minus]})`
  );
}

export function formatBoost(boost: number): string {
  if (boost > 0) {
    return `+${boost}`;
  }

  return boost < 0 ? `−${Math.abs(boost)}` : "0";
}

// Rounded down to one decimal, matching the library's description text.
export function formatCalcPercent(percent: number): string {
  return `${(Math.floor(percent * 10) / 10).toFixed(1)}%`;
}

export function capitalizeFirst(text: string): string {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
