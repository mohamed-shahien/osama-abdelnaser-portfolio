type PageScroll = (position: number) => void;
let controller: PageScroll | undefined;

/** The root runtime remains the only owner of Lenis. */
export function registerPageScroll(next: PageScroll) {
  controller = next;
  return () => {
    if (controller === next) controller = undefined;
  };
}

export function scrollPageTo(position: number) {
  if (controller) controller(position);
  else window.scrollTo({ top: position, behavior: 'instant' });
}
