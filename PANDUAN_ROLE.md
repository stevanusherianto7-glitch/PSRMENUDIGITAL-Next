# 📖 Panduan Mengubah Role Karyawan (Kedai Elvera 57 POS)

Dokumen ini menjelaskan cara mengubah hak akses (*Role*) karyawan setelah mereka mendaftar menggunakan Email atau Gmail (Google Auth).

---

## ⚠️ Aturan Penting (Harap Dibaca)
Secara default, sistem diatur untuk memberikan role **`waiter`** kepada setiap pengguna baru yang mendaftar. 

Hanya ada **5 nilai valid** untuk kolom `role` di database (sesuai `UserRole` di `src/app/types.ts`):
1. **`admin`**   : Akses penuh semua halaman & modul.
2. **`manager`** : Akses penuh semua halaman & modul (fokus operasional & laporan).
3. **`owner`**   : Akses penuh semua halaman & modul.
4. **`waiter`**  : Hanya bisa akses halaman Waiter (Antar Pesanan).
5. **`kitchen`** : Hanya bisa akses halaman Dapur (Proses Masak / KDS).

> ⚠️ **Perhatian:** Nilai `cook` **TIDAK VALID** — role untuk dapur adalah **`kitchen`**.

> [!WARNING]
> Pastikan Anda mengetik nilai role dengan **huruf kecil semua** (lowercase) persis seperti di atas. Jika Anda mengetik `Manager` (dengan 'M' besar) atau `cook` / `koki`, sistem akan error atau menolak akses mereka — karena nilai tersebut **tidak ada** di tipe `UserRole`.

> **Catatan Arsitek (2026-07-25):** Role `cook` **TIDAK VALID**. Enum resmi di `src/app/types.ts` adalah
> `UserRole = "admin" | "manager" | "owner" | "waiter" | "kitchen"`. Role untuk dapur adalah **`kitchen`**, bukan `cook`.

### Tabel Akses per Role

| Role | Akses |
|------|-------|
| `admin` | Semua halaman & modul (Dashboard, Laporan, Menu, Kasir, Dapur, Stok, SDM, dsb.) |
| `owner` | Sama seperti `admin` (akses penuh) |
| `manager` | Sama seperti `admin` (akses penuh, fokus operasional & laporan) |
| `kitchen` | **Hanya** layar dapur / proses masak (KDS) |
| `waiter` | **Hanya** pelayanan meja / antar pesanan (Waiter) |

> Default role untuk pengguna baru = **`waiter`** (lihat `StoreContext.tsx` / `useAdminState.ts`).

---

## 🛠️ Langkah-langkah Mengubah Role di Supabase

Jika ada staf baru (misal Koki/Dapur) yang baru saja login pertama kali dengan Gmail, ikuti langkah ini untuk mengubah hak aksesnya:

1. **Buka Dashboard Supabase**
   * Masuk ke proyek Supabase Anda.

2. **Buka Table Editor**
   * Klik ikon **"Table Editor"** (ikon berbentuk tabel/grid) di sidebar sebelah kiri.

3. **Pilih Tabel `profiles`**
   * Di daftar tabel (skema `public`), klik tabel bernama **`profiles`**.

4. **Cari Data Karyawan**
   * Cari baris data karyawan yang ingin Anda ubah berdasarkan kolom `email` atau `nama`.

5. **Ubah Nilai Role**
   * Klik dua kali (double click) pada kolom **`role`** di baris karyawan tersebut.
   * Hapus tulisan `waiter` dan ganti menjadi salah satu dari **5 nilai valid**: `admin`, `manager`, `owner`, `waiter`, atau `kitchen` (sesuai kebutuhan).
   * Tekan tombol **Enter** pada keyboard Anda.

6. **Selesai!**
   * Perubahan akan tersimpan secara otomatis. Karyawan tersebut sekarang bisa mencoba logout dan login kembali di aplikasi untuk melihat perubahannya.

---

*Dokumen ini dibuat otomatis oleh Antigravity AI.*
