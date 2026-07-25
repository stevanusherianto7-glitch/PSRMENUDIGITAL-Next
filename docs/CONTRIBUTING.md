# Contributing — PSRMENUDIGITAL (Kedai Elvera 57 POS)

> Panduan kontribusi untuk repositori PSRMENUDIGITAL. Seragam dengan `GEMINI.md` (SDLC terstruktur)
> dan `docs/GOLDEN-RULES.md` (Definition of Done, no `any`, testing wajib).
> **Tidak mengubah kode UI** — hanya dokumentasi.
>
> Sumber: `GEMINI.md`, `docs/GOLDEN-RULES.md`, `docs/TESTING.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`.

---

## 1. Alur Kerja (SDLC Terstruktur)

Setiap tugas non-trivial wajib melewati 4 fase (lihat `GEMINI.md` aturan 2):

### Fase A — Rencana & Riset
1. Pelajari codebase & cari dependensi terkait.
2. Buat `implementation_plan.md` (di folder `docs/` atau artifact) berisi:
   - Analisis dampak
   - Pertanyaan terbuka (open questions)
   - Rencana verifikasi (cara membuktikan selesai)
3. **Dapatkan persetujuan** (reviewer/pemilik) sebelum eksekusi.

### Fase B — Pelacakan Tugas
- Buat `task.md` dengan daftar TODO:
  - `[ ]` belum dimulai · `[/]` sedang dikerjakan · `[x]` selesai
- Update status berkala.

### Fase C — Eksekusi & Commit Atomik
- Tulis kode bertahap & teratur.
- **Conventional Commits** untuk setiap commit (lihat §3).
- Satu concern = satu commit (atomic).

### Fase D — Verifikasi & Walkthrough
- Jalankan lint + test + (bila berdampak UI) E2E.
- Buat `walkthrough.md` ringkas: apa yang berubah + hasil test + tautan visual (jika UI).
- Pastikan Definition of Done (§4) terpenuhi.

---

## 2. Setup Lokal

```bash
# 1. Clone (atau gunakan fork)
git clone <repo> && cd PSRMENUDIGITAL_CLONE-main

# 2. Install dependency
npm install

# 3. Env (lihat docs/DEPLOYMENT.md §3)
cp .env.example .env        # isi VITE_API_URL, VITE_CLOUDINARY_CLOUD_NAME
# (VITE_USE_MOCKS=true untuk jalan tanpa backend)

# 4. Jalankan dev
npm run dev                 # http://localhost:5173

# 5. Cek kualitas sebelum commit
npm run lint
npm test
```

> **Bukan Supabase:** arah backend = Laravel (lihat `docs/ARCHITECTURE.md`). Clone saat ini masih
> pakai Supabase; jangan tambah fitur baru yang mengunci ke Supabase — arahkan ke REST API Laravel.

---

## 3. Conventional Commits

Format: `<type>(<scope>): <subject>`

| Type | Penggunaan |
|------|-----------|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `refactor` | Perubahan struktur tanpa ubah fungsi |
| `test` | Tambah/ubah test |
| `docs` | Dokumentasi (termasuk `docs/*.md`) |
| `style` | Formatting (ESLint --fix), tidak ubah logika |
| `chore` | Dependensi / config / maintenance |
| `perf` | Optimasi performa |

Contoh:
```
feat(menu): tambah filter kategori di KasirModule
fix(auth): tangani token expired saat refresh gagal
refactor(orders): pisah logika total ke Order.calculateTotal
test(kds): cover transisi status cooking->ready
docs(architecture): petakan endpoint menu ke Laravel
```

Aturan:
- Subject **bahasa Indonesia** atau Inggris konsisten (prefer Indonesia untuk tim lokal).
- Subject ≤ 72 karakter, tidak diakhiri titik.
- Body opsional: jelaskan *why*, bukan *what* (what ada di diff).
- Untuk breaking change: tambah `BREAKING CHANGE:` di footer.

---

## 4. Definition of Done (DoD)

Sebuah tugas dianggap **selesai** hanya jika SEMUA terpenuhi:

- [ ] **Lint clean** — `npm run lint` tanpa error.
- [ ] **Test pass** — `npm test` (Jest) hijau; E2E Playwright/Cypress hijau untuk alur terdampak.
- [ ] **No `any`** di kode baru (`src/`) — gunakan interface/type/generics/`unknown`+validasi.
- [ ] **TypeScript strict** lolos — `npm run build` (vite build) sukses.
- [ ] **Responsive** — mobile-first (POS 320–768px), tidak ada layout shift (CLS < 0.1).
- [ ] **WCAG AA** — kontras teks ≥ 4.5:1, font ≥ 12px, touch target ≥ 44×44px.
- [ ] **Robustness** — fallback offline (localStorage/IndexedDB) + retry exponential backoff untuk panggilan API.
- [ ] **Security** — tidak ada secret di client/commit; validasi input (`zod` + backend); otorisasi dienforced di backend (Laravel policy/tenant scope, bukan client).
- [ ] **Brand** — identitas Kedai Elvera 57 & palet/font (Poppins) dipertahankan (lihat `docs/TYPOGRAPHY.md`).
- [ ] **Dokumentasi update** — jika mengubah konvensi/arsitektur, update `docs/*` terkait.
- [ ] **Commit atomic + Conventional** — tiap perubah logis satu commit ber-label benar.
- [ ] **Review/Approval** — sudah direview (PR) & disetujui pemilik/arsitek.

> **Jangan claim "done/selesai/100%" tanpa bukti nyata** (output test/lint/build, bukan narasi).

---

## 5. Branching & PR

- Branch dari `main` (atau `develop` jika ada): `feat/nama-fitur`, `fix/nama-bug`.
- Buat PR ke `main`; isi deskripsi dengan link `walkthrough.md` / bukti test.
- CI (`npm run lint` + `npm test` + Playwright) harus hijau sebelum merge.
- Squash/merge sesuai kebijakan repo; pesan merge mengikuti Conventional Commits.

---

## 6. Rollback & Revert

- Jika deploy bermasalah: `git revert <commit>` (tidak hapus history).
- Untuk refactor kritis: selalu commit bertahap agar mudah dilacak & dikembalikan.
- Secret bocor → **rotate** (Cloudinary/Google/DB) segera, jangan hanya hapus dari repo.

---

## 7. Larangan (Hard Rules)

- ❌ **Jangan** tambah `any` di kode baru.
- ❌ **Jangan** hardcode URL production / secret / API key ke `.spec.ts` / `.cy.ts` / `.tsx`.
- ❌ **Jangan** ubah `src/styles/globals.css` & `default_shadcn_theme.css` tanpa izin Senior Architect.
- ❌ **Jangan** mengunci fitur baru ke Supabase — arahkan ke REST API Laravel (`VITE_API_URL`).
- ❌ **Jangan** commit `.env` (sudah gitignored).
- ❌ **Jangan** claim "100% coverage" kecuali `npm run test:coverage` benar-benar menunjukkan 100%.

---

*Sumber: `GEMINI.md`, `docs/GOLDEN-RULES.md` §9 (DoD), `docs/TESTING.md`, `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`.*
