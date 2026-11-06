"use strict";

/*
|--------------------------------------------------------------------------
| Combobox
|--------------------------------------------------------------------------
|
| A small searchable single-select control. Wraps a text <input> and a
| sibling [role="listbox"] <ul> inside a `.combobox` wrapper. The visible
| text is a formatted label, while the committed value is the underlying
| option string (an API slug), exposed through getValue().
|
*/

function createCombobox(root, { onChange, formatLabel, maxResults = 60 } = {}) {
  if (!root) {
    return null;
  }

  const input = root.querySelector("input");
  const listbox = root.querySelector('[role="listbox"]');

  if (!input || !listbox) {
    console.error("Combobox is missing an input or listbox element.");
    return null;
  }

  const toLabel =
    typeof formatLabel === "function" ? formatLabel : (value) => value;

  const notifyChange = typeof onChange === "function" ? onChange : () => {};

  const listboxId =
    listbox.id || `combobox-list-${Math.random().toString(36).slice(2, 9)}`;
  listbox.id = listboxId;

  input.setAttribute("role", "combobox");
  input.setAttribute("autocomplete", "off");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-controls", listboxId);

  let options = [];
  let matches = [];
  // How many matches maxResults left out of the list.
  let hiddenMatchCount = 0;
  let activeIndex = -1;
  let committedValue = "";
  let isOpen = false;
  let blurTimeout = null;

  function labelFor(value) {
    if (!value) {
      return "";
    }

    const match = options.find((option) => option.value === value);

    // Fall back to a formatted label so imported values still display even
    // when they are not part of the current option list.
    return match ? match.label : toLabel(value);
  }

  function setOptions(values) {
    options = [...values].map((value) => ({
      value,
      label: toLabel(value),
      search: `${toLabel(value)} ${value}`.toLowerCase(),
    }));

    options.sort((first, second) => first.label.localeCompare(second.label));

    input.value = labelFor(committedValue);
  }

  function setValue(value) {
    committedValue = value || "";
    input.value = committedValue ? labelFor(committedValue) : "";

    close();
  }

  function setDisabled(disabled) {
    input.disabled = disabled;

    if (disabled) {
      close();
    }
  }

  function getValue() {
    return committedValue;
  }

  function computeMatches(query) {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    const allMatches = options.filter((option) =>
      tokens.every((token) => option.search.includes(token)),
    );

    hiddenMatchCount = Math.max(allMatches.length - maxResults, 0);

    return allMatches.slice(0, maxResults);
  }

  // A box showing its chosen value lists every option, not just that one.
  function currentQuery() {
    return committedValue && input.value === labelFor(committedValue)
      ? ""
      : input.value;
  }

  function renderList() {
    listbox.replaceChildren();

    if (matches.length === 0) {
      const empty = document.createElement("li");
      empty.className = "combobox-empty";
      empty.textContent = "No matches";
      listbox.appendChild(empty);

      return;
    }

    const fragment = document.createDocumentFragment();

    matches.forEach((option, index) => {
      const item = document.createElement("li");
      item.className = "combobox-option";
      item.id = `${listboxId}-option-${index}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(index === activeIndex));
      item.textContent = option.label;

      if (index === activeIndex) {
        item.classList.add("is-active");
      }

      item.addEventListener("mousedown", (event) => {
        // mousedown beats the input blur, so the selection survives.
        event.preventDefault();
        commit(index);
      });

      fragment.appendChild(item);
    });

    // Say when the list is cut short, so it doesn't look like everything.
    if (hiddenMatchCount > 0) {
      const more = document.createElement("li");
      more.className = "combobox-more";
      more.textContent =
        `Showing ${matches.length} of ${matches.length + hiddenMatchCount}. ` +
        "Type to narrow the list.";

      fragment.appendChild(more);
    }

    listbox.appendChild(fragment);
  }

  function open() {
    if (isOpen) {
      return;
    }

    isOpen = true;
    listbox.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function close() {
    isOpen = false;
    activeIndex = -1;
    listbox.hidden = true;
    listbox.replaceChildren();
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function syncActiveDescendant() {
    if (activeIndex >= 0 && matches[activeIndex]) {
      input.setAttribute(
        "aria-activedescendant",
        `${listboxId}-option-${activeIndex}`,
      );
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function moveActive(delta) {
    if (matches.length === 0) {
      return;
    }

    activeIndex =
      (activeIndex + delta + matches.length) % matches.length;

    renderList();
    syncActiveDescendant();

    const activeNode = listbox.children[activeIndex];

    if (activeNode && typeof activeNode.scrollIntoView === "function") {
      activeNode.scrollIntoView({ block: "nearest" });
    }
  }

  function commit(index) {
    const option = matches[index];

    if (!option) {
      return;
    }

    const changed = option.value !== committedValue;
    committedValue = option.value;
    input.value = option.label;

    close();

    if (changed) {
      notifyChange(committedValue);
    }
  }

  function revertInputText() {
    input.value = committedValue ? labelFor(committedValue) : "";
  }

  input.addEventListener("input", () => {
    open();

    if (input.value.trim() === "" && committedValue !== "") {
      committedValue = "";
      notifyChange("");
    }

    matches = computeMatches(input.value);
    activeIndex = matches.length > 0 ? 0 : -1;
    renderList();
    syncActiveDescendant();
  });

  input.addEventListener("focus", () => {
    matches = computeMatches(currentQuery());
    activeIndex = -1;
    open();
    renderList();
  });

  input.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        if (!isOpen) {
          matches = computeMatches(currentQuery());
          open();
        }

        moveActive(1);
        break;

      case "ArrowUp":
        event.preventDefault();

        if (isOpen) {
          moveActive(-1);
        }

        break;

      case "Enter":
        if (isOpen && activeIndex >= 0) {
          event.preventDefault();
          commit(activeIndex);
        }

        break;

      case "Escape":
        if (isOpen) {
          event.preventDefault();
          revertInputText();
          close();
        }

        break;

      case "Tab":
        revertInputText();
        close();
        break;

      default:
        break;
    }
  });

  input.addEventListener("blur", () => {
    blurTimeout = window.setTimeout(() => {
      revertInputText();
      close();
    }, 120);
  });

  input.addEventListener("mousedown", () => {
    window.clearTimeout(blurTimeout);
  });

  return {
    setOptions,
    setValue,
    setDisabled,
    getValue,
  };
}

window.createCombobox = createCombobox;
