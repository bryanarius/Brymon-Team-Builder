import { useState } from "react";
import { Combobox } from "../components/Combobox";
import { CalcCredit } from "./CalcCredit";
import { gen, moveNames } from "./calc-data";
import {
  calculateMatchup,
  createSideForm,
  DEFAULT_CONDITIONS,
  type ConditionsForm,
  type SideForm,
} from "./calc-form";
import { ConditionsPanel } from "./ConditionsPanel";
import { ResultsPanel } from "./ResultsPanel";
import { SidePanel, type SavedPokemon, type SavedTeam } from "./SidePanel";
import { toCalcSet } from "./damage-calc";

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

type DamageCalculatorProps = {
  savedTeams: SavedTeam[] | null;
  linkedPokemon: SavedPokemon | null;
};

export function DamageCalculator({
  savedTeams,
  linkedPokemon,
}: DamageCalculatorProps) {
  const [attacker, setAttacker] = useState(() =>
    linkedPokemon ? formFromSaved(linkedPokemon) : SAMPLE_ATTACKER,
  );
  const [defender, setDefender] = useState(SAMPLE_DEFENDER);
  const [conditions, setConditions] =
    useState<ConditionsForm>(DEFAULT_CONDITIONS);

  // Recalculated on every render, i.e. whenever any input changes.
  const matchup = calculateMatchup(attacker, defender, conditions);

  function swapSides() {
    setAttacker(defender);
    setDefender(attacker);
  }

  function setMove(index: number, move: string) {
    setAttacker({
      ...attacker,
      moves: attacker.moves.map((current, i) => (i === index ? move : current)),
    });
  }

  return (
    <>
      <ResultsPanel matchup={matchup} onSwap={swapSides} />

      <div className="calc-sides">
        <SidePanel
          side="attacker"
          title="Attacker"
          form={attacker}
          onChange={setAttacker}
          savedTeams={savedTeams}
          onLoadSaved={(pokemon) => setAttacker(formFromSaved(pokemon))}
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
                onChange={(nextMove) => setMove(index, nextMove)}
              />
            ))}

            <label className="calc-checkbox">
              <input
                type="checkbox"
                id="calc-critical-hit"
                checked={conditions.criticalHit}
                onChange={(event) =>
                  setConditions({
                    ...conditions,
                    criticalHit: event.target.checked,
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
          onChange={setDefender}
          savedTeams={savedTeams}
          onLoadSaved={(pokemon) => setDefender(formFromSaved(pokemon))}
        />
      </div>

      <ConditionsPanel conditions={conditions} onChange={setConditions} />

      <CalcCredit libraryUrl="https://github.com/smogon/damage-calc" />
    </>
  );
}
