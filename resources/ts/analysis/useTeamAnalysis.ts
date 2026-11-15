import { useEffect, useState } from "react";
import { loadTeamAnalysis, type TeamAnalysisResult } from "./load-team-analysis";
import type { TeamPokemon } from "./team-analysis";

export type TeamAnalysisState =
  | { status: "empty" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; analysis: TeamAnalysisResult };

type Settled =
  | { status: "error" }
  | { status: "ready"; analysis: TeamAnalysisResult };

/**
 * Loads the analysis for `team` and reports where it is: empty team,
 * loading, failed, or ready. Pass the same array between renders (not a
 * new one each time), or it will reload.
 */
export function useTeamAnalysis(team: TeamPokemon[]): TeamAnalysisState {
  // The latest finished load, and which team it was for.
  const [settled, setSettled] = useState<{ team: TeamPokemon[]; result: Settled } | null>(
    null,
  );

  useEffect(() => {
    if (team.length === 0) {
      return;
    }

    // Ignore a result that arrives after the team changed or the
    // component unmounted.
    let current = true;

    loadTeamAnalysis(team)
      .then((analysis) => {
        if (current) {
          setSettled({ team, result: { status: "ready", analysis } });
        }
      })
      .catch((error: unknown) => {
        console.error("Team analysis error:", error);

        if (current) {
          setSettled({ team, result: { status: "error" } });
        }
      });

    return () => {
      current = false;
    };
  }, [team]);

  if (team.length === 0) {
    return { status: "empty" };
  }

  // A result for a previous team is stale: the new team is still loading.
  if (settled?.team !== team) {
    return { status: "loading" };
  }

  return settled.result;
}
