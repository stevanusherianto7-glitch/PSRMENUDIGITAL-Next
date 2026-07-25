# Fitur: Waiter / Kitchen (KDS) — PSRMENUDIGITAL

> Spesifikasi + task plan. Route: `/waiter` + `/kitchen` (`WaiterPage.tsx`).
> Berbasis `src/app/pages/WaiterPage.tsx` (~755 baris). **Tidak ubah kode.**

---

## 1. Tujuan
Layar pelayanan: waiter input pesanan meja, kirim ke dapur; kitchen (KDS) lihat & update status masak.
Route `/kitchen` merender `WaiterPage` (sama) — perlu pemisahan view KDS vs waiter.

## 2. Peran
- `waiter`: ambil pesanan tamu, kirim ke dapur, update status saji.
- `kitchen`: lihat antrean masak, update `cooking → ready`.

## 3. Alur (Target — Laravel)
- Order per meja → `GET /api/v1/orders?outlet={id}&status=pending`.
- Update status → `PUT /api/v1/orders/{id}/status`.
- Realtime (opsional) → Laravel Reverb channel `orders.{outletId}`.

## 4. Aturan
- Status order: `pending|cooking|ready|served|cancelled` (enum, lihat ARCHITECTURE.md §2).
- Robustness: saat API mati, order tersimpan lokal, sync saat pulih (LWW).
- Offline fallback wajib (GOLDEN-RULES §7).

## 5. Task Plan
- [ ] `refactor(waiter)`: pisah view `KitchenView` vs `WaiterView` (saat ini satu page).
- [ ] `feat(waiter)`: status order → `PUT /api/v1/orders/{id}/status`.
- [ ] `feat(kitchen)`: KDS antrean + update masak (pulse animasi status).
- [ ] `test(waiter)`: `staff.spec.ts` (waiter/kitchen flow) hijau.
- [ ] `test(robustness)`: `robustness.test.tsx` abort API → fallback.

## 6. Verifikasi (DoD)
- `npm test` + `staff.spec.ts` hijau.
- Status order konsisten antar waiter/kitchen.
- No `any`; offline fallback ada.
