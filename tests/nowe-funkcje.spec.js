// Funkcje z ostatniej serii: język angielski, nawigacja na trasie, kod QR, zasięg 1944, praca offline
const { test, expect } = require('@playwright/test');
const { open, isOpen } = require('./helpers');

test('wersja angielska interfejsu (?lang=en) i powrót do polskiej', async ({ page }) => {
  await page.goto('/?lang=en', { waitUntil: 'networkidle' });
  await expect(page.locator('#wl-title')).toContainText('Welcome');
  await page.click('#wl-start');
  await expect(page.locator('[data-layer=miejsca]')).toHaveText('Places');
  await page.goto('/#s=s39', { waitUntil: 'networkidle' }); await page.waitForTimeout(600);
  await expect(page.locator('#panel-kicker')).toHaveText('Bus stop');
  await page.evaluate(() => localStorage.setItem('zbikow-lang', 'pl'));
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-layer=miejsca]')).toHaveText('Miejsca');
});

test('trasa w terenie: najbliższy przystanek i karta otwierana po podejściu', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 52.17, longitude: 20.80, accuracy: 30 });
  await open(page, '#t=kolej');
  const stop3 = await page.evaluate(() => { const r = recordByOrig[activeRoute.stops[2]]; return [r.place.lat, r.place.lng]; });
  await page.click('#route-locate'); await page.waitForTimeout(800);
  await expect(page.locator('#route-nav')).toBeVisible();
  await context.setGeolocation({ latitude: stop3[0] + 0.0001, longitude: stop3[1], accuracy: 20 }); await page.waitForTimeout(1200);
  expect(await page.evaluate(() => current && current.routeStop)).toBe(2);
  await expect(page.locator('#route-nav')).toContainText(/na miejscu/);
});

test('kod QR z linkiem do miejsca', async ({ page }) => {
  await open(page, '#o=17');
  await page.click('#btn-qr'); await page.waitForTimeout(400);
  expect(await page.evaluate(() => document.getElementById('qr').open)).toBe(true);
  expect(await page.locator('#qr-box svg').count()).toBe(1);
  await expect(page.locator('#qr-url')).toContainText('#o=17');
});

test('strona działa bez sieci po pierwszej wizycie (service worker)', async ({ page, context, browserName }) => {
  const errors = await open(page, '', { wait: 2500 });
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(1200);
  expect(await page.locator('.leaflet-marker-icon').count()).toBeGreaterThan(5);
  await context.setOffline(false);
  expect(errors).toEqual([]);
});
