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

  const detailPanel = document.querySelector("#pokedex-detail");
  const detailBackdrop = document.querySelector("#pokedex-detail-backdrop");
  const detailClose = document.querySelector("#pokedex-detail-close");
  const detailStatus = document.querySelector("#pokedex-detail-status");
  const detailBody = document.querySelector("#pokedex-detail-body");
  const detailNumber = document.querySelector("#pokedex-detail-number");
  const detailArtwork = document.querySelector("#pokedex-detail-artwork");
  const detailName = document.querySelector("#pokedex-detail-name");
  const detailTypes = document.querySelector("#pokedex-detail-types");
  const detailMeasurements = document.querySelector(
    "#pokedex-detail-measurements",
  );
  const detailStats = document.querySelector("#pokedex-detail-stats");

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

  const STAT_LABELS = {
    hp: "HP",
    attack: "Atk",
    defense: "Def",
    "special-attack": "SpA",
    "special-defense": "SpD",
    speed: "Spe",
  };

  const state = {
    pokemon: [],
    ready: false,
    searchTimeout: null,
    detailCache: new Map(),
    detailRequestId: 0,
    lastFocused: null,
  };

  populateTypeFilter();
  populateGenerationFilter();
  registerFilterEvents();
  registerDetailEvents();
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

      applyFilters();
    } catch (error) {
      console.error("Pokédex load error:", error);
      setStatus("Unable to load the Pokédex. Please refresh the page.");
    }
  }

  function registerFilterEvents() {
    searchInput.addEventListener("input", () => {
      window.clearTimeout(state.searchTimeout);
      state.searchTimeout = window.setTimeout(applyFilters, 200);
    });

    typeSelect.addEventListener("change", applyFilters);
    generationSelect.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);

    clearButton?.addEventListener("click", () => {
      window.clearTimeout(state.searchTimeout);

      searchInput.value = "";
      typeSelect.value = "";
      generationSelect.value = "";
      sortSelect.value = "id-asc";

      applyFilters();
      searchInput.focus();
    });
  }

  function applyFilters() {
    if (!state.ready) {
      return;
    }

    const query = normalizeQuery(searchInput.value);
    const selectedType = typeSelect.value;
    const range = GENERATIONS.find(
      (generation) => generation.value === generationSelect.value,
    );

    const matches = state.pokemon.filter((pokemon) => {
      if (!matchesSearch(pokemon, query)) {
        return false;
      }

      if (selectedType && !pokemon.types.includes(selectedType)) {
        return false;
      }

      if (range && (pokemon.id < range.min || pokemon.id > range.max)) {
        return false;
      }

      return true;
    });

    sortPokemon(matches, sortSelect.value);
    updateCount(matches.length);

    if (matches.length === 0) {
      grid.replaceChildren();
      setStatus("No Pokémon match those filters.");
      return;
    }

    statusElement.hidden = true;
    renderGrid(matches);
  }

  function matchesSearch(pokemon, query) {
    if (query === "") {
      return true;
    }

    if (pokemon.name.includes(query)) {
      return true;
    }

    const digits = query.replace(/\D/g, "");

    return digits !== "" && pokemon.id === Number(digits);
  }

  function sortPokemon(list, sortValue) {
    list.sort((first, second) => {
      switch (sortValue) {
        case "id-desc":
          return second.id - first.id;

        case "name-asc":
          return first.name.localeCompare(second.name);

        case "name-desc":
          return second.name.localeCompare(first.name);

        case "id-asc":
        default:
          return first.id - second.id;
      }
    });
  }

  function updateCount(total) {
    countElement.textContent =
      total === 1 ? "1 Pokémon" : `${total} Pokémon`;
  }

  function normalizeQuery(value) {
    return value.trim().toLowerCase().replace(/[.\s_]+/g, "-");
  }

  function registerDetailEvents() {
    if (
      !detailPanel ||
      !detailBackdrop ||
      !detailClose ||
      !detailStatus ||
      !detailBody
    ) {
      return;
    }

    grid.addEventListener("click", (event) => {
      const card = event.target.closest(".pokedex-card");

      if (card) {
        openDetail(card.dataset.id, card);
      }
    });

    grid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      const card = event.target.closest(".pokedex-card");

      if (card) {
        event.preventDefault();
        openDetail(card.dataset.id, card);
      }
    });

    detailClose.addEventListener("click", closeDetail);
    detailBackdrop.addEventListener("click", closeDetail);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !detailPanel.hidden) {
        closeDetail();
      }
    });

    detailPanel.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusable = [
        ...detailPanel.querySelectorAll(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.hidden && element.offsetParent !== null);

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  async function openDetail(key, triggerElement) {
    state.lastFocused = triggerElement || document.activeElement;

    detailBackdrop.hidden = false;
    detailPanel.hidden = false;
    document.body.classList.add("pokedex-detail-open");

    detailBody.hidden = true;
    detailStatus.hidden = false;
    detailStatus.textContent = "Loading…";
    detailClose.focus();

    const requestId = ++state.detailRequestId;

    try {
      const data = await getPokemonDetails(key);

      if (requestId !== state.detailRequestId) {
        return;
      }

      renderDetail(data);
      detailStatus.hidden = true;
      detailBody.hidden = false;
    } catch (error) {
      if (requestId !== state.detailRequestId) {
        return;
      }

      console.error("Pokédex detail error:", error);
      detailStatus.textContent = "Unable to load this Pokémon.";
    }
  }

  function closeDetail() {
    detailPanel.hidden = true;
    detailBackdrop.hidden = true;
    document.body.classList.remove("pokedex-detail-open");

    if (state.lastFocused && typeof state.lastFocused.focus === "function") {
      state.lastFocused.focus();
    }

    state.lastFocused = null;
  }

  async function getPokemonDetails(key) {
    if (state.detailCache.has(key)) {
      return state.detailCache.get(key);
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(key)}`,
    );

    if (!response.ok) {
      throw new Error(`Pokémon request failed: ${response.status}`);
    }

    const data = await response.json();

    state.detailCache.set(key, data);
    state.detailCache.set(String(data.id), data);
    state.detailCache.set(data.name, data);

    return data;
  }

  function renderDetail(data) {
    detailNumber.textContent = `#${String(data.id).padStart(4, "0")}`;
    detailArtwork.src = `${OFFICIAL_ARTWORK_BASE}/${data.id}.png`;
    detailArtwork.alt = formatName(data.name);
    detailName.textContent = formatName(data.name);

    detailTypes.replaceChildren(
      ...[...data.types]
        .sort((first, second) => first.slot - second.slot)
        .map((entry) => {
          const badge = document.createElement("span");
          badge.className = `pokemon-type-badge pokemon-type-${entry.type.name}`;
          badge.textContent = formatName(entry.type.name);

          return badge;
        }),
    );

    renderMeasurements(data);
    renderStats(data);
  }

  function renderMeasurements(data) {
    const heightMetres = (data.height / 10).toFixed(1);
    const weightKilograms = (data.weight / 10).toFixed(1);

    detailMeasurements.replaceChildren();

    [
      ["Height", `${heightMetres} m`],
      ["Weight", `${weightKilograms} kg`],
    ].forEach(([label, value]) => {
      const term = document.createElement("dt");
      term.textContent = label;

      const description = document.createElement("dd");
      description.textContent = value;

      detailMeasurements.append(term, description);
    });
  }

  function renderStats(data) {
    detailStats.replaceChildren();

    let total = 0;

    data.stats.forEach((entry) => {
      const value = entry.base_stat;
      total += value;

      const row = document.createElement("div");
      row.className = "pokedex-stat-row";

      const label = document.createElement("span");
      label.className = "pokedex-stat-label";
      label.textContent = STAT_LABELS[entry.stat.name] ?? entry.stat.name;

      const number = document.createElement("span");
      number.className = "pokedex-stat-value";
      number.textContent = String(value);

      const track = document.createElement("span");
      track.className = "pokedex-stat-track";

      const bar = document.createElement("span");
      bar.className = `pokedex-stat-bar ${statTier(value)}`;
      bar.style.width = `${Math.min(100, (value / 200) * 100)}%`;

      track.appendChild(bar);
      row.append(label, number, track);
      detailStats.appendChild(row);
    });

    const totalRow = document.createElement("div");
    totalRow.className = "pokedex-stat-row pokedex-stat-total";

    const totalLabel = document.createElement("span");
    totalLabel.className = "pokedex-stat-label";
    totalLabel.textContent = "Total";

    const totalValue = document.createElement("span");
    totalValue.className = "pokedex-stat-value";
    totalValue.textContent = String(total);

    totalRow.append(totalLabel, totalValue, document.createElement("span"));
    detailStats.appendChild(totalRow);
  }

  function statTier(value) {
    if (value >= 100) {
      return "is-high";
    }

    if (value >= 60) {
      return "is-mid";
    }

    return "is-low";
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
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `${formatName(pokemon.name)}, number ${pokemon.id}`,
    );

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
