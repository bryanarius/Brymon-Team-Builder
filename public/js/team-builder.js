'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('#pokemon-search');
    const resultsContainer = document.querySelector(
        '#pokemon-search-results'
    );
    const resultCount = document.querySelector('#pokemon-result-count');
    const clearFiltersButton = document.querySelector(
        '#clear-pokemon-filters'
    );

    if (!searchInput || !resultsContainer || !resultCount) {
        console.error('Team Builder search elements were not found.');
        return;
    }

    const state = {
        pokemonList: [],
        detailCache: new Map(),
        searchTimeout: null,
        searchVersion: 0,
    };

    initializePokemonSearch();

    searchInput.addEventListener('input', () => {
        clearTimeout(state.searchTimeout);

        state.searchTimeout = setTimeout(() => {
            searchPokemon(searchInput.value);
        }, 250);
    });

    resultsContainer.addEventListener('click', async (event) => {
        const addButton = event.target.closest(
            '.pokemon-result-add-button'
        );

        if (!addButton) {
            return;
        }

        const pokemonName = addButton.dataset.pokemonName;

        if (!pokemonName) {
            return;
        }

        addButton.disabled = true;
        addButton.setAttribute('aria-busy', 'true');

        try {
            const pokemon = await getPokemonDetails(pokemonName);

            console.log('Selected Pokémon:', pokemon);

            /*
             * The next step will be:
             * addPokemonToTeam(pokemon);
             */
        } catch (error) {
            console.error(error);
        } finally {
            addButton.disabled = false;
            addButton.removeAttribute('aria-busy');
        }
    });

    clearFiltersButton?.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();

        renderEmptyState(
            'Find a Pokémon',
            'Start typing a Pokémon name to see matching results.'
        );

        updateResultCount(0);
    });

    async function initializePokemonSearch() {
        renderStatus('Loading Pokémon...');

        try {
            const response = await fetch(
                'https://pokeapi.co/api/v2/pokemon?limit=2000'
            );

            if (!response.ok) {
                throw new Error(
                    `Pokémon list request failed: ${response.status}`
                );
            }

            const data = await response.json();

            state.pokemonList = data.results.map((pokemon) => ({
                name: pokemon.name,
                url: pokemon.url,
                id: getPokemonIdFromUrl(pokemon.url),
            }));

            renderEmptyState(
                'Find a Pokémon',
                'Start typing a Pokémon name to see matching results.'
            );

            updateResultCount(0);
        } catch (error) {
            console.error(error);

            renderEmptyState(
                'Unable to load Pokémon',
                'Please refresh the page and try again.'
            );
        }
    }

    async function searchPokemon(rawQuery) {
        const query = normalizeSearchQuery(rawQuery);

        state.searchVersion += 1;
        const currentSearchVersion = state.searchVersion;

        if (query.length < 2) {
            renderEmptyState(
                'Find a Pokémon',
                'Enter at least 2 characters.'
            );

            updateResultCount(0);
            return;
        }

        if (state.pokemonList.length === 0) {
            renderStatus('Pokémon are still loading...');
            return;
        }

        const matches = state.pokemonList
            .filter((pokemon) => {
                const normalizedName = normalizePokemonName(
                    pokemon.name
                );

                return normalizedName.includes(query);
            })
            .sort((firstPokemon, secondPokemon) => {
                const firstName = normalizePokemonName(
                    firstPokemon.name
                );
                const secondName = normalizePokemonName(
                    secondPokemon.name
                );

                const firstStartsWith = firstName.startsWith(query);
                const secondStartsWith = secondName.startsWith(query);

                if (firstStartsWith && !secondStartsWith) {
                    return -1;
                }

                if (!firstStartsWith && secondStartsWith) {
                    return 1;
                }

                return firstName.localeCompare(secondName);
            });

        updateResultCount(matches.length);

        if (matches.length === 0) {
            renderEmptyState(
                'No Pokémon found',
                `No Pokémon matched “${rawQuery.trim()}”.`
            );

            return;
        }

        renderStatus('Loading results...');

        const visibleMatches = matches.slice(0, 20);

        try {
            const detailedPokemon = await Promise.all(
                visibleMatches.map((pokemon) =>
                    getPokemonDetails(pokemon.name)
                )
            );

            /*
             * Ignore results from an older search if the user has already
             * typed something else.
             */
            if (currentSearchVersion !== state.searchVersion) {
                return;
            }

            renderPokemonResults(detailedPokemon);
        } catch (error) {
            console.error(error);

            if (currentSearchVersion !== state.searchVersion) {
                return;
            }

            renderEmptyState(
                'Unable to load results',
                'Please try searching again.'
            );
        }
    }

    async function getPokemonDetails(name) {
        if (state.detailCache.has(name)) {
            return state.detailCache.get(name);
        }

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`
        );

        if (!response.ok) {
            throw new Error(
                `Pokémon request failed for ${name}: ${response.status}`
            );
        }

        const pokemon = await response.json();

        state.detailCache.set(name, pokemon);

        return pokemon;
    }

    function renderPokemonResults(pokemonResults) {
        const fragment = document.createDocumentFragment();

        pokemonResults.forEach((pokemon) => {
            fragment.appendChild(createPokemonResultCard(pokemon));
        });

        resultsContainer.replaceChildren(fragment);
    }

    function createPokemonResultCard(pokemon) {
        const result = document.createElement('article');
        result.className = 'pokemon-search-result';

        const image = document.createElement('img');
        image.className = 'pokemon-search-result-image';
        image.src =
            pokemon.sprites.front_default ??
            pokemon.sprites.other['official-artwork'].front_default ??
            '';
        image.alt = formatPokemonName(pokemon.name);
        image.loading = 'lazy';
        image.width = 56;
        image.height = 56;

        const content = document.createElement('div');
        content.className = 'pokemon-search-result-content';

        const headingRow = document.createElement('div');
        headingRow.className = 'pokemon-search-result-heading';

        const name = document.createElement('strong');
        name.className = 'pokemon-search-result-name';
        name.textContent = formatPokemonName(pokemon.name);

        const number = document.createElement('span');
        number.className = 'pokemon-search-result-number';
        number.textContent = `#${String(pokemon.id).padStart(4, '0')}`;

        headingRow.append(name, number);

        const typeList = document.createElement('div');
        typeList.className = 'pokemon-search-result-types';

        pokemon.types.forEach((typeEntry) => {
            const type = document.createElement('span');

            type.className =
                `pokemon-type-badge pokemon-type-${typeEntry.type.name}`;

            type.textContent = formatPokemonName(
                typeEntry.type.name
            );

            typeList.appendChild(type);
        });

        content.append(headingRow, typeList);

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'pokemon-result-add-button';
        addButton.dataset.pokemonName = pokemon.name;
        addButton.setAttribute(
            'aria-label',
            `Add ${formatPokemonName(pokemon.name)} to team`
        );
        addButton.textContent = '+';

        result.append(image, content, addButton);

        return result;
    }

    function renderStatus(message) {
        const status = document.createElement('p');
        status.className = 'pokemon-search-status';
        status.textContent = message;

        resultsContainer.replaceChildren(status);
    }

    function renderEmptyState(title, message) {
        const wrapper = document.createElement('div');
        wrapper.className = 'pokemon-search-empty';

        const icon = document.createElement('span');
        icon.className = 'search-empty-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '?';

        const heading = document.createElement('h3');
        heading.textContent = title;

        const paragraph = document.createElement('p');
        paragraph.textContent = message;

        wrapper.append(icon, heading, paragraph);

        resultsContainer.replaceChildren(wrapper);
    }

    function updateResultCount(count) {
        resultCount.textContent =
            `${count} ${count === 1 ? 'result' : 'results'}`;
    }
});

function getPokemonIdFromUrl(url) {
    const urlParts = url.split('/').filter(Boolean);
    const id = Number(urlParts.at(-1));

    return Number.isInteger(id) ? id : null;
}

function normalizeSearchQuery(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[.\s_]/g, '-');
}

function normalizePokemonName(value) {
    return value
        .toLowerCase()
        .replace(/[.\s_]/g, '-');
}

function formatPokemonName(name) {
    return name
        .split('-')
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}