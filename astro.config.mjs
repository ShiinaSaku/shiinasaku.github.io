// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://shiina.xyz",
  output: "static",
  trailingSlash: "always",
  integrations: [mdx(), sitemap(), vue()],
  vite: {
    plugins: [tailwindcss()],
  },
});
