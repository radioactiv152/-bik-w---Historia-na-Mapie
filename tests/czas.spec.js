const { test, expect } = require('@playwright/test');
const { open } = require('./helpers');

test('autobus po północy z poprzedniej doby jest na liście', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-17T22:02:00Z'));   // niedziela 00:02 w Warszawie
  await open(page, '#s=s39');
  await expect(page.locator('#deps-box .deps li').first()).toContainText('0:04');
});

test('odjazdy odświeżają się z czasem', async ({ page }) => {
  await open(page, '#s=s39', { clock: new Date('2026-11-12T16:30:00Z') });
  const before = await page.textContent('#deps-box .deps li .in');
  await page.clock.runFor(10 * 60 * 1000); await page.waitForTimeout(200);
  expect(await page.textContent('#deps-box .deps li .in')).not.toBe(before);
});

test('sklep bez godzin świątecznych nie jest „otwarty” w święto; 24:00 zamiast 0:00', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-11T11:00:00Z'));
  await open(page, '#poi=n1137307512');
  await expect(page.locator('.oh')).not.toContainText(/^otwarte/);
  await page.clock.setFixedTime(new Date('2026-11-14T22:30:00Z'));
  await open(page, '#poi=n12582339430');
  await expect(page.locator('.oh')).toContainText('24:00');
});
