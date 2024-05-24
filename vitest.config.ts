/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: "./src/setupTests.ts",
    environment: "jsdom",
    passWithNoTests: true,
  },
});
