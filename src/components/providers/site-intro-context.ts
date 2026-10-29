'use client';

import { createContext, useContext } from 'react';

export const SiteIntroReadyContext = createContext(true);

export function useSiteIntroReady() {
  return useContext(SiteIntroReadyContext);
}
