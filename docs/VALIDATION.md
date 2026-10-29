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
