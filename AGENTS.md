<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Portfolio scope

- This repository is a Next.js portfolio for Osama Abdelnaser, a Product Designer.
- The approved palette is primary `#5B8DFB`, secondary `#F8FA55`, warm accent `#F3D061`, and rose accent `#E43468`. `#17284F` is derived ink for readable text.
- Preserve the supplied Amour Sunrise Preloader and Sticker Slap Footer designs, geometry, timing, and interactions. The user requested color and text adaptation only. Necessary TypeScript guards and integration wrappers may be added without changing their intended behavior.
- Apply the same rule to future UI code supplied by the user: adapt brand colors and text, and preserve its design and behavior unless a later request changes that scope.
- Read `README.md` and `docs/FOUNDATION.md` before changing the foundation.
- Use `docs/OSAMA_ABDELNASER_PORTFOLIO_MASTER_BRIEF.md` as a content reference. Preserve its distinction between source facts, proposals, analysis, and unconfirmed details. Do not modify the supplied brief while implementing the site.
- Do not invent testimonials, project metrics, roles, links, availability, or assets. Do not publish personal contact details or prices without a decision.
- English is the temporary setup language. Full bilingual routing, final fonts, domain, featured projects, and case-study scope remain open decisions. The supplied loader/footer and palette are approved references; the remaining page design is open.

## Implementation

- Use pnpm only. Keep `pnpm-lock.yaml` and the pinned package manager. On PowerShell, use `pnpm.cmd` when execution policy blocks `pnpm`.
- Use the Node version in `.nvmrc` / `.node-version`.
- Keep pages/layouts as Server Components. Put client directives at the smallest interactive boundary.
- Use TypeScript with strict checks; avoid `any` and non-null assertions to bypass missing content.
- Keep content in `src/content`, site configuration in `src/config`, reusable UI in `src/components/ui`, and motion in `src/lib/motion` plus its root runtime.
- Prefer direct imports over barrel exports. Use `cn` from `@/lib/utils` for conditional Tailwind classes.
- Use Tailwind utilities first, logical spacing for RTL readiness, and the CSS-first tokens in `src/styles/tokens.css`. The configured Tailwind Turbopack loader is intentional; do not add a parallel PostCSS pipeline without a reason.
- Use semantic HTML, visible focus, and a single `main#main-content` per page.

## Motion

- Import `gsap`, `ScrollTrigger`, and `useGSAP` from `@/lib/motion/gsap`.
- The root motion runtime owns the sole Lenis instance and scrolling RAF integration. Do not initialize another Lenis, a second scrolling driver, or CSS smooth scrolling. Preserve the supplied loader/footer's own illustration and interaction loops as requested.
- Use scoped `useGSAP` and `gsap.matchMedia` for section animations. Honor `motionConfig.queries.full`; keep content readable under reduced motion and without JavaScript.
- Clean up listeners, observers, tickers, timelines, and ScrollTriggers. Never call `ScrollTrigger.killAll()` from a component.
- Native touch scrolling remains enabled. Nested scrolling surfaces can opt out with `data-lenis-prevent`.
- Refresh ScrollTrigger after asynchronous layout changes; the runtime already handles initial fonts, loaded images, and pathname changes.

## Validation

- Run `pnpm verify` after changes. It checks ESLint, route-aware TypeScript, Prettier, and the production build.
- Inspect the running app after runtime changes; compilation alone does not prove behavior.
- Check desktop/mobile, keyboard use, reduced motion, and navigation cleanup when relevant.
- Report local checks separately from GitHub CI or deployment. Do not deploy, push, or claim live production proof without doing it.
