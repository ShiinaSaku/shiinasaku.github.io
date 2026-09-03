import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import astroTakumi from "astro-takumi";
import { renderOgImage } from "./src/lib/ogRenderer.tsx";

// @ts-ignore
const fontFile = (path) => fs.readFileSync(fileURLToPath(import.meta.resolve(path)));

export default defineConfig({
  site: "https://shiina.xyz",
  output: "static",
  trailingSlash: "ignore",

  integrations: [
    mdx(),
    sitemap(),
    vue(),
    astroTakumi({
      options: {
        fonts: [
          {
            name: "Ciruela",
            weight: 700,
            data: fs.readFileSync("public/fonts/CiruelaDEMO-Bold.otf"),
          },
          {
            name: "Ciruela",
            weight: 800,
            data: fs.readFileSync("public/fonts/CiruelaDEMO-ExtraBold.otf"),
          },
          {
            name: "Zen Maru Gothic",
            weight: 400,
            data: fontFile(
              "@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-400-normal.woff2",
            ),
          },
          {
            name: "Zen Maru Gothic",
            weight: 700,
            data: fontFile(
              "@fontsource/zen-maru-gothic/files/zen-maru-gothic-japanese-700-normal.woff2",
            ),
          },
        ],
        fontFamilies: ["Ciruela", "Zen Maru Gothic"],
        images: [
          {
            src: "avatar",
            data: fs.readFileSync("public/avatar-512.png"),
          },
        ],
        format: "webp",
        quality: 85,
      },
      render: renderOgImage,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ["vue"],
    },
    optimizeDeps: {
      // Keep vue out of the server dep optimizer — otherwise it serves
      // @vue/runtime-core twice (raw + ?v= copies) and reka-ui's PopperRoot
      // crashes in renderSlot during dev SSR/prerender. The Cloudflare
      // adapter forwards this exclude to its server environments.
      exclude: ["vue", "@vue/runtime-core", "@vue/server-renderer"],
    },
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
    },
  },
});
