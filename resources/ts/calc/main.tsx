import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DamageCalculator } from "./DamageCalculator";
import type { SavedPokemon, SavedTeam } from "./SidePanel";

/*
|--------------------------------------------------------------------------
| Damage Calculator Island
|--------------------------------------------------------------------------
|
| PHP renders the page header and an empty mount point, plus the user's
| saved teams as JSON. React renders the whole calculator inside it.
|
*/

const root = document.getElementById("calc-root");

if (root) {
  const savedTeams = readSavedTeams(root);

  // A link from a saved team: /calc?team=12&slot=3.
  const params = new URLSearchParams(window.location.search);

  createRoot(root).render(
    <StrictMode>
      <DamageCalculator
        savedTeams={savedTeams}
        linkedPokemon={findSavedPokemon(
          savedTeams,
          params.get("team"),
          params.get("slot"),
        )}
      />
    </StrictMode>,
  );
}

// null for guests; [] for a signed-in user with no saved teams.
function readSavedTeams(root: HTMLElement): SavedTeam[] | null {
  if (root.dataset.signedIn !== "true") {
    return null;
  }

  const element = document.getElementById("calc-saved-teams");

  if (!element) {
    return [];
  }

  try {
    return JSON.parse(element.textContent ?? "[]") as SavedTeam[];
  } catch (error) {
    console.error("Couldn't read saved teams:", error);
    return [];
  }
}

function findSavedPokemon(
  savedTeams: SavedTeam[] | null,
  teamId: string | null,
  slot: string | null,
): SavedPokemon | null {
  return (
    savedTeams
      ?.find((team) => String(team.id) === teamId)
      ?.pokemon.find((pokemon) => String(pokemon.slot) === slot) ?? null
  );
}
