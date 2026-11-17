# Smart Inventory

Aplikasi pencatatan stok untuk satu usaha per akun. Dibangun dengan Next.js 16
(App Router + Cache Components), Prisma 6, PostgreSQL (Supabase), dan Supabase
Auth.

## Fitur saat ini

- Registrasi dan login email/password lewat Supabase Auth.
- Sesi server-side dengan `@supabase/ssr`; cookie di-refresh oleh `proxy.ts`.
- Onboarding satu usaha per akun.
- Dashboard utama dengan data langsung dari database:
  - Statistik produk, kategori, total stok, dan nilai persediaan.
  - Ringkasan stok tersedia, menipis, dan habis beserta daftar restock.
  - Grafik barang masuk/keluar dengan filter mingguan dan bulanan.
  - Tabel aktivitas stok terbaru.
- Pencarian produk berdasarkan nama atau SKU, serta halaman notifikasi stok
  menipis.
- Navigasi sidebar: Dashboard, Data Barang, Kategori, Barang Masuk, Barang
  Keluar, Riwayat Transaksi, Laporan, dan Pengaturan. Modul selain dashboard
  masih berupa halaman placeholder "Dalam pengembangan".
- Skema inventori: `Category`, `Product`, `StockIn`, `StockOut`,
  `StockMovement`, beserta service transaksi stok yang aman dari stok negatif.

CRUD produk dan form transaksi stok belum termasuk pada tahap ini.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Environment

Buat `.env` dan `.env.local` (keduanya tidak di-commit):

```dotenv
# .env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
```

```dotenv
# .env.local
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

Di dashboard Supabase, daftarkan URL aplikasi pada **Authentication → URL
Configuration**:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

Redirect ini dipakai untuk tautan konfirmasi email. Jika konfirmasi email
nonaktif, pengguna langsung masuk ke onboarding setelah registrasi.

### Perintah database

```bash
npm run db:validate   # validasi schema
npm run db:generate   # generate Prisma Client
npm run db:status     # status migrasi
npm run db:deploy     # terapkan migrasi
```

Jangan menjalankan `prisma migrate reset` atau `prisma db push` pada database
produksi.

## Struktur utama

```
app/(auth)/                halaman login, registrasi, onboarding
app/(app)/                 shell aplikasi (sidebar + header) dan halaman terkait
app/(app)/dashboard/       dashboard utama
app/(app)/search/          pencarian produk
app/(app)/notifications/   notifikasi stok menipis
app/(app)/products/        halaman modul (placeholder untuk tahap berikutnya)
app/actions/auth.ts        Server Actions autentikasi dan pembuatan usaha
app/auth/callback/         penukaran kode konfirmasi email Supabase
app/components/            komponen shell, dashboard, dan UI bersama
lib/auth/dal.ts            Data Access Layer: validasi sesi + sinkronisasi user
lib/dashboard.ts           query dashboard, bucket grafik, dan peringatan stok
lib/format.ts              format mata uang, angka, dan tanggal Jakarta
lib/supabase/              client browser/server dan refresh sesi untuk proxy
lib/services/              service transaksi stok
prisma/schema.prisma       model database
proxy.ts                   refresh sesi dan proteksi route
```

## Alur autentikasi

1. Pengguna mendaftar atau masuk lewat Supabase Auth.
2. `proxy.ts` me-refresh sesi pada setiap request dan mengarahkan pengguna
   tanpa sesi dari `/dashboard` dan `/onboarding` ke `/login`.
3. Setiap halaman dan Server Action memanggil `lib/auth/dal.ts`. User Supabase
   diselaraskan ke tabel `"User"` berdasarkan `supabaseId`.
4. Pengguna tanpa usaha diarahkan ke `/onboarding`. Pembuatan usaha divalidasi
   di server dan dibatasi satu usaha per akun (`Business.ownerId` unik).
5. Setelah usaha dibuat, pengguna diarahkan ke `/dashboard`.

## Catatan deployment

Database Supabase pada proyek ini juga dipakai aplikasi lain. Untuk produksi,
gunakan proyek Supabase terpisah atau schema khusus agar data tidak bercampur.
