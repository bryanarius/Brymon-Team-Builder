"use strict";

/*
 * "Popular sets" hints for the team builder: what players run on a Pokémon
 * in a format, from the usage stats API (/api/usage/{format}). Rendering
 * only; team-builder.js owns the state and applies clicked suggestions.
 */

/*
 * Usage stats use Showdown names. Forms match by their own name
 * ("Samurott-Hisui" -> "samurott-hisui"), but default forms are named by
 * species ("Keldeo") where PokéAPI adds a form ("keldeo-ordinary"), so
 * those fall back to the species name.
 */
function findUsageEntry(stats, pokemon) {
  const entriesByName = new Map(
    stats.pokemon.map((entry) => [
      fromShowdownSpecies(normalizeShowdownName(entry.name)),
      entry,
    ]),
  );

  return (
    entriesByName.get(pokemon.name) ??
    (pokemon.isDefaultForm ? entriesByName.get(pokemon.speciesName) : null) ??
    null
  );
}

function renderPopularSetsMessage(container, message) {
  const paragraph = document.createElement("p");
  paragraph.className = "popular-sets-message";
  paragraph.textContent = message;

  container.replaceChildren(paragraph);
}

/*
 * Each suggestion is a button carrying what to apply in data attributes
 * (data-kind, data-value, ...). Suggestions already on the Pokémon are
 * pressed; ones it can't use are disabled with the reason as a tooltip.
 */
function renderPopularSets(container, { entry, pokemon, formatName, itemIsLocked }) {
  const displayName = formatPokemonDisplayName(pokemon.name);

  if (!entry) {
    renderPopularSetsMessage(
      container,
      `${displayName} isn't used enough in ${formatName} to have usage data.`,
    );
    return;
  }

  const groups = [
    createPopularSetsGroup(
      "Moves",
      entry.moves.map((move) => {
        const value = normalizeShowdownName(move.name);

        return {
          kind: "move",
          value,
          label: move.name,
          share: move.share,
          isApplied: pokemon.moves.includes(value),
          unavailableReason: pokemon.availableMoves.includes(value)
            ? ""
            : `${displayName} can't learn ${move.name} in Brymon's move data.`,
        };
      }),
    ),
    createPopularSetsGroup(
      "Items",
      entry.items.map((item) => {
        const value = normalizeShowdownName(item.name);

        return {
          kind: "item",
          value,
          label: item.name,
          share: item.share,
          isApplied: pokemon.item === value,
          unavailableReason:
            itemIsLocked && pokemon.item !== value
              ? "A Mega Evolution must hold its Mega Stone."
              : "",
        };
      }),
    ),
    createPopularSetsGroup(
      "Abilities",
      entry.abilities.map((ability) => {
        const value = normalizeShowdownName(ability.name);

        return {
          kind: "ability",
          value,
          label: ability.name,
          share: ability.share,
          isApplied: pokemon.ability === value,
          unavailableReason: pokemon.abilities.includes(value)
            ? ""
            : `${displayName} can't have ${ability.name}.`,
        };
      }),
    ),
    createPopularSetsGroup(
      "Spreads",
      entry.spreads.map((spread) => ({
        kind: "spread",
        value: normalizeShowdownName(spread.nature),
        evs: spread.evs,
        label: formatPopularSpread(spread),
        share: spread.share,
        isApplied: isSpreadApplied(pokemon, spread),
        unavailableReason: "",
      })),
    ),
  ];

  const hint = document.createElement("p");
  hint.className = "popular-sets-message";
  hint.textContent = `What ${formatName} players run on ${displayName}. Click one to use it.`;

  container.replaceChildren(hint, ...groups.filter(Boolean));
}

function createPopularSetsGroup(title, suggestions) {
  if (suggestions.length === 0) {
    return null;
  }

  const group = document.createElement("section");
  group.className = "popular-sets-group";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const list = document.createElement("div");
  list.className = "popular-sets-chips";

  suggestions.forEach((suggestion) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "popular-set-chip";
    chip.dataset.kind = suggestion.kind;
    chip.dataset.value = suggestion.value;
    chip.setAttribute("aria-pressed", String(suggestion.isApplied));

    if (suggestion.evs) {
      chip.dataset.evs = JSON.stringify(suggestion.evs);
    }

    if (suggestion.unavailableReason) {
      chip.disabled = true;
      chip.title = suggestion.unavailableReason;
    }

    const label = document.createElement("span");
    label.textContent = suggestion.label;

    const share = document.createElement("span");
    share.className = "popular-set-share";
    share.textContent = `${Math.round(suggestion.share * 100)}%`;

    chip.append(label, share);
    list.appendChild(chip);
  });

  group.append(heading, list);

  return group;
}

const POPULAR_SPREAD_STAT_LABELS = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

// Usage stats key EVs by API stat name; the builder uses camelCase.
const USAGE_STAT_TO_BUILDER_STAT = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "specialAttack",
  "special-defense": "specialDefense",
  speed: "speed",
};

// "Jolly · 252 Atk / 4 Def / 252 Spe".
function formatPopularSpread(spread) {
  const evs = Object.entries(spread.evs)
    .filter(([, value]) => value > 0)
    .map(([stat, value]) => `${value} ${POPULAR_SPREAD_STAT_LABELS[stat]}`)
    .join(" / ");

  return evs ? `${spread.nature} · ${evs}` : spread.nature;
}

function isSpreadApplied(pokemon, spread) {
  return (
    pokemon.nature === normalizeShowdownName(spread.nature) &&
    Object.entries(spread.evs).every(
      ([stat, value]) => pokemon.evs[USAGE_STAT_TO_BUILDER_STAT[stat]] === value,
    )
  );
}
