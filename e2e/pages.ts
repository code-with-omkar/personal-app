/** Route inventory shared by e2e specs. `reference` is the folder name under /reference. */
export interface PageSpec {
  readonly path: string;
  readonly reference: string;
  readonly heading: RegExp;
}

export const PAGES: readonly PageSpec[] = [
  { path: '/', reference: 'home', heading: /headline/i },
  { path: '/about', reference: 'about', heading: /^about$/i },
  { path: '/contact', reference: 'contact', heading: /^contact$/i },
];

export const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
] as const;
