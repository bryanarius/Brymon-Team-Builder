"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.querySelector("#team-analysis-status");

  const contentElement = document.querySelector("#team-analysis-content");

  const pokemonCards = [
    ...document.querySelectorAll(".team-detail-pokemon-card[data-pokemon-id]"),
  ];

  const weaknessContainer = document.querySelector("#analysis-weaknesses");

  const immunityContainer = document.querySelector("#analysis-immunities");

  const teamTypesContainer = document.querySelector("#analysis-team-types");

  const typeCoverageContainer = document.querySelector(
    "#analysis-type-coverage",
  );

  const summaryList = document.querySelector("#team-analysis-summary-list");

  const typeCache = new Map();
  const moveCache = new Map();
  const teamMoves = window.BRYMON_TEAM_MOVES || [];

  const ATTACKING_TYPES = [
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

  if (
    !statusElement ||
    !contentElement ||
    !summaryList ||
    !weaknessContainer ||
    !immunityContainer ||
    !teamTypesContainer ||
    !typeCoverageContainer
  ) {
    return;
  }

  if (pokemonCards.length === 0) {
    statusElement.textContent = "Add Pokémon to this team to view analysis.";

    return;
  }

  initializeTeamAnalysis();

  async function initializeTeamAnalysis() {
    try {
      const pokemonDetails = await Promise.all(
        pokemonCards.map((card) => {
          const pokemonId = card.dataset.pokemonId;

          return fetchPokemonDetails(pokemonId);
        }),
      );

      const multipliers = await buildTypeMultiplierMap(pokemonDetails);

      const defensiveAnalysis = analyzeTeamDefense(multipliers);
      const resistanceMap = await buildResistanceMap();
      renderTeamSummary(defensiveAnalysis, pokemonDetails);
      renderSharedWeaknesses(defensiveAnalysis.sharedWeaknesses, resistanceMap);
      renderImmunities(defensiveAnalysis.immunities);
      renderTeamTypes(pokemonDetails);

      const typeCoverage = await computeTypeCoverage(teamMoves);
      renderTypeCoverage(typeCoverage.covered, typeCoverage.gaps);

      // console.log(
      // "Team defense:",
      // defensiveAnalysis,
      // );

      // console.log(
      // "Defensive multiplier map:",
      // multipliers,
      // );

      Object.entries(multipliers).forEach(([pokemonName, multiplierMap]) => {
        const weaknesses = Object.entries(multiplierMap).filter(
          ([, multiplier]) => multiplier > 1,
        );

        const immunities = Object.entries(multiplierMap).filter(
          ([, multiplier]) => multiplier === 0,
        );

        // console.log(
        // pokemonName,
        // "weaknesses:",
        // weaknesses,
        // "immunities:",
        // immunities,
        // );
      });

      // console.log(
      //     "Team analysis Pokémon:",
      //     pokemonDetails,
      // );

      statusElement.hidden = true;
      contentElement.hidden = false;
    } catch (error) {
      console.error("Team analysis error:", error);

      statusElement.textContent = "Unable to load team analysis.";
    }
  }

  async function fetchPokemonDetails(pokemonId) {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
    );

    if (!response.ok) {
      throw new Error(`Unable to load Pokémon #${pokemonId}.`);
    }

    return response.json();
  }

  async function fetchType(typeName) {
    if (typeCache.has(typeName)) {
      return typeCache.get(typeName);
    }

    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);

    if (!response.ok) {
      throw new Error(`Unable to load type ${typeName}.`);
    }

    const data = await response.json();

    typeCache.set(typeName, data);

    return data;
  }

  async function fetchMove(moveName) {
    if (moveCache.has(moveName)) {
      return moveCache.get(moveName);
    }

    const response = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);

    if (!response.ok) {
      throw new Error(`Unable to load move ${moveName}.`);
    }

    const data = await response.json();

    moveCache.set(moveName, data);

    return data;
  }

  async function computeTypeCoverage(teamMoveData) {
    const moveNames = new Set();

    teamMoveData.forEach((pokemon) => {
      pokemon.moves.forEach((moveName) => {
        moveNames.add(moveName);
      });
    });

    const moveTypes = new Set();

    for (const moveName of moveNames) {
      const moveData = await fetchMove(moveName);
      moveTypes.add(moveData.type.name);
    }

    const covered = new Set();

    for (const typeName of moveTypes) {
      const typeData = await fetchType(typeName);

      typeData.damage_relations.double_damage_to.forEach(({ name }) => {
        covered.add(name);
      });
    }

    const gaps = ATTACKING_TYPES.filter((typeName) => !covered.has(typeName));

    return {
      covered: [...covered],
      gaps,
    };
  }

  async function buildTypeMultiplierMap(pokemonDetails) {
    const result = {};

    for (const pokemon of pokemonDetails) {
      const typeMultiplierMaps = [];

      for (const typeEntry of pokemon.types) {
        const typeName = typeEntry.type.name;
        const typeData = await fetchType(typeName);

        const multiplierMap = buildSingleTypeMultiplierMap(typeData);

        typeMultiplierMaps.push(multiplierMap);
      }

      result[pokemon.name] = combineTypeMultiplierMaps(typeMultiplierMaps);
    }

    return result;
  }

  async function buildResistanceMap() {
    const allTypeData = await Promise.all(
      ATTACKING_TYPES.map((typeName) => fetchType(typeName)),
    );

    const resistanceMap = {};

    ATTACKING_TYPES.forEach((typeName) => {
      resistanceMap[typeName] = [];
    });

    allTypeData.forEach((typeData) => {
      const defendingType = typeData.name;

      typeData.damage_relations.half_damage_from.forEach(({ name }) => {
        resistanceMap[name].push({
          type: defendingType,
          kind: "resist",
        });
      });

      typeData.damage_relations.no_damage_from.forEach(({ name }) => {
        resistanceMap[name].push({
          type: defendingType,
          kind: "immune",
        });
      });
    });

    return resistanceMap;
  }

  function analyzeTeamDefense(multipliers) {
    const sharedWeaknesses = {};
    const immunities = {};

    ATTACKING_TYPES.forEach((typeName) => {
      sharedWeaknesses[typeName] = [];
      immunities[typeName] = [];
    });

    Object.entries(multipliers).forEach(([pokemonName, multiplierMap]) => {
      ATTACKING_TYPES.forEach((typeName) => {
        const multiplier = multiplierMap[typeName];

        if (multiplier > 1) {
          sharedWeaknesses[typeName].push({
            name: pokemonName,
            multiplier,
          });
        }

        if (multiplier === 0) {
          immunities[typeName].push({
            name: pokemonName,
            multiplier,
          });
        }
      });
    });

    return {
      sharedWeaknesses,
      immunities,
    };
  }

  function combineTypeMultiplierMaps(typeMultiplierMaps) {
    const combinedMultipliers = {};

    ATTACKING_TYPES.forEach((typeName) => {
      combinedMultipliers[typeName] = 1;
    });

    typeMultiplierMaps.forEach((multiplierMap) => {
      ATTACKING_TYPES.forEach((typeName) => {
        combinedMultipliers[typeName] *= multiplierMap[typeName];
      });
    });

    return combinedMultipliers;
  }

  function buildSingleTypeMultiplierMap(typeData) {
    const multipliers = {};

    ATTACKING_TYPES.forEach((type) => {
      multipliers[type] = 1;
    });

    typeData.damage_relations.double_damage_from.forEach(({ name }) => {
      multipliers[name] = 2;
    });

    typeData.damage_relations.half_damage_from.forEach(({ name }) => {
      multipliers[name] = 0.5;
    });

    typeData.damage_relations.no_damage_from.forEach(({ name }) => {
      multipliers[name] = 0;
    });

    return multipliers;
  }

  function renderSharedWeaknesses(sharedWeaknesses, resistanceMap) {
    const weaknesses = Object.entries(sharedWeaknesses)
      .filter(([, pokemon]) => pokemon.length >= 2)
      .sort((first, second) => {
        return second[1].length - first[1].length;
      });

    weaknessContainer.replaceChildren();

    if (weaknesses.length === 0) {
      weaknessContainer.append(
        createAnalysisEmptyMessage("No shared weaknesses found."),
      );

      return;
    }

    weaknesses.forEach(([typeName, pokemon]) => {
      const count = pokemon.length;
      const severity = getWeaknessSeverity(count);

      const item = createExpandableAnalysisItem({
        typeName,
        pokemon,
        severity,
        itemType: "weakness",
        recommendation: resistanceMap[typeName],
      });

      weaknessContainer.appendChild(item);
    });
  }

  function getWeaknessSeverity(count) {
    if (count >= 4) {
      return {
        label: "Major",
        className: "analysis-severity-major",
      };
    }

    if (count === 3) {
      return {
        label: "Moderate",
        className: "analysis-severity-moderate",
      };
    }

    return {
      label: "Minor",
      className: "analysis-severity-minor",
    };
  }

  function renderImmunities(immunities) {
    const immunityEntries = Object.entries(immunities)
      .filter(([, pokemon]) => pokemon.length > 0)
      .sort((first, second) => {
        return second[1].length - first[1].length;
      });

    immunityContainer.replaceChildren();

    if (immunityEntries.length === 0) {
      immunityContainer.append(
        createAnalysisEmptyMessage("This team has no base-type immunities."),
      );

      return;
    }

    immunityEntries.forEach(([typeName, pokemon]) => {
      const item = createExpandableAnalysisItem({
        typeName,
        pokemon,
        severity: {
          label: "Immunity",
          className: "analysis-severity-positive",
        },
        itemType: "immunity",
      });

      immunityContainer.appendChild(item);
    });
  }

  function renderTeamTypes(pokemonDetails) {
    const typePokemonMap = {};

    pokemonDetails.forEach((pokemon) => {
      pokemon.types.forEach((typeEntry) => {
        const typeName = typeEntry.type.name;

        if (!typePokemonMap[typeName]) {
          typePokemonMap[typeName] = [];
        }

        typePokemonMap[typeName].push({
          name: pokemon.name,
        });
      });
    });

    const sortedTypes = Object.entries(typePokemonMap).sort((first, second) => {
      return second[1].length - first[1].length;
    });

    teamTypesContainer.replaceChildren();

    sortedTypes.forEach(([typeName, pokemon]) => {
      const item = createExpandableAnalysisItem({
        typeName,
        pokemon,
        severity: {
          label: "Team Type",
          className: "analysis-severity-neutral",
        },
        itemType: "team-type",
      });

      teamTypesContainer.appendChild(item);
    });
  }

  function renderTypeCoverage(covered, gaps) {
    typeCoverageContainer.replaceChildren();

    if (covered.length === 0) {
      typeCoverageContainer.append(
        createAnalysisEmptyMessage(
          "Select moves on this team to see type coverage.",
        ),
      );

      return;
    }

    const coveredHeading = document.createElement("p");
    coveredHeading.className = "analysis-breakdown-heading";
    coveredHeading.textContent = "Super-effective against:";

    const coveredList = document.createElement("div");
    coveredList.className = "analysis-type-badge-list";

    covered
      .slice()
      .sort()
      .forEach((typeName) => {
        const badge = document.createElement("span");
        badge.className = `pokemon-type-badge pokemon-type-${typeName}`;
        badge.textContent = formatTypeName(typeName);

        coveredList.appendChild(badge);
      });

    typeCoverageContainer.append(coveredHeading, coveredList);

    if (gaps.length > 0) {
      const gapsHeading = document.createElement("p");
      gapsHeading.className = "analysis-breakdown-heading";
      gapsHeading.textContent = "No coverage against:";

      const gapsList = document.createElement("div");
      gapsList.className = "analysis-type-badge-list";

      gaps
        .slice()
        .sort()
        .forEach((typeName) => {
          const badge = document.createElement("span");
          badge.className = `pokemon-type-badge pokemon-type-${typeName}`;
          badge.textContent = formatTypeName(typeName);

          gapsList.appendChild(badge);
        });

      typeCoverageContainer.append(gapsHeading, gapsList);
    }
  }

  function renderTeamSummary(defensiveAnalysis, pokemonDetails) {
    const findings = [];

    const weaknessEntries = Object.entries(defensiveAnalysis.sharedWeaknesses)
      .filter(([, pokemon]) => pokemon.length >= 2)
      .sort((first, second) => {
        return second[1].length - first[1].length;
      });

    const immunityEntries = Object.entries(defensiveAnalysis.immunities)
      .filter(([, pokemon]) => pokemon.length > 0)
      .sort((first, second) => {
        return second[1].length - first[1].length;
      });

    const typeCounts = getTeamTypeCounts(pokemonDetails);

    weaknessEntries.slice(0, 3).forEach(([typeName, pokemon]) => {
      const count = pokemon.length;
      const severity = getWeaknessSeverity(count);

      findings.push({
        kind: "warning",
        message:
          `${formatTypeName(typeName)} is a ` +
          `${severity.label.toLowerCase()} shared weakness ` +
          `for ${count} Pokémon.`,
      });
    });

    immunityEntries.slice(0, 2).forEach(([typeName, pokemon]) => {
      const count = pokemon.length;

      findings.push({
        kind: "positive",
        message:
          `${count} ${count === 1 ? "Pokémon is" : "Pokémon are"} ` +
          `immune to ${formatTypeName(typeName)}.`,
      });
    });

    const mostCommonType = Object.entries(typeCounts).sort((first, second) => {
      return second[1] - first[1];
    })[0];

    if (mostCommonType) {
      const [typeName, count] = mostCommonType;

      if (count > 1) {
        findings.push({
          kind: "neutral",
          message:
            `${formatTypeName(typeName)} is the team’s most ` +
            `common type, appearing on ${count} Pokémon.`,
        });
      } else {
        findings.push({
          kind: "positive",
          message:
            `The team has strong type diversity with ` +
            `${Object.keys(typeCounts).length} unique types.`,
        });
      }
    }

    summaryList.replaceChildren();

    if (findings.length === 0) {
      const item = createSummaryItem(
        "positive",
        "No major defensive concerns were found.",
      );

      summaryList.appendChild(item);
      return;
    }

    findings.forEach(({ kind, message }) => {
      summaryList.appendChild(createSummaryItem(kind, message));
    });
  }

  function createExpandableAnalysisItem({
    typeName,
    pokemon,
    severity,
    itemType,
    recommendation,
  }) {
    const details = document.createElement("details");
    details.className = "analysis-type-item analysis-type-details";

    const summary = document.createElement("summary");
    summary.className = "analysis-type-summary";

    const typeBadge = document.createElement("span");
    typeBadge.className = `pokemon-type-badge pokemon-type-${typeName}`;
    typeBadge.textContent = formatTypeName(typeName);

    const summaryContent = document.createElement("div");
    summaryContent.className = "analysis-type-item-content";

    const countText = document.createElement("strong");
    countText.textContent = `${pokemon.length} Pokémon`;

    const severityLabel = document.createElement("span");
    severityLabel.className = `analysis-severity ${severity.className}`;
    severityLabel.textContent = severity.label;

    const arrow = document.createElement("span");
    arrow.className = "analysis-expand-icon";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "⌄";

    summaryContent.appendChild(countText);

    if (itemType !== "team-type") {
      summaryContent.appendChild(severityLabel);
    }
    summary.append(typeBadge, summaryContent, arrow);

    const expandedContent = document.createElement("div");
    expandedContent.className = "analysis-pokemon-breakdown";

    const heading = document.createElement("p");
    heading.className = "analysis-breakdown-heading";

    if (itemType === "immunity") {
      heading.textContent = `Pokémon immune to ${formatTypeName(typeName)}:`;
    } else if (itemType === "team-type") {
      heading.textContent = `Pokémon with the ${formatTypeName(typeName)} type:`;
    } else {
      heading.textContent = `Pokémon weak to ${formatTypeName(typeName)}:`;
    }

    const list = document.createElement("ul");
    list.className = "analysis-pokemon-list";

    pokemon
      .slice()
      .sort((first, second) => {
        if (second.multiplier !== first.multiplier) {
          return second.multiplier - first.multiplier;
        }

        return first.name.localeCompare(second.name);
      })
      .forEach((pokemonEntry) => {
        const listItem = document.createElement("li");

        const name = document.createElement("span");
        name.textContent = formatPokemonName(pokemonEntry.name);

        listItem.appendChild(name);

        if (itemType === "weakness" && pokemonEntry.multiplier > 1) {
          const multiplier = document.createElement("strong");
          multiplier.className = "analysis-damage-multiplier";
          multiplier.textContent = `${pokemonEntry.multiplier}×`;

          listItem.appendChild(multiplier);
        }

        list.appendChild(listItem);
      });

    expandedContent.append(heading, list);

    if (
      itemType === "weakness" &&
      recommendation &&
      recommendation.length > 0
    ) {
      const immuneTypes = recommendation
        .filter((entry) => entry.kind === "immune")
        .map((entry) => formatTypeName(entry.type))
        .sort();

      const resistTypes = recommendation
        .filter((entry) => entry.kind === "resist")
        .map((entry) => formatTypeName(entry.type))
        .sort();

      const parts = [];

      if (immuneTypes.length > 0) {
        parts.push(`immune (${immuneTypes.join(", ")})`);
      }

      if (resistTypes.length > 0) {
        parts.push(`resistant (${resistTypes.join(", ")})`);
      }

      const recommendationParagraph = document.createElement("p");
      recommendationParagraph.className = "analysis-recommendation";
      recommendationParagraph.textContent =
        `Consider a pokemon that is ${parts.join(" or ")} ` +
        `to ${formatTypeName(typeName)}.`;

      expandedContent.appendChild(recommendationParagraph);
    }

    details.append(summary, expandedContent);

    return details;
  }

  function createSummaryItem(kind, message) {
    const item = document.createElement("li");
    item.className = `team-analysis-summary-item summary-${kind}`;

    const icon = document.createElement("span");
    icon.className = "team-analysis-summary-icon";
    icon.setAttribute("aria-hidden", "true");

    const icons = {
      warning: "!",
      positive: "✓",
      neutral: "i",
    };

    icon.textContent = icons[kind] ?? "i";

    const text = document.createElement("span");
    text.textContent = message;

    item.append(icon, text);

    return item;
  }

  function createAnalysisEmptyMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.className = "analysis-empty-message";
    paragraph.textContent = message;

    return paragraph;
  }

  function formatPokemonName(pokemonName) {
    return pokemonName
      .split("-")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  function formatTypeName(typeName) {
    return typeName.charAt(0).toUpperCase() + typeName.slice(1);
  }
});

function getTeamTypeCounts(pokemonDetails) {
  const typeCounts = {};

  pokemonDetails.forEach((pokemon) => {
    pokemon.types.forEach((typeEntry) => {
      const typeName = typeEntry.type.name;

      typeCounts[typeName] = (typeCounts[typeName] ?? 0) + 1;
    });
  });

  return typeCounts;
}
