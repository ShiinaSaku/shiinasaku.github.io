// @ts-check
import * as fs from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import astroTakumi from "astro-takumi";
import { renderOgImage } from "./src/lib/ogRenderer.tsx";

import cloudflare from "@astrojs/cloudflare";
//ts-ignore
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
            name: "Space Grotesk",
            weight: 500,
            data: fontFile("@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2"),
          },
          {
            name: "Space Grotesk",
            weight: 700,
            data: fontFile("@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2"),
          },
          {
            name: "Noto Sans JP",
            weight: 400,
            data: fontFile("@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff2"),
          },
          {
            name: "Noto Sans JP",
            weight: 700,
            data: fontFile("@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff2"),
          },
        ],
        fontFamilies: ["Space Grotesk", "Noto Sans JP"],
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

  // Static site: compile optimized images at build time instead of the
  // default "cloudflare-binding" runtime `/_image` transforms (which require
  // a paid Cloudflare Images IMAGES binding and 404 without it).
  adapter: cloudflare({ imageService: "compile" }),
});
