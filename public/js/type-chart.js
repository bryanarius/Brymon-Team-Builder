"use strict";

/*
 * Type effectiveness and the defensive coverage chart (shared by the team
 * builder and team analysis).
 *
 * The type chart is stored here rather than fetched from PokéAPI: it is a
 * fixed 18x18 table (unchanged since Fairy was added in Gen 6), so keeping
 * it local makes the chart instant and the math unit-testable.
 */
const POKEMON_TYPES = [
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

// Attacking type -> defending type -> multiplier. Omitted pairs are 1x.
const TYPE_EFFECTIVENESS = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5,
  },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
};

/*
 * Abilities that change how much damage a type deals to their holder,
 * applied on top of the type matchup. Abilities that only reduce damage
 * that is already super effective (Filter, Solid Rock) don't change the
 * matchup itself and are left out.
 */
const ABILITY_TYPE_MODIFIERS = {
  levitate: { ground: 0 },
  "earth-eater": { ground: 0 },
  "flash-fire": { fire: 0 },
  "well-baked-body": { fire: 0 },
  "water-absorb": { water: 0 },
  "storm-drain": { water: 0 },
  "dry-skin": { water: 0, fire: 1.25 },
  "volt-absorb": { electric: 0 },
  "lightning-rod": { electric: 0 },
  "motor-drive": { electric: 0 },
  "sap-sipper": { grass: 0 },
  "thick-fat": { fire: 0.5, ice: 0.5 },
  heatproof: { fire: 0.5 },
  "water-bubble": { fire: 0.5 },
  "purifying-salt": { ghost: 0.5 },
  fluffy: { fire: 2 },
};

// Damage multiplier of one attacking type against a Pokémon.
function getTypeMultiplier(attackingType, defendingTypes, ability = "") {
  const typeMultiplier = defendingTypes.reduce(
    (total, defendingType) =>
      total * (TYPE_EFFECTIVENESS[attackingType]?.[defendingType] ?? 1),
    1,
  );

  // Wonder Guard: only super-effective hits land.
  if (ability === "wonder-guard") {
    return typeMultiplier > 1 ? typeMultiplier : 0;
  }

  return typeMultiplier * (ABILITY_TYPE_MODIFIERS[ability]?.[attackingType] ?? 1);
}

/*
 * One row per attacking type, one multiplier per team member (in the order
 * given, so duplicate species each get their own column), plus totals.
 */
function buildDefensiveChart(members) {
  return POKEMON_TYPES.map((attackingType) => {
    const multipliers = members.map((member) =>
      getTypeMultiplier(attackingType, member.types, member.ability),
    );

    return {
      type: attackingType,
      multipliers,
      weak: multipliers.filter((multiplier) => multiplier > 1).length,
      resist: multipliers.filter(
        (multiplier) => multiplier > 0 && multiplier < 1,
      ).length,
      immune: multipliers.filter((multiplier) => multiplier === 0).length,
    };
  });
}

const MULTIPLIER_LABELS = new Map([
  [0, "0×"],
  [0.25, "¼×"],
  [0.5, "½×"],
  [2, "2×"],
  [4, "4×"],
]);

function formatMultiplier(multiplier) {
  if (multiplier === 1) {
    return "";
  }

  return MULTIPLIER_LABELS.get(multiplier) ?? `${multiplier}×`;
}

function getMultiplierClass(multiplier) {
  if (multiplier === 0) {
    return "is-immune";
  }

  if (multiplier >= 4) {
    return "is-very-weak";
  }

  if (multiplier > 1) {
    return "is-weak";
  }

  if (multiplier <= 0.25) {
    return "is-very-resistant";
  }

  if (multiplier < 1) {
    return "is-resistant";
  }

  return "is-neutral";
}

/*
 * Renders the chart into `container`. Each member is
 * { name, image, types, ability }, with `name` already display-formatted.
 */
function renderDefensiveChart(container, members) {
  if (!container) {
    return;
  }

  if (members.length === 0) {
    const empty = document.createElement("p");
    empty.className = "defensive-chart-empty";
    empty.textContent = "Add Pokémon to see your team's defensive coverage.";

    container.replaceChildren(empty);
    return;
  }

  const table = document.createElement("table");
  table.className = "defensive-chart";

  const caption = document.createElement("caption");
  caption.className = "visually-hidden";
  caption.textContent =
    "Damage each attacking type deals to each team member, with totals.";

  const headerRow = document.createElement("tr");

  headerRow.appendChild(createChartHeader("Type"));

  members.forEach((member) => {
    const header = createChartHeader("");
    header.className = "defensive-chart-member";
    header.title = member.name;

    const image = document.createElement("img");
    image.src = member.image;
    image.alt = member.name;
    image.width = 40;
    image.height = 40;
    image.loading = "lazy";

    header.appendChild(image);
    headerRow.appendChild(header);
  });

  ["Weak", "Resist", "Immune"].forEach((label) => {
    const header = createChartHeader(label);
    header.className = "defensive-chart-total";
    headerRow.appendChild(header);
  });

  const head = document.createElement("thead");
  head.appendChild(headerRow);

  const body = document.createElement("tbody");

  buildDefensiveChart(members).forEach((row) => {
    const tableRow = document.createElement("tr");

    const typeHeader = document.createElement("th");
    typeHeader.scope = "row";

    const badge = document.createElement("span");
    badge.className = `pokemon-type-badge pokemon-type-${row.type}`;
    badge.textContent = capitalizeHyphenatedWords(row.type);

    typeHeader.appendChild(badge);
    tableRow.appendChild(typeHeader);

    row.multipliers.forEach((multiplier, index) => {
      const cell = document.createElement("td");
      cell.className = `defensive-chart-cell ${getMultiplierClass(multiplier)}`;
      cell.textContent = formatMultiplier(multiplier);
      cell.title = `${capitalizeHyphenatedWords(row.type)} vs ${members[index].name}: ${multiplier}×`;

      tableRow.appendChild(cell);
    });

    // Flag types that hit several members hard with nothing to absorb them.
    const isUncovered = row.weak >= 3 && row.resist + row.immune === 0;

    [row.weak, row.resist, row.immune].forEach((count, index) => {
      const cell = document.createElement("td");
      cell.className = "defensive-chart-total";
      cell.textContent = count === 0 ? "" : String(count);

      if (index === 0 && isUncovered) {
        cell.classList.add("is-uncovered");
      }

      tableRow.appendChild(cell);
    });

    body.appendChild(tableRow);
  });

  table.append(caption, head, body);

  const scroll = document.createElement("div");
  scroll.className = "defensive-chart-scroll";
  scroll.appendChild(table);

  container.replaceChildren(scroll);
}

function createChartHeader(text) {
  const header = document.createElement("th");
  header.scope = "col";
  header.textContent = text;

  return header;
}
