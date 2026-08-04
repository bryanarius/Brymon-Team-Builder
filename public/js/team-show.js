"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const deleteTeamForm = document.querySelector(".delete-team-form");

  if (!deleteTeamForm) {
    return;
  }

  deleteTeamForm.addEventListener("submit", (event) => {
    const confirmed = window.confirm(
      "Delete this team permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      event.preventDefault();
    }
  });
});