# AGENTS.md

Personal Astro site (shiina.xyz). Static output, Vue islands, Tailwind v4 via `@tailwindcss/vite` plugin (no tailwind.config), shadcn-vue UI in `src/components/ui`.

## Package manager

Use `pnpm` for all commands. Lockfile of record is `pnpm-lock.yaml` (pinned via `devEngines`). CI (`.github/workflows/astro.yml`) uses bun — that is CI-only; do not "fix" it.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm preview`
- `pnpm lint` (oxlint), `pnpm lint:fix`
- `pnpm format` (oxfmt), `pnpm fmt:check`
- No test suite exists. `pnpm build` is the only verification gate (and the entire CI check) — run it before finishing any change.
- Formatter/linter are oxlint + oxfmt, not ESLint/Prettier. Do not add them.

## Conventions

- Path alias `@/*` → `src/*` (tsconfig paths).
- Blog posts: `src/content/blog/**/*.{md,mdx}` gated by strict schema in `src/content.config.ts` — title ≥10 chars, description 40–170 chars, `date`, optional `tags`, `draft: true` hides post. Build fails on schema violations.
- Add shadcn-vue components per `components.json` (style new-york, lucide icons, CSS vars); utils helper at `src/lib/utils`.
- Pages use `src/layouts/BaseLayout.astro`, which renders `SeoHead.astro` for meta; pass title/description via layout props.
- `site: https://shiina.xyz` in `astro.config.mjs` — required for sitemap/RSS absolute URLs; keep in sync if domain changes.

## Environment

- `typescript` is pinned to 6.0.3 — TS 7 breaks `@vue/compiler-sfc` imported-type resolution; build fails with "No fs option provided to `compileScript`". Do not upgrade until vue plugin supports it.
- `.env.local` holds `VERCEL_OIDC_TOKEN` (AI SDK usage); never commit or echo it. File is gitignored.
- `.astro/` and `dist/` are generated — never edit.
