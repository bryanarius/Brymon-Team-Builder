import * as teamAnalysis from "./team-analysis";

/*
 * TEMPORARY: public/js/team-analysis.js is still a classic script that
 * fetches from PokéAPI and renders the panel. It calls these calculations
 * through `window.BrymonTeamAnalysis` until the panel itself becomes React
 * (step 2), at which point this file is deleted.
 *
 * One namespace instead of separate globals: classic scripts share a
 * single global scope, and names like formatTypeName already exist there.
 *
 * Module scripts always run before DOMContentLoaded, which is when the
 * classic script starts, so this exists in time.
 */
declare global {
  interface Window {
    BrymonTeamAnalysis: typeof teamAnalysis;
  }
}

window.BrymonTeamAnalysis = teamAnalysis;
