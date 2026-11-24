# personal-app

Angular 22 rebuild of the Airo preview site. It uses standalone components, Signals, zoneless change detection, lazy routes, strict TypeScript and static prerendering (SSG).

> **Status:** the design tokens and copy are **placeholders**. The Airo capture is blocked until there is a working share link (see `tools/reference-capture/`). Once `reference/DESIGN.md` exists, re-skinning only touches `src/styles/_tokens.scss` and `src/app/content/`.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Dev server on http://localhost:4200 |
| `npm run build` | Production build + prerender → `dist/personal-app/browser` (static files only) |
| `npm run serve:static` | Serve the built output locally (SPA fallback for unknown URLs) |
| `npm test` | Unit tests (Jasmine/Karma, headless Chromium) |
| `npm run e2e` | Builds, serves the static output, runs Playwright (desktop 1440 + mobile 390) |
| `npm run lint:types` | Type-check app and spec sources |

In the cloud image, Karma and Playwright use `/opt/pw-browsers/chromium` automatically. Override it with `CHROME_BIN` or `CHROMIUM_PATH`.

## Layout

```
src/
  styles/                 _tokens.scss (CSS custom props, breakpoints) · _mixins.scss · _base.scss
  app/
    content/              Typed content: models + data files (the only place copy lives)
      content.models.ts
      site.content.ts     brand, nav, footer
      pages/*.content.ts  per-page copy + SEO
    core/
      layout/             shell, header (mobile menu), footer
      seo/                TitleStrategy → <title> + meta description from route data
    shared/
      ui/                 smart-link, button-link, card, section-header
      utils/
    features/             one lazy-loaded route per folder
      home/ about/ contact/ not-found/
      contact/data/       ContactGateway port + HTTP / mailto adapters
    app.routes.ts         routes + SEO data
    app.routes.server.ts  prerender list (unknown URLs → client-rendered 404)
e2e/                      Playwright specs, static server, visual diff vs /reference
tools/reference-capture/  Playwright capture of the Airo site
```

## Content updates

Edit `src/app/content/**`. The types in `content.models.ts` make the compiler reject any missing or misspelled field. Components never contain copy.

## Contact form

`CONTACT_CONTENT.endpoint`:
- `null` (default): submitting opens the visitor's mail client, addressed to `CONTACT_CONTENT.email`.
- `'https://…'`: submitting POSTs JSON `{ name, email, message }` to that URL.

The form includes a honeypot field that silently drops bot submissions. Add server-side validation and rate limiting on the receiving endpoint.

## Visual parity

`e2e/visual.spec.ts` compares each page at 1440/768/390 against `reference/<page>/<vp>.png` using pixelmatch. The default threshold is a 5% pixel mismatch, which you can change with `VISUAL_MAX_MISMATCH`. Each case is skipped until its reference screenshot exists. Diffs are written to `e2e/.diff/`.
