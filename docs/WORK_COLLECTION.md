# Selected work: content and replacement guide

The collection wraps the existing Practice section as a server-rendered child.
The actual Practice panel is pushed away; there is no extra black section. Hero,
Practice source, supplied UI, and the shared motion runtime remain intact.

## Experience

- Practice keeps its existing 175svh track. At its end the same panel sticks at
  -75svh; 75svh more scroll pushes it sideways and reveals the gallery behind it.
  The combined 250svh composition has 150svh of pinned runway, with no extra
  scrolling driver. Scrolling back reverses the push.
- The original pushing character is 489.06×514.14px on desktop, 248.82×261.58px
  below 768px, and 686.4×721.6px above 1920px. Its full original 116-frame cycle
  is sampled at half-frame intervals. Scroll progress seeks vectors, rather than
  running a separate animation clock. The reference's visible counter size is zero.
- The project viewer renders actual subdivided pages with native WebGL. Camera,
  page dimensions, focus rotations, spacing, velocity bend, cover cropping,
  hover lift and 15.6% image zoom follow the reference measurements. No 3D package
  was installed. Textures load nearby, with a maximum of 12 resident textures.
- The entry flies through the collection, then separates and focuses the pages.
  Wheel, trackpad and touch input use inertia, damping and snapping; arrow keys
  and previous/next controls are also available. Continue exits to the footer.
- Opening a project raises a black panel, shows its title, then lowers the panel.
  Reduced motion skips these transitions. The last viewed project is restored
  on returning to `/#work-viewer` without replaying the gallery entry.
- `/work/[slug]` provides description and metadata, a vertical UI-image sequence,
  thumbnail navigation, a large title, and the next project.
- Reduced motion uses a flat semantic image gallery. The full image/link list is
  also available without JavaScript.

## What to provide for each real project

| Field                       | Required                | What to supply                                                                                                   |
| --------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `name`                      | Yes                     | The actual project name                                                                                          |
| `slug`                      | Yes                     | A unique lowercase URL name such as `my-product`                                                                 |
| `description`               | Yes                     | One or two clear sentences about the problem and result; no unsupported metrics                                  |
| `cover`                     | Yes                     | A landscape cover, about 5:4, ideally 1600×1280px or larger                                                      |
| `images`                    | Yes                     | Ordered UI screenshots or presentation images; 1440–1920px wide is suitable; natural image heights are preserved |
| `category`                  | Yes                     | Product, website, mobile app, commerce, or the relevant industry                                                 |
| `role`                      | Recommended             | Osama's actual role on the project                                                                               |
| `launch`                    | Optional                | An approved month/year, or an empty string                                                                       |
| `liveUrl`                   | Optional                | A verified public project/prototype link; `null` hides the link                                                  |
| `sourceAuthor`, `sourceUrl` | Reference fixtures only | Set both to `null` when replacing with Osama's approved work                                                     |

A cover is separate from the UI screenshots: the cover is the gallery card;
`images` form the project's scrolling preview. One UI image works, and more
images create a longer preview and thumbnail rail. Mobile screenshots can be
included in their original proportions.

## Where to edit

- `src/content/work-reference.json`: project records and all image paths.
- `src/content/work-copy.ts`: section labels.
- `public/work/`: the current reference files; real project folders can be added beside `reference/`.
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

## Temporary reference material

At the user's request, the initial collection contains the 19 projects shown at
[huyml.co](https://huyml.co/), with the original cover/interface imagery. They are
clearly marked as Huy Phan references, not Osama client work. The accompanying
copy describes those references without claiming their awards or results.

`public/work/reference/SOURCES.json` records the original page and image URLs.
There are 19 covers, 124 interface images, and separate small thumbnails. Images
were encoded as WebP offline with the already installed image encoder; no
dependency or lockfile was added or changed. The original vector motion is stored
in `push-character-motion.json` (232 samples, approximately 1.6MB before transfer
compression), fetched and cached once. The old raster atlas is no longer used.

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
