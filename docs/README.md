# Panduan & Dokumentasi — PSRMENUDITAL (Kedai Elvera 57 POS)

Folder ini berisi **panduan penulisan kode & konvensi** untuk repositori PSRMENUDIGITAL_CLONE.
Panduan diseragamkan dari standar `Restoku_Refactored/Restoku-Next/docs/*` namun disesuaikan
dengan stack & brand asli repositori ini (React + Vite + Supabase + Capacitor, brand Kedai Elvera 57).

> **Catatan:** Seluruh panduan di sini hanya bersifat dokumentasi/konvensi.
> **Tidak ada UI/layout yang diubah** saat menyusun dokumen ini.

---

## Urutan Baca

1. **`GEMINI.md`** (root) — System prompt / peran AI saat mengerjakan repo ini.
2. **`docs/GOLDEN-RULES.md`** — Aturan emas: no `any`, naming, arsitektur, testing, a11y, security, robustness, brand, Definition of Done.
3. **`docs/TYPOGRAPHY.md`** — Sistem tipografi & warna brand Elvera (Poppins + palet ungu/magenta/oranye/emas), WCAG, spacing.
4. **`PANDUAN_ROLE.md`** (root) — Cara mengubah role karyawan (RBAC) di Supabase. **PENTING:** role valid = `admin | manager | owner | waiter | kitchen`.
5. **`guidelines/Guidelines.md`** (root) — Ringkasan panduan untuk AI (merujuk ke docs di atas).

---

## Daftar Panduan

| File | Isi |
|------|-----|
| `GEMINI.md` | Identitas & aturan emas AI (Senior Full-Stack Architect), SDLC terstruktur, robustness, branding, CI. |
| `docs/GOLDEN-RULES.md` | Konvensi kode: TypeScript strict, naming, struktur, testing (Jest), a11y, security/RLS, offline, DoD. |
| `docs/TYPOGRAPHY.md` | Type scale 4px, font Poppins, palet brand Elvera, kontras WCAG, spacing, checklist aksesibilitas. |
| `PANDUAN_ROLE.md` | RBAC: 5 role valid, cara ubah via Supabase Table Editor. |
| `guidelines/Guidelines.md` | Panduan ringkas untuk AI (atomic design, no `any`, responsive, ukuran file). |

---

## Stack Repo Ini (referensi)

- **Frontend:** React 18 + TypeScript + Vite 6 + Tailwind 4 + Capacitor 8 (Android)
- **State/Form:** Context API (`StoreContext`), react-hook-form + zod
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime) + Prisma (schema)
- **Testing:** Jest (unit/integration) + Playwright + Cypress (E2E)
- **Deploy:** Vercel (web), Android build via Capacitor

---

*Sumber standar: `Restoku_Refactored/Restoku-Next/docs/*` — disesuaikan & dilokalkan untuk PSRMENUDIGITAL.*
