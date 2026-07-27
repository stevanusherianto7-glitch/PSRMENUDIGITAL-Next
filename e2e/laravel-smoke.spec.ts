import { test, expect } from '@playwright/test'

// Smoke E2E: Customer View (GuestMenuPage) memuat menu RIYL dari Laravel backend
// (VITE_API_URL=http://localhost:8080, VITE_USE_MOCKS=false).
// Backend harus serve /api/v1/menus (8 seed menu: "Nasi Goreng Jawa", dst).
test('Customer View loads menu from Laravel backend (not offline)', async ({ page }) => {
  // ?t=A1 = meja (lewat welcome modal)
  await page.goto('http://localhost:4173/m/test?t=A1', { waitUntil: 'domcontentloaded' })

  // Tunggu salah satu menu seed muncul (bukan mock timeout).
  // Menu "Nasi Goreng Jawa" ada di SEED_MENU DAN di backend seed -> harus tampil.
  await expect(page.getByText('Nasi Goreng Jawa', { exact: false })).toBeVisible({ timeout: 20000 })

  // Badge "offline" tdk boleh muncul (backend reachable).
  await expect(page.getByText('Menampilkan Menu Offline', { exact: false })).toHaveCount(0)
})
