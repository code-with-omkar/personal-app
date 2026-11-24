import { HomeContent } from '../content.models';

// PLACEHOLDER — replace with the Airo copy once captured.
export const HOME_CONTENT: HomeContent = {
  seo: {
    title: 'Home',
    description: 'Placeholder home page description.',
  },
  hero: {
    eyebrow: 'Welcome',
    heading: 'A clear headline that says what you do',
    subheading:
      'One or two sentences of supporting copy. This text is placeholder content until the design reference is captured.',
    ctas: [
      { label: 'Get in touch', href: '/contact', variant: 'primary' },
      { label: 'Learn more', href: '/about', variant: 'secondary' },
    ],
  },
  features: {
    heading: 'What you get',
    intro: 'Three short value propositions, each backed by a sentence.',
    items: [
      { id: 'fast', icon: '⚡', title: 'Fast', body: 'Prerendered pages load instantly and rank well.' },
      { id: 'reliable', icon: '🛡️', title: 'Reliable', body: 'Strictly typed, tested, and built on Angular.' },
      { id: 'flexible', icon: '🧩', title: 'Flexible', body: 'Content lives in data files, separate from components.' },
    ],
  },
  callout: {
    heading: 'Ready to start?',
    body: 'A closing call to action that sends visitors to the contact page.',
    cta: { label: 'Contact', href: '/contact', variant: 'primary' },
  },
};
