# Local foundation validation

Validated on 2026-10-28. This records local checks, not hosted CI or a production deployment.

| Check                            | Result                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed, lockfile unchanged                                                   |
| `pnpm verify`                    | ESLint, TypeScript, Prettier and production build passed                     |
| Next.js compilation diagnostics  | No issues                                                                    |
| Next.js runtime diagnostics      | No config or browser session errors                                          |
| Browser page errors              | None                                                                         |
| 390, 768, 1024 and 1440px widths | No horizontal page overflow                                                  |
| Loader completion                | Overlay unmounted, scroll lock and inert state removed, main content focused |
| Keyboard during loading          | Focus retained on the loader                                                 |
| Reduced motion                   | Lenis disabled; footer had no running animations; loader completed           |
| Sticker keyboard controls        | ArrowRight moved the sticker; Escape restored its position                   |
| Footer credits                   | Opened and closed with Escape                                                |
| 404 and return link              | Checked in the browser                                                       |
| Environment file handling        | `.env.local` ignored; `.env.example` remains committable                     |

The homepage hero is implemented; project sections and final case-study content remain open. Profile URLs are copied from the supplied reference; their destinations were not live-audited. GitHub CI is configured but has not been run remotely.

The supplied components retain their artwork and animation design. Integration also required strict array-access guards, synchronizing loader refs after commit, removing an unused variable, and two narrow lint annotations for event-time pointer velocity measurements. No new animation dependency was installed.

## Tangle pre-footer

- Five original concentric text rings, adapted to the approved palette and sourced profile copy.
- At the start of the scroll range all ten reveal paths were fully masked; at its midpoint the outer-to-inner offset ratios were 0.24, 0.37, 0.50, 0.63, and 0.76; at completion all were zero. Scrolling back restored fully masked paths.
- Rotation advanced while visible and paused while the component was below the viewport.
- At 390, 768, 1024, and 1440px, the measured distance between the rings and footer was exactly 0px, with no horizontal overflow.
- Reduced motion reverted mask dash offsets to zero and removed rotation.
- Next.js compilation/runtime diagnostics and browser page errors were clear.

## Onlines-reference hero

Reference: [onlines.com.ar](https://onlines.com.ar/), inspected at desktop 1440×1000 and mobile 390×844 on 2026-10-28. Layout, dimensions, positioning, selection/drag, staggered entrance, float, cursor motion, typing, and responsive rearrangement were inspected directly.

- Adapted the center word to `osama.` and retained the approved portfolio palette.
- Used original SVG concept illustrations instead of the reference site's photographic/client imagery. These remain visibly labeled as concept/interface studies.
- Verified a native pointer drag moved the title 120px horizontally and 60px vertically. ArrowRight moved it 8px; Escape reset its position.
- The Motion switch paused both floating cards and cursors and restored the full illustrative code text.
- Reduced motion disabled the switch and reverted ambient transforms.
- At 320, 390, 768, 1024, and 1440px, measured DOM widths confirmed no horizontal overflow and a visible central heading. Mobile comment bubbles correctly scaled to approximately 155px and 182px wide.
- Ambient motion paused when scrolled offscreen; independent scroll parallax moved the card layer.
- Next.js compilation and runtime diagnostics were clear. `pnpm verify` passed, including the native CSS Module pipeline and production prerender.

## Waving Portfolio integration — 2026-10-29

Local browser validation used `http://localhost:3001`; port 3000 was occupied by another project. Project identity was confirmed through Next.js MCP before testing.

- Recorded the supplied illustration starting after the Amour overlay unmounted, completing after approximately 7.03 seconds, then docking in approximately 1.07 seconds. Surrounding hero elements stayed hidden until docking completed and then staggered into view.
- Signature replay repeated the same sequence: intro with an inert drawing layer, completed drawing, docking, then visible surroundings and restored interaction.
- Clicking the dice changed its value. Enter on the focused character triggered the wave and Osama greeting.
- Skip intro revealed the hero and returned focus to `main-content`.
- Reduced motion on initial navigation displayed the completed centerpiece immediately after the original loader, with no additional seven-second wait, no running poster CSS animations, and the existing ambient-motion control disabled.
- Checked desktop, tablet, and mobile at 320, 390, 768, 1024, and 1440px; no horizontal page overflow. The 1024px breakpoint matches the CSS viewport even with a native scrollbar. Also inspected the 320×640 composition.
- Confirmed one `main#main-content`, one primary heading, and a separate interactive Client Component under the server-rendered Hero. The old center drag control is excluded while the new centerpiece is active.
- Navigated to the 404 and returned through its home link. The active page restored one poster with interaction enabled and scroll locking cleared; Next.js Activity may retain the inactive page's hidden DOM. Skip focus is scoped to the poster's own main element.
- Final `pnpm verify` passed ESLint, route-aware TypeScript, Prettier, and the production build. Next.js compilation/runtime diagnostics and browser page errors were clear.

### Continuous zoom and revised copy

- Replaced full-canvas shrinking with a continuous 1.5-second transform of the SVG poster alone. The existing hero reveal starts about 0.2 seconds into that zoom.
- Sampled desktop and mobile every 100ms through the transition. Every sample kept the same SVG node, opacity 1, and visible styling; its width decreased monotonically while the canvas width and dice coordinates stayed constant.
- Desktop canvas and hero both measured 1425×988px at a 1440×1000 viewport. Both mobile canvas and hero measured 375×832px at 390×844. Corner coordinates remained x=0/y=0 and the right canvas edge.
- Rechecked 320, 390, 768, 1024, and 1440px with no horizontal page overflow. Header spacing clears the dice, including small mobile layouts.
- The rendered poster uses MORE / HUMAN and Digital products, made more human in its accessible heading. Portfolio is absent from the hero centerpiece; copy changes are confined to the hero.
- Dice clicks, keyboard waving with the revised greeting, and signature replay worked. Replay preserved the same drawing node during its zoom.
- Reduced motion kept the completed poster interactive with no running poster animations, and the ambient-motion switch remained disabled.
- `pnpm verify`, Next.js runtime diagnostics, and browser page-error checks passed for this revision.

## Performance pass and practice section trim — 2026-10-29

- The Onyx "What I do" stage no longer mounts at page load. It mounts about one viewport before it is reached, so its texture painting no longer competes with the intro loader.
- Onyx textures are painted once per page, cached at module level and split into one task per texture. Scroll replays reuse the cache.
- The Onyx light loop now runs only while the stage is on screen in a visible tab. It writes `--ogp-mx/--ogp-my` only when the rounded value changes. Its endless CSS loops (grain, dust, orbit, bob) pause via `data-idle` while off screen; verified `animation-play-state: paused` at the footer.
- The load loop skips identical progress frames. The sticker footer skips identical `--ssf-sp` writes.
- Practice runway reduced from 200svh to 175svh; tiles fully ignite within the first 60% of the scroll. The wordmark and caption under the hero tile and the closing "Thoughtful UX" screen were removed. With nothing to reveal, the gate holds on the hero tile instead of lifting to an empty screen. Verified load → forge → reveal, still on reveal after a further 5s, and a replay after scrolling to the top.
- Production build on port 3002: no browser console errors. Frame timing was not measured because the browser pane was not on screen.

## Hero CSS Module to Tailwind — 2026-10-29

- `hero.module.css` was removed. Its rules now live as Tailwind classes in `hero.tsx`, `hero-scene.tsx` and `hero-portfolio-entrance.tsx`. State rules use `group/hero`, `group/scene` and `group/switch` variants. Breakpoints map to `max-lg:` (1023px) and `[@media(max-width:480px)]:`.
- Before/after comparison on the production build: position, size and 44 computed properties of all 212 hero elements at 390, 480, 768, 1023 and 1440px. Result: 0 differences at every width, after replacing `border-0` with `[border:0]`.
- State rules were checked by setting the states directly, with transitions disabled: intro hides the header, grid, cards and cursors; the active state clips the title to 1px and makes the header transparent; switch off moves the knob to 0 and greys the track (also below lg). The entrance layer was checked on a probe element: top −88px, z 30 → 8 when ready, poster scale/shift variables, animations paused off screen.
- Known difference: Tailwind 4 `hover:` applies only on devices that support hover, so the contact button no longer keeps a stuck hover colour after a tap on touch screens.
- The full intro sequence was not replayed in this pass, because animation frames do not run while the browser pane is hidden.

## Runtime lag pass — 2026-10-29

Measured on the production build in headless Chrome at 1440×900, normal CPU and 4× CPU slowdown.

- Hero header: the `:has()` rules that hid the header during the intro were re-matched on every animated frame inside the hero, which cost about 800ms of style work per 2.5s at 4× CPU. `HeroScene` now mirrors `data-portfolio-phase` and `data-portfolio-active` onto the `[data-hero]` section in a layout effect, and the header reads them with `group-data-*`. Sampled every frame through the loader, intro and ready phases: the section and scene attributes match, and the header is hidden, transparent or visible exactly as before.
- Waving poster (`waving-portfolio-landing.tsx`): removed `container-type:size` from `.wpl-root`, which made each breathe, wiggle and blink frame restyle expensively. The existing ResizeObserver now writes `--wpl-cqh`, `--wpl-cqmin` and `data-tall` (aspect ≤ 0.9). These replace the `cqh` and `cqmin` units and the `@container (max-aspect-ratio: 9/10)` rule. Pixel diff of the ready hero against the previous build at 1440×900 and 390×844 (the tall layout): 0 differing pixels.
- The poster's intro storm JSX is memoized, so the intro's state updates no longer rebuild it.
- Onyx (`onyx-glyph-preloader.tsx`):
  - Texture painting and encoding moved to a Web Worker (`onyx-glyph-paint.worker.ts`, using OffscreenCanvas). Blob URLs replace data URLs.
  - The paint code moved to `onyx-glyph-paint.ts`, shared by the worker and a main-thread fallback that paints one texture per task.
  - Light variables are written only on the spot, glitter and sheen layers. The rig gets the same transform as a direct style.
  - The light loop runs only while at least 10% of the stage is visible.
- Tangle footer (`tangle-footer.tsx`): each ring rotates as its own composited layer instead of repainting masked SVG text. Once a ring is fully drawn, its mask is removed. In reduced motion the pixel diff against the previous footer was 0.
- Results at 4× CPU:

  | Section   | Before     | After          |
  | --------- | ---------- | -------------- |
  | Hero idle | 32fps      | 59fps          |
  | Practice  | 33fps      | about 40–50fps |
  | Footer    | about 6fps | 55fps          |

  At normal CPU every stage ran at 55–60fps except the poster intro at about 45fps.

- Investigated but not changed: inlining the Onyx glitter texture URLs gave no reliable gain, because measurements were dominated by the stage's own phases.

## Hero content and composition — 2026-10-29

- The poster now spells UX / UI around one giant U, as the user chose. This replaces MORE / HUMAN. Its accessible heading is the brief's verbatim short bio.
- The top labels name two core specialties from brief section 03: UX research and Design systems. The name and the Product Designer title moved to the bottom row, because the narrower poster put the top row under the character's head.
- Copy sources:
  - Comments paraphrase the brief's bio and its proposed positioning (section 16).
  - The sticky note types the four "How I think" steps (section 03).
  - Cursor labels are UX activities from the skill list.
  - No metrics, testimonials, clients or roles were added.
- Artwork is now UI/UX artifacts, all original vectors:
  - a wireframe
  - a user flow with a decision point
  - color and type tokens using the approved palette
  - a dashboard on the laptop
  - a mobile app screen
  - a sticky note
- Official tool logos are stored in `public/brand/` and rendered with `next/image` (SVGs are served unoptimized):
  - Figma, Notion, Adobe XD and Framer come unchanged from svgl (github.com/pheralb/svgl).
  - Miro is the Simple Icons mark (CC0) on Miro's brand yellow `#FFD02F` with `#050038`.
  - These logos are trademarks of their owners and are used only to name tools listed in the brief.
- Layout:
  - Desktop: the comment card no longer covers the tokens card, and the cursor no longer sits on the switch.
  - Below lg: the wireframe, tokens, phone and both comments are hidden. Tools and the switch sit above the poster, and the laptop, sticky note, user flow and three cursors sit below it.
  - Checked in reduced motion at 1440×900, 768×1024 and 390×844.
- Full-motion run on the dev server: the intro reaches ready, the sticky note types its steps, all five cursors animate, and all five logos load. No console errors.

## Hero device mockups — 2026-10-29

- The laptop and phone are now straight, front-facing devices, no longer tilted or cropped at the screen edge.
- Their screens are concept UIs designed at real size and scaled as one piece, like frames on a Figma canvas:
  - an e-commerce admin dashboard at 1280×800 (scale 0.3125)
  - an iOS wallet app at 390×844 (scale 0.405)
- Every frame has a Figma-style frame name. Skeleton bars were removed from all cards:
  - the wireframe card became a sign-up screen
  - the tokens card shows named swatches and a type scale with real samples
  - the user flow shows a checkout with both branches
- Sample UI copy lives in `src/content/hero-mockups.ts`. Brands, people and figures there are fictional and labelled as concept screens; no real company names are used.
- Mockup markup uses neutral elements, not `main`, `nav` or headings, so the page keeps a single `main` and a clean heading outline. Floating cards stay `aria-hidden`.
- Layout:
  - Desktop has no overlapping frames.
  - Below md, the phone, tokens, sign-up, comments and Notion tile are hidden.
  - On tablet (md to lg) the phone returns below the sticky note.
  - Checked at 1440×900, 768×1024 and 390×844, with 2× close-ups of the laptop and the phone.
- Production build at 4× CPU: hero idle 59fps, style 223ms per 2.5s, matching the previous pass. Full-motion run: intro ready, typing and cursors animate, no console errors.

## Footer social links and brand icons — 2026-10-29

- Added Osama's supplied contact and social links in `src/content/footer.ts` (LinkedIn, Behance, WhatsApp, X, Figma, Instagram, TikTok, Facebook, Upwork, and Medium) and wired them through `src/components/sections/site-footer.tsx`. Removed the duplicate Email icon from the social icon strip since the email address is already displayed above it.
- Updated `src/components/ui/sticker-slap-footer.tsx` (`SocialKind`, `ICONS`, `DEFAULT_SOCIALS`, `DEFAULT_CREDITS`, and `chatHref`) to use 24×24 Simple Icons paths across all social icons, remove the `credits` pill button (`DEFAULT_CREDITS = []`), and wrap `.ssf-socials` cleanly without horizontal overflow.
- Integrated `src/components/ui/tangle-footer.tsx` directly inside `<footer class="ssf">` via `topSlot` on `src/components/ui/sticker-slap-footer.tsx`, synchronized at their shared horizontal seam, and rendered the `"Book a meeting"` CTA as the innermost rotating semicircle marquee ring (`isCta: true`) inside `rings[0]`. Clicking it lazily loads and reveals `src/components/ui/wirebound-inquiry.tsx` through the WebGL2 noise-threshold tear in `src/components/ui/noise-dissolve-reveal.tsx` (`src/components/sections/footer-tangle-booking.tsx` and `src/components/sections/booking-overlay.tsx`), adapted to the approved brand palette (`#5B8DFB`, `#F8FA55`, `#F3D061`, `#E43468`, `#17284F`) and Osama's sourced portfolio copy with strict TypeScript and ESLint ref/effect guards.

## Key section replaces What I do — 2026-10-29

- Removed the Onyx "What I do" section (`practice.tsx`, `practice-showcase.tsx`, `content/practice.ts` and the three `onyx-glyph-*` files). The slot after the hero now holds the supplied Skeleton Key Preloader (`src/components/ui/skeleton-key-preloader.tsx`) inside `src/components/sections/solution.tsx` and `solution-showcase.tsx`, with copy in `src/content/solution.ts`.
- Changes to the supplied component are limited to text, colors and guards:
  - Text: the word `solution`, greeting, tags, about lines, signature, links and the loading status line.
  - Colors: paper `#F8FA55`, ink `#17284F` and a new `brand` metal built from `#5B8DFB`.
  - Guards: ref mirrors moved into a layout effect, three effect `setState` calls restructured without changing behavior, a non-null assertion and an empty `catch` replaced, unused constants removed.
  - Performance: the frame loop and the CSS loops pause through `data-idle` while the gate is off screen or the tab is hidden.
- Behavior: `unlock="key"` waits for the visitor to drop the key in the lock, click "Turn the key", or press Enter; the camera then dives through the keyhole onto the solution content. The gate mounts only after the intro, about 30% of a viewport before it appears. The 175svh runway the work-plate choreography needs is kept.

## Key section: designer × developer workspace — 2026-10-30

- The key gate's GSAP animation, timing and sizes are unchanged (`skeleton-key-preloader.tsx` not edited). Only what it reveals changed.
- The revealed content is `src/components/sections/solution-workspace.tsx`: one full-width Figma editor. The developer's separate editor window was removed at the user's request. The developer and the client now work inside the Figma file with Osama, as live named cursors, comment pins and threads.
- The ten stages are idle, listening, thinking, reasoning, tool-call, tool-result, streaming, waiting-approval, error and done, across four canvas sections:
  - **Brief & research:** the client's brief, two rows of notes ("Osama heard" / "Developer heard"), a question, a persona and a problem statement.
  - **Mapping:** this is "thinking", and it gets twice the scroll. Osama draws the journey (Cart → Done) with a feeling curve and circles Pay. The developer draws the system behind Pay (three sequential API calls). A four-message thread between them leads to "1 batched call".
  - **Options:** A (three steps) and B (one page) with pros and cons. Both vote, B is chosen.
  - **Checkout:** a frame is drawn with auto layout, the content and a PayButton component land, tokens and redlines are handed off, and the client reviews. Then the Arabic frame overflows, the RTL test fails, a hug width fixes it, and it is approved.
- Figma UI3 chrome at Figma's sizes:
  - 241px side panels with 48px headers and 32px layer rows
  - 16px layer icons, including purple component and instance glyphs
  - a 48px floating toolbar of 32px buttons with 24px 1px-stroke glyphs, menu chevrons, and the Dev Mode toggle
  - a Share bar with multiplayer avatars, and Design/Prototype properties that follow the selection
- Motion:
  - One timeline, scrubbed by scroll with `scrub: 2.2` for a slow, smooth follow, drives the camera, cursors, comments and drawing. Diagrams draw with stroke-dashoffset on small SVG paths.
  - The chrome changes only when the stage index changes (ten `setState` calls in total).
  - Reduced motion uses `scrub: true` and no CSS transitions.
- Copy lives in `src/content/solution.ts`. The brief, people, comments, products and prices are an illustrative process scenario, not client work or measured results.
- The runway is 1060svh at the user's request (slow scroll, about 85svh per stage). This is longer than the 175svh budget.
- `work-showcase.tsx` offsets moved so the push starts only after the last stage:
  - push 9.6→10.35 viewports, exit 10.35→11.1
  - markers `top-[960svh]` and `#work-viewer` `top-[1035svh]` (reduced `1060svh`)
  - plate `sticky top-[-960svh]`
- Performance:
  - The canvas world is fixed at 900×600 and scaled by a ResizeObserver that writes a transform only when the scale changes.
  - Canvases below 0.6 scale, such as phones, zoom to half a section, and the camera follows each beat's focus point.
  - Only transform and opacity animate, apart from the small SVG stroke draws. Nothing runs while the page is not scrolling, and the scrub pauses when the tab is hidden.
- Layout: the design panel shows from xl. The layers panel and toolbar show from lg.
- Full-motion runs at 1440×900, 768×1024 and 390×844: no console errors. The work plate stays at 0 during the stages and moves after them.
- `canvas-grid.ts` holds the dotted grid shared by the hero and the workspace.

## Key section: scroll-driven key and richer final stages — 2026-10-30

- **Scope change, requested by the user:** the supplied key gate (`skeleton-key-preloader.tsx`) now runs on scroll instead of timers. It is one piece with the Figma workspace, and scrolling back up returns through the keyhole to the key screen.
- **Additions to the supplied component.** The defaults are unchanged, so without these props it behaves exactly as supplied:
  - `scrub` is a ref the host writes 0–1 into. When it is set, the timers are skipped, and the count and every phase (settle, insert, turn, open, done) follow the value both ways.
    - The gate eases toward the raw value itself, so it cannot be reset by a ScrollTrigger refresh.
    - Insert, slide, turn and camera dive use the same geometry as before; only their clock is the scroll.
  - `through` tells the gate the host is past the end; when it turns false the gate comes back out.
  - In scroll mode the gate stays mounted but hidden when done, and its CSS loops pause.
  - `face` sets one font for the whole board. The user asked for a single face, so Space Grotesk is used for every line.
  - `labels` sets the status-line text.
- The key screen's copy now introduces the Figma file: tags `#brief #figma #handoff #shipped`, "inside/ one brief, one file, designer + developer, one solution.", the status "Opening Checkout.fig", and the hint "Scroll to turn the key ↓".
- The workspace sits in its own stacking context (`isolate`), so Figma's toolbar no longer shows through the key screen.
- Runway is 1165svh:
  - 0–110svh turn the key and dive
  - Figma's timeline starts at 130svh
  - the stages keep their 9.35 viewports
- `work-showcase.tsx` offsets moved by +1.05 viewports:
  - push 10.65→11.4, exit 11.4→12.15
  - markers `top-[1065svh]` and `#work-viewer` `top-[1140svh]` (reduced `1165svh`)
  - plate `sticky top-[-1065svh]`
- **Stages 6–10:**
  - A trendier checkout design: product thumbnails, delivery chip, a segmented payment control, a gradient PayButton with an arrow, and the same design in Arabic.
  - A Dev Mode panel streams the PayButton's code line by line.
  - An approval card is shown while the client reviews.
  - A failing then passing RTL test card.
  - A "Live" badge and emoji confetti when the checkout ships.
  - Every thread is a longer, playful designer–developer exchange with emoji and reactions. It remains an illustrative scenario.
- Full-motion runs at 1440×900, 768×1024 and 390×844, scrolling forward and back through the key: no console errors.
