import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works at any GitHub Pages path (e.g. /geoguessr/).
export default defineConfig({
  base: "./",
  plugins: [react()],
  // Mapillary viewer is large but only loaded when that provider is used.
  build: { chunkSizeWarningLimit: 1200 },
});
