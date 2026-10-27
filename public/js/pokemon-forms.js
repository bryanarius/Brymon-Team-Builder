"use strict";

/*
 * Alternate Pokémon forms (shared by the team builder and team analysis).
 *
 * PokéAPI stores alternate forms as separate Pokémon resources (ids above
 * 10000) named "<species>-<region>[-<variant>]", e.g. "samurott-hisui" or
 * "tauros-paldea-combat-breed". The national dex list the builder loads
 * (ids 1-1025) only contains each species' default form, so forms have to
 * be opted in here.
 *
 * The list is explicit rather than pattern-matched so that nothing PokéAPI
 * adds later shows up in the builder unreviewed. Battle-only forms (e.g.
 * "darmanitan-galar-zen") and non-standard ones (totems, cap Pikachu) are
 * deliberately left out.
 */
const SELECTABLE_POKEMON_FORMS = new Set([
  // Alola
  "rattata-alola",
  "raticate-alola",
  "raichu-alola",
  "sandshrew-alola",
  "sandslash-alola",
  "vulpix-alola",
  "ninetales-alola",
  "diglett-alola",
  "dugtrio-alola",
  "meowth-alola",
  "persian-alola",
  "geodude-alola",
  "graveler-alola",
  "golem-alola",
  "grimer-alola",
  "muk-alola",
  "exeggutor-alola",
  "marowak-alola",

  // Galar
  "meowth-galar",
  "ponyta-galar",
  "rapidash-galar",
  "slowpoke-galar",
  "slowbro-galar",
  "farfetchd-galar",
  "weezing-galar",
  "mr-mime-galar",
  "articuno-galar",
  "zapdos-galar",
  "moltres-galar",
  "slowking-galar",
  "corsola-galar",
  "zigzagoon-galar",
  "linoone-galar",
  "darumaka-galar",
  "darmanitan-galar-standard",
  "yamask-galar",
  "stunfisk-galar",

  // Hisui
  "growlithe-hisui",
  "arcanine-hisui",
  "voltorb-hisui",
  "electrode-hisui",
  "typhlosion-hisui",
  "qwilfish-hisui",
  "sneasel-hisui",
  "samurott-hisui",
  "lilligant-hisui",
  "zorua-hisui",
  "zoroark-hisui",
  "braviary-hisui",
  "sliggoo-hisui",
  "goodra-hisui",
  "avalugg-hisui",
  "decidueye-hisui",

  // Paldea
  "tauros-paldea-combat-breed",
  "tauros-paldea-blaze-breed",
  "tauros-paldea-aqua-breed",
  "wooper-paldea",
]);

const REGIONAL_FORM_ADJECTIVES = {
  alola: "Alolan",
  galar: "Galarian",
  hisui: "Hisuian",
  paldea: "Paldean",
};

// Variants that are the form's default and add nothing to its display name.
const DEFAULT_FORM_VARIANTS = new Set(["standard"]);

/*
 * Showdown names that don't reduce to the PokéAPI name by lowercasing and
 * hyphenating. Keyed by the normalized Showdown name.
 */
const SHOWDOWN_SPECIES_ALIASES = {
  "darmanitan-galar": "darmanitan-galar-standard",
  "tauros-paldea-combat": "tauros-paldea-combat-breed",
  "tauros-paldea-blaze": "tauros-paldea-blaze-breed",
  "tauros-paldea-aqua": "tauros-paldea-aqua-breed",
};

const POKEAPI_TO_SHOWDOWN_SPECIES = Object.fromEntries(
  Object.entries(SHOWDOWN_SPECIES_ALIASES).map(([showdown, pokeApi]) => [
    pokeApi,
    showdown,
  ]),
);

function parseRegionalForm(name) {
  const match = String(name).match(/^(.+?)-(alola|galar|hisui|paldea)(?:-(.+))?$/);

  if (!match) {
    return null;
  }

  return {
    species: match[1],
    region: match[2],
    variant: match[3] ?? "",
  };
}

// "samurott-hisui" -> "Hisuian Samurott",
// "tauros-paldea-combat-breed" -> "Paldean Tauros (Combat Breed)".
function formatPokemonDisplayName(name) {
  const form = parseRegionalForm(name);

  if (!form) {
    return capitalizeHyphenatedWords(name);
  }

  const displayName =
    `${REGIONAL_FORM_ADJECTIVES[form.region]} ` +
    capitalizeHyphenatedWords(form.species);

  if (!form.variant || DEFAULT_FORM_VARIANTS.has(form.variant)) {
    return displayName;
  }

  return `${displayName} (${capitalizeHyphenatedWords(form.variant)})`;
}

// Normalized Showdown species -> PokéAPI resource name.
function fromShowdownSpecies(normalizedName) {
  return SHOWDOWN_SPECIES_ALIASES[normalizedName] ?? normalizedName;
}

/*
 * PokéAPI resource name -> Showdown species ("Samurott-Hisui",
 * "Tauros-Paldea-Combat"). Returns null for non-regional Pokémon so callers
 * can keep their existing formatting.
 */
function toShowdownSpecies(name) {
  const form = parseRegionalForm(POKEAPI_TO_SHOWDOWN_SPECIES[name] ?? name);

  if (!form) {
    return null;
  }

  return [form.species, form.region, form.variant]
    .filter(Boolean)
    .map(capitalizeHyphenatedWords)
    .join("-");
}

function capitalizeHyphenatedWords(value) {
  return String(value)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
