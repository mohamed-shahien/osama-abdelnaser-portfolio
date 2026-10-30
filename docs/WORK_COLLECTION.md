# Selected work: content and replacement guide

The collection wraps the preceding section as a server-rendered child. Its panel opens onto the gallery, and a closing gate lands on the reserved black section.

## Experience

- The preceding 175svh section is passed as a Server Component child. The work
  choreography moves that actual panel without editing the preceding component.
  Hero, the supplied UI and the other agent's Solution section remain separate.
- Entry has 75svh of scroll; exit adds another 75svh for the requested reverse
  gate. The combined 325svh composition has 225svh of runway across its three
  phases. There is still one scrolling driver, owned by the root runtime.
- The character uses its full original 116-frame vector cycle, sampled at half
  frames. It is enlarged to 600.6×631.4px on desktop, 321.75×338.25px on mobile,
  and 793.65×834.35px above 1920px. Gate travel adapts so it walks fully off screen.
- The gallery stays hidden until the opening character finishes. Its first entry
  then forms the page arrangement and brings in surrounding text. It replays on
  a fresh page load; a cached return from a project preserves browsing position.
- Pages use native WebGL with the measured camera, curved geometry, focus angles,
  hover lift and image zoom. Correct UV orientation keeps cover text readable.
- Browsing is finite. Six featured projects are followed by an ALL PROJECTS image
  card. Clicking it fetches the remaining projects from `/api/work` and inserts them at
  the current position in the same scene, without resetting its animation.
- There are no arrow controls. Wheel, touch and keyboard navigate within bounds.
  At either boundary input passes back to the root scroll runtime. Local events
  signal when consumed, rather than applying a permanent overscroll barrier.
- Scrolling beyond the last card closes the black gate from right to left with
  the mirrored character, then continues into `NextChapter`, an empty black
  section reserved for the user's next design. Footer rings and the footer come
  after that full-height section and do not overlay the work viewport.
- The root exposes a narrow scroll command to reconcile Lenis inertia at the
  entry and return boundaries. It creates no additional Lenis or RAF driver.
- The project index uses the reference's isolated blur pulse (about 10px, then an
  850ms return to sharpness). It pauses off screen and while the document is hidden.
- BT Grotesk and F37 Bolton are self-hosted with `next/font/local`, scoped to work
  and case-study content. Original font URLs are in `public/fonts/work/SOURCES.json`.
  The former external collection link is replaced by “Ideas into experiences.”
- Project opening still uses the black-panel/title transition. Reduced motion
  removes gate movement, 3D, counter blur and page transitions. No-JavaScript users
  receive the complete image/link list.

## Project fields

| Field         | What it holds                                                                |
| ------------- | ---------------------------------------------------------------------------- |
| `name`        | The project name                                                             |
| `slug`        | A unique lowercase URL name such as `my-product`                             |
| `category`    | The project type, such as `Salla Store`, `Salla Theme` or `Web Platform`     |
| `summary`     | One line shown on the gallery card                                           |
| `description` | The full description on the case page; no unsupported metrics                |
| `date`        | The delivery month, such as `Aug 2026`                                       |
| `support`     | Devices and directions, such as `Responsive (Desktop + Mobile) · Arabic RTL` |
| `cover`       | The 910×732 gallery card                                                     |
| `images`      | Ordered UI images for the case page, each with a small thumbnail             |
| `liveUrl`     | A public project link, or `null`                                             |
| `behanceUrl`  | The project's own Behance page, or `null`                                    |

A cover is separate from the UI screenshots: the cover is the gallery card;
`images` form the project's scrolling preview. One UI image works, and more
images create a longer preview and thumbnail rail. Mobile screenshots can be
included in their original proportions.

## Where to edit

- `src/content/work-projects.json`: project records and image paths, newest first.
- `src/content/work-copy.ts`: section labels.
- `public/work/projects/<slug>/`: `cover.webp`, `01.webp`… and `01.thumb.webp`….
  `public/work/reference/` now holds only the push character's motion and atlas.
- `src/types/work.ts`: the typed content shape.

Example image record:

```json
{
  "src": "/work/my-product/01.webp",
  "width": 1440,
  "height": 1000,
  "alt": "The main product interface",
  "thumbnail": "/work/my-product/01.thumb.webp"
}
```

Supply accurate dimensions to reserve the correct space. `thumbnail` is optional;
112px-wide WebP copies keep the thumbnail rail light. Reuse the full image only
when a separate thumbnail is unavailable. Each project's ordered image list can
be changed independently of its cover.

## Project source

The collection is Osama's own work, taken from `Osama_Portfolio_Projects_EN.md`
(Notion, Behance, Drive and the CV). 38 of its 45 rows are shown, newest first:

- Row 23 repeats Bareeq (row 6) and is merged into it.
- Rows 44 and 45 (Tasawwoq, Wehg) have no confirmed name, type or description.
- Rows 10, 11, 27 and 36 (Vivian Cosmetics, SoapCover, Rafal, MUHKAM) have no images.

Drive images are used when a project has them, and Behance images otherwise. The
Behance link is hidden for rows 2, 3, 4, 5 and 7, where the sheet notes it opens the
base theme rather than the project. Images were downloaded once and encoded as WebP
(covers 910×732, UI images at most 1440px wide, thumbnails 160×100) with the already
installed image encoder. No dependency or lockfile changed. The original vector motion is stored
in `push-character-motion.json` (232 samples, approximately 1.6MB before transfer
compression), fetched and cached once. The old raster atlas is no longer used.

The former Huy Phan reference collection and its images were removed.

Heavy illustration/gallery work mounts only within one viewport and after the
initial loader. Gallery drawing is demand-driven; its GSAP ticker detaches once
input settles, off screen, or when the document is hidden. Detail images use
native lazy loading. All GPU buffers, textures and event listeners are disposed
on unmount. No CSS Modules, new stylesheets, second Lenis instance, or animation
package was introduced.

## Local validation — 2026-10-29

- `pnpm verify`: passed ESLint, route-aware TypeScript, Prettier and the production
  build. No dependencies or lockfile changes. `git diff --check` passed.
- Browser on the existing local dev server: checked at 1440×1000 and 390×844.
  The actual Practice plate sticks and slides; character dimensions match the
  reference breakpoints. No horizontal overflow at either viewport.
- First entry was observed progressing through `playing` to `complete`, ending
  on project 01 with the gallery open. WebGL reported no drawing error.
- Real wheel and button navigation changed projects while body scroll stayed
  fixed. Arrow-key navigation and a simulated TouchEvent swipe also changed
  projects; the rendering ticker returned to idle after motion settled.
- Reduced motion hid the actor, removed the plate transform, exposed the flat
  gallery, and removed the WebGL hit polygons. Desktop/mobile previews loaded.
- Opening project 02 used the black-panel transition. Returning restored project
  02, with no active overlay or repeated navigation; one visible main remained.
- These are local browser/build checks, not deployment or physical-device proof.

## Bounded gallery and reverse gate validation — 2026-10-30

- `pnpm verify` passed once after the runtime changes: lint, route-aware types,
  formatting, and production build (including the static `/api/work` route).
- On a fresh document, the gallery surface had opacity 0 while the gate was
  closed. Runtime observation recorded `workOpen=true`, then `intro=playing`
  24ms later, then `intro=complete` about 2.16s later, on project 01.
- At 1440×1000, wheel input after the last initial card moved body scroll from
  2488 to 2868 and started the reverse gate. At 390×844, loading ALL PROJECTS
  expanded 6 projects to 19; scrolling after project 19 moved body scroll from
  2098 to 2498 and activated the close. No index wrapped to project 01.
- The mobile close kept the black section below the scene and the footer below
  that section (observed tops 1077px and 1921px for an 844px viewport). No horizontal
  overflow. Character widths were 600.59px desktop and 321.75px mobile.
- A project change produced `blur(9.7288px)` on the index; it returned to 0px.
  A simulated mobile swipe changed project 02 to 04 while body scroll stayed fixed.
- ALL PROJECTS cover text was visually checked after correcting horizontal UV
  orientation. Insertion kept index 6, and WebGL returned error code 0.
- Reduced motion hid both characters, removed counter blur and hit polygons,
  and displayed a flat image with the reserved black section still in flow.
- Next dev reported no runtime/config errors. These are local checks; there was
  no deployment, physical-device test, or modification to the other agent's
  Solution component. Its existing 175svh composition is preserved.
