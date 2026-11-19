/**
 * Captures README screenshots from a running build.
 *
 *   npm run build && npx vite preview --port 4173 &
 *   node scripts/screenshots.ts [baseUrl]
 *
 * Writes docs/screenshots/*.jpg (desktop 1440x900, mobile 390x844 @2x).
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from '@playwright/test';
import sharp from 'sharp';

const BASE = process.argv[2] ?? 'http://localhost:4173';
const OUT = path.join(import.meta.dirname, '..', 'docs', 'screenshots');

const shots = [
  { name: 'desktop-map', device: 'desktop', url: '/?work=grinning-relic', wait: 3500 },
  { name: 'desktop-works', device: 'desktop', url: '/works', wait: 2500 },
  { name: 'desktop-work', device: 'desktop', url: '/works/acid-tree', wait: 2500 },
  { name: 'mobile-map', device: 'mobile', url: '/', wait: 3000 },
  { name: 'mobile-preview', device: 'mobile', url: '/?work=tea-break', wait: 3500 },
  { name: 'mobile-work', device: 'mobile', url: '/works/hidden-passage', wait: 2500 },
] as const;

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const contexts = {
  desktop: await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }),
  mobile: await browser.newContext({ ...devices['iPhone 15'] }),
};

for (const shot of shots) {
  const page = await contexts[shot.device].newPage();
  await page.goto(BASE + shot.url, { waitUntil: 'load' }); // the map streams tiles forever: no networkidle
  await page.waitForTimeout(shot.wait);
  const png = await page.screenshot();
  const file = path.join(OUT, `${shot.name}.jpg`);
  await sharp(png)
    .resize({ width: shot.device === 'mobile' ? 780 : 1440 })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(file);
  console.log('✓', path.relative(process.cwd(), file));
  await page.close();
}

await browser.close();
