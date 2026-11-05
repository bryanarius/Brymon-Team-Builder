const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/*
 * Load the vendored library and Brymon's adapter the way the page's
 * <script> tags would. The library attaches itself to `window`.
 */
function loadDamageCalc() {
  const context = vm.createContext({});
  context.window = context;

  [
    "vendor/smogon-calc/data.min.js",
    "vendor/smogon-calc/calc.min.js",
    "js/pokemon-forms.js",
    "js/damage-calc.js",
  ].forEach((file) => {
    vm.runInContext(
      fs.readFileSync(path.join(__dirname, "../../public", file), "utf8"),
      context,
    );
  });

  return vm.runInContext(
    "({ calc, getCalcGeneration, createCalcPokemon, calculateDamage, toShowdownSpecies, fromShowdownSpecies })",
    context,
  );
}

const {
  calc,
  getCalcGeneration,
  createCalcPokemon,
  calculateDamage,
  toShowdownSpecies,
  fromShowdownSpecies,
} = loadDamageCalc();

const gen = getCalcGeneration();

const greatTusk = {
  name: "great-tusk",
  ability: "protosynthesis",
  item: "",
  nature: "jolly",
  evs: { attack: 252, defense: 4, speed: 252 },
  moves: ["headlong-rush", "rapid-spin", "", ""],
};

const kingambit = {
  name: "kingambit",
  ability: "supreme-overlord",
  item: "leftovers",
  nature: "adamant",
  evs: { hp: 252, attack: 252, specialDefense: 4 },
};

test("Brymon slugs give the same result as the library's own names", () => {
  const [fromSlugs] = calculateDamage(
    { ...greatTusk, item: "choice-band" },
    kingambit,
  );

  const direct = calc.calculate(
    gen,
    new calc.Pokemon(gen, "Great Tusk", {
      ability: "Protosynthesis",
      item: "Choice Band",
      nature: "Jolly",
      evs: { atk: 252, def: 4, spe: 252 },
    }),
    new calc.Pokemon(gen, "Kingambit", {
      ability: "Supreme Overlord",
      item: "Leftovers",
      nature: "Adamant",
      evs: { hp: 252, atk: 252, spd: 4 },
    }),
    new calc.Move(gen, "Headlong Rush"),
  );

  // Copy out of the sandbox: its arrays have a different Array prototype.
  assert.deepEqual(
    [fromSlugs.minDamage, fromSlugs.maxDamage],
    [...direct.range()],
  );
  assert.equal(fromSlugs.move, "Headlong Rush");
  assert.equal(fromSlugs.description, direct.desc());
});

test("held items change the damage", () => {
  const [plain] = calculateDamage(greatTusk, kingambit);
  const [banded] = calculateDamage(
    { ...greatTusk, item: "choice-band" },
    kingambit,
  );

  assert.ok(banded.maxDamage > plain.maxDamage);
});

test("results include percents and KO chance", () => {
  const [headlongRush, rapidSpin] = calculateDamage(greatTusk, kingambit);

  const maxHp = createCalcPokemon(gen, kingambit).maxHP();

  assert.equal(headlongRush.maxPercent, (headlongRush.maxDamage / maxHp) * 100);
  assert.match(headlongRush.koChance, /HKO/);
  assert.equal(rapidSpin.move, "Rapid Spin");
});

test("empty and unknown moves are skipped", () => {
  const results = calculateDamage(
    { ...greatTusk, moves: ["", "not-a-move", "rapid-spin"] },
    kingambit,
  );

  assert.deepEqual(
    [...results.map((result) => result.move)],
    ["Rapid Spin"],
  );
});

test("status moves and immunities do no damage without throwing", () => {
  const [swordsDance] = calculateDamage(
    { ...greatTusk, moves: ["swords-dance"] },
    kingambit,
  );

  const [shadowBall] = calculateDamage(
    { name: "gengar", moves: ["shadow-ball"] },
    { name: "snorlax" },
  );

  for (const result of [swordsDance, shadowBall]) {
    assert.equal(result.maxDamage, 0);
    assert.equal(result.koChance, "");
    assert.equal(result.description, "");
  }
});

test("status, critical hits, and battle conditions change the damage", () => {
  const maxDamage = (attacker, defender, field, options) =>
    calculateDamage(attacker, defender, field, options)[0].maxDamage;

  const base = maxDamage(greatTusk, kingambit);

  // A burn halves physical damage; a crit is 1.5x; Reflect cuts it.
  assert.ok(maxDamage({ ...greatTusk, status: "brn" }, kingambit) < base);
  assert.ok(maxDamage(greatTusk, kingambit, {}, { isCrit: true }) > base);
  assert.ok(
    maxDamage(greatTusk, kingambit, { defenderSide: { isReflect: true } }) <
      base,
  );

  // Rain boosts Water moves.
  const surf = { name: "vaporeon", moves: ["surf"] };

  assert.ok(
    maxDamage(surf, kingambit, { weather: "Rain" }) >
      maxDamage(surf, kingambit),
  );
});

test("Booster Energy activates Protosynthesis", () => {
  const [plain] = calculateDamage(greatTusk, kingambit);
  const [boosted] = calculateDamage(
    { ...greatTusk, item: "booster-energy" },
    kingambit,
  );

  assert.ok(boosted.maxDamage > plain.maxDamage);
  assert.match(boosted.description, /Protosynthesis/);
});

test("builder EV keys map to the library's stats", () => {
  const pokemon = createCalcPokemon(gen, {
    name: "gengar",
    evs: { specialAttack: 252, speed: 252 },
    ivs: { attack: 0 },
  });

  assert.equal(pokemon.evs.spa, 252);
  assert.equal(pokemon.evs.spe, 252);
  assert.equal(pokemon.ivs.atk, 0);
  assert.equal(pokemon.ivs.hp, 31);
});

test("forms, Megas, and PokéAPI default forms resolve", () => {
  const cases = {
    "samurott-hisui": ["Samurott-Hisui", "Water/Dark"],
    "tauros-paldea-combat-breed": ["Tauros-Paldea-Combat", "Fighting"],
    "charizard-mega-x": ["Charizard-Mega-X", "Fire/Dragon"],
    "meowstic-male-mega": ["Meowstic-M-Mega", "Psychic"],
    "keldeo-ordinary": ["Keldeo", "Water/Fighting"],
    "urshifu-single-strike": ["Urshifu", "Fighting/Dark"],
  };

  for (const [name, [calcName, types]] of Object.entries(cases)) {
    const pokemon = createCalcPokemon(gen, { name });

    assert.equal(pokemon.name, calcName, name);
    assert.equal(pokemon.types.join("/"), types, name);
  }
});

test("Mega Meowstic uses Showdown's M / F names", () => {
  assert.equal(toShowdownSpecies("meowstic-male-mega"), "Meowstic-M-Mega");
  assert.equal(toShowdownSpecies("meowstic-female-mega"), "Meowstic-F-Mega");
  assert.equal(fromShowdownSpecies("meowstic-m-mega"), "meowstic-male-mega");
});

test("unknown Pokémon throw a clear error", () => {
  assert.throws(
    () => createCalcPokemon(gen, { name: "missingno" }),
    /Unknown Pokémon for the damage calculator: missingno/,
  );
});
