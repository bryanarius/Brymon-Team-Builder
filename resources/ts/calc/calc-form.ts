import type { StatusName } from "@smogon/calc/dist/data/interface";
import { getDefaultAbility, STATS } from "./calc-data";
import {
  calculateDamage,
  type BuilderSet,
  type BuilderStat,
  type BuilderStats,
  type FieldOptions,
  type MoveDamage,
} from "./damage-calc";

/*
|--------------------------------------------------------------------------
| Form State
|--------------------------------------------------------------------------
|
| What the inputs show is kept separate from what the calculator gets.
| Number inputs hold the raw text typed, so clearing "100" to type "50"
| works; toBuilderSet() turns it into clamped numbers when calculating.
|
*/

export type StatInputs = Record<BuilderStat, string>;

export type SideForm = {
  name: string;
  level: string;
  ability: string;
  item: string;
  nature: string;
  teraType: string;
  status: StatusName | "";
  evs: StatInputs;
  ivs: StatInputs;
  boosts: StatInputs;
  // Always four. The defender has no move inputs but keeps its moves, so
  // a swap can bring them over to the attacker.
  moves: string[];
};

export type StatKind = "evs" | "ivs" | "boosts";

type Conditions = NonNullable<FieldOptions>;

export type ConditionsForm = {
  gameType: "Singles" | "Doubles";
  weather: NonNullable<Conditions["weather"]> | "";
  terrain: NonNullable<Conditions["terrain"]> | "";
  reflect: boolean;
  lightScreen: boolean;
  auroraVeil: boolean;
  criticalHit: boolean;
};

export const DEFAULT_CONDITIONS: ConditionsForm = {
  gameType: "Singles",
  weather: "",
  terrain: "",
  reflect: false,
  lightScreen: false,
  auroraVeil: false,
  criticalHit: false,
};

function toStatInputs(
  stats: BuilderStats | undefined,
  fallback: number,
): StatInputs {
  return Object.fromEntries(
    STATS.map((stat) => [stat, String(stats?.[stat] ?? fallback)]),
  ) as StatInputs;
}

/*
 * A form filled from a builder or saved set (with the library's names).
 * Missing fields fall back to a fresh Pokémon: no item, 0 EVs, 31 IVs.
 */
export function createSideForm(set: Partial<BuilderSet> = {}): SideForm {
  const name = set.name ?? "";

  return {
    name,
    level: String(set.level ?? 100),
    ability: set.ability || getDefaultAbility(name),
    item: set.item ?? "",
    nature: set.nature || "Hardy",
    teraType: set.teraType ?? "",
    status: set.status ?? "",
    evs: toStatInputs(set.evs, 0),
    ivs: toStatInputs(set.ivs, 31),
    boosts: toStatInputs(set.boosts, 0),
    moves: [0, 1, 2, 3].map((index) => set.moves?.[index] ?? ""),
  };
}

function readNumber(
  text: string,
  min: number,
  max: number,
  fallback: number,
): number {
  const value = Number.parseInt(text, 10);

  return Number.isNaN(value) ? fallback : Math.min(Math.max(value, min), max);
}

function readStats(
  inputs: StatInputs,
  min: number,
  max: number,
  fallback: number,
): Record<BuilderStat, number> {
  return Object.fromEntries(
    STATS.map((stat) => [stat, readNumber(inputs[stat], min, max, fallback)]),
  ) as Record<BuilderStat, number>;
}

export function toBuilderSet(form: SideForm): BuilderSet & {
  evs: Record<BuilderStat, number>;
} {
  return {
    name: form.name,
    level: readNumber(form.level, 1, 100, 100),
    ability: form.ability,
    item: form.item,
    nature: form.nature,
    teraType: form.teraType,
    status: form.status,
    evs: readStats(form.evs, 0, 252, 0),
    ivs: readStats(form.ivs, 0, 31, 31),
    // HP can't be boosted, so it has no input; ignore anything stored.
    boosts: { ...readStats(form.boosts, -6, 6, 0), hp: 0 },
    moves: form.moves,
  };
}

export function toFieldOptions(conditions: ConditionsForm): FieldOptions {
  return {
    gameType: conditions.gameType,
    weather: conditions.weather || undefined,
    terrain: conditions.terrain || undefined,
    defenderSide: {
      isReflect: conditions.reflect,
      isLightScreen: conditions.lightScreen,
      isAuroraVeil: conditions.auroraVeil,
    },
  };
}

/*
|--------------------------------------------------------------------------
| Matchup
|--------------------------------------------------------------------------
*/

export type Matchup =
  | { kind: "message"; message: string }
  | {
      kind: "results";
      attackerName: string;
      defenderName: string;
      results: MoveDamage[];
    };

// What the Results panel shows for the current inputs.
export function calculateMatchup(
  attacker: SideForm,
  defender: SideForm,
  conditions: ConditionsForm,
): Matchup {
  if (!attacker.name || !defender.name) {
    return {
      kind: "message",
      message: "Choose an attacker and a defender to see the damage.",
    };
  }

  if (!attacker.moves.some(Boolean)) {
    return {
      kind: "message",
      message: "Choose at least one move for the attacker.",
    };
  }

  try {
    return {
      kind: "results",
      attackerName: attacker.name,
      defenderName: defender.name,
      results: calculateDamage(
        toBuilderSet(attacker),
        toBuilderSet(defender),
        toFieldOptions(conditions),
        { isCrit: conditions.criticalHit },
      ),
    };
  } catch (error) {
    console.error("Damage calculator error:", error);

    return {
      kind: "message",
      message: "Something went wrong calculating this matchup.",
    };
  }
}
