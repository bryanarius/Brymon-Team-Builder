"use strict";

/*
 * Trainer search updates as you type. The page still works without this:
 * it's a plain GET form, and this only swaps in /trainers/results.
 *
 * Signed in, it also keeps your recent searches: opening a trainer from the
 * results records them, and the Recent list's ✕ and Clear all remove them.
 */

const TRAINER_SEARCH_DELAY_MS = 250;

/**
 * The address bar URL and the results-only URL for a search.
 */
function trainerSearchUrls(query) {
  const trimmed = query.trim();
  const params = trimmed === "" ? "" : `?q=${encodeURIComponent(trimmed)}`;

  return {
    page: `/trainers${params}`,
    results: `/trainers/results${params}`,
  };
}

/**
 * A recent-searches change. Resolves when the server has saved it.
 */
async function postRecentSearch(path, options = {}) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "X-CSRF-Token": window.BRYMON_CSRF_TOKEN },
    ...options,
  });

  if (!response.ok) {
    throw new Error("Couldn't update your recent searches. Try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-trainer-search]");
  const results = document.querySelector("[data-trainer-results]");
  const status = document.querySelector("[data-trainer-search-status]");

  if (!form || !results) {
    return;
  }

  const input = form.querySelector('input[name="q"]');
  const signedIn = typeof window.BRYMON_CSRF_TOKEN === "string";
  // The search the server rendered: defaultValue is the value="" attribute.
  let lastQuery = input.defaultValue.trim();
  let timer = null;
  let request = null;

  function announce(message) {
    if (status) {
      status.textContent = message;
    }
  }

  function showError(message) {
    if (typeof window.showToast === "function") {
      window.showToast(message, { type: "error" });
    }
  }

  // force: load even if the search hasn't changed (e.g. after a removal).
  async function showResults({ force = false } = {}) {
    const query = input.value.trim();

    if (query === lastQuery && !force) {
      return;
    }

    lastQuery = query;

    // A slow answer for "ci" must never replace the one for "cynthia".
    request?.abort();
    request = new AbortController();
    const thisRequest = request;
    const urls = trainerSearchUrls(query);

    results.setAttribute("aria-busy", "true");

    try {
      const response = await fetch(urls.results, {
        signal: thisRequest.signal,
      });

      if (!response.ok) {
        throw new Error("Search isn't working right now. Try again.");
      }

      // Our own server-rendered, escaped HTML.
      results.innerHTML = await response.text();

      // Refreshing or sharing the page keeps the search, without adding a
      // history entry for every letter.
      window.history.replaceState(null, "", urls.page);
      document.title = query
        ? `Trainers matching "${query}" · Brymon`
        : "Find Trainers · Brymon";

      announce(
        results.querySelector("[data-trainer-search-summary]")?.dataset
          .trainerSearchSummary ?? "",
      );
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      // Let the next keystroke (or Enter) try the same search again.
      lastQuery = null;
      showError(error.message);
    } finally {
      if (request === thisRequest) {
        results.removeAttribute("aria-busy");
      }
    }
  }

  input.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(showResults, TRAINER_SEARCH_DELAY_MS);
  });

  // Typed before this script loaded (a slow connection): search now, since
  // those keystrokes came before the listener above.
  if (input.value.trim() !== lastQuery) {
    showResults();
  }

  // Enter searches straight away instead of reloading the page.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.clearTimeout(timer);
    showResults();
  });

  // Back from a profile: show the Recent list with that trainer on top.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && signedIn && input.value.trim() === "") {
      showResults({ force: true });
    }
  });

  if (!signedIn) {
    return;
  }

  // Opening a trainer from the results (or from Recent) puts them at the
  // top of Recent. keepalive lets the request finish after the page has
  // moved on to their profile.
  results.addEventListener("click", (event) => {
    const link = event.target.closest(".follow-row-link");
    const username = link?.closest("[data-username]")?.dataset.username;

    if (username) {
      postRecentSearch(
        `/u/${encodeURIComponent(username)}/recent-search`,
        { keepalive: true },
      ).catch(() => {
        // Not worth interrupting anyone over: it just won't be in Recent.
      });
    }
  });

  // ✕ on one recent search.
  results.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-recent-search-remove]");
    const row = button?.closest("[data-username]");

    if (!row) {
      return;
    }

    button.disabled = true;

    try {
      await postRecentSearch(
        `/u/${encodeURIComponent(row.dataset.username)}/recent-search/remove`,
      );

      // Keep keyboard focus nearby, since its button is about to go.
      const neighbour =
        row.nextElementSibling ?? row.previousElementSibling ?? null;

      row.remove();

      if (neighbour) {
        neighbour.querySelector("[data-recent-search-remove]")?.focus();
      } else {
        // That was the last one: show "No recent searches."
        input.focus();
        await showResults({ force: true });
      }

      announce("Removed from recent searches.");
    } catch (error) {
      button.disabled = false;
      showError(error.message);
    }
  });

  // Clear all.
  results.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-recent-searches-clear]");

    if (!button) {
      return;
    }

    button.disabled = true;

    try {
      await postRecentSearch("/recent-searches/clear");
      input.focus();
      await showResults({ force: true });
      announce("Recent searches cleared.");
    } catch (error) {
      button.disabled = false;
      showError(error.message);
    }
  });
});
