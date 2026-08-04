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

  const createTeamCard = teamsGrid.querySelector(
    ".create-team-card",
  );

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

  updateTeams();
});