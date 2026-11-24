import { expect, test } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { PAGES, VIEWPORTS } from './pages';

/**
 * Compares the build against the Airo capture in /reference/<page>/<viewport>.png.
 * Skipped per case until the reference exists (run tools/reference-capture first).
 * Threshold is loose on purpose: it flags layout drift, not anti-aliasing.
 */
const REFERENCE_DIR = path.resolve(__dirname, '../reference');
const DIFF_DIR = path.resolve(__dirname, '.diff');
const MAX_MISMATCH_RATIO = Number(process.env['VISUAL_MAX_MISMATCH'] ?? 0.05);

test.describe('visual parity with Airo reference', () => {
  test.skip(({ browserName }) => browserName !== 'chromium');

  for (const page of PAGES) {
    for (const vp of VIEWPORTS) {
      const refFile = path.join(REFERENCE_DIR, page.reference, `${vp.name}.png`);

      test(`${page.reference} @ ${vp.name}`, async ({ page: p }, info) => {
        test.skip(info.project.name !== 'desktop', 'Viewports are iterated explicitly; run once.');
        test.skip(!existsSync(refFile), `No reference screenshot at ${path.relative(process.cwd(), refFile)}`);

        await p.setViewportSize({ width: vp.width, height: vp.height });
        await p.goto(page.path);
        await p.waitForLoadState('networkidle');
        const actual = PNG.sync.read(await p.screenshot({ fullPage: true, animations: 'disabled' }));
        const expected = PNG.sync.read(readFileSync(refFile));

        // Compare the overlapping region; a height difference is itself reported.
        const width = Math.min(actual.width, expected.width);
        const height = Math.min(actual.height, expected.height);
        const crop = (img: PNG): Buffer => {
          const out = Buffer.alloc(width * height * 4);
          for (let y = 0; y < height; y++) img.data.copy(out, y * width * 4, y * img.width * 4, y * img.width * 4 + width * 4);
          return out;
        };
        const diff = new PNG({ width, height });
        const mismatched = pixelmatch(crop(actual), crop(expected), diff.data, width, height, { threshold: 0.2 });
        const ratio = mismatched / (width * height);

        if (ratio > MAX_MISMATCH_RATIO) {
          mkdirSync(DIFF_DIR, { recursive: true });
          writeFileSync(path.join(DIFF_DIR, `${page.reference}-${vp.name}.png`), PNG.sync.write(diff));
        }
        expect.soft(Math.abs(actual.height - expected.height) / expected.height, 'page height drift').toBeLessThan(0.1);
        expect(ratio, `pixel mismatch ratio (diff in e2e/.diff)`).toBeLessThanOrEqual(MAX_MISMATCH_RATIO);
      });
    }
  }
});
