"use strict";

/*
 * Hands a prefilled bug report from one page to /feedback, e.g. a failed
 * Showdown import with the pasted team. A pasted team is too long for a
 * URL, so the draft waits in localStorage: shared with the new tab the
 * report opens in, and removed as soon as /feedback reads it.
 */

const FEEDBACK_DRAFT_KEY = "brymon:feedback-draft";

// Long enough to open the link, short enough that an old draft never
// turns up in a later report.
const FEEDBACK_DRAFT_MAX_AGE_MS = 10 * 60 * 1000;

// Matches Validator::FEEDBACK_ATTACHMENT_MAX.
const FEEDBACK_ATTACHMENT_MAX = 10000;

function saveFeedbackDraft(
  { summary = "", details = "", attachment = "" },
  storage = window.localStorage,
  now = Date.now(),
) {
  try {
    storage.setItem(
      FEEDBACK_DRAFT_KEY,
      JSON.stringify({
        summary: String(summary),
        details: String(details),
        attachment: String(attachment).slice(0, FEEDBACK_ATTACHMENT_MAX),
        savedAt: now,
      }),
    );

    return true;
  } catch {
    // Storage full or blocked: the report opens empty instead.
    return false;
  }
}

/**
 * Reads the draft once and removes it. Returns null when there is none,
 * it is too old, or it isn't valid.
 */
function takeFeedbackDraft(
  storage = window.localStorage,
  now = Date.now(),
) {
  let raw = null;

  try {
    raw = storage.getItem(FEEDBACK_DRAFT_KEY);
    storage.removeItem(FEEDBACK_DRAFT_KEY);
  } catch {
    return null;
  }

  if (raw === null) {
    return null;
  }

  try {
    const draft = JSON.parse(raw);
    const age = now - Number(draft.savedAt);

    if (!(age >= 0 && age <= FEEDBACK_DRAFT_MAX_AGE_MS)) {
      return null;
    }

    return {
      summary: String(draft.summary ?? ""),
      details: String(draft.details ?? ""),
      attachment: String(draft.attachment ?? ""),
    };
  } catch {
    return null;
  }
}

// On /feedback?...&draft=1, fill the empty fields from the draft.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-feedback-form]");

  if (!form || new URLSearchParams(window.location.search).get("draft") !== "1") {
    return;
  }

  const draft = takeFeedbackDraft();

  if (!draft) {
    return;
  }

  ["summary", "details", "attachment"].forEach((name) => {
    const field = form.elements.namedItem(name);

    // Never overwrite what the player typed (e.g. after a validation error).
    if (field && field.value === "" && draft[name] !== "") {
      field.value = draft[name];
    }
  });
});
