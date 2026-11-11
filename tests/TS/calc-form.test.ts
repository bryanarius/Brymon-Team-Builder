import { toID } from "@smogon/calc";
import { expect, test } from "vitest";
import {
  formatBoost,
  formatCalcPercent,
  formatNatureLabel,
  gen,
  getCalcDisplayName,
} from "../../resources/ts/calc/calc-data";
import {
  calculateMatchup,
  createSideForm,
  DEFAULT_CONDITIONS,
  toBuilderSet,
  toFieldOptions,
} from "../../resources/ts/calc/calc-form";

const greatTusk = createSideForm({
  name: "Great Tusk",
  nature: "Jolly",
  evs: { attack: 252, speed: 252 },
  moves: ["Headlong Rush"],
});

const kingambit = createSideForm({ name: "Kingambit" });

test("a new form starts as a fresh Pokémon with four move slots", () => {
  expect(kingambit).toMatchObject({
    level: "100",
    item: "",
    nature: "Hardy",
    moves: ["", "", "", ""],
  });
  expect(kingambit.evs.hp).toBe("0");
  expect(kingambit.ivs.hp).toBe("31");
});

test("a Pokémon without a chosen ability gets the library's default", () => {
  expect(kingambit.ability).toBe("Defiant");
  expect(createSideForm({ name: "Kingambit", ability: "Supreme Overlord" }).ability)
    .toBe("Supreme Overlord");
});

test("typed numbers are clamped, and blanks fall back to defaults", () => {
  const set = toBuilderSet({
    ...greatTusk,
    level: "",
    evs: { ...greatTusk.evs, attack: "300", speed: "abc" },
    ivs: { ...greatTusk.ivs, hp: "-5" },
    boosts: { ...greatTusk.boosts, attack: "9", hp: "2" },
  });

  expect(set.level).toBe(100);
  expect(set.evs.attack).toBe(252);
  expect(set.evs.speed).toBe(0);
  expect(set.ivs?.hp).toBe(0);
  expect(set.boosts?.attack).toBe(6);
  // HP has no boost input, so nothing stored there counts.
  expect(set.boosts?.hp).toBe(0);
});

test("battle conditions become the library's field options", () => {
  expect(
    toFieldOptions({ ...DEFAULT_CONDITIONS, weather: "Rain", reflect: true }),
  ).toEqual({
    gameType: "Singles",
    weather: "Rain",
    terrain: undefined,
    defenderSide: {
      isReflect: true,
      isLightScreen: false,
      isAuroraVeil: false,
    },
  });
});

test("the matchup explains what's missing before calculating", () => {
  expect(calculateMatchup(createSideForm(), kingambit, DEFAULT_CONDITIONS))
    .toEqual({
      kind: "message",
      message: "Choose an attacker and a defender to see the damage.",
    });

  expect(calculateMatchup(kingambit, greatTusk, DEFAULT_CONDITIONS)).toEqual({
    kind: "message",
    message: "Choose at least one move for the attacker.",
  });
});

test("a complete matchup returns one result per move", () => {
  const matchup = calculateMatchup(greatTusk, kingambit, DEFAULT_CONDITIONS);

  expect(matchup.kind).toBe("results");

  if (matchup.kind === "results") {
    expect(matchup.results.map((result) => result.move)).toEqual([
      "Headlong Rush",
    ]);
  }

  const crit = calculateMatchup(greatTusk, kingambit, {
    ...DEFAULT_CONDITIONS,
    criticalHit: true,
  });

  if (matchup.kind === "results" && crit.kind === "results") {
    expect(crit.results[0]!.maxDamage).toBeGreaterThan(
      matchup.results[0]!.maxDamage,
    );
  }
});

test("labels match what the rest of Brymon shows", () => {
  expect(getCalcDisplayName("Samurott-Hisui")).toBe("Hisuian Samurott");
  expect(formatNatureLabel(gen.natures.get(toID("Adamant"))!)).toBe(
    "Adamant (+Atk, −SpA)",
  );
  expect(formatNatureLabel(gen.natures.get(toID("Hardy"))!)).toBe(
    "Hardy (neutral)",
  );
  expect(formatBoost(2)).toBe("+2");
  expect(formatBoost(-1)).toBe("−1");
  expect(formatCalcPercent(108.96)).toBe("108.9%");
});
