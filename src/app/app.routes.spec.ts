import { Type } from '@angular/core';
import { Route } from '@angular/router';
import { APP_PATHS, routes } from './app.routes';
import { SEO_DATA_KEY } from './core/seo/seo-title.strategy';

describe('routes', () => {
  it('declares every public path plus a wildcard', () => {
    const paths = routes.map((r) => r.path);
    for (const p of Object.values(APP_PATHS)) expect(paths).toContain(p);
    expect(paths[paths.length - 1]).toBe('**');
  });

  it('lazy-loads a standalone component for every route', async () => {
    for (const route of routes) {
      expect(route.loadComponent).withContext(String(route.path)).toBeDefined();
      const loaded = (await (route as Required<Pick<Route, 'loadComponent'>>).loadComponent()) as
        | Type<unknown>
        | { default: Type<unknown> };
      const cmp = 'default' in loaded ? loaded.default : loaded;
      expect(typeof cmp).toBe('function');
    }
  });

  it('attaches SEO metadata to every route', () => {
    for (const route of routes) {
      const seo = route.data?.[SEO_DATA_KEY] as { title?: unknown; description?: unknown } | undefined;
      expect(typeof seo?.title).withContext(String(route.path)).toBe('string');
      expect(typeof seo?.description).withContext(String(route.path)).toBe('string');
    }
  });
});

