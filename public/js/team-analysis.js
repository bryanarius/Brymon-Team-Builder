"use strict";

/*
 * Fetches the team's data from PokéAPI and renders the analysis panel.
 * The calculations live in resources/ts/analysis/team-analysis.ts, which
 * the team page loads as window.BrymonTeamAnalysis.
 */
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

  const roleBalanceContainer = document.querySelector(
    "#analysis-role-balance",
  );

  const summaryList = document.querySelector("#team-analysis-summary-list");

  const defensiveChartContainer = document.querySelector(
    "#analysis-defensive-chart",
  );

  const typeCache = new Map();
  const moveCache = new Map();
  const teamPokemon = window.BRYMON_TEAM_POKEMON || [];

  if (
    !statusElement ||
    !contentElement ||
    !summaryList ||
    !weaknessContainer ||
    !immunityContainer ||
    !teamTypesContainer ||
    !typeCoverageContainer ||
    !roleBalanceContainer
  ) {
    return;
  }

  if (pokemonCards.length === 0) {
    statusElement.textContent = "Add Pokémon to this team to view analysis.";

    return;
  }

  const analysis = window.BrymonTeamAnalysis;

  if (!analysis) {
    statusElement.textContent = "Unable to load team analysis.";

    return;
  }

  const { formatTypeName } = analysis;

  initializeTeamAnalysis();

  async function initializeTeamAnalysis() {
    try {
      const pokemonDetails = await Promise.all(
        pokemonCards.map((card) => {
          const pokemonId = card.dataset.pokemonId;

          return fetchPokemonDetails(pokemonId);
        }),
      );

      const defensiveAnalysis = analysis.analyzeTeamDefense(
        analysis.buildTypeMultiplierMap(pokemonDetails, teamPokemon),
      );

      renderDefensiveChart(
        defensiveChartContainer,
        pokemonDetails.map((pokemon, index) => ({
          name: formatPokemonDisplayName(pokemon.name),
          image:
            pokemon.sprites.other["official-artwork"].front_default ??
            pokemon.sprites.front_default ??
            "",
          types: pokemon.types.map((entry) => entry.type.name),
          ability: teamPokemon[index]?.ability ?? "",
        })),
      );

      const resistanceMap = analysis.buildResistanceMap(
        await Promise.all(analysis.ATTACKING_TYPES.map(fetchType)),
      );
      const roleBalance = analysis.computeRoleBalance(
        pokemonDetails,
        teamPokemon,
      );

      renderSummaryList(
        summaryList,
        analysis.buildTeamSummary(
          defensiveAnalysis,
          pokemonDetails,
          roleBalance.findings,
        ),
      );
      renderSharedWeaknesses(
        analysis.listSharedWeaknesses(defensiveAnalysis),
        resistanceMap,
      );
      renderImmunities(analysis.listImmunities(defensiveAnalysis));
      renderTeamTypes(analysis.groupTeamTypes(pokemonDetails));

      renderTypeCoverage(await fetchTypeCoverage());

      renderRoleBalance(roleBalance);

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

  async function fetchTypeCoverage() {
    const moveTypes = new Set();

    for (const moveName of analysis.teamMoveNames(teamPokemon)) {
      const moveData = await fetchMove(moveName);
      moveTypes.add(moveData.type.name);
    }

    const moveTypeData = [];

    for (const typeName of moveTypes) {
      moveTypeData.push(await fetchType(typeName));
    }

    return analysis.findTypeCoverage(moveTypeData);
  }

  function renderSharedWeaknesses(weaknesses, resistanceMap) {
    weaknessContainer.replaceChildren();

    if (weaknesses.length === 0) {
      weaknessContainer.append(
        createAnalysisEmptyMessage("No shared weaknesses found."),
      );

      return;
    }

    weaknesses.forEach(({ type, pokemon }) => {
      const severity = analysis.getWeaknessSeverity(pokemon.length);

      weaknessContainer.appendChild(
        createExpandableAnalysisItem({
          typeName: type,
          pokemon,
          severity: {
            label: severity.label,
            className: `analysis-severity-${severity.level}`,
          },
          itemType: "weakness",
          recommendation: analysis.buildRecommendation(
            type,
            resistanceMap[type],
          ),
        }),
      );
    });
  }

  function renderImmunities(immunities) {
    immunityContainer.replaceChildren();

    if (immunities.length === 0) {
      immunityContainer.append(
        createAnalysisEmptyMessage("This team has no base-type immunities."),
      );

      return;
    }

    immunities.forEach(({ type, pokemon }) => {
      immunityContainer.appendChild(
        createExpandableAnalysisItem({
          typeName: type,
          pokemon,
          severity: {
            label: "Immunity",
            className: "analysis-severity-positive",
          },
          itemType: "immunity",
        }),
      );
    });
  }

  function renderTeamTypes(teamTypes) {
    teamTypesContainer.replaceChildren();

    teamTypes.forEach(({ type, pokemon }) => {
      teamTypesContainer.appendChild(
        createExpandableAnalysisItem({
          typeName: type,
          pokemon,
          severity: {
            label: "Team Type",
            className: "analysis-severity-neutral",
          },
          itemType: "team-type",
        }),
      );
    });
  }

  function renderTypeCoverage({ covered, gaps }) {
    typeCoverageContainer.replaceChildren();

    if (covered.length === 0) {
      typeCoverageContainer.append(
        createAnalysisEmptyMessage(
          "Select moves on this team to see type coverage.",
        ),
      );

      return;
    }

    typeCoverageContainer.append(
      ...createTypeBadgeList("Super-effective against:", covered),
    );

    if (gaps.length > 0) {
      typeCoverageContainer.append(
        ...createTypeBadgeList("No coverage against:", gaps),
      );
    }
  }

  function createTypeBadgeList(headingText, typeNames) {
    const heading = document.createElement("p");
    heading.className = "analysis-breakdown-heading";
    heading.textContent = headingText;

    const list = document.createElement("div");
    list.className = "analysis-type-badge-list";

    typeNames
      .slice()
      .sort()
      .forEach((typeName) => {
        const badge = document.createElement("span");
        badge.className = `pokemon-type-badge pokemon-type-${typeName}`;
        badge.textContent = formatTypeName(typeName);

        list.appendChild(badge);
      });

    return [heading, list];
  }

  function renderRoleBalance({ roleMembers, findings, teamSize }) {
    roleBalanceContainer.replaceChildren();

    if (teamSize === 0) {
      roleBalanceContainer.append(
        createAnalysisEmptyMessage(
          "Add Pokémon to this team to see role balance.",
        ),
      );

      return;
    }

    const findingsList = document.createElement("ul");
    findingsList.className =
      "team-analysis-summary-list analysis-role-findings";

    renderSummaryList(findingsList, findings);

    roleBalanceContainer.appendChild(findingsList);

    const populatedRoles = analysis.ROLE_ORDER.filter(
      (roleKey) => roleMembers[roleKey].length > 0,
    );

    if (populatedRoles.length === 0) {
      roleBalanceContainer.append(
        createAnalysisEmptyMessage(
          "No roles detected yet — set natures, EVs, and moves on this team.",
        ),
      );

      return;
    }

    populatedRoles.forEach((roleKey) => {
      roleBalanceContainer.appendChild(
        createRoleAnalysisItem({
          label: analysis.ROLE_LABELS[roleKey],
          pokemon: roleMembers[roleKey],
        }),
      );
    });
  }

  function createRoleAnalysisItem({ label, pokemon }) {
    const details = document.createElement("details");
    details.className = "analysis-type-item analysis-type-details";

    const summary = document.createElement("summary");
    summary.className = "analysis-type-summary";

    const roleBadge = document.createElement("span");
    roleBadge.className = "analysis-role-badge";
    roleBadge.textContent = label;

    const summaryContent = document.createElement("div");
    summaryContent.className = "analysis-type-item-content";

    const countText = document.createElement("strong");
    countText.textContent = `${pokemon.length} Pokémon`;

    summaryContent.appendChild(countText);
    summary.append(roleBadge, summaryContent, createExpandIcon());

    const expandedContent = document.createElement("div");
    expandedContent.className = "analysis-pokemon-breakdown";

    const heading = document.createElement("p");
    heading.className = "analysis-breakdown-heading";
    heading.textContent = `${label}:`;

    expandedContent.append(
      heading,
      createPokemonList(analysis.sortPokemonEntries(pokemon), false),
    );
    details.append(summary, expandedContent);

    return details;
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

    summaryContent.appendChild(countText);

    if (itemType !== "team-type") {
      const severityLabel = document.createElement("span");
      severityLabel.className = `analysis-severity ${severity.className}`;
      severityLabel.textContent = severity.label;

      summaryContent.appendChild(severityLabel);
    }

    summary.append(typeBadge, summaryContent, createExpandIcon());

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

    expandedContent.append(
      heading,
      createPokemonList(
        analysis.sortPokemonEntries(pokemon),
        itemType === "weakness",
      ),
    );

    if (itemType === "weakness" && recommendation) {
      const recommendationParagraph = document.createElement("p");
      recommendationParagraph.className = "analysis-recommendation";
      recommendationParagraph.textContent = recommendation;

      expandedContent.appendChild(recommendationParagraph);
    }

    details.append(summary, expandedContent);

    return details;
  }

  function createPokemonList(pokemon, showMultiplier) {
    const list = document.createElement("ul");
    list.className = "analysis-pokemon-list";

    pokemon.forEach((entry) => {
      const listItem = document.createElement("li");

      const name = document.createElement("span");
      name.textContent = formatPokemonDisplayName(entry.name);

      listItem.appendChild(name);

      if (showMultiplier && entry.multiplier > 1) {
        const multiplier = document.createElement("strong");
        multiplier.className = "analysis-damage-multiplier";
        multiplier.textContent = `${entry.multiplier}×`;

        listItem.appendChild(multiplier);
      }

      list.appendChild(listItem);
    });

    return list;
  }

  function createExpandIcon() {
    const arrow = document.createElement("span");
    arrow.className = "analysis-expand-icon";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "⌄";

    return arrow;
  }

  function renderSummaryList(list, findings) {
    list.replaceChildren(
      ...findings.map(({ kind, message }) => createSummaryItem(kind, message)),
    );
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
});
