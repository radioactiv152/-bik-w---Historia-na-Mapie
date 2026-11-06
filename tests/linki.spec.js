const { test, expect } = require('@playwright/test');
const { open, isOpen } = require('./helpers');

test('linki głębokie otwierają właściwe karty', async ({ page }) => {
  await open(page, '#o=17');
  expect(await isOpen(page, 'panel')).toBe(true);
  await open(page, '#s=s39');
  await expect(page.locator('#panel-kicker')).toContainText('Przystanek');
  await open(page, '#poi=n1137307525');
  await expect(page.locator('#panel-kicker')).toContainText('Okolica');
  await open(page, '#w=ww2');
  expect(await isOpen(page, 'war-sheet')).toBe(true);
  await open(page, '#t=kolej&s=s12');
  await expect(page.locator('#panel-kicker')).toContainText('Przystanek');
  expect(await page.evaluate(() => location.hash)).toBe('#t=kolej&s=s12');
});

test('nieznany identyfikator wydarzenia nie zostawia pustej mapy', async ({ page }) => {
  await open(page, '#w=ww2&e=nie-ma');
  expect(await isOpen(page, 'war-sheet')).toBe(true);
});

test('lista zastępująca kartę czyści adres; „Pomiń mapę” go nie nadpisuje', async ({ page, isMobile }) => {
  await open(page, '#o=16');
  if (!isMobile) {   // na telefonie otwarta karta zasłania dolne menu — ten scenariusz jest komputerowy
    await page.click('[data-layer=miejsca]');
    expect(await page.evaluate(() => location.hash)).toBe('');
  }
  await open(page, '#o=17');
  await page.locator('.skip-link').focus(); await page.keyboard.press('Enter');
  expect(await page.evaluate(() => location.hash)).toBe('#o=17');
});

test('?map= i ?theme= nie nadpisują zapamiętanych ustawień', async ({ page }) => {
  await open(page);
  await page.evaluate(() => { localStorage.setItem('zbikow-map', 'ciemna'); localStorage.setItem('zbikow-theme', 'morski'); localStorage.setItem('zbikow-sat', '0'); });
  await page.goto('/?map=satelita&theme=dzien', { waitUntil: 'networkidle' });
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dzien');
  expect(await page.evaluate(() => localStorage.getItem('zbikow-theme'))).toBe('morski');
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('morski');
});
