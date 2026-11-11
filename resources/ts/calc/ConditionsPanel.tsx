import type { ConditionsForm } from "./calc-form";

type ConditionsPanelProps = {
  conditions: ConditionsForm;
  onChange: (conditions: ConditionsForm) => void;
};

const SCREENS = [
  ["reflect", "calc-reflect", "Reflect"],
  ["lightScreen", "calc-light-screen", "Light Screen"],
  ["auroraVeil", "calc-aurora-veil", "Aurora Veil"],
] as const;

export function ConditionsPanel({ conditions, onChange }: ConditionsPanelProps) {
  const update = (changes: Partial<ConditionsForm>) =>
    onChange({ ...conditions, ...changes });

  return (
    <section
      className="calc-panel calc-conditions"
      aria-labelledby="calc-conditions-heading"
    >
      <h2 id="calc-conditions-heading">Battle Conditions</h2>

      <div className="calc-fields">
        <div className="form-group">
          <label htmlFor="calc-game-type">Battle</label>

          <select
            id="calc-game-type"
            value={conditions.gameType}
            onChange={(event) =>
              update({
                gameType: event.target.value as ConditionsForm["gameType"],
              })
            }
          >
            <option value="Singles">Singles</option>
            <option value="Doubles">Doubles</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="calc-weather">Weather</label>

          <select
            id="calc-weather"
            value={conditions.weather}
            onChange={(event) =>
              update({
                weather: event.target.value as ConditionsForm["weather"],
              })
            }
          >
            <option value="">None</option>
            <option value="Sun">Sun</option>
            <option value="Rain">Rain</option>
            <option value="Sand">Sandstorm</option>
            <option value="Snow">Snow</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="calc-terrain">Terrain</label>

          <select
            id="calc-terrain"
            value={conditions.terrain}
            onChange={(event) =>
              update({
                terrain: event.target.value as ConditionsForm["terrain"],
              })
            }
          >
            <option value="">None</option>
            <option value="Electric">Electric</option>
            <option value="Grassy">Grassy</option>
            <option value="Psychic">Psychic</option>
            <option value="Misty">Misty</option>
          </select>
        </div>

        <fieldset className="calc-screens">
          <legend>Defender's side</legend>

          {SCREENS.map(([key, id, label]) => (
            <label key={key} className="calc-checkbox">
              <input
                type="checkbox"
                id={id}
                checked={conditions[key]}
                onChange={(event) => update({ [key]: event.target.checked })}
              />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
    </section>
  );
}
