# Repository Guidelines

## Project Structure & Module Organization
- `src/pages` hosts Astro route files; use it for new pages and localized entrypoints.
- Shared UI lives in `src/components`, while cross-page layouts are under `src/layouts`.
- Markdown content is loaded from `src/data/articles` via the content collection defined in `src/content.config.ts`.
- Tailwind-first styles and tokens sit in `src/styles`; lightweight utilities and helpers belong in `src/utils`.
- Static assets go in `public`, and language resources live in `src/i18n`.

## Build, Test, and Development Commands
- `npm install` to sync dependencies after cloning or updating branches.
- `npm run dev` launches the Astro dev server with hot reload.
- `npm run build` generates the production bundle to `dist/`; use it before shipping content or code changes.
- `npm run preview` serves the built site locally to verify production output.
- `npm run astro -- check` runs Astro's diagnostics (type safety, config validation) when you need an extra sanity pass.

## Coding Style & Naming Conventions
- Follow Astro and TypeScript defaults with two-space indentation and ES module syntax.
- Co-locate component-specific styles and assets beside their Astro/TSX files; keep names in `PascalCase` for components (`Hero.astro`) and `camelCase` for utilities.
- Prefer Tailwind utility classes for styling; compose with `clsx` or `tailwind-merge` when logic-driven classes are required.
- Use the path aliases from `tsconfig.json` (`@components/*`, `@utils/*`, etc.) instead of relative paths.

## Testing Guidelines
- Automated tests are not yet in place; at minimum run `npm run build` and `npm run preview` to catch runtime regressions.
- When adding tests, align filenames with the feature under test (e.g., `Hero.test.ts`) and colocate them near the source or under a future `tests/` folder.
- Ensure content additions include frontmatter that satisfies the schema in `src/content.config.ts`.

## Commit & Pull Request Guidelines
- Commit history follows a Conventional Commits style (`feature:`, `fix:`, `feat:`). Keep messages concise: `<type>: <summary>`.
- Squash stray WIP commits before opening a PR. Describe intent, implementation notes, and testing performed.
- Link relevant issues or discussions, and attach before/after screenshots or preview URLs for visual updates.
- Confirm the PR passes `npm run build` and, when relevant, `npm run preview` checks before requesting review.
