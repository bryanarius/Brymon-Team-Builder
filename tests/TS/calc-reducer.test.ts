import { expect, test } from "vitest";
import { createSideForm } from "../../resources/ts/calc/calc-form";
import {
  calcReducer,
  createInitialCalcState,
  type CalcState,
} from "../../resources/ts/calc/calc-reducer";
import type { SavedPokemon } from "../../resources/ts/calc/SidePanel";

// A saved set as PHP embeds it: PokéAPI slugs, not the library's names.
const savedSamurott: SavedPokemon = {
  slot: 2,
  name: "samurott-hisui",
  ability: "sharpness",
  item: "choice-band",
  nature: "adamant",
  evs: { attack: 252, speed: 252 },
  moves: ["ceaseless-edge", "aqua-cutter", "", ""],
};

const initial: CalcState = createInitialCalcState(null);

test("the calculator starts with the sample matchup", () => {
  expect(initial.attacker.name).toBe("Great Tusk");
  expect(initial.defender.name).toBe("Kingambit");
  expect(initial.conditions.criticalHit).toBe(false);
});

test("a linked saved Pokémon starts as the attacker", () => {
  const state = createInitialCalcState(savedSamurott);

  expect(state.attacker).toMatchObject({
    name: "Samurott-Hisui",
    ability: "Sharpness",
    item: "Choice Band",
  });
  expect(state.defender.name).toBe("Kingambit");
});

test("choosing a species also picks its default ability", () => {
  const state = calcReducer(initial, {
    type: "setSpecies",
    side: "defender",
    name: "Garchomp",
  });

  expect(state.defender.name).toBe("Garchomp");
  expect(state.defender.ability).toBe("Sand Veil");
  // Everything else on that side is kept.
  expect(state.defender.item).toBe("Leftovers");
});

test("updating one side leaves the other side alone", () => {
  const state = calcReducer(initial, {
    type: "updateSide",
    side: "attacker",
    changes: { item: "Choice Band", level: "50" },
  });

  expect(state.attacker).toMatchObject({ item: "Choice Band", level: "50" });
  expect(state.defender).toBe(initial.defender);
});

test("setting a stat changes only that stat", () => {
  const state = calcReducer(initial, {
    type: "setStat",
    side: "defender",
    kind: "boosts",
    stat: "defense",
    value: "2",
  });

  expect(state.defender.boosts.defense).toBe("2");
  expect(state.defender.boosts.speed).toBe("0");
  expect(state.defender.evs).toBe(initial.defender.evs);
});

test("setting a move replaces only that slot", () => {
  const state = calcReducer(initial, {
    type: "setMove",
    index: 1,
    move: "Earthquake",
  });

  expect(state.attacker.moves).toEqual([
    "Headlong Rush",
    "Earthquake",
    "Ice Spinner",
    "Knock Off",
  ]);
});

test("loading a saved Pokémon replaces that side", () => {
  const state = calcReducer(initial, {
    type: "loadSaved",
    side: "defender",
    pokemon: savedSamurott,
  });

  expect(state.defender).toEqual(
    createSideForm({
      name: "Samurott-Hisui",
      ability: "Sharpness",
      item: "Choice Band",
      nature: "Adamant",
      evs: { attack: 252, speed: 252 },
      moves: ["Ceaseless Edge", "Aqua Cutter", "", ""],
    }),
  );
  expect(state.attacker).toBe(initial.attacker);
});

test("swapping exchanges the attacker and defender", () => {
  const state = calcReducer(initial, { type: "swapSides" });

  expect(state.attacker).toBe(initial.defender);
  expect(state.defender).toBe(initial.attacker);
  expect(state.conditions).toBe(initial.conditions);
});

test("updating conditions merges the changes", () => {
  const state = calcReducer(initial, {
    type: "updateConditions",
    changes: { weather: "Sun", reflect: true },
  });

  expect(state.conditions).toMatchObject({
    weather: "Sun",
    reflect: true,
    gameType: "Singles",
  });
});

test("the reducer never changes the state it was given", () => {
  const snapshot = structuredClone(initial);

  calcReducer(initial, { type: "setMove", index: 0, move: "Earthquake" });
  calcReducer(initial, {
    type: "setStat",
    side: "attacker",
    kind: "evs",
    stat: "hp",
    value: "252",
  });
  calcReducer(initial, { type: "swapSides" });

  expect(initial).toEqual(snapshot);
});
