/// <reference types="node" />
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runInThisContext } from "node:vm";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
// Adds DOM matchers such as toBeInTheDocument() to expect().
import "@testing-library/jest-dom/vitest";

// Unmount whatever a component test rendered before the next test.
afterEach(cleanup);

/*
 * Some TypeScript code still calls functions from classic scripts that
 * pages load as globals: the calculator adapter uses toShowdownSpecies()
 * from pokemon-forms.js, and team analysis uses getTypeMultiplier() from
 * type-chart.js. Run those files here the same way, so their functions
 * become globals for the tests too.
 */
["pokemon-forms.js", "type-chart.js"].forEach((file) => {
  // Relative to the project root: under jsdom, import.meta.url is an
  // http:// URL rather than a file path.
  runInThisContext(readFileSync(resolve("public/js", file), "utf8"));
});
