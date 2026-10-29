import localFont from 'next/font/local';

export const workSans = localFont({
  src: [
    { path: '../../public/fonts/work/bt-grotesk-regular.woff2', weight: '400' },
    { path: '../../public/fonts/work/bt-grotesk-medium.woff2', weight: '500' },
    { path: '../../public/fonts/work/bt-grotesk-bold.woff2', weight: '700' },
  ],
  variable: '--font-work-sans',
  display: 'swap',
  preload: false,
});

export const workDisplay = localFont({
  src: [
    { path: '../../public/fonts/work/f37-bolton-regular.woff2', weight: '400' },
    { path: '../../public/fonts/work/f37-bolton-bold.woff2', weight: '700' },
  ],
  variable: '--font-work-display',
  display: 'swap',
  preload: false,
});
