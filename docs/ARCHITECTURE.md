# Arsitektur & Transisi Supabase → Laravel — PSRMENUDIGITAL (Kedai Elvera 57 POS)

> Dokumen ini memetakan **rencana transisi** backend dari Supabase (clone saat ini) ke
> **Laravel 13 + PostgreSQL + Redis** (arah seragam Restoku-Next), plus integrasi
> **Cloudinary** untuk foto menu. Ini adalah dokumen panduan/arsitektur — **tidak mengubah kode UI**.
>
> Sumber fakta clone: `src/app/types.ts`, `src/lib/supabase.ts`, `package.json`, `src/lib/schema.sql`,
> `supabase/migrations/*`. Sumber target: `Restoku_Refactored/Restoku-Next/docs/{API-DOCUMENTATION,PRD,TECH-STACK}.md`.

---

## 0. Ringkasan Perubahan

| Aspek | Saat Ini (clone) | Target (Laravel) |
|-------|-----------------|------------------|
| DB | Supabase Postgres | PostgreSQL 15 (self-managed / VPS) |
| Auth | Supabase Auth (magiclink/OAuth) | Laravel Sanctum (Bearer token) + Google OAuth (Socialite) |
| Realtime | Supabase Realtime | Laravel Reverb (WebSocket) — opsional |
| Otorisasi | RLS Supabase | Laravel Policies + Tenant Scope (multi-tenant) |
| File/Image | Supabase Storage | **Cloudinary** (foto menu) |
| API | Supabase Data API (auto) | RESTful JSON (`/api/v1/*`) dikemas Laravel |
| Client | `@supabase/supabase-js` | `fetch`/axios ke `VITE_API_URL` |

---

## 1. Endpoint API (Mapping Supabase → Laravel)

Frontend memanggil `import.meta.env.VITE_API_URL` (default `http://localhost:8080`), bukan Supabase client.

### 1.1 Auth

| Fungsi | Supabase (saat ini) | Laravel Endpoint | Method |
|--------|---------------------|-----------------|--------|
| Login email/password | `supabase.auth.signInWithPassword` | `/api/v1/auth/login` | POST |
| Login Google | `supabase.auth.signInWithOAuth` | `/oauth/google` (Socialite) | GET/POST |
| Logout | `supabase.auth.signOut` | `/api/v1/auth/logout` | POST |
| Refresh token | session auto | `/api/v1/auth/refresh` | POST |
| Profil saya | `supabase.auth.getUser` | `/api/v1/auth/me` | GET |
| Register/role default | trigger DB | `/api/v1/auth/register` (default `waiter`) | POST |

> **Auth response (Laravel):** `{ success, data: { user: {id,name,email,role,tenant_id,outlet_id}, token, refreshToken } }`.
> Simpan `token` di storage aman (Capacitor SecureStorage / httpOnly cookie), lampirkan header `Authorization: Bearer <token>`.

### 1.2 Menu (foto menu → Cloudinary, lihat §4)

| Fungsi | Supabase (saat ini) | Laravel Endpoint | Method |
|--------|---------------------|-----------------|--------|
| List menu (admin) | `from('menu_items').select()` | `/api/v1/menus` | GET |
| CRUD menu | `insert/update/delete` | `/api/v1/menus`, `/api/v1/menus/{id}` | POST/PUT/DELETE |
| Upload foto menu | Supabase Storage | `/api/v1/menus/{id}/photo` (proxy ke Cloudinary) | POST |
| Menu publik (QR tamu) | `from('menu_items').eq('outlet', ...)` | `/api/v1/public/menus/{outletSlug}` | GET |
| Kategori | `from('menu_categories')` | `/api/v1/menu-categories` | GET/POST |

### 1.3 Order / Transaksi / Meja

| Fungsi | Supabase (saat ini) | Laravel Endpoint | Method |
|--------|---------------------|-----------------|--------|
| Buat order (guest/waiter/kasir) | `from('orders').insert` | `/api/v1/orders` | POST |
| Status order | `from('orders').update({status})` | `/api/v1/orders/{id}/status` | PUT |
| Order per meja/outlet | `from('orders').eq('table_id',...)` | `/api/v1/orders?outlet={id}&status=...` | GET |
| Void order | (belum ada) | `/api/v1/orders/void` | POST |
| Transaksi / pembayaran | `from('transactions').insert` | `/api/v1/payments/create`, `/status/{id}` | POST/GET |
| Meja | `from('tables').select()` | `/api/v1/tables`, `/api/v1/tables/{id}` | GET/PUT |
| QR meja | generate di client | `/api/v1/outlets/{slug}/qr` (atau client-build dari slug) | GET |

### 1.4 Modul Lain (inventaris, SDM, promo, laporan)

| Fungsi | Laravel Endpoint | Method |
|--------|------------------|--------|
| Inventaris | `/api/v1/inventory`, `/api/v1/inventory/{id}` | GET/POST/PUT |
| Karyawan/SDM | `/api/v1/employees`, `/api/v1/attendance` | GET/POST |
| Promo | `/api/v1/promos` | GET/POST |
| Laporan | `/api/v1/reports/sales?period=daily|weekly|monthly` | GET |
| Dashboard | `/api/v1/dashboard` | GET |
| Multi-outlet | `/api/v1/outlets`, `/api/v1/outlets/{id}` | GET/POST/PUT |

---

## 2. Mapping Tabel (Supabase → Laravel Migration)

Skema diambil dari `src/lib/schema.sql` & `supabase/migrations/*`. Kolom tetap `snake_case`.

| Entitas | Tabel Supabase (saat ini) | Tabel Laravel (target) | Catatan |
|---------|---------------------------|------------------------|--------|
| User/Profil | `profiles` (`id`,`email`,`name`,`role`,`outlet_id`,`tenant_id`) | `users` + `tenants` + `outlets` | `role` enum: `admin|manager|owner|waiter|kitchen` |
| Menu item | `menu_items` (`id`,`name`,`category`,`price`,`image`,`available`,`tag`,`description`) | `menu_items` | `image` → simpan **Cloudinary public_id**, bukan URL storage |
| Kategori | `menu_categories` | `menu_categories` | |
| Order | `orders` (`id`,`table_id`,`items`,`subtotal`,`total`,`notes`,`order_mode`,`status`,`type`,`created_at`,`updated_at`) | `orders` + `order_items` | `items` dinormalisasi ke `order_items` |
| Order status | enum `pending|cooking|ready|served|cancelled` | sama (enum/check constraint) | |
| Transaksi | `transactions` (`id`,`table_id`,`items`,`subtotal`,`discount`,`tax`,`total`,`method`,`order_id`) | `transactions` | |
| Meja | `tables` (`id`,`seat`,`status`,`pax`,`total`,`orders`) | `tables` | `status`: `available|occupied|service|reserved` |
| Inventaris | `inventory_items` | `inventory_items` | FIFO/LIFO via `method` |
| Promo | `promos` | `promos` | |
| Shift/SDM | `employees`,`attendance`,`shifts` | `employees`,`attendances`,`shifts` | |

### 2.1 Multi-Tenant (Penting)

Laravel pakai **shared-DB, shared-schema multi-tenancy** via `TenantScope` + `tenant_id` di tiap tabel.
Semua query dienforced tenant (Laravel Policy / global scope), bukan RLS. Outlet `slug` **global-unique**
(route buku menu publik `/m/{slug}`).

```php
// contoh TenantScope (Laravel)
Order::addGlobalScope(new TenantScope); // filter otomatis by auth tenant_id
```

---

## 3. Autentikasi — Laravel Sanctum

### 3.1 Flow

```
Login (email+password) ──► POST /api/v1/auth/login
  ◄── { token: "Bearer...", refreshToken, user:{role,...} }

Setiap request:
  Authorization: Bearer <token>

Logout:
  POST /api/v1/auth/logout  (revoke token)

Refresh (sebelum expired):
  POST /api/v1/auth/refresh { refreshToken } ──► { token: baru }
```

### 3.2 Google OAuth (Owner)

- `GET /oauth/google` → redirect ke Google (Socialite).
- `GET /oauth/google/callback` → buat/ambil user; auto-create tenant+outlet+owner jika email baru.
- Tolak email unverified/null.
- Di VPS: set `GOOGLE_REDIRECT_URI` = `https://domain/oauth/google/callback`.

### 3.3 Role & Akses (dari `types.ts:213`)

`UserRole = "admin" | "manager" | "owner" | "waiter" | "kitchen"` (default `waiter`).
Middleware Laravel: `role:admin,manager,owner` untuk void order; `kitchen` hanya KDS; `waiter` hanya layar pelayanan.

### 3.4 Keamanan

- Token di storage aman (bukan JS global yang bisa di-XSS).
- Validasi input di Laravel Form Request + `zod` di client.
- HTTPS everywhere. Secret (`DB_PASSWORD`, `APP_KEY`) hanya di server/`.env` (gitignored).

---

## 4. Cloudinary — Foto Menu

Foto menu **tidak** lagi disimpan di Supabase Storage. Menggunakan **Cloudinary** (seragam Restoku-Next):
- Cloud name: `dwdaydzsh` (publik, aman di client/URL).
- Upload via backend proxy (`/api/v1/menus/{id}/photo`) → Cloudinary signed upload / server-side upload.
- Di DB hanya simpan **public_id** (`menu_items.image`), BUKAN URL penuh.
- Frontend bangun URL transform on-the-fly.

### 4.1 Helper URL (frontend) — IMPLEMENTED

```ts
// src/lib/cloudinary.ts  (SUDAH ADA — menggantikan path Supabase Storage)
// CLOUDINARY_CLOUD_NAME diambil dari import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "dwdaydzsh"
export function menuImageUrl(image, opts?) {
  // image bisa: public_id Cloudinary | URL absolut (legacy Supabase) | data: | kosong
  // - kosong -> MENU_IMAGE_FALLBACK (SVG lokal)
  // - URL absolut/data: -> lewat utuh (backward-compat)
  // - public_id -> https://res.cloudinary.com/{cloud}/image/upload/w_,h_,c_fill,q_auto,f_auto/{id}
}
```

Fungsi murni `resolveMenuImage`/`buildCloudinaryUrl` diekspos untuk testability (Jest).

### 4.2 Pemakaian di Komponen Menu — IMPLEMENTED

| Komponen | Status |
|----------|--------|
| `MenuManagement.tsx` (kartu menu) | ✅ `menuImageUrl(item.image)` |
| `GuestMenuPage.tsx` via `OptimizedImage` (list/selected/gallery) | ✅ `menuImageUrl` |
| `KasirModule.tsx` (item keranjang) | ✅ `menuImageUrl(...)` |
| `PhotoUploader.tsx` (event gallery `QrMenuModule`) | ⏳ tetap Supabase (bukan foto menu; Fase 3) |

### 4.3 Upload Flow — IMPLEMENTED (mock-mode, real-mode saat Laravel ada)

```ts
// src/lib/menuUpload.ts
uploadMenuPhoto(file, name, { apiBase }) -> { public_id }
// - mock mode (VITE_API_URL kosong): hasilkan public_id lokal `menu/<slug>_<rand>`
//   (langsung kompatibel menuImageUrl, tanpa backend)
// - real mode (VITE_API_URL diisi): POST {apiBase}/api/menu/upload (multipart)
//   -> Laravel proxy -> Cloudinary server-side -> { public_id }

// src/app/components/MenuPhotoUploader.tsx (pengganti PhotoUploader untuk MENU)
// dipakai di MenuItemModal.tsx (form tambah/edit menu)
```

```text
MenuPhotoUploader ──► uploadMenuPhoto()
  ├─ mock: public_id lokal `menu/<slug>_<rand>` (tanpa backend)
  └─ real: POST {VITE_API_URL}/api/menu/upload (multipart)
        └─ Laravel ──► Cloudinary (CLOUDINARY_URL server-only)
              ◄── { public_id }
        Laravel simpan public_id ke menu_items.image
```

> **Keamanan:** `.env` frontend hanya `VITE_CLOUDINARY_CLOUD_NAME` (publik). API key/secret **hanya di server** Laravel (`CLOUDINARY_URL=cloudinary://...@dwdaydzsh`). Jangan ekspos secret ke build.
> **Catatan mock-mode:** karena repo ini belum punya backend Laravel, upload menghasilkan `public_id` lokal agar alur tersimpan & bisa di-render saat backend siap. Foto asli baru muncul (HTTP 200) setelah `VITE_API_URL` diisi + endpoint Laravel deploy (lihat `docs/ROADMAP.md` Fase 3).

### 4.4 Mapping dari clone saat ini

| Clone (saat ini) | Target |
|------------------|--------|
| `item.image` = URL Supabase Storage (`...supabase.co/storage/...`) | `item.image` = **Cloudinary public_id** (`Ayam_Goreng_..._qsbpul`) |
| Fetch via `supabase.storage().from('menu').getPublicUrl()` | `menuImageUrl(public_id)` (build URL Cloudinary) |
| Folder `src/app/pages/GuestMenuPage.tsx` render `<img src={item.image}>` | ganti ke `menuImageUrl(item.image)` |
| `PhotoUploader` (Supabase) di `MenuItemModal` | `MenuPhotoUploader` (`uploadMenuPhoto`) |
| `PhotoUploader` (Supabase) di `QrMenuModule` (event) | `EventPhotoUploader` (`uploadEventPhoto`) |

### 4.6 Data-Layer Repository (pengganti Supabase client)

Untuk migrasi ke Laravel tanpa break app, dibuat lapisan `src/lib/repository/*`
sebagai data-layer ter-abstraksi. App memanggil repository, bukan `supabase` langsung.

| Repository | Endpoint Laravel | Fallback (VITE_API_URL kosong) |
|------------|------------------|-------------------------------|
| `repository/menu.ts` | `/api/v1/menus` (GET/POST/PUT/DELETE + `/sync`) | `localStorage['local_menu_items']` |
| `repository/event.ts` | `/api/v1/event-gallery` (GET/POST/DELETE) | `localStorage['local_event_gallery']` |
| `repository/order.ts` | `/api/v1/orders` (GET/POST) | `localStorage['local_orders']` |

`src/lib/api.ts` = HTTP client (`apiFetch`) yang baca `VITE_API_URL` + token Sanctum
dari `localStorage['sanctum_token']`. `isBackendConfigured()` → true bila `VITE_API_URL` diisi.

**Status wiring (2026-07-25):**
- ✅ `QrMenuModule` (event gallery CRUD) → `repository/event.ts`.
- ✅ `GuestMenuPage` menu load → `repository/menu.ts`; order → `api.ts` (`/api/v1/orders`).
- ✅ `useAdminState` (admin POS): `loadTransactions` → `fetchTransactions()` (`/api/v1/transactions`).
- ✅ `api.ts`: `createOrder/fetchOrders/updateOrder/deleteOrder/fetchTransactions/fetchPaginatedOrders` → HTTP + fallback localStorage.
- ✅ `StoreContext`: `refreshMenu` → `fetchMenu()`; hapus realtime channel Supabase → polling 30s. **0 reference `supabase` di StoreContext.**
- ✅ Google login: tombol "Masuk dengan Google" di `LoginPage` → redirect `/api/v1/auth/google` (Socialite), callback balik `?token=` → simpan localStorage.
- ⏳ `src/lib/supabase.ts` MASIH ADA (deprecated): 18 file lain masih pakai (PhotoUploader bucket, KaryawanModule, JadwalShift, KalkulatorHPP, AssetModule, DashboardModule, useSupabaseStatus, test security_rls/sdm_robustness). Butuh migrasi per-module (di luar scope StoreContext).
- ⏳ `PhotoUploader.tsx` masih `supabase.storage()` → belum di-wire ke `menuUpload.ts` proxy Laravel.

> Backend Laravel SUNGGUHAN ada di `backend/` (Laravel 11 + Sanctum + Cloudinary proxy).
> Jalankan: `cd backend && composer install && cp .env.example .env && php artisan key:generate && php artisan migrate && docker-compose up -d`.
> `src/lib/supabase.ts` **dibiarkan** (legacy) sampai seluruh modul di-wire ke repository.

## 5. Realtime (Opsional)

- Clone: Supabase Realtime (subscription order/meja).
- Target: **Laravel Reverb** (WebSocket). Frontend subscribe via `laravel-echo` ke channel `orders.{outletId}`.
- Fallback: tetap ada polling + localStorage cache (robustness rules di `GOLDEN-RULES.md`).

---

## 6. Rencana Migrasi (Batch)

1. **Setup Laravel** + PostgreSQL + Redis + Sanctum + Socialite + Cloudinary SDK.
2. **Migrasi skema**: buat migration dari §2 (tenant_id di tiap tabel).
3. **Seed**: konversi data Supabase → Laravel (script ETL sekali jalan).
4. **Auth**: implementasi `/api/v1/auth/*` + `/oauth/google`.
5. **Menu + Cloudinary**: API CRUD + proxy upload; ubah `item.image` jadi public_id; ganti helper URL di komponen.
6. **Order/Transaksi/Meja**: API + policies multi-tenant.
7. **Cabut `@supabase/supabase-js`** dari `src/lib/supabase.ts` → ganti HTTP client ke `VITE_API_URL`.
8. **Test**: ganti `security_rls.test.tsx` → test otorisasi Laravel; Jest + Playwright hijau.

---

## 7. Catatan Tidak Diubah

- **UI/layout frontend tidak diubah** oleh dokumen ini.
- `.agents/skills/supabase/*` & `CREDENTIALS.md` tetap ada (skill bawaan / kredensial clone) — bukan bagian migrasi panduan.
- Clone masih bisa jalan dengan Supabase sampai batch §6 selesai; migrasi bertahap (strangler-fig pattern).

---

*Sumber: `src/app/types.ts`, `src/lib/supabase.ts`, `package.json`, `Restoku_Refactored/Restoku-Next/docs/{API-DOCUMENTATION,PRD,TECH-STACK}.md`.*
