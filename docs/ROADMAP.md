# Roadmap — PSRMENUDIGITAL (Kedai Elvera 57 POS)

> Peta jalan fitur & migrasi arsitektur. Berbasis route nyata (`src/app/routes.tsx`) dan arah
> Laravel + Cloudinary (`docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`).
> **Tidak mengubah kode UI** — rencana & task plan.
>
> Fase migrasi: **strangler-fig** (clone Supabase tetap jalan sampai Laravel siap).

---

## Fase 0 — Penyelarasan Panduan (SELESAI, 2026-07-25)

- [x] Seragamkan panduan ke standar Restoku-Next (`GOLDEN-RULES`, `TYPOGRAPHY`, `ARCHITECTURE`, `DEPLOYMENT`, `TESTING`, `CONTRIBUTING`, `ENVIRONMENT`).
- [x] Cabut Supabase dari panduan → arah Laravel 13 + PostgreSQL + Redis.
- [x] Fix `PANDUAN_ROLE.md` (role `admin|manager|owner|waiter|kitchen`).
- [x] Integrasi Cloudinary untuk foto menu (dokumentasi).

## Fase 1 — Setup Backend Laravel (SELESAI struktur, 2026-07-25)
- [x] `backend/` Laravel 11 + PostgreSQL + Redis + Sanctum + Cloudinary SDK proxy.
- [x] Migrations: `menu_items`, `orders`, `event_gallery`, `transactions`.
- [x] Routes `/api/v1/*` + upload proxy Cloudinary (`UploadController`).
- [x] `docker-compose.yml` (app + postgres + redis) + `Dockerfile` + `.env.example`.
- [ ] `composer install` + `php artisan migrate` di VPS (mesin dev ini tidak ada composer).
- [x] Auth: `AuthController` Google OAuth via Socialite (redirect + callback, auto-create user, issue Sanctum token). Menunggu `GOOGLE_CLIENT_ID/SECRET` di VPS.

## Fase 2 — API & Auth (SELESAI endpoint inti)
- [x] Endpoint menu (`/api/v1/menus`, `/sync`).
- [x] Endpoint event-gallery (`/api/v1/event-gallery`).
- [x] Endpoint orders (`/api/v1/orders`) + idempotency_key (cegah duplikat).
- [x] Endpoint transactions (`/api/v1/transactions`).
- [x] Upload proxy Cloudinary (`/api/menu/upload`, `/api/event-gallery/photo`).
- [ ] Test otorisasi Sanctum (ganti `security_rls.test.tsx` → test token).
- [ ] Test otorisasi (ganti `security_rls.test.tsx`).

## Fase 3 — Frontend ke Laravel

> **Update 2026-07-25**: sebagian besar persiapan frontend SUDAH dikerjakan di repo ini
> (helper `menuImageUrl`, `MenuPhotoUploader`/`EventPhotoUploader`, stub backend).
> Sisa: ganti client Supabase → HTTP Laravel, CRUD list via REST, cabut `@supabase/supabase-js`.

- [x] Helper `menuImageUrl` (Cloudinary) di komponen menu (MenuManagement, GuestMenuPage, KasirModule).
- [x] Upload foto menu/event via `uploadMenuPhoto`/`uploadEventPhoto` (mock + real-mode, stub Node bukti).
- [x] Ekstrak `OptimizedImage` + `MenuCard` dari god-component (refactor tahap 1).
- [x] `StoreContext` (menu + order) → HTTP Laravel (poll 30s, hapus realtime Supabase).
- [x] `useAdminState` (admin POS) → `fetchTransactions` HTTP.
- [x] `GuestMenuPage` menu + order → repository/HTTP.
- [x] `QrMenuModule` event → repository/HTTP.
- [x] Tombol "Masuk dengan Google" di `LoginPage` → `/api/v1/auth/google`.
- [x] `fetchPaginatedOrders` → HTTP Laravel.
- [ ] `PhotoUploader` (bucket Supabase) → `menuUpload.ts` proxy Laravel.
- [ ] 18 file sisanya yang masih `import supabase` → migrasi per-module (Karyawan, JadwalShift, KalkulatorHPP, Asset, Dashboard, useSupabaseStatus, test).
- [ ] Hapus `src/lib/supabase.ts` setelah seluruh impor dicabut.
- [ ] Token Sanctum di storage aman (Capacitor SecureStorage / httpOnly cookie).
- [ ] E2E jalan dengan `VITE_USE_MOCKS=false` melawan Laravel (atau stub).

## Fase 4 — Deployment VPS

- [ ] nginx + TLS + Supervisor (queue/scheduler).
- [ ] Build Vite → nginx; Capacitor Android → Play Store/internal.
- [ ] Backup PostgreSQL + monitoring.

---

## Fitur (dari `routes.tsx`) & Task Plan

> Setiap fitur punya spesifikasi + task plan di `docs/features/<nama>.md`.
> Daftar ringkas:

| Route | Fitur | Status | Spesifikasi |
|-------|-------|--------|-------------|
| `/` | Login | ada | `docs/features/login.md` |
| `/admin` (`/transaksi`,`/orders`,`/kasir`,`/meja`,`/menu`,`/promo`,`/qr-menu`,`/stok`,`/metrics`,`/sdm`,`/hpp`) | Admin POS (god-page) | `docs/features/admin-pos.md` |
| `/waiter` (`/kitchen`) | Waiter/Kitchen | ada | `docs/features/waiter-kitchen.md` |
| `/menu/:tableId` | Buku Menu Digital Tamu | ada | `docs/features/guest-menu.md` |
| `/qr-stickers` | QR Sticker Meja | ada | `docs/features/qr-sticker.md` |

Lihat folder `docs/features/` untuk detail tiap fitur.

---

*Sumber: `src/app/routes.tsx`, `docs/ARCHITECTURE.md` §6, `docs/DEPLOYMENT.md`, `CHANGELOG.md`.*
