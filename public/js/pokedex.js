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
  const regionSelect = document.querySelector("#pokedex-region");
  const archetypeSelect = document.querySelector("#pokedex-archetype");
  const hasMegaCheckbox = document.querySelector("#pokedex-has-mega");
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
  const detailRoles = document.querySelector("#pokedex-detail-roles");
  const detailFlavor = document.querySelector("#pokedex-detail-flavor");
  const detailMeasurements = document.querySelector(
    "#pokedex-detail-measurements",
  );
  const detailStats = document.querySelector("#pokedex-detail-stats");
  const detailAbilities = document.querySelector("#pokedex-detail-abilities");
  const detailEvolution = document.querySelector("#pokedex-detail-evolution");
  const detailMegaSection = document.querySelector(
    "#pokedex-detail-mega-section",
  );
  const detailMega = document.querySelector("#pokedex-detail-mega");

  if (
    !grid ||
    !statusElement ||
    !countElement ||
    !searchInput ||
    !typeSelect ||
    !generationSelect ||
    !regionSelect ||
    !archetypeSelect ||
    !hasMegaCheckbox ||
    !sortSelect
  ) {
    return;
  }

  const NATIONAL_DEX_TOTAL = 1025;

  // Generous upper bound covering every Pokémon resource (base species
  // plus all forms/megas), used only to derive the Mega Evolution list.
  const ALL_POKEMON_RESOURCES_LIMIT = 3000;

  // A Mega form's species is normally its name with the "-mega"/"-mega-x"/
  // "-mega-y"/"-mega-z" suffix removed. That doesn't work for species whose
  // *default* national-dex entry isn't the bare species name (e.g. Meowstic's
  // default variety is "meowstic-male", not "meowstic") - map those forms
  // explicitly to whatever name actually appears in the national dex list.
  const MEGA_SPECIES_OVERRIDES = {
    "meowstic-female-mega": "meowstic-male",
    "meowstic-male-mega": "meowstic-male",
    "magearna-original-mega": "magearna",
    "tatsugiri-curly-mega": "tatsugiri-curly",
    "tatsugiri-droopy-mega": "tatsugiri-curly",
    "tatsugiri-stretchy-mega": "tatsugiri-curly",
    "pyroar-mega": "pyroar-male",
    "zygarde-mega": "zygarde-50",
  };

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

  // Each region maps to the PokéAPI regional pokedex(es) that together
  // cover it (some regions, like Kalos, are split across several).
  const REGIONS = [
    { value: "kanto", label: "Kanto", pokedexes: ["kanto"] },
    { value: "johto", label: "Johto", pokedexes: ["original-johto"] },
    { value: "hoenn", label: "Hoenn", pokedexes: ["hoenn"] },
    {
      value: "sinnoh",
      label: "Sinnoh",
      pokedexes: ["original-sinnoh", "extended-sinnoh"],
    },
    {
      value: "unova",
      label: "Unova",
      pokedexes: ["original-unova", "updated-unova"],
    },
    {
      value: "kalos",
      label: "Kalos",
      pokedexes: ["kalos-central", "kalos-coastal", "kalos-mountain"],
    },
    { value: "alola", label: "Alola", pokedexes: ["updated-alola"] },
    {
      value: "galar",
      label: "Galar",
      pokedexes: ["galar", "isle-of-armor", "crown-tundra"],
    },
    { value: "hisui", label: "Hisui", pokedexes: ["hisui"] },
    {
      value: "paldea",
      label: "Paldea",
      pokedexes: ["paldea", "kitakami", "blueberry"],
    },
  ];

  // Order controls how the "Role" filter options are listed.
  const ARCHETYPES = [
    { value: "physical-attacker", label: "Physical Attacker" },
    { value: "special-attacker", label: "Special Attacker" },
    { value: "wall", label: "Wall" },
    { value: "balanced", label: "Balanced" },
    { value: "fast", label: "Fast" },
    { value: "powerhouse", label: "Powerhouse" },
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
    speciesCache: new Map(),
    abilityCache: new Map(),
    evolutionCache: new Map(),
    pokedexCache: new Map(),
    regionCache: new Map(),
    statsLoaded: false,
    megaSpecies: null,
    detailRequestId: 0,
    lastFocused: null,
  };

  populateTypeFilter();
  populateGenerationFilter();
  populateRegionFilter();
  populateArchetypeFilter();
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

    regionSelect.addEventListener("change", async () => {
      const value = regionSelect.value;

      regionSelect.disabled = true;

      try {
        await ensureRegionLoaded(value);
      } finally {
        regionSelect.disabled = false;
      }

      applyFilters();
    });

    archetypeSelect.addEventListener("change", async () => {
      archetypeSelect.disabled = true;

      try {
        await ensureArchetypeStatsLoaded();
      } finally {
        archetypeSelect.disabled = false;
      }

      applyFilters();
    });

    hasMegaCheckbox.addEventListener("change", async () => {
      if (hasMegaCheckbox.checked) {
        hasMegaCheckbox.disabled = true;

        try {
          await ensureMegaSpeciesLoaded();
        } finally {
          hasMegaCheckbox.disabled = false;
        }
      }

      applyFilters();
    });

    clearButton?.addEventListener("click", () => {
      window.clearTimeout(state.searchTimeout);

      searchInput.value = "";
      typeSelect.value = "";
      generationSelect.value = "";
      regionSelect.value = "";
      archetypeSelect.value = "";
      sortSelect.value = "id-asc";
      hasMegaCheckbox.checked = false;

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
    // Only applied once the region's species set has finished loading;
    // otherwise the region filter is skipped for this render.
    const regionSpecies = state.regionCache.get(regionSelect.value);
    // Same idea for role: only applied once base stats have loaded.
    const selectedArchetype =
      state.statsLoaded && archetypeSelect.value ? archetypeSelect.value : "";

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

      if (regionSpecies && !regionSpecies.has(pokemon.name)) {
        return false;
      }

      if (
        selectedArchetype &&
        !(pokemon.archetypes ?? []).includes(selectedArchetype)
      ) {
        return false;
      }

      if (
        hasMegaCheckbox.checked &&
        state.megaSpecies &&
        !state.megaSpecies.has(pokemon.name)
      ) {
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
          'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
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

  async function openDetail(key, triggerElement, options = {}) {
    const { updateFocusOrigin = true } = options;

    if (updateFocusOrigin) {
      state.lastFocused = triggerElement || document.activeElement;
    }

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

      const abilitiesPromise = Promise.all(
        data.abilities.map((entry) => getAbility(entry.ability.name)),
      );

      const species = await getSpecies(data.species.name);

      if (requestId !== state.detailRequestId) {
        return;
      }

      const [abilities, evolutionChain, megaForms] = await Promise.all([
        abilitiesPromise,
        getEvolutionChain(species.evolution_chain.url),
        Promise.all(
          getMegaVarieties(species).map((variety) =>
            getPokemonDetails(variety.pokemon.name),
          ),
        ),
      ]);

      if (requestId !== state.detailRequestId) {
        return;
      }

      renderDetail(data, species, abilities, evolutionChain, megaForms);
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

  async function getSpecies(name) {
    if (state.speciesCache.has(name)) {
      return state.speciesCache.get(name);
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(name)}`,
    );

    if (!response.ok) {
      throw new Error(`Species request failed: ${response.status}`);
    }

    const data = await response.json();

    state.speciesCache.set(name, data);

    return data;
  }

  async function getAbility(name) {
    if (state.abilityCache.has(name)) {
      return state.abilityCache.get(name);
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/ability/${encodeURIComponent(name)}`,
    );

    if (!response.ok) {
      throw new Error(`Ability request failed: ${response.status}`);
    }

    const data = await response.json();

    state.abilityCache.set(name, data);

    return data;
  }

  async function getEvolutionChain(url) {
    if (state.evolutionCache.has(url)) {
      return state.evolutionCache.get(url);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Evolution chain request failed: ${response.status}`);
    }

    const data = await response.json();

    state.evolutionCache.set(url, data);

    return data;
  }

  function flattenEvolutionChain(chainRoot) {
    const stages = [];
    let currentLevel = [chainRoot];

    while (currentLevel.length > 0) {
      stages.push(
        currentLevel.map((node) => ({
          name: node.species.name,
          id: idFromUrl(node.species.url),
        })),
      );

      currentLevel = currentLevel.flatMap((node) => node.evolves_to);
    }

    return stages;
  }

  function renderEvolution(stages, currentId) {
    detailEvolution.replaceChildren();

    if (stages.length <= 1) {
      const note = document.createElement("p");
      note.className = "pokedex-evolution-empty";
      note.textContent = "This Pokémon does not evolve.";

      detailEvolution.appendChild(note);
      return;
    }

    stages.forEach((stageGroup, index) => {
      if (index > 0) {
        const arrow = document.createElement("span");
        arrow.className = "pokedex-evolution-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "→";

        detailEvolution.appendChild(arrow);
      }

      const group = document.createElement("div");
      group.className = "pokedex-evolution-group";

      stageGroup.forEach((entry) => {
        group.appendChild(createEvolutionNode(entry, currentId));
      });

      detailEvolution.appendChild(group);
    });
  }

  function createEvolutionNode(entry, currentId, labelOverride) {
    const isCurrent = entry.id === currentId;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "pokedex-evolution-node";
    button.dataset.id = String(entry.id);

    if (isCurrent) {
      button.classList.add("is-current");
      button.setAttribute("aria-current", "true");
      button.disabled = true;
    }

    const image = document.createElement("img");
    image.src = `${OFFICIAL_ARTWORK_BASE}/${entry.id}.png`;
    image.alt = "";
    image.loading = "lazy";
    image.width = 64;
    image.height = 64;

    const name = document.createElement("span");
    name.textContent = labelOverride || formatName(entry.name);

    button.append(image, name);

    if (!isCurrent) {
      button.addEventListener("click", () => {
        openDetail(entry.id, button, { updateFocusOrigin: false });
      });
    }

    return button;
  }

  function renderDetail(data, species, abilities, evolutionChain, megaForms) {
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

    renderRoles(data.stats);
    detailFlavor.textContent = getFlavorText(species);

    renderMeasurements(data);
    renderStats(data);
    renderAbilities(data.abilities, abilities);
    renderEvolution(flattenEvolutionChain(evolutionChain.chain), data.id);
    renderMegaEvolutions(megaForms, data.id);
  }

  function renderRoles(statEntries) {
    const stats = {};

    statEntries.forEach((entry) => {
      stats[entry.stat.name] = entry.base_stat;
    });

    detailRoles.replaceChildren(
      ...classifyArchetypes(stats).map((archetype) => {
        const badge = document.createElement("span");
        badge.className = "pokedex-role-badge";
        badge.textContent = getArchetypeLabel(archetype);

        return badge;
      }),
    );
  }

  function getArchetypeLabel(value) {
    const match = ARCHETYPES.find((archetype) => archetype.value === value);

    return match ? match.label : formatName(value);
  }

  function getMegaVarieties(species) {
    return species.varieties.filter((variety) =>
      variety.pokemon.name.includes("-mega"),
    );
  }

  function renderMegaEvolutions(megaForms, currentId) {
    if (megaForms.length === 0) {
      detailMegaSection.hidden = true;
      detailMega.replaceChildren();
      return;
    }

    detailMegaSection.hidden = false;
    detailMega.replaceChildren();

    megaForms.forEach((formData) => {
      detailMega.appendChild(
        createEvolutionNode(
          { id: formData.id, name: formData.name },
          currentId,
          formatMegaLabel(formData.name),
        ),
      );
    });
  }

  function formatMegaLabel(name) {
    const suffix = name.split("-mega")[1] ?? "";

    return suffix ? `Mega ${suffix.slice(1).toUpperCase()}` : "Mega";
  }

  function getFlavorText(species) {
    const entry = species.flavor_text_entries.find(
      (candidate) => candidate.language.name === "en",
    );

    if (!entry) {
      return "";
    }

    return entry.flavor_text
      .replace(/[\n\f\r]+/g, " ")
      .replace(/­/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function renderAbilities(abilitySlots, abilityData) {
    detailAbilities.replaceChildren();

    abilitySlots.forEach((slot, index) => {
      const ability = abilityData[index];

      const item = document.createElement("div");
      item.className = "pokedex-ability";

      const heading = document.createElement("p");
      heading.className = "pokedex-ability-name";
      heading.textContent = slot.is_hidden
        ? `${formatName(slot.ability.name)} (Hidden)`
        : formatName(slot.ability.name);

      const description = document.createElement("p");
      description.className = "pokedex-ability-description";
      description.textContent = getAbilityDescription(ability);

      item.append(heading, description);
      detailAbilities.appendChild(item);
    });
  }

  function getAbilityDescription(ability) {
    const entry = ability.effect_entries.find(
      (candidate) => candidate.language.name === "en",
    );

    if (!entry) {
      return "No description available.";
    }

    const text = entry.short_effect || entry.effect || "";

    return text.replace(
      "$effect_chance",
      String(ability.effect_chance ?? ""),
    );
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

  function populateRegionFilter() {
    const fragment = document.createDocumentFragment();

    REGIONS.forEach((region) => {
      const option = document.createElement("option");
      option.value = region.value;
      option.textContent = region.label;

      fragment.appendChild(option);
    });

    regionSelect.appendChild(fragment);
  }

  function populateArchetypeFilter() {
    const fragment = document.createDocumentFragment();

    ARCHETYPES.forEach((archetype) => {
      const option = document.createElement("option");
      option.value = archetype.value;
      option.textContent = archetype.label;

      fragment.appendChild(option);
    });

    archetypeSelect.appendChild(fragment);
  }

  async function ensureMegaSpeciesLoaded() {
    if (state.megaSpecies) {
      return;
    }

    try {
      // The full resource list (not just the national dex) is the only
      // reliable source for this: PokéAPI's GraphQL mirror lags behind
      // its REST API and is missing newer Mega Evolutions.
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/?limit=${ALL_POKEMON_RESOURCES_LIMIT}`,
      );

      if (!response.ok) {
        throw new Error(`Mega evolution request failed: ${response.status}`);
      }

      const data = await response.json();

      state.megaSpecies = new Set(
        data.results
          .map((entry) => entry.name)
          .filter((name) => name.includes("-mega"))
          .map(
            (name) =>
              MEGA_SPECIES_OVERRIDES[name] ?? name.split("-mega")[0],
          ),
      );
    } catch (error) {
      // Leave megaSpecies null so applyFilters skips the checkbox
      // filter instead of showing zero results.
      console.error("Pokédex mega evolution load error:", error);
    }
  }

  async function ensureArchetypeStatsLoaded() {
    if (state.statsLoaded) {
      return;
    }

    try {
      const query = `query {
        pokemon: pokemon_v2_pokemon(
          limit: ${NATIONAL_DEX_TOTAL}
          where: { id: { _lte: ${NATIONAL_DEX_TOTAL} } }
        ) {
          id
          pokemon_v2_pokemonstats {
            base_stat
            pokemon_v2_stat {
              name
            }
          }
        }
      }`;

      const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Stats request failed: ${response.status}`);
      }

      const payload = await response.json();
      const statsById = new Map();

      payload.data.pokemon.forEach((entry) => {
        const stats = {};

        entry.pokemon_v2_pokemonstats.forEach((stat) => {
          stats[stat.pokemon_v2_stat.name] = stat.base_stat;
        });

        statsById.set(entry.id, stats);
      });

      state.pokemon.forEach((pokemon) => {
        const stats = statsById.get(pokemon.id);

        if (stats) {
          pokemon.archetypes = classifyArchetypes(stats);
        }
      });

      state.statsLoaded = true;
    } catch (error) {
      // Leave statsLoaded false so applyFilters skips the role filter
      // instead of showing zero results; the user can retry by
      // reselecting a role.
      console.error("Pokédex stats load error:", error);
    }
  }

  function classifyArchetypes(stats) {
    const attack = stats.attack ?? 0;
    const specialAttack = stats["special-attack"] ?? 0;
    const defense = stats.defense ?? 0;
    const specialDefense = stats["special-defense"] ?? 0;
    const hp = stats.hp ?? 0;
    const speed = stats.speed ?? 0;

    const offense = Math.max(attack, specialAttack);
    const bulk = (hp + defense + specialDefense) / 3;
    const ratio = bulk === 0 ? 1 : offense / bulk;

    const archetypes = [];

    if (ratio >= 1.15) {
      archetypes.push(
        attack >= specialAttack ? "physical-attacker" : "special-attacker",
      );
    } else if (ratio <= 0.87) {
      archetypes.push("wall");
    } else {
      archetypes.push("balanced");
    }

    if (speed >= 100) {
      archetypes.push("fast");
    }

    const total = hp + attack + defense + specialAttack + specialDefense + speed;

    if (total >= 580) {
      archetypes.push("powerhouse");
    }

    return archetypes;
  }

  async function ensureRegionLoaded(value) {
    if (!value || state.regionCache.has(value)) {
      return;
    }

    const region = REGIONS.find((candidate) => candidate.value === value);

    if (!region) {
      return;
    }

    try {
      const speciesSets = await Promise.all(
        region.pokedexes.map((slug) => getPokedexSpecies(slug)),
      );

      const union = new Set();
      speciesSets.forEach((set) => {
        set.forEach((name) => union.add(name));
      });

      state.regionCache.set(value, union);
    } catch (error) {
      // Leave uncached on failure so applyFilters skips the region
      // filter instead of showing zero results; the user can retry by
      // reselecting the region.
      console.error("Pokédex region load error:", error);
    }
  }

  async function getPokedexSpecies(slug) {
    if (state.pokedexCache.has(slug)) {
      return state.pokedexCache.get(slug);
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokedex/${encodeURIComponent(slug)}`,
    );

    if (!response.ok) {
      throw new Error(`Pokedex request failed: ${response.status}`);
    }

    const data = await response.json();

    const names = new Set(
      data.pokemon_entries.map((entry) => entry.pokemon_species.name),
    );

    state.pokedexCache.set(slug, names);

    return names;
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
