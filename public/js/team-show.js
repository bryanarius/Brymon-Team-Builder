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

document.addEventListener("DOMContentLoaded", () => {
  const details = document.querySelector("#team-share-details");
  const toggleButton = document.querySelector("#team-share-toggle");

  if (!details || !toggleButton) {
    return;
  }

  const urlInput = document.querySelector("#team-share-url");
  const copyButton = document.querySelector("#team-share-copy");

  const teamId = details.dataset.teamId;

  toggleButton.addEventListener("click", async () => {
    const makePublic = details.dataset.isPublic !== "true";

    toggleButton.disabled = true;

    try {
      const response = await fetch(`/teams/${teamId}/visibility`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": window.BRYMON_CSRF_TOKEN,
        },
        body: JSON.stringify({ is_public: makePublic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update sharing.");
      }

      applyState(Boolean(data.is_public));

      if (typeof window.showToast === "function") {
        window.showToast(data.message, { type: "success" });
      }
    } catch (error) {
      if (typeof window.showToast === "function") {
        window.showToast(error.message, { type: "error" });
      }
    } finally {
      toggleButton.disabled = false;
    }
  });

  copyButton?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(urlInput.value);

      copyButton.textContent = "Copied";

      window.setTimeout(() => {
        copyButton.textContent = "Copy Link";
      }, 1500);
    } catch {
      urlInput.select();
    }
  });

  function applyState(isPublic) {
    details.dataset.isPublic = isPublic ? "true" : "false";
    details.hidden = !isPublic;
    toggleButton.textContent = isPublic ? "Make Private" : "Make Public";
  }
});