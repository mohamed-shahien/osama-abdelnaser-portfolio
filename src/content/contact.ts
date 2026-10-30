// The contact page's copy. The number and address are the ones the site already
// links (footer WhatsApp, hero email); the cities are the "Cairo · Riyadh · Remote"
// line from the master brief. No reply time is promised.
export const contactContent = {
  whatsappNumber: '201223165082',
  email: 'osamaabdelnaser18@gmail.com',
  kicker: 'Book a meeting',
  headline: 'Start with a page, then we talk.',
  intro:
    'Three short questions about what you are building. I read every brief myself and reply to set up our meeting.',
  availability: 'Cairo · Riyadh · Remote',
  chat: {
    lead: 'A quick question first?',
    label: 'Chat on WhatsApp',
    note: 'Before we book anything',
    text: 'Hi Osama, I saw your portfolio and have a quick question before we book a meeting.',
  },
  questions: [
    {
      id: 'project',
      tab: 'Project',
      title: 'What are we designing?',
      hint: 'Circle all that apply.',
      options: [
        'Product design',
        'UI/UX & design system',
        'Mobile app',
        'Website / landing page',
        'Salla, Zid or Shopify store',
        'Not sure yet',
      ],
      multiple: true,
    },
    {
      id: 'stage',
      tab: 'Stage',
      title: 'Where is the product right now?',
      hint: "Pick the closest fit. Skip it if you'd rather talk.",
      options: [
        'New product from scratch',
        'Redesigning an existing product',
        'Scaling with a design system',
        'Exploring an idea',
      ],
      optional: true,
    },
    {
      id: 'timing',
      tab: 'Timing',
      title: 'When would you like to start?',
      hint: 'Pick the closest.',
      options: ['As soon as possible', 'In 1 to 3 months', 'Later this year', 'Just exploring'],
    },
  ],
  details: {
    title: "Last page. Who's writing?",
    hint: 'So I know who to get back to.',
    messagePlaceholder: 'Links, deadlines, or anything we should cover in our meeting',
  },
  submitLabel: 'Send via WhatsApp',
  pendingLabel: 'Opening WhatsApp',
  stampLabel: 'Sent',
  nextSteps: [
    'You send the brief from WhatsApp.',
    'I read it and reply to set a time.',
    'We meet, agree on goals and scope, and start.',
  ],
  copy: {
    repliesWithin: 'Read by Osama, personally',
    pages: '{total} short pages, about two minutes. {reader} reads every brief personally.',
    receiptLine: '{reader} will reply to {email}.',
    errorSend: "That didn't open. Try again, or message me on WhatsApp.",
  },
  receipt:
    'Your brief is ready in WhatsApp. Press send there, and I will reply to set our meeting.',
  message: {
    opening: 'Hi Osama, I would like to book a meeting.',
    reference: 'Ref',
    name: 'Name',
    email: 'Email',
    notes: 'Notes',
  },
} as const;
