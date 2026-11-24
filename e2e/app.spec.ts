import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

test.describe('prerendered pages', () => {
  for (const page of PAGES) {
    test(`${page.path} ships server-rendered HTML with SEO tags`, async ({ request }) => {
      const res = await request.get(page.path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      // Content is in the static HTML, not injected only by JS.
      expect(html).toMatch(/<h1[^>]*>/);
      expect(html).toMatch(/<title>[^<]+ · Personal App<\/title>|<title>Personal App<\/title>/);
      expect(html).toMatch(/<meta name="description" content="[^"]+"/);
    });

    test(`${page.path} renders its heading with no console errors`, async ({ page: p }) => {
      const errors: string[] = [];
      p.on('pageerror', (e) => errors.push(e.message));
      p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await p.goto(page.path);
      await expect(p.getByRole('heading', { level: 1, name: page.heading })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('unknown URLs show the 404 page', async ({ page }) => {
    await page.goto('/does-not-exist');
    await expect(page.getByRole('heading', { level: 1, name: /not found/i })).toBeVisible();
    await expect(page).toHaveTitle(/Page not found/);
  });
});

test.describe('navigation', () => {
  test('primary nav routes between pages and marks the active link', async ({ page, isMobile, viewport }) => {
    await page.goto('/');
    const narrow = (viewport?.width ?? 1440) < 768 || isMobile;
    const nav = page.getByRole('navigation', { name: 'Primary' });
    // Accessible name flips between "Open menu" and "Close menu"; target by relationship instead.
    const toggle = page.locator('button[aria-controls="primary-nav"]');

    if (narrow) {
      await expect(toggle).toHaveAccessibleName(/open menu/i);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(toggle).toHaveAccessibleName(/close menu/i);
    }

    await nav.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { level: 1, name: /^about$/i })).toBeVisible();

    if (narrow) {
      // Menu closes itself after navigation.
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
    }
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('contact form', () => {
  test('blocks invalid submissions with accessible errors', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByLabel('Name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('This field is required.').first()).toBeVisible();

    await page.getByLabel('Email').fill('nope');
    await page.getByLabel('Email').blur();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  });
});
