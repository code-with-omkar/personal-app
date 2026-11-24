import { RenderMode, ServerRoute } from '@angular/ssr';
import { APP_PATHS } from './app.routes';

/** Every known route is prerendered to static HTML at build time (SSG). */
export const serverRoutes: ServerRoute[] = [
  ...Object.values(APP_PATHS).map((path) => ({ path, renderMode: RenderMode.Prerender }) as const),
  // Unknown URLs fall back to the client-rendered app shell, which shows the 404 page.
  { path: '**', renderMode: RenderMode.Client },
];
