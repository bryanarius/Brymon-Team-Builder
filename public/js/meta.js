"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const formatSelect = document.querySelector("#meta-format");
  const searchInput = document.querySelector("#meta-search");
  const formatDescription = document.querySelector(
    "#meta-format-description",
  );
  const statusElement = document.querySelector("#meta-status");
  const layout = document.querySelector("#meta-layout");
  const usageList = document.querySelector("#meta-usage-list");
  const detail = document.querySelector("#meta-detail");

  if (
    !formatSelect ||
    !searchInput ||
    !statusElement ||
    !layout ||
    !usageList ||
    !detail
  ) {
    // meta.js is loaded on every page; bail unless we are on the Meta page.
    return;
  }

  const STAT_LABELS = {
    hp: "HP",
    attack: "Atk",
    defense: "Def",
    "special-attack": "SpA",
    "special-defense": "SpD",
    speed: "Spe",
  };

  const state = {
    stats: null,
    selectedName: null,
    requestVersion: 0,
  };

  const statsCache = new Map();

  const params = new URLSearchParams(window.location.search);
  const requestedFormat = params.get("format");

  if (
    [...formatSelect.options].some((option) => option.value === requestedFormat)
  ) {
    formatSelect.value = requestedFormat;
  }

  loadFormat(params.get("pokemon"));

  formatSelect.addEventListener("change", () => {
    loadFormat();
  });

  searchInput.addEventListener("input", renderUsageList);

  usageList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pokemon]");

    if (button) {
      selectPokemon(button.dataset.pokemon);
    }
  });

  detail.addEventListener("click", (event) => {
    const button = event.target.closest("[data-pokemon]");

    if (button) {
      selectPokemon(button.dataset.pokemon);
      usageList
        .querySelector('[aria-pressed="true"]')
        ?.scrollIntoView({ block: "nearest" });
    }
  });

  async function loadFormat(initialPokemon = null) {
    const format = formatSelect.value;

    if (formatDescription) {
      formatDescription.textContent =
        formatSelect.selectedOptions[0]?.dataset.description ?? "";
    }

    // Ignore responses for a format the user has already switched away from.
    state.requestVersion += 1;
    const requestVersion = state.requestVersion;

    statusElement.textContent = "Loading usage stats...";
    layout.hidden = true;

    try {
      const stats = await fetchStats(format);

      if (requestVersion !== state.requestVersion) {
        return;
      }

      state.stats = stats;

      statusElement.textContent = formatStatusText(stats);
      layout.hidden = stats.pokemon.length === 0;

      const initial =
        stats.pokemon.find((pokemon) => pokemon.name === initialPokemon) ??
        stats.pokemon[0];

      selectPokemon(initial?.name ?? null);
    } catch (error) {
      if (requestVersion !== state.requestVersion) {
        return;
      }

      console.error("Meta usage stats error:", error);

      statusElement.textContent =
        "Usage stats are unavailable right now. Please try again later.";
    }
  }

  async function fetchStats(format) {
    if (statsCache.has(format)) {
      return statsCache.get(format);
    }

    const response = await fetch(`/api/usage/${encodeURIComponent(format)}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Usage stats request failed: ${response.status}`);
    }

    const stats = await response.json();

    statsCache.set(format, stats);

    return stats;
  }

  function formatStatusText(stats) {
    const text =
      `${stats.formatName}: top ${stats.pokemon.length} Pokémon from ` +
      `${stats.battles.toLocaleString()} battles.`;

    return stats.stale
      ? `${text} Showing saved data; the latest stats couldn't be loaded.`
      : text;
  }

  function selectPokemon(name) {
    state.selectedName = name;

    renderUsageList();
    renderDetail();
    updateUrl();
  }

  // Keep the format and Pokémon in the URL so the view can be shared.
  function updateUrl() {
    const url = new URL(window.location.href);

    url.searchParams.set("format", formatSelect.value);

    if (state.selectedName) {
      url.searchParams.set("pokemon", state.selectedName);
    } else {
      url.searchParams.delete("pokemon");
    }

    window.history.replaceState(null, "", url);
  }

  function renderUsageList() {
    if (!state.stats) {
      return;
    }

    const query = searchInput.value.trim().toLowerCase();
    const topUsage = state.stats.pokemon[0]?.usage || 1;
    const fragment = document.createDocumentFragment();

    state.stats.pokemon.forEach((pokemon, index) => {
      const displayName = getDisplayName(pokemon.name);

      if (
        query &&
        !displayName.toLowerCase().includes(query) &&
        !pokemon.name.toLowerCase().includes(query)
      ) {
        return;
      }

      const item = document.createElement("li");

      const button = document.createElement("button");
      button.type = "button";
      button.className = "meta-usage-item";
      button.dataset.pokemon = pokemon.name;
      button.setAttribute(
        "aria-pressed",
        String(pokemon.name === state.selectedName),
      );

      const rank = document.createElement("span");
      rank.className = "meta-usage-rank";
      rank.textContent = String(index + 1);

      const name = document.createElement("span");
      name.className = "meta-usage-name";
      name.textContent = displayName;

      const bar = document.createElement("span");
      bar.className = "meta-usage-bar";
      bar.setAttribute("aria-hidden", "true");

      const fill = document.createElement("span");
      fill.style.width = `${(pokemon.usage / topUsage) * 100}%`;
      bar.appendChild(fill);

      const percent = document.createElement("span");
      percent.className = "meta-usage-percent";
      percent.textContent = formatPercent(pokemon.usage);

      button.append(
        rank,
        createSprite(pokemon.name, 40),
        name,
        bar,
        percent,
      );

      item.appendChild(button);
      fragment.appendChild(item);
    });

    if (!fragment.hasChildNodes()) {
      const empty = document.createElement("li");
      empty.className = "meta-empty";
      empty.textContent = "No Pokémon match your search.";

      fragment.appendChild(empty);
    }

    usageList.replaceChildren(fragment);
  }

  function renderDetail() {
    const pokemonList = state.stats?.pokemon ?? [];
    const index = pokemonList.findIndex(
      (pokemon) => pokemon.name === state.selectedName,
    );

    if (index === -1) {
      detail.replaceChildren();
      return;
    }

    const pokemon = pokemonList[index];

    const header = document.createElement("header");
    header.className = "meta-detail-header";

    const heading = document.createElement("h2");
    heading.textContent = getDisplayName(pokemon.name);

    const summary = document.createElement("p");
    summary.textContent =
      `#${index + 1} in ${state.stats.formatName} · on ` +
      `${formatPercent(pokemon.usage)} of teams`;

    const headingGroup = document.createElement("div");
    headingGroup.append(heading, summary);

    header.append(createSprite(pokemon.name, 96), headingGroup);

    const teammateNames = new Set(pokemonList.map((entry) => entry.name));

    detail.replaceChildren(
      header,
      createShareSection("Moves", pokemon.moves),
      createShareSection("Items", pokemon.items),
      createShareSection("Abilities", pokemon.abilities),
      createShareSection(
        "Spreads",
        pokemon.spreads.map((spread) => ({
          name: formatSpread(spread),
          share: spread.share,
        })),
      ),
      createShareSection("Tera Types", pokemon.teraTypes),
      createShareSection("Teammates", pokemon.teammates, teammateNames),
    );
  }

  /*
   * A titled list of names with how often each is used. Names found in
   * `linkableNames` become buttons that open that Pokémon.
   */
  function createShareSection(title, entries, linkableNames = null) {
    const fragment = document.createDocumentFragment();

    if (entries.length === 0) {
      return fragment;
    }

    const section = document.createElement("section");
    section.className = "meta-share-section";

    const heading = document.createElement("h3");
    heading.textContent = title;

    const list = document.createElement("ul");
    list.className = "meta-share-list";

    entries.forEach((entry) => {
      const item = document.createElement("li");

      let label;

      if (linkableNames?.has(entry.name)) {
        label = document.createElement("button");
        label.type = "button";
        label.className = "meta-share-link";
        label.dataset.pokemon = entry.name;
        label.textContent = getDisplayName(entry.name);
      } else {
        label = document.createElement("span");
        label.textContent = linkableNames
          ? getDisplayName(entry.name)
          : entry.name;
      }

      label.classList.add("meta-share-name");

      const bar = document.createElement("span");
      bar.className = "meta-share-bar";
      bar.setAttribute("aria-hidden", "true");

      const fill = document.createElement("span");
      fill.style.width = `${Math.min(entry.share, 1) * 100}%`;
      bar.appendChild(fill);

      const percent = document.createElement("span");
      percent.className = "meta-share-percent";
      percent.textContent = formatPercent(entry.share);

      item.append(label, bar, percent);
      list.appendChild(item);
    });

    section.append(heading, list);
    fragment.appendChild(section);

    return fragment;
  }

  // "Jolly" + EVs -> "Jolly · 252 Atk / 4 Def / 252 Spe".
  function formatSpread(spread) {
    const evs = Object.entries(spread.evs)
      .filter(([, value]) => value > 0)
      .map(([stat, value]) => `${value} ${STAT_LABELS[stat]}`)
      .join(" / ");

    return evs ? `${spread.nature} · ${evs}` : spread.nature;
  }

  function createSprite(showdownName, size) {
    const image = document.createElement("img");
    image.className = "meta-sprite";
    image.src = getShowdownSpriteUrl(showdownName);
    image.alt = "";
    image.width = size;
    image.height = size;
    image.loading = "lazy";

    // A missing sprite shouldn't leave a broken-image icon behind.
    image.addEventListener("error", () => {
      image.style.visibility = "hidden";
    });

    return image;
  }
});

// Showdown name -> the name the rest of Brymon uses ("Ninetales-Alola" ->
// "Alolan Ninetales").
function getDisplayName(showdownName) {
  return formatPokemonDisplayName(
    fromShowdownSpecies(normalizeShowdownName(showdownName)),
  );
}

function formatPercent(share) {
  return `${(share * 100).toFixed(1)}%`;
}

// Species whose own name contains a hyphen, so it doesn't mark a forme.
const SHOWDOWN_HYPHENATED_SPECIES = [
  "ho-oh",
  "porygon-z",
  "jangmo-o",
  "hakamo-o",
  "kommo-o",
  "ting-lu",
  "chien-pao",
  "wo-chien",
  "chi-yu",
  "nidoran-f",
  "nidoran-m",
];

/*
 * Showdown sprite ids are the species and forme, each lowercased with
 * punctuation and spaces removed, joined by a hyphen: "Great Tusk" ->
 * "greattusk", "Urshifu-Rapid-Strike" -> "urshifu-rapidstrike".
 */
function getShowdownSpriteUrl(showdownName) {
  const name = showdownName.toLowerCase();

  const species =
    SHOWDOWN_HYPHENATED_SPECIES.find(
      (hyphenated) => name === hyphenated || name.startsWith(`${hyphenated}-`),
    ) ?? name.split("-")[0];

  const forme = name.slice(species.length + 1);
  const toId = (value) => value.replace(/[^a-z0-9]/g, "");

  const spriteId = forme ? `${toId(species)}-${toId(forme)}` : toId(species);

  return `https://play.pokemonshowdown.com/sprites/gen5/${spriteId}.png`;
}
