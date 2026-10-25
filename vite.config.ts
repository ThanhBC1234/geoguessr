import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Source lives in src/ so the repository root can hold the built site
// (GitHub Pages "Deploy from a branch" serves the root as-is).
export default defineConfig({
  root: "src",
  publicDir: "../public",
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    // Mapillary viewer is large but only loaded when that provider is used.
    chunkSizeWarningLimit: 1200,
  },
});
