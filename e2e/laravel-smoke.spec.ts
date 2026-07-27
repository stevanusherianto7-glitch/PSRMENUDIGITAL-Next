import { test, expect } from '@playwright/test'

// Smoke E2E: Customer View (GuestMenuPage) memuat menu RIYL dari Laravel backend
// (VITE_API_URL=http://localhost:8080, VITE_USE_MOCKS=false).
// Backend harus serve /api/v1/menus (8 seed menu: "Nasi Goreng Jawa", dst).
test('Customer View loads menu from Laravel backend (not offline)', async ({ page }) => {
  // /menu/:tableId (PSRMENUDIGITAL route, hash router -> butuh #)
  await page.goto('http://localhost:4173/#/menu/test?t=A1', { waitUntil: 'domcontentloaded' })

  // Dismiss welcome modal bila ada (step 1 -> step 2 -> menu).
  // Pakai getByText (toleran terhadap icon/role).
  const masuk = page.getByText(/Masuk Ke Menu/i)
  if (await masuk.count()) await masuk.first().click()

  const lanjut = page.getByText(/Lanjut/i)
  if (await lanjut.count()) await lanjut.first().click()

  // Salah satu menu seed harus tampil (backend riil, bukan mock timeout).
  // "Nasi Goreng Jawa" ada di SEED_MENU DAN di backend seed -> harus tampil.
  await expect(page.getByText('Nasi Goreng Jawa', { exact: false })).toBeVisible({ timeout: 25000 })

  // Badge "offline" tdk boleh muncul (backend reachable).
  await expect(page.getByText(/Menampilkan Menu Offline/i)).toHaveCount(0)
})
