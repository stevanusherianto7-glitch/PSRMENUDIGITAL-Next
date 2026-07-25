# Fitur: Admin POS (God-Page) — PSRMENUDIGITAL

> Spesifikasi + task plan. Route: `/admin` + alias `/transaksi`,`/orders`,`/kasir`,`/meja`,
> `/menu`,`/promo`,`/qr-menu`,`/stok`,`/metrics`,`/sdm`,`/hpp` (semua `AdminPage.tsx`).
> Berbasis `src/app/pages/AdminPage.tsx` (~1265 baris). **Tidak ubah kode.**

---

## 1. Tujuan
Pusat kendali owner/admin: kasir, transaksi, order, manajemen meja, menu, promo, stok/inventaris,
metrik/laporan, SDM, HPP. Saat ini **satu god-component** (`AdminPage.tsx` ~1265 baris).

## 2. Sub-modul (dari route alias)
| Sub | Fungsi |
|-----|--------|
| Kasir (`/kasir`) | Input order, bayar, cetak struk |
| Transaksi (`/transaksi`) | Riwayat + rekap pembayaran |
| Orders (`/orders`) | Status order aktif |
| Meja (`/meja`) | Kelola meja (status, pax) |
| Menu (`/menu`) | CRUD menu + foto (Cloudinary) |
| Promo (`/promo`) | Diskon/promo |
| QR-Menu (`/qr-menu`) | Generate QR buku menu |
| Stok (`/stok`) | Inventaris |
| Metrics (`/metrics`) | Dashboard/laporan |
| SDM (`/sdm`) | Karyawan/shift |
| HPP (`/hpp`) | Kalkulator HPP |

## 3. Masalah & Renvana
- **God-component** 1265 baris → langgar batas GOLDEN-RULES (page ≤ 200). Perlu refactor ke atomic:
  `KasirModule`, `LaporanModule`, `InventarisModule`, `KaryawanModule`, `MejaModule`, `KalkulatorHPP`
  (sudah ada di `src/app/components/*` sebagai modul terpisah — tinggal di-wire ke route, bukan satu page).

## 4. Alur (Target — Laravel)
- Menu CRUD → `/api/v1/menus` + `/{id}/photo` (Cloudinary).
- Order/Transaksi → `/api/v1/orders`, `/payments`.
- Stok/SDM/Promo → endpoint masing-masing (lihat ARCHITECTURE.md §1.4).

## 5. Aturan
- Foto menu → `menuImageUrl(public_id)` (Cloudinary), fallback SVG.
- Robustness: order tetap bisa dilanjutkan saat API mati (localStorage).
- WCAG AA: kontras, target 44px.

## 6. Task Plan
- [ ] `refactor(admin)`: pecah `AdminPage.tsx` jadi router sub-modul (setiap modul file sendiri).
- [ ] `feat(menu)`: upload foto ke Cloudinary via `/api/v1/menus/{id}/photo`.
- [ ] `feat(kasir)`: void order → `/api/v1/orders/void`.
- [ ] `test(admin)`: `admin.spec.ts` (Playwright) + `admin.cy.ts` (Cypress) hijau.
- [ ] `test(menu)`: CRUD + filter kategori (`menu.spec.ts`).

## 7. Verifikasi (DoD)
- `AdminPage.tsx` < 200 baris (delegate ke modul).
- `npm test` + E2E hijau.
- No `any`; foto menu via Cloudinary.
