/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    // Three.js (lições 3D) é um pedaço grande, mas só carrega quando uma lição 3D é aberta.
    chunkSizeWarningLimit: 1100,
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
