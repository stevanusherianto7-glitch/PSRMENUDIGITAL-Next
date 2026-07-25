# Project Guidelines — PSRMENUDIGITAL (Kedai Elvera 57 POS)

Panduan ini untuk AI/developer yang mengerjakan repositori ini. Merujuk ke `docs/GOLDEN-RULES.md`
dan `docs/TYPOGRAPHY.md` untuk detail lengkap.

## General Guidelines

- **Type safety:** Jangan gunakan `any` di kode baru. Gunakan interface/type alias/generics/`unknown`+validasi.
- **Naming:** `snake_case` untuk kolom DB/JSON, `camelCase` untuk variabel/props, `PascalCase` untuk tipe/kelas/komponen.
- **Responsive & layout:** Prefer flexbox/grid yang responsif. Hindari absolute positioning kecuali perlu. Mobile-first (POS utama 320–768px).
- **File size:** 1 komponen 1 file. Page ≤ 200 baris, sub-komponen ≤ 150, hook ≤ 100. Refactor god-component ke atomic design.
- **State:** `react-hook-form` + `zod` untuk form; Context (`StoreContext`) untuk global state.
- **Merge class:** Gunakan `cn()` (clsx + tailwind-merge) untuk className kondisional.

## Design System Guidelines (Brand Elvera 57)

- **Font:** Poppins sebagai font utama (jangan ganti ke Inter/Outfit secara massal).
- **Warna brand:** palet ungu→magenta→merah→oranye→emas. Hindari warna dasar murni untuk elemen utama.
- **Type scale:** kelipatan 4px (Display 32, H1 24, H2 20, Subtitle 16, Body 14, Caption 12). Lihat `docs/TYPOGRAPHY.md`.
- **Kontras:** teks ≥ 4.5:1 (large ≥ 3:1). Touch target ≥ 44×44px. CLS < 0.1.
- **Loading:** Skeleton loading, bukan spinner standar.
- **Micro-animation:** hover/transisi halus pada tombol, kartu, navigasi.

## Security & Robustness

- Otorisasi & isolasi data dienforced di backend (Laravel policies / tenant scope); validasi input (zod) di client + validasi ulang di server.
- Jangan hardcode secret backend / URL production di test spec — gunakan env dinamis (`VITE_API_URL`).
- Offline fallback wajib: localStorage/IndexedDB + retry exponential backoff. Aplikasi tidak boleh crash saat backend timeout.

## References

- `docs/GOLDEN-RULES.md` — aturan emas & Definition of Done.
- `docs/TYPOGRAPHY.md` — tipografi & warna brand.
- `PANDUAN_ROLE.md` — RBAC (role valid: admin, manager, owner, waiter, kitchen).
