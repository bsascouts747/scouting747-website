import { defineConfig } from "astro/config";
import sanity from "@sanity/astro";
import react from "@astrojs/react";

// --- IMPORT RESTORATION ---
// Copy the exact import lines for tailwindcss and your variables 
// (like projectId, dataset, studioUrl) from the TOP of your original backup file here!
// 
// For example, if it was: import tailwindcss from "@tailwindcss/vite"; 
// Put that exact line right here.
// --------------------------

export default defineConfig({
  // We left output: "server" and adapter: vercel() out so it builds statically
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: false, 
      apiVersion: "2026-03-26", 
      stega: {
        studioUrl,
      },
    }),
    react(), 
  ],
  vite: {
    optimizeDeps: {
      include: [
        "react/compiler-runtime",
        "lodash/isObject.js",
        "lodash/groupBy.js",
        "lodash/keyBy.js",
        "lodash/partition.js",
        "lodash/sortedIndex.js",
      ],
    },
    plugins: [tailwindcss()],
  },
});