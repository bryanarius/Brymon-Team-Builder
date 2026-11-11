/// <reference types="node" />
import { readFileSync } from "node:fs";
import { runInThisContext } from "node:vm";

/*
 * Some TypeScript code still calls functions from classic scripts that
 * pages load as globals: the calculator adapter uses toShowdownSpecies()
 * from pokemon-forms.js, and team analysis uses getTypeMultiplier() from
 * type-chart.js. Run those files here the same way, so their functions
 * become globals for the tests too.
 */
["pokemon-forms.js", "type-chart.js"].forEach((file) => {
  runInThisContext(
    readFileSync(new URL(`../../public/js/${file}`, import.meta.url), "utf8"),
  );
});
