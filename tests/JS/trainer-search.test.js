const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// trainer-search.js is a plain browser script; load it like a <script> tag.
const context = vm.createContext({
  document: { addEventListener() {} },
});

vm.runInContext(
  fs.readFileSync(
    path.join(__dirname, "../../public/js/trainer-search.js"),
    "utf8",
  ),
  context,
);

const trainerSearchUrls = vm.runInContext("trainerSearchUrls", context);

test("a search goes in the query string, trimmed", () => {
  assert.deepEqual(
    { ...trainerSearchUrls("  cynthia ") },
    { page: "/trainers?q=cynthia", results: "/trainers/results?q=cynthia" },
  );
});

test("a blank search has no query string", () => {
  assert.deepEqual(
    { ...trainerSearchUrls("   ") },
    { page: "/trainers", results: "/trainers/results" },
  );
});

test("characters with meaning in a URL are encoded", () => {
  assert.equal(
    trainerSearchUrls("a&b=c #1 %").page,
    "/trainers?q=a%26b%3Dc%20%231%20%25",
  );
});
