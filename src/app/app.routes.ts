import { Routes } from '@angular/router';
import { ABOUT_CONTENT, CONTACT_CONTENT, HOME_CONTENT, NOT_FOUND_CONTENT } from './content';
import { SEO_DATA_KEY } from './core/seo/seo-title.strategy';
import { provideContactGateway } from './features/contact/data/contact.gateway';

/** Public paths, also consumed by e2e and the prerender list. */
export const APP_PATHS = {
  home: '',
  about: 'about',
  contact: 'contact',
} as const;

export const routes: Routes = [
  {
    path: APP_PATHS.home,
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home'),
    data: { [SEO_DATA_KEY]: HOME_CONTENT.seo },
  },
  {
    path: APP_PATHS.about,
    loadComponent: () => import('./features/about/about'),
    data: { [SEO_DATA_KEY]: ABOUT_CONTENT.seo },
  },
  {
    path: APP_PATHS.contact,
    loadComponent: () => import('./features/contact/contact'),
    providers: [provideContactGateway()],
    data: { [SEO_DATA_KEY]: CONTACT_CONTENT.seo },
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found'),
    data: { [SEO_DATA_KEY]: NOT_FOUND_CONTENT.seo },
  },
];
