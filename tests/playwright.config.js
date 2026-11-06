// Testy strony: serwer statyczny z katalogu repozytorium, komputer i telefon.
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: '.',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:8765/', timezoneId: 'Europe/Warsaw', locale: 'pl-PL', trace: 'retain-on-failure' },
  webServer: { command: 'python3 -m http.server 8765', cwd: '..', port: 8765, reuseExistingServer: true },
  projects: [
    { name: 'komputer', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'telefon', use: { ...devices['Pixel 5'], viewport: { width: 390, height: 800 } } }
  ]
});
