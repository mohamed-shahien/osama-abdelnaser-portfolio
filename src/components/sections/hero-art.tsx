import { heroContent } from '@/content/hero';

/** Original vector studies for the hero. These are illustrations, not portfolio screenshots. */
export function WindowStudy({ kind }: { kind: 'wireframe' | 'chat' | 'code' }) {
  const dark = kind === 'code';
  return (
    <svg viewBox="0 0 214 160" fill="none" aria-hidden="true">
      <rect
        x=".5"
        y=".5"
        width="213"
        height="159"
        rx="7"
        fill={dark ? 'var(--ink)' : 'white'}
        stroke={dark ? 'var(--ink)' : '#d6d9df'}
      />
      <path d="M1 25H213" stroke={dark ? '#ffffff30' : '#d6d9df'} />
      {[15, 24, 33].map((cx) => (
        <circle key={cx} cx={cx} cy="12" r="3" stroke={dark ? '#ffffff65' : '#d6d9df'} />
      ))}
      {kind === 'wireframe' ? (
        <g fill="#e9edf3">
          <circle cx="30" cy="58" r="16" />
          <rect x="14" y="82" width="47" height="5" rx="2" />
          <rect x="14" y="94" width="33" height="5" rx="2" />
          <rect x="14" y="106" width="41" height="5" rx="2" />
          <rect x="80" y="42" width="41" height="47" rx="4" />
          <rect x="80" y="96" width="41" height="47" rx="4" />
          <rect x="130" y="42" width="68" height="30" rx="4" />
          <rect x="130" y="80" width="68" height="63" rx="4" />
        </g>
      ) : kind === 'chat' ? (
        <g fill="#e9edf3">
          <circle cx="20" cy="42" r="6" />
          <circle cx="38" cy="67" r="5" />
          <rect x="49" y="62" width="113" height="5" rx="2" />
          <rect x="49" y="72" width="83" height="4" rx="2" />
          <circle cx="38" cy="91" r="5" />
          <rect x="49" y="87" width="136" height="5" rx="2" />
          <rect x="49" y="97" width="94" height="4" rx="2" />
          <rect x="14" y="126" width="185" height="18" rx="4" stroke="#d6d9df" fill="white" />
        </g>
      ) : null}
    </svg>
  );
}

export function DesignCanvas() {
  return (
    <svg viewBox="0 0 312 237" fill="none" aria-hidden="true">
      <rect x=".5" y=".5" width="311" height="236" rx="8" fill="white" stroke="#d6d9df" />
      <path d="M7 8H305V229H7Z" fill="var(--primary)" />
      <circle cx="245" cy="58" r="91" fill="var(--secondary)" />
      <path d="M35 229C35 110 148 110 148 229H35Z" fill="var(--accent-rose)" />
      <path d="M95 229C95 137 185 137 185 229H95Z" fill="var(--ink)" />
      <text x="24" y="30" fill="var(--ink)" fontSize="8" fontWeight="600" letterSpacing="1.4">
        {heroContent.artwork.canvasLabel}
      </text>
      <text x="24" y="103" fill="var(--ink)" fontSize="37" fontWeight="700" letterSpacing="-1.5">
        {heroContent.artwork.canvasLines[0]}
      </text>
      <text x="24" y="143" fill="var(--ink)" fontSize="37" fontWeight="700" letterSpacing="-1.5">
        {heroContent.artwork.canvasLines[1]}
      </text>
    </svg>
  );
}

export function LaptopStudy() {
  return (
    <svg viewBox="0 0 546 350" fill="none" aria-hidden="true">
      <path
        d="M69 8C69 4 73 1 77 1H468C473 1 477 5 477 10V309H69V8Z"
        fill="#aeb5c0"
        stroke="#cbd0d8"
        strokeWidth="2"
      />
      <rect x="75" y="7" width="396" height="296" rx="5" fill="#080f22" />
      <path d="M84 17H462V291H84Z" fill="var(--primary)" />
      <circle cx="337" cy="117" r="125" fill="var(--secondary)" />
      <path d="M84 291C84 178 229 126 290 291H84Z" fill="var(--accent-rose)" />
      <path d="M149 291C149 207 253 196 280 291H149Z" fill="var(--ink)" />
      <text x="104" y="45" fill="var(--ink)" fontSize="8" fontWeight="600" letterSpacing="2">
        {heroContent.artwork.laptopLabel}
      </text>
      <text x="105" y="120" fill="var(--ink)" fontSize="37" fontWeight="700">
        {heroContent.artwork.laptopLines[0]}
      </text>
      <text x="105" y="162" fill="var(--ink)" fontSize="37" fontWeight="700">
        {heroContent.artwork.laptopLines[1]}
      </text>
      <path
        d="M27 309H519L544 328C544 335 539 340 527 340H19C7 340 2 335 2 328L27 309Z"
        fill="#d7dce3"
        stroke="#9da6b4"
      />
      <path d="M2 329H544M220 310H326L320 317H226L220 310Z" stroke="#929ba8" />
    </svg>
  );
}

export function PhoneStudy() {
  return (
    <svg viewBox="0 0 162 328" fill="none" aria-hidden="true">
      <rect
        x="2"
        y="2"
        width="158"
        height="324"
        rx="27"
        fill="#e3e6eb"
        stroke="#8991a0"
        strokeWidth="2"
      />
      <rect x="6" y="6" width="150" height="316" rx="23" fill="#0c1425" />
      <rect x="10" y="10" width="142" height="308" rx="20" fill="#f9fafc" />
      <rect x="51" y="15" width="60" height="15" rx="8" fill="#0c1425" />
      <text x="20" y="59" fill="var(--ink)" fontSize="8" fontWeight="700">
        {heroContent.artwork.phoneLabel}
      </text>
      <path
        d="M10 103H152M10 147H152M10 191H152M10 235H152M10 279H152M39 79V299M81 79V299M123 79V299"
        stroke="#dde3ed"
        strokeDasharray="2 2"
      />
      <circle cx="81" cy="159" r="42" fill="var(--secondary)" />
      <path d="M41 237V157C41 105 121 105 121 157V237H41Z" fill="var(--primary)" />
      <path d="M62 237V166C62 138 101 138 101 166V237H62Z" fill="var(--accent-rose)" />
      <rect x="63" y="304" width="36" height="3" rx="2" fill="var(--ink)" />
    </svg>
  );
}

export type HeroTool = 'figma' | 'notion' | 'framer' | 'xd' | 'miro';

export function ToolMark({ kind }: { kind: HeroTool }) {
  if (kind === 'figma')
    return (
      <svg viewBox="0 0 30 45" fill="none" aria-hidden="true">
        <path d="M8 0H15V15H8A7.5 7.5 0 0 1 8 0Z" fill="var(--accent-rose)" />
        <path d="M15 0H22.5A7.5 7.5 0 0 1 22.5 15H15V0Z" fill="var(--accent-warm)" />
        <path d="M8 15H15V30H8A7.5 7.5 0 0 1 8 15Z" fill="var(--ink)" />
        <circle cx="22.5" cy="22.5" r="7.5" fill="var(--primary)" />
        <path d="M8 30H15V37.5A7.5 7.5 0 1 1 8 30Z" fill="var(--primary)" />
      </svg>
    );
  if (kind === 'framer')
    return (
      <svg viewBox="0 0 30 42" aria-hidden="true">
        <path d="M0 0H30V14H15L30 28H15V42L0 28V14H15Z" fill="var(--ink)" />
      </svg>
    );
  if (kind === 'notion')
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M5 4 31 2 37 7V35L11 38 4 32Z" fill="white" stroke="var(--ink)" strokeWidth="2" />
        <path d="M11 10 31 8V32L11 34Z" fill="var(--ink)" />
        <text x="13" y="29" fontFamily="Georgia,serif" fontSize="23" fontWeight="700" fill="white">
          N
        </text>
      </svg>
    );
  if (kind === 'xd')
    return (
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="var(--ink)" />
        <text x="5" y="27" fill="var(--accent-rose)" fontSize="22" fontWeight="600">
          Xd
        </text>
      </svg>
    );
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="8" fill="var(--accent-warm)" />
      <path d="M8 29 13 10H17L13 29ZM17 29 22 10H26L22 29ZM26 29 31 10V29Z" fill="var(--ink)" />
    </svg>
  );
}
