import { toID } from "@smogon/calc";
import {
  BUILDER_STAT_TO_CALC_STAT,
  calculateDamage,
  createCalcPokemon,
  getCalcGeneration,
  toCalcSet,
} from "./damage-calc";

/*
 * TEMPORARY: public/js/damage-calc-page.js is still a classic script that
 * calls these as globals. Putting them on `window` lets it run on the
 * TypeScript adapter until the page itself becomes React (step 3), at
 * which point this file is deleted.
 *
 * Module scripts always run before DOMContentLoaded, which is when the
 * classic page script starts, so these exist in time.
 */
Object.assign(window, {
  calc: { toID },
  BUILDER_STAT_TO_CALC_STAT,
  calculateDamage,
  createCalcPokemon,
  getCalcGeneration,
  toCalcSet,
});
