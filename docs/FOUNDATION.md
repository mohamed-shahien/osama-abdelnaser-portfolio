# Portfolio foundation

This setup prepares the project for design work. It does not approve a visual direction, project selection, bilingual scope, or launch content.

## Runtime and quality

- Node is pinned in `.nvmrc` and `.node-version`; pnpm is pinned in `package.json`.
- `pnpm-workspace.yaml` enforces supported engines and exact versions for future direct dependency additions. pnpm 12 reads registry/auth settings from `.npmrc`; behavioral settings belong in the YAML file.
- TypeScript uses strict checking, checked indexed access, route generation, and typed Next.js links.
- ESLint uses Next.js core web vitals, TypeScript, consistent type imports, and Prettier compatibility.
- Prettier sorts Tailwind classes using `src/app/globals.css`, including `cn` and `clsx` calls.
- EditorConfig, Git attributes, and VS Code settings agree on UTF-8, two spaces, and LF.
- `pnpm verify` runs lint, typecheck, formatting, and build. GitHub CI runs that same command after a frozen install.
- CI is configured, but only a successful GitHub run proves the hosted runner passed.

## Next.js and Tailwind

Keep the generated Next.js 16.4 Cache Components, Partial Prefetching, and Tailwind Turbopack integration. Read the installed Next.js docs before applying older setup patterns. In this version, error boundaries receive `retry`, not the older `reset` prop.

Tailwind v4 uses CSS-first configuration in `src/styles/tokens.css`. No JavaScript Tailwind config or duplicate PostCSS pipeline is needed for the existing Turbopack loader. Use `pnpm build` with Turbopack; a Webpack migration requires adapting the CSS pipeline.

The current colors, 80rem container, motion defaults, and Geist fonts are neutral setup defaults. Approve final branding and font licensing during design. `next/font/google` downloads fonts at build time and self-hosts the output; clean CI needs network access. Use approved local font files later if required.

`siteConfig` provides basic metadata. `NEXT_PUBLIC_SITE_URL` is optional during development; set the approved domain before adding canonical links, sitemap entries, and social image URLs. Environment variables prefixed with `NEXT_PUBLIC_` are bundled at build time. Restart development or rebuild after changing them.

## Motion ownership

`MotionProvider` renders a small route-aware client runtime in an isolated Suspense boundary. Pages and their content remain Server Components.

For each active pathname, GSAP matchMedia owns one Lenis instance only while `prefers-reduced-motion: no-preference` matches. Its RAF is disabled; GSAP's ticker drives it in milliseconds. Lenis scroll events update ScrollTrigger. Route changes, unmounts, and a reduced-motion preference change remove the ticker and listeners and destroy the instance. Touch input keeps its native behavior (`syncTouch: false`).

GSAP registration and zero lag smoothing are shared application defaults in `src/lib/motion/gsap.ts`. Do not change them per section. The runtime refreshes geometry after initial render, font readiness, and captured image loads. If a component changes layout through an accordion, async text, or other interaction, refresh from that component after its layout settles.

For a section, put `useGSAP` in a Client Component with a container ref and a scope. Create its animations inside `gsap.matchMedia().add(motionConfig.queries.full, ...)`, and revert the matchMedia context on cleanup. Use `contextSafe` for delayed event callbacks. Never hide essential content in baseline CSS waiting for JavaScript.

Native hash links work without JavaScript and under reduced motion. Lenis handles hashes when active. Use `data-lenis-prevent` on scrollable dialogs or menus that should retain native scrolling. Do not animate the element being pinned; animate its children.

## Content and assets

The original master brief remains untouched. `src/content/profile.ts` contains only the name, Product Designer title, and sourced short bio. `src/types/portfolio.ts` follows the proposed model and represents missing links/assets with null or empty collections rather than fake URLs.

`public/` contains source assets in this Next.js application. Put approved images and local fonts there when available. Default Next.js/Vercel sample graphics were removed. No CMS, analytics, email service, database, or published personal contact details are introduced by this foundation.

The starter page, 404, and error fallback are intentionally minimal. The skip link targets `main-content` on each page. Changing `siteConfig.direction` helps layout testing but does not implement translations or bilingual routing.

## Before launch

- Approve the visual direction, languages, domain, featured projects, media, and contact content.
- Implement case studies with evidence from the brief and approved assets.
- Add final metadata, real social imagery, canonical URLs, sitemap, and robots policy for the approved deployment.
- Check real content at 390, 768, 1024, and 1440 pixels, keyboard access, RTL if enabled, and reduced motion.
- Run `pnpm verify`, then verify navigation, scroll, and error recovery in the browser.
- A production deployment and hosted CI run are separate from local validation.
