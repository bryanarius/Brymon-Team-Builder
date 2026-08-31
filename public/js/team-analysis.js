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

  const roleBalanceContainer = document.querySelector(
    "#analysis-role-balance",
  );

  const summaryList = document.querySelector("#team-analysis-summary-list");

  const typeCache = new Map();
  const moveCache = new Map();
  const teamPokemon = window.BRYMON_TEAM_POKEMON || [];

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

  const NEUTRAL_NATURES = new Set([
    "hardy",
    "docile",
    "serious",
    "bashful",
    "quirky",
  ]);

  const NATURE_MODIFIERS = {
    adamant: { plus: "attack", minus: "special-attack" },
    brave: { plus: "attack", minus: "speed" },
    lonely: { plus: "attack", minus: "defense" },
    naughty: { plus: "attack", minus: "special-defense" },
    bold: { plus: "defense", minus: "attack" },
    relaxed: { plus: "defense", minus: "speed" },
    impish: { plus: "defense", minus: "special-attack" },
    lax: { plus: "defense", minus: "special-defense" },
    modest: { plus: "special-attack", minus: "attack" },
    mild: { plus: "special-attack", minus: "defense" },
    quiet: { plus: "special-attack", minus: "speed" },
    rash: { plus: "special-attack", minus: "special-defense" },
    calm: { plus: "special-defense", minus: "attack" },
    gentle: { plus: "special-defense", minus: "defense" },
    sassy: { plus: "special-defense", minus: "speed" },
    careful: { plus: "special-defense", minus: "special-attack" },
    timid: { plus: "speed", minus: "attack" },
    hasty: { plus: "speed", minus: "defense" },
    jolly: { plus: "speed", minus: "special-attack" },
    naive: { plus: "speed", minus: "special-defense" },
  };

  const UTILITY_MOVES = {
    "hazard-setter": new Set([
      "stealth-rock",
      "spikes",
      "toxic-spikes",
      "sticky-web",
      "stone-axe",
      "ceaseless-edge",
    ]),
    "hazard-removal": new Set([
      "rapid-spin",
      "defog",
      "tidy-up",
      "mortal-spin",
      "court-change",
    ]),
    pivot: new Set([
      "u-turn",
      "volt-switch",
      "flip-turn",
      "teleport",
      "parting-shot",
      "baton-pass",
      "chilly-reception",
      "shed-tail",
    ]),
    "speed-control": new Set([
      "tailwind",
      "trick-room",
      "thunder-wave",
      "icy-wind",
      "electroweb",
      "glare",
      "nuzzle",
      "bulldoze",
      "scary-face",
      "sticky-web",
    ]),
    cleric: new Set([
      "wish",
      "heal-bell",
      "aromatherapy",
      "healing-wish",
      "lunar-dance",
      "jungle-healing",
      "life-dew",
      "floral-healing",
    ]),
    setup: new Set([
      "swords-dance",
      "dragon-dance",
      "nasty-plot",
      "calm-mind",
      "quiver-dance",
      "bulk-up",
      "coil",
      "shift-gear",
      "agility",
      "rock-polish",
      "autotomize",
      "work-up",
      "hone-claws",
      "victory-dance",
      "no-retreat",
      "clangorous-soul",
      "geomancy",
      "tail-glow",
      "shell-smash",
      "belly-drum",
      "fillet-away",
      "take-heart",
      "growth",
      "curse",
    ]),
    recovery: new Set([
      "recover",
      "roost",
      "slack-off",
      "soft-boiled",
      "synthesis",
      "moonlight",
      "morning-sun",
      "milk-drink",
      "shore-up",
      "strength-sap",
      "rest",
    ]),
  };

  const ROLE_LABELS = {
    "physical-attacker": "Physical Attacker",
    "special-attacker": "Special Attacker",
    wall: "Wall / Tank",
    balanced: "Balanced Pivot",
    setup: "Setup Sweeper",
    pivot: "Pivot",
    "speed-control": "Speed Control",
    "hazard-setter": "Hazard Setter",
    "hazard-removal": "Hazard Removal",
    cleric: "Cleric",
    recovery: "Reliable Recovery",
  };

  const ROLE_ORDER = [
    "physical-attacker",
    "special-attacker",
    "wall",
    "balanced",
    "setup",
    "pivot",
    "speed-control",
    "hazard-setter",
    "hazard-removal",
    "cleric",
    "recovery",
  ];

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
      const roleBalance = computeRoleBalance(pokemonDetails, teamPokemon);

      renderTeamSummary(
        defensiveAnalysis,
        pokemonDetails,
        roleBalance.findings,
      );
      renderSharedWeaknesses(defensiveAnalysis.sharedWeaknesses, resistanceMap);
      renderImmunities(defensiveAnalysis.immunities);
      renderTeamTypes(pokemonDetails);

      const typeCoverage = await computeTypeCoverage(teamPokemon);
      renderTypeCoverage(typeCoverage.covered, typeCoverage.gaps);

      renderRoleBalance(roleBalance);

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

  function getBaseStats(details) {
    const stats = {};

    details.stats.forEach((entry) => {
      stats[entry.stat.name] = entry.base_stat;
    });

    return stats;
  }

  function natureStatMultiplier(nature, statName) {
    if (!nature || NEUTRAL_NATURES.has(nature)) {
      return 1;
    }

    const modifier = NATURE_MODIFIERS[nature];

    if (!modifier) {
      return 1;
    }

    if (modifier.plus === statName) {
      return 1.1;
    }

    if (modifier.minus === statName) {
      return 0.9;
    }

    return 1;
  }

  function effectiveStat(baseStat, ev, multiplier) {
    const base = typeof baseStat === "number" ? baseStat : 0;

    return (2 * base + 31 + Math.floor((ev || 0) / 4)) * multiplier;
  }

  function classifyPokemon(details, config) {
    const base = getBaseStats(details);
    const nature = (config.nature || "").toLowerCase();
    const evs = config.evs || {};

    const attack = effectiveStat(
      base.attack,
      evs.attack,
      natureStatMultiplier(nature, "attack"),
    );

    const specialAttack = effectiveStat(
      base["special-attack"],
      evs["special-attack"],
      natureStatMultiplier(nature, "special-attack"),
    );

    const hp = effectiveStat(base.hp, evs.hp, 1);

    const defense = effectiveStat(
      base.defense,
      evs.defense,
      natureStatMultiplier(nature, "defense"),
    );

    const specialDefense = effectiveStat(
      base["special-defense"],
      evs["special-defense"],
      natureStatMultiplier(nature, "special-defense"),
    );

    const offense = Math.max(attack, specialAttack);
    const bulk = (hp + defense + specialDefense) / 3;
    const ratio = bulk === 0 ? 1 : offense / bulk;

    const roles = new Set();

    if (ratio >= 1.08) {
      roles.add(
        attack >= specialAttack ? "physical-attacker" : "special-attacker",
      );
    } else if (ratio <= 0.92) {
      roles.add("wall");
    } else {
      roles.add("balanced");
    }

    const baseSpeed = typeof base.speed === "number" ? base.speed : 0;
    const speedInvested =
      (evs.speed || 0) >= 200 || natureStatMultiplier(nature, "speed") > 1;

    let speed = "mid";

    if (baseSpeed >= 100 || (baseSpeed >= 80 && speedInvested)) {
      speed = "fast";
    } else if (baseSpeed <= 55 && !speedInvested) {
      speed = "slow";
    }

    (config.moves || []).forEach((moveName) => {
      const move = String(moveName).toLowerCase();

      Object.entries(UTILITY_MOVES).forEach(([roleKey, moveSet]) => {
        if (moveSet.has(move)) {
          roles.add(roleKey);
        }
      });
    });

    return {
      roles: [...roles],
      speed,
    };
  }

  function computeRoleBalance(pokemonDetails, teamConfig) {
    const detailsById = new Map();

    pokemonDetails.forEach((details) => {
      detailsById.set(details.id, details);
    });

    const configs =
      teamConfig.length > 0
        ? teamConfig
        : pokemonDetails.map((details) => ({
            pokemonApiId: details.id,
            name: details.name,
            nature: null,
            evs: {},
            moves: [],
          }));

    const perPokemon = configs.map((config) => {
      const details = detailsById.get(config.pokemonApiId);
      const displayName =
        config.name || (details && details.name) || `#${config.pokemonApiId}`;

      if (!details) {
        return {
          name: displayName,
          roles: [],
          speed: "mid",
        };
      }

      const classified = classifyPokemon(details, config);

      return {
        name: displayName,
        roles: classified.roles,
        speed: classified.speed,
      };
    });

    const roleMembers = {};

    ROLE_ORDER.forEach((roleKey) => {
      roleMembers[roleKey] = [];
    });

    perPokemon.forEach((entry) => {
      entry.roles.forEach((roleKey) => {
        if (!roleMembers[roleKey]) {
          roleMembers[roleKey] = [];
        }

        roleMembers[roleKey].push({
          name: entry.name,
        });
      });
    });

    const speeds = perPokemon.map((entry) => entry.speed);

    const findings = buildRoleFindings(roleMembers, speeds, perPokemon.length);

    return {
      roleMembers,
      findings,
      teamSize: perPokemon.length,
    };
  }

  function buildRoleFindings(roleMembers, speeds, teamSize) {
    const count = (roleKey) => (roleMembers[roleKey] || []).length;
    const findings = [];

    const physical = count("physical-attacker");
    const special = count("special-attacker");
    const walls = count("wall");

    if (teamSize >= 4 && physical >= teamSize - 1 && special === 0) {
      findings.push({
        kind: "warning",
        message:
          `${physical} of ${teamSize} Pokémon are physical attackers ` +
          `and none are special — a single physical wall can check ` +
          `most of the team.`,
      });
    } else if (teamSize >= 4 && special >= teamSize - 1 && physical === 0) {
      findings.push({
        kind: "warning",
        message:
          `${special} of ${teamSize} Pokémon are special attackers ` +
          `and none are physical — a single special wall can check ` +
          `most of the team.`,
      });
    } else if (physical > 0 && special > 0) {
      findings.push({
        kind: "positive",
        message:
          `Offense is split across ${physical} physical and ` +
          `${special} special ` +
          `${special === 1 ? "attacker" : "attackers"}, ` +
          `which is harder to wall.`,
      });
    }

    if (teamSize >= 5 && walls === 0) {
      findings.push({
        kind: "warning",
        message:
          "No defensive walls — nothing on the team can switch into " +
          "strong attackers repeatedly.",
      });
    }

    if (count("hazard-removal") === 0) {
      findings.push({
        kind: "warning",
        message:
          "No hazard removal (Rapid Spin / Defog) — entry hazards will " +
          "chip the team on every switch-in.",
      });
    }

    if (count("hazard-setter") > 0) {
      findings.push({
        kind: "positive",
        message: `${count("hazard-setter")} Pokémon can set entry hazards.`,
      });
    }

    const fast = speeds.filter((tier) => tier === "fast").length;
    const slow = speeds.filter((tier) => tier === "slow").length;

    if (count("speed-control") === 0 && fast <= 1 && slow >= 3) {
      findings.push({
        kind: "warning",
        message:
          `${slow} Pokémon are slow and the team has no speed control ` +
          `(Tailwind, Trick Room, paralysis) — faster teams move first.`,
      });
    }

    if (count("pivot") === 0 && teamSize >= 5) {
      findings.push({
        kind: "neutral",
        message:
          "No pivoting moves (U-turn, Volt Switch) — it will be harder " +
          "to bring threats in safely.",
      });
    }

    if (findings.length === 0) {
      findings.push({
        kind: "positive",
        message: "The team has a well-rounded spread of roles.",
      });
    }

    return findings;
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

    findings.forEach(({ kind, message }) => {
      findingsList.appendChild(createSummaryItem(kind, message));
    });

    roleBalanceContainer.appendChild(findingsList);

    const populatedRoles = ROLE_ORDER.filter(
      (roleKey) => (roleMembers[roleKey] || []).length > 0,
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
          label: ROLE_LABELS[roleKey],
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

    const arrow = document.createElement("span");
    arrow.className = "analysis-expand-icon";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "⌄";

    summaryContent.appendChild(countText);
    summary.append(roleBadge, summaryContent, arrow);

    const expandedContent = document.createElement("div");
    expandedContent.className = "analysis-pokemon-breakdown";

    const heading = document.createElement("p");
    heading.className = "analysis-breakdown-heading";
    heading.textContent = `${label}:`;

    const list = document.createElement("ul");
    list.className = "analysis-pokemon-list";

    pokemon
      .slice()
      .sort((first, second) => first.name.localeCompare(second.name))
      .forEach((entry) => {
        const listItem = document.createElement("li");

        const name = document.createElement("span");
        name.textContent = formatPokemonName(entry.name);

        listItem.appendChild(name);
        list.appendChild(listItem);
      });

    expandedContent.append(heading, list);
    details.append(summary, expandedContent);

    return details;
  }

  function renderTeamSummary(defensiveAnalysis, pokemonDetails, roleFindings = []) {
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

    roleFindings
      .filter((finding) => finding.kind === "warning")
      .slice(0, 2)
      .forEach((finding) => {
        findings.push({
          kind: "warning",
          message: finding.message,
        });
      });

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
