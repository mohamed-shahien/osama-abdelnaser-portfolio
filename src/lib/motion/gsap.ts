'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registration is shared; browser-only work remains inside client lifecycles.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  gsap.ticker.lagSmoothing(0);
  // A phone's browser bar showing or hiding is not a layout change: refreshing
  // every trigger then makes the pinned scenes jump.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, useGSAP };
