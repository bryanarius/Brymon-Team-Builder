"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const generationSelect = document.querySelector("#pokemon-generation");
  const typeSelect = document.querySelector("#pokemon-type");
  const sortSelect = document.querySelector("#pokemon-sort");
  const searchInput = document.querySelector("#pokemon-search");
  const resultsContainer = document.querySelector("#pokemon-search-results");
  const resultCount = document.querySelector("#pokemon-result-count");
  const clearFiltersButton = document.querySelector("#clear-pokemon-filters");

  if (
    !searchInput ||
    !resultsContainer ||
    !resultCount ||
    !generationSelect ||
    !typeSelect ||
    !sortSelect
  ) {
    console.error("Team Builder search elements were not found.");
    return;
  }

  const state = {
    pokemonList: [],
    detailCache: new Map(),
    generationCache: new Map(),
    searchTimeout: null,
    filterVersion: 0,
  };

  initializePokemonBrowser();

  searchInput.addEventListener("input", () => {
    clearTimeout(state.searchTimeout);

    state.searchTimeout = setTimeout(() => {
      applyFilters();
    }, 250);
  });

  generationSelect.addEventListener("change", applyFilters);
  typeSelect.addEventListener("change", applyFilters);
  sortSelect.addEventListener("change", applyFilters);

  resultsContainer.addEventListener("click", async (event) => {
    const addButton = event.target.closest(".pokemon-result-add-button");

    if (!addButton) {
      return;
    }

    const pokemonName = addButton.dataset.pokemonName;

    if (!pokemonName) {
      return;
    }

    addButton.disabled = true;
    addButton.setAttribute("aria-busy", "true");

    try {
      const pokemon = await getPokemonDetails(pokemonName);

      console.log("Selected Pokémon:", pokemon);

      /*
       * The next step will be:
       * addPokemonToTeam(pokemon);
       */
    } catch (error) {
      console.error(error);
    } finally {
      addButton.disabled = false;
      addButton.removeAttribute("aria-busy");
    }
  });

  clearFiltersButton?.addEventListener("click", () => {
    searchInput.value = "";
    generationSelect.value = "";
    typeSelect.value = "";
    sortSelect.value = "name-asc";

    renderEmptyState(
      "Find a Pokémon",
      "Start typing a Pokémon name or choose a filter.",
    );

    updateResultCount(0);
  });

  async function initializePokemonBrowser() {
    renderStatus("Loading Pokémon...");

    try {
      const [pokemonResponse, generationResponse, typeResponse] =
        await Promise.all([
          fetch("https://pokeapi.co/api/v2/pokemon?limit=2000"),
          fetch("https://pokeapi.co/api/v2/generation?limit=20"),
          fetch("https://pokeapi.co/api/v2/type?limit=50"),
        ]);

      if (!pokemonResponse.ok || !generationResponse.ok || !typeResponse.ok) {
        throw new Error("Unable to load Pokémon filters.");
      }

      const pokemonData = await pokemonResponse.json();
      const generationData = await generationResponse.json();
      const typeData = await typeResponse.json();

      state.pokemonList = pokemonData.results.map((pokemon) => ({
        name: pokemon.name,
        url: pokemon.url,
        id: getPokemonIdFromUrl(pokemon.url),
      }));

      populateGenerationFilter(generationData.results);
      populateTypeFilter(typeData.results);

      renderEmptyState(
        "Find a Pokémon",
        "Start typing a Pokémon name or choose a filter.",
      );

      updateResultCount(0);
    } catch (error) {
      console.error(error);

      renderEmptyState(
        "Unable to load Pokémon",
        "Please refresh the page and try again.",
      );
    }
  }

  function populateGenerationFilter(generations) {
    const fragment = document.createDocumentFragment();

    generations.forEach((generation) => {
      const option = document.createElement("option");

      option.value = generation.name;
      option.textContent = formatGenerationName(generation.name);

      fragment.appendChild(option);
    });

    generationSelect.appendChild(fragment);
  }

  function formatGenerationName(name) {
    const romanNumeral = name.replace("generation-", "");

    return `Generation ${romanNumeral.toUpperCase()}`;
  }

  function populateTypeFilter(types) {
    const excludedTypes = new Set(["unknown", "shadow", "stellar"]);

    const validTypes = types
      .filter((type) => !excludedTypes.has(type.name))
      .sort((firstType, secondType) =>
        firstType.name.localeCompare(secondType.name),
      );

    const fragment = document.createDocumentFragment();

    validTypes.forEach((type) => {
      const option = document.createElement("option");

      option.value = type.name;
      option.textContent = formatPokemonName(type.name);

      fragment.appendChild(option);
    });

    typeSelect.appendChild(fragment);
  }
  async function applyFilters() {
    const query = normalizeSearchQuery(searchInput.value);
    const selectedGeneration = generationSelect.value;
    const selectedType = typeSelect.value;
    const selectedSort = sortSelect.value;

    state.filterVersion += 1;

    const currentFilterVersion = state.filterVersion;

    const hasSearch = query.length >= 2;
    const hasGeneration = selectedGeneration !== "";
    const hasType = selectedType !== "";

    if (!hasSearch && !hasGeneration && !hasType) {
      renderEmptyState(
        "Find a Pokémon",
        "Start typing a Pokémon name or choose a filter.",
      );

      updateResultCount(0);
      return;
    }

    let matches = [...state.pokemonList];

    if (hasSearch) {
      matches = matches.filter((pokemon) => {
        return normalizePokemonName(pokemon.name).includes(query);
      });
    }

    renderStatus("Filtering Pokémon...");

    try {
      let generationSpecies = null;

      if (hasGeneration) {
        generationSpecies = await getGenerationSpecies(selectedGeneration);
      }

      /*
       * Pokémon details contain both the Pokémon's type and its base
       * species. We cache every response, so repeated filtering gets
       * much faster.
       */
      const detailedMatches = await Promise.all(
        matches.map((pokemon) => getPokemonDetails(pokemon.name)),
      );

      if (currentFilterVersion !== state.filterVersion) {
        return;
      }

      let filteredPokemon = detailedMatches;

      if (hasGeneration && generationSpecies) {
        filteredPokemon = filteredPokemon.filter((pokemon) => {
          return generationSpecies.has(pokemon.species.name);
        });
      }

      if (hasType) {
        filteredPokemon = filteredPokemon.filter((pokemon) => {
          return pokemon.types.some((typeEntry) => {
            return typeEntry.type.name === selectedType;
          });
        });
      }

      sortPokemon(filteredPokemon, selectedSort);

      function sortPokemon(pokemon, sortValue) {
        pokemon.sort((firstPokemon, secondPokemon) => {
          switch (sortValue) {
            case "name-desc":
              return secondPokemon.name.localeCompare(firstPokemon.name);

            case "id-asc":
              return firstPokemon.id - secondPokemon.id;

            case "id-desc":
              return secondPokemon.id - firstPokemon.id;

            case "name-asc":
            default:
              return firstPokemon.name.localeCompare(secondPokemon.name);
          }
        });
      }

      updateResultCount(filteredPokemon.length);

      if (filteredPokemon.length === 0) {
        renderEmptyState(
          "No Pokémon found",
          "Try changing your search or filters.",
        );

        return;
      }

      renderPokemonResults(filteredPokemon.slice(0, 30));
    } catch (error) {
      console.error(error);

      if (currentFilterVersion !== state.filterVersion) {
        return;
      }

      renderEmptyState("Unable to filter Pokémon", "Please try again.");
    }
  }

  async function getGenerationSpecies(generationName) {
    if (state.generationCache.has(generationName)) {
      return state.generationCache.get(generationName);
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/generation/${encodeURIComponent(
        generationName,
      )}`,
    );

    if (!response.ok) {
      throw new Error(`Generation request failed: ${response.status}`);
    }

    const generation = await response.json();

    const speciesNames = new Set(
      generation.pokemon_species.map((species) => species.name),
    );

    state.generationCache.set(generationName, speciesNames);

    return speciesNames;
  }

  async function getPokemonDetails(name) {
    if (state.detailCache.has(name)) {
      return state.detailCache.get(name);
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`,
    );

    if (!response.ok) {
      throw new Error(`Pokémon request failed for ${name}: ${response.status}`);
    }

    const pokemon = await response.json();

    state.detailCache.set(name, pokemon);

    return pokemon;
  }

  function renderPokemonResults(pokemonResults) {
    const fragment = document.createDocumentFragment();

    pokemonResults.forEach((pokemon) => {
      fragment.appendChild(createPokemonResultCard(pokemon));
    });

    resultsContainer.replaceChildren(fragment);
  }

  function createPokemonResultCard(pokemon) {
    const result = document.createElement("article");
    result.className = "pokemon-search-result";

    const image = document.createElement("img");
    image.className = "pokemon-search-result-image";
    image.src =
      pokemon.sprites.front_default ??
      pokemon.sprites.other["official-artwork"].front_default ??
      "";
    image.alt = formatPokemonName(pokemon.name);
    image.loading = "lazy";
    image.width = 56;
    image.height = 56;

    const content = document.createElement("div");
    content.className = "pokemon-search-result-content";

    const headingRow = document.createElement("div");
    headingRow.className = "pokemon-search-result-heading";

    const name = document.createElement("strong");
    name.className = "pokemon-search-result-name";
    name.textContent = formatPokemonName(pokemon.name);

    const number = document.createElement("span");
    number.className = "pokemon-search-result-number";
    number.textContent = `#${String(pokemon.id).padStart(4, "0")}`;

    headingRow.append(name, number);

    const typeList = document.createElement("div");
    typeList.className = "pokemon-search-result-types";

    pokemon.types.forEach((typeEntry) => {
      const type = document.createElement("span");

      type.className = `pokemon-type-badge pokemon-type-${typeEntry.type.name}`;

      type.textContent = formatPokemonName(typeEntry.type.name);

      typeList.appendChild(type);
    });

    content.append(headingRow, typeList);

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "pokemon-result-add-button";
    addButton.dataset.pokemonName = pokemon.name;
    addButton.setAttribute(
      "aria-label",
      `Add ${formatPokemonName(pokemon.name)} to team`,
    );
    addButton.textContent = "+";

    result.append(image, content, addButton);

    return result;
  }

  function renderStatus(message) {
    const status = document.createElement("p");
    status.className = "pokemon-search-status";
    status.textContent = message;

    resultsContainer.replaceChildren(status);
  }

  function renderEmptyState(title, message) {
    const wrapper = document.createElement("div");
    wrapper.className = "pokemon-search-empty";

    const icon = document.createElement("span");
    icon.className = "search-empty-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "?";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    wrapper.append(icon, heading, paragraph);

    resultsContainer.replaceChildren(wrapper);
  }

  function updateResultCount(count) {
    resultCount.textContent = `${count} ${count === 1 ? "result" : "results"}`;
  }
});

function getPokemonIdFromUrl(url) {
  const urlParts = url.split("/").filter(Boolean);
  const id = Number(urlParts.at(-1));

  return Number.isInteger(id) ? id : null;
}

function normalizeSearchQuery(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.\s_]/g, "-");
}

function normalizePokemonName(value) {
  return value.toLowerCase().replace(/[.\s_]/g, "-");
}

function formatPokemonName(name) {
  return name
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
