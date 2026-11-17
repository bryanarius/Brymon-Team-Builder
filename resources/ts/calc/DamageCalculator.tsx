import { useReducer } from "react";
import { Combobox } from "../components/Combobox";
import { CalcCredit } from "./CalcCredit";
import { moveNames } from "./calc-data";
import { calculateMatchup } from "./calc-form";
import { calcReducer, createInitialCalcState } from "./calc-reducer";
import { ConditionsPanel } from "./ConditionsPanel";
import { ResultsPanel } from "./ResultsPanel";
import { SidePanel, type SavedPokemon, type SavedTeam } from "./SidePanel";

type DamageCalculatorProps = {
  savedTeams: SavedTeam[] | null;
  linkedPokemon: SavedPokemon | null;
};

export function DamageCalculator({
  savedTeams,
  linkedPokemon,
}: DamageCalculatorProps) {
  // The third argument builds the first state lazily, once.
  const [state, dispatch] = useReducer(
    calcReducer,
    linkedPokemon,
    createInitialCalcState,
  );
  const { attacker, defender, conditions } = state;

  // Recalculated on every render, i.e. whenever any input changes.
  const matchup = calculateMatchup(attacker, defender, conditions);

  return (
    <>
      <ResultsPanel
        matchup={matchup}
        onSwap={() => dispatch({ type: "swapSides" })}
      />

      <div className="calc-sides">
        <SidePanel
          side="attacker"
          title="Attacker"
          form={attacker}
          savedTeams={savedTeams}
          dispatch={dispatch}
        >
          <fieldset className="calc-moves">
            <legend>Moves</legend>

            {attacker.moves.map((move, index) => (
              <Combobox
                key={index}
                id={`calc-attacker-move-${index + 1}`}
                value={move}
                options={moveNames}
                placeholder={`Move ${index + 1}`}
                ariaLabel={`Move ${index + 1}`}
                listLabel={`Move ${index + 1} options`}
                onChange={(nextMove) =>
                  dispatch({ type: "setMove", index, move: nextMove })
                }
              />
            ))}

            <label className="calc-checkbox">
              <input
                type="checkbox"
                id="calc-critical-hit"
                checked={conditions.criticalHit}
                onChange={(event) =>
                  dispatch({
                    type: "updateConditions",
                    changes: { criticalHit: event.target.checked },
                  })
                }
              />
              Critical hit
            </label>
          </fieldset>
        </SidePanel>

        <SidePanel
          side="defender"
          title="Defender"
          form={defender}
          savedTeams={savedTeams}
          dispatch={dispatch}
        />
      </div>

      <ConditionsPanel conditions={conditions} dispatch={dispatch} />

      <CalcCredit libraryUrl="https://github.com/smogon/damage-calc" />
    </>
  );
}
