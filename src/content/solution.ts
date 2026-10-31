// Copy for the "key" section that follows the hero. The key turns, the gate
// opens, and scroll walks one brief through ten stages inside Osama's Figma
// file, where a developer and the client work with him in real time. The brief,
// people, comments, products and prices are an illustrative scenario of the
// process, not client work or measured results.

export const solutionContent = {
  label: 'How a designer and a developer turn a brief into a solution',
  // The key screen in front of the file: one face, and words that open onto it.
  key: {
    face: '"Space Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif',
    greeting: 'every challenge needs a',
    word: 'solution',
    tags: ['#brief', '#figma', '#handoff', '#shipped'],
    aboutLabel: 'inside/',
    about: ['one brief, one file,', 'designer + developer,', 'one solution.'],
    links: ['Drafts / Checkout.fig', 'Osama · Developer · Client'],
    signature: 'osama+dev',
    labels: {
      load: 'Opening Checkout.fig',
      ready: 'File ready',
      unlocking: 'Opening the file',
      hint: 'Scroll to turn the key',
    },
  },
  eyebrow: 'Osama × Developer',
  brief: 'Customers leave our checkout on mobile.',
  goal: 'Goal: fewer people leave at payment.',
  tags: ['Mobile', 'Checkout', 'Small screens'],
  designer: { role: 'Osama · UI/UX Designer', with: 'with Developer & Client' },
  stages: [
    {
      id: 'idle',
      title: 'A brief lands.',
      line: 'The client drops one problem into the file. Nobody draws anything yet.',
      designer: 'Reading the brief',
      developer: 'Joining the file',
    },
    {
      id: 'listening',
      title: 'Both listen first.',
      line: 'What hurts, for whom, and why — heard together, written down once.',
      designer: 'Collecting the brief',
      developer: 'Noting constraints',
    },
    {
      id: 'thinking',
      title: 'Mapping the problem, together.',
      line: 'Osama maps the journey. The developer maps the system behind it. They talk it through.',
      designer: 'Mapping the journey',
      developer: 'Mapping the system',
    },
    {
      id: 'reasoning',
      title: 'One clear decision.',
      line: 'Two options on the table. They pick the path people understand and code can carry.',
      designer: 'Comparing two options',
      developer: 'Weighing the build',
    },
    {
      id: 'tool-call',
      title: 'Frames, not opinions.',
      line: 'A real frame with auto layout, named the way the code will name it.',
      designer: 'Drawing the frame',
      developer: 'Watching the structure',
    },
    {
      id: 'tool-result',
      title: 'The screen takes shape.',
      line: 'Content, components and one reusable PayButton land on the canvas.',
      designer: 'Building components',
      developer: 'Matching components',
    },
    {
      id: 'streaming',
      title: 'Design flows into code.',
      line: 'Spacing, radius and colors go straight from the file into the build.',
      designer: 'Handing off specs',
      developer: 'Inspecting tokens',
    },
    {
      id: 'waiting-approval',
      title: 'Waiting for a yes.',
      line: 'The client opens the file and reviews the flow in context.',
      designer: 'Prototype shared',
      developer: 'PR in review',
    },
    {
      id: 'error',
      title: 'Something breaks.',
      line: 'On a small phone the long Pay label overflows the button. Caught in the file, not in production.',
      designer: 'Fixing the small frame',
      developer: '360px test failing',
    },
    {
      id: 'done',
      title: 'The solution, shipped.',
      line: 'One flow, designed and built as one — what the client actually needed.',
      designer: 'Approved',
      developer: 'Deployed',
    },
  ],
  notes: {
    osama: ['People drop at payment', 'Mobile first', 'Small phones too'],
    developer: ['Pay page loads slowly', 'Three API calls at Pay', 'Must fit 360px'],
    question: 'Why do they leave at Pay?',
  },
  persona: { title: 'Shopper on a phone', goal: 'Pay fast, on any phone.' },
  journey: [
    { step: 'Cart', feel: 'easy' },
    { step: 'Details', feel: 'long form' },
    { step: 'Shipping', feel: 'fine' },
    { step: 'Pay', feel: 'waiting…' },
    { step: 'Done', feel: '' },
  ],
  system: {
    screen: 'Checkout screen',
    api: 'Checkout API',
    services: ['Cart service', 'Shipping rates', 'Payment gateway'],
    problem: '3 calls, one after another',
    fix: '1 batched call',
  },
  options: [
    {
      name: 'A · Keep three steps',
      points: ['+ Familiar layout', '− Three loads', '− More taps on a phone'],
    },
    {
      name: 'B · One page',
      points: ['+ One load', '+ Fewer taps', '+ Scales to small phones'],
    },
  ],
  screen: {
    title: 'Checkout',
    step: '1 page',
    items: [
      { name: 'Linen shirt', meta: 'Sand · M', price: 'SAR 189', thumb: '👕' },
      { name: 'Canvas tote', meta: 'Natural', price: 'SAR 75', thumb: '👜' },
    ],
    delivery: 'Delivery · Tomorrow',
    methods: ['Apple Pay', 'Card'],
    total: 'SAR 264',
    totalLabel: 'Total',
    method: 'Apple Pay',
    cta: 'Pay now',
    ctaLoading: 'Paying…',
  },
  // The same screen on a 360px phone, where a long label breaks the button.
  small: {
    title: 'Checkout',
    step: '360px',
    items: [
      { name: 'Linen shirt', meta: 'Sand · M', price: 'SAR 189', thumb: '👕' },
      { name: 'Canvas tote', meta: 'Natural', price: 'SAR 75', thumb: '👜' },
    ],
    delivery: 'Delivery · Tomorrow',
    methods: ['Apple Pay', 'Card'],
    total: 'SAR 264',
    totalLabel: 'Total',
    method: 'Apple Pay',
    ctaLong: 'Pay securely now with Apple Pay',
    cta: 'Pay now',
  },
  figma: {
    file: 'Checkout',
    project: 'Drafts',
    page: 'Checkout flow',
    frame: 'iPhone 16 — Checkout',
    frameSmall: 'Small phone — Checkout 360',
    size: '393 × 852',
  },
  people: {
    osama: { name: 'Osama', initial: 'O' },
    developer: { name: 'Developer', initial: 'D' },
    client: { name: 'Client', initial: 'C' },
  },
  // Figma comment threads, in the order they are posted on the canvas.
  comments: {
    brief: [
      { who: 'client', text: 'Customers leave our checkout on mobile. Can you two take a look?' },
    ],
    mapping: [
      { who: 'osama', text: 'Where exactly does it slow down?' },
      { who: 'developer', text: 'Pay waits on three API calls, one after another.' },
      { who: 'osama', text: 'So they stare at a spinner, then leave.' },
      { who: 'developer', text: 'I can batch them into one. Can you cut a step?' },
    ],
    screens: [{ who: 'developer', text: 'Three screens means three loads on a slow network.' }],
    result: [
      { who: 'osama', text: 'PayButton is a component now. One source of truth 🧩' },
      { who: 'developer', text: "Finally, a button I don't rebuild 14 times 😅" },
      { who: 'osama', text: 'It was 15. I counted 😏' },
    ],
    tokens: [
      { who: 'developer', text: 'Pulled the tokens: gap 16, radius 14. Streaming into code ⚡' },
      { who: 'osama', text: 'Variables, not magic numbers… right? 👀' },
      { who: 'developer', text: 'Magic numbers retired. They live on a beach now 🏖️' },
    ],
    review: [
      { who: 'client', text: 'Looks clean. Ship it? 🚀' },
      { who: 'osama', text: 'One check first: the smallest phones 📱' },
      { who: 'developer', text: "Every time I say 'done', Osama finds an edge case 😂" },
    ],
    small: [
      { who: 'developer', text: 'Test fails at 360px 🔴 The Pay label overflows.' },
      { who: 'osama', text: 'Long label, small phone. Classic 🙈' },
      { who: 'developer', text: 'Just make the font tiny? 🤏' },
      { who: 'osama', text: "Don't you dare 😤 Hug width + a shorter label." },
    ],
    done: [
      { who: 'developer', text: 'Hug width fixed it. Deployed ✅ checkout is live.' },
      { who: 'client', text: 'That is exactly what we needed 🙌' },
      { who: 'osama', text: 'Designed and built as one 🤝 Next brief?' },
    ],
  },
  reactions: {
    result: ['😂 2', '🧩 1'],
    tokens: ['⚡ 2', '🏖️ 1'],
    review: ['😂 3', '👀 1'],
    done: ['🎉 3', '🔥 2', '🤝 1'],
  },
  // Dev Mode: the PayButton's code, streamed line by line from the file.
  code: {
    file: 'PayButton.tsx',
    lines: [
      '<Button',
      '  variant="pay"',
      '  gap={tokens.space[16]}',
      '  radius={tokens.radius[14]}',
      '  width="hug"',
      '>',
      "  {t('checkout.pay')}",
      '</Button>',
    ],
  },
  approval: {
    title: 'Waiting for approval',
    by: 'Client is reviewing',
    items: ['Prototype · 1 page', 'PR #42 · checks running'],
  },
  test: {
    name: 'checkout.small.spec',
    fail: '✕ 360px · label overflows',
    pass: '✓ 360px · passes',
  },
  live: 'Live · checkout v2',
  confetti: ['🎉', '✨', '🚀', '💛'],
  errorNote: 'Overflows at 360px',
} as const;
