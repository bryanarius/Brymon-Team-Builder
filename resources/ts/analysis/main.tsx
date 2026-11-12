import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TeamAnalysis } from "./TeamAnalysis";
import type { TeamPokemon } from "./team-analysis";

/*
|--------------------------------------------------------------------------
| Team Analysis Island
|--------------------------------------------------------------------------
|
| PHP renders the team page, an empty mount point, and the team's saved
| sets as JSON. React renders the analysis panel inside the mount point.
|
*/

const root = document.getElementById("team-analysis-root");

if (root) {
  createRoot(root).render(
    <StrictMode>
      <TeamAnalysis team={readTeam()} />
    </StrictMode>,
  );
}

function readTeam(): TeamPokemon[] {
  const element = document.getElementById("team-analysis-data");

  try {
    return JSON.parse(element?.textContent ?? "[]") as TeamPokemon[];
  } catch (error) {
    console.error("Couldn't read the team:", error);
    return [];
  }
}
