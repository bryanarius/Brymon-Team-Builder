"use strict";

function showToast(
  message,
  {
    type = "info",
    title = "",
    duration = 4000,
  } = {},
) {
  const container = document.querySelector("#toast-container");

  if (!container) {
    console.error("Toast container was not found.");
    return;
  }

  const validTypes = new Set([
    "success",
    "error",
    "info",
  ]);

  const toastType = validTypes.has(type)
    ? type
    : "info";

  const defaultTitles = {
    success: "Success",
    error: "Something went wrong",
    info: "Notice",
  };

  const icons = {
    success: "✓",
    error: "!",
    info: "i",
  };

  const toast = document.createElement("div");

  toast.className = `toast toast-${toastType}`;
  toast.setAttribute("role", "status");

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = icons[toastType];

  const content = document.createElement("div");
  content.className = "toast-content";

  const heading = document.createElement("strong");
  heading.className = "toast-title";
  heading.textContent =
    title || defaultTitles[toastType];

  const paragraph = document.createElement("p");
  paragraph.className = "toast-message";
  paragraph.textContent = String(message);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "toast-close";
  closeButton.setAttribute(
    "aria-label",
    "Dismiss notification",
  );
  closeButton.textContent = "×";

  content.append(heading, paragraph);
  toast.append(icon, content, closeButton);
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  let timeoutId = window.setTimeout(
    removeToast,
    duration,
  );

  closeButton.addEventListener("click", removeToast);

  toast.addEventListener("mouseenter", () => {
    window.clearTimeout(timeoutId);
  });

  toast.addEventListener("mouseleave", () => {
    timeoutId = window.setTimeout(
      removeToast,
      1500,
    );
  });

  function removeToast() {
    window.clearTimeout(timeoutId);

    toast.classList.remove("is-visible");

    window.setTimeout(() => {
      toast.remove();
    }, 180);
  }
}

window.showToast = showToast;