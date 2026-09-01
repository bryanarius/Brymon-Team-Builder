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

  function getValue() {
    return committedValue;
  }

  function computeMatches(query) {
    const trimmed = query.trim().toLowerCase();

    if (trimmed === "") {
      return options.slice(0, maxResults);
    }

    const tokens = trimmed.split(/\s+/);

    return options
      .filter((option) => tokens.every((token) => option.search.includes(token)))
      .slice(0, maxResults);
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
    matches = computeMatches(input.value);
    activeIndex = -1;
    open();
    renderList();
  });

  input.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        if (!isOpen) {
          matches = computeMatches(input.value);
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
    getValue,
  };
}

window.createCombobox = createCombobox;
