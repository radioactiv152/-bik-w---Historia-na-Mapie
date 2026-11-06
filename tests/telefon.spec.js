const { test, expect } = require('@playwright/test');
const { open } = require('./helpers');
test.skip(({ isMobile }) => !isMobile, 'tylko telefon');

const tileZoom = page => page.evaluate(() => { const t = document.querySelector('.leaflet-tile'); return t ? +t.src.match(/\/(\d+)\/\d+\/\d+\.png/)[1] : null; });

test('wejście w wojnę dopasowuje mapę do Żbikowa, nie do całego Mazowsza', async ({ page }) => {
  await open(page);
  await page.click('[data-layer=ww1]'); await page.waitForTimeout(1200);
  expect(await tileZoom(page)).toBeGreaterThanOrEqual(10);
});

test('rozwinięta karta tras nie daje zoomu 20', async ({ page }) => {
  await open(page);
  await page.click('[data-layer=trasy]'); await page.waitForTimeout(400);
  await page.click('#routes-sheet .grabber'); await page.waitForTimeout(300);
  await page.click('.route-cards button'); await page.waitForTimeout(1200);
  const z = await tileZoom(page);
  expect(z).toBeGreaterThanOrEqual(12); expect(z).toBeLessThanOrEqual(16);
});

test('dolne menu nie chowa się pod stopką', async ({ page }) => {
  await open(page);
  const bar = await page.locator('#view-bar').boundingBox();
  const attr = await page.locator('.leaflet-control-attribution').boundingBox();
  expect(bar.y + bar.height).toBeLessThanOrEqual(attr.y + 1);
});
