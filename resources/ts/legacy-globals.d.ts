/*
 * Functions from Brymon's classic <script> files (public/js), which put
 * them on `window`. Declaring them lets TypeScript code call them until
 * those files move to TypeScript too.
 */

// public/js/pokemon-forms.js
declare function toShowdownSpecies(name: string): string | null;
declare function fromShowdownSpecies(normalizedName: string): string;
declare function normalizeShowdownName(value: string): string;
declare function formatPokemonDisplayName(name: string): string;
