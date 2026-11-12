import type { ReactNode } from "react";
import { sortPokemonEntries, type PokemonEntry } from "./team-analysis";

type AnalysisItemProps = {
  // The type or role badge at the start of the row.
  badge: ReactNode;
  pokemon: PokemonEntry[];
  severity?: { label: string; className: string };
  heading: string;
  showMultipliers?: boolean;
  recommendation?: string | null;
};

/** One expandable row: "[Rock] 2 Pokémon Minor ⌄", then who and why. */
export function AnalysisItem({
  badge,
  pokemon,
  severity,
  heading,
  showMultipliers = false,
  recommendation,
}: AnalysisItemProps) {
  return (
    <details className="analysis-type-item analysis-type-details">
      <summary className="analysis-type-summary">
        {badge}

        <div className="analysis-type-item-content">
          <strong>{pokemon.length} Pokémon</strong>

          {severity && (
            <span className={`analysis-severity ${severity.className}`}>
              {severity.label}
            </span>
          )}
        </div>

        <span className="analysis-expand-icon" aria-hidden="true">
          ⌄
        </span>
      </summary>

      <div className="analysis-pokemon-breakdown">
        <p className="analysis-breakdown-heading">{heading}</p>

        <ul className="analysis-pokemon-list">
          {sortPokemonEntries(pokemon).map((entry, index) => (
            // Two of the same species can share a name, so the index is
            // part of the key.
            <li key={`${entry.name}-${index}`}>
              <span>{formatPokemonDisplayName(entry.name)}</span>

              {showMultipliers && (entry.multiplier ?? 0) > 1 && (
                <strong className="analysis-damage-multiplier">
                  {entry.multiplier}×
                </strong>
              )}
            </li>
          ))}
        </ul>

        {recommendation && (
          <p className="analysis-recommendation">{recommendation}</p>
        )}
      </div>
    </details>
  );
}
