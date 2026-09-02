"use strict";

/*
|--------------------------------------------------------------------------
| Pokédex
|--------------------------------------------------------------------------
|
| Standalone browsable index of every Pokémon. All data comes from
| PokéAPI on the client; the PHP side only renders the page shell.
|
| One-time load: the national dex list plus every /type endpoint, which
| together give each Pokémon its id, name, and types. Everything after
| that (filtering, sorting) happens in memory with no further requests.
|
*/

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#pokedex-grid");
  const statusElement = document.querySelector("#pokedex-status");
  const countElement = document.querySelector("#pokedex-count");
  const searchInput = document.querySelector("#pokedex-search");
  const typeSelect = document.querySelector("#pokedex-type");
  const generationSelect = document.querySelector("#pokedex-generation");
  const sortSelect = document.querySelector("#pokedex-sort");
  const clearButton = document.querySelector("#pokedex-clear");

  if (
    !grid ||
    !statusElement ||
    !countElement ||
    !searchInput ||
    !typeSelect ||
    !generationSelect ||
    !sortSelect
  ) {
    return;
  }

  const NATIONAL_DEX_TOTAL = 1025;

  const OFFICIAL_ARTWORK_BASE =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/" +
    "pokemon/other/official-artwork";

  const TYPES = [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy",
  ];

  // National Dex number ranges per generation.
  const GENERATIONS = [
    { value: "1", label: "Generation I", min: 1, max: 151 },
    { value: "2", label: "Generation II", min: 152, max: 251 },
    { value: "3", label: "Generation III", min: 252, max: 386 },
    { value: "4", label: "Generation IV", min: 387, max: 493 },
    { value: "5", label: "Generation V", min: 494, max: 649 },
    { value: "6", label: "Generation VI", min: 650, max: 721 },
    { value: "7", label: "Generation VII", min: 722, max: 809 },
    { value: "8", label: "Generation VIII", min: 810, max: 905 },
    { value: "9", label: "Generation IX", min: 906, max: 1025 },
  ];

  const state = {
    pokemon: [],
    ready: false,
  };

  populateTypeFilter();
  populateGenerationFilter();
  initialize();

  async function initialize() {
    setStatus("Loading Pokédex…");

    try {
      const responses = await Promise.all([
        fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=${NATIONAL_DEX_TOTAL}`,
        ),
        ...TYPES.map((typeName) =>
          fetch(`https://pokeapi.co/api/v2/type/${typeName}`),
        ),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Pokédex data request failed.");
      }

      const [listData, ...typeData] = await Promise.all(
        responses.map((response) => response.json()),
      );

      const typesByPokemon = buildTypeMap(typeData);

      state.pokemon = listData.results
        .map((entry) => ({
          id: idFromUrl(entry.url),
          name: entry.name,
        }))
        .filter(
          (entry) =>
            Number.isInteger(entry.id) &&
            entry.id >= 1 &&
            entry.id <= NATIONAL_DEX_TOTAL,
        )
        .map((entry) => ({
          ...entry,
          types: typesByPokemon.get(entry.name) ?? [],
        }));

      state.ready = true;

      statusElement.hidden = true;
      renderGrid(state.pokemon);
    } catch (error) {
      console.error("Pokédex load error:", error);
      setStatus("Unable to load the Pokédex. Please refresh the page.");
    }
  }

  function buildTypeMap(typeData) {
    const map = new Map();

    typeData.forEach((type) => {
      type.pokemon.forEach(({ slot, pokemon }) => {
        if (!map.has(pokemon.name)) {
          map.set(pokemon.name, []);
        }

        map.get(pokemon.name).push({ slot, name: type.name });
      });
    });

    map.forEach((entries, name) => {
      map.set(
        name,
        entries
          .sort((first, second) => first.slot - second.slot)
          .map((entry) => entry.name),
      );
    });

    return map;
  }

  function renderGrid(list) {
    const fragment = document.createDocumentFragment();

    list.forEach((pokemon) => {
      fragment.appendChild(createCard(pokemon));
    });

    grid.replaceChildren(fragment);
  }

  function createCard(pokemon) {
    const card = document.createElement("article");
    card.className = "pokedex-card";
    card.dataset.id = String(pokemon.id);
    card.dataset.name = pokemon.name;

    const number = document.createElement("span");
    number.className = "pokedex-card-number";
    number.textContent = `#${String(pokemon.id).padStart(4, "0")}`;

    const image = document.createElement("img");
    image.className = "pokedex-card-sprite";
    image.src = `${OFFICIAL_ARTWORK_BASE}/${pokemon.id}.png`;
    image.alt = formatName(pokemon.name);
    image.loading = "lazy";
    image.width = 120;
    image.height = 120;

    const name = document.createElement("h2");
    name.className = "pokedex-card-name";
    name.textContent = formatName(pokemon.name);

    const typeList = document.createElement("div");
    typeList.className = "pokedex-card-types";

    pokemon.types.forEach((typeName) => {
      const badge = document.createElement("span");
      badge.className = `pokemon-type-badge pokemon-type-${typeName}`;
      badge.textContent = formatName(typeName);

      typeList.appendChild(badge);
    });

    card.append(number, image, name, typeList);

    return card;
  }

  function populateTypeFilter() {
    const fragment = document.createDocumentFragment();

    TYPES.forEach((typeName) => {
      const option = document.createElement("option");
      option.value = typeName;
      option.textContent = formatName(typeName);

      fragment.appendChild(option);
    });

    typeSelect.appendChild(fragment);
  }

  function populateGenerationFilter() {
    const fragment = document.createDocumentFragment();

    GENERATIONS.forEach((generation) => {
      const option = document.createElement("option");
      option.value = generation.value;
      option.textContent = generation.label;

      fragment.appendChild(option);
    });

    generationSelect.appendChild(fragment);
  }

  function setStatus(message) {
    statusElement.hidden = false;
    statusElement.textContent = message;
  }

  function idFromUrl(url) {
    const segments = String(url).split("/").filter(Boolean);

    return Number(segments[segments.length - 1]);
  }

  function formatName(value) {
    return String(value)
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
});
