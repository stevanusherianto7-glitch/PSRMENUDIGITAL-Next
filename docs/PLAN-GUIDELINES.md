# CATATAN ARSITEK — Penyeragaman Panduan PSRMENUDIGITAL

**Tanggal:** 2026-07-25
**Status:** SELESAI (eksekusi selesai, lihat `CHANGELOG.md` v1.0.0 + commit `b2530f5`)
**Penulis:** Arsitek (Hermes Agent)

> Dokumen ini adalah **rekam jejak keputusan arsitektur** untuk fase penyelarasan panduan.
> Bukan draft aktif — semua poin di bawah SUDAH dieksekusi.

---

## 1. Keputusan Arsitektur (Mutlak)

| Aspek | Keputusan | Bukti/Fakta |
|-------|----------|-------------|
| Backend | **Laravel 13 + PostgreSQL + Redis** (bukan Supabase) | Instruksi user "(jangan Supabase)" |
| Foto menu | **Cloudinary** (cloud `dwdaydzsh`), DB simpan `public_id` | Kebiasaan Restoku; `docs/ARCHITECTURE.md` §4 |
| Auth | **Laravel Sanctum** + Google OAuth (Socialite) | `docs/ARCHITECTURE.md` §3 |
| Deploy | **VPS (nginx)**, bukan Vercel/Forge sebagai platform utama | `docs/DEPLOYMENT.md` |
| UI/layout | **TIDAK diubah** (hanya `.md`) | `git diff --stat` tiap commit |
| Brand | **Kedai Elvera 57** (Poppins + palet ungu/magenta/oranye/emas) | `docs/TYPOGRAPHY.md` |
| Testing | **Jest** (bukan Vitest) + Playwright + Cypress | `package.json`, `docs/TESTING.md` |
| Role | `admin|manager|owner|waiter|kitchen` (bukan `cook`) | `src/app/types.ts:213` |
| Struktur | **Single-app role-based** (bukan Product Flavors) | `src/app/routes.tsx` |

---

## 2. Fase Eksekusi (SELESAI)

1. `docs/GOLDEN-RULES.md` — no `any`, naming, DoD, security/otorisasi backend.
2. `docs/TYPOGRAPHY.md` — Poppins + palet Elvera + WCAG.
3. `PANDUAN_ROLE.md` — fix role (`kitchen`, bukan `cook`) + tabel akses.
4. `GEMINI.md` — stack Laravel/VPS, fallback backend, port benar (`localhost:8080`, `127.0.0.1:5432`), Cypress `:5173`/1280×720.
5. `guidelines/Guidelines.md` — isi template kosong.
6. Cabut Supabase dari seluruh panduan → arah Laravel.
7. `docs/ARCHITECTURE.md` — transisi Supabase→Laravel + Cloudinary.
8. `docs/DEPLOYMENT.md` — VPS + Cloudinary env.
9. `docs/TESTING.md` — Jest/Playwright/Cypress (fakta repo).
10. `docs/CONTRIBUTING.md` — conventional commits + DoD.
11. `docs/ENVIRONMENT.md`, `CHANGELOG.md`, `docs/ROADMAP.md`, `docs/features/*.md`.

---

## 3. Inconsistensi yang Sudah Diperbaiki (Arsitek Review)

- GEMINI.md: "Vercel" → "VPS"; "Product Flavors" → "single-app role-based" (fakta routes.tsx).
- GEMINI.md: port `127.0.0.1:54321` (Supabase) → `127.0.0.1:5432` (PostgreSQL) / `localhost:8080` (Laravel API).
- GEMINI.md: Cypress "port 5656, 1280x800" → `localhost:5173`, 1280×720 (cocok cypress.config.ts).
- GOLDEN-RULES.md: port `54321` → `5432`.
- README.md: "Deploy: Vercel" → "VPS".
- ENVIRONMENT.md: mapping `VITE_SUPABASE_*` → `VITE_API_URL` (Laravel target).

---

## 4. Catatan Migrasi (Open, untuk eksekusi kode nanti — BUKAN panduan)

- Cabut `@supabase/supabase-js` dari `src/lib/supabase.ts` → HTTP client `VITE_API_URL`.
- Ganti `item.image` (URL Supabase Storage) → `menuImageUrl(public_id)` Cloudinary.
- `security_rls.test.tsx` (legacy Supabase) → test otorisasi Laravel.
- Refactor god-components: `AdminPage.tsx` (~1265 baris), `GuestMenuPage.tsx` (~2156 baris),
  `WaiterPage.tsx` (~755 baris) → atomic (≤200 baris per page).
- Multi-outlet: `slug` global-unique untuk route buku menu publik.

---

*Rekam jejak fase penyelaraman panduan. Untuk konvensi kode aktif, baca `docs/GOLDEN-RULES.md` + `docs/CONTRIBUTING.md`.*
