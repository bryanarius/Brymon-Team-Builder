"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#profile-follow-button");

  if (!button) {
    return;
  }

  const followerCount = document.querySelector("#profile-follower-count");
  const username = button.dataset.username;

  button.addEventListener("click", async () => {
    const currentlyFollowing = button.getAttribute("aria-pressed") === "true";
    const action = currentlyFollowing ? "unfollow" : "follow";

    button.disabled = true;

    try {
      const response = await fetch(
        `/u/${encodeURIComponent(username)}/${action}`,
        {
          method: "POST",
          headers: {
            "X-CSRF-Token": window.BRYMON_CSRF_TOKEN,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update follow.");
      }

      button.setAttribute("aria-pressed", data.following ? "true" : "false");
      button.classList.toggle("is-following", Boolean(data.following));
      button.textContent = data.following ? "Following" : "Follow";

      if (followerCount) {
        followerCount.textContent = String(data.follower_count);
      }
    } catch (error) {
      if (typeof window.showToast === "function") {
        window.showToast(error.message, { type: "error" });
      }
    } finally {
      button.disabled = false;
    }
  });
});
