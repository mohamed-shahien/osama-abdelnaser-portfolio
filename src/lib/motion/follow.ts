import { motionConfig } from './config';
import { gsap } from './gsap';

/**
 * Eases a value the scroll writes toward its new target, so scenes that read it
 * every frame glide instead of tracking each wheel notch. `immediate` (a
 * refresh, a jump) and reduced motion set it at once.
 */
export function followTo<T extends object>(
  target: T,
  key: keyof T & string,
  value: number,
  immediate = false,
) {
  if (immediate || window.matchMedia(motionConfig.queries.reduced).matches) {
    gsap.killTweensOf(target, key);
    Object.assign(target, { [key]: value });
    return;
  }
  gsap.to(target, {
    [key]: value,
    duration: motionConfig.scroll.follow,
    ease: 'power3.out',
    overwrite: 'auto',
  });
}
