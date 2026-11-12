// vitest/config is Vite's defineConfig plus the `test` options below.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/*
|--------------------------------------------------------------------------
| Vite
|--------------------------------------------------------------------------
|
| Compiles the React + TypeScript islands in resources/ts into
| public/build. PHP still renders every page; app/Core/Vite.php reads
| public/build/manifest.json to print the right <script> tags.
|
| Each island is its own entry, so a page loads only the code it uses.
|
*/

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // Built files are served from https://brymonteambuilder.com/build/...
  // The dev server serves source files from its root instead.
  base: command === "build" ? "/build/" : "/",

  // Vite's own public/ copying is off: PHP already serves public/.
  publicDir: false,

  build: {
    outDir: "public/build",
    emptyOutDir: true,
    manifest: "manifest.json",
    // @smogon/calc's Pokémon/move data is ~500 KB on its own (~190 KB
    // gzipped with React). Expected, and only /calc loads it.
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      input: ["resources/ts/calc/main.tsx", "resources/ts/analysis/main.tsx"],
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    // Pages come from PHP on :8000, so asset URLs must name this server.
    origin: "http://localhost:5173",
  },

  // `npm run test:ts`. Vitest compiles TypeScript the same way the build does.
  test: {
    include: ["tests/TS/**/*.test.ts"],
    setupFiles: ["tests/TS/setup.ts"],
  },
}));
