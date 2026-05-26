# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`Sn0w` is a single-page personal homepage (L1nSn0w's). It is a static React + Vite + Tailwind v4 site with one route — there is no router, no backend, no tests. `src/App.tsx` is the page shell; it composes presentational components from `src/components/` driven by data in `src/content.ts`.

## Commands

Package manager is **bun** (see `bun.lock`).

```bash
bun install
bun run dev          # vite dev server
bun run build        # tsc -b && vite build  → dist/
bun run lint         # eslint .
bun run lint:fix     # eslint . --fix
bun run format       # prettier --write .
bun run format:check # prettier --check .
bun run preview      # serve the built dist/
```

## Architecture

The codebase is deliberately tiny and split along one axis: **content vs. layout.**

- **`src/content.ts`** — all page copy and data: `intro`, `experience`, `projects`, `artifacts`, `links`. Each export is strongly typed (`Entry`, `Project`, `Link`). Edit text, dates, projects, and links here without touching layout. Comments in this file document field semantics (e.g. a `Project` with no `href` is closed-source/unlinked; `badge` is short sticker text; `color` picks a marker accent).

- **`src/App.tsx`** — just the page shell: outer layout plus the section ordering (`<Intro />`, `<Experience />`, `<Projects />`, …). No visual primitives live here anymore.

- **`src/components/`** — the visual layer, grouped by role. This is where the "desk / annotated notebook" aesthetic lives:
  - **`desk.tsx`** — reusable presentational primitives (`Sticker`, `DateTag`, `Stamp`, `HandUnderline`, `MarkerHighlight`, `Pushpin`, `DraggableSticker`, `LinkDoodle`, `SectionLabel`, etc.). Internal-only helpers (`MarkerFrame`, `Annotation`, `Spark`, the `MARKER` map) are not exported.
  - **`sections.tsx`** — the four page sections (`Experience`, `Projects`, `Artifacts`, `Elsewhere`) plus list-row helpers (`RowShell`, `Label`, `PlainMeta`); maps over `content.ts` data using `desk` primitives.
  - **`intro.tsx`** — the `Intro` block (header monogram, draggable avatar, intro paragraphs, pinned status note) and the phrase-level `ACCENTS` / `decorateIntro` logic.

- **`src/index.css`** — the design system, defined through Tailwind v4's `@theme` and `@layer` blocks rather than a JS config. Defines the named font roles (`--font-sans` body, `--font-mono` labels/stickies, `--font-hand` marker scribbles, `--font-script` corner monogram), the warm-paper color palette (`--color-paper`, `--color-ink`, marker accents, etc.), and component classes like `.dotted`, `.sticky-note`, `.stamp`.

When adding content, prefer extending the typed arrays in `content.ts`; reach for `src/components/` (and `index.css`) only for genuinely new visual elements — put reusable primitives in `desk.tsx` and section/page composition in `sections.tsx`.

## Conventions

- Tailwind v4 is configured via the Vite plugin (`@tailwindcss/vite`) and `@import "tailwindcss"` in `index.css` — there is **no `tailwind.config.js`**. Design tokens are CSS variables in the `@theme` block; reference them as Tailwind utilities (e.g. `text-ink`, `bg-paper`) or via `var(...)`.
- The aesthetic relies on intentional irregularity (slight tilts, uneven border-radii, hand-drawn marker fonts). Match the surrounding style when adding elements rather than normalizing them.
- Fonts are bundled (not loaded from a CDN). Body/mono/marker faces come from `@fontsource*` imports in `index.css` — use the Latin-subset entries (e.g. `ibm-plex-mono/latin-400.css`) and only the weights actually used (mono: 400 + 500). The decorative `Pinyon Script` monogram is a self-hosted A–Z subset at `src/assets/fonts/pinyon-script-AZ-400.woff2` (~12 kB) declared via a local `@font-face`; regenerate it with `pyftsubset … --unicodes="U+0041-005A"` if the face ever changes.
- Formatting is handled by **Prettier** (`prettier.config.js`: double quotes, semicolons, trailing commas); `eslint-config-prettier` is last in `eslint.config.js` so ESLint doesn't fight it. Run `bun run format` before committing — don't hand-format.
