/** `true` for router paths (`/about`), `false` for absolute/protocol URLs. */
export function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}
