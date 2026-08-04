"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector("#team-search");
  const sortSelect = document.querySelector("#team-sort");
  const teamsGrid = document.querySelector("#teams-grid");
  const viewButtons = [
    ...document.querySelectorAll(".view-button"),
  ];

  if (!teamsGrid) {
    return;
  }

  const teamCards = [
    ...teamsGrid.querySelectorAll(".saved-team-card"),
  ];

  const pokemonTypeCache = new Map();

  const createTeamCard = teamsGrid.querySelector(
    ".create-team-card",
  );

  async function getPokemonTypes(pokemonId) {
  if (pokemonTypeCache.has(pokemonId)) {
    return pokemonTypeCache.get(pokemonId);
  }

  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load Pokémon #${pokemonId}`,
    );
  }

  const pokemon = await response.json();

  const types = pokemon.types.map(
    (entry) => entry.type.name,
  );

  pokemonTypeCache.set(pokemonId, types);

  return types;
}

    async function loadTeamTypes(card) {
    const typeContainer = card.querySelector(
        ".saved-team-types",
    );

    const pokemonSlots = [
        ...card.querySelectorAll(
        ".pokemon-preview-slot[data-pokemon-id]",
        ),
    ];

    if (!typeContainer || pokemonSlots.length === 0) {
        return;
    }

    try {
        const pokemonTypes = await Promise.all(
        pokemonSlots.map((slot) => {
            return getPokemonTypes(
            slot.dataset.pokemonId,
            );
        }),
        );

        const uniqueTypes = [
        ...new Set(pokemonTypes.flat()),
        ];

        typeContainer.replaceChildren();

        uniqueTypes.forEach((typeName) => {
        const badge = document.createElement("span");

        badge.className =
            `pokemon-type-badge pokemon-type-${typeName}`;

        badge.textContent = formatTypeName(typeName);

        typeContainer.appendChild(badge);
        });
    } catch (error) {
        console.error(error);

        typeContainer.textContent = "—";
    }
    }

    function formatTypeName(typeName) {
    return typeName.charAt(0).toUpperCase()
        + typeName.slice(1);
    }

//     console.log({
//     searchInput,
//     sortSelect,
//     teamsGrid,
//     teamCards,
//     createTeamCard,
//   });

  function updateTeams() {
    const query = searchInput?.value
      .trim()
      .toLowerCase() ?? "";

    const sortValue = sortSelect?.value ?? "updated-desc";

    teamCards.forEach((card) => {
    const teamName = card.dataset.teamName ?? "";
    const matchesSearch = teamName.includes(query);

    // console.log({
    //     query,
    //     teamName,
    //     matchesSearch,
    // });

    card.hidden = !matchesSearch;
    });
    const sortedCards = [...teamCards].sort(
      (firstCard, secondCard) => {
        const firstName =
          firstCard.dataset.teamName ?? "";

        const secondName =
          secondCard.dataset.teamName ?? "";

        const firstUpdated = Date.parse(
          firstCard.dataset.updatedAt ?? "",
        );

        const secondUpdated = Date.parse(
          secondCard.dataset.updatedAt ?? "",
        );

        switch (sortValue) {
          case "name-asc":
            return firstName.localeCompare(secondName);

          case "name-desc":
            return secondName.localeCompare(firstName);

          case "updated-asc":
            return firstUpdated - secondUpdated;

          case "updated-desc":
          default:
            return secondUpdated - firstUpdated;
        }
      },
    );

    sortedCards.forEach((card) => {
      if (createTeamCard) {
        teamsGrid.insertBefore(card, createTeamCard);
      } else {
        teamsGrid.appendChild(card);
      }
    });
  }

    searchInput?.addEventListener("input", () => {
    // console.log("Search value:", searchInput.value);

    updateTeams();
});
  sortSelect?.addEventListener("change", updateTeams);

  viewButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      const isListView = index === 1;

      teamsGrid.classList.toggle(
        "teams-grid--list",
        isListView,
      );

      viewButtons.forEach(
        (currentButton, currentIndex) => {
          const isActive = currentIndex === index;

          currentButton.classList.toggle(
            "active",
            isActive,
          );

          currentButton.setAttribute(
            "aria-pressed",
            String(isActive),
          );
        },
      );
    });
  });

    teamCards.forEach((card) => {
    loadTeamTypes(card);
    });

  updateTeams();
});