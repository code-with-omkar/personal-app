/**
 * Content contracts. Components depend on these types only; content updates
 * from Airo change the data files in this folder, never the components.
 */

export interface Link {
  readonly label: string;
  /** Internal router path (starts with `/`) or absolute external URL. */
  readonly href: string;
}

export interface Cta extends Link {
  readonly variant: 'primary' | 'secondary';
}

export interface SeoMeta {
  readonly title: string;
  readonly description: string;
}

export interface SiteContent {
  readonly brand: { readonly name: string; readonly tagline: string };
  readonly nav: readonly Link[];
  readonly footer: {
    readonly blurb: string;
    readonly columns: readonly { readonly heading: string; readonly links: readonly Link[] }[];
    readonly legal: string;
  };
}

export interface Feature {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  /** Emoji or short glyph shown as the card icon. */
  readonly icon: string;
}

export interface HomeContent {
  readonly seo: SeoMeta;
  readonly hero: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly subheading: string;
    readonly ctas: readonly Cta[];
  };
  readonly features: {
    readonly heading: string;
    readonly intro: string;
    readonly items: readonly Feature[];
  };
  readonly callout: {
    readonly heading: string;
    readonly body: string;
    readonly cta: Cta;
  };
}

export interface Milestone {
  readonly year: string;
  readonly title: string;
  readonly body: string;
}

export interface AboutContent {
  readonly seo: SeoMeta;
  readonly heading: string;
  readonly lead: string;
  readonly paragraphs: readonly string[];
  readonly milestones: readonly Milestone[];
}

export interface ContactContent {
  readonly seo: SeoMeta;
  readonly heading: string;
  readonly lead: string;
  /** Recipient used for the mailto fallback when no endpoint is configured. */
  readonly email: string;
  /** POST endpoint receiving JSON `{ name, email, message }`; `null` → mailto fallback. */
  readonly endpoint: string | null;
  readonly labels: {
    readonly name: string;
    readonly email: string;
    readonly message: string;
    readonly submit: string;
    readonly sending: string;
  };
  readonly messages: {
    readonly success: string;
    readonly error: string;
    readonly required: string;
    readonly invalidEmail: string;
    readonly messageTooShort: string;
  };
}

export interface NotFoundContent {
  readonly seo: SeoMeta;
  readonly heading: string;
  readonly body: string;
  readonly cta: Cta;
}
