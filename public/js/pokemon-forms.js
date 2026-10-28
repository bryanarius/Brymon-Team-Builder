"use strict";

/*
 * Alternate Pokémon forms (shared by the team builder and team analysis).
 *
 * PokéAPI stores alternate forms as separate Pokémon resources (ids above
 * 10000), e.g. "samurott-hisui", "tauros-paldea-combat-breed", or
 * "charizard-mega-x". The national dex list the builder loads (ids 1-1025)
 * only contains each species' default form, so forms have to be opted in
 * here.
 *
 * The lists are explicit rather than pattern-matched so that nothing
 * PokéAPI adds later shows up in the builder unreviewed. Battle-only forms
 * (e.g. "darmanitan-galar-zen") and non-standard ones (totems, cap Pikachu,
 * Gigantamax) are deliberately left out.
 */

// Regional forms: "<species>-<region>[-<variant>]".
const REGIONAL_FORMS = [
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
];

/*
 * Mega Evolutions and Primal Reversions, mapped to the PokéAPI item they
 * must hold ("<species>-mega[-x|-y|-z]", "<species>-primal"). Rayquaza Mega
 * Evolves by knowing Dragon Ascent instead, so it has no stone.
 */
const MEGA_STONES = {
  // Kanto
  "venusaur-mega": "venusaurite",
  "charizard-mega-x": "charizardite-x",
  "charizard-mega-y": "charizardite-y",
  "blastoise-mega": "blastoisinite",
  "beedrill-mega": "beedrillite",
  "pidgeot-mega": "pidgeotite",
  "raichu-mega-x": "raichunite-x",
  "raichu-mega-y": "raichunite-y",
  "clefable-mega": "clefablite",
  "alakazam-mega": "alakazite",
  "victreebel-mega": "victreebelite",
  "slowbro-mega": "slowbronite",
  "gengar-mega": "gengarite",
  "kangaskhan-mega": "kangaskhanite",
  "starmie-mega": "starminite",
  "pinsir-mega": "pinsirite",
  "gyarados-mega": "gyaradosite",
  "aerodactyl-mega": "aerodactylite",
  "dragonite-mega": "dragoninite",
  "mewtwo-mega-x": "mewtwonite-x",
  "mewtwo-mega-y": "mewtwonite-y",

  // Johto
  "meganium-mega": "meganiumite",
  "feraligatr-mega": "feraligite",
  "ampharos-mega": "ampharosite",
  "steelix-mega": "steelixite",
  "scizor-mega": "scizorite",
  "heracross-mega": "heracronite",
  "skarmory-mega": "skarmorite",
  "houndoom-mega": "houndoominite",
  "tyranitar-mega": "tyranitarite",

  // Hoenn
  "sceptile-mega": "sceptilite",
  "blaziken-mega": "blazikenite",
  "swampert-mega": "swampertite",
  "gardevoir-mega": "gardevoirite",
  "sableye-mega": "sablenite",
  "mawile-mega": "mawilite",
  "aggron-mega": "aggronite",
  "medicham-mega": "medichamite",
  "manectric-mega": "manectite",
  "sharpedo-mega": "sharpedonite",
  "camerupt-mega": "cameruptite",
  "altaria-mega": "altarianite",
  "banette-mega": "banettite",
  "chimecho-mega": "chimechite",
  "absol-mega": "absolite",
  "absol-mega-z": "absolite-z",
  "glalie-mega": "glalitite",
  "salamence-mega": "salamencite",
  "metagross-mega": "metagrossite",
  "latias-mega": "latiasite",
  "latios-mega": "latiosite",
  "kyogre-primal": "blue-orb",
  "groudon-primal": "red-orb",
  "rayquaza-mega": null,

  // Sinnoh
  "staraptor-mega": "staraptite",
  "lopunny-mega": "lopunnite",
  "garchomp-mega": "garchompite",
  "garchomp-mega-z": "garchompite-z",
  "lucario-mega": "lucarionite",
  "lucario-mega-z": "lucarionite-z",
  "abomasnow-mega": "abomasite",
  "gallade-mega": "galladite",
  "froslass-mega": "froslassite",
  "heatran-mega": "heatranite",
  "darkrai-mega": "darkranite",

  // Unova
  "emboar-mega": "emboarite",
  "excadrill-mega": "excadrite",
  "audino-mega": "audinite",
  "scolipede-mega": "scolipite",
  "scrafty-mega": "scraftinite",
  "eelektross-mega": "eelektrossite",
  "chandelure-mega": "chandelurite",
  "golurk-mega": "golurkite",

  // Kalos
  "chesnaught-mega": "chesnaughtite",
  "delphox-mega": "delphoxite",
  "greninja-mega": "greninjite",
  "pyroar-mega": "pyroarite",
  "floette-mega": "floettite",
  "meowstic-male-mega": "meowsticite",
  "meowstic-female-mega": "meowsticite",
  "malamar-mega": "malamarite",
  "barbaracle-mega": "barbaracite",
  "dragalge-mega": "dragalgite",
  "hawlucha-mega": "hawluchanite",
  "diancie-mega": "diancite",
  "zygarde-mega": "zygardite",

  // Alola
  "crabominable-mega": "crabominite",
  "golisopod-mega": "golisopite",
  "drampa-mega": "drampanite",
  "magearna-mega": "magearnite",
  "magearna-original-mega": "magearnite",
  "zeraora-mega": "zeraorite",

  // Galar
  "falinks-mega": "falinksite",

  // Paldea
  "scovillain-mega": "scovillainite",
  "glimmora-mega": "glimmoranite",
  "tatsugiri-curly-mega": "tatsugirinite",
  "tatsugiri-droopy-mega": "tatsugirinite",
  "tatsugiri-stretchy-mega": "tatsugirinite",
  "baxcalibur-mega": "baxcalibrite",
};

const SELECTABLE_POKEMON_FORMS = new Set([
  ...REGIONAL_FORMS,
  ...Object.keys(MEGA_STONES),
]);

const REGIONAL_FORM_ADJECTIVES = {
  alola: "Alolan",
  galar: "Galarian",
  hisui: "Hisuian",
  paldea: "Paldean",
};

// Variants that are the form's default and add nothing to its display name.
const DEFAULT_FORM_VARIANTS = new Set(["standard"]);

// Megas whose species name already includes a form ("meowstic-male").
const MEGA_DISPLAY_NAMES = {
  "meowstic-male-mega": "Mega Meowstic (Male)",
  "meowstic-female-mega": "Mega Meowstic (Female)",
  "magearna-original-mega": "Mega Magearna (Original Color)",
  "tatsugiri-curly-mega": "Mega Tatsugiri (Curly)",
  "tatsugiri-droopy-mega": "Mega Tatsugiri (Droopy)",
  "tatsugiri-stretchy-mega": "Mega Tatsugiri (Stretchy)",
};

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

// "charizard-mega-x" -> { species: "charizard", kind: "mega", letter: "x" }.
function parseMegaForm(name) {
  const match = String(name).match(/^(.+?)-(mega|primal)(?:-([xyz]))?$/);

  if (!match) {
    return null;
  }

  return {
    species: match[1],
    kind: match[2],
    letter: match[3] ?? "",
  };
}

// "samurott-hisui" -> "Hisuian Samurott",
// "tauros-paldea-combat-breed" -> "Paldean Tauros (Combat Breed)",
// "charizard-mega-x" -> "Mega Charizard X", "kyogre-primal" -> "Primal Kyogre".
function formatPokemonDisplayName(name) {
  if (MEGA_DISPLAY_NAMES[name]) {
    return MEGA_DISPLAY_NAMES[name];
  }

  const mega = parseMegaForm(name);

  if (mega) {
    const prefix = mega.kind === "primal" ? "Primal" : "Mega";
    const letter = mega.letter ? ` ${mega.letter.toUpperCase()}` : "";

    return `${prefix} ${capitalizeHyphenatedWords(mega.species)}${letter}`;
  }

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
 * "Tauros-Paldea-Combat", "Charizard-Mega-X"). Returns null for default
 * forms so callers can keep their existing formatting.
 */
function toShowdownSpecies(name) {
  if (parseMegaForm(name)) {
    return String(name).split("-").map(capitalizeHyphenatedWords).join("-");
  }

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
