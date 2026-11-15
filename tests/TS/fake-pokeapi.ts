import { vi } from "vitest";
import type { TeamPokemon } from "../../resources/ts/analysis/team-analysis";

/*
 * A stand-in for PokéAPI, used as `fetch` in team analysis tests. Type
 * matchups come from type-chart.js (loaded in setup.ts), so this only
 * needs what the analysis fetches: Pokémon, moves, and the type relations
 * behind recommendations and coverage.
 */

function pokemon(id: number, name: string, types: string[]) {
  return {
    id,
    name,
    types: types.map((type) => ({ type: { name: type } })),
    stats: ["hp", "attack", "defense", "special-attack", "special-defense", "speed"].map(
      (stat) => ({ base_stat: 80, stat: { name: stat } }),
    ),
    sprites: {
      front_default: null,
      other: { "official-artwork": { front_default: `/art/${id}.png` } },
    },
  };
}

const named = (names: string[]) => names.map((name) => ({ name }));

function type(name: string, doubleTo: string[] = [], halfFrom: string[] = []) {
  return {
    name,
    damage_relations: {
      double_damage_to: named(doubleTo),
      half_damage_from: named(halfFrom),
      no_damage_from: [],
    },
  };
}

const POKEAPI: Record<string, unknown> = {
  "pokemon/6": pokemon(6, "charizard", ["fire", "flying"]),
  "pokemon/130": pokemon(130, "gyarados", ["water", "flying"]),
  "move/flamethrower": { name: "flamethrower", type: { name: "fire" } },
  "type/fire": type("fire", ["grass", "ice", "bug", "steel"]),
  "type/steel": type("steel", [], ["rock"]),
  "type/ground": type("ground", [], ["rock"]),
  "type/fighting": type("fighting", [], ["rock"]),
};

/** Answers like PokéAPI; unknown Pokémon and moves get a 404. */
export const fakePokeApi = vi.fn(async (url: string) => {
  const path = url.replace("https://pokeapi.co/api/v2/", "");
  // Types this fake doesn't describe have no special relations.
  const body = POKEAPI[path] ?? (path.startsWith("type/") ? type(path.slice(5)) : null);

  return { ok: body !== null, json: async () => body };
});

export const charizardAndGyarados: TeamPokemon[] = [
  { pokemonApiId: 6, name: "charizard", ability: "blaze", moves: ["flamethrower"] },
  { pokemonApiId: 130, name: "gyarados", ability: "intimidate", moves: [] },
];
