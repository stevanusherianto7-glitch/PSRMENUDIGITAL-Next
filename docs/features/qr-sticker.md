# Fitur: QR Sticker Meja — PSRMENUDIGITAL

> Spesifikasi + task plan. Route: `/qr-stickers` (`QRStickerPage.tsx`).
> Berbasis `src/app/pages/QRStickerPage.tsx` (~317 baris) + `QRStickerPage.css`. **Tidak ubah kode.**

---

## 1. Tujuan
Generate & cetak sticker QR per meja → tamu scan untuk buka buku menu (`/menu/:tableId`).

## 2. Alur
1. Pilih outlet / range meja (A1–A9, B1–B3 per lantai).
2. Generate QR = `${VITE_GUEST_BASE_URL}/menu/${tableId}`.
3. Cetak (print CSS) atau export.

## 3. Aturan
- QR value pakai `VITE_GUEST_BASE_URL` (bukan hardcode localhost).
- Saat VPS: `VITE_GUEST_BASE_URL=https://app.elongera.id` (lihat DEPLOYMENT.md).
- Robustness: bila `VITE_GUEST_BASE_URL` kosong → fallback ke `window.location.origin`.

## 4. Alur (Target — Laravel)
- Outlet slug global-unique (`/m/{slug}`), QR bisa pakai slug: `${base}/m/{slug}?t=${tableId}`
  (seragam Restoku). Opsi: generate di client dari `outletSlug`.

## 5. Task Plan
- [ ] `feat(qr)`: URL QR dari `VITE_GUEST_BASE_URL` (bukan hardcode).
- [ ] `feat(qr)`: dukung format `/m/{slug}?t={tableId}` (global-unique).
- [ ] `test(qr)`: decode QR balik → URL match + HTTP 200 (verifikasi visual, lihat GOLDEN-RULES).
- [ ] `style(qr)`: print CSS rapi (sesuai `QRStickerPage.css`).

## 6. Verifikasi (DoD)
- QR ter-decode ke URL yang benar (bukti nyata, bukan build exit-0).
- `npm run lint` bersih; no `any`.
