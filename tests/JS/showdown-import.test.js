const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/*
 * The Showdown parser and exporter are top-level functions in
 * team-builder.js, a plain browser script. Load it the way <script> tags
 * would; its page code waits for DOMContentLoaded, which never fires here.
 */
function loadBrowserScripts(...files) {
  const context = vm.createContext({
    document: { addEventListener() {} },
  });

  files.forEach((file) => {
    const code = fs.readFileSync(
      path.join(__dirname, "../../public/js", file),
      "utf8",
    );

    vm.runInContext(code, context);
  });

  return vm.runInContext(
    "({ parseShowdownTeam, formatPokemonForShowdown, fromShowdownSpecies, normalizeShowdownName })",
    context,
  );
}

const {
  parseShowdownTeam,
  formatPokemonForShowdown,
  fromShowdownSpecies,
  normalizeShowdownName,
} = loadBrowserScripts("pokemon-forms.js", "team-builder.js");

function readFixture(name) {
  return fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");
}

// Array.from builds the array here: arrays made inside the sandbox have
// its own Array prototype, which deepEqual's strict mode rejects.
function speciesOf(team) {
  return Array.from(team, (pokemon) => pokemon.species);
}

// Both teams below were pasted from Showdown and failed to import.

test("a gender marker after the species isn't read as part of it", () => {
  const team = parseShowdownTeam(readFixture("showdown-gendered-team.txt"));

  assert.deepEqual(speciesOf(team), [
    "sylveon",
    "vulpix-alola",
    "cutiefly",
    "buneary",
    // PokéAPI's "shaymin-land"; the builder looks up the default form.
    "shaymin",
    // A cosmetic flavour: PokéAPI only has Alcremie.
    "alcremie",
  ]);
  assert.equal(team[1].nickname, "Snowflake");
  assert.equal(team[1].item, "light-clay");
});

test("Ogerpon's masks import as PokéAPI's mask forms", () => {
  const team = parseShowdownTeam(readFixture("showdown-ogerpon-team.txt"));

  assert.deepEqual(speciesOf(team), [
    "ninetales-alola",
    "ogerpon-wellspring-mask",
    "hatterene",
    "primarina",
    "tinkaton",
    "dragonite",
  ]);
  assert.equal(team[0].ivs.attack, 0);
});

test("a gender marker without a nickname is dropped too", () => {
  const [pokemon] = parseShowdownTeam("Vulpix-Alola (F) @ Light Clay\n- Freeze-Dry");

  assert.equal(pokemon.species, "vulpix-alola");
  assert.equal(pokemon.nickname, "");
  assert.equal(pokemon.speciesText, "Vulpix-Alola");
});

test("Showdown's -F forms map to PokéAPI's female forms", () => {
  assert.equal(fromShowdownSpecies("indeedee-f"), "indeedee-female");
  assert.equal(fromShowdownSpecies("basculegion-f"), "basculegion-female");
  // "-F" is part of the name here, not a separate female form.
  assert.equal(fromShowdownSpecies("nidoran-f"), "nidoran-f");
});

test("cosmetic forms map to their species, real forms don't", () => {
  assert.equal(fromShowdownSpecies("vivillon-fancy"), "vivillon");
  assert.equal(fromShowdownSpecies("gastrodon-east"), "gastrodon");
  assert.equal(fromShowdownSpecies("floette-eternal"), "floette-eternal");
});

test("accented names normalize to plain letters", () => {
  assert.equal(normalizeShowdownName("Flabébé"), "flabebe");
});

function teamPokemon(name, speciesName, isDefaultForm) {
  return {
    name,
    speciesName,
    isDefaultForm,
    nickname: "",
    item: "",
    ability: "",
    nature: "",
    moves: [],
    evs: {},
    ivs: {},
  };
}

test("exports use names Showdown can import again", () => {
  const exportedSpecies = [
    teamPokemon("shaymin-land", "shaymin", true),
    teamPokemon("ogerpon-wellspring-mask", "ogerpon", false),
    teamPokemon("indeedee-female", "indeedee", false),
    teamPokemon("vulpix-alola", "vulpix", false),
    teamPokemon("sylveon", "sylveon", true),
  ].map(formatPokemonForShowdown);

  assert.deepEqual(exportedSpecies, [
    "Shaymin",
    "Ogerpon-Wellspring",
    "Indeedee-F",
    "Vulpix-Alola",
    "Sylveon",
  ]);
});
