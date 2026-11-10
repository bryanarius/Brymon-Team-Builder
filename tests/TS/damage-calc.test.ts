import { calculate, Move, Pokemon } from "@smogon/calc";
import { expect, test } from "vitest";
import {
  calculateDamage,
  createCalcPokemon,
  getCalcGeneration,
  toCalcSet,
  type BuilderSet,
  type FieldOptions,
} from "../../resources/ts/calc/damage-calc";

const gen = getCalcGeneration();

const greatTusk: BuilderSet = {
  name: "great-tusk",
  ability: "protosynthesis",
  item: "",
  nature: "jolly",
  evs: { attack: 252, defense: 4, speed: 252 },
  moves: ["headlong-rush", "rapid-spin", "", ""],
};

const kingambit: BuilderSet = {
  name: "kingambit",
  ability: "supreme-overlord",
  item: "leftovers",
  nature: "adamant",
  evs: { hp: 252, attack: 252, specialDefense: 4 },
};

// The first move's result, for tests about a single number.
function firstResult(...args: Parameters<typeof calculateDamage>) {
  const [result] = calculateDamage(...args);

  if (!result) {
    throw new Error("Expected at least one result");
  }

  return result;
}

test("Brymon slugs give the same result as the library's own names", () => {
  const fromSlugs = firstResult({ ...greatTusk, item: "choice-band" }, kingambit);

  const direct = calculate(
    gen,
    new Pokemon(gen, "Great Tusk", {
      ability: "Protosynthesis",
      item: "Choice Band",
      nature: "Jolly",
      evs: { atk: 252, def: 4, spe: 252 },
    }),
    new Pokemon(gen, "Kingambit", {
      ability: "Supreme Overlord",
      item: "Leftovers",
      nature: "Adamant",
      evs: { hp: 252, atk: 252, spd: 4 },
    }),
    new Move(gen, "Headlong Rush"),
  );

  expect([fromSlugs.minDamage, fromSlugs.maxDamage]).toEqual(direct.range());
  expect(fromSlugs.move).toBe("Headlong Rush");
  expect(fromSlugs.description).toBe(direct.desc());
});

test("held items change the damage", () => {
  const plain = firstResult(greatTusk, kingambit);
  const banded = firstResult({ ...greatTusk, item: "choice-band" }, kingambit);

  expect(banded.maxDamage).toBeGreaterThan(plain.maxDamage);
});

test("results include percents and KO chance", () => {
  const [headlongRush, rapidSpin] = calculateDamage(greatTusk, kingambit);

  const maxHp = createCalcPokemon(gen, kingambit).maxHP();

  expect(headlongRush?.maxPercent).toBe((headlongRush!.maxDamage / maxHp) * 100);
  expect(headlongRush?.koChance).toMatch(/HKO/);
  expect(rapidSpin?.move).toBe("Rapid Spin");
});

test("empty and unknown moves are skipped", () => {
  const results = calculateDamage(
    { ...greatTusk, moves: ["", "not-a-move", "rapid-spin"] },
    kingambit,
  );

  expect(results.map((result) => result.move)).toEqual(["Rapid Spin"]);
});

test("status moves and immunities do no damage without throwing", () => {
  const swordsDance = firstResult(
    { ...greatTusk, moves: ["swords-dance"] },
    kingambit,
  );

  const shadowBall = firstResult(
    { name: "gengar", moves: ["shadow-ball"] },
    { name: "snorlax" },
  );

  for (const result of [swordsDance, shadowBall]) {
    expect(result.maxDamage).toBe(0);
    expect(result.koChance).toBe("");
    expect(result.description).toBe("");
  }
});

test("status, critical hits, and battle conditions change the damage", () => {
  const maxDamage = (
    attacker: BuilderSet,
    defender: BuilderSet,
    field?: FieldOptions,
    options?: { isCrit?: boolean },
  ) => firstResult(attacker, defender, field, options).maxDamage;

  const base = maxDamage(greatTusk, kingambit);

  // A burn halves physical damage; a crit is 1.5x; Reflect cuts it.
  expect(maxDamage({ ...greatTusk, status: "brn" }, kingambit)).toBeLessThan(base);
  expect(maxDamage(greatTusk, kingambit, {}, { isCrit: true })).toBeGreaterThan(base);
  expect(
    maxDamage(greatTusk, kingambit, { defenderSide: { isReflect: true } }),
  ).toBeLessThan(base);

  // Rain boosts Water moves.
  const surf: BuilderSet = { name: "vaporeon", moves: ["surf"] };

  expect(maxDamage(surf, kingambit, { weather: "Rain" })).toBeGreaterThan(
    maxDamage(surf, kingambit),
  );
});

test("Booster Energy activates Protosynthesis", () => {
  const plain = firstResult(greatTusk, kingambit);
  const boosted = firstResult(
    { ...greatTusk, item: "booster-energy" },
    kingambit,
  );

  expect(boosted.maxDamage).toBeGreaterThan(plain.maxDamage);
  expect(boosted.description).toMatch(/Protosynthesis/);
});

test("Tera types accept slugs and change the attacker's STAB", () => {
  const pokemon = createCalcPokemon(gen, { name: "great-tusk", teraType: "ground" });

  expect(pokemon.teraType).toBe("Ground");
  expect(createCalcPokemon(gen, { name: "great-tusk", teraType: "stellar" }).teraType)
    .toBe("Stellar");
  expect(createCalcPokemon(gen, { name: "great-tusk", teraType: "not-a-type" }).teraType)
    .toBeUndefined();

  const plain = firstResult(greatTusk, kingambit);
  const tera = firstResult({ ...greatTusk, teraType: "ground" }, kingambit);

  expect(tera.maxDamage).toBeGreaterThan(plain.maxDamage);
});

test("builder EV keys map to the library's stats", () => {
  const pokemon = createCalcPokemon(gen, {
    name: "gengar",
    evs: { specialAttack: 252, speed: 252 },
    ivs: { attack: 0 },
  });

  expect(pokemon.evs.spa).toBe(252);
  expect(pokemon.evs.spe).toBe(252);
  expect(pokemon.ivs.atk).toBe(0);
  expect(pokemon.ivs.hp).toBe(31);
});

test("forms, Megas, and PokéAPI default forms resolve", () => {
  const cases: Record<string, [string, string]> = {
    "samurott-hisui": ["Samurott-Hisui", "Water/Dark"],
    "tauros-paldea-combat-breed": ["Tauros-Paldea-Combat", "Fighting"],
    "charizard-mega-x": ["Charizard-Mega-X", "Fire/Dragon"],
    "meowstic-male-mega": ["Meowstic-M-Mega", "Psychic"],
    "keldeo-ordinary": ["Keldeo", "Water/Fighting"],
    "urshifu-single-strike": ["Urshifu", "Fighting/Dark"],
  };

  for (const [name, [calcName, types]] of Object.entries(cases)) {
    const pokemon = createCalcPokemon(gen, { name });

    expect(pokemon.name, name).toBe(calcName);
    expect(pokemon.types.join("/"), name).toBe(types);
  }
});

test("Mega Meowstic uses Showdown's M / F names", () => {
  expect(toShowdownSpecies("meowstic-male-mega")).toBe("Meowstic-M-Mega");
  expect(toShowdownSpecies("meowstic-female-mega")).toBe("Meowstic-F-Mega");
  expect(fromShowdownSpecies("meowstic-m-mega")).toBe("meowstic-male-mega");
});

test("saved sets convert to the library's names", () => {
  const set = toCalcSet(gen, {
    name: "samurott-hisui",
    ability: "sharpness",
    item: "choice-band",
    nature: "adamant",
    moves: ["ceaseless-edge", "", "not-a-move", "king-s-shield"],
    evs: { attack: 252 },
  });

  expect(set).toMatchObject({
    name: "Samurott-Hisui",
    ability: "Sharpness",
    item: "Choice Band",
    nature: "Adamant",
    moves: ["Ceaseless Edge", "", "", "King's Shield"],
    evs: { attack: 252 },
  });
});

test("unknown Pokémon throw a clear error", () => {
  expect(() => createCalcPokemon(gen, { name: "missingno" })).toThrow(
    "Unknown Pokémon for the damage calculator: missingno",
  );
});
