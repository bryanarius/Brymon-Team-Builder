"use strict";

/*
|--------------------------------------------------------------------------
| Pokédex
|--------------------------------------------------------------------------
|
| Standalone browsable index of every Pokémon. All data comes from
| PokéAPI on the client; the PHP side only renders the page shell.
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

  populateTypeFilter();
  populateGenerationFilter();

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

  function formatName(value) {
    return String(value)
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
});
