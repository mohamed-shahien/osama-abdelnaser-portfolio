// Sample UI copy for the hero's device mockups. These are illustrative concept
// screens, not Osama's client work: brands, people and figures are fictional.
export const heroMockups = {
  dashboard: {
    frame: 'Dashboard — Desktop',
    brand: 'Lumen',
    nav: ['Overview', 'Orders', 'Products', 'Customers', 'Analytics', 'Settings'],
    title: 'Overview',
    subtitle: 'Store performance this week',
    range: 'Last 7 days',
    action: 'Export',
    kpis: [
      { label: 'Revenue', value: 'SAR 48,250', delta: '+12.4%' },
      { label: 'Orders', value: '1,284', delta: '+8.1%' },
      { label: 'Conversion', value: '3.8%', delta: '+0.6%' },
    ],
    chartTitle: 'Revenue',
    chartDays: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    chartValues: [42, 55, 48, 66, 61, 78, 92],
    ordersTitle: 'Recent orders',
    orders: [
      { id: '#1042', name: 'Nora Saleh', status: 'Paid', total: 'SAR 320' },
      { id: '#1041', name: 'Omar Fathy', status: 'Shipped', total: 'SAR 1,180' },
      { id: '#1040', name: 'Lina Haddad', status: 'Pending', total: 'SAR 95' },
      { id: '#1039', name: 'Youssef Ali', status: 'Paid', total: 'SAR 760' },
      { id: '#1038', name: 'Mariam Kamel', status: 'Shipped', total: 'SAR 410' },
    ],
  },
  wallet: {
    frame: 'Wallet — iOS',
    greeting: 'Good morning,',
    user: 'Sara',
    balanceLabel: 'Total balance',
    balance: 'SAR 12,480.50',
    card: '•••• 4821',
    actions: ['Send', 'Request', 'Top up', 'More'],
    activityTitle: 'Recent activity',
    activity: [
      { name: 'Coffee Lab', note: 'Today, 9:41', amount: '−SAR 18.00' },
      { name: 'Salary', note: 'Yesterday', amount: '+SAR 9,500' },
      { name: 'Bloom Market', note: 'Mon, 14:20', amount: '−SAR 240.00' },
    ],
    tabs: ['Home', 'Cards', 'Stats', 'Profile'],
  },
  signup: {
    frame: 'Sign up — Web',
    title: 'Create your account',
    subtitle: 'Start your free trial today.',
    email: 'sara@studio.co',
    password: '••••••••••',
    cta: 'Get started',
    alternative: 'Continue with Google',
  },
  tokens: {
    frame: 'Design tokens',
    colors: [
      { name: 'Primary', hex: '#5B8DFB', fill: 'bg-primary' },
      { name: 'Sun', hex: '#F8FA55', fill: 'bg-secondary' },
      { name: 'Honey', hex: '#F3D061', fill: 'bg-accent-warm' },
      { name: 'Rose', hex: '#E43468', fill: 'bg-accent-rose' },
      { name: 'Ink', hex: '#17284F', fill: 'bg-ink' },
    ],
    type: [
      { name: 'Display', spec: '48 / Bold', sample: 'Clear by design' },
      { name: 'Heading', spec: '24 / Semibold', sample: 'Simple journeys' },
      { name: 'Body', spec: '16 / Regular', sample: 'Readable, calm, consistent.' },
    ],
  },
  flow: {
    frame: 'User flow — Checkout',
    steps: ['Cart', 'Signed in?', 'Payment', 'Sign in', 'Done'],
  },
} as const;
