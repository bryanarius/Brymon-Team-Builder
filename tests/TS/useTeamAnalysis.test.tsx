// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import type { TeamPokemon } from "../../resources/ts/analysis/team-analysis";
import { charizardAndGyarados, fakePokeApi } from "./fake-pokeapi";

/*
 * The hook on its own, for what the panel's tests can't reach: the team
 * changing after a result has already arrived.
 */

beforeEach(() => {
  // A fresh pokeapi.ts cache per test (see TeamAnalysis.test.tsx).
  vi.resetModules();
  fakePokeApi.mockClear();
  vi.stubGlobal("fetch", fakePokeApi);
});

async function renderUseTeamAnalysis(team: TeamPokemon[]) {
  const { useTeamAnalysis } = await import("../../resources/ts/analysis/useTeamAnalysis");

  return renderHook(({ team }) => useTeamAnalysis(team), { initialProps: { team } });
}

const memberNames = (state: { status: string; analysis?: { chartMembers: { name: string }[] } }) =>
  state.analysis?.chartMembers.map((member) => member.name);

test("goes from loading to ready", async () => {
  const { result } = await renderUseTeamAnalysis(charizardAndGyarados);

  expect(result.current.status).toBe("loading");

  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(memberNames(result.current)).toEqual(["Charizard", "Gyarados"]);
});

test("a new team shows loading, not the previous team's analysis", async () => {
  const { result, rerender } = await renderUseTeamAnalysis(charizardAndGyarados);

  await waitFor(() => expect(result.current.status).toBe("ready"));

  const gyaradosOnly = charizardAndGyarados.slice(1);

  rerender({ team: gyaradosOnly });

  expect(result.current.status).toBe("loading");

  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(memberNames(result.current)).toEqual(["Gyarados"]);
});

test("an empty team is reported as empty", async () => {
  const { result } = await renderUseTeamAnalysis([]);

  expect(result.current).toEqual({ status: "empty" });
  expect(fakePokeApi).not.toHaveBeenCalled();
});
