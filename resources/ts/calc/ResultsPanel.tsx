import { TypeBadge } from "../components/TypeBadge";
import {
  capitalizeFirst,
  formatCalcPercent,
  getCalcDisplayName,
} from "./calc-data";
import type { Matchup } from "./calc-form";
import type { MoveDamage } from "./damage-calc";

type ResultsPanelProps = {
  matchup: Matchup;
  onSwap: () => void;
};

export function ResultsPanel({ matchup, onSwap }: ResultsPanelProps) {
  return (
    <section
      className="calc-panel calc-results"
      aria-labelledby="calc-results-heading"
    >
      <header className="calc-results-header">
        <h2 id="calc-results-heading">Results</h2>

        <button
          type="button"
          className="calc-swap-button"
          id="calc-swap"
          onClick={onSwap}
        >
          ⇄ Swap attacker and defender
        </button>
      </header>

      <div id="calc-results" aria-live="polite">
        {matchup.kind === "message" ? (
          <p className="calc-message">{matchup.message}</p>
        ) : (
          <>
            <p className="calc-matchup">
              {getCalcDisplayName(matchup.attackerName)} attacking{" "}
              {getCalcDisplayName(matchup.defenderName)}
            </p>

            <ol className="calc-result-list">
              {matchup.results.map((result) => (
                <ResultItem key={result.move} result={result} />
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}

function ResultItem({ result }: { result: MoveDamage }) {
  const heading = (
    <div className="calc-result-heading">
      <span className="calc-result-move">{result.move}</span>
      <TypeBadge type={result.type} />
      <span className="calc-result-category">{result.category}</span>
    </div>
  );

  if (result.maxDamage === 0) {
    return (
      <li className="calc-result is-no-damage">
        {heading}
        <span className="calc-result-percent">0%</span>
        <div className="calc-damage-bar" aria-hidden="true" />
        <p className="calc-result-outcome">
          {result.category === "Status"
            ? "Status move: it doesn't deal damage."
            : "No effect: the defender is immune."}
        </p>
      </li>
    );
  }

  const className =
    result.maxPercent >= 100 ? "calc-result can-ohko" : "calc-result";

  return (
    <li className={className}>
      {heading}

      <span className="calc-result-percent">
        {formatCalcPercent(result.minPercent)} –{" "}
        {formatCalcPercent(result.maxPercent)}
      </span>

      {/* Solid up to the lowest roll, lighter up to the highest. */}
      <div className="calc-damage-bar" aria-hidden="true">
        <span
          className="calc-damage-max"
          style={{ width: `${Math.min(result.maxPercent, 100)}%` }}
        />
        <span
          className="calc-damage-min"
          style={{ width: `${Math.min(result.minPercent, 100)}%` }}
        />
      </div>

      <p className="calc-result-outcome">
        {capitalizeFirst(result.koChance) || "Not a KO"}
      </p>

      <p className="calc-result-description">{result.description}</p>
    </li>
  );
}
