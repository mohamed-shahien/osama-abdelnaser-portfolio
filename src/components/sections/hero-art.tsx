import Image from 'next/image';

import { heroMockups } from '@/content/hero-mockups';

/*
 * Original concept screens for the hero, drawn like frames on a Figma canvas.
 * Device screens are laid out at real size (1280×800 laptop, 390×844 phone) and
 * scaled down as one piece, so type and spacing keep true proportions.
 */

const cardShadow = '[box-shadow:0_1px_2px_#17284f14,0_8px_24px_#17284f14]';

function FrameName({ children }: { children: string }) {
  return (
    <p className="m-0 mb-[6px] flex items-center gap-[5px] text-[10px] leading-[12px] font-medium text-[#8a93a3]">
      <svg className="size-[9px]" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M3 0v10M7 0v10M0 3h10M0 7h10" stroke="currentColor" />
      </svg>
      {children}
    </p>
  );
}

type IconName =
  | 'grid'
  | 'bag'
  | 'box'
  | 'users'
  | 'chart'
  | 'gear'
  | 'send'
  | 'request'
  | 'plus'
  | 'dots'
  | 'bell'
  | 'home'
  | 'card'
  | 'user';

const iconPaths: Record<IconName, string> = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  box: 'M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10',
  users:
    'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2 .8 3 3 3 6',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1',
  send: 'M12 19V5M5 12l7-7 7 7',
  request: 'M12 5v14M5 12l7 7 7-7',
  plus: 'M12 5v14M5 12h14',
  dots: 'M6 12h.01M12 12h.01M18 12h.01',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  home: 'M4 11l8-7 8 7v9H4z',
  card: 'M3 6h18v12H3zM3 10h18',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8',
};

function Icon({ name, className }: { name: IconName; className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

const navIcons: IconName[] = ['grid', 'bag', 'box', 'users', 'chart', 'gear'];
const statusTone: Record<string, string> = {
  Paid: 'bg-[#5b8dfb1f] text-primary',
  Shipped: 'bg-[#f3d06140] text-[#8a6a00]',
  Pending: 'bg-[#e434681a] text-accent-rose',
};

function DashboardScreen() {
  const d = heroMockups.dashboard;
  const max = Math.max(...d.chartValues);
  const points = d.chartValues
    .map((value, index) => `${40 + index * 80},${250 - (value / max) * 210}`)
    .join(' ');
  return (
    <div className="flex size-full bg-[#f5f7fb] text-[16px] text-ink">
      <div className="flex w-[240px] shrink-0 flex-col bg-ink px-[20px] py-[28px] text-white">
        <div className="mb-[36px] flex items-center gap-[10px] px-[8px] text-[22px] font-bold">
          <span className="size-[28px] rounded-[8px] bg-secondary" />
          {d.brand}
        </div>
        <div className="flex flex-col gap-[6px]">
          {d.nav.map((item, index) => (
            <span
              key={item}
              className={
                index === 0
                  ? 'flex items-center gap-[12px] rounded-[10px] bg-[#ffffff1f] px-[12px] py-[11px] font-semibold'
                  : 'flex items-center gap-[12px] rounded-[10px] px-[12px] py-[11px] text-[#ffffffb3]'
              }
            >
              <Icon name={navIcons[index] ?? 'grid'} className="size-[20px]" />
              {item}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-[10px] rounded-[12px] bg-[#ffffff14] p-[12px]">
          <span className="grid size-[36px] place-items-center rounded-full bg-accent-warm text-[14px] font-bold text-ink">
            LA
          </span>
          <span className="text-[14px] leading-[18px]">
            <strong className="block">Lumen Admin</strong>
            <span className="text-[#ffffff99]">Store owner</span>
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[24px] p-[32px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="m-0 text-[30px] leading-[36px] font-bold">{d.title}</p>
            <p className="m-0 mt-[4px] text-[16px] text-[#6d7583]">{d.subtitle}</p>
          </div>
          <div className="flex items-center gap-[12px]">
            <span className="rounded-[10px] border border-[#e1e5ec] bg-white px-[16px] py-[10px] text-[15px] font-medium">
              {d.range}
            </span>
            <span className="rounded-[10px] bg-primary px-[18px] py-[10px] text-[15px] font-semibold text-white">
              {d.action}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-[20px]">
          {d.kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-[16px] border border-[#e6e9ef] bg-white p-[22px]"
            >
              <p className="m-0 text-[15px] text-[#6d7583]">{kpi.label}</p>
              <div className="mt-[10px] flex items-end justify-between">
                <span className="text-[30px] leading-[34px] font-bold tracking-[-0.5px]">
                  {kpi.value}
                </span>
                <span className="rounded-full bg-[#5b8dfb1f] px-[10px] py-[4px] text-[14px] font-semibold text-primary">
                  {kpi.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-[1.35fr_1fr] gap-[20px]">
          <div className="flex flex-col rounded-[16px] border border-[#e6e9ef] bg-white p-[22px]">
            <div className="flex items-center justify-between">
              <p className="m-0 text-[18px] font-semibold">{d.chartTitle}</p>
              <span className="text-[14px] text-[#6d7583]">SAR</span>
            </div>
            <p className="m-0 mt-[10px] text-[28px] leading-[32px] font-bold tracking-[-0.5px]">
              {d.kpis[0]?.value}{' '}
              <span className="text-[14px] font-medium tracking-normal text-[#6d7583]">
                this week
              </span>
            </p>
            <svg className="mt-auto block w-full" viewBox="0 0 560 300" fill="none">
              {[40, 92, 145, 197, 250].map((y) => (
                <path key={y} d={`M20 ${y}H545`} stroke="#eef1f5" strokeWidth="2" />
              ))}
              <polygon points={`40,250 ${points} 520,250`} fill="#5b8dfb" opacity=".12" />
              <polyline
                points={points}
                stroke="#5b8dfb"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx="520" cy="40" r="8" fill="#f8fa55" stroke="#17284f" strokeWidth="3" />
              {d.chartDays.map((day, index) => (
                <text
                  key={day}
                  x={40 + index * 80}
                  y="285"
                  textAnchor="middle"
                  fontSize="15"
                  fill="#8a93a3"
                >
                  {day}
                </text>
              ))}
            </svg>
          </div>
          <div className="rounded-[16px] border border-[#e6e9ef] bg-white p-[22px]">
            <p className="m-0 mb-[14px] text-[18px] font-semibold">{d.ordersTitle}</p>
            {d.orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-t border-[#eef1f5] py-[14px] text-[15px]"
              >
                <span>
                  <strong className="block">{order.name}</strong>
                  <span className="text-[#8a93a3]">{order.id}</span>
                </span>
                <span className="flex items-center gap-[12px]">
                  <span
                    className={`rounded-full px-[10px] py-[4px] text-[13px] font-semibold ${statusTone[order.status] ?? ''}`}
                  >
                    {order.status}
                  </span>
                  <strong>{order.total}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A straight, front-facing laptop showing the dashboard concept. */
export function LaptopStudy() {
  return (
    <div className="w-[500px]">
      <div className="ms-[38px]">
        <FrameName>{heroMockups.dashboard.frame}</FrameName>
      </div>
      <div className="mx-auto w-[424px] rounded-t-[18px] bg-[#c9ced6] p-[2px] pb-0">
        <div className="relative rounded-t-[16px] bg-[#111216] px-[12px] pt-[14px] pb-[12px]">
          <span className="absolute top-[5px] left-1/2 size-[4px] -translate-x-1/2 rounded-full bg-[#2c2f36]" />
          <div className="relative h-[250px] w-[400px] overflow-hidden rounded-[3px] bg-white">
            <div className="absolute top-0 left-0 h-[800px] w-[1280px] origin-top-left [transform:scale(0.3125)]">
              <DashboardScreen />
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-[13px] w-[500px] rounded-t-[3px] rounded-b-[12px] bg-[linear-gradient(#e8ebef,#b9bfc8)]">
        <span className="absolute top-0 left-1/2 h-[5px] w-[84px] -translate-x-1/2 rounded-b-[6px] bg-[#c7ccd3]" />
      </div>
      <div className="mx-auto h-[6px] w-[460px] rounded-b-[50%] bg-[linear-gradient(#17284f1f,transparent)]" />
    </div>
  );
}

function WalletScreen() {
  const w = heroMockups.wallet;
  const actionIcons: IconName[] = ['send', 'request', 'plus', 'dots'];
  const tabIcons: IconName[] = ['home', 'card', 'chart', 'user'];
  const avatarTone = [
    'bg-accent-warm text-ink',
    'bg-primary text-white',
    'bg-accent-rose text-white',
  ];
  return (
    <div className="flex size-full flex-col bg-[#f7f8fb] text-[16px] text-ink">
      <div className="flex h-[54px] shrink-0 items-end justify-between px-[32px] pb-[6px] text-[16px] font-semibold">
        <span>9:41</span>
        <span className="flex items-center gap-[6px]">
          <span className="flex items-end gap-[2px]">
            {['h-[6px]', 'h-[9px]', 'h-[12px]', 'h-[15px]'].map((height) => (
              <span key={height} className={`w-[3px] rounded-[1px] bg-ink ${height}`} />
            ))}
          </span>
          <span className="h-[12px] w-[24px] rounded-[4px] border-2 border-ink p-[1px]">
            <span className="block h-full w-[70%] rounded-[1px] bg-ink" />
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col px-[22px] pt-[14px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
            <span className="grid size-[44px] place-items-center rounded-full bg-secondary text-[16px] font-bold">
              S
            </span>
            <span className="leading-[20px]">
              <span className="block text-[14px] text-[#6d7583]">{w.greeting}</span>
              <strong className="text-[18px]">{w.user}</strong>
            </span>
          </div>
          <span className="grid size-[44px] place-items-center rounded-full bg-white">
            <Icon name="bell" className="size-[22px]" />
          </span>
        </div>
        <div className="relative mt-[22px] overflow-hidden rounded-[26px] bg-primary p-[22px] text-white">
          <span className="absolute -top-[50px] -right-[40px] size-[120px] rounded-full bg-secondary" />
          <span className="absolute -right-[30px] -bottom-[70px] size-[110px] rounded-full bg-accent-rose" />
          <p className="relative m-0 text-[15px] text-[#ffffffcc]">{w.balanceLabel}</p>
          <p className="relative m-0 mt-[6px] text-[34px] leading-[40px] font-bold tracking-[-0.5px]">
            {w.balance}
          </p>
          <p className="relative m-0 mt-[26px] text-[15px] font-medium tracking-[1px]">{w.card}</p>
        </div>
        <div className="mt-[22px] grid grid-cols-4 gap-[10px]">
          {w.actions.map((action, index) => (
            <span
              key={action}
              className="flex flex-col items-center gap-[8px] text-[14px] font-medium"
            >
              <span className="grid size-[58px] place-items-center rounded-[18px] bg-white">
                <Icon name={actionIcons[index] ?? 'dots'} className="size-[24px]" />
              </span>
              {action}
            </span>
          ))}
        </div>
        <div className="mt-[26px] flex items-center justify-between">
          <p className="m-0 text-[19px] font-bold">{w.activityTitle}</p>
          <span className="text-[14px] font-semibold text-primary">See all</span>
        </div>
        <div className="mt-[12px] flex flex-col gap-[10px]">
          {w.activity.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center gap-[14px] rounded-[18px] bg-white p-[14px]"
            >
              <span
                className={`grid size-[46px] place-items-center rounded-[14px] text-[17px] font-bold ${avatarTone[index] ?? ''}`}
              >
                {item.name.slice(0, 1)}
              </span>
              <span className="flex-1 leading-[20px]">
                <strong className="block text-[16px]">{item.name}</strong>
                <span className="text-[14px] text-[#8a93a3]">{item.note}</span>
              </span>
              <strong
                className={item.amount.startsWith('+') ? 'text-[16px] text-primary' : 'text-[16px]'}
              >
                {item.amount}
              </strong>
            </div>
          ))}
        </div>
      </div>
      <div className="flex h-[96px] shrink-0 items-start justify-around border-t border-[#e9ecf2] bg-white pt-[12px]">
        {w.tabs.map((tab, index) => (
          <span
            key={tab}
            className={
              index === 0
                ? 'flex flex-col items-center gap-[4px] text-[12px] font-semibold text-primary'
                : 'flex flex-col items-center gap-[4px] text-[12px] text-[#8a93a3]'
            }
          >
            <Icon name={tabIcons[index] ?? 'home'} className="size-[24px]" />
            {tab}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A straight, front-facing phone showing the wallet concept. */
export function PhoneStudy() {
  return (
    <div className="w-[170px]">
      <FrameName>{heroMockups.wallet.frame}</FrameName>
      <div className="rounded-[32px] bg-[#c9ced6] p-[2px]">
        <div className="rounded-[30px] bg-[#111216] p-[5px]">
          <div className="relative h-[342px] w-[158px] overflow-hidden rounded-[25px] bg-white">
            <div className="absolute top-0 left-0 h-[844px] w-[390px] origin-top-left [transform:scale(0.405)]">
              <WalletScreen />
            </div>
            <span className="absolute top-[6px] left-1/2 h-[12px] w-[44px] -translate-x-1/2 rounded-full bg-[#111216]" />
            <span className="absolute bottom-[4px] left-1/2 h-[3px] w-[52px] -translate-x-1/2 rounded-full bg-ink" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** A web sign-up screen, as one frame on the canvas. */
export function SignupStudy() {
  const s = heroMockups.signup;
  return (
    <div className="w-[220px]">
      <FrameName>{s.frame}</FrameName>
      <div className={`rounded-[12px] bg-white p-[16px] text-ink ${cardShadow}`}>
        <span className="block size-[18px] rounded-[5px] bg-primary" />
        <p className="m-0 mt-[12px] text-[15px] leading-[18px] font-bold">{s.title}</p>
        <p className="m-0 mt-[3px] text-[10px] text-[#6d7583]">{s.subtitle}</p>
        <p className="m-0 mt-[12px] mb-[4px] text-[9px] font-semibold">Email</p>
        <p className="m-0 rounded-[7px] border border-[#dfe3ea] px-[9px] py-[6px] text-[10px]">
          {s.email}
        </p>
        <p className="m-0 mt-[8px] mb-[4px] text-[9px] font-semibold">Password</p>
        <p className="m-0 rounded-[7px] border-[1.5px] border-primary px-[9px] py-[6px] text-[10px] tracking-[1px]">
          {s.password}
        </p>
        <p className="m-0 mt-[12px] rounded-[7px] bg-ink py-[7px] text-center text-[10px] font-semibold text-white">
          {s.cta}
        </p>
        <p className="m-0 mt-[6px] rounded-[7px] border border-[#dfe3ea] py-[6px] text-center text-[10px] font-medium">
          {s.alternative}
        </p>
      </div>
    </div>
  );
}

/** Color styles and a type scale, as they would sit on a design-system page. */
export function TokensStudy() {
  const t = heroMockups.tokens;
  return (
    <div className="w-[312px]">
      <FrameName>{t.frame}</FrameName>
      <div className={`rounded-[12px] bg-white p-[16px] text-ink ${cardShadow}`}>
        <div className="grid grid-cols-5 gap-[8px]">
          {t.colors.map((color) => (
            <div key={color.hex}>
              <span
                className={`block h-[40px] rounded-[8px] border border-[#17284f14] ${color.fill}`}
              />
              <p className="m-0 mt-[5px] text-[9px] leading-[11px] font-semibold">{color.name}</p>
              <p className="m-0 text-[8px] leading-[10px] text-[#8a93a3]">{color.hex}</p>
            </div>
          ))}
        </div>
        <div className="mt-[12px] flex flex-col gap-[7px] border-t border-[#eef1f5] pt-[10px]">
          {t.type.map((style, index) => (
            <div key={style.name} className="flex items-baseline justify-between gap-[10px]">
              <span className="shrink-0 text-[8px] leading-[10px] text-[#8a93a3]">
                <strong className="block text-ink">{style.name}</strong>
                {style.spec}
              </span>
              <span
                className={
                  index === 0
                    ? 'truncate text-[19px] leading-[22px] font-bold tracking-[-0.4px]'
                    : index === 1
                      ? 'truncate text-[13px] leading-[16px] font-semibold'
                      : 'truncate text-[10px] leading-[13px]'
                }
              >
                {style.sample}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A checkout user flow with one decision point and its two branches. */
export function FlowStudy() {
  const [cart, decide, pay, signIn, done] = heroMockups.flow.steps;
  const arrow = { fill: 'none', stroke: 'var(--ink)', strokeWidth: 1.2 } as const;
  return (
    <div className="w-[230px]">
      <FrameName>{heroMockups.flow.frame}</FrameName>
      <div className={`rounded-[12px] bg-white p-[8px] ${cardShadow}`}>
        <svg className="block h-auto w-full" viewBox="0 0 214 118" aria-hidden="true">
          <g fontSize="8" fontWeight="600" fill="var(--ink)" textAnchor="middle">
            <rect x="4" y="18" width="40" height="22" rx="11" fill="var(--primary)" />
            <text x="24" y="32" fill="white">
              {cart}
            </text>
            <path d="M44 29H58" {...arrow} />
            <path d="m55 26 4 3-4 3" {...arrow} />
            <path d="M84 8 108 29 84 50 60 29Z" fill="var(--secondary)" stroke="var(--ink)" />
            <text x="84" y="32" fontSize="7">
              {decide}
            </text>
            <text x="124" y="24" fontSize="6.5" fill="#6d7583">
              Yes
            </text>
            <path d="M108 29H140" {...arrow} />
            <path d="m137 26 4 3-4 3" {...arrow} />
            <rect x="141" y="18" width="46" height="22" rx="5" fill="white" stroke="var(--ink)" />
            <text x="164" y="32">
              {pay}
            </text>
            <text x="92" y="64" fontSize="6.5" fill="#6d7583" textAnchor="start">
              No
            </text>
            <path d="M84 50V86" {...arrow} strokeDasharray="3 2" />
            <path d="m81 83 3 4 3-4" {...arrow} />
            <rect
              x="60"
              y="88"
              width="48"
              height="22"
              rx="5"
              fill="#e434681a"
              stroke="var(--accent-rose)"
            />
            <text x="84" y="102" fill="var(--accent-rose)">
              {signIn}
            </text>
            <path d="M108 99H164V40" {...arrow} />
            <path d="m161 43 3-4 3 4" {...arrow} />
            <path d="M187 29H196V62" {...arrow} />
            <path d="m193 59 3 4 3-4" {...arrow} />
            <rect x="178" y="64" width="34" height="22" rx="11" fill="var(--ink)" />
            <text x="195" y="78" fill="white">
              {done}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

export type HeroTool = 'figma' | 'notion' | 'framer' | 'xd' | 'miro';

// Official marks from svgl (figma, notion, adobe-xd, framer) and Simple Icons (miro),
// kept in their brand colours. See docs/VALIDATION.md for sources.
const toolLogos: Record<HeroTool, { src: string; width: number; height: number }> = {
  figma: { src: '/brand/figma.svg', width: 54, height: 80 },
  notion: { src: '/brand/notion.svg', width: 256, height: 268 },
  framer: { src: '/brand/framer.svg', width: 256, height: 384 },
  xd: { src: '/brand/adobe-xd.svg', width: 240, height: 234 },
  miro: { src: '/brand/miro.svg', width: 48, height: 48 },
};

export function ToolMark({ kind }: { kind: HeroTool }) {
  const logo = toolLogos[kind];
  return (
    <Image
      className="block h-full w-auto max-w-full object-contain"
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt=""
      draggable={false}
    />
  );
}
