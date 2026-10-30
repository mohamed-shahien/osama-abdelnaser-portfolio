# Playground

Route: `/playground`. Content source: https://huyml.co/playground (2026-10-30).

`src/content/playground-reference.json` contains the 83 titles, source columns,
original image URLs/dimensions and 12 Vimeo references. Replace these records
with approved work later. No source photographs or video files were downloaded
into the repository. Next Image is unoptimized so the browser loads the original
remote URLs directly; the image host needs no global configuration change.

The page uses the existing Geist font and brand tokens. The shared layout and
other agents' components were left unchanged. The gallery has native-size
masonry columns, hover zoom, scroll reveals, and a native-dialog media preview
with keyboard previous/next, Escape, focus restoration and lazy Vimeo embeds.

Local validation: route-aware TypeScript, targeted ESLint and formatting; browser
checks confirmed 83 cards, all remote image URLs, next/previous and Escape, and
no horizontal overflow at 390px. No production build or deployment was run.
