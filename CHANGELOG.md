# Changelog — PSRMENUDIGITAL (Kedai Elvera 57 POS)

> Format: [Semantic Versioning](https://semver.org) + Conventional Commits.
> Dokumen ini mencatat perubahan pada **panduan/dokumentasi** repo (karena fase ini baru menyelaraskan
> panduan, belum mengubah kode UI). Untuk perubahan kode, lihat git history (`git log`).
>
> Aturan: setiap rilis dokumentasi dicatat di sini dengan tipe `docs`, `feat` (panduan), `fix` (panduan).

---

## [1.0.0] — 2026-07-25 · Penyelarasan Panduan & Arah Arsitektur

### Added (dokumen panduan baru)
- `docs/TYPOGRAPHY.md` — sistem tipografi & warna brand Elvera (Poppins + palet ungu/magenta/oranye/emas), WCAG, spacing.
- `docs/GOLDEN-RULES.md` — aturan emas: no `any`, naming, arsitektur atomic, testing (Jest), a11y, security, robustness, Definition of Done.
- `docs/ARCHITECTURE.md` — peta transisi Supabase → Laravel 13 + PostgreSQL + Redis; endpoint API, mapping tabel, auth Sanctum, integrasi Cloudinary foto menu.
- `docs/DEPLOYMENT.md` — deployment VPS (nginx + Laravel + Postgres + Redis + Supervisor), env Cloudinary, build Vite/Capacitor.
- `docs/TESTING.md` — testing lokal repo ini (Jest 10 file + Playwright 5 spec + Cypress 4 spec), perintah nyata, coverage threshold 5%.
- `docs/CONTRIBUTING.md` — cara kontribusi, Conventional Commits, Definition of Done, hard rules.
- `docs/ENVIRONMENT.md` — ringkasan variabel env (frontend `VITE_*` + backend Laravel rahasia), mapping Supabase→Laravel.
- `docs/README.md` — indeks panduan.
- `guidelines/Guidelines.md` — ringkasan panduan untuk AI.

### Changed
- `GEMINI.md` — stack diubah ke Laravel 13 + PostgreSQL + Redis (Supabase dicabut sebagai backend); fallback "backend" bukan Supabase; secret backend di server.
- `PANDUAN_ROLE.md` — perbaiki role valid (`admin|manager|owner|waiter|kitchen`, bukan `cook`); tambah catatan arsitektur target Laravel.

### Fixed
- `PANDUAN_ROLE.md` — bug referensi role (`cook` tidak ada di `src/app/types.ts:213`); sekarang merujuk enum nyata.

### Notes
- **UI/layout frontend TIDAK diubah** di seluruh fase penyelarasan ini.
- Clone masih memakai Supabase; migrasi ke Laravel dilakukan bertahap (strangler-fig) — lihat `docs/ARCHITECTURE.md` §6.

---

## [Unreleased] — Rencana

- `docs/ROADMAP.md` — peta jalan fitur & migrasi (lihat file terpisah).
- Spesifikasi fitur & task plan per fitur (lihat `docs/ROADMAP.md` / `docs/features/*`).
- Ganti `security_rls.test.tsx` → test otorisasi Laravel pasca-migrasi.
- Cabut `@supabase/supabase-js` dari `src/lib/supabase.ts`.

---

<!--
Template entri baru:
## [x.y.z] — YYYY-MM-DD
### Added
### Changed
### Fixed
### Removed
### Notes
-->
