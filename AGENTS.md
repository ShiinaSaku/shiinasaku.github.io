# AGENTS.md

Personal Astro site (shiina.xyz). Static output, Svelte 5 islands, Tailwind v4 via `@tailwindcss/vite` plugin (no tailwind.config).

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
- Interactive components are Svelte 5 (runes: `$state`, `$derived`, `$effect`) in `src/components/*.svelte`; mount via `client:load`.
- Pages use `src/layouts/BaseLayout.astro`, which renders `SeoHead.astro` for meta; pass title/description via layout props.
- `site: https://shiina.xyz` in `astro.config.mjs` — required for sitemap/RSS absolute URLs; keep in sync if domain changes.
- Friends data lives in `src/data/friends.json`; avatars live in `src/assets/friends/` (built-time-optimized via `getImage`, passed as srcs into the island). Submissions flow through the "Friend request" issue template → `.github/workflows/friends.yml` validates, downloads the avatar, appends, commits, rebuilds, deploys. Don't hand-edit JSON for additions if a PR is open from the bot.

## Environment

- `typescript` is pinned to 6.0.3 — TS 7 is untested here; do not upgrade without verifying the build.
- `.env.local` holds `VERCEL_OIDC_TOKEN` (AI SDK usage); never commit or echo it. File is gitignored.
- `.astro/` and `dist/` are generated — never edit.
