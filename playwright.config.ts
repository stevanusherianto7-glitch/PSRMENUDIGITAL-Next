import { defineConfig } from '@playwright/test'

// Playwright config untuk E2E Laravel Real-API.
// webServer auto-start `vite preview` (port 4173) sebelum test.
// Frontend membaca VITE_API_URL=http://localhost:8080 (Laravel backend, jalan terpisah).
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 20000 },
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: true,
    timeout: 60000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  reporter: [['list']],
})
