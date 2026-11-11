import type { ReactNode } from "react";
import { Combobox } from "../components/Combobox";
import { TypeBadge } from "../components/TypeBadge";
import {
  abilityNames,
  BOOST_LEVELS,
  formatBoost,
  formatNatureLabel,
  gen,
  getCalcDisplayName,
  getDefaultAbility,
  itemNames,
  natures,
  speciesNames,
  STAT_LABELS,
  STATS,
  STATUSES,
  TERA_TYPES,
} from "./calc-data";
import { toBuilderSet, type SideForm, type StatKind } from "./calc-form";
import {
  BUILDER_STAT_TO_CALC_STAT,
  createCalcPokemon,
  type BuilderSet,
  type BuilderStat,
} from "./damage-calc";

export type Side = "attacker" | "defender";

export type SavedPokemon = BuilderSet & {
  slot: number;
  nickname?: string;
};

export type SavedTeam = {
  id: number;
  name: string;
  pokemon: SavedPokemon[];
};

type SidePanelProps = {
  side: Side;
  title: string;
  form: SideForm;
  onChange: (form: SideForm) => void;
  // null when signed out, [] when signed in without saved teams.
  savedTeams: SavedTeam[] | null;
  onLoadSaved: (pokemon: SavedPokemon) => void;
  // The attacker's moves.
  children?: ReactNode;
};

export function SidePanel({
  side,
  title,
  form,
  onChange,
  savedTeams,
  onLoadSaved,
  children,
}: SidePanelProps) {
  const fieldId = (name: string) => `calc-${side}-${name}`;

  const update = (changes: Partial<SideForm>) =>
    onChange({ ...form, ...changes });

  const updateStat = (kind: StatKind, stat: BuilderStat, value: string) =>
    update({ [kind]: { ...form[kind], [stat]: value } });

  const set = toBuilderSet(form);

  // Types and final stats. Unknown or empty Pokémon show dashes.
  const pokemon = findPokemon(set);

  const evTotal = Object.values(set.evs).reduce((sum, ev) => sum + ev, 0);

  return (
    <section
      className="calc-panel calc-side"
      id={`calc-${side}`}
      data-side={side}
      aria-labelledby={fieldId("heading")}
    >
      <header className="calc-side-header">
        <h2 id={fieldId("heading")}>{title}</h2>

        <div className="calc-types" id={fieldId("types")}>
          {pokemon?.types.map((type) => <TypeBadge key={type} type={type} />)}

          {pokemon && form.teraType && (
            <>
              <span className="calc-tera">Tera</span>
              <TypeBadge type={form.teraType} />
            </>
          )}
        </div>
      </header>

      <SavedPokemonPicker
        id={fieldId("saved")}
        savedTeams={savedTeams}
        onLoad={onLoadSaved}
      />

      <div className="calc-fields">
        <div className="form-group">
          <label htmlFor={fieldId("species")}>Pokémon</label>

          <Combobox
            id={fieldId("species")}
            value={form.name}
            options={speciesNames}
            formatLabel={getCalcDisplayName}
            placeholder="Search Pokémon"
            listLabel={`${title} Pokémon options`}
            onChange={(name) =>
              update({ name, ability: getDefaultAbility(name) })
            }
          />
        </div>

        <div className="form-group">
          <label htmlFor={fieldId("level")}>Level</label>

          <input
            type="number"
            id={fieldId("level")}
            min="1"
            max="100"
            value={form.level}
            onChange={(event) => update({ level: event.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor={fieldId("ability")}>Ability</label>

          <Combobox
            id={fieldId("ability")}
            value={form.ability}
            options={abilityNames}
            placeholder="Search abilities"
            listLabel={`${title} ability options`}
            onChange={(ability) => update({ ability })}
          />
        </div>

        <div className="form-group">
          <label htmlFor={fieldId("item")}>Item</label>

          <Combobox
            id={fieldId("item")}
            value={form.item}
            options={itemNames}
            placeholder="No item"
            listLabel={`${title} item options`}
            onChange={(item) => update({ item })}
          />
        </div>

        <div className="form-group">
          <label htmlFor={fieldId("nature")}>Nature</label>

          <select
            id={fieldId("nature")}
            value={form.nature}
            onChange={(event) => update({ nature: event.target.value })}
          >
            {natures.map((nature) => (
              <option key={nature.name} value={nature.name}>
                {formatNatureLabel(nature)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={fieldId("tera")}>Tera Type</label>

          <select
            id={fieldId("tera")}
            value={form.teraType}
            onChange={(event) => update({ teraType: event.target.value })}
          >
            <option value="">Not Terastallized</option>

            {TERA_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor={fieldId("status")}>Status</label>

          <select
            id={fieldId("status")}
            value={form.status}
            onChange={(event) =>
              update({ status: event.target.value as SideForm["status"] })
            }
          >
            {STATUSES.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="calc-stats-wrapper">
        <table className="calc-stats">
          <caption className="visually-hidden">{title} stats</caption>

          <thead>
            <tr>
              <th scope="col">Stat</th>
              <th scope="col">Base</th>
              <th scope="col">EVs</th>
              <th scope="col">IVs</th>
              <th scope="col">Boost</th>
              <th scope="col">Total</th>
            </tr>
          </thead>

          <tbody>
            {STATS.map((stat) => {
              const label = STAT_LABELS[stat];
              const calcStat = BUILDER_STAT_TO_CALC_STAT[stat];

              return (
                <tr key={stat} data-stat={stat}>
                  <th scope="row">{label}</th>

                  <td data-role="base">
                    {pokemon ? pokemon.species.baseStats[calcStat] : "-"}
                  </td>

                  <td>
                    <input
                      type="number"
                      data-role="ev"
                      min="0"
                      max="252"
                      step="4"
                      value={form.evs[stat]}
                      aria-label={`${title} ${label} EVs`}
                      onChange={(event) =>
                        updateStat("evs", stat, event.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      data-role="iv"
                      min="0"
                      max="31"
                      value={form.ivs[stat]}
                      aria-label={`${title} ${label} IVs`}
                      onChange={(event) =>
                        updateStat("ivs", stat, event.target.value)
                      }
                    />
                  </td>

                  <td>
                    {/* HP can't be boosted. */}
                    {stat !== "hp" && (
                      <select
                        data-role="boost"
                        value={form.boosts[stat]}
                        aria-label={`${title} ${label} boost`}
                        onChange={(event) =>
                          updateStat("boosts", stat, event.target.value)
                        }
                      >
                        {BOOST_LEVELS.map((boost) => (
                          <option key={boost} value={String(boost)}>
                            {formatBoost(boost)}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>

                  <td data-role="total">
                    {pokemon ? pokemon.stats[calcStat] : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="calc-ev-total">
          EVs used:{" "}
          <span
            data-role="ev-total"
            className={evTotal > 510 ? "is-over-limit" : undefined}
          >
            {evTotal}
          </span>
          /510
        </p>
      </div>

      {children}
    </section>
  );
}

function findPokemon(set: BuilderSet) {
  try {
    return set.name ? createCalcPokemon(gen, set) : null;
  } catch {
    return null;
  }
}

type SavedPokemonPickerProps = {
  id: string;
  savedTeams: SavedTeam[] | null;
  onLoad: (pokemon: SavedPokemon) => void;
};

function SavedPokemonPicker({ id, savedTeams, onLoad }: SavedPokemonPickerProps) {
  if (savedTeams === null) {
    return (
      <p className="calc-saved-hint">
        <a href="/login">Sign in</a> to load Pokémon from your saved teams.
      </p>
    );
  }

  if (savedTeams.length === 0) {
    return (
      <p className="calc-saved-hint">
        Save a team in the <a href="/teambuilder">Team Builder</a> to load its
        Pokémon here.
      </p>
    );
  }

  function handleChange(choice: string) {
    const [teamId, slot] = choice.split(":");
    const pokemon = savedTeams
      ?.find((team) => String(team.id) === teamId)
      ?.pokemon.find((entry) => String(entry.slot) === slot);

    if (pokemon) {
      onLoad(pokemon);
    }
  }

  return (
    <div className="form-group calc-saved">
      <label htmlFor={id}>Load a saved Pokémon</label>

      {/* Always shows the prompt, so the same Pokémon can be loaded again
          after editing it. */}
      <select
        id={id}
        value=""
        onChange={(event) => handleChange(event.target.value)}
      >
        <option value="">Choose from your teams</option>

        {/* One group per team: "Tusky (Great Tusk)", or just "Great Tusk". */}
        {savedTeams.map((team) => (
          <optgroup key={team.id} label={team.name}>
            {team.pokemon.map((pokemon) => {
              const displayName = formatPokemonDisplayName(pokemon.name);

              return (
                <option
                  key={pokemon.slot}
                  value={`${team.id}:${pokemon.slot}`}
                >
                  {pokemon.nickname
                    ? `${pokemon.nickname} (${displayName})`
                    : displayName}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
