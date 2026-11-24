#!/usr/bin/env node
// Captures a JS-rendered SPA as a design reference:
//   reference/<page>/{1440,768,390}.png, dom.html, styles.json, assets.json
//   reference/assets/*            (every image/font/svg/icon the pages load)
//   reference/pages.json          (route inventory)
// Usage: node capture.mjs <url> [--out ../../reference] [--max-pages 40]

import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const startUrl = args.find((a) => !a.startsWith('--'));
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
if (!startUrl) {
  console.error('Usage: node capture.mjs <url> [--out dir] [--max-pages n]');
  process.exit(1);
}

const OUT = path.resolve(opt('out', path.join(import.meta.dirname, '../../reference')));
const MAX_PAGES = Number(opt('max-pages', 40));
const SETTLE_MS = 3000;
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '390', width: 390, height: 844 },
];
const ASSET_TYPES = new Set(['image', 'font', 'media', 'stylesheet']);
const STYLE_SELECTORS = [
  'html', 'body', 'header', 'nav', 'nav a', 'main', 'section', 'footer', 'footer a',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', '[role="button"]',
  'input', 'textarea', 'select', 'label', 'img', 'svg',
  '[class*="card" i]', '[class*="hero" i]', '[class*="btn" i]', '[class*="badge" i]',
  '[class*="modal" i]', '[role="dialog"]', '[class*="carousel" i]', '[class*="slider" i]',
];

const slug = (u) => {
  const { pathname, hash } = new URL(u);
  const s = `${pathname}${hash.replace(/^#\/?/, '-')}`.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return s || 'home';
};
const routeKey = (u) => {
  const x = new URL(u);
  return `${x.origin}${x.pathname.replace(/\/$/, '') || '/'}${x.hash}`;
};

async function settle(page) {
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

function extractStyles(selectors) {
  const props = [
    'color', 'background-color', 'background-image', 'font-family', 'font-size', 'font-weight',
    'line-height', 'letter-spacing', 'text-transform', 'margin', 'padding', 'gap', 'border',
    'border-radius', 'box-shadow', 'display', 'max-width', 'width', 'height', 'opacity',
    'transition', 'animation-name', 'animation-duration', 'backdrop-filter', 'z-index', 'position',
  ];
  const pick = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      classes: typeof el.className === 'string' ? el.className : el.getAttribute('class'),
      text: (el.innerText || '').trim().slice(0, 80),
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      style: Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)])),
    };
  };
  const bySelector = {};
  for (const sel of selectors) {
    const els = [...document.querySelectorAll(sel)].slice(0, 8);
    if (els.length) bySelector[sel] = els.map(pick);
  }
  const tally = { colors: {}, backgrounds: {}, fonts: {}, fontSizes: {}, fontWeights: {}, lineHeights: {},
    spacing: {}, radius: {}, shadows: {}, borders: {}, transitions: {} };
  const inc = (t, k) => { if (k && k !== 'none' && k !== '0px' && k !== 'normal') t[k] = (t[k] || 0) + 1; };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    inc(tally.colors, cs.color);
    if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)') inc(tally.backgrounds, cs.backgroundColor);
    if (cs.backgroundImage !== 'none') inc(tally.backgrounds, cs.backgroundImage.slice(0, 200));
    inc(tally.fonts, cs.fontFamily);
    inc(tally.fontSizes, cs.fontSize);
    inc(tally.fontWeights, cs.fontWeight);
    inc(tally.lineHeights, cs.lineHeight);
    for (const p of ['padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'margin-top', 'margin-bottom', 'row-gap', 'column-gap']) inc(tally.spacing, cs.getPropertyValue(p));
    inc(tally.radius, cs.borderRadius);
    inc(tally.shadows, cs.boxShadow);
    if (cs.borderTopWidth !== '0px') inc(tally.borders, `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`);
    if (cs.transitionDuration !== '0s') inc(tally.transitions, `${cs.transitionProperty} ${cs.transitionDuration} ${cs.transitionTimingFunction}`);
  }
  const cssVars = {};
  const rootCs = getComputedStyle(document.documentElement);
  const keyframes = [];
  const media = new Set();
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    const walk = (list) => {
      for (const rule of list) {
        if (rule instanceof CSSKeyframesRule) keyframes.push(rule.cssText.slice(0, 600));
        else if (rule instanceof CSSMediaRule) { media.add(rule.conditionText); walk(rule.cssRules); }
        else if (rule instanceof CSSStyleRule && /^(:root|html|\.dark|\[data-theme)/.test(rule.selectorText)) {
          for (const p of rule.style) if (p.startsWith('--')) cssVars[p] = rootCs.getPropertyValue(p).trim() || rule.style.getPropertyValue(p).trim();
        }
      }
    };
    walk(rules);
  }
  return { bySelector, tally, cssVars, keyframes, mediaQueries: [...media] };
}

function discoverLinks() {
  const hrefs = new Set();
  for (const a of document.querySelectorAll('a[href]')) hrefs.add(a.href);
  for (const el of document.querySelectorAll('[routerlink],[data-href],[data-route]')) {
    const v = el.getAttribute('routerlink') || el.getAttribute('data-href') || el.getAttribute('data-route');
    if (v) hrefs.add(new URL(v, location.href).href);
  }
  const clickables = [...document.querySelectorAll('button,[role="button"],[role="tab"],[role="link"]')]
    .filter((b) => !b.closest('a') && b.getBoundingClientRect().width > 0)
    .map((b, i) => ({ i, text: (b.innerText || b.getAttribute('aria-label') || '').trim().slice(0, 60) }));
  return { hrefs: [...hrefs], clickables };
}

async function main() {
  await mkdir(path.join(OUT, 'assets'), { recursive: true });
  // The pinned Playwright may expect a different browser build than the one
  // pre-installed in the image; fall back to the shared Chromium binary.
  const executablePath = process.env.CHROMIUM_PATH
    ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext({ viewport: VIEWPORTS[0], deviceScaleFactor: 1 });
  const page = await context.newPage();

  const assets = new Map();
  let currentPage = null;
  page.on('response', async (res) => {
    const type = res.request().resourceType();
    if (!ASSET_TYPES.has(type) || !res.ok()) return;
    const url = res.url();
    if (url.startsWith('data:')) return;
    const entry = assets.get(url);
    if (entry) { entry.pages.add(currentPage); return; }
    try {
      const body = await res.body();
      const u = new URL(url);
      const base = path.basename(u.pathname).replace(/[^\w.-]/g, '_') || 'asset';
      const file = `${createHash('sha1').update(url).digest('hex').slice(0, 8)}-${base}`;
      await writeFile(path.join(OUT, 'assets', file), body);
      assets.set(url, { file, type, contentType: res.headers()['content-type'], bytes: body.length, pages: new Set([currentPage]) });
    } catch { /* body unavailable */ }
  });

  const first = await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  if (first && first.status() >= 400) {
    throw new Error(`Start URL returned HTTP ${first.status()} at ${page.url()} ("${await page.title()}"). ` +
      'The share link may be revoked or the share redirect host may be blocked.');
  }
  await settle(page);
  const origin = new URL(page.url()).origin;
  const search = new URL(page.url()).search;
  console.log(`Resolved to ${page.url()}`);

  const queue = [page.url()];
  const seen = new Set();
  const pages = [];

  while (queue.length && pages.length < MAX_PAGES) {
    const url = queue.shift();
    const key = routeKey(url);
    if (seen.has(key)) continue;
    seen.add(key);

    const name = slug(url);
    currentPage = name;
    const dir = path.join(OUT, name);
    await mkdir(dir, { recursive: true });
    console.log(`→ ${name}  ${url}`);

    await page.setViewportSize(VIEWPORTS[0]);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await settle(page);
    if (routeKey(page.url()) !== key && seen.has(routeKey(page.url()))) continue;

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(600);
      await autoScroll(page);
      await page.screenshot({ path: path.join(dir, `${vp.name}.png`), fullPage: true, animations: 'disabled' });
    }
    await page.setViewportSize(VIEWPORTS[0]);

    await writeFile(path.join(dir, 'dom.html'), await page.evaluate(() => document.documentElement.outerHTML));
    const styles = await page.evaluate(extractStyles, STYLE_SELECTORS);
    await writeFile(path.join(dir, 'styles.json'), JSON.stringify(styles, null, 2));

    const { hrefs, clickables } = await page.evaluate(discoverLinks);
    const title = await page.title();
    pages.push({ name, url: page.url(), title, clickables, links: hrefs });

    for (const h of hrefs) {
      let u;
      try { u = new URL(h); } catch { continue; }
      if (u.origin !== origin || /\.(pdf|zip|png|jpe?g|svg|webp)$/i.test(u.pathname)) continue;
      if (u.hash && !u.hash.startsWith('#/')) u.hash = '';
      if (!u.search && search) u.search = search;
      if (!seen.has(routeKey(u.href))) queue.push(u.href);
    }

    for (const c of clickables) {
      try {
        const handle = (await page.$$('button,[role="button"],[role="tab"],[role="link"]'))[c.i];
        if (!handle) continue;
        const before = page.url();
        await handle.click({ timeout: 2000 });
        await page.waitForTimeout(800);
        const after = page.url();
        if (routeKey(after) !== routeKey(before) && new URL(after).origin === origin) {
          c.navigatesTo = after;
          if (!seen.has(routeKey(after))) queue.push(after);
          await page.goto(url, { waitUntil: 'domcontentloaded' });
          await settle(page);
        } else if (await page.$('[role="dialog"],[aria-modal="true"]')) {
          c.opensDialog = true;
          await page.screenshot({ path: path.join(dir, `dialog-${c.i}.png`) });
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
        }
      } catch { /* detached / not clickable */ }
    }
    await writeFile(path.join(dir, 'assets.json'), JSON.stringify(
      [...assets].filter(([, a]) => a.pages.has(name)).map(([url, a]) => ({ url, file: a.file, type: a.type })), null, 2));
  }

  await writeFile(path.join(OUT, 'pages.json'), JSON.stringify(pages, null, 2));
  await writeFile(path.join(OUT, 'assets', 'index.json'), JSON.stringify(
    [...assets].map(([url, a]) => ({ url, ...a, pages: [...a.pages] })), null, 2));
  await browser.close();
  console.log(`Done: ${pages.length} pages, ${assets.size} assets → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
