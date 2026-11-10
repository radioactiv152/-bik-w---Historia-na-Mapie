const { test, expect } = require('@playwright/test');
const { open, isOpen } = require('./helpers');

test('strona ładuje się bez błędów i pokazuje znaczniki', async ({ page }) => {
  const errors = await open(page);
  expect(errors).toEqual([]);
  expect(await page.locator('.leaflet-marker-icon').count()).toBeGreaterThan(5);
  await expect(page).toHaveTitle(/Żbików/);
  await expect(page.locator('.leaflet-control-attribution')).toContainText('Tomasz Wrotek');
});

test('ekran powitalny tylko przy pierwszej wizycie, karty prowadzą do widoków', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('#welcome')).toHaveAttribute('open', '');
  await page.click('#welcome button[data-go=trasy]');
  expect(await isOpen(page, 'routes-sheet')).toBe(true);
  await page.reload({ waitUntil: 'networkidle' });
  expect(await page.evaluate(() => document.getElementById('welcome').open)).toBe(false);
});

test('każdy widok otwiera się bez błędów', async ({ page }) => {
  const errors = await open(page);
  for (const layer of ['miejsca', 'zdjecia', 'trasy', 'okolica', 'ww1', 'ww2', 'wspolczesna']) {
    await page.click(`[data-layer=${layer}]`);
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);   // na telefonie otwarta karta zasłania dolne menu
  }
  await page.click('#info-btn'); await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});
