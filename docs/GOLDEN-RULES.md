# Golden Rules — PSRMENUDIGITAL (Kedai Elvera 57 POS)

> Diseragamkan dari `Restoku_Refactored/Restoku-Next/docs/GOLDEN-RULES.md`, `TECH-STACK.md`,
> `TESTING.md`, `prompts-frontend.md`, `PRD.md`, `WORK-PLAN.md`.
> **Disesuaikan dengan arah stack**: Frontend React 18 + TypeScript + Vite + Tailwind + Capacitor (Android);
> backend target = **Laravel 13 + PostgreSQL + Redis** (seragam Restoku-Next). Testing = **Jest** (bukan Vitest) + Playwright + Cypress.
> **Supabase TIDAK dipakai** sebagai backend. **Tidak mengubah UI/layout** — hanya panduan penulisan kode ke depan.

---

## 1. TypeScript Strict Typing (No `any`)

**Dilarang keras `any` di kode baru (`src/`).**

| ❌ Dilarang | ✅ Wajib |
|------------|---------|
| `any` | Explicit types (`string`, `number`, `boolean`) |
| `as any` | Interface / Type alias |
| `: any` | Generics (`<T>`) |
| | `unknown` + validasi (jika tipe benar-benar tidak pasti) |
| | `// TODO: define precise type` (jika belum diketahui) |

```ts
// ❌ BAD
function processData(data: any): any { return data.map((i: any) => i.name); }

// ✅ GOOD
interface MenuItem { id: string; name: string; price: number; }
function processData(data: MenuItem[]): string[] { return data.map((i) => i.name); }

// ✅ GOOD (unknown + validasi)
function parseInput(input: unknown): MenuItem {
  if (typeof input !== "object" || input === null) throw new Error("Invalid input");
  return input as MenuItem;
}
```

**Enforcement:** ESLint `@typescript-eslint/no-explicit-any: "error"`, `tsconfig` `noImplicitAny: true`.
Kode existing yang masih pakai `any` boleh bertahap di-migrasi; kode BARU wajib bebas `any`.

---

## 2. Naming Convention

| Target | Rule |
|--------|------|
| Kolom Supabase / JSON | `snake_case` (contoh: `created_at`, `order_id`) |
| Variabel TS / props | `camelCase` (contoh: `orderId`, `isLoading`) |
| Tipe / interface / class / komponen | `PascalCase` (contoh: `MenuItem`, `OrderStatus`, `KasirModule`) |
| Konstanta environment | `UPPER_SNAKE_CASE` (contoh: `VITE_API_URL`) |

---

## 3. Architecture & Struktur

- **Pisahkan concern**: logika murni (domain/helper) terpisah dari API call (adapter) dan UI.
- **Atomic Design** untuk komponen UI:
  - Atom: `Button`, `Input`, `Badge`, `Icon` → `src/app/components/ui/*`
  - Molecule: `SearchBar`, `Card`, `FormField` → komposisi atom
  - Organism: `Header`, `Sidebar`, `DataTable`, `KasirModule` → komposisi atom+molecule
- **1 komponen 1 file**. Gunakan `cn()` (dari `clsx` + `tailwind-merge` yang sudah ada) untuk merge class.
- **Batas ukuran** (hindari god-component):
  - Page ≤ 200 baris
  - Sub-komponen ≤ 150 baris
  - Hook ≤ 100 baris
- **State**: `react-hook-form` + `zod` untuk form (sudah terpasang); `Context` (`StoreContext.tsx`) untuk state global; hindari prop-drilling dalam.
- **Routing**: `react-router` v7 (`src/app/routes.tsx`).

---

## 4. Testing (Perintah NYATA repo ini)

Framework pengujian repo ini = **Jest** (bukan Vitest). Semua perintah dijalankan dari root.

```bash
npm test                      # Unit test Jest (sekali jalan)
npm run test:watch            # Jest watch mode
npm run test:coverage         # Jest + laporan coverage
npm run test:integration      # Integrasi (LoginFlow) — Jest
npm run test:e2e:playwright   # E2E Playwright (localhost:5173, desktop 1280x720)
npm run test:e2e:cypress      # E2E Cypress
npm run lint                  # ESLint src
npm run format                # ESLint --fix
npm run build                 # vite build (verifikasi kompilasi)
```

### Testing Guidelines
1. **No `any`** di mock/test — gunakan type kuat.
2. **Isolasi state**: reset state di `beforeEach()` untuk tiap test.
3. **Mock external I/O**: API eksternal wajib di-mock (`vi.fn()` / mock fetch / MSW) agar deterministik & cepat.
4. **Robustness test wajib**: selalu ada test yang memblokir API (Playwright `page.route` abort) untuk verifikasi fallback ke localStorage/IndexedDB (lihat `security_rls.test.tsx`, `robustness.test.tsx`).
5. **Coverage jujur**: laporkan angka riil; jangan eksklusi file dari threshold sambil mengklaim 100%.

---

## 5. Accessibility (WCAG AA)

Lihat `docs/TYPOGRAPHY.md` untuk detail. Ringkas:
- Kontras teks ≥ 4.5:1 (large ≥ 3:1).
- Font ≥ 12px, line-height ≥ 1.4×.
- Touch target ≥ 44×44px.
- CLS < 0.1 (hindari layout shift).
- Skeleton loading, bukan spinner, saat data load.

---

## 6. Security & Secret Hygiene

- **Isolasi multi-tenant & otorisasi** dienforced di backend (Laravel policies / tenant scope), bukan di client. Test `security_rls.test.tsx` (legacy Supabase) akan diganti test otorisasi backend.
- **Validasi input**: selalu validasi di client (`zod`) DAN validasi ulang di backend (Laravel Form Request / service layer).
- **Hindari XSS**: jangan `dangerouslySetInnerHTML` dengan data user tanpa sanitasi.
- **Secrets**:
  - `.env` sudah di-gitignore — jangan commit.
  - API token (Sanctum/Bearer) disimpan di storage aman (Capacitor SecureStorage / httpOnly cookie), bukan di JS global.
  - **Secret backend (DB password, APP_KEY, API key pihak ke-3) HARUS tetap di server** — jangan pernah ekspos ke frontend/build.
  - Test spec (`.spec.ts`/`.cy.ts`) **jangan hardcode** URL production atau key — gunakan env dinamis (`VITE_API_URL` fallback ke `http://localhost:8080` / `127.0.0.1:5432` local).
- **HTTPS everywhere** di production (VPS/Android).

---

## 7. Robustness & Offline (Pertahankan aturan lama)

Internet warung tidak stabil — aplikasi tidak boleh crash (layar putih).
- Selalu pasang fallback cache lokal (localStorage/IndexedDB) jika backend timeout/schema error.
- Conflict resolution: Last-Write-Wins (LWW) untuk profil/staf; merge state untuk order/meja.
- Saat koneksi pulih: sync delta (hanya data berubah).
- Error handling: pesan jelas + retry otomatis dengan exponential backoff.
- Real-time & smooth fallback wajib diuji (lihat GEMINI.md aturan 3 & robustness test suite).

---

## 8. Brand Identity (Wajib)

- Pertahankan identitas **Kedai Elvera 57** di setiap UI, komponen POS, struk, & material cetak.
- Font: **Poppins**. Palet: ungu→magenta→merah→oranye→emas (lihat `docs/TYPOGRAPHY.md`).
- Jangan ganti brand ke nama lain tanpa instruksi eksplisit.

---

## 9. Definition of Done

- [ ] Lint clean (`npm run lint`)
- [ ] Test pass (`npm test` / `npm run test:coverage`)
- [ ] E2E playwright/cypress hijau (untuk alur terdampak)
- [ ] No `any` di kode baru
- [ ] TypeScript strict mode lolos (`npm run build`)
- [ ] Responsive (mobile-first)
- [ ] WCAG AA kontras memenuhi
- [ ] Dokumentasi/panduan update (jika mengubah konvensi)
- [ ] Secret tidak bocor ke client/commit

---

*Sumber: `Restoku_Refactored/Restoku-Next/docs/{GOLDEN-RULES,TECH-STACK,TESTING,prompts-frontend,PRD,WORK-PLAN}.md` — disesuaikan stack Jest+Laravel+Capacitor repo ini.*
