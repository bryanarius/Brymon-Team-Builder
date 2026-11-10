/// <reference types="node" />
import { readFileSync } from "node:fs";
import { runInThisContext } from "node:vm";

/*
 * The adapter calls toShowdownSpecies() from public/js/pokemon-forms.js,
 * a classic script that the page loads as a global. Run it here the same
 * way, so its functions become globals for the tests too.
 */
runInThisContext(
  readFileSync(
    new URL("../../public/js/pokemon-forms.js", import.meta.url),
    "utf8",
  ),
);
