# PLAN: Penyeragaman Panduan (Guidelines) PSRMENUDIGITAL_CLONE dengan Standar Restoku-Next

**Tanggal:** 2026-07-25
**Status:** DRAFT — menunggu persetujuan user
**Penulis:** Arsitek (Hermes Agent)

---

## 1. Tujuan & Prinsip Mutlak

**Tujuan:** Menyamakan *panduan/aturan* (guidance) repositori `PSRMENUDIGITAL_CLONE` dengan standar kualitas, keamanan, dan testing yang sudah dibakukan di `Restoku_Refactored/Restoku-Next/docs/*`, tanpa mengubah satu baris pun kode UI/frontend.

**PRINSIP MUTLAK (hard constraint):**
- ✅ **HANYA** file panduan/markdown yang boleh diubah: `GEMINI.md`, `PANDUAN_ROLE.md`, `guidelines/Guidelines.md`, dan file baru di `docs/`.
- ❌ **TIDAK** menyentuh `src/`, `android/`, `public/`, `*.config.*`, `package.json`, `supabase/`, `prisma/`.
- ❌ **TIDAK** menjalankan `vite build` / mengubah layout/tampilan. UI tetap persis seperti sekarang.
- Panduan baru harus **jujur terhadap kondisi repo ini** (Jest bukan Vitest, MUI+lucide bukan shadcn murni, Supabase bukan Laravel) — menyerap *prinsip* Restoku-Next, bukan menyalin stack-nya mentah-mentah.

---

## 2. Audit Kesenjangan (Gap) — Panduan Lama vs Standar Restoku-Next

| Aspek | Panduan Lama (PSRMENUDIGITAL) | Standar Restoku-Next (docs) | Tindakan |
|-------|-------------------------------|------------------------------|----------|
| Type safety | Tidak ada aturan `any` | `GOLDEN-RULES.md`: **dilarang `any`**, explicit type/interface/generics | Tambah ke panduan |
| Naming convention | Tidak disebut | `TECH-STACK.md`: snake_case(DB/JSON), camelCase(var), PascalCase(type/class) | Tambah |
| Architecture | "Monorepo Product Flavors" (GEMINI.md) | Layered/Hexagonal + Atomic Design (`prompts-frontend.md`) | Adaptasi sebagai panduan struktur |
| Testing framework | Jest + Cypress + Playwright (`package.json`) | Vitest + Playwright (`TESTING.md`) | **Sesuaikan ke Jest** (bukan Vitest) |
| Testing commands | `npm test`, `npm run test:e2e:playwright`, `npm run test:e2e:cypress` | `npm run test:unit`, `npm run test:coverage` | Mapping ke perintah NYATA repo ini |
| Accessibility | Tidak ada | `TYPOGRAPHY.md`: WCAG 4.5:1, touch 44px, font ≥12px | Tambah |
| Typography/Spacing | Inter/Outfit, "warna harmonis" (GEMINI.md) | Scale 4px, type scale, contrast tokens (`TYPOGRAPHY.md`) | Serap scale + contrast |
| Secret hygiene | Aturan 5 GEMINI.md (bagus) | `API-DOCUMENTATION.md` + RLS focus | Perkuat + RLS |
| Security | Tidak eksplisit | PRD: HTTPS, input validation, XSS, CSRF, RLS | Tambah ringkas |
| Robustness/offline | Aturan 3 GEMINI.md (sangat bagus) | Offline mode (`WORK-PLAN.md`) | **PERTAHANKAN** |
| Brand | Kedai Elvera 57 (GEMINI.md benar) | Restoku (cabe/emas) | **PERTAHANKAN brand Elvera**, jangan ganti |
| RBAC role | `PANDUAN_ROLE.md` sebut `cook` (SALAH) | 5 role (Restoku) | **BETULKAN** ke enum nyata `types.ts:213` |

**Temuan bug panduan (harus diperbaiki):** `PANDUAN_ROLE.md` menyatakan 4 nilai valid `manager|owner|waiter|cook` dan menyuruh mengubah ke `admin`/`kitchen`. Fakta kode (`src/app/types.ts:213`): `UserRole = "admin" | "manager" | "owner" | "waiter" | "kitchen"`. Role `cook` **tidak ada**; yang benar adalah `kitchen`.

---

## 3. Deliverable (Daftar File)

### 3.1 File BARU — `docs/GOLDEN-RULES.md`
Panduan baku gaya Restoku, disesuaikan repo ini:
- **TypeScript Strict**: larang `any` di `src/` (target ke depan + kurangi di kode baru); wajib interface/type alias/generics/`unknown`+validasi.
- **Naming**: snake_case untuk kolom Supabase/JSON, camelCase untuk variabel TS, PascalCase untuk tipe/kelas/komponen.
- **Struktur**: dorong pemisahan domain / adapter / UI (Atomic Design: atoms→molecules→organisms), 1 komponen 1 file, batas ukuran (Page ≤200 baris, komponen ≤150).
- **Testing wajib (perintah NYATA repo ini)**:
  - Unit: `npm test` (Jest) / `npm run test:coverage`
  - Integrasi: `npm run test:integration`
  - E2E Playwright: `npm run test:e2e:playwright`
  - E2E Cypress: `npm run test:e2e:cypress`
  - Lint/format: `npm run lint`, `npm run format`
- **Accessibility (WCAG AA)**: kontras teks 4.5:1 (large 3:1), touch target ≥44px, font ≥12px, line-height ≥1.4×.
- **Security**: RLS Supabase aktif di tiap tabel, validasi input (Zod/react-hook-form sudah ada), hindari XSS (jangan `dangerouslySetInnerHTML` sembarangan), jangan hardcode Service Role Key.
- **Secret hygiene**: `.env` di-gitignore; publishable key boleh di client, **Service Role Key harus server/secret**; test spec jangan hardcode URL/key production (pakai `VITE_SUPABASE_URL` dinamis).
- **Robustness/offline**: pertahankan fallback localStorage/IndexedDB + retry exponential backoff (dari GEMINI.md aturan 3).
- **Definition of Done**: lint clean, test pass, no `any` di kode baru, responsive mobile-first, dokumentasi update.

### 3.2 File BARU — `docs/TYPOGRAPHY.md`
Serap sistem Restoku `TYPOGRAPHY.md` untuk repo ini:
- Font: **Inter** (sesuai GEMINI.md existing) sebagai standar, fallback system stack.
- Type scale berbasis 4px: Display 32/40/700, H1 24/32/700, H2 20/28/600, Subtitle 16/24/500, Body 14/20/400, Caption 12/16/500.
- Spacing tokens kelipatan 4px (space-1..space-8).
- WCAG color contrast (tabel rasio) — gunakan palet brand Elvera yang sudah ada, validasi kontras.
- Checklist aksesibilitas.

### 3.3 File BARU — `docs/README.md` (indeks panduan)
Menjelaskan letak & urutan baca panduan: `GEMINI.md` (system prompt) → `docs/GOLDEN-RULES.md` → `docs/TYPOGRAPHY.md` → `PANDUAN_ROLE.md` (RBAC) → `guidelines/Guidelines.md`.

### 3.4 REVISI — `GEMINI.md` (system prompt)
Sisipkan/perkuat tanpa menghapus semangat existing:
- Tambah sub-aturan "Type Safety" (no `any`, explicit type) dan "Naming Convention".
- Tambah "Accessibility (WCAG)" dan "Security & Secret Hygiene (RLS)".
- Perbaiki bagian testing → pakai perintah **Jest/Playwright/Cypress nyata** (`npm test`, `npm run test:e2e:playwright`, dll), bukan narasi umum.
- **PERTAHANKAN**: Identitas brand Kedai Elvera 57, aturan robustness/offline, structured SDLC (plan→task→commit→verify), rollback plan.
- Kalimat "Penutup Wajib" disesuaikan ke bahasa netral (tidak memaksa format kalimat persis) agar tidak kaku, tapi tetap meminta konfirmasi sebelum eksekusi kode panjang.

### 3.5 REVISI — `PANDUAN_ROLE.md` (RBAC — PERBAIKI BUG)
- Betulkan daftar role ke **5 nilai valid** persis `types.ts:213`: `admin`, `manager`, `owner`, `waiter`, `kitchen` (hapus `cook`).
- Perbaiki langkah 5: ganti role via Supabase Table Editor `profiles.role` ke salah satu dari 5 nilai di atas (bukan `admin`/`kitchen` yang kontradiktif).
- Tambah tabel akses per role (berdasarkan `Module` type `types.ts:259` + alur Guest→Kitchen→Waiter→Cashier):
  - `admin` / `owner` / `manager`: akses penuh semua modul.
  - `kitchen`: hanya layar dapur (proses masak / KDS).
  - `waiter`: antar pesanan / pelayanan meja.
  - Default baru = `waiter` (konfirmasi di `StoreContext.tsx`/`useAdminState.ts` saat eksekusi — baca saja, tidak ubah kode).
- Peringatan lowercase dipertahankan.

### 3.6 REVISI — `guidelines/Guidelines.md`
Isi template kosong (hanya komentar HTML). Tambahkan panduan nyata (ringkas) yang merujuk ke `docs/GOLDEN-RULES.md` + `docs/TYPOGRAPHY.md` + aturan no-`any` + responsive flexbox/grid (bukan absolute positioning) + komponen kecil.

---

## 4. Mapping Sumber (Restoku-Next docs → target)

| Sumber | Target di PSRMENUDIGITAL |
|--------|--------------------------|
| `GOLDEN-RULES.md` (no any) | `docs/GOLDEN-RULES.md`, `GEMINI.md` |
| `TECH-STACK.md` (naming, coding standards) | `docs/GOLDEN-RULES.md` |
| `TYPOGRAPHY.md` (scale, contrast, spacing) | `docs/TYPOGRAPHY.md` |
| `TESTING.md` (matrix, commands) | `docs/GOLDEN-RULES.md` (disesuaikan Jest) |
| `prompts-frontend.md` (layered/atomic) | `docs/GOLDEN-RULES.md` (struktur) |
| `PRD.md` (security, brand, responsive) | `docs/GOLDEN-RULES.md`, `GEMINI.md` |
| `WORK-PLAN.md` (offline, DoD) | `docs/GOLDEN-RULES.md` |

---

## 5. Verifikasi (bukan build UI)

Karena UI tidak diubah, verifikasi hanya membuktikan panduan tersusun & tidak ada regresi kode:
1. `git status` → hanya file `.md` yang berubah (bukti: tidak ada `src/`/config ter-modifikasi).
2. `git diff --stat` → konfirmasi hanya markdown.
3. Tidak menjalankan `npm run build` (agar layout tidak tersentuh sama sekali).
4. (Opsional) `npm run lint` dijalankan **hanya jika** ada perubahan ts — **TIDAK**, karena tidak ada ubahan ts. Lewati.
5. README indeks bisa dibuka & link internal konsisten.

---

## 6. Rollback

Setiap file panduan memiliki riwayat git; jika salah, `git checkout -- <file>` atau `git revert`. Karena tidak ada perubahan kode, risiko nol terhadap runtime/fungsi.

---

## 7. Open Questions / Keputusan (minta arahan user)

1. **Skop GEMINI.md**: Setujukah `GEMINI.md` (system prompt Antigravity) ikut direvisi, atau hanya buat `docs/` baru + perbaiki `PANDUAN_ROLE.md`? (Rekomendasi: ikut revisi agar perilaku AI di repo ini selaras.)
2. **Nama brand di panduan**: Pertahankan "Kedai Elvera 57" di semua panduan? (Rekomendasi: YA, jangan ganti ke Restoku — ini clone milik Elvera.)
3. **Testing framework di panduan**: Tulis perintah Jest (nyata di repo)而非 Vitest (punya Restoku)? (Rekomendasi: Jest, karena itu yang terpasang.)
4. **Level detail TYPOGRAPHY.md**: Apakah perlu mencantumkan token warna eksak Elvera (mis. dari `theme.css`/`default_shadcn_theme.css`) atau cukup prinsip scale+contrast? (Rekomendasi: prinsip + rujukan file css ada, tanpa mengubah css.)

---

*Plan disusun sebelum eksekusi sesuai mandat "buat plan dulu". Eksekusi dimulai setelah user menyetujui (dan menjawab open questions 1–4 di atas).*
