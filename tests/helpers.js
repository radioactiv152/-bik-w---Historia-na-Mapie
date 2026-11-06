// Wspólne kroki: strona bez ekranu powitalnego, zbieranie błędów JS.
const { expect } = require('@playwright/test');
async function open(page, hash = '', opts = {}) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.setItem('zbikow-welcome', '1'); } catch (e) {} });
  if (opts.clock) await page.clock.install({ time: opts.clock });
  await page.goto('/' + hash, { waitUntil: 'networkidle' });
  await page.waitForTimeout(opts.wait || 900);
  return errors;
}
const isOpen = (page, id) => page.evaluate(id => document.getElementById(id).classList.contains('open'), id);
module.exports = { open, isOpen, expect };
