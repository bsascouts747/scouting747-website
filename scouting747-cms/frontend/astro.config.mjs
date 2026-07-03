import { defineConfig } from "astro/config";
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import tailwindcss from "@theme-tools/vite-plugin-tailwindcss"; // Keep your template's exact tailwind import name here

// Grab your variables from above if they are defined, or keep them as is
export default defineConfig({
  // We removed output: "server" and adapter: vercel() to default back to Static Mode!
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: false, // Perfect for static builds
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