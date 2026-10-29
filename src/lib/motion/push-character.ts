type Motion = {
  samples: number;
  svg: string;
  values: (string | null)[];
  tracks: { node: number; name: string; frames: number[] }[];
};

let source: Promise<Motion> | undefined;

/** Pre-sampled vectors from the supplied reference; no Lottie clock or runtime. */
export async function mountPushCharacter(host: HTMLElement) {
  source ??= fetch('/work/reference/push-character-motion.json')
    .then(async (response) => {
      if (!response.ok) throw new Error('Character asset unavailable');
      return (await response.json()) as Motion;
    })
    .catch((error: unknown) => {
      source = undefined;
      throw error;
    });
  const motion = await source;
  if (!host.isConnected) return;
  // The local asset contains only the reference SVG paths, groups and clip paths.
  const document = new DOMParser().parseFromString(motion.svg, 'image/svg+xml');
  const svg = document.documentElement;
  host.replaceChildren(svg);
  const nodes = [svg, ...svg.querySelectorAll('*')];
  const previous: (number | undefined)[] = [];
  let last = -1;
  return (progress: number) => {
    const frame = Math.floor(((((progress * 1.08) % 1) + 1) % 1) * motion.samples);
    if (frame === last) return;
    last = frame;
    motion.tracks.forEach((track, index) => {
      const token = track.frames[frame];
      if (token === undefined || previous[index] === token) return;
      previous[index] = token;
      const node = nodes[track.node];
      const value = motion.values[token];
      if (!node) return;
      if (value == null) node.removeAttribute(track.name);
      else node.setAttribute(track.name, value);
    });
  };
}
