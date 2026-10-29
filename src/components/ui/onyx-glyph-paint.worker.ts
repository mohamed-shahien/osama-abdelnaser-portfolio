// Paints and encodes the Onyx textures off the main thread. Encoding the noisy
// faces is the expensive part (hundreds of ms each), so it never blocks scrolling
// or the intro animation. Replies with one Blob per texture, or null on failure.

import { textureJobs, type TextureRequest } from './onyx-glyph-paint';

self.onmessage = async (event: MessageEvent<TextureRequest>) => {
  try {
    const blobs: Blob[] = [];
    for (const job of textureJobs(event.data)) {
      const surface = job.paint();
      if (!(surface instanceof OffscreenCanvas)) throw new Error('no OffscreenCanvas');
      blobs.push(await surface.convertToBlob({ type: 'image/webp', quality: 0.92 }));
    }
    postMessage(blobs);
  } catch {
    postMessage(null);
  }
};
