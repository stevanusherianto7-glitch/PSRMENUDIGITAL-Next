# Fitur: Buku Menu Digital Tamu — PSRMENUDIGITAL

> Spesifikasi + task plan. Route: `/menu/:tableId` (`GuestMenuPage.tsx`).
> Berbasis `src/app/pages/GuestMenuPage.tsx` (~2156 baris). **Tidak ubah kode.**

---

## 1. Tujuan
Tamu scan QR meja → buka buku menu digital, lihat menu + foto, pesan ke meja (`tableId`).
Ukuran besar (~2156 baris) → kandidat refactor god-component.

## 2. Akses
- Publik (tanpa login). Base URL dari `VITE_GUEST_BASE_URL` (untuk QR sticker).
- Foto menu → Cloudinary (`menuImageUrl(public_id)`).

## 3. Alur (Target — Laravel)
- Menu publik → `GET /api/v1/public/menus/{outletSlug}`.
- Order tamu → `POST /api/v1/orders` (mode `guest`, `table_id`).
- Tidak perlu auth; validasi meja aktif.

## 4. Aturan
- Foto menu → Cloudinary, fallback SVG bila gagal.
- Tampilan identik di semua origin (HP via QR / desktop) — state dari **server**, bukan localStorage
  (lihat GOLDEN-RULES: public UI server-driven).
- WCAG AA; mobile-first.

## 5. Task Plan
- [ ] `refactor(guest)`: pecah `GuestMenuPage.tsx` (2156 baris) ke sub-komponen (MenuList, Cart, MenuItemCard).
- [ ] `feat(guest)`: ganti `item.image` (URL Supabase) → `menuImageUrl(public_id)` Cloudinary.
- [ ] `feat(guest)`: order tamu → `POST /api/v1/orders` (Laravel).
- [ ] `test(guest)`: E2E buka `/menu/:tableId` dari QR (mock-fallback.spec.ts).
- [ ] `a11y(guest)`: kontras + target 44px.

## 6. Verifikasi (DoD)
- `GuestMenuPage.tsx` < 200 baris (delegate).
- Foto menu load dari Cloudinary (URL `res.cloudinary.com/dwdaydzsh/...`).
- `npm test` + E2E hijau; no `any`.
