"use strict";

/*
|--------------------------------------------------------------------------
| Form submit lock
|--------------------------------------------------------------------------
|
| Opt-in progress + double-submit guard for classic (full page reload)
| form POSTs. Add `data-submit-lock` to a <form> to enable it, and an
| optional `data-submit-label` for the in-progress button text.
|
| On submit: the submit button is disabled and its label swapped, so a
| slow connection gives feedback and a second click cannot fire another
| request. If client-side `required` validation blocks the submit, the
| form never leaves the page and the button is restored.
|
*/

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form[data-submit-lock]");

  forms.forEach((form) => {
    const button = form.querySelector(
      'button[type="submit"], button:not([type])',
    );

    if (!button) {
      return;
    }

    let locked = false;

    const restore = () => {
      locked = false;
      button.disabled = false;

      if (button.dataset.originalLabel !== undefined) {
        button.textContent = button.dataset.originalLabel;
      }
    };

    form.addEventListener("submit", (event) => {
      if (locked) {
        event.preventDefault();
        return;
      }

      // Let the browser run its own `required` / type validation first.
      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        return;
      }

      locked = true;

      const busyLabel = form.dataset.submitLabel || "Working…";

      button.dataset.originalLabel = button.textContent;

      // Defer so the button is still enabled when the submit is dispatched.
      window.setTimeout(() => {
        button.disabled = true;
        button.textContent = busyLabel;
      }, 0);
    });

    // Restore on bfcache restore (user hits Back to a locked form).
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) {
        restore();
      }
    });
  });
});
