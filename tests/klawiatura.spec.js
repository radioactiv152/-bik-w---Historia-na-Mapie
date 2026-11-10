const { test, expect } = require('@playwright/test');
const { open, isOpen } = require('./helpers');

test('Enter na znaczniku otwiera kartę', async ({ page }) => {
  await open(page, '#o=17');
  await page.click('#close-panel'); await page.waitForTimeout(300);
  await page.evaluate(() => { [...document.querySelectorAll('.leaflet-marker-icon[tabindex]')].find(e => e.getAttribute('aria-label') && !e.getAttribute('aria-label').startsWith('Skupisko')).focus(); });
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  expect(await isOpen(page, 'panel')).toBe(true);
});

test('Esc: menu stylu, filtr listy, wyniki wyszukiwania', async ({ page }) => {
  await open(page, '#o=17');
  await page.click('#style-btn'); await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.getElementById('style-menu').classList.contains('open'))).toBe(false);
  expect(await isOpen(page, 'panel')).toBe(true);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);   // zamknij kartę (na telefonie zasłania menu)
  await page.click('[data-layer=miejsca]'); await page.waitForTimeout(300);
  await page.fill('#list-filter', 'apt'); await page.keyboard.press('Escape');
  expect(await page.inputValue('#list-filter')).toBe('');
  expect(await isOpen(page, 'places-list')).toBe(true);
});

test('fokus zostaje na przycisku dnia po przełączeniu osi wojny', async ({ page }) => {
  await open(page, '#w=ww1');
  await page.click('.days button[data-day="1914-10-16"]'); await page.waitForTimeout(600);
  expect(await page.evaluate(() => document.activeElement.dataset.day)).toBe('1914-10-16');
  expect(await page.evaluate(() => !document.querySelector('.days button[data-day="1914-10-20"]').disabled)).toBe(true);
});
