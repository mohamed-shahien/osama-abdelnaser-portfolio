'use client';

import NoiseDissolveReveal from '@/components/ui/noise-dissolve-reveal';
import WireboundInquiry from '@/components/ui/wirebound-inquiry';

export default function BookingInquiryContent({ onReveal }: { onReveal: () => void }) {
  return (
    <NoiseDissolveReveal
      veilColor="#17284F"
      durationMs={1100}
      delayMs={80}
      height="100svh"
      onReveal={onReveal}
    >
      <div data-lenis-prevent className="relative h-full w-full overflow-x-hidden overflow-y-auto">
        <WireboundInquiry height="100svh" />
      </div>
    </NoiseDissolveReveal>
  );
}
