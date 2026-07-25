# Testing — PSRMENUDIGITAL (Kedai Elvera 57 POS)

> Panduan testing **khusus untuk repo ini**. Framework yang terpasang = **Jest** (unit/integration),
> **Playwright** & **Cypress** (E2E). Bukan Vitest (itu milik Restoku-Next).
> Dokumen ini mencatat perintah nyata dari `package.json` + file test yang ada di repo.
> **Tidak mengubah kode UI** — hanya dokumentasi.
>
> Sumber: `package.json`, `jest.config.cjs`, `playwright.config.ts`, `cypress.config.ts`,
> `src/__tests__/`, `cypress/e2e/`, `e2e/playwright/`.

---

## 1. Ringkasan

| Jenis | Framework | Lokasi | Perintah |
|-------|-----------|--------|----------|
| Unit / Integration | **Jest 30** + Testing Library | `src/__tests__/**/*.test.{ts,tsx}` | `npm test` |
| E2E (Flow) | **Playwright** | `e2e/playwright/*.spec.ts` | `npm run test:e2e:playwright` |
| E2E (Flow) | **Cypress** | `cypress/e2e/*.cy.ts` | `npm run test:e2e:cypress` |

> **Catatan:** Testing guidelines umum (no `any`, isolasi state, mock I/O, a11y) ada di `docs/GOLDEN-RULES.md` §4 & §5. Dokumen ini fokus ke **cara menjalankan & struktur** repo ini.

---

## 2. Perintah (dari `package.json`)

```bash
npm test                        # Jest sekali jalan (semua *.test.ts/tsx)
npm run test:watch             # Jest watch mode
npm run test:coverage           # Jest + laporan coverage (html + terminal)
npm run test:integration        # Jest integration (LoginFlow) — lihat §4
npm run test:e2e:playwright     # Playwright E2E (butuh dev server / webServer)
npm run test:e2e:cypress        # Cypress E2E (butuh dev server di :5173)
npm run lint                    # ESLint src
npm run format                  # ESLint --fix
npm run build                   # vite build (verifikasi kompilasi)
```

---

## 3. Unit & Integration Tests (Jest)

### 3.1 Konfigurasi (`jest.config.cjs`)

- Environment: `jsdom`
- Setup: `src/__tests__/setup.ts` (mock localStorage, env, fetch)
- Transform: `babel-jest` + preset `react-app`
- Mock aset: `identity-obj-proxy` (css), `fileMock.js` (png/svg/gif)
- Coverage diambil dari `src/app/**` (exclude `main.tsx`, `vite-env.d.ts`, `*.d.ts`)
- **Threshold saat ini sangat rendah** (branches/lines/functions/statements = **5%**) — ini floor legacy, AKAN dinaikkan bertahap saat coverage nyata naik.

### 3.2 Daftar File Test (aktual)

```
src/__tests__/
├── api/orderApi.test.ts              # API client order (fetch/mock)
├── components/ErrorBoundary.test.tsx# Error boundary render
├── components/LoginFlow.test.tsx     # Alur login (integration)
├── hooks/useApi.test.ts              # Hook useApi
├── hooks/useTTS.test.ts              # Text-to-speech hook (Capacitor TTS)
├── integration/
│   ├── orderDuplication.test.tsx     # Cegah duplikasi order
│   ├── robustness.test.tsx           # Fallback offline (API abort)
│   ├── sdm_robustness.test.tsx       # Robustness SDM/module
│   ├── security_printing.test.tsx    # Keamanan struk/cetak
│   └── security_rls.test.tsx         # Keamanan (legacy Supabase RLS — lihat §6)
└── setup.ts                          # Global setup
```

### 3.3 Menjalankan subset

```bash
# Satu file
npx jest src/__tests__/api/orderApi.test.ts

# Satu folder
npx jest src/__tests__/integration

# Watch mode (interaktif)
npm run test:watch
```

---

## 4. Integration (Script Khusus)

`npm run test:integration` menjalankan **hanya** `src/__tests__/components/LoginFlow.test.tsx`
(sesuai `package.json`: `"test:integration": "jest src/__tests__/components/LoginFlow.test.tsx"`).

Untuk menjalankan semua integration test, pakai:
```bash
npx jest src/__tests__/integration
```

---

## 5. E2E — Playwright

### 5.1 Config (`playwright.config.ts`)

- `testDir: ./e2e/playwright`
- Project: **chromium** only (Desktop Chrome)
- `baseURL: http://localhost:5173`
- `webServer`: jalankan `npm run dev` otomatis (timeout 120s); reuse jika sudah jalan (non-CI)
- `trace: on-first-retry`, `screenshot: only-on-failure`
- Di CI: `retries: 2`, `workers: 1`, `forbidOnly: true`

### 5.2 Daftar Spec (aktual)

```
e2e/playwright/
├── admin.spec.ts        # Flow admin (dashboard/laporan)
├── login.spec.ts        # Login (kredential salah → error, redirect)
├── menu.spec.ts         # Manajemen menu (CRUD, filter)
├── mock-fallback.spec.ts# Fallback saat API mati (offline robustness)
└── staff.spec.ts        # Flow staff (waiter/kitchen)
```

### 5.3 Menjalankan

```bash
# Perlu dev server jalan (Playwright bisa menyalakannya sendiri)
npm run test:e2e:playwright

# Hanya 1 spec
npx playwright test e2e/playwright/menu.spec.ts

# Dengan UI inspector
npx playwright test --ui
```

> Pastikan `.env` dimuat (Playwright load `dotenv` dari `.env` root). Jika test butuh backend,
> set `VITE_API_URL` / `VITE_USE_MOCKS` sesuai (saat mock=false, butuh Laravel jalan — lihat ARCHITECTURE.md).

---

## 6. E2E — Cypress

### 6.1 Config (`cypress.config.ts`)

- `baseUrl: http://localhost:5173`
- `viewport: 1280 × 720`
- `specPattern: cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`
- `supportFile: false`, `video: false`, screenshot on failure

### 6.2 Daftar Spec (aktual)

```
cypress/e2e/
├── admin.cy.ts          # Flow admin
├── login.cy.ts          # Login
├── menu.cy.ts           # Manajemen menu
└── staff.cy.ts          # Flow staff
```

### 6.3 Menjalankan

```bash
# Butuh dev server di :5173 (jalankan di terminal lain: npm run dev)
npm run test:e2e:cypress

# Atau headless langsung
npx cypress run --spec cypress/e2e/login.cy.ts
```

---

## 7. Coverage (Jujur)

```bash
npm run test:coverage
```

- Laporan HTML di `coverage/index.html`.
- **Threshold saat ini = 5%** (floor legacy di `jest.config.cjs`). Ini **bukan target kualitas** —
  hanya agar pipeline tidak gagal saat coverage masih rendah. Naikkan bertahap (mis. 40% → 60% → 80%)
  seiring test entities/viewmodels ditambah.
- **Jangan** claim "100% coverage" kecuali `npm run test:coverage` benar-benar menunjukkan 100% pada
  file yang dihitung. Laporkan angka riil.

---

## 8. Testing Guidelines (singkat)

1. **No `any`** di mock/test — gunakan type kuat.
2. **Isolasi state**: reset state di `beforeEach()` untuk tiap test (terutama Context/hook).
3. **Mock external I/O**: API eksternal wajib di-mock (`vi.fn()` / mock fetch / MSW) agar deterministik & cepat.
4. **Robustness wajib**: ada test yang memblokir API (Playwright `page.route` abort / Jest fetch mock)
   untuk verifikasi fallback ke localStorage/IndexedDB (`robustness.test.tsx`, `mock-fallback.spec.ts`).
5. **Security**: `security_printing.test.tsx` (struk) & `security_rls.test.tsx` menguji isolasi data.
   > `security_rls.test.tsx` saat ini menguji pola **Supabase RLS** (legacy). Setelah migrasi ke Laravel
   > (lihat `ARCHITECTURE.md`), test ini akan diganti test otorisasi backend (Sanctum + tenant scope).
6. **E2E**: jalankan Playwright & Cypress di dua origin bila perlu (localhost + preview) untuk verifikasi
   konsistensi tampilan publik (buku menu tamu).

---

## 9. CI (GitHub Actions)

`.github/workflows/` berisi `ci.yml` & `playwright.yml`. Pipeline menjalankan:
- `npm run lint`
- `npm test` (Jest)
- `npm run test:e2e:playwright` (butuh `VITE_USE_MOCKS=true` agar jalan tanpa backend, atau Laravel service container)

> Untuk E2E tanpa backend: pastikan `VITE_USE_MOCKS=true` di env CI (mirip Restoku-Next MSW),
> agar Playwright/Cypress bisa jalan penuh melawan mock.

---

*Sumber: `package.json`, `jest.config.cjs`, `playwright.config.ts`, `cypress.config.ts`, `src/__tests__/`, `cypress/e2e/`, `e2e/playwright/`, `docs/GOLDEN-RULES.md`.*
