const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/E2E",

  use: {
    baseURL: "http://localhost:8000",
    browserName: "chromium",
    headless: true,
  },
});
