# reference-capture

Captures a JS-rendered SPA as a pixel/DOM/style reference for the Angular rebuild.

```bash
cd tools/reference-capture
npm i
npm run capture -- "<share-or-preview-url>" [--out ../../reference] [--max-pages 40]
```

Uses the pre-installed Chromium (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`); do not run `playwright install`.

Output (default `../../reference`):

| Path | Contents |
| --- | --- |
| `<page>/{1440,768,390}.png` | Full-page screenshots per viewport |
| `<page>/dom.html` | Rendered DOM |
| `<page>/styles.json` | Computed styles per selector, frequency tallies, CSS vars, keyframes, media queries |
| `<page>/assets.json` | Assets loaded by that page |
| `assets/` + `assets/index.json` | Every image/font/media/stylesheet response |
| `pages.json` | Route inventory (links, clickables, navigations) |

Re-run after content changes on Airo, then diff `reference/` to see what moved.
