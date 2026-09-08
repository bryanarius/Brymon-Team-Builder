"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const picker = document.querySelector(".avatar-picker");

  if (!picker || typeof window.createCombobox !== "function") {
    return;
  }

  const comboboxRoot = picker.querySelector(".combobox");
  const searchInput = comboboxRoot.querySelector("input");
  const hiddenInput = picker.querySelector("#avatar-pokemon-id");
  const preview = picker.querySelector("#avatar-preview");
  const removeButton = picker.querySelector("#avatar-remove");

  searchInput.disabled = true;
  searchInput.placeholder = "Loading Pokémon…";

  const SPRITE_BASE =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";

  const nameToId = new Map();

  const combobox = window.createCombobox(comboboxRoot, {
    formatLabel: (value) =>
      value
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    onChange: (slug) => {
      if (!slug) {
        clearAvatar();
        return;
      }

      const id = nameToId.get(slug);

      if (!id) {
        return;
      }

      hiddenInput.value = String(id);
      preview.src = `${SPRITE_BASE}${id}.png`;
      preview.hidden = false;
    },
  });

  function clearAvatar() {
    hiddenInput.value = "";
    preview.removeAttribute("src");
    preview.hidden = true;
    combobox.setValue("");
  }

  removeButton.addEventListener("click", clearAvatar);

  fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to load Pokémon list.");
      }

      return response.json();
    })
    .then((data) => {
      const names = data.results.map((entry) => {
        const segments = entry.url.split("/").filter(Boolean);
        const id = Number(segments[segments.length - 1]);

        nameToId.set(entry.name, id);

        return entry.name;
      });

      combobox.setOptions(names);

      const currentId = picker.dataset.currentId;

      if (currentId) {
        for (const [slug, id] of nameToId) {
          if (String(id) === currentId) {
            combobox.setValue(slug);
            break;
          }
        }
      }

      searchInput.disabled = false;
      searchInput.placeholder = "Search a Pokémon";
    })
    .catch((error) => {
      console.error("Avatar picker load error:", error);
      searchInput.placeholder = "Could not load Pokémon list";
    });
});
