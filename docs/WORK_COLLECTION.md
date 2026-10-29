# Selected work: content and replacement guide

The collection is inserted after the existing Practice section. Hero, Practice,
the supplied components, their performance changes, and the shared motion runtime
were left intact. Only the new section import/render was added to the homepage.

## Experience

- A black screen enters after Practice. Its original pushing character moves the
  black edge aside as the visitor scrolls; scrolling back reverses the reveal.
- The reveal uses a 175svh section with a 100svh sticky viewport: 75svh of scroll
  drives the push. It adds no scrolling driver or WebGL dependency.
- The project viewer uses perspective cards, changing project metadata, a large
  index, native wheel/touch scrolling, arrow-key navigation, and previous/next
  controls. Continue exits to the footer. The last viewed project is remembered
  in session storage when returning from its detail page.
- `/work/[slug]` provides each project's own preview: description and metadata,
  a vertical UI-image sequence, thumbnail navigation, large title, and next project.
- Reduced motion exposes the gallery immediately and removes the moving 3D poses.
- A readable image/link list is available without JavaScript.

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
- `src/content/work-copy.ts`: section labels and the pushing sprite path.
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
dependency or lockfile was added or changed. The pushing illustration was baked
from the reference's original vector animation into a 32-frame, approximately
230KB transparent WebP atlas. It runs only as scroll progress changes and does
not ship the original Lottie runtime.

The large illustration/project code mounts only within one viewport and after
the initial loader. The gallery mounts images for the nearby cards, and detail
images use native lazy loading. Motion stops outside the viewport and when the
document is hidden. No CSS Modules, extra stylesheets, permanent animation loops,
or new animation/smooth-scroll packages were introduced.
