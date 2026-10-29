# Portfolio foundation

This setup prepares the project for design work. The user approved the palette and supplied the loader/footer designs. The remaining page design, project selection, bilingual scope, and final launch content remain open.

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

The Tailwind rule excludes `.module.css`, preserving native CSS Module class exports. Hero styles use a plain CSS Module for the reference's positioned composition; Tailwind utilities remain available through the global entry point.

The approved palette is `#5B8DFB` (primary), `#F8FA55` (secondary), `#F3D061` and `#E43468` (accents). Derived blue ink `#17284F` keeps body copy readable. The 80rem container, motion defaults, and Geist fonts remain setup defaults. Approve final typography and font licensing during design. `next/font/google` downloads fonts at build time and self-hosts the output; clean CI needs network access. Use approved local font files later if required.

`siteConfig` provides basic metadata. `NEXT_PUBLIC_SITE_URL` is optional during development; set the approved domain before adding canonical links, sitemap entries, and social image URLs. Environment variables prefixed with `NEXT_PUBLIC_` are bundled at build time. Restart development or rebuild after changing them.

## Motion ownership

`MotionProvider` renders a small route-aware client runtime in an isolated Suspense boundary. Pages and their content remain Server Components.

For each active pathname, GSAP matchMedia owns one Lenis instance only while `prefers-reduced-motion: no-preference` matches. Its RAF is disabled; GSAP's ticker drives it in milliseconds. Lenis scroll events update ScrollTrigger. Route changes, unmounts, and a reduced-motion preference change remove the ticker and listeners and destroy the instance. Touch input keeps its native behavior (`syncTouch: false`).

GSAP registration and zero lag smoothing are shared application defaults in `src/lib/motion/gsap.ts`. Do not change them per section. The runtime refreshes geometry after initial render, font readiness, and captured image loads. If a component changes layout through an accordion, async text, or other interaction, refresh from that component after its layout settles.

For a section, put `useGSAP` in a Client Component with a container ref and a scope. Create its animations inside `gsap.matchMedia().add(motionConfig.queries.full, ...)`, and revert the matchMedia context on cleanup. Use `contextSafe` for delayed event callbacks. Never hide essential content in baseline CSS waiting for JavaScript.

Native hash links work without JavaScript and under reduced motion. Lenis handles hashes when active. Use `data-lenis-prevent` on scrollable dialogs or menus that should retain native scrolling. Do not animate the element being pinned; animate its children.

## Content and assets

`SiteFooter` keeps the supplied Tangle rings immediately above Sticker Slap Footer with a shared secondary-yellow field and zero gap. `TangleFooter` retains the five concentric text rings and their seeded layout. GSAP replaces the supplied `motion/react` dependency: two quarter-circle SVG masks draw each arch upward from the footer seam, staggered from the outer arch inward, with ScrollTrigger scrub. Text rotations alternate direction and pause outside the viewport. Reduced motion removes drawing/rotation and exposes the complete rings. Resize-dependent contexts and triggers are reverted before rebuilding geometry. Copy is maintained in `src/content/footer.ts`.

The supplied `AmourSunrisePreloader` and `StickerSlapFooter` components retain their native React/SVG/CSS animations and interactions. They introduce no dependencies. Only colors, identity text, source-backed profile links/content, and strict-TypeScript safety guards were adapted. Their illustration loops are separate from the shared Lenis scrolling clock.

The loader still accepts `loop` for demos. `SiteIntro` uses one non-looping run on the initial layout mount, as a fixed overlay rather than putting the website into the component's nested scroll container. Content remains in the server HTML and is available without JavaScript. While active, the overlay locks scrolling, makes underlying content inert, and retains keyboard focus. Completion removes the loader and refreshes ScrollTrigger. The original count is a simulated intro, not a measurement of asset/network progress; real progress can be passed through the existing `progress` prop when an asset-loading contract exists.

Footer copy uses sourced expertise, location/scope, professional email, and profile links. Personal phone numbers, rates, invented vacancies, office addresses, and fabricated implementation credits are not displayed. Profile URLs come from the supplied brief and have not been independently verified as live.

The original master brief remains untouched. `src/content/profile.ts` contains only the name, Product Designer title, and sourced short bio. `src/types/portfolio.ts` follows the proposed model and represents missing links/assets with null or empty collections rather than fake URLs.

`public/` contains source assets in this Next.js application. Put approved images and local fonts there when available. Default Next.js/Vercel sample graphics were removed. No CMS, analytics, email service, database, or published personal contact details are introduced by this foundation.

The homepage now contains the Onlines-reference hero. Its scene is a small client boundary; the page and header remain server-rendered. The 404 and error fallback are intentionally minimal. The skip link targets `main-content` on each page. Changing `siteConfig.direction` helps layout testing but does not implement translations or bilingual routing. The reference hero and supplied footer are English/LTR designs.

Hero configuration lives in `src/content/hero.ts`. The hero uses self-hosted Inter via `next/font/google`, a faint grid, six vector cards, five sourced tool marks, two editorial comment bubbles, and seven workflow cursor labels. The SVG concept studies are original illustrations, not screenshots of client projects. GSAP owns ambient float, cursor paths, pointer parallax, scroll parallax, and illustrative code typing. Ambient motion pauses outside the viewport and while the document is hidden; the Motion switch and reduced-motion preference disable it.

`SiteIntroReadyContext` mounts the supplied `WavingPortfolioLanding` after the Amour loader completes. Its original seven-second illustration sequence signals completion through `onIntroComplete`; `HeroPortfolioEntrance` then zooms only the poster drawing into the hero center over 1.5 seconds. The same canvas stays exactly as large as the complete hero, with both dice fixed at its top corners. The header, grid, cards, and cursors begin appearing 0.2 seconds into the zoom. Card/cursor positions and artwork geometry stay intact; header spacing accommodates the corner controls. The original `osama.` selection remains a semantic/no-JavaScript fallback; it is visually clipped and its drag control is removed from the focus order while the supplied centerpiece is active.

The supplied poster retains its glyphs, character, native CSS timing, scramble, dice, wave, signature replay, and pointer interactions. Colors and identity text follow the portfolio; TypeScript guards and animation lifecycle callbacks support integration. Responsive docking transforms the SVG drawing alone; the canvas, corner controls, and bottom signature never shrink. Phase updates do not recreate or revert the GSAP context during the zoom. Signature replay resets the surrounding entrance; the Explore the design control returns keyboard focus to the main content. Reduced motion bypasses the illustration sequence and zoom. The wrapper uses scoped `useGSAP`/matchMedia and owns no scrolling driver. A single `main` and primary heading remain in the active page.

Hero copy is centralized in `src/content/hero.ts`. The drawn headline is now MORE / HUMAN, with Less friction / More clarity as supporting labels. Comments, workflow cursors, concept artwork captions, contact CTA, and animated process notes follow the brief's Understand / Simplify / Systems / Experience approach. This is editorial positioning; no project metrics, customer testimonials, or extra credentials are claimed.

## Before launch

- Approve the remaining page design, languages, domain, featured projects, and media.
- Implement case studies with evidence from the brief and approved assets.
- Add final metadata, real social imagery, canonical URLs, sitemap, and robots policy for the approved deployment.
- Check real content at 390, 768, 1024, and 1440 pixels, keyboard access, RTL if enabled, and reduced motion.
- Run `pnpm verify`, then verify navigation, scroll, and error recovery in the browser.
- A production deployment and hosted CI run are separate from local validation.
