import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { SITE_CONTENT, SeoMeta } from '../../content';

/** Route `data` key holding the page's {@link SeoMeta}. */
export const SEO_DATA_KEY = 'seo' as const;

/**
 * Sets `<title>` and `<meta name="description">` from route data on every
 * navigation, including during prerender, so each static page ships its own tags.
 */
@Injectable({ providedIn: 'root' })
export class SeoTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const seo = this.deepestSeo(snapshot.root);
    const brand = SITE_CONTENT.brand.name;
    const pageTitle = seo?.title ?? this.buildTitle(snapshot);

    this.title.setTitle(pageTitle ? `${pageTitle} · ${brand}` : brand);

    if (seo) {
      this.meta.updateTag({ name: 'description', content: seo.description });
      this.meta.updateTag({ property: 'og:title', content: seo.title });
      this.meta.updateTag({ property: 'og:description', content: seo.description });
    }
  }

  private deepestSeo(route: ActivatedRouteSnapshot): SeoMeta | undefined {
    let current: ActivatedRouteSnapshot | null = route;
    let seo: SeoMeta | undefined;
    while (current) {
      const candidate: unknown = current.data[SEO_DATA_KEY];
      if (isSeoMeta(candidate)) seo = candidate;
      current = current.firstChild;
    }
    return seo;
  }
}

function isSeoMeta(value: unknown): value is SeoMeta {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>)['title'] === 'string' &&
    typeof (value as Record<string, unknown>)['description'] === 'string'
  );
}
