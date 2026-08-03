"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const generationSelect = document.querySelector("#pokemon-generation");
  const typeSelect = document.querySelector("#pokemon-type");
  const sortSelect = document.querySelector("#pokemon-sort");
  const searchInput = document.querySelector("#pokemon-search");
  const resultsContainer = document.querySelector("#pokemon-search-results");
  const resultCount = document.querySelector("#pokemon-result-count");
  const clearFiltersButton = document.querySelector("#clear-pokemon-filters");
  const teamSlots = [...document.querySelectorAll(".team-slot")];
  const summaryTeamTypes = document.querySelector("#summary-team-types");
  const teamNameInput = document.querySelector("#name");
  const teamNotesInput = document.querySelector("#notes");

  const selectedPokemonEmpty = document.querySelector(
    "#selected-pokemon-empty",
  );
  const selectedPokemonEditor = document.querySelector(
    "#selected-pokemon-editor",
  );

  const selectedPokemonImage = document.querySelector(
    "#selected-pokemon-image",
  );
  const selectedPokemonName = document.querySelector("#selected-pokemon-name");
  const selectedPokemonNumber = document.querySelector(
    "#selected-pokemon-number",
  );
  const selectedPokemonTypes = document.querySelector(
    "#selected-pokemon-types",
  );

  const selectedSlotInput = document.querySelector("#selected-slot");
  const selectedPokemonIdInput = document.querySelector("#selected-pokemon-id");

  const nicknameInput = document.querySelector("#pokemon-nickname");
  const abilitySelect = document.querySelector("#pokemon-ability");
  const itemSelect = document.querySelector("#pokemon-item");
  const natureSelect = document.querySelector("#pokemon-nature");

  const moveSelects = [
    document.querySelector("#pokemon-move-1"),
    document.querySelector("#pokemon-move-2"),
    document.querySelector("#pokemon-move-3"),
    document.querySelector("#pokemon-move-4"),
  ];

    const evInputs = {
    hp: document.querySelector("#pokemon-hp-ev"),
    attack: document.querySelector("#pokemon-attack-ev"),
    defense: document.querySelector("#pokemon-defense-ev"),
    specialAttack: document.querySelector(
        "#pokemon-special-attack-ev",
    ),
    specialDefense: document.querySelector(
        "#pokemon-special-defense-ev",
    ),
    speed: document.querySelector("#pokemon-speed-ev"),
    };

    const ivInputs = {
    hp: document.querySelector("#pokemon-hp-iv"),
    attack: document.querySelector("#pokemon-attack-iv"),
    defense: document.querySelector("#pokemon-defense-iv"),
    specialAttack: document.querySelector("#pokemon-special-attack-iv"),
    specialDefense: document.querySelector("#pokemon-special-defense-iv"),
    speed: document.querySelector("#pokemon-speed-iv"),
    };

    const evTotal = document.querySelector("#ev-total");
    const evTotalError = document.querySelector("#ev-total-error");
    const resetIvsButton = document.querySelector("#reset-ivs-button");
  const deletePokemonButton = document.querySelector("#delete-pokemon-button");

  const summaryPokemonCount = document.querySelector("#summary-pokemon-count");

  const teamState = {
    selectedSlot: null,

    slots: [null, null, null, null, null, null],
  };

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
    itemList: [],
    natureList: [],
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

    try {
      const pokemon = await getPokemonDetails(pokemonName);

      addPokemonToTeam(pokemon);
    } catch (error) {
      console.error(error);
    } finally {
      addButton.disabled = false;
    }
  });

  async function initializePokemonBrowser() {
    const NATIONAL_POKEDEX_TOTAL = 1025;
    renderStatus("Loading Pokémon...");

    try {
      const [
        pokemonResponse,
        generationResponse,
        typeResponse,
        itemResponse,
        natureResponse,
      ] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=${NATIONAL_POKEDEX_TOTAL}`),
        fetch("https://pokeapi.co/api/v2/generation?limit=20"),
        fetch("https://pokeapi.co/api/v2/type?limit=50"),
        fetch("https://pokeapi.co/api/v2/item?limit=3000"),
        fetch("https://pokeapi.co/api/v2/nature?limit=50"),
      ]);

      if (
        !pokemonResponse.ok ||
        !generationResponse.ok ||
        !typeResponse.ok ||
        !itemResponse.ok ||
        !natureResponse.ok
      ) {
        throw new Error("Unable to load Pokémon browser data.");
      }

      const pokemonData = await pokemonResponse.json();
      const generationData = await generationResponse.json();
      const typeData = await typeResponse.json();
      const itemData = await itemResponse.json();
      const natureData = await natureResponse.json();

      state.pokemonList = pokemonData.results.map((pokemon) => ({
        name: pokemon.name,
        url: pokemon.url,
        id: getPokemonIdFromUrl(pokemon.url),
      }));

      state.itemList = itemData.results.map((item) => item.name);

      state.natureList = natureData.results.map((nature) => nature.name);

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

    clearFiltersButton?.addEventListener("click", () => {
    clearTimeout(state.searchTimeout);

    // Invalidate any filter request that is still running.
    state.filterVersion += 1;

    searchInput.value = "";
    generationSelect.value = "";
    typeSelect.value = "";
    sortSelect.value = "name-asc";

    updateResultCount(0);

    renderEmptyState(
        "Find a Pokémon",
        "Start typing a Pokémon name or choose a filter.",
    );

    searchInput.focus();
    });

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

  function addPokemonToTeam(pokemon) {
    const emptySlotIndex = teamState.slots.findIndex((slot) => slot === null);

    if (emptySlotIndex === -1) {
      alert("Your team already has six Pokémon.");
      return;
    }

    teamState.slots[emptySlotIndex] = createTeamPokemon(pokemon);

    renderTeamSlot(emptySlotIndex);
    updateTeamSummary();
    selectTeamSlot(emptySlotIndex);
  }

  function createTeamPokemon(pokemon) {
    return {
      id: pokemon.id,
      name: pokemon.name,

      image:
        pokemon.sprites.other["official-artwork"].front_default ??
        pokemon.sprites.front_default ??
        "",

      types: pokemon.types.map((entry) => entry.type.name),

      abilities: pokemon.abilities.map((entry) => entry.ability.name),

      availableMoves: pokemon.moves.map((entry) => entry.move.name),

      stats: Object.fromEntries(
        pokemon.stats.map((entry) => [entry.stat.name, entry.base_stat]),
      ),

      nickname: "",
      ability: "",
      item: "",
      nature: "",

      moves: ["", "", "", ""],

        ivs: {
        hp: 31,
        attack: 31,
        defense: 31,
        specialAttack: 31,
        specialDefense: 31,
        speed: 31,
        },

        evs: {
        hp: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
        },
    };
  }

  function renderTeamSlot(slotIndex) {
    const slotButton = teamSlots[slotIndex];
    const pokemon = teamState.slots[slotIndex];

    if (!slotButton) {
      return;
    }

    if (!pokemon) {
      renderEmptyTeamSlot(slotIndex);
      return;
    }

    slotButton.dataset.populated = "true";

    slotButton.setAttribute(
      "aria-label",
      `Configure ${formatPokemonName(pokemon.name)} in slot ${slotIndex + 1}`,
    );

    slotButton.innerHTML = `
    <img
      class="team-slot-pokemon-image"
      src="${pokemon.image}"
      alt=""
    >

    <span class="team-slot-pokemon-name">
      ${formatPokemonName(pokemon.name)}
    </span>

    <span class="team-slot-pokemon-number">
      #${String(pokemon.id).padStart(4, "0")}
    </span>
  `;
  }

  function renderEmptyTeamSlot(slotIndex) {
    const slotButton = teamSlots[slotIndex];

    slotButton.dataset.populated = "false";

    slotButton.setAttribute(
      "aria-label",
      `Add Pokémon to slot ${slotIndex + 1}`,
    );

    slotButton.innerHTML = `
    <span class="slot-index">
      ${slotIndex + 1}
    </span>

    <span class="slot-plus" aria-hidden="true">
      +
    </span>

    <span class="slot-number">
      Add Pokémon
    </span>
  `;
  }

  teamSlots.forEach((slotButton, slotIndex) => {
    slotButton.addEventListener("click", () => {
      if (!teamState.slots[slotIndex]) {
        return;
      }

      selectTeamSlot(slotIndex);
    });
  });

  function selectTeamSlot(slotIndex) {
    const pokemon = teamState.slots[slotIndex];

    if (!pokemon) {
      return;
    }

    teamState.selectedSlot = slotIndex;

    teamSlots.forEach((slotButton, index) => {
      slotButton.classList.toggle("is-selected", index === slotIndex);
    });

    renderSelectedPokemon(pokemon, slotIndex);
  }

  function renderSelectedPokemon(pokemon, slotIndex) {
    selectedPokemonEmpty.hidden = true;
    selectedPokemonEditor.hidden = false;

    selectedSlotInput.value = String(slotIndex + 1);
    selectedPokemonIdInput.value = String(pokemon.id);

    selectedPokemonImage.src = pokemon.image;
    selectedPokemonImage.alt = formatPokemonName(pokemon.name);

    selectedPokemonName.textContent = formatPokemonName(pokemon.name);

    selectedPokemonNumber.textContent = `#${String(pokemon.id).padStart(4, "0")}`;

    renderSelectedPokemonTypes(pokemon.types);

    nicknameInput.value = pokemon.nickname;

    populateSelect(
      abilitySelect,
      pokemon.abilities,
      "Select ability",
      pokemon.ability,
    );

    populateSelect(itemSelect, state.itemList, "Select item", pokemon.item);

    populateSelect(
      natureSelect,
      state.natureList,
      "Select nature",
      pokemon.nature,
    );

    moveSelects.forEach((select, moveIndex) => {
      populateSelect(
        select,
        pokemon.availableMoves,
        `Move ${moveIndex + 1}`,
        pokemon.moves[moveIndex],
      );
    });

    Object.entries(ivInputs).forEach(([statName, input]) => {
        if (input) {
            input.value = String(pokemon.ivs[statName]);
        }
    });

    Object.entries(evInputs).forEach(([statName, input]) => {
      if (input) {
        input.value = String(pokemon.evs[statName]);
      }
    });

    updateEvTotal();
    renderPokemonStats(pokemon.stats);
  }

  function renderSelectedPokemonTypes(types) {
    selectedPokemonTypes.replaceChildren();

    types.forEach((typeName) => {
      const badge = document.createElement("span");

      badge.className = `pokemon-type-badge pokemon-type-${typeName}`;

      badge.textContent = formatPokemonName(typeName);

      selectedPokemonTypes.appendChild(badge);
    });
  }

  function renderPokemonStats(stats) {
    document.querySelector("#stat-hp").textContent = stats.hp ?? "—";

    document.querySelector("#stat-attack").textContent = stats.attack ?? "—";

    document.querySelector("#stat-defense").textContent = stats.defense ?? "—";

    document.querySelector("#stat-special-attack").textContent =
      stats["special-attack"] ?? "—";

    document.querySelector("#stat-special-defense").textContent =
      stats["special-defense"] ?? "—";

    document.querySelector("#stat-speed").textContent = stats.speed ?? "—";
  }

  itemSelect.addEventListener("change", () => {
    const pokemon = getSelectedPokemon();

    if (!pokemon) {
      return;
    }

    pokemon.item = itemSelect.value;
  });

  natureSelect.addEventListener("change", () => {
    const pokemon = getSelectedPokemon();

    if (!pokemon) {
      return;
    }

    pokemon.nature = natureSelect.value;
  });

  nicknameInput.addEventListener("input", () => {
    const pokemon = getSelectedPokemon();

    if (!pokemon) {
      return;
    }

    pokemon.nickname = nicknameInput.value;
  });

  abilitySelect.addEventListener("change", () => {
    const pokemon = getSelectedPokemon();

    if (!pokemon) {
      return;
    }

    pokemon.ability = abilitySelect.value;
  });

  moveSelects.forEach((select, moveIndex) => {
    select?.addEventListener("change", () => {
      const pokemon = getSelectedPokemon();

      if (!pokemon) {
        return;
      }

      pokemon.moves[moveIndex] = select.value;
    });
  });

  deletePokemonButton.addEventListener("click", () => {
    const slotIndex = teamState.selectedSlot;

    if (slotIndex === null) {
      return;
    }

    teamState.slots[slotIndex] = null;
    teamState.selectedSlot = null;

    renderEmptyTeamSlot(slotIndex);
    updateTeamSummary();
    clearSelectedPokemonEditor();
  });

  function clearSelectedPokemonEditor() {
    teamSlots.forEach((slotButton) => {
      slotButton.classList.remove("is-selected");
    });

    selectedPokemonEditor.hidden = true;
    selectedPokemonEmpty.hidden = false;

    selectedSlotInput.value = "";
    selectedPokemonIdInput.value = "";

    selectedPokemonImage.src = "";
    selectedPokemonImage.alt = "";
    selectedPokemonName.textContent = "";
    selectedPokemonNumber.textContent = "";
    selectedPokemonTypes.replaceChildren();

    nicknameInput.value = "";

    populateSelect(abilitySelect, [], "Select ability", "");
    populateSelect(itemSelect, [], "Select item", "");
    populateSelect(natureSelect, [], "Select nature", "");

    moveSelects.forEach((select, index) => {
      populateSelect(select, [], `Move ${index + 1}`, "");
    });

    Object.values(evInputs).forEach((input) => {
    if (input) {
        input.value = "0";
    }
    });

    Object.values(ivInputs).forEach((input) => {
        if (input) {
            input.value = "31";
        }
    });

    evTotal.textContent = "0 / 510 EVs";
    evTotalError.hidden = true;

    renderPokemonStats({});
  }

    resetIvsButton?.addEventListener("click", () => {
        const pokemon = getSelectedPokemon();

        if (!pokemon) {
            return;
        }

      const value = clampNumber(31, 0, 31);

      Object.keys(pokemon.ivs).forEach((statName) => {
          pokemon.ivs[statName] = value;

          if (ivInputs[statName]) {
              ivInputs[statName].value = value;
          }
      });
    });

    Object.entries(evInputs).forEach(([statName, input]) => {
    input?.addEventListener("input", () => {
        const pokemon = getSelectedPokemon();

        if (!pokemon) {
            return;
        }

        pokemon.evs[statName] = clampNumber(
            input.value,
            0,
            252,
        );

        input.value = pokemon.evs[statName];

        updateEvTotal();
    });
  });

    Object.entries(ivInputs).forEach(([statName, input]) => {
    input?.addEventListener("input", () => {
      const pokemon = getSelectedPokemon();

      if (!pokemon) {
        return;
      }

      pokemon.ivs[statName] = clampNumber(input.value, 0, 31);

      input.value = pokemon.ivs[statName];
    });
  });

  function updateEvTotal() {
    const pokemon = getSelectedPokemon();

    if (!pokemon || !evTotal || !evTotalError) {
      return;
    }

    const total = calculateTotalEvs(pokemon.evs);

    evTotal.textContent = `${total} / 510 EVs`;

    const exceedsLimit = total > 510;

    evTotal.classList.toggle("error", exceedsLimit);
    evTotalError.hidden = !exceedsLimit;
    evTotalError.textContent = exceedsLimit
      ? "Total EVs cannot exceed 510."
      : "";
  }


  function updateTeamSummary() {
    const populatedSlots = teamState.slots.filter(Boolean);

    summaryPokemonCount.textContent = `${populatedSlots.length}/6`;

    const teamTypes = [
      ...new Set(populatedSlots.flatMap((pokemon) => pokemon.types)),
    ];

    summaryTeamTypes.replaceChildren();

    if (teamTypes.length === 0) {
      summaryTeamTypes.textContent = "—";
      return;
    }

    teamTypes.forEach((typeName) => {
      const badge = document.createElement("span");

      badge.className = `pokemon-type-badge pokemon-type-${typeName}`;

      badge.textContent = formatPokemonName(typeName);

      summaryTeamTypes.appendChild(badge);
    });
  }

  function getSelectedPokemon() {
    if (teamState.selectedSlot === null) {
      return null;
    }

    return teamState.slots[teamState.selectedSlot];
  }

  function buildTeamPayload() {
    return {
      name: teamNameInput.value.trim(),
      notes: teamNotesInput.value.trim(),

      pokemon: teamState.slots
        .map((pokemon, index) => {
          if (!pokemon) {
            return null;
          }

          return {
            slot_number: index + 1,
            pokemon_api_id: pokemon.id,
            nickname: pokemon.nickname || null,
            ability: pokemon.ability || null,
            item: pokemon.item || null,
            nature: pokemon.nature || null,
            move_1: pokemon.moves[0] || null,
            move_2: pokemon.moves[1] || null,
            move_3: pokemon.moves[2] || null,
            move_4: pokemon.moves[3] || null,

            hp_ev: pokemon.evs.hp,
            attack_ev: pokemon.evs.attack,
            defense_ev: pokemon.evs.defense,
            special_attack_ev: pokemon.evs.specialAttack,
            special_defense_ev: pokemon.evs.specialDefense,
            speed_ev: pokemon.evs.speed,

            hp_iv: pokemon.ivs.hp,
            attack_iv: pokemon.ivs.attack,
            defense_iv: pokemon.ivs.defense,
            special_attack_iv: pokemon.ivs.specialAttack,
            special_defense_iv: pokemon.ivs.specialDefense,
            speed_iv: pokemon.ivs.speed,
          };
        })
        .filter(Boolean),
    };
  }

});

function populateSelect(select, values, placeholder, selectedValue) {
  if (!select) {
    return;
  }

  const placeholderOption = document.createElement("option");

  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;

  const fragment = document.createDocumentFragment();

  fragment.appendChild(placeholderOption);

  [...values]
    .sort((firstValue, secondValue) => firstValue.localeCompare(secondValue))
    .forEach((value) => {
      const option = document.createElement("option");

      option.value = value;
      option.textContent = formatPokemonName(value);
      option.selected = value === selectedValue;

      fragment.appendChild(option);
    });

  select.replaceChildren(fragment);
}

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

function clampNumber(value, minimum, maximum) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(minimum, parsedValue),
  );
}

function calculateTotalEvs(evs) {
  return Object.values(evs).reduce(
    (total, value) => total + Number(value || 0),
    0,
  );
}
