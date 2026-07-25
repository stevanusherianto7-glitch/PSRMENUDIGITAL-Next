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

## Fase 1 — Setup Backend Laravel (Target)

- [ ] Inisialisasi proyek Laravel 13 + PostgreSQL + Redis.
- [ ] Sanctum + Socialite (Google OAuth owner).
- [ ] Migrasi skema dari `src/lib/schema.sql` (lihat `ARCHITECTURE.md` §2).
- [ ] Tenant scope (multi-tenant, `slug` global-unique).
- [ ] Cloudinary SDK server-side (`CLOUDINARY_URL`).
- [ ] Seeder awal (outlet default, role default `waiter`).

## Fase 2 — API & Auth

- [ ] Endpoint auth (`/api/v1/auth/*`, `/oauth/google`).
- [ ] Endpoint menu + upload foto Cloudinary (`/api/v1/menus`, `/{id}/photo`).
- [ ] Endpoint order/transaksi/meja (`/api/v1/orders`, `/payments`, `/tables`).
- [ ] Endpoint modul (inventaris, SDM, promo, laporan, dashboard).
- [ ] Test otorisasi (ganti `security_rls.test.tsx`).

## Fase 3 — Frontend ke Laravel

> **Update 2026-07-25**: sebagian besar persiapan frontend SUDAH dikerjakan di repo ini
> (helper `menuImageUrl`, `MenuPhotoUploader`/`EventPhotoUploader`, stub backend).
> Sisa: ganti client Supabase → HTTP Laravel, CRUD list via REST, cabut `@supabase/supabase-js`.

- [x] Helper `menuImageUrl` (Cloudinary) di komponen menu (MenuManagement, GuestMenuPage, KasirModule).
- [x] Upload foto menu/event via `uploadMenuPhoto`/`uploadEventPhoto` (mock + real-mode, stub Node bukti).
- [x] Ekstrak `OptimizedImage` + `MenuCard` dari god-component (refactor tahap 1).
- [x] `src/lib/api.ts` (HTTP client Laravel) + `src/lib/repository/{menu,event,order}.ts` (data-layer, fallback localStorage).
- [x] `QrMenuModule` event CRUD → `repository/event.ts` (ganti `supabase.from('event_gallery')`).
- [ ] `MenuManagement` / `GuestMenuPage` menu CRUD → `repository/menu.ts`.
- [ ] `GuestMenuPage` / `OrdersModule` order submit → `repository/order.ts`.
- [ ] `StoreContext` / `useAdminState` (admin POS meja/transactions) → HTTP Laravel + cabut realtime Supabase.
- [ ] Token Sanctum di storage aman (Capacitor SecureStorage / httpOnly cookie).
- [ ] Cabut `@supabase/supabase-js` (hapus `src/lib/supabase.ts` + `info.ts(x)`).
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
