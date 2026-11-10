// WCAG 2.2 AA (axe-core). Nakładające się znaczniki mapy (target-size) są wyłączone — to natura mapy.
const { test, expect } = require('@playwright/test');
const { open } = require('./helpers');
const fs = require('fs');
const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

for (const [name, hash] of [['mapa', ''], ['karta', '#o=12'], ['trasa', '#t=kolej'], ['wojna', '#w=ww2'], ['przystanek', '#s=s39']]) {
  test(`brak naruszeń WCAG: ${name}`, async ({ page }) => {
    await open(page, hash);
    await page.addScriptTag({ content: axe });
    const v = await page.evaluate(async () => {
      const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'], rules: { 'target-size': { enabled: false } } });
      return r.violations.map(x => x.id + ': ' + x.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | '));
    });
    expect(v).toEqual([]);
  });
}
