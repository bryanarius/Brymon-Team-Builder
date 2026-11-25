"use strict";

/*
 * Trainer search updates as you type. The page still works without this:
 * it's a plain GET form, and this only swaps in /trainers/results.
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

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-trainer-search]");
  const results = document.querySelector("[data-trainer-results]");
  const status = document.querySelector("[data-trainer-search-status]");

  if (!form || !results) {
    return;
  }

  const input = form.querySelector('input[name="q"]');
  let lastQuery = input.value.trim();
  let timer = null;
  let request = null;

  async function showResults() {
    const query = input.value.trim();

    if (query === lastQuery) {
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

      if (status) {
        status.textContent =
          results.querySelector("[data-trainer-search-summary]")?.dataset
            .trainerSearchSummary ?? "";
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      // Let the next keystroke (or Enter) try the same search again.
      lastQuery = null;

      if (typeof window.showToast === "function") {
        window.showToast(error.message, { type: "error" });
      }
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

  // Enter searches straight away instead of reloading the page.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.clearTimeout(timer);
    showResults();
  });
});
