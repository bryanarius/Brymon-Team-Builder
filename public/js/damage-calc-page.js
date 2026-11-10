"use strict";

/*
 * The /calc page. Each side (attacker, defender) is read into a plain set
 * object shaped like the team builder's ({ name, ability, item, nature,
 * evs, ivs, boosts, ... }) and handed to the TypeScript adapter
 * (resources/ts/calc/damage-calc.ts, exposed as globals by legacy-bridge.ts),
 * which does the calculating. Everything recalculates whenever any input
 * changes.
 */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".calc-page");
  const resultsContainer = document.querySelector("#calc-results");

  if (!page || !resultsContainer) {
    return;
  }

  const gen = getCalcGeneration();

  const CALC_STATS = [
    "hp",
    "attack",
    "defense",
    "specialAttack",
    "specialDefense",
    "speed",
  ];

  const NATURE_STAT_LABELS = {
    atk: "Atk",
    def: "Def",
    spa: "SpA",
    spd: "SpD",
    spe: "Spe",
  };

  // Max Moves and Z-Moves aren't in Scarlet and Violet.
  const moveNames = [...gen.moves]
    .filter((move) => !move.isMax && !move.isZ && move.name !== "(No Move)")
    .map((move) => move.name);

  // The signed-in user's teams, embedded by the page as JSON.
  const savedTeams = readSavedTeams();

  const speciesNames = [...gen.species].map((species) => species.name);
  const abilityNames = [...gen.abilities].map((ability) => ability.name);
  const itemNames = [...gen.items].map((item) => item.name);

  const sides = {
    attacker: createSide("attacker"),
    defender: createSide("defender"),
  };

  const conditions = {
    gameType: document.querySelector("#calc-game-type"),
    weather: document.querySelector("#calc-weather"),
    terrain: document.querySelector("#calc-terrain"),
    reflect: document.querySelector("#calc-reflect"),
    lightScreen: document.querySelector("#calc-light-screen"),
    auroraVeil: document.querySelector("#calc-aurora-veil"),
    criticalHit: document.querySelector("#calc-critical-hit"),
  };

  /*
   * A sample matchup, so the page explains itself before anything is
   * picked. A link from a saved team (?team=12&slot=3) loads that Pokémon
   * as the attacker instead.
   */
  const params = new URLSearchParams(window.location.search);
  const linkedPokemon = findSavedPokemon(params.get("team"), params.get("slot"));

  writeSide(
    "attacker",
    linkedPokemon
      ? toCalcSet(gen, linkedPokemon)
      : {
          name: "Great Tusk",
          ability: "Protosynthesis",
          item: "Booster Energy",
          nature: "Jolly",
          evs: { attack: 252, defense: 4, speed: 252 },
          moves: ["Headlong Rush", "Close Combat", "Ice Spinner", "Knock Off"],
        },
  );

  writeSide("defender", {
    name: "Kingambit",
    ability: "Supreme Overlord",
    item: "Leftovers",
    nature: "Adamant",
    evs: { hp: 252, attack: 252, specialDefense: 4 },
  });

  // Comboboxes report their own changes; this catches every other input.
  page.addEventListener("input", (event) => {
    if (!event.target.closest(".combobox")) {
      render();
    }
  });

  page.addEventListener("change", (event) => {
    if (!event.target.closest(".combobox")) {
      render();
    }
  });

  document.querySelector("#calc-swap").addEventListener("click", () => {
    const attacker = readSide("attacker");
    const defender = readSide("defender");

    writeSide("attacker", defender);
    writeSide("defender", attacker);

    render();
  });

  render();

  /*
  |--------------------------------------------------------------------------
  | Saved Teams
  |--------------------------------------------------------------------------
  */

  function readSavedTeams() {
    const element = document.querySelector("#calc-saved-teams");

    if (!element) {
      return [];
    }

    try {
      return JSON.parse(element.textContent);
    } catch (error) {
      console.error("Couldn't read saved teams:", error);
      return [];
    }
  }

  function findSavedPokemon(teamId, slot) {
    return (
      savedTeams
        .find((team) => String(team.id) === String(teamId))
        ?.pokemon.find((pokemon) => String(pokemon.slot) === String(slot)) ??
      null
    );
  }

  // One group per team: "Tusky (Great Tusk)", or just "Great Tusk".
  function fillSavedSelect(select) {
    savedTeams.forEach((team) => {
      const group = document.createElement("optgroup");
      group.label = team.name;

      team.pokemon.forEach((pokemon) => {
        const displayName = formatPokemonDisplayName(pokemon.name);

        group.appendChild(
          new Option(
            pokemon.nickname
              ? `${pokemon.nickname} (${displayName})`
              : displayName,
            `${team.id}:${pokemon.slot}`,
          ),
        );
      });

      select.appendChild(group);
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Sides
  |--------------------------------------------------------------------------
  */

  function createSide(side) {
    const root = document.querySelector(`#calc-${side}`);
    const field = (name) => root.querySelector(`#calc-${side}-${name}`);

    const species = createCombobox(field("species").closest(".combobox"), {
      formatLabel: getCalcDisplayName,
      onChange: () => {
        applyDefaultAbility(side);
        render();
      },
    });

    const ability = createCombobox(field("ability").closest(".combobox"), {
      onChange: render,
    });

    const item = createCombobox(field("item").closest(".combobox"), {
      onChange: render,
    });

    const moves = [...root.querySelectorAll('[data-role="move"]')].map(
      (input) => createCombobox(input.closest(".combobox"), { onChange: render }),
    );

    species.setOptions(speciesNames);
    ability.setOptions(abilityNames);
    item.setOptions(itemNames);
    moves.forEach((move) => move.setOptions(moveNames));

    const saved = root.querySelector('[data-role="saved"]');

    if (saved) {
      fillSavedSelect(saved);

      saved.addEventListener("change", () => {
        const [teamId, slot] = saved.value.split(":");
        const pokemon = findSavedPokemon(teamId, slot);

        if (pokemon) {
          writeSide(side, toCalcSet(gen, pokemon));
        }

        // Back to the prompt, so the same Pokémon can be loaded again
        // after editing it.
        saved.value = "";
      });
    }

    const nature = field("nature");

    [...gen.natures]
      .sort((first, second) => first.name.localeCompare(second.name))
      .forEach((entry) => {
        nature.add(new Option(formatNatureLabel(entry), entry.name));
      });

    return {
      root,
      species,
      ability,
      item,
      moves,
      nature,
      level: field("level"),
      tera: field("tera"),
      status: field("status"),
      types: field("types"),
      statRow: (stat) => root.querySelector(`tr[data-stat="${stat}"]`),
      evTotal: root.querySelector('[data-role="ev-total"]'),
      // The defender has no move inputs, but keeps its moves here so a
      // swap can bring them over to the attacker.
      storedMoves: [],
    };
  }

  /*
   * The library's data lists only one ability per Pokémon (Kingambit:
   * Defiant, not Supreme Overlord), so any ability can be picked, as on
   * Showdown's calculator. Choosing a Pokémon starts from that one.
   */
  function applyDefaultAbility(side) {
    const controls = sides[side];
    const species = gen.species.get(calc.toID(controls.species.getValue()));

    controls.ability.setValue(species?.abilities[0] ?? "");
  }

  function readSide(side) {
    const controls = sides[side];

    const readStats = (role, min, max, fallback) =>
      Object.fromEntries(
        CALC_STATS.map((stat) => {
          const input = controls
            .statRow(stat)
            .querySelector(`[data-role="${role}"]`);

          return [stat, input ? readNumber(input, min, max, fallback) : 0];
        }),
      );

    return {
      name: controls.species.getValue(),
      level: readNumber(controls.level, 1, 100, 100),
      ability: controls.ability.getValue(),
      item: controls.item.getValue(),
      nature: controls.nature.value,
      teraType: controls.tera.value,
      status: controls.status.value,
      evs: readStats("ev", 0, 252, 0),
      ivs: readStats("iv", 0, 31, 31),
      boosts: readStats("boost", -6, 6, 0),
      moves:
        controls.moves.length > 0
          ? controls.moves.map((move) => move.getValue())
          : controls.storedMoves,
    };
  }

  // Missing fields fall back to a fresh Pokémon: no item, 0 EVs, 31 IVs.
  function writeSide(side, set) {
    const controls = sides[side];

    controls.species.setValue(set.name ?? "");
    applyDefaultAbility(side);

    if (set.ability) {
      controls.ability.setValue(set.ability);
    }

    controls.level.value = set.level ?? 100;
    controls.item.setValue(set.item ?? "");
    controls.nature.value = set.nature ?? "Hardy";
    controls.tera.value = set.teraType ?? "";
    controls.status.value = set.status ?? "";

    CALC_STATS.forEach((stat) => {
      const row = controls.statRow(stat);
      const boost = row.querySelector('[data-role="boost"]');

      row.querySelector('[data-role="ev"]').value = set.evs?.[stat] ?? 0;
      row.querySelector('[data-role="iv"]').value = set.ivs?.[stat] ?? 31;

      if (boost) {
        boost.value = set.boosts?.[stat] ?? 0;
      }
    });

    controls.moves.forEach((move, index) => {
      move.setValue(set.moves?.[index] ?? "");
    });

    controls.storedMoves = [...(set.moves ?? [])];
  }

  /*
  |--------------------------------------------------------------------------
  | Rendering
  |--------------------------------------------------------------------------
  */

  function render() {
    const attacker = readSide("attacker");
    const defender = readSide("defender");

    renderSideDetails("attacker", attacker);
    renderSideDetails("defender", defender);

    if (!attacker.name || !defender.name) {
      renderMessage("Choose an attacker and a defender to see the damage.");
      return;
    }

    if (!attacker.moves.some(Boolean)) {
      renderMessage("Choose at least one move for the attacker.");
      return;
    }

    try {
      const results = calculateDamage(attacker, defender, readConditions(), {
        isCrit: conditions.criticalHit.checked,
      });

      renderResults(attacker, defender, results);
    } catch (error) {
      console.error("Damage calculator error:", error);

      renderMessage("Something went wrong calculating this matchup.");
    }
  }

  function readConditions() {
    return {
      gameType: conditions.gameType.value,
      weather: conditions.weather.value || undefined,
      terrain: conditions.terrain.value || undefined,
      defenderSide: {
        isReflect: conditions.reflect.checked,
        isLightScreen: conditions.lightScreen.checked,
        isAuroraVeil: conditions.auroraVeil.checked,
      },
    };
  }

  // Types, base stats, and final stats for one side.
  function renderSideDetails(side, set) {
    const controls = sides[side];
    let pokemon = null;

    try {
      pokemon = set.name ? createCalcPokemon(gen, set) : null;
    } catch {
      pokemon = null;
    }

    controls.types.replaceChildren(
      ...(pokemon?.types ?? []).map(createTypeBadge),
    );

    if (pokemon && set.teraType) {
      const tera = document.createElement("span");
      tera.className = "calc-tera";
      tera.textContent = "Tera";

      controls.types.append(tera, createTypeBadge(set.teraType));
    }

    CALC_STATS.forEach((stat) => {
      const row = controls.statRow(stat);
      const calcStat = BUILDER_STAT_TO_CALC_STAT[stat];

      row.querySelector('[data-role="base"]').textContent = pokemon
        ? pokemon.species.baseStats[calcStat]
        : "-";

      row.querySelector('[data-role="total"]').textContent = pokemon
        ? pokemon.stats[calcStat]
        : "-";
    });

    const evTotal = Object.values(set.evs).reduce((sum, ev) => sum + ev, 0);

    controls.evTotal.textContent = evTotal;
    controls.evTotal.classList.toggle("is-over-limit", evTotal > 510);
  }

  function renderMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.className = "calc-message";
    paragraph.textContent = message;

    resultsContainer.replaceChildren(paragraph);
  }

  function renderResults(attacker, defender, results) {
    const summary = document.createElement("p");
    summary.className = "calc-matchup";
    summary.textContent =
      `${getCalcDisplayName(attacker.name)} attacking ` +
      `${getCalcDisplayName(defender.name)}`;

    const list = document.createElement("ol");
    list.className = "calc-result-list";

    results.forEach((result) => {
      list.appendChild(createResultItem(result));
    });

    resultsContainer.replaceChildren(summary, list);
  }

  function createResultItem(result) {
    const item = document.createElement("li");
    item.className = "calc-result";

    const heading = document.createElement("div");
    heading.className = "calc-result-heading";

    const name = document.createElement("span");
    name.className = "calc-result-move";
    name.textContent = result.move;

    const category = document.createElement("span");
    category.className = "calc-result-category";
    category.textContent = result.category;

    heading.append(name, createTypeBadge(result.type), category);

    const percent = document.createElement("span");
    percent.className = "calc-result-percent";

    const bar = document.createElement("div");
    bar.className = "calc-damage-bar";
    bar.setAttribute("aria-hidden", "true");

    const outcome = document.createElement("p");
    outcome.className = "calc-result-outcome";

    if (result.maxDamage === 0) {
      percent.textContent = "0%";
      outcome.textContent =
        result.category === "Status"
          ? "Status move: it doesn't deal damage."
          : "No effect: the defender is immune.";

      item.classList.add("is-no-damage");
      item.append(heading, percent, bar, outcome);

      return item;
    }

    percent.textContent =
      `${formatCalcPercent(result.minPercent)} – ` +
      `${formatCalcPercent(result.maxPercent)}`;

    // Solid up to the lowest roll, lighter up to the highest.
    const minFill = document.createElement("span");
    minFill.className = "calc-damage-min";
    minFill.style.width = `${Math.min(result.minPercent, 100)}%`;

    const maxFill = document.createElement("span");
    maxFill.className = "calc-damage-max";
    maxFill.style.width = `${Math.min(result.maxPercent, 100)}%`;

    bar.append(maxFill, minFill);

    if (result.maxPercent >= 100) {
      item.classList.add("can-ohko");
    }

    outcome.textContent = capitalizeFirst(result.koChance) || "Not a KO";

    const description = document.createElement("p");
    description.className = "calc-result-description";
    description.textContent = result.description;

    item.append(heading, percent, bar, outcome, description);

    return item;
  }

  /*
  |--------------------------------------------------------------------------
  | Helpers
  |--------------------------------------------------------------------------
  */

  function readNumber(input, min, max, fallback) {
    const value = Number.parseInt(input.value, 10);

    return Number.isNaN(value) ? fallback : Math.min(Math.max(value, min), max);
  }

  // "Adamant (+Atk, −SpA)", or "Hardy (neutral)".
  function formatNatureLabel(nature) {
    if (!nature.plus || nature.plus === nature.minus) {
      return `${nature.name} (neutral)`;
    }

    return (
      `${nature.name} (+${NATURE_STAT_LABELS[nature.plus]}, ` +
      `−${NATURE_STAT_LABELS[nature.minus]})`
    );
  }

  function createTypeBadge(type) {
    const badge = document.createElement("span");
    badge.className = `pokemon-type-badge pokemon-type-${type.toLowerCase()}`;
    badge.textContent = type;

    return badge;
  }

  // Rounded down to one decimal, matching the library's description text.
  function formatCalcPercent(percent) {
    return `${(Math.floor(percent * 10) / 10).toFixed(1)}%`;
  }

  function capitalizeFirst(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }
});

// "Samurott-Hisui" -> "Hisuian Samurott", the name the rest of Brymon uses.
function getCalcDisplayName(calcName) {
  return calcName
    ? formatPokemonDisplayName(fromShowdownSpecies(normalizeShowdownName(calcName)))
    : "";
}
