import { NotFoundContent } from '../content.models';

export const NOT_FOUND_CONTENT: NotFoundContent = {
  seo: { title: 'Page not found', description: 'The page you were looking for does not exist.' },
  heading: 'Page not found',
  body: 'The page you were looking for has moved or never existed.',
  cta: { label: 'Back to home', href: '/', variant: 'primary' },
};
