import { SiteContent } from './content.models';

// PLACEHOLDER — replace with the Airo copy once captured.
export const SITE_CONTENT: SiteContent = {
  brand: { name: 'Personal App', tagline: 'Built with care' },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  footer: {
    blurb: 'A short line about who you are and what this site is for.',
    columns: [
      {
        heading: 'Site',
        links: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        heading: 'Elsewhere',
        links: [{ label: 'GitHub', href: 'https://github.com/code-with-omkar' }],
      },
    ],
    legal: 'All rights reserved.',
  },
};
