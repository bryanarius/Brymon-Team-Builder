const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

/*
 * The frontend files are plain browser scripts (no modules or build step),
 * so load them into a sandbox the way <script> tags would and pull out the
 * functions under test.
 */
function loadBrowserScripts(...files) {
  const context = vm.createContext({});

  files.forEach((file) => {
    const code = fs.readFileSync(
      path.join(__dirname, "../../public/js", file),
      "utf8",
    );

    vm.runInContext(code, context);
  });

  return vm.runInContext(
    "({ POKEMON_TYPES, getTypeMultiplier, buildDefensiveChart, formatMultiplier })",
    context,
  );
}

const { POKEMON_TYPES, getTypeMultiplier, buildDefensiveChart, formatMultiplier } =
  loadBrowserScripts("pokemon-forms.js", "type-chart.js");

test("single-type matchups", () => {
  assert.equal(getTypeMultiplier("fire", ["grass"]), 2);
  assert.equal(getTypeMultiplier("water", ["grass"]), 0.5);
  assert.equal(getTypeMultiplier("electric", ["ground"]), 0);
  assert.equal(getTypeMultiplier("normal", ["normal"]), 1);
});

test("dual types multiply", () => {
  // Grass/Steel (Ferrothorn) takes 4x from Fire.
  assert.equal(getTypeMultiplier("fire", ["grass", "steel"]), 4);
  // Water/Ground (Swampert) is only weak to Grass, and 4x.
  assert.equal(getTypeMultiplier("grass", ["water", "ground"]), 4);
  // Steel/Fairy (Mega Mawile) takes 1/4 from Bug.
  assert.equal(getTypeMultiplier("bug", ["steel", "fairy"]), 0.25);
  // An immunity wins over a weakness: Ground vs Electric/Flying.
  assert.equal(getTypeMultiplier("ground", ["electric", "flying"]), 0);
});

test("abilities that change matchups", () => {
  // Rotom-Wash (Electric/Water) with Levitate is immune to Ground.
  assert.equal(getTypeMultiplier("ground", ["electric", "water"]), 2);
  assert.equal(getTypeMultiplier("ground", ["electric", "water"], "levitate"), 0);

  // Thick Fat halves Fire and Ice.
  assert.equal(getTypeMultiplier("fire", ["grass", "poison"], "thick-fat"), 1);

  // Dry Skin: Water immunity, but Fire hurts more.
  assert.equal(getTypeMultiplier("water", ["poison", "fighting"], "dry-skin"), 0);
  assert.equal(getTypeMultiplier("fire", ["poison", "fighting"], "dry-skin"), 1.25);

  // Abilities without a matchup effect change nothing.
  assert.equal(getTypeMultiplier("fire", ["grass"], "overgrow"), 2);
});

test("wonder guard only lets super-effective hits through", () => {
  // Shedinja (Bug/Ghost).
  assert.equal(getTypeMultiplier("fire", ["bug", "ghost"], "wonder-guard"), 2);
  assert.equal(getTypeMultiplier("water", ["bug", "ghost"], "wonder-guard"), 0);
  assert.equal(getTypeMultiplier("normal", ["bug", "ghost"], "wonder-guard"), 0);
});

test("defensive chart has a row per type with per-member totals", () => {
  const chart = buildDefensiveChart([
    { types: ["fire", "flying"], ability: "blaze" },
    { types: ["fire", "flying"], ability: "blaze" },
    { types: ["electric", "water"], ability: "levitate" },
  ]);

  assert.equal(chart.length, POKEMON_TYPES.length);

  const rock = chart.find((row) => row.type === "rock");
  // Duplicate species each get their own column.
  assert.deepEqual([...rock.multipliers], [4, 4, 1]);
  assert.equal(rock.weak, 2);

  const ground = chart.find((row) => row.type === "ground");
  assert.deepEqual([...ground.multipliers], [0, 0, 0]);
  assert.equal(ground.immune, 3);

  const fire = chart.find((row) => row.type === "fire");
  assert.equal(fire.resist, 3);
  assert.equal(fire.weak, 0);
});

test("multiplier labels", () => {
  assert.equal(formatMultiplier(1), "");
  assert.equal(formatMultiplier(0.25), "¼×");
  assert.equal(formatMultiplier(4), "4×");
  assert.equal(formatMultiplier(1.25), "1.25×");
});
