# Osama Abdelnaser — Portfolio

Next.js portfolio for a Product Designer. The Onlines-reference hero integrates the supplied Waving Portfolio centerpiece, animated loader, and footer with the approved brand palette. Project sections and case-study content are the next stage.

## Requirements

- Node **24.18.0** (`.nvmrc` and `.node-version`)
- pnpm **12.15.0** (`packageManager` in `package.json`)

Use pnpm throughout this repository. In Git Bash, use the commands below directly. If PowerShell blocks scripts, use `pnpm.cmd` instead of `pnpm`.

## Start

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). No environment variables are required for local development. Copy `.env.example` to `.env.local` only when an actual setting is needed; the example is safe to commit and local environment files are ignored.

## Commands

| Command             | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Next.js development server with Turbopack         |
| `pnpm lint`         | ESLint with zero warnings allowed                 |
| `pnpm lint:fix`     | Fix supported lint issues                         |
| `pnpm typecheck`    | Generate Next.js route types, then run TypeScript |
| `pnpm format`       | Format code and sort Tailwind classes             |
| `pnpm format:check` | Check formatting without changing files           |
| `pnpm check`        | Lint, typecheck, and formatting checks            |
| `pnpm build`        | Production build                                  |
| `pnpm verify`       | All quality checks plus production build          |
| `pnpm start`        | Serve the completed production build              |

## Structure

```text
src/
  app/                       Routes, root layout, styles, error and 404 fallbacks
  components/
    providers/               Application motion runtime
    ui/                      Reusable presentation components
  config/site.ts             Site metadata and temporary language/direction
  content/profile.ts         Sourced profile content
  lib/
    motion/                  GSAP registration and shared motion settings
    utils.ts                 cn() for conditional Tailwind classes
  styles/tokens.css          CSS-first Tailwind tokens
  types/portfolio.ts         Typed project content model
public/                      Approved static assets go here
```

Add section components under `src/components/sections/` when design begins. Keep pages and content on the server; isolate browser interactions in small Client Components.

## Tooling

- `.editorconfig`, `.gitattributes`: consistent whitespace and line endings.
- `.nvmrc`, `.node-version`, `pnpm-workspace.yaml`: runtime and dependency conventions.
- `.npmrc`: reserved for registry/auth configuration; never commit tokens.
- `prettier.config.mjs`, `.prettierignore`: formatting and Tailwind class sorting.
- `eslint.config.mjs`, `tsconfig.json`: code quality and strict typing.
- `.vscode/`: workspace formatting, local TypeScript, and recommended extensions.
- `.github/workflows/ci.yml`: frozen install and `pnpm verify` on PRs and main pushes.
- `.github/pull_request_template.md`: review and validation checklist.

## Motion

GSAP, ScrollTrigger, and useGSAP come from `@/lib/motion/gsap`. The root runtime owns one Lenis instance driven by the GSAP ticker. It cleans up on route/preference changes, preserves native touch behavior, and disables smooth scrolling for reduced motion. No CSS smooth scrolling or second RAF loop is needed.

Read [the foundation notes](docs/FOUNDATION.md) before adding motion, changing the build pipeline, or preparing a launch.

## Content and decisions

The [master brief](docs/OSAMA_ABDELNASER_PORTFOLIO_MASTER_BRIEF.md) is the content reference. It distinguishes facts, proposals, analysis, and items requiring confirmation. Do not publish unconfirmed metrics, roles, prices, testimonials, or contact details.

The approved colors are blue `#5B8DFB`, yellow `#F8FA55`, warm accent `#F3D061`, and rose `#E43468`. English and the starter page layout are temporary defaults. Final typography, bilingual scope, domain, selected work, social imagery, and case-study content still need decisions.

This foundation has no analytics, database, CMS, or contact-form backend. Add integrations when the intended experience requires them.
