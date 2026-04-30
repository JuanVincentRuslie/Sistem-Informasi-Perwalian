# Milestones Backend - Sistem Informasi Perwalian

> Tracker khusus backend setelah frontend milestone 4 selesai.  
> Dokumen ini harus sinkron dengan:
> - `docs/blueprint-sistem-perwalian.md`
> - `docs/erd-sistem-perwalian.md`
> - `docs/api-spec-sistem-perwalian.md`
> - `docs/MILESTONES.md`

---

## Tujuan

Membangun backend Node.js + PostgreSQL yang:
- mengikuti kontrak API di `api-spec-sistem-perwalian.md`
- mengikuti model data di `erd-sistem-perwalian.md`
- menjaga keputusan bisnis terbaru dari blueprint
- bisa menggantikan mock frontend secara bertahap

---

## Aturan Sinkronisasi Penting

Sebelum mulai implementasi backend, pegang keputusan ini sebagai source of truth:

- Auth menggunakan **Google OAuth SSO + JWT**
- Database utama menggunakan **PostgreSQL**
- Format response API tetap wrapped: `{ success, data, message, errors }`
- `master_matkul` untuk pohon kurikulum adalah **seed / hardcoded backend**, bukan upload dari UI kaprodi
- Upload Excel yang aktif di scope sekarang adalah **upload jadwal kelas**
- Periode baru yang dibuat kaprodi **langsung aktif otomatis**
- Saat periode baru aktif, periode aktif lama otomatis jadi **tidak aktif**
- Periode yang `tanggal_selesai`-nya sudah lewat dianggap **berakhir / tidak aktif**
- Periode yang sudah berakhir **tidak bisa diaktifkan lagi**
- Kaprodi boleh **hapus periode** untuk koreksi input
- Detail mahasiswa dari sisi kaprodi bersifat **read-only** untuk approval FRS
- Parser yang sudah tersedia di repo saat ini:
  - `parser_for_backend/Jadwal_excel_parser/parse-jadwal.js`
  - `parser_for_backend/Dps_parser/index.js`
- Detail teknis pemakaian parser dicatat di `docs/PARSER-INTEGRATION.md`

---

## Backend Milestone 1 - Foundation & Auth

**Goal**: backend bisa jalan lokal, connect ke PostgreSQL, dan login Google menghasilkan JWT internal.

### Tasks

- [ ] Init project backend Node.js
- [ ] Tentukan stack HTTP server:
  - [ ] Express
  - [ ] atau native HTTP (sesuai keputusan implementasi final)
- [ ] Setup environment config:
  - [ ] `PORT`
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] Google OAuth credentials
  - [ ] allowed email domains
- [ ] Setup koneksi PostgreSQL
- [ ] Setup migration tool
- [ ] Setup folder structure backend
- [ ] Setup health endpoint
- [ ] Implement `POST /api/v1/auth/google`
- [ ] Implement JWT signing
- [ ] Implement middleware auth JWT
- [ ] Implement middleware role check
- [ ] Seed 1 user kaprodi awal

### Deliverable

- [ ] Server jalan lokal
- [ ] PostgreSQL terkoneksi
- [ ] Login Google berhasil tukar `code` -> JWT internal
- [ ] Endpoint protected sudah bisa baca role user

---

## Backend Milestone 2 - Database Schema & Seeds

**Goal**: schema inti sesuai ERD sudah jadi dan bisa dimigrate ulang dari nol.

### Tasks

- [ ] Buat migration tabel `users`
- [ ] Buat migration tabel `profile_dosen`
- [ ] Buat migration tabel `profile_mahasiswa`
- [ ] Buat migration tabel `periode`
- [ ] Buat migration tabel `master_matkul`
- [ ] Buat migration tabel `master_matkul_edge`
- [ ] Buat migration tabel `kelas`
- [ ] Buat migration tabel `sesi_kelas`
- [ ] Buat migration tabel `rencana_studi`
- [ ] Buat migration tabel `rencana_studi_item`
- [ ] Buat migration tabel `riwayat_nilai`
- [ ] Tambahkan constraints penting dari ERD
- [ ] Tambahkan index penting
- [ ] Tambahkan partial unique index untuk **maksimal 1 periode aktif**
- [ ] Seed data awal:
  - [ ] kaprodi
  - [ ] dosen wali
  - [ ] mahasiswa
  - [ ] `master_matkul`
  - [ ] `master_matkul_edge`

### Deliverable

- [ ] Fresh migration sukses
- [ ] Fresh seed sukses
- [ ] Struktur tabel sinkron dengan ERD final

---

## Backend Milestone 3 - User Management

**Goal**: kaprodi bisa mengelola dosen wali dan mahasiswa dari backend.

### Tasks

- [ ] Implement list/get dosen wali
- [ ] Implement create/update/delete dosen wali
- [ ] Implement list/get mahasiswa
- [ ] Implement create/update/delete mahasiswa
- [ ] Implement assign / unassign mahasiswa ke dosen wali
- [ ] Tambahkan validation ownership & role
- [ ] Tambahkan pagination + search dasar

### Catatan Sinkronisasi

- Assignment mahasiswa ke dosen wali harus mendukung flow kaprodi:
  - [ ] lihat mahasiswa di bawah dosen wali terpilih
  - [ ] lihat mahasiswa yang belum punya dosen wali
  - [ ] assign / unassign

### Deliverable

- [ ] Endpoint user management bisa menggantikan mock kaprodi untuk dosen wali dan mahasiswa

---

## Backend Milestone 4 - Periode

**Goal**: manajemen periode mengikuti rule terbaru yang sudah dipakai frontend.

### Tasks

- [ ] Implement `GET /api/v1/periode`
- [ ] Implement `GET /api/v1/periode/aktif`
- [ ] Implement `POST /api/v1/periode`
- [ ] Implement `PATCH /api/v1/periode/:id/aktivasi`
- [ ] Implement `DELETE /api/v1/periode/:id`
- [ ] Implement auto-activate saat create periode baru
- [ ] Implement auto-deactivate periode aktif lama saat create/aktivasi periode lain
- [ ] Tolak aktivasi periode yang sudah lewat `tanggal_selesai`
- [ ] Pastikan delete periode mengikuti aturan referential integrity
- [ ] Pastikan kondisi "tidak ada periode aktif" tetap valid secara sistem

### Deliverable

- [ ] Flow periode backend sinkron dengan frontend kaprodi
- [ ] Rule aktif / tidak aktif / berakhir konsisten dengan blueprint dan API spec

---

## Backend Milestone 5 - Kelas & Upload Jadwal Excel

**Goal**: kaprodi bisa upload jadwal kelas per periode sesuai kontrak API.

### Tasks

- [ ] Implement `GET /api/v1/kelas`
- [ ] Implement `GET /api/v1/kelas/:id`
- [ ] Implement `POST /api/v1/kelas/upload` preview
- [ ] Implement confirm replace mode untuk upload jadwal kelas
- [ ] Integrasikan parser dari `parser_for_backend/Jadwal_excel_parser/parse-jadwal.js`
- [ ] Parser Excel mengembalikan struktur kelas + sesi kelas yang siap dipreview
- [ ] Validation kolom template upload
- [ ] Replace data `kelas` + `sesi_kelas` per `periode_id`
- [ ] Logging error upload yang mudah dibaca

### Catatan Sinkronisasi

- **Tidak** perlu membuat upload UI/API baru untuk catalog mata kuliah FRS
- `master_matkul` tetap masuk lewat seed / import backend terkontrol
- Parser jadwal adalah komponen internal backend, bukan endpoint terpisah
- Flow wajib: upload -> parse -> preview -> confirm -> simpan ke DB

### Deliverable

- [ ] Upload jadwal kelas bisa menggantikan mock kaprodi periode
- [ ] Endpoint pemilihan kelas untuk FRS sudah punya data nyata

---

## Backend Milestone 6 - Core Rencana Studi Flow

**Goal**: alur utama mahasiswa submit FRS dan dosen wali review berjalan penuh.

### Tasks

- [ ] Implement `GET /api/v1/rencana-studi/me`
- [ ] Implement `GET /api/v1/rencana-studi/me/riwayat`
- [ ] Implement `POST /api/v1/rencana-studi`
- [ ] Implement `POST /api/v1/rencana-studi/:id/items`
- [ ] Implement `DELETE /api/v1/rencana-studi/:id/items/:itemId`
- [ ] Implement `POST /api/v1/rencana-studi/:id/submit`
- [ ] Implement `GET /api/v1/rencana-studi/dosen/bimbingan`
- [ ] Implement `GET /api/v1/rencana-studi/dosen/:id`
- [ ] Implement `POST /api/v1/rencana-studi/:id/setujui`
- [ ] Implement `POST /api/v1/rencana-studi/:id/revisi`
- [ ] Implement state machine FRS
- [ ] Implement ownership checks mahasiswa
- [ ] Implement ownership checks dosen wali
- [ ] Enforce write action hanya saat periode aktif

### Deliverable

- [ ] Frontend mahasiswa dan dosen wali bisa swap dari mock ke API nyata untuk flow FRS utama

---

## Backend Milestone 7 - Akademik & Pohon Kurikulum

**Goal**: dashboard akademik dan pohon kurikulum memakai data backend nyata.

### Tasks

- [ ] Implement `GET /api/v1/akademik/me/ringkasan`
- [ ] Implement `GET /api/v1/akademik/mahasiswa/:id/pohon-kurikulum`
- [ ] Implement `GET /api/v1/master-matkul`
- [ ] Implement `GET /api/v1/master-matkul/:id`
- [ ] Implement `GET /api/v1/master-matkul/edges`
- [ ] Implement matching `riwayat_nilai` ke `master_matkul` via `kode_aktif` / `kode_alias`
- [ ] Implement kalkulasi cache `profile_mahasiswa`
- [ ] Pastikan detail mahasiswa dosen wali dan kaprodi membaca sumber yang sama

### Deliverable

- [ ] Dashboard mahasiswa
- [ ] detail mahasiswa dosen wali
- [ ] detail mahasiswa kaprodi
- [ ] pohon kurikulum  
  semuanya sudah bisa pakai data backend

---

## Backend Milestone 8 - Riwayat Nilai / DPS

**Goal**: mahasiswa bisa upload DPS dan backend menyimpan hasilnya dengan aman.

### Tasks

- [ ] Implement `GET /api/v1/riwayat-nilai/me`
- [ ] Implement `POST /api/v1/riwayat-nilai/upload-dps`
- [ ] Implement `POST /api/v1/riwayat-nilai/upload-dps/confirm`
- [ ] Implement preview hasil parse / input manual
- [ ] Implement confirm save
- [ ] Replace riwayat nilai per periode sesuai kontrak API
- [ ] Recalculate IPK, IPS terakhir, total SKS lulus, total SKS wajib, total SKS pilihan
- [ ] Integrasikan parser dari `parser_for_backend/Dps_parser/index.js`
- [ ] Mapping hasil parser DPS ke format API `riwayat_nilai`
- [ ] Gunakan `transcript` parser sebagai sumber utama item siap simpan
- [ ] Simpan `courses` + `unparsedCourseLines` sebagai bahan preview/manual edit

### Catatan Sinkronisasi

- Parser DPS sekarang **sudah ada di repo**, jadi backend tidak mulai dari nol
- Parser PDF dosen masih boleh diintegrasikan bertahap
- Minimal flow awal boleh:
  - [ ] upload
  - [ ] preview
  - [ ] manual edit
  - [ ] save
- Parser DPS adalah komponen internal backend, bukan service publik terpisah
- Flow wajib: upload PDF -> parse -> preview -> manual edit bila perlu -> confirm -> replace `riwayat_nilai` -> update cache akademik

### Deliverable

- [ ] Halaman upload DPS frontend bisa swap dari mock ke backend

---

## Backend Milestone 9 - Integrasi Frontend

**Goal**: frontend berhenti memakai mock untuk flow utama.

### Tasks

- [ ] Buat API client backend nyata di frontend
- [ ] Replace mock auth
- [ ] Replace mock periode
- [ ] Replace mock kaprodi management
- [ ] Replace mock rencana studi mahasiswa
- [ ] Replace mock dosen wali review
- [ ] Replace mock akademik
- [ ] Replace mock riwayat nilai
- [ ] Rapikan loading / error state setelah integrasi

### Deliverable

- [ ] Semua halaman utama frontend memakai backend nyata untuk happy path utama

---

## Backend Milestone 10 - Hardening & Polish

**Goal**: backend cukup stabil untuk demo skripsi dan integrasi lanjutan.

### Tasks

- [ ] Standardize error handling
- [ ] Tambahkan request validation
- [ ] Tambahkan logging dasar
- [ ] Tambahkan test untuk service / endpoint penting
- [ ] Tambahkan protection untuk edge case periode
- [ ] Tambahkan protection untuk edge case ownership
- [ ] Audit response agar tetap sinkron dengan `api-spec-sistem-perwalian.md`
- [ ] Audit migration + seed untuk setup ulang dari nol
- [ ] Siapkan `.env.example`
- [ ] Siapkan dokumentasi run lokal backend

### Deliverable

- [ ] Backend cukup stabil untuk demo penuh tanpa mock utama

---

## Status Tracking

| Backend Milestone | Status | Started | Completed |
|---|---|---|---|
| 1. Foundation & Auth | ⏳ Not started | - | - |
| 2. Database Schema & Seeds | ⏳ Not started | - | - |
| 3. User Management | ⏳ Not started | - | - |
| 4. Periode | ⏳ Not started | - | - |
| 5. Kelas & Upload Jadwal Excel | ⏳ Not started | - | - |
| 6. Core Rencana Studi Flow | ⏳ Not started | - | - |
| 7. Akademik & Pohon Kurikulum | ⏳ Not started | - | - |
| 8. Riwayat Nilai / DPS | ⏳ Not started | - | - |
| 9. Integrasi Frontend | ⏳ Not started | - | - |
| 10. Hardening & Polish | ⏳ Not started | - | - |

> Update kolom Status: `⏳ Not started` -> `🚧 In Progress` -> `✅ Done`

---

## Referensi Cepat

- `docs/blueprint-sistem-perwalian.md`
- `docs/erd-sistem-perwalian.md`
- `docs/api-spec-sistem-perwalian.md`
- `docs/MILESTONES.md`

---

*Dokumen hidup - update jika ada keputusan backend baru*
