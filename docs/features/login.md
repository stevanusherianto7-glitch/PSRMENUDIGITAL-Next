# Fitur: Login — PSRMENUDIGITAL

> Spesifikasi + task plan. Route: `/` (`src/app/pages/LoginPage.tsx`).
> Berbasis `LoginFlow.test.tsx`, `src/lib/supabase.ts`, `types.ts`. **Tidak ubah kode.**

---

## 1. Tujuan
Autentikasi pengguna (admin/manager/owner/waiter/kitchen) via email+password atau Google OAuth.
Setelah login, arahkan ke layar sesuai role.

## 2. Peran & Akses (dari `types.ts:213`)
`UserRole = "admin" | "manager" | "owner" | "waiter" | "kitchen"` (default `waiter`).

| Role | Redirect setelah login |
|------|------------------------|
| admin / manager / owner | `/admin` |
| waiter / kitchen | `/waiter` (kitchen lihat KDS) |

## 3. Alur (Saat Ini — Supabase)
1. User input email + password → `supabase.auth.signInWithPassword`.
2. Google → `supabase.auth.signInWithOAuth`.
3. Simpan session; arahkan berdasar `role`.

## 4. Alur (Target — Laravel Sanctum, lihat ARCHITECTURE.md §3)
1. `POST /api/v1/auth/login` → `{ token, user:{role,...} }`.
2. `GET /oauth/google` → Google (Socialite) → callback buat/ambil user.
3. Simpan `token` di storage aman; header `Authorization: Bearer`.

## 5. Aturan
- Validasi input (`zod`): email format, password min 8.
- Error transparan (bukan "success" palsu) — lihat GOLDEN-RULES.
- Offline: cache session di localStorage; fallback ke mock bila `VITE_USE_MOCKS=true`.

## 6. Task Plan
- [ ] `fix(login)`: error handling eksplisit saat API gagal.
- [ ] `feat(login)`: ganti `supabase.auth` → `POST /api/v1/auth/login`.
- [ ] `feat(login)`: token Sanctum di storage aman (SecureStorage / httpOnly cookie).
- [ ] `feat(login)`: Google OAuth ke `/oauth/google` (Socialite).
- [ ] `test(login)`: `LoginFlow.test.tsx` coverage redirect per role.
- [ ] `test(login)`: scenario password salah → error; token expired → refresh.

## 7. Verifikasi (DoD)
- `npm test` (LoginFlow) hijau.
- `npm run lint` bersih.
- Tidak ada `any`; redirect benar per role.
