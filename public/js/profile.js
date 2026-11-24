"use strict";

/*
 * Follow / Following / Follow back buttons: the one on a profile, and one
 * per row on the followers and following lists.
 */

function followButtonLabel(following, followsViewer) {
  if (following) {
    return "Following";
  }

  return followsViewer ? "Follow back" : "Follow";
}

document.addEventListener("DOMContentLoaded", () => {
  // Only on a profile page: the follower count next to its button.
  const followerCount = document.querySelector("#profile-follower-count");
  const followerLabel = document.querySelector("#profile-follower-label");

  document.querySelectorAll("[data-follow-button]").forEach((button) => {
    const label = button.querySelector("[data-follow-label]");
    const username = button.dataset.username;
    const followsViewer = button.dataset.followsViewer === "true";

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

        const following = Boolean(data.following);

        button.setAttribute("aria-pressed", following ? "true" : "false");
        button.classList.toggle("is-following", following);
        label.textContent = followButtonLabel(following, followsViewer);

        if (button.id === "profile-follow-button" && followerCount) {
          followerCount.textContent = String(data.follower_count);

          if (followerLabel) {
            followerLabel.textContent =
              data.follower_count === 1 ? "follower" : "followers";
          }
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
});
