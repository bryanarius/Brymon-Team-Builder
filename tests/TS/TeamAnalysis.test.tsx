// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import type { TeamPokemon } from "../../resources/ts/analysis/team-analysis";
import { charizardAndGyarados as team, fakePokeApi as fetchMock } from "./fake-pokeapi";

// The panel as a user sees it, with PokéAPI replaced by a fake `fetch`.

/*
 * pokeapi.ts caches requests for the life of the page. A fresh copy of
 * the modules per test keeps one test's cache out of the next.
 */
async function renderTeamAnalysis(teamPokemon: TeamPokemon[]) {
  const { TeamAnalysis } = await import("../../resources/ts/analysis/TeamAnalysis");

  render(<TeamAnalysis team={teamPokemon} />);
}

function card(title: string) {
  const heading = screen.getByRole("heading", { name: title });

  return within(heading.closest("article") as HTMLElement);
}

beforeEach(() => {
  vi.resetModules();
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
});

test("shows a loading message, then the analysis", async () => {
  await renderTeamAnalysis(team);

  expect(screen.getByRole("status")).toHaveTextContent("Loading team analysis...");

  expect(
    await screen.findByText("Rock is a minor shared weakness for 2 Pokémon."),
  ).toBeInTheDocument();
  expect(screen.queryByText("Loading team analysis...")).not.toBeInTheDocument();
});

test("shared weaknesses list who is weak, how badly, and what would help", async () => {
  await renderTeamAnalysis(team);
  await screen.findByRole("heading", { name: "Shared Weaknesses" });

  const weaknesses = card("Shared Weaknesses");
  const rock = within(
    weaknesses.getByText("Pokémon weak to Rock:").closest("details") as HTMLElement,
  );

  expect(rock.getByText("Minor")).toBeInTheDocument();
  expect(rock.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
    "Charizard4×",
    "Gyarados2×",
  ]);
  expect(
    rock.getByText("Consider a pokemon that is resistant (Fighting, Ground, Steel) to Rock."),
  ).toBeInTheDocument();
});

test("type coverage comes from the team's moves", async () => {
  await renderTeamAnalysis(team);
  await screen.findByRole("heading", { name: "Type Coverage" });

  const coverage = card("Type Coverage");

  expect(coverage.getByText("Super-effective against:")).toBeInTheDocument();
  expect(coverage.getByText("Steel")).toBeInTheDocument();
  expect(coverage.getByText("No coverage against:")).toBeInTheDocument();
});

test("the defensive chart is drawn for every team member", async () => {
  await renderTeamAnalysis(team);
  await screen.findByRole("heading", { name: "Defensive Coverage" });

  const chart = card("Defensive Coverage");

  expect(chart.getByRole("img", { name: "Charizard" })).toHaveAttribute("src", "/art/6.png");
  expect(chart.getAllByRole("row")).toHaveLength(19); // header + 18 types
});

test("each PokéAPI resource is requested once, even when two parts need it", async () => {
  await renderTeamAnalysis(team);
  await screen.findByRole("heading", { name: "Type Coverage" });

  // Fire is fetched for resistances and again for Flamethrower's coverage.
  const fireRequests = fetchMock.mock.calls.filter(([url]) => url.endsWith("/type/fire"));

  expect(fireRequests).toHaveLength(1);
});

test("a failed request shows an error instead of the analysis", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

  await renderTeamAnalysis([{ pokemonApiId: 9999 }]);

  expect(await screen.findByText("Unable to load team analysis.")).toBeInTheDocument();
  expect(consoleError).toHaveBeenCalled();

  consoleError.mockRestore();
});

test("an empty team asks for Pokémon without fetching anything", async () => {
  await renderTeamAnalysis([]);

  expect(screen.getByRole("status")).toHaveTextContent(
    "Add Pokémon to this team to view analysis.",
  );
  expect(fetchMock).not.toHaveBeenCalled();
});
