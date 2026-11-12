import type { PokeApiPokemon, PokeApiType } from "./team-analysis";

/*
|--------------------------------------------------------------------------
| PokéAPI Client
|--------------------------------------------------------------------------
|
| The few PokéAPI requests team analysis makes, typed and cached. The
| cache holds promises, not results, so two callers asking for the same
| type at once share one request.
|
*/

const BASE_URL = "https://pokeapi.co/api/v2";

/** A /pokemon response: what the analysis reads, plus the chart's artwork. */
export type PokemonDetails = PokeApiPokemon & {
  sprites: {
    front_default: string | null;
    other: { "official-artwork": { front_default: string | null } };
  };
};

export type PokeApiMove = { name: string; type: { name: string } };

const cache = new Map<string, Promise<unknown>>();

function getJson<T>(path: string, description: string): Promise<T> {
  let request = cache.get(path) as Promise<T> | undefined;

  if (!request) {
    request = fetch(`${BASE_URL}/${path}`).then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load ${description}.`);
      }

      return response.json() as Promise<T>;
    });

    // A failed request shouldn't stay cached.
    request.catch(() => cache.delete(path));
    cache.set(path, request);
  }

  return request;
}

export function fetchPokemon(id: number): Promise<PokemonDetails> {
  return getJson(`pokemon/${id}`, `Pokémon #${id}`);
}

export function fetchType(name: string): Promise<PokeApiType> {
  return getJson(`type/${name}`, `type ${name}`);
}

export function fetchMove(name: string): Promise<PokeApiMove> {
  return getJson(`move/${name}`, `move ${name}`);
}
