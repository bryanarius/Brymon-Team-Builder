// @vitest-environment jsdom
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { useCalcState } from "../../resources/ts/calc/calc-context";
import { DamageCalculator } from "../../resources/ts/calc/DamageCalculator";
import type { SavedTeam } from "../../resources/ts/calc/SidePanel";

// The calculator as a user sees it: state flows through CalcProvider.

const savedTeams: SavedTeam[] = [
  {
    id: 12,
    name: "Rain",
    pokemon: [
      {
        slot: 2,
        name: "samurott-hisui",
        ability: "sharpness",
        item: "choice-band",
        nature: "adamant",
        evs: { attack: 252, speed: 252 },
        moves: ["ceaseless-edge", "aqua-cutter", "", ""],
      },
    ],
  },
];

function panel(name: "Attacker" | "Defender") {
  return within(screen.getByRole("region", { name }));
}

function speciesInput(name: "Attacker" | "Defender") {
  return panel(name).getByLabelText("Pokémon");
}

test("loading a saved Pokémon fills that side's panel", () => {
  render(<DamageCalculator savedTeams={savedTeams} linkedPokemon={null} />);

  fireEvent.change(panel("Defender").getByLabelText("Load a saved Pokémon"), {
    target: { value: "12:2" },
  });

  expect(speciesInput("Defender")).toHaveValue("Hisuian Samurott");
  expect(panel("Defender").getByLabelText("Item")).toHaveValue("Choice Band");
  // The other side is untouched.
  expect(speciesInput("Attacker")).toHaveValue("Great Tusk");
});

test("swapping moves each Pokémon to the other panel", () => {
  render(<DamageCalculator savedTeams={null} linkedPokemon={null} />);

  fireEvent.click(screen.getByRole("button", { name: /swap/i }));

  expect(speciesInput("Attacker")).toHaveValue("Kingambit");
  expect(speciesInput("Defender")).toHaveValue("Great Tusk");
});

test("a condition change reaches the panel that shows it", () => {
  render(<DamageCalculator savedTeams={null} linkedPokemon={null} />);

  const reflect = screen.getByLabelText("Reflect");
  fireEvent.click(reflect);

  expect(reflect).toBeChecked();
});

test("signed-out visitors get a sign-in link instead of saved teams", () => {
  render(<DamageCalculator savedTeams={null} linkedPokemon={null} />);

  expect(panel("Attacker").getByRole("link", { name: "Sign in" })).toBeInTheDocument();
  expect(panel("Attacker").queryByLabelText("Load a saved Pokémon")).toBeNull();
});

test("reading calculator state outside the provider fails loudly", () => {
  function Orphan() {
    useCalcState();
    return null;
  }

  // React logs the thrown error too; keep the test output quiet.
  vi.spyOn(console, "error").mockImplementation(() => {});

  expect(() => render(<Orphan />)).toThrow(
    "useCalcState must be used inside <CalcProvider>.",
  );

  vi.mocked(console.error).mockRestore();
});
