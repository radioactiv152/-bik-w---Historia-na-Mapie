const { test, expect } = require('@playwright/test');
const { open, isOpen } = require('./helpers');

test('podświetlenie znika po zamknięciu karty i nie dubluje się', async ({ page }) => {
  await open(page, '#s=s39');
  await page.click('#close-panel'); await page.waitForTimeout(200);
  expect(await page.locator('.is-active').count()).toBe(0);
  await open(page, '#poi=n1137307525');
  await open(page, '#o=17');
  expect(await page.locator('.leaflet-marker-icon.is-active').count()).toBe(1);
});

test('Okolica: pinezki znikają po wyłączeniu zakładki', async ({ page }) => {
  await open(page);
  await page.click('[data-layer=okolica]'); await page.waitForTimeout(500);
  expect(await page.locator('.poi-pin').count()).toBeGreaterThan(0);
  await page.click('#close-near'); await page.waitForTimeout(300);
  expect(await page.locator('.poi-pin').count()).toBe(0);
});

test('„Miejsca” i „Zdjęcia” nie są wciśnięte naraz', async ({ page }) => {
  await open(page);
  await page.click('[data-layer=zdjecia]'); await page.waitForTimeout(300);
  expect(await page.evaluate(() => [...document.querySelectorAll('.seg-btn[aria-pressed=true]')].map(b => b.dataset.layer))).toEqual(['wspolczesna', 'zdjecia']);
});

test('przycisk 1944 tylko w zasięgu zdjęcia; nakładka pod liniami', async ({ page }) => {
  await open(page, '#o=1');
  expect(await page.evaluate(() => document.getElementById('btn-1944').hidden)).toBe(true);
  await open(page, '#o=17');
  expect(await page.evaluate(() => document.getElementById('btn-1944').hidden)).toBe(false);
  expect(await page.evaluate(() => +getComputedStyle(document.querySelector('.leaflet-pane1944-pane')).zIndex)).toBeLessThan(400);
});

test('wyszukiwarka: dokładny tytuł przed podobnym przystankiem', async ({ page }) => {
  await open(page);
  await page.fill('#search', 'żbików'); await page.waitForTimeout(200);
  await expect(page.locator('#sr-0')).toContainText(/^Żbików/);
});

test('karuzela: strzałki działają po kliknięciu miniatury', async ({ page }) => {
  await open(page, '#o=179');
  await page.click('.gallery .main'); await page.waitForTimeout(300);
  await page.click('#cz-thumbs button[data-i="3"]'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
  await expect(page.locator('#cz-count')).toHaveText(/^5 \//);
});
