# Plan: Migrasi AdminPage + WaiterPage (sisa) dari Supabase → Laravel HTTP

## Konteks
Fase 3 migrasi frontend clone POS "Kedai Elvera 57" ke backend Laravel. 16 file sudah bersih.
Sisa pemakai `src/lib/supabase.ts`:
- `WaiterPage.tsx` (6 ref) — SELESAI (polling /api/v1/meja/SYSTEM_SETTINGS)
- `AdminPage.tsx` (42 ref) — GOD-COMPONENT, butuh migrasi ini
- 2 test files — SELESAI (mock apiFetch)

## Target AdminPage (42 ref → HTTP)
Tabel yang dipakai: `meja`, `inventory`, `inventory_logs`, `transactions`, `transaction_items`, `menu_items`, `reservations`.

### Repository baru (src/lib/repository/)
1. `meja.ts` — fetchMeja/updateMejaStatus/seedMeja (GET/PUT /api/v1/meja, POST seed)
2. `inventory.ts` — fetchInventory/saveInventory/deleteInventory/logInventory (CRUD /api/v1/inventory + /inventory-logs)
3. `reservation.ts` — fetchReservations/saveReservation/deleteReservation (CRUD /api/v1/reservations)
4. `menuCrud.ts` — fetchMenuItems/upsertMenuItem/deleteMenuItem (GET/POST/PUT/DELETE /api/v1/menu-items) — FULL CRUD (MenuController sudah ada index/store; tambah update/destroy)
5. `transaction.ts` (existing) — tambah createTransaction + createTransactionItems

### Controller Laravel yang perlu lengkap
- `MenuController`: tambah `update` + `destroy` (route apiResource sudah cover, method kurang).
- `MejaController`: tambah seed endpoint (POST /api/v1/meja/seed) untuk SEED_TABLES.
- `TransactionController`: tambah `store` (buat transaksi + items).

### AdminPage refactor (per fungsi)
- `loadMeja` → fetchMeja (poll)
- `updateMejaStatus` → updateMejaStatus
- `seedMeja` → POST /api/v1/meja/seed
- `loadInventory` → fetchInventory
- `saveInventory` → saveInventory + logInventory
- `loadReservations` → fetchReservations
- `saveReservation` → saveReservation
- `createTransaction` → createTransaction + createTransactionItems
- `loadMenuItems` → fetchMenuItems (sudah ada fetchMenu, tapi ini CRUD full via menuCrud)
- `menu upsert/delete` → upsertMenuItem/deleteMenuItem
- Hapus 4 channel realtime (meja/tx/orders/reservations) → polling
- `import { supabase }` → hapus

## Risiko
- God-component 1200 baris; salah ganti = UAT broken. Mitigasi: setiap fungsi diubah + jest/build verify.
- Fallback localStorage dipertahankan di repository (mock mode).

## Verifikasi
- `npm run build` hijau
- `npm test` 63+ PASS (termasuk 2 test rewritten)
- `grep -r "lib/supabase" src` → hanya `lib/supabase.ts` sendiri
- Hapus `src/lib/supabase.ts`
- Commit + push
