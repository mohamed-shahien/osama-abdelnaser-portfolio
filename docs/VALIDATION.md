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

## Skills section, gallery assembly, footer CTA and step orbs — 2026-10-30

- **Figma workspace:** the checkout design is now English only (a 360px small-phone frame replaces the Arabic one), with smaller elements. A dotted object for each agent stage now fills the header's empty corner (`step-orb.tsx`). It is drawn on a canvas with GSAP, in place of the reference's `thinking-orbs` and `motion` (the user chose not to add the dependency). Each stage has its own shape in brand colours, the shapes morph into each other on a stage change, and the loop pauses off screen and in hidden tabs.
- **Gallery:** the deck assembles on the push progress (scrubbed, starting at project 01) instead of a timed intro. The WebGL renderer is no longer rebuilt when the gallery opens.
- **Closing avatar:** it now pulls the gallery away with a clip instead of sliding a black panel. The Skills section is pinned beneath it (`-mt-[175svh]`, `z-0`), so it is revealed from behind the avatar. The fingertips sit on the edge (`reach`, measured on the drawing). `selected-work.tsx` lost its section background so the section beneath can show.
- **Supplied `animator-title-preloader.tsx`:** adapted with behaviour-preserving props. The defaults are unchanged.
  - `scrub` / `onScrub`: scroll mode, with beats in `ATP_SCROLL`.
  - `irisColor`, `cardTop`, `wordMax`, `steps`, `slot` and `mascotDock="foot"`.
  - `lettering="marker"`: writes the lines in the intro loader's marker alphabet.
  - Pauses off screen and in hidden tabs.
  - Strict TypeScript guards.
  - Used with `hud={false}`, as the user asked.
- **Skill tags (`skill-bubbles.tsx`):** adapted from the supplied Gravity Tags. They keep its physics, solid pills and parked loop, in the brand colours `#F5FB5D`, `#698BF9` and `#DB3E69`. Additions:
  - Scroll releases the drop.
  - The title and the glasses are solid keep-outs with a halo. The title is solid from below only, so the rain falls past it.
  - Every tag can be grabbed, dragged and thrown.
  - The copy is "From brief to shipped build / Design Skills / that power every project by / Osama Abdelnaser". The 16 skills come from brief section 03.
- **Skills runway:** 595svh. Its first 75svh run under the closing avatar, then scroll draws the title, drops the tags and closes the iris onto the footer's yellow.
- **Footer:** "Book a meeting" rises as an ink dome that fills the screen, then shrinks onto the CTA (`booking-cta-drop.tsx`, a fixed portal scrubbed by the footer's ScrollTrigger).
- **Checks:** headless Chrome at 1440×900, 1920×1000 and 390×844, through the push, gallery, close, skills and footer: no console errors.

## CV chapter, skills halo, thirty skills and push avatar — 2026-10-30

- **Supplied Type Remix Preloader (`COMPONENT REFRENSE/OEN` → `src/components/ui/type-remix-preloader.tsx`):** the seven takes keep their type, geometry, stickers, zoom and moodboard. Only the colours and copy are adapted:
  - Brand themes per take.
  - Brand gradients in the bubble, script, band and cutout takes.
  - Tile colours.
  - A `ground` colour for the gate.
- **New props for the Type Remix component** (the defaults keep the supplied behaviour):
  - `scrub`: scroll mode. The count, the take and the phase follow the scroll both ways (`RTP_SCROLL`: takes until 0.74, board from 0.8), and state is set only when a shown value changes.
  - `slides` and `labels`: per-take copy.
  - `cta`: the moodboard's count tile becomes a download link.
  - `label`.
- **Type Remix guards and pausing:** strict TypeScript guards; ref writes moved out of render. Animations pause off screen and in hidden tabs (`data-idle`).
- **CV section (`cv.tsx`, `cv-showcase.tsx`, `src/content/cv.ts`):**
  - Sits after Skills, on a 560svh runway with a sticky stage, mounted lazily after the intro.
  - Slides cover About, Experience, Services, Process, Education, Certificates and Résumé, from brief sections 01, 03 and 07 and the certificates. The About and Process wording is written for the site and awaits Osama's copy.
  - The Skills iris now closes onto the CV's navy (`#17284f`).
  - CV download placeholder: `public/cv/osama-abdelnaser-cv.pdf`, served at `/cv/osama-abdelnaser-cv.pdf` (set in `src/content/cv.ts`). The file is not added yet.
- **Skill tags:**
  - **Halo:** the glasses now have a round solid halo the size of the iris's last hold (0.64 of the mascot's width, centred 0.56 down it). Tags may land on it and pile over it, but never inside it.
  - **Spawning:** the title stays solid from below only, and its position is re-read while the tags fall. Tags spawn anywhere across the stage in a shuffled order, a tag height apart.
  - **List:** 30 skills, all listed in brief section 03.
- **Push avatar:** at 1920px the size class `min-[1920px]` lost to `md` in the CSS order, so the hands stood about 165px short of the edge. It is now `min-[120rem]`, so the size matches `actorMetrics`. Measured overlap of the hands on the plate edge: 4–6px at 390, 768, 1280, 1440 and 1920.
- **Checks:** headless Chrome at 1440×900, 1920×1080 and 390×844 through the push, skills and CV: no console errors.

## Rich CV, scrubbed remix, booking, key, avatars and step orbs — 2026-10-30

The user widened the scope for the supplied components touched here: content, layout and drawing changes were requested, not colour and text only.

- **CV (Type Remix, `src/content/cv.ts`):**
  - Each take now carries a fact sheet from the brief (sections 01, 03, 07, 08 and 09), drawn in its free band and hidden on the moodboard tiles.
  - The facts cover: role and base, all nine roles with dates, six services (no prices), the four process steps, the degree and graduation project, the certificates, and the tools.
  - The CV hides the remix's HUD, progress and click-to-drop stickers (`hud={false}`, `stickers={false}`). The four stickers sit in mirrored pairs.
  - The script take's crossed boxes are now the four process glyphs.
  - In scroll mode the board zoom is scrubbed, so scrolling back from the end plays it in reverse.
- **Skills → CV:** the iris grain fades out once the iris has shut. The closed iris is now exactly `#17284f`, the CV's first scene.
- **Workspace (`solution-workspace.tsx`):**
  - The step chips sit on one line inside a masked track that slides to the current step. No wrap and no scrollbar.
  - The UI uses the work sans and display fonts. Space Mono remains only in code and terminal lines.
  - The empty panels now hold a brief card and a stage note.
- **Step orbs (`step-orb.tsx`):** idle is a sleeping body with rising Zs, thinking is a thought bubble, waiting for approval is an hourglass that turns, and done is a tick with a ring. Swaying states rock instead of spinning.
- **Booking:**
  - The footer dome now shows a composed screen: kicker, place, headline with an arrow button, the inquiry note and three steps.
  - The words leave before the dome shrinks, so it lands clean on the CTA.
  - On click, the noise dissolve ships with the overlay and starts as soon as the dome covers the screen. Only the notebook form is lazy-loaded.
- **Key (`skeleton-key-preloader.tsx`):**
  - The key lines up with its tip on the keyhole's mouth (the top of the round). It slides 52 units, until the whole bit is under the paper.
  - It is cut at the mouth line, and the buried shaft shows through the round.
- **Avatars:**
  - **Hero (`waving-portfolio-landing.tsx`):** Osama's curly hair, thick square glasses, a rounder face, and a drawn hand on the folded arm instead of a plain circle.
  - **Push character (`public/work/reference/push-character-motion.json`):** the cap is worn backwards, the hair is curly and the glasses are square, on both head layers. The T-shirt is now white with dark flowers.
  - **Push character, method:** only static node attributes changed, so every motion track still indexes the same nodes.
  - **Skills mascot:** square, thick-framed glasses.
- **Checks:**
  - ESLint and TypeScript are clean on the changed files. Prettier is clean apart from the untracked playground files.
  - Headless Chrome at 1440×900 and 390×844 through the hero, key, CV, skills, footer dome and booking click: no console errors.

## Distinct fact sheets, placed stickers, a lighter booking cue and a scroll review — 2026-10-30

- **Fact sheets per take (`type-remix-preloader.tsx`, CSS only):** each take now dresses its facts in its own material.
  - **About:** die-cut stickers in a two-column grid beside "ME".
  - **Experience:** stitched felt patches.
  - **Services:** inflated balloons. The duplicate "Web · Stores · Apps" pill hides when facts exist.
  - **Process:** outlined steps joined by arrows.
  - **Education:** a transcript with dotted leaders.
  - **Certificates:** Figma-style selection boxes with layer-name tabs.
  - **Résumé:** torn magazine scraps.
  - **Phones:** under a 560px stage, every take packs two to a row.
- **Stickers:** click-to-drop stays off. A new `decals` prop lays fixed stickers on each take (with optional phone positions). They slap in as the take arrives and leave for the board. The About take keeps its own four.
- **Booking cue (`booking-cta-drop.tsx`):**
  - The scroll-scrubbed full-screen dome is gone. Once the footer rings have drawn the button, a "Book a meeting ↗" chip pops over it and a rose ring pulses out of it.
  - Scrolling back up reverses the chip. The pulse rests off screen and in hidden tabs.
  - The pieces are added next to the footer's own button on the first visit, because the footer draws it only after measuring. The dome copy in `src/content/footer.ts` is removed.
- **Scroll review:** headless Chrome stepped the whole page down and back up through the same stops: 49 stops at 1440×900 and 48 at 390×844.
  - Section, phase and fixed-layer state matched at every stop in both directions, with no console errors.
  - One stop going down lands about 100px short. This is the Work push's intentional snap that holds the gallery.
  - Long tasks of about 90–110ms appear only on the first pass down, while lazy sections mount.

## Smooth intro, nav, shortcuts, studio radio and one body font — 2026-10-30

- **Intro (`amour-sunrise-preloader.tsx`, `site-intro.tsx`):**
  - The loader opens by itself. The "click to enter" hint is gone and the hold is 0.9s.
  - A new `onLift` fires as the sun starts to cover the screen. The hero's entrance starts underneath, and the gate fades over it. The loader's paper turns transparent while lifting, so blue dissolves straight into the letter storm, with no yellow or muddy frame.
  - The poster is ready about 5s sooner (about 15s instead of 20s).
- **Hero:**
  - **Height:** the scene is now `100svh` minus the header, so the yellow section no longer peeks in.
  - **Switch:** "Keep it moving" moves up clear of the hair.
  - **Folded arm:** a watch on the wrist and a drawn hand with four curled fingers and a thumb.
  - **Font:** the Inter class is removed.
- **Navigation:**
  - **`site-nav.tsx`:** a numbered capsule (Home · Work · Playground) in the hero header. The current page wears the ink pill. On phones the logo is screen-reader only and "Talk design" hides.
  - **`section-dock.tsx`:** a slim fixed rail on the right (a bottom bar on phones) with Intro, Process, Work, Skills, CV and Contact, plus the radio toggle.
    - Each jump drops an ink curtain, moves while covered and lifts it, so pinned sections never race by.
    - One ScrollTrigger tracks the active stop from positions measured on refresh. Skills counts from after the gallery's exit wipe.
    - On phones the bar steps aside at the footer.
- **Studio radio:**
  - **`src/lib/audio/lofi.ts`:** a generative WebAudio lo-fi loop (keys, bass, soft beat, sparse melody). No audio file. It starts only from a click, fades in and out, and suspends in hidden tabs.
  - **`music-deck.tsx`:** a vinyl pill beside the switch, whose record spins only while playing and on screen, and analyser-driven bars. The frame loop runs only while playing, visible and on screen.
- **Font:** `--font-sans` is now the booking form's `--wbi-hand` stack for all running text. Geist Sans and BT Grotesk are no longer loaded for body text. Display faces (F37 Bolton, marker titles, the supplied components' own stacks) are unchanged.
- **Section reveal (`scroll-dissolve.tsx`):** the booking form's noise dissolve, reusable for any section. The solution section arrives under an ink veil that dissolves once it nearly fills the view. It plays once, with full motion only, and never for a reader already past it.
- **Booking speed:**
  - The notebook chunk preloads about one and a half screens before the footer.
  - The dome is 0.62s.
  - The dissolve waits for the notebook, so it always opens onto the form instead of a blue placeholder.
- **Work gallery:** the left side is now a project sheet: now-viewing index, category, up next, role, launch, frame count, reference credit and an open hint. The header shows the count and an arrow-keys hint. Two unused variables are removed.
- **Push avatar:** a light brand wash: pale sun T-shirt with blue flowers and rose hems, soft blue shorts, honey cap and white socks. The trainers lose the swoosh and turn blush. Only static attributes changed.
- **Skills:**
  - The hands wear the hero's look: white skin, navy sleeves with white swirls and yellow cuffs.
  - The tags are bigger (15px, and 19px from md).
  - The mascot's lenses are pulled apart, with a visible bridge between them.
- **CV Experience (`type-remix-preloader.tsx`, CSS only):** the nine jobs hang as pegged, numbered tags in two centred rows.
- **Checks:**
  - ESLint and TypeScript are clean on the changed files, apart from the known typed-route error in the untracked `playground-gallery.tsx`.
  - Headless Chrome at 1440×900 and 390×844 covered the intro frames, hero, dock jumps to every stop, the radio toggle, the dissolve, the gallery, skills and CV, with no console errors.

## Brand icons, share images, company badges and CV stickers — 2026-10-30

- **Source:** the user's images in the untracked `Picflow Images Oct 30 (1)` folder, resized and renamed with sharp. The folder itself is unchanged.
- **Browser icons (`src/app`):** `favicon.ico` (16, 32, 48), `icon.png` (192) and `apple-icon.png` (180, flattened on `#F8FA55`), all through Next's metadata file conventions.
- **Share images:** `opengraph-image.jpg` and `twitter-image.jpg` at 1200×630, each with an `.alt.txt`. `layout.tsx` adds `openGraph` and a `summary_large_image` Twitter card. The absolute image URLs need `NEXT_PUBLIC_SITE_URL` in production.
- **Company badges:** `public/cv/badges/01–09.webp` (192px, in CV order). Each felt Experience fact carries one through the new optional `RemixFact.icon`.
- **Stickers:** `public/cv/stickers/briefcase.webp`, `luggage-tag.webp` and `paper-plane.webp`, placed as felt decals through the new `RemixDecal` kind `image` with `src`. They have separate mobile positions.
- **`type-remix-preloader.tsx`:** the two optional fields above, plus their rendering and CSS. Existing takes and drawn stickers are unchanged.
- **Checks:**
  - curl confirmed the head tags.
  - Headless Chrome at 1440×900 and 390×844 confirmed the badges and stickers clear the tags, title and wave, with no console errors.

## Osama's real projects replace the reference collection — 2026-10-30

- **Data:** `src/content/work-projects.json` holds 38 of the 45 rows in `Osama_Portfolio_Projects_EN.md`, newest first. Left out:
  - the repeated Bareeq row;
  - Tasawwoq and Wehg (no confirmed details);
  - Vivian Cosmetics, SoapCover, Rafal and MUHKAM (no images).
- **Images:** Drive images are used where they exist, Behance otherwise. They are downloaded once to `public/work/projects/<slug>/` as WebP (24MB in total).
- **Behance links:** hidden for Bahij, BOM, Nagham, Azma and Shams, whose sheet links open the base theme.
- **Removed:** the Huy Phan reference collection (`work-reference.json`, its images and `SOURCES.json`). The push character's motion and atlas stay in `public/work/reference/`.
- **Type:** `WorkProject` drops `role`, `launch`, `sourceAuthor` and `sourceUrl`, and adds `summary`, `date`, `support` and `behanceUrl`.
- **UI:**
  - The gallery and case page show "Built for" and "Delivered".
  - The case page links to the live site and to Behance when present.
- **CV:** the supplied PDF is now `public/cv/osama-abdelnaser-cv.pdf`, the path the CV download already used.
- **Checks:**
  - ESLint and TypeScript are clean, apart from the known playground typed-route error.
  - `/api/work` returns 38.
  - `/work/mahsoul` and the home gallery were checked in the browser.
  - Old reference slugs now render the not-found page.

## Contact page, full index, ordered work, playground of all projects and a gallery return fix — 2026-10-30

- **Contact (`/contact`):** a new page with the slim `PageHeader` and the Wirebound inquiry notebook.
  - The nav swaps Work for Contact.
  - The hero's "Talk design" and the footer's "Book a meeting" go straight to it.
  - The footer no longer opens the booking dialog, which lagged. `booking-overlay.tsx` and `booking-inquiry-content.tsx` are now unused.
- **Work order (`src/content/work.ts`):** `workGroups` ranks websites, then company sites, then platforms and apps, then online stores, then store themes. Projects are newest first within each group. The home gallery's first six are therefore the websites and company sites.
- **Playground:** now lists every project (covers, kind, date, summary), filterable by group with counts. The Huy Phan reference list (`playground-reference.json`) is removed, and so is the typed-route error.
- **Section dock:**
  - It covers every section, including the seven CV chapters, positioned from the CV runway (`data-cv-track`).
  - An index button opens it with names and a Download CV link. Phones always use it from the bottom bar.
  - It closes on Escape or an outside press.
- **CV Services (`type-remix-preloader.tsx`, additive):** `RemixFact.n` stamps a count chip.
  - `Cv` counts shipped projects per group on the server.
  - The facts name real projects.
  - Cards can take an `icon` badge, and they clear the phone bar.
- **Gallery freeze fix:**
  - **Cause:** returning from a project restores the cached home page. ScrollTrigger refreshes then dipped the push for a moment, and the deck rebuilt from card 01 each time, so input looked frozen.
  - **Fix:** the deck now reassembles onto the card the reader was on. The push reports full assembly whenever the gallery is open.
- **Checks:**
  - Headless Chrome: home → project → back to work. The wheel moved the deck (index 0 → 6) where before it stayed on 0.
  - Scrolling down past the CV and back up showed Services, Experience, the gallery and the push intact.
  - Browser pane:
    - `/contact` loads from the nav.
    - The playground filter works.
    - The dock index jumps to CV Services.
  - 390×844: Services clears the bottom bar.

## Service badges, loader mark, smoother scroll, page transition, inner header, contact that sends, CV replay — 2026-10-30

- **CV Services badges:** six glossy badges from `Picflow Images Oct 30 (2)/` are exported to `public/cv/services/01–06.webp` (192px) and set as the fact icons.
- **Loader (`amour-sunrise-preloader.tsx`, text and glyph only):**
  - The caption reads "complex → simple" in the site font.
  - A new `mark` prop (default `♥`) draws a pointer glyph (`➚`) instead of the heart. Geometry and timing are unchanged.
- **Scroll:**
  - Lenis is softer: `lerp` 0.075, `wheelMultiplier` 0.9.
  - The asset-load refresh skips sized images and is debounced by 160ms.
- **Index dock:** the panel springs open from the rail's edge and its rows stagger in. Closing plays the rows and the panel out first. Reduced motion closes at once.
- **CV replay on scroll up (`type-remix-preloader.tsx`, behaviour fix):**
  - **Cause:** slides were keyed by take number, so going back reused the take already mounted underneath and nothing replayed.
  - **Fix:** each arrival now mounts fresh on top of the take it left, so entrances play both ways.
  - **Checked:** the incoming slide runs 23–30 animations when scrolling up.
- **Work section:**
  - **Exit:** the gate's exit is one unbroken walk over 0.55vh (was 0.75vh with two pauses).
  - **Project name:** the active name on the right is now a link ↗ to the case.
  - **Jump to:** a "Jump to" rail (Websites · Company sites · Platforms & apps · Online stores · Store themes) fills the bottom row. A group that isn't loaded yet loads the collection, then jumps.
  - **Badges:** support badges (Desktop, Mobile, Arabic · RTL, Live) are read from `support` and `liveUrl` (`src/content/work-groups.ts`). They show in the gallery, on the case page and on the playground cards.
- **Page transition (`page-transition.tsx`):**
  - **Cause:** the old link owned its panel inside a page that Next hides on navigation, and the entrance only mounted after paint.
  - **Fix:** one layer in the root layout now covers (0.75s, with the page name), changes the route, and reveals at once (0.85s).
  - **Where:** the nav, the hero, the footer CTA, the gallery, the case and playground cards. Home opens without it. Reduced motion skips it.
  - `work-page-transition.tsx` is no longer used.
- **Inner header (`inner-header.tsx`):** the playground header layout is shared by the playground, contact and case pages, with the current page marked. `page-header.tsx` is removed; `playground-header.tsx` is no longer used.
- **Playground:**
  - Brand-coloured tabs sit in a sticky ink capsule, with a colour dot per kind.
  - Cards show their kind tag, number, display-font name and badges.
  - The aside lists counts per kind.
- **Contact (`contact-inquiry.tsx`, `src/content/contact.ts`):**
  - **Sending:** the brief opens WhatsApp with every answer written out and a reference. If the window is blocked, the brief opens in the email app instead.
  - **WhatsApp button:** a green "Chat on WhatsApp" button offers a chat before booking. It uses a small additive `direct` slot in `wirebound-inquiry.tsx`.
  - **Text:**
    - The cities follow the brief ("Cairo · Riyadh · Remote").
    - No reply time is promised.
    - The project options include Salla, Zid or Shopify stores.
  - **Footer:** `/contact` shows the footer without the tangle and booking button.
- **Checks:**
  - **Static:** `pnpm typecheck` and ESLint are clean.
  - **Headless Chrome, transition:** the panel covers in 0.75s, the route changes under it, and it lifts straight away with no solid hold.
  - **Headless Chrome, pages:** the playground and contact pages render; the contact page has one WhatsApp button and no tangle.
  - **Browser pane, gallery:** the jumps (Store themes, Platforms & apps) and the name link were exercised.

## CV sheets, support badges, smoother dock, SEO and load — 2026-10-30

Supplied-component changes (scope widened by the user for these items):

- `type-remix-preloader.tsx`: the Process, Education, Certificates and Résumé takes get calmer fact sheets — one white step rail for Process, ruled columns for Education, credential cards with a seal for Certificates, and a toolkit of chips for Résumé (`Facts` takes an optional `chips` flag). The scattered process glyphs were removed, the education band lost its glow, and a plain `--rtp-text` stack is used for running text. Takes, words, timing and the replay on reverse scroll are unchanged.
- `sticker-slap-footer.tsx`: the default address line reads "Cairo · Riyadh · Remote"; the column tags are `h2` so inner pages keep a valid heading order. Look and motion unchanged.
- `wirebound-inquiry.tsx`: unchanged; the contact page passes a white `field` and `theme="light"` through the existing props.

Integration changes:

- The intro loader runs only for a visit that lands on `/`; inner pages (a project from search, the contact link) open on their content. Its code and the footer's tangle/booking pieces are loaded on demand.
- Inner-page links to `/` no longer prefetch the home bundle.
- Contact sends the brief to WhatsApp only (same tab when a new one is blocked). The footer's top part (rings and "Book a meeting") shows on the home page only.
- Support badges show Desktop, Mobile, Arabic · RTL and Live site for every project, ticked when included and struck through when not (`work-badges.tsx`).
- SEO: shared `src/config/seo.ts`, Person/WebSite JSON-LD in the root layout, CreativeWork + breadcrumbs per project, CollectionPage on the playground, per-page titles, descriptions and share cards, `sitemap.ts`, `robots.ts`, `manifest.ts`. Canonical links and sitemap entries need `NEXT_PUBLIC_SITE_URL`; they stay off until it is set.

Lighthouse 12.8.2 on the production build (localhost:3002):

| Page             | Mobile perf | Desktop perf | A11y                              | Best practices | SEO |
| ---------------- | ----------- | ------------ | --------------------------------- | -------------- | --- |
| `/`              | 89          | 98           | 100                               | 100            | 100 |
| `/playground`    | 85          | 100          | 96 → contrast fixed after the run | 100            | 100 |
| `/contact`       | 80          | 98           | 100                               | 100            | 100 |
| `/work/truepath` | 93          | 100          | 100                               | 100            | 100 |

Observed (unthrottled) LCP equals first paint on every page; the mobile score is held back by the simulated cost of the shared JavaScript (React/Next runtime, GSAP, the footer).

## CV scene stickers and page share cards — 2026-10-31

- Eight image stickers from the user (`public/cv/stickers/`: magnifier, puzzle, grad-cap, chip, certificate, pen-tool, paper-stack, download; trimmed, ≤480px webp) sit in the empty band above the title on the Process, Education, Certificates and Résumé takes, with phone positions (`src/content/cv.ts`).
- Playground and contact have their own share cards (`opengraph-image.jpg` / `twitter-image.jpg`, 1200×630, with alt text), from the user's two banners.
- `type-remix-preloader.tsx` (layout fix only): on phones the Résumé toolkit now folds to two columns (the four-column base rule came later in the stylesheet and won), and the Education take hides its title line, which overlapped the facts that repeat it.

## Sticker fact sheets, one text face, smoother motion — 2026-10-31

Supplied-component changes (scope widened by the user):

- `type-remix-preloader.tsx`: the Process, Education, Certificates and Résumé sheets are redesigned in the site's sticker language, each its own material — numbered die-cut stickers on a stitched line (numbers in the title's outlined script), masking-tape labels with torn ends, white certificate stickers with star seals (one shown selected like a Figma layer), and taped paper scraps with ransom-note tool chips. They slap in one by one (`rtp-slap-in`, 1.1s). Phones pack two per row above the bottom bar. `--rtp-text`, `--rtp-mono` and `--rtp-hand` now resolve to the site's hand face; the display faces are unchanged.
- `amour-sunrise-preloader.tsx`, `tangle-footer.tsx`, `waving-portfolio-landing.tsx`: their small mono/sans labels use the site's hand face (`--font-sans`). Geometry and timing unchanged; the tangle's scrub moves from 0.65 to 1.
- The booking form and the sticker footer receive the hand face through their existing font props. Geist Mono is no longer loaded.

Integration changes:

- Motion: the work section's closing avatar walk runs over ~1.5 screens instead of ~0.55 with a scrub of 1 (the push too); the Skills section's overlap and reveal follow (`-mt-[270svh]`, `REVEAL = 1.7`, 690svh runway). Page transitions, the dock's jump curtain and the work counter's blur are slower and use symmetric eases.
- The work section's motion mounts through a ScrollTrigger, so a dock jump straight past its start (to Skills) no longer leaves the Solution plate on screen.
- Section dock: rows faded by closing the index had kept `opacity: 0`, which hid the rail's dots; they are cleared now. Opening and closing morph the panel's size between rail and index.
- Inner pages' header drops the "Menu" label and the Work/About links (they only pointed at home-page anchors).

## Interests section — 2026-10-31

New last chapter before the footer (`#interests`, also a dock stop), built from two components the user supplied:

- `stack-tower.tsx` (supplied as framer-motion): ported to the GSAP ticker, no new dependency (the user declined adding one). The cosine cycle, row offset, squash, slide, skew, color mix and hover easing are unchanged. Added: words from props, rows as buttons (hover, focus, click), a staggered rise-in, `touch-action: pan-y` instead of `none` so the page still scrolls over the list on phones, and the ticker stops off screen, in hidden tabs and under reduced motion.
- `ring-tower.tsx` (supplied as three.js): redrawn on a 2D canvas with the same scene constants (radius 4, band 2, spacing 3.5, 7° camera at 70, tilt 14°, quarter-turn zig-zag, crawl, drag inertia, opposite parallax, backface fade). Each band is sliced into 72 (56 on touch) affine strips, depth sorted. Added: up to 12 rings, a scroll-driven camera pan, a focus tag that dims other photos, a drop-in entrance, and drawn placeholder cards for photos without a `src`. Pauses off screen and in hidden tabs.
- `interests-showcase.tsx`: the list holds still, the rings pan through a 250svh runway, the title sits beside the rings, and the Selected Work avatar (mirrored, smaller) walks in pushing an interest card. Hovering or tapping an interest swaps the card and plays that interest's act (flash, voice waves, greeting bubbles, glyph burst, typing, steam, stamp, ticks). Every act is a finite timeline.
- Content in `src/content/interests.ts`: the sixteen interests are the user's list; the one-line notes and the thirty photo slots are placeholders until the real copy and photos arrive.

## Interest stages, the loader's cursor, slower scroll — 2026-10-31

- Interests: Novelty, Coding and Systems became Chess, Reading and PlayStation. Each interest now has its own set (`interest-stage.tsx`): a prop the avatar holds or stands behind (camera, studio desk with mic and headphones, chess table, controller, shopping cart, lantern, sign...), its own card spot and dressing (a polaroid that shows a snapshot of the rings, an ON AIR card, a speech bubble, a game screen, a pushed block), and a short finite choreography. An interest can take a drawn pose image instead (`pose`, prompts in `docs/interest-pose-prompts.md`).
- Cursor (`site-cursor.tsx`): fine pointers get the loader's arrow as the pointer. As the loader lifts, the arrow leaves the sun at its own size and shrinks onto the mouse; it grows over links and buttons. The native cursor is hidden only while it is live. `amour-sunrise-preloader.tsx` is untouched; its mark is hidden from outside at the handover.
- Motion: Lenis lerp 0.075 → 0.06 and wheel 0.9 → 0.75; GSAP scrubs 1 → 1.6 (hero, work, footer tangle); the CV and Skills scroll values ease toward their target over 0.9s (`followTo`) instead of tracking each notch.
- The page scrollbar is hidden; the section dock sits flush against the right edge (the bottom edge on phones).

## Slower scroll scenes, project copy motion, services, dock and footer polish

- CV: the seven takes run over a 1100svh track (about a screen and a half each). Work: the avatar's push now takes 10.65→11.9 screens and the close 11.9→13.9; the viewer and tail spacer moved with it, so Skills keeps its place.
- Diagram: service boxes are 156px wide with no wrap, so "Payment gateway" fits.
- Work gallery: the left copy and the phone caption rise in line by line when the project changes (full motion only). New on-brand `public/work/all-projects.svg` (sticker deck, palette only).
- `type-remix-preloader.tsx` (bubble take, styles only): six even service balloons with the count badge top-left and the service badge off the top-right corner, the title lifted so the cards no longer cover it. Text and data unchanged.
- Section dock: the closed panel uses a 16px radius with vertical padding, so the menu and music icons sit inside it; the open panel shows a full-width "Studio radio" control.
- Footer: the floating "Book a meeting" chip is gone (the ring already says it; the pulse stays). `tangle-footer.tsx` (user-requested style change): the CTA ring holds whole labels spaced to close the circle (no "BOOBOOK" seam), the button face is rose with an ink rim, and its arrow badge draws itself in after the rings. The yellow footer sheet has rounded top corners and a warm shadow.

## Refresh mid-page error, drawn interest poses

- `work-showcase.tsx`: the mount trigger used `trigger.kill()` inside its own `onEnter`, which fires during `ScrollTrigger.create` when the page reloads below it ("Cannot access 'trigger' before initialization"). It now uses `once: true`. Checked by reloading at 8 scroll positions on desktop (1440×900) and 5 on mobile (390×844): no exceptions or console errors.
- Interests: the 16 supplied drawings (Picflow export) are trimmed and scaled alike (×0.72, so the figure stays one size) into `public/interests/poses/<id>.webp`, 53–113KB each, ~800px tall (over 2× the largest display size).
- `interest-stage.tsx` holds each pose's size, card spot (high / mid / low beside the figure) and effect point (mic, mouth, cup). The figure pops in and plays a short, finite move per interest (`playPose`); the card's own pieces (ON AIR blink, scribble, plan arrow, ripples) still play. Without a pose the pushing avatar and props remain as the fallback.
- Poses are fetched and decoded in idle time once the section is reached. Checked on 1440×900, 820×1180 and 390×844 with several interests picked: no errors.

## Hero avatar, interest cards, footer, arrows, inner header, production pass

- `waving-portfolio-landing.tsx` (user-requested redraw of `wpl-char` only): the hero character now matches the pushing avatar: flower shirt with a pink ringer collar, short sleeves with cuffs, light-blue watches, blue shorts, backwards cap, round glasses and a filled grin. The waving hand is redrawn as an open palm with short fingers (it read as deformed). Every class name and pivot the wave, look and breathe animations use is unchanged.
- Interests: each card now sits beside or above its drawing (`poseCardClass`), never over it, with a short-screen fallback beside the figure. The card is restyled as an on-brand sticker card (ink rim, offset shadow, washi tape, tail, counter chip). The camera act no longer flashes the whole screen: a small glow and rays pop at the camera. The voice-over act draws black line arcs at the mic, like the drawing, instead of red rings.
- `sticker-slap-footer.tsx` (user-requested and performance):
  - Scroll stutter: `--ssf-sp` was written on the footer root every scroll frame, so the whole footer restyled. It is now a registered, non-inherited property (`@property`), written only on the three layers that use it (tangle band, panel, stage). The band and panel get `will-change: scale`. The mouse parallax vars are written on the stage, not the root.
  - The script "s" is redrawn as a printed s from the top, so "osama" reads correctly.
  - Dragging already worked (mouse and touch, checked with CDP). The custom cursor hides "grab", so a small "drag the stickers" note now shows until the first drag.
- `arrow.tsx` (new): one bold, round-capped SVG arrow replaces the text glyphs ↗ → ← ↓ ↔ in the work gallery, case pages, playground, dock, interests hint, solution mock-ups, the CV moodboard tile (`type-remix-preloader.tsx`) and the key hint (`skeleton-key-preloader.tsx`, glyph only).
- `inner-header.tsx`: one short row (menu, role, and the page's own links on case pages). The "Osama©" block, the "For inquiries" label and the email are gone. The current page is marked with the arrow. Contact: the notebook starts right under the bar (`!pt-2`, auto height). Case pages: the top gap shrinks to match.
- Performance:
  - `TypeRemixPreloader`, `SkeletonKeyPreloader` and `SolutionWorkspace` load with `next/dynamic` when their stage is near, not with the page. The home page's main chunk went from 120KB to 70KB gzipped.
  - The workspace, the heaviest DOM on the page, is built in an idle callback after the key gate, not in the same task as the intro hand-off.
  - `skill-bubbles.tsx` and `stack-tower.tsx` set `will-change` only while their loop moves, so 46 layers no longer persist when they are idle or off screen.
- Checked on the production build (port 3002), mobile 390×844 with 4× CPU and 4G: first and largest paint about 0.6–1.2s on all pages, CLS ≤ 0.02. Footer scroll at 4× CPU after the intro: worst frame 600ms → about 200ms.

## Domain and the logo intro

- Domain: `src/config/site.ts` defaults to `https://osama-abdelnaser.com` (`NEXT_PUBLIC_SITE_URL` still overrides it). Canonical links, the sitemap, robots and social images now use it, including on the Vercel preview (`osama-abdelnaser-portfolio.vercel.app`), so the preview never competes with the real domain in search.
- Logo intro: the user's video (`public/intro/logo-intro.mp4`, 1070×1302, 5s, 0.9MB) opens a visit that lands on an inner page (project, playground, contact). The home page keeps the Amour Sunrise loader. It plays once per browser session, never under reduced motion, can be skipped with a click, tap, key or the Skip button, and fades out when it ends or after 7s if the video stalls. Page entrances wait for it (`SiteIntroReadyContext`). Its code loads only when it plays (`next/dynamic`). Checked on `/contact` at 390×844: it plays, fades out, and the page and scrolling come back.
- Inner header logo: the "osama" wordmark with its heart and cursor is cut from the video's last frame, with its paper and dots removed (`public/brand/osama-logo.webp`, 372×120, 27KB). It sits at the start of the inner header as the home link, where "Osama©" was. On phones the "Home" text link hides, since the logo goes home, so the bar stays one line. Checked at 1440, 390 and 360 wide on contact, playground and a case page.

## Scenes follow the scroll, work push, skills and CV hand-offs, looping nav logo

- Scroll feel: the scenes stacked three smoothings (Lenis lerp 0.06, 1.6s scrubs, a 0.9s follow), so a scene kept moving after the scroll stopped. Now Lenis carries the glide (lerp 0.1, wheel 1) and scenes sit on the scroll: `motionConfig.scroll.scrub` 0.35 (hero, work push and close, solution workspace; `tangle-footer.tsx` 1.6 → 0.35) and `follow` 0.25s. A scene can be stopped halfway.
- Solution (second section): its loading bar starts when the stage is 10% on screen (was 30%).
- Work: removed the scroll snaps (`alignGallery`, the push trigger's `onLeave`) that pulled the page back while the user scrolled on, which reversed the push and restarted the close. A quarter screen now holds the gallery open after the push (close starts at 12.15 screens, was 11.9). The close is 1.2 screens (was 2).
- Skills: its scrub starts at 80% of the avatar's close (read from the `selected-work-close` trigger), so the title draws in while the curtain is still moving and the stage is never a flat black screen. Its end is `bottom 75%`, so the stage is already moving up toward the CV while the iris shuts on the glasses, instead of a flat navy screen.
- Inner header: the logo is the whole video at its own ratio (`nav-logo.tsx`), rounded, larger, looping only while on screen and the tab is visible, as the home link. The other items sit at the top of the row.

## Mobile review: stage heights, work gallery on touch, CV scrubbed cuts, scroll hint, music

- Sticky stages use `h-lvh` (and `-mb-[100lvh]`), and `ScrollTrigger.config({ ignoreMobileResize: true })` stops the phone toolbar from re-measuring every trigger. This removes the dark strip under the stages and the jitter as the toolbar hides. The CV takes fill their stage (`height="100%"`, was `100svh`).
- Solution: the key starts when 15% of the stage is on screen (`top 85%`). Figma section: the middle line of "What happens behind Pay" now ends on the centre of "Shipping rates". The stage strip shows at every width, as on desktop; the phone-only chip and progress bar are gone.
- Work: the push and close triggers measure the screen from the `svh` anchor the plate's sticky offset uses, not `innerHeight`, which grows on phones when the toolbar hides and left an empty band at the end of the push. `work-gallery.tsx`: the open deck takes `touch-action: none`, so a swipe moves the cards instead of the page; past either end of the deck the swipe scrolls the page.
- Skills: `skill-bubbles.tsx` bubbles are smaller on phones (12px text, `px-3 py-1.5`; desktop unchanged). The scrub ends at `bottom 45%`, so the stage lets go mid-iris and is moving up toward the CV while the iris shuts on the glasses.
- CV (`type-remix-preloader.tsx`, scroll mode only): the cut between takes follows the scroll. The last 45% of each take's slice wipes the next take in over it, and the old take recedes beneath (scale to 0.92). It reverses and holds wherever the scroll stops. Slides are keyed by take, so the incoming take is not remounted when it becomes current. On phones (container ≤ 560px), titles clear their cards: About's word lifts and its cards clear the bottom bar, Experience moves down from the top, How I Think lifts its group, Education's band grows to 37cqh so ENGINEER sits above the cards, and Certificates' word lifts above them. Measured at 375×812: no title overlaps its cards.
- Inner header: no padding on the header; the menu and the right block carry their own top padding, so the logo meets the top edge.
- Phones: an animated mouse icon (`animate-scroll-hint`) sits beside the dock's Index button until the last section, and stays hidden while the menu is open.
- Music on phones: the first tap sets `navigator.audioSession.type = 'playback'` and plays a silent clip through `<audio>`, which unlocks Web Audio on iOS (including with the silent switch on).
