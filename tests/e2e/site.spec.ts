import { expect, test, type Page } from '@playwright/test';
import catalog from '../../content/media.json' with { type: 'json' };

const WORK_COUNT = Object.keys(catalog).length;

/** Fail the test on any uncaught error or console.error, the cheapest smoke alarm there is. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

async function imageLoaded(page: Page, selector: string) {
  const img = page.locator(selector).first();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
}

test('map shows a pin for every work and opens a preview', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/');
  await expect(page.locator('.pin')).toHaveCount(WORK_COUNT);

  // Keyboard path: pins are real buttons (Tab + Enter), which also avoids flaky clicks under drifting clouds
  const pin = page.getByTestId('pin-acid-tree');
  await expect(pin).toHaveAccessibleName(/Acid Tree/);
  await pin.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\?work=acid-tree$/);
  const preview = page.getByTestId('work-preview');
  await expect(preview.getByRole('heading', { name: 'Acid Tree' })).toBeVisible();
  await imageLoaded(page, '[data-testid="work-preview"] img');

  await page.keyboard.press('Escape');
  await expect(preview).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  await expect(pin).toBeFocused(); // focus returns to where the visitor came from
  expect(errors).toEqual([]);
});

test('a shared map link opens straight on the work', async ({ page }) => {
  await page.goto('/?work=grinning-relic');
  await expect(page.getByTestId('work-preview').getByRole('heading', { name: 'Grinning Relic' })).toBeVisible();
  await expect(page.getByTestId('pin-grinning-relic')).toHaveClass(/is-selected/);
});

test('every pin is inside the initial view', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.pin')).toHaveCount(WORK_COUNT);
  const viewport = page.viewportSize()!;
  const outside = await page.locator('.pin').evaluateAll(
    (pins, vp) =>
      pins.filter((p) => {
        const r = p.getBoundingClientRect();
        const x = r.x + r.width / 2;
        const y = r.y + r.height / 2;
        return x < 0 || y < 0 || x > vp.width || y > vp.height;
      }).length,
    viewport,
  );
  expect(outside).toBe(0);
});

test('mobile sheet never covers the selected pin', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'bottom sheet is a phone layout');
  await page.goto('/?work=crossfade');
  const sheet = page.getByTestId('work-preview');
  await expect(sheet).toBeVisible();
  const pin = page.getByTestId('pin-crossfade');
  await expect
    .poll(async () => {
      const [p, s] = [await pin.boundingBox(), await sheet.boundingBox()];
      return p && s ? p.y + p.height / 2 < s.y : false;
    })
    .toBe(true);
});

test('unknown query params fall back gracefully', async ({ page }) => {
  await page.goto('/?work=bogus');
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/works?style=Nope');
  await expect(page.getByTestId('work-card')).toHaveCount(WORK_COUNT);
});

test('gallery lists every work and filters by style', async ({ page }) => {
  await page.goto('/works');
  await expect(page.getByTestId('work-card')).toHaveCount(WORK_COUNT);
  await imageLoaded(page, '[data-testid="work-card"] img');

  await page.getByRole('button', { name: /^Ukiyo-e/ }).click();
  await expect(page).toHaveURL(/style=Ukiyo-e/);
  // Wait for the re-render rather than reading the count straight after the URL changes
  await expect(page.getByTestId('work-card')).not.toHaveCount(WORK_COUNT);
  expect(await page.getByTestId('work-card').count()).toBeGreaterThan(0);
});

test('work page deep link renders the work and navigates to the next one', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/works/acid-tree');
  await expect(page.getByRole('heading', { level: 1, name: 'Acid Tree' })).toBeVisible();
  await expect(page).toHaveTitle(/Acid Tree/);
  await imageLoaded(page, '[data-testid="work-page"] img');
  await expect(page.getByRole('link', { name: /Walk there/ })).toHaveAttribute('href', /google\.com\/maps\/dir/);

  await page.getByRole('link', { name: /Next/ }).click();
  await expect(page).toHaveURL(/\/works\/moment-before-dust$/);
  expect(errors).toEqual([]);
});

test('unknown routes and works show the 404 page', async ({ page }) => {
  await page.goto('/nowhere');
  await expect(page.getByTestId('not-found')).toBeVisible();
  await page.goto('/works/not-a-work');
  await expect(page.getByTestId('not-found')).toBeVisible();
});

test('works without any third-party network (only the base map goes missing)', async ({ page }) => {
  const blocked: string[] = [];
  await page.route(/^https?:\/\/(?!localhost)/, (route) => {
    blocked.push(new URL(route.request().url()).host);
    return route.abort();
  });
  await page.goto('/works/hidden-passage');
  await imageLoaded(page, '[data-testid="work-page"] img');
  await page.goto('/');
  await expect(page.locator('.pin')).toHaveCount(WORK_COUNT);
  // Everything except the base map (style, tiles, glyphs) is served by us.
  expect(new Set(blocked.filter((h) => !h.includes('openfreemap.org')))).toEqual(new Set());
});

test('publishes machine-readable catalog and llms.txt', async ({ request }) => {
  const catalogRes = await request.get('/catalog.json');
  expect(catalogRes.ok()).toBe(true);
  const body = await catalogRes.json();
  expect(body.works).toHaveLength(WORK_COUNT);
  expect(body.works[0]).toMatchObject({ slug: 'acid-tree', image: expect.stringContaining('/media/works/acid-tree.webp') });

  const llms = await request.get('/llms.txt');
  expect(await llms.text()).toContain('# Urban Dreams');
});

test.describe('responsive layout', () => {
  const routes = ['/', '/?work=surrounded-by-scrapers', '/works', '/works/acid-tree', '/about', '/nowhere'];

  test('no horizontal overflow on a 320px screen', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
    }
  });

  test('touch targets are at least 44px on phones', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch sizing is a phone concern');
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('button, .button, .chip, .nav-link')]
          .filter((el) => el.offsetParent !== null) // visible only
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.height < 44 || r.width < 44)
          .map(({ el, r }) => `${el.className || el.tagName} ${Math.round(r.width)}x${Math.round(r.height)}`),
      );
      expect(small, route).toEqual([]);
    }
  });
});

