import type { Dispatch } from "react";
import { gen, getDefaultAbility } from "./calc-data";
import {
  createSideForm,
  DEFAULT_CONDITIONS,
  type ConditionsForm,
  type SideForm,
  type StatKind,
} from "./calc-form";
import { toCalcSet, type BuilderStat } from "./damage-calc";
import type { SavedPokemon, Side } from "./SidePanel";

/*
|--------------------------------------------------------------------------
| Calculator State
|--------------------------------------------------------------------------
|
| Everything the calculator's inputs hold, and every way it can change.
| Components describe what happened (an action); calcReducer decides what
| the next state is. It's a pure function, so the rules (a new species gets
| its default ability, a swap exchanges both sides) are tested without
| rendering anything.
|
*/

export type CalcState = {
  attacker: SideForm;
  defender: SideForm;
  conditions: ConditionsForm;
};

export type CalcAction =
  | { type: "setSpecies"; side: Side; name: string }
  | { type: "updateSide"; side: Side; changes: Partial<SideForm> }
  | {
      type: "setStat";
      side: Side;
      kind: StatKind;
      stat: BuilderStat;
      value: string;
    }
  | { type: "setMove"; index: number; move: string }
  | { type: "loadSaved"; side: Side; pokemon: SavedPokemon }
  | { type: "swapSides" }
  | { type: "updateConditions"; changes: Partial<ConditionsForm> };

export type CalcDispatch = Dispatch<CalcAction>;

/*
 * A sample matchup, so the page explains itself before anything is
 * picked. A link from a saved team loads that Pokémon as the attacker.
 */
const SAMPLE_ATTACKER = createSideForm({
  name: "Great Tusk",
  ability: "Protosynthesis",
  item: "Booster Energy",
  nature: "Jolly",
  evs: { attack: 252, defense: 4, speed: 252 },
  moves: ["Headlong Rush", "Close Combat", "Ice Spinner", "Knock Off"],
});

const SAMPLE_DEFENDER = createSideForm({
  name: "Kingambit",
  ability: "Supreme Overlord",
  item: "Leftovers",
  nature: "Adamant",
  evs: { hp: 252, attack: 252, specialDefense: 4 },
});

// Saved sets use PokéAPI slugs; the form shows the library's names.
function formFromSaved(pokemon: SavedPokemon): SideForm {
  return createSideForm(toCalcSet(gen, pokemon));
}

// useReducer's initializer: runs once, on the first render.
export function createInitialCalcState(
  linkedPokemon: SavedPokemon | null,
): CalcState {
  return {
    attacker: linkedPokemon ? formFromSaved(linkedPokemon) : SAMPLE_ATTACKER,
    defender: SAMPLE_DEFENDER,
    conditions: DEFAULT_CONDITIONS,
  };
}

function updateSide(
  state: CalcState,
  side: Side,
  changes: Partial<SideForm>,
): CalcState {
  return { ...state, [side]: { ...state[side], ...changes } };
}

export function calcReducer(state: CalcState, action: CalcAction): CalcState {
  switch (action.type) {
    case "setSpecies":
      return updateSide(state, action.side, {
        name: action.name,
        ability: getDefaultAbility(action.name),
      });

    case "updateSide":
      return updateSide(state, action.side, action.changes);

    case "setStat": {
      const form = state[action.side];

      return updateSide(state, action.side, {
        [action.kind]: { ...form[action.kind], [action.stat]: action.value },
      });
    }

    // Only the attacker has move inputs.
    case "setMove":
      return updateSide(state, "attacker", {
        moves: state.attacker.moves.map((move, index) =>
          index === action.index ? action.move : move,
        ),
      });

    case "loadSaved":
      return { ...state, [action.side]: formFromSaved(action.pokemon) };

    case "swapSides":
      return { ...state, attacker: state.defender, defender: state.attacker };

    case "updateConditions":
      return {
        ...state,
        conditions: { ...state.conditions, ...action.changes },
      };

    default: {
      // Adding an action type without a case above fails type-checking here.
      const unhandled: never = action;
      throw new Error(`Unknown calculator action: ${JSON.stringify(unhandled)}`);
    }
  }
}
