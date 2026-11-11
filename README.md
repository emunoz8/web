# CompilingJava

CompilingJava is the frontend-first software engineering portfolio and interactive project showcase behind `compilingjava.com`. The application is built with React, TypeScript, Tailwind CSS, and Vite, and runs as a self-contained static frontend deployable to GitHub Pages without requiring a runtime backend service.

## What This Repo Contains

- `frontend/`
  React 18, TypeScript, Tailwind CSS, React Router, Vite, Vitest, local project/article content, and interactive feature demos.
- `docs/`
  Architecture analysis (`CODEBASE_ANALYSIS.md`), frontend-only migration plan (`MIGRATION_PLAN.md`), issue tracker (`ISSUES.md`), and changelog (`CHANGELOG.md`).
- `AGENTS.md`
  Project conventions and multi-agent collaboration instructions.

## Stack

- **UI & Routing:** React 18, TypeScript, React Router, Tailwind CSS, React Markdown
- **Build & Validation:** Vite, Vitest, Testing Library, TypeScript (`tsc --noEmit`)
- **Hosting Target:** GitHub Pages (`frontend/public/CNAME` and `frontend/public/404.html` SPA fallback)

## Repo Layout

```text
web/
  AGENTS.md
  README.md
  docs/
    CODEBASE_ANALYSIS.md
    MIGRATION_PLAN.md
    ISSUES.md
    CHANGELOG.md
  frontend/
    index.html
    public/
      CNAME
      404.html
      assets/
      meta/
    src/
      components/
      context/
      features/
        addToTheAux/
        jitCafe/
        portfolio/
        standardUI/
        terminalUI/
        ticTacToe/
      lib/
      pages/
      routes/
      styles/
      tests/
```

## Local Development & Validation

Run all application commands from `frontend/`:

```sh
cd frontend
npm run dev
```

Validation and production build commands:

```sh
cd frontend
npm run typecheck
npm test -- --run
npm run build
npm run preview
```

Or run the full validation pipeline in one step:

```sh
cd frontend
npm run validate
```

## Key Features

- **Project Case Studies (`/projects`, `/projects/:id`):** Detailed architecture writeups, screenshots, and embedded interactive surfaces for CompilingJava, AddToTheAUX, Tic Tac Toe Revisited, and JIT Cafe.
- **Interactive Demos:**
  - **Tic Tac Toe (`/tic-tac-toe`):** Browser-local Minimax symmetry lookup explorer and playable AI opponent.
  - **JIT Cafe (`/jit-cafe/*`):** Multi-page restaurant menu and guest-experience showcase backed by a local menu snapshot and product flow screenshots.
  - **AddToTheAUX (`/add-to-the-aux`):** Interactive orbital playlist stage with local catalog search, playback simulation, and in-session queue additions.
- **Technical Writing (`/blog`, `/about`):** Local Markdown articles with category filtering and modal reader view.
- **Dual UI Shell:** Standard portfolio shell and interactive terminal shell (`TerminalUI`) backed by local content selectors.
