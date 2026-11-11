import { expect, test } from "vitest";
import {
  analyzeTeamDefense,
  buildRecommendation,
  buildResistanceMap,
  buildTeamSummary,
  buildTypeMultiplierMap,
  classifyPokemon,
  computeRoleBalance,
  findTypeCoverage,
  getWeaknessSeverity,
  groupTeamTypes,
  listImmunities,
  listSharedWeaknesses,
  sortPokemonEntries,
  teamMoveNames,
  type PokeApiPokemon,
  type PokeApiType,
  type TeamPokemon,
} from "../../resources/ts/analysis/team-analysis";

// A PokéAPI /pokemon response with only the fields the analysis reads.
function pokemon(
  id: number,
  name: string,
  types: string[],
  [hp, attack, defense, specialAttack, specialDefense, speed]: number[],
): PokeApiPokemon {
  const stats: [string, number | undefined][] = [
    ["hp", hp],
    ["attack", attack],
    ["defense", defense],
    ["special-attack", specialAttack],
    ["special-defense", specialDefense],
    ["speed", speed],
  ];

  return {
    id,
    name,
    types: types.map((type) => ({ type: { name: type } })),
    stats: stats.map(([stat, value]) => ({
      base_stat: value ?? 0,
      stat: { name: stat },
    })),
  };
}

// A PokéAPI /type response with only the fields the analysis reads.
function type(
  name: string,
  relations: Partial<Record<keyof PokeApiType["damage_relations"], string[]>>,
): PokeApiType {
  const named = (names: string[] = []) => names.map((entry) => ({ name: entry }));

  return {
    name,
    damage_relations: {
      double_damage_to: named(relations.double_damage_to),
      half_damage_from: named(relations.half_damage_from),
      no_damage_from: named(relations.no_damage_from),
    },
  };
}

const charizard = pokemon(6, "charizard", ["fire", "flying"], [78, 84, 78, 109, 85, 100]);
const gyarados = pokemon(130, "gyarados", ["water", "flying"], [95, 125, 79, 60, 100, 81]);
const gengar = pokemon(94, "gengar", ["ghost", "poison"], [60, 65, 60, 130, 75, 110]);
const garchomp = pokemon(445, "garchomp", ["dragon", "ground"], [108, 130, 95, 80, 85, 102]);
const alakazam = pokemon(65, "alakazam", ["psychic"], [55, 50, 45, 135, 95, 120]);
const blissey = pokemon(242, "blissey", ["normal"], [255, 10, 10, 75, 135, 55]);

function defenseOf(details: PokeApiPokemon[], team: TeamPokemon[] = []) {
  return analyzeTeamDefense(buildTypeMultiplierMap(details, team));
}

test("shared weaknesses list types that hit two or more Pokémon", () => {
  const weaknesses = listSharedWeaknesses(defenseOf([charizard, gyarados]));

  expect(weaknesses.map((group) => group.type)).toEqual(["electric", "rock"]);

  const rock = weaknesses.find((group) => group.type === "rock");

  // Fire/Flying takes 4× from Rock, so it sorts first.
  expect(sortPokemonEntries(rock?.pokemon ?? [])).toEqual([
    { name: "charizard", multiplier: 4 },
    { name: "gyarados", multiplier: 2 },
  ]);
});

test("immunities come from types and from abilities", () => {
  expect(listImmunities(defenseOf([charizard, gyarados]))).toEqual([
    {
      type: "ground",
      pokemon: [
        { name: "charizard", multiplier: 0 },
        { name: "gyarados", multiplier: 0 },
      ],
    },
  ]);

  // Gengar is part Poison, so Ground is super effective until Levitate.
  const withoutLevitate = defenseOf([gengar]);
  const withLevitate = defenseOf([gengar], [
    { pokemonApiId: 94, ability: "levitate" },
  ]);

  expect(withoutLevitate.sharedWeaknesses.ground).toEqual([
    { name: "gengar", multiplier: 2 },
  ]);
  expect(withLevitate.sharedWeaknesses.ground).toEqual([]);
  expect(withLevitate.immunities.ground).toEqual([
    { name: "gengar", multiplier: 0 },
  ]);
});

test("two of the same species both count", () => {
  const weaknesses = listSharedWeaknesses(defenseOf([garchomp, garchomp]));
  const ice = weaknesses.find((group) => group.type === "ice");

  expect(ice?.pokemon).toHaveLength(2);
  expect(ice?.pokemon[0]?.multiplier).toBe(4);
});

test("severity grows with how many Pokémon share a weakness", () => {
  expect(getWeaknessSeverity(2).level).toBe("minor");
  expect(getWeaknessSeverity(3).level).toBe("moderate");
  expect(getWeaknessSeverity(4).level).toBe("major");
  expect(getWeaknessSeverity(6).label).toBe("Major");
});

test("recommendations name the types that are immune to or resist a weakness", () => {
  const resistanceMap = buildResistanceMap([
    type("flying", { half_damage_from: ["grass", "bug"], no_damage_from: ["ground"] }),
    type("grass", { half_damage_from: ["ground", "water"] }),
    type("bug", { half_damage_from: ["grass", "ground"] }),
  ]);

  expect(buildRecommendation("ground", resistanceMap.ground)).toBe(
    "Consider a pokemon that is immune (Flying) or resistant (Bug, Grass) to Ground.",
  );
  expect(buildRecommendation("dragon", resistanceMap.dragon)).toBeNull();
});

test("team types are grouped, most common first", () => {
  expect(groupTeamTypes([charizard, gyarados, alakazam])).toEqual([
    { type: "flying", pokemon: [{ name: "charizard" }, { name: "gyarados" }] },
    { type: "fire", pokemon: [{ name: "charizard" }] },
    { type: "water", pokemon: [{ name: "gyarados" }] },
    { type: "psychic", pokemon: [{ name: "alakazam" }] },
  ]);
});

test("type coverage lists what the moves hit super effectively and the gaps", () => {
  expect(
    teamMoveNames([
      { pokemonApiId: 6, moves: ["flamethrower", "air-slash"] },
      { pokemonApiId: 6, moves: ["flamethrower"] },
    ]),
  ).toEqual(["flamethrower", "air-slash"]);

  const coverage = findTypeCoverage([
    type("fire", { double_damage_to: ["grass", "ice", "bug", "steel"] }),
    type("flying", { double_damage_to: ["grass", "fighting", "bug"] }),
  ]);

  expect(coverage.covered).toEqual(["grass", "ice", "bug", "steel", "fighting"]);
  expect(coverage.gaps).toHaveLength(13);
  expect(coverage.gaps).not.toContain("steel");
  expect(coverage.gaps).toContain("water");
});

test("natures and EVs decide a Pokémon's role and speed", () => {
  expect(
    classifyPokemon(garchomp, {
      pokemonApiId: 445,
      nature: "Adamant",
      evs: { attack: 252, speed: 252 },
    }),
  ).toEqual({ roles: ["physical-attacker"], speed: "fast" });

  expect(
    classifyPokemon(alakazam, { pokemonApiId: 65, nature: "modest" }).roles,
  ).toEqual(["special-attacker"]);

  expect(
    classifyPokemon(blissey, {
      pokemonApiId: 242,
      nature: "Bold",
      evs: { hp: 252, defense: 252 },
      moves: ["soft-boiled", "wish", "stealth-rock"],
    }),
  ).toEqual({
    // Stats first, then one role per utility move, in move order.
    roles: ["wall", "recovery", "cleric", "hazard-setter"],
    speed: "slow",
  });
});

test("role findings warn about one-sided offense and missing hazard removal", () => {
  const physicalChomp: TeamPokemon = {
    pokemonApiId: 445,
    name: "garchomp",
    nature: "adamant",
    evs: { attack: 252 },
  };
  const team = [physicalChomp, physicalChomp, physicalChomp, physicalChomp];

  const messages = computeRoleBalance([garchomp], team).findings.map(
    (finding) => finding.message,
  );

  expect(messages).toContain(
    "4 of 4 Pokémon are physical attackers and none are special — a single physical wall can check most of the team.",
  );
  expect(messages.some((message) => message.startsWith("No hazard removal"))).toBe(true);

  const withSpinner = computeRoleBalance([garchomp], [
    ...team.slice(1),
    { ...physicalChomp, moves: ["rapid-spin"] },
  ]);

  expect(withSpinner.roleMembers["hazard-removal"]).toEqual([{ name: "garchomp" }]);
  expect(
    withSpinner.findings.some((finding) => finding.message.startsWith("No hazard removal")),
  ).toBe(false);
});

test("the summary leads with weaknesses, then immunities, then type variety", () => {
  const details = [charizard, gyarados];

  expect(buildTeamSummary(defenseOf(details), details)).toEqual([
    { kind: "warning", message: "Electric is a minor shared weakness for 2 Pokémon." },
    { kind: "warning", message: "Rock is a minor shared weakness for 2 Pokémon." },
    { kind: "positive", message: "2 Pokémon are immune to Ground." },
    {
      kind: "neutral",
      message: "Flying is the team’s most common type, appearing on 2 Pokémon.",
    },
  ]);

  const roleWarning = { kind: "warning" as const, message: "No hazard removal." };

  expect(buildTeamSummary(defenseOf([alakazam]), [alakazam], [roleWarning])).toEqual([
    { kind: "positive", message: "The team has strong type diversity with 1 unique types." },
    roleWarning,
  ]);
});
