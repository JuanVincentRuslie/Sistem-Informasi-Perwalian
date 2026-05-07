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

- [x] Init project backend Node.js
- [x] Tentukan stack HTTP server:
  - [x] Express
  - [ ] atau native HTTP (sesuai keputusan implementasi final)
- [x] Setup environment config:
  - [x] `PORT`
  - [x] `DATABASE_URL`
  - [x] `JWT_SECRET`
  - [x] Google OAuth credentials
  - [x] allowed email domains
- [x] Setup koneksi PostgreSQL
- [x] Setup migration tool
- [x] Setup folder structure backend
- [x] Setup health endpoint
- [x] Implement `POST /api/v1/auth/google`
- [x] Implement JWT signing
- [x] Implement middleware auth JWT
- [x] Implement middleware role check
- [x] Seed 1 user kaprodi awal

### Deliverable

- [ ] Server jalan lokal
- [ ] PostgreSQL terkoneksi
- [ ] Login Google berhasil tukar `code` -> JWT internal
- [ ] Endpoint protected sudah bisa baca role user

---

## Backend Milestone 2 - Database Schema & Seeds

**Goal**: schema inti sesuai ERD sudah jadi dan bisa dimigrate ulang dari nol.

### Tasks

- [x] Buat migration tabel `users`
- [x] Buat migration tabel `profile_dosen`
- [x] Buat migration tabel `profile_mahasiswa`
- [x] Buat migration tabel `periode`
- [x] Buat migration tabel `master_matkul`
- [x] Buat migration tabel `master_matkul_edge`
- [x] Buat migration tabel `kelas`
- [x] Buat migration tabel `sesi_kelas`
- [x] Buat migration tabel `rencana_studi`
- [x] Buat migration tabel `rencana_studi_item`
- [x] Buat migration tabel `riwayat_nilai`
- [x] Tambahkan constraints penting dari ERD
- [x] Tambahkan index penting
- [x] Tambahkan partial unique index untuk **maksimal 1 periode aktif**
- [x] Seed data awal:
  - [x] kaprodi
  - [x] dosen wali
  - [x] mahasiswa
  - [x] `master_matkul`
  - [x] `master_matkul_edge`

### Deliverable

- [ ] Fresh migration sukses
- [ ] Fresh seed sukses
- [ ] Struktur tabel sinkron dengan ERD final

---

## Backend Milestone 3 - User Management

**Goal**: kaprodi bisa mengelola dosen wali dan mahasiswa dari backend.

### Tasks

- [x] Implement list/get dosen wali
- [x] Implement create/update/delete dosen wali
- [x] Implement list/get mahasiswa
- [x] Implement create/update/delete mahasiswa
- [x] Implement assign / unassign mahasiswa ke dosen wali
- [x] Tambahkan validation ownership & role
- [x] Tambahkan pagination + search dasar

### Catatan Sinkronisasi

- Assignment mahasiswa ke dosen wali harus mendukung flow kaprodi:
  - [x] lihat mahasiswa di bawah dosen wali terpilih
  - [x] lihat mahasiswa yang belum punya dosen wali
  - [x] assign / unassign

### Deliverable

- [ ] Endpoint user management bisa menggantikan mock kaprodi untuk dosen wali dan mahasiswa

---

## Backend Milestone 4 - Periode

**Goal**: manajemen periode mengikuti rule terbaru yang sudah dipakai frontend.

### Tasks

- [x] Implement `GET /api/v1/periode`
- [x] Implement `GET /api/v1/periode/aktif`
- [x] Implement `POST /api/v1/periode`
- [x] Implement `PUT /api/v1/periode/:id`
- [x] Implement `PATCH /api/v1/periode/:id/aktivasi`
- [x] Implement `DELETE /api/v1/periode/:id`
- [x] Implement auto-activate saat create periode baru
- [x] Implement auto-deactivate periode aktif lama saat create/aktivasi periode lain
- [x] Tolak aktivasi periode yang sudah lewat `tanggal_selesai`
- [x] Pastikan delete periode mengikuti aturan referential integrity
- [x] Pastikan kondisi "tidak ada periode aktif" tetap valid secara sistem

### Deliverable

- [x] Flow periode backend sinkron dengan frontend kaprodi
- [x] Rule aktif / tidak aktif / berakhir konsisten dengan blueprint dan API spec

---

## Backend Milestone 5 - Kelas & Upload Jadwal Excel

**Goal**: kaprodi bisa upload jadwal kelas per periode sesuai kontrak API.

### Tasks

- [x] Implement `GET /api/v1/kelas`
- [x] Implement `GET /api/v1/kelas/:id`
- [x] Implement `POST /api/v1/kelas/upload` preview
- [x] Implement confirm replace mode untuk upload jadwal kelas
- [x] Integrasikan parser dari `parser_for_backend/Jadwal_excel_parser/parse-jadwal.js`
- [x] Parser Excel mengembalikan struktur kelas + sesi kelas yang siap dipreview
- [x] Validation kolom template upload
- [x] Replace data `kelas` + `sesi_kelas` per `periode_id`
- [x] Logging error upload yang mudah dibaca

### Catatan Sinkronisasi

- **Tidak** perlu membuat upload UI/API baru untuk catalog mata kuliah FRS
- `master_matkul` tetap masuk lewat seed / import backend terkontrol
- Parser jadwal adalah komponen internal backend, bukan endpoint terpisah
- Flow wajib: upload -> parse -> preview -> confirm -> simpan ke DB

### Deliverable

- [x] Upload jadwal kelas bisa menggantikan mock kaprodi periode
- [x] Endpoint pemilihan kelas untuk FRS sudah punya data nyata

---

## Backend Milestone 6 - Core Rencana Studi Flow

**Goal**: alur utama mahasiswa submit FRS dan dosen wali review berjalan penuh.

### Tasks

- [x] Implement `GET /api/v1/rencana-studi/saya`
- [x] Implement `GET /api/v1/rencana-studi/saya/riwayat`
- [x] Implement `POST /api/v1/rencana-studi`
- [x] Implement `POST /api/v1/rencana-studi/:id/items`
- [x] Implement `DELETE /api/v1/rencana-studi/:id/items/:item_id`
- [x] Implement `POST /api/v1/rencana-studi/:id/submit`
- [x] Implement `GET /api/v1/rencana-studi/dosen/bimbingan`
- [x] Implement `GET /api/v1/rencana-studi/dosen/mahasiswa/:id/profil`
- [x] Implement `GET /api/v1/rencana-studi/dosen/mahasiswa/:id/riwayat`
- [x] Implement `GET /api/v1/rencana-studi/:id` (multi-role detail)
- [x] Implement `POST /api/v1/rencana-studi/:id/setujui`
- [x] Implement `POST /api/v1/rencana-studi/:id/revisi`
- [x] Implement state machine FRS (DRAFT → SUBMITTED → APPROVED/REJECTED, auto-change saat edit)
- [x] Implement ownership checks mahasiswa
- [x] Implement ownership checks dosen wali
- [x] Enforce write action hanya saat periode aktif

### Deliverable

- [x] Frontend mahasiswa dan dosen wali bisa swap dari mock ke API nyata untuk flow FRS utama

---

## Backend Milestone 7 - Akademik & Pohon Kurikulum

**Goal**: dashboard akademik dan pohon kurikulum memakai data backend nyata.

### Tasks

- [x] Implement `GET /api/v1/akademik/saya/ringkasan`
- [x] Implement `GET /api/v1/akademik/saya/pohon-kurikulum`
- [x] Implement `GET /api/v1/akademik/mahasiswa/:id/ringkasan`
- [x] Implement `GET /api/v1/akademik/mahasiswa/:id/pohon-kurikulum`
- [x] Implement `GET /api/v1/master-matkul` (read-only — master matkul via seed)
- [x] Implement `GET /api/v1/master-matkul/:id`
- [x] Implement `GET /api/v1/master-matkul/edges`
- [x] Implement matching `riwayat_nilai` ke `master_matkul` via `kode_aktif` / `kode_alias` (pilih nilai_angka tertinggi)
- [x] Implement kalkulasi cache `profile_mahasiswa` (function `recalculateProfileCache` dipakai dari M8)
- [x] Pastikan detail mahasiswa dosen wali dan kaprodi membaca sumber yang sama

### Deliverable

- [x] Dashboard mahasiswa
- [x] detail mahasiswa dosen wali
- [x] detail mahasiswa kaprodi
- [x] pohon kurikulum  
  semuanya sudah bisa pakai data backend

---

## Backend Milestone 8 - Riwayat Nilai / DPS

**Goal**: mahasiswa bisa upload DPS dan backend menyimpan hasilnya dengan aman.

### Tasks

- [x] Implement `GET /api/v1/riwayat-nilai/saya`
- [x] Implement `GET /api/v1/riwayat-nilai/mahasiswa/:id` (dosen wali / kaprodi)
- [x] Implement `POST /api/v1/riwayat-nilai/upload-dps`
- [x] Implement `POST /api/v1/riwayat-nilai/upload-dps/confirm`
- [x] Implement `POST /api/v1/riwayat-nilai/manual` (fallback input manual)
- [x] Implement preview hasil parse / input manual
- [x] Implement confirm save
- [x] Replace riwayat nilai sesuai keputusan: full replace per mahasiswa (DELETE all + INSERT)
- [x] Apply IPK / IPS / total SKS dari `academic.*` parser DPS langsung (function `applyAcademicSnapshot` di akademik service)
- [x] Function `recalculateProfileCache` (M7) tetap dipakai untuk fallback `/manual`
- [x] Integrasikan parser dari `parser_for_backend/Dps_parser/index.js` (di-copy ke `backend/src/services/dpsPdfParser.js`, terima buffer)
- [x] Mapping hasil parser DPS ke format API `riwayat_nilai` (lihat `docs/PARSER-INTEGRATION.md` final mapping)
- [x] Gunakan `transcript` parser sebagai sumber utama item siap simpan
- [x] Periode dummy "Riwayat DPS" via seed (`npm run seed:periode-dummy`) — semua row pakai periode_id ini

### Catatan Sinkronisasi

- Parser DPS sekarang **sudah ada di repo**, jadi backend tidak mulai dari nol
- Parser PDF dosen masih boleh diintegrasikan bertahap
- Minimal flow awal boleh:
  - [x] upload
  - [x] preview
  - [x] manual edit (via `/manual` endpoint)
  - [x] save
- Parser DPS adalah komponen internal backend, bukan service publik terpisah
- Flow wajib: upload PDF -> parse -> preview -> confirm -> replace `riwayat_nilai` (DELETE all per mahasiswa + INSERT) -> apply academic snapshot ke `profile_mahasiswa`

### Deliverable

- [x] Halaman upload DPS frontend bisa swap dari mock ke backend

---

## Backend Milestone 9 - Integrasi Frontend

**Goal**: frontend berhenti memakai mock untuk flow utama.

### Tasks

- [x] Buat API client backend nyata di frontend (`client.js` + auth helper)
- [x] Implement `POST /auth/dev-login` di backend (sementara, gated `NODE_ENV !== 'production'`)
- [x] Replace mock auth frontend (LoginPage panggil dev-login, AuthContext simpan token)
- [x] Replace mock periode (Domain 1 — kaprodi periode + upload jadwal kelas, backend tambah `total_kelas` per periode)
- [x] Replace mock kaprodi management (Domain 5 — dashboard, dosen wali list/detail/assign, mahasiswa list, jadwal perwalian dosen)
- [x] Replace mock rencana studi mahasiswa (Domain 3 — perwalian, tambah matkul, jadwal, empty state)
- [x] Replace mock dosen wali review (Domain 3 — bimbingan list, detail mahasiswa, approve/revisi)
- [x] Replace mock akademik (Domain 2 — ringkasan dashboard, pohon kurikulum, auto-route by role)
- [x] Replace mock riwayat nilai (Domain 4 — DPS upload preview/confirm, manual)
- [x] Rapikan loading / error state setelah integrasi
  - [x] Priority 3: avoid loading flicker di dashboard mahasiswa dan halaman periode (`loading && !data`)
  - [x] Priority 3: auto-dismiss success alert mutation periode dan save assignment setelah 3 detik
  - [x] Priority 3: retry button untuk error state halaman utama
  - [x] Priority 4: audit MUI deprecation props (`InputProps`, `InputLabelProps`, `inputProps`) dan migrasi ke `slotProps`
  - [x] Priority 5: disable double-click checkout tambah matkul saat request sedang berjalan
- [x] Implement Google OAuth real (akhir M9, setelah `.env` Google dilengkapi)

### Catatan: Strategi Auth — dev-login dulu, Google OAuth terakhir

**Keputusan**: implementasi login Google OAuth ditunda ke task terakhir M9. Selama integrasi mock-swap berjalan, frontend pakai endpoint `POST /api/v1/auth/dev-login` sementara untuk dapat JWT.

**Rationale**:
- Setiap endpoint backend butuh JWT (`authenticate` middleware tolak request tanpa token). Tanpa cara dapat token, integrasi mock → real API tidak bisa di-test.
- Setup Google OAuth (Google Cloud Console, OAuth client, redirect URI, `.env`) bisa makan waktu sendiri yang tidak ada hubungannya dengan inti M9 (swap mock → real API).
- Memisahkan dev-login vs OAuth bikin scope M9 fokus & demo siap.

**Implementasi dev-login**:
- Endpoint `POST /api/v1/auth/dev-login` di backend, gated `if (process.env.NODE_ENV === 'production') return 404`.
- Body: `{ email }` (tanpa password).
- Response **persis sama** dengan `/auth/google`: `{ success, data: { token, user: { id, email, nama, role, avatar_url } }, message }`.
- Tujuannya format identical: AuthContext + API client + `auth.login()` helper di frontend tidak perlu refactor pas swap ke Google OAuth nanti.

**Frontend selama dev-login berlaku**:
- `LoginPage.jsx` tetap punya 3 tombol role (mahasiswa, dosen_wali, kaprodi), tapi tiap tombol panggil `POST /auth/dev-login` dengan email user seeded.
- AuthContext simpan `{ token, user }` (token disimpan localStorage untuk persistence).

**Refactor pas Google OAuth jadi (akhir M9)**:
- Tidak perlu sentuh: `client.js`, AuthContext, 7 file API lain, backend endpoint lain.
- Yang berubah: `LoginPage.jsx` (tombol → redirect Google), tambah `AuthCallbackPage.jsx` (terima `code`, POST ke `/auth/google`), tambah route `/auth/callback`.
- Dev-login endpoint **tidak dihapus** — tetap di-keep untuk dev iteration lokal, hanya disable otomatis di production via env gate.

**Status implementasi Google OAuth real**:
- Frontend `LoginPage.jsx` memakai tombol "Login dengan Google" sebagai jalur utama.
- Frontend `AuthCallbackPage.jsx` membaca `code`, memanggil `POST /auth/google`, menyimpan `{ token, user }` lewat AuthContext, lalu redirect ke dashboard sesuai role.
- Dev-login tetap tersedia sebagai fallback development.
- Env lokal yang wajib match:
  - `frontend/.env`: `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_REDIRECT_URI`
  - `backend/.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- Flow Google OAuth sudah berhasil diuji lokal setelah backend dan frontend direstart.

### Frontend Issues yang Ditemukan saat Integrasi (untuk dikerjakan di M9)

#### Issue 1 — IPK Terhitung di DPS Upload Panel

**Lokasi**: `frontend/src/features/mahasiswa/pohon-kurikulum/components/DpsUploadPanel.jsx` (atau child component yang render preview).

**Masalah**:
- Setelah parse DPS, frontend menampilkan kolom "IPK Terhitung" yang dihitung lokal di frontend dari (Angka × SKS) per row.
- Padahal parser DPS sudah mengembalikan `academic.ipk.nilai` (IPK resmi dari kampus, mis: `3.17`).
- Hitungan lokal di frontend bisa berbeda dari yang resmi karena formula bobot tidak persis match.

**Fix yang harus dilakukan**:
1. Backend `POST /riwayat-nilai/upload-dps` di response preview tambahkan field `academic` dari parser (sudah disediakan di M8).
2. Frontend `DpsUploadPanel.jsx`: hapus logic kalkulasi IPK lokal. Ambil `data.academic.ipk.nilai` langsung dari response preview untuk ditampilkan di card "IPK Terhitung".
3. Hapus juga kolom "Angka" dari tabel preview kalau tidak perlu (sesuai keputusan M8 — `nilai_angka` tidak dipakai di UI).

**Detail teknis**:
- Response preview M8 berisi `data.academic = { ipk: { nilai, sks, periode }, ips: { nilai, sks, periode }, sks: { totalLulus, lulusWajib, lulusPilihan, ... } }` — passthrough dari parser DPS.
- Backend tidak hitung ulang, tinggal forward parser output.

#### Issue 2 — Kolom SKS di preview DPS

**Masalah**: Preview tabel saat ini ada kolom SKS yang bisa diedit mahasiswa. Padahal sks per matkul sudah hardcoded di pohon kurikulum (master_matkul). Mahasiswa tidak perlu input.

**Fix**: di [DpsUploadPanel.jsx], hapus kolom SKS dari tabel preview. Backend lookup sks dari master_matkul saat confirm.

### Deliverable

- [x] Semua halaman utama frontend memakai backend nyata untuk happy path utama
- [x] Issue 1 (IPK Terhitung dari frontend lokal) sudah fix — kolom IPK Terhitung dihapus dari summary preview, grid di-rebalance jadi 3 kolom
- [x] Issue 2 (kolom SKS di preview) sudah dihapus — sks lookup di backend `uploadDpsConfirm` selalu pakai `master_matkul`

### Backend tweaks tambahan saat M9 (di luar plan awal)

- `riwayat-nilai.service.uploadDpsConfirm` — selalu re-lookup sks dari `master_matkul` (per Issue 2 — frontend tidak kirim sks)
- `mahasiswa.service.listMahasiswa` — tambah kolom `status_frs` via JOIN `rencana_studi` periode aktif (untuk tabel kaprodi)
- `dosen-wali.service.listDosenWali` — tambah `total_menunggu_review` & `total_disetujui` per dosen via JOIN
- `dosen-wali.service.getDosenWaliById` — tambah `rs_id`, `submitted_at`, `total_sks` per mahasiswa bimbingan
- `auth.controller.getMe` — tambah `profile` per role (sesuai api-spec final, sebelumnya placeholder)
- `periode.service` (list/aktif/detail) — tambah `total_kelas` per periode (count dari tabel `kelas`)
- `rencana-studi.router` — `/dosen/mahasiswa/:id/profil` & `/riwayat` allow kaprodi (read-only)
- `rencana-studi.service` — terima `callerRole`, skip ownership check kalau kaprodi

### Tambahan UI saat M9 (di luar plan awal)

- Edit periode untuk kaprodi — tombol Edit di tabel histori, dialog reuse `PeriodeCreateDialog` dengan prop `initialPeriode`. Backend `PUT /periode/:id` sudah ada sejak M4, frontend tinggal pakai.
- Empty state Perwalian Saya untuk mahasiswa baru — tombol "Buat FRS Baru" dengan auto-fetch periode aktif.
- Defensive null-safe di beberapa tempat (`PohonKurikulumFlow`, `IpkCard`, `DetailMahasiswaDashboardTab`) — kalau mahasiswa belum upload DPS, IPK/IPS bisa null.
- Migrasi `InputProps` (deprecated MUI v6) → `slotProps.input` di `MahasiswaBimbinganFilters`, `DosenWaliPage`, `MahasiswaPage`.

---

## Backend Milestone 10 - Hardening & Polish

**Goal**: backend cukup stabil untuk demo skripsi dan integrasi lanjutan.

### Tasks

- [ ] Auth hardening: move JWT from localStorage to HttpOnly cookie - tanya detail ke user
- [x] Frontend advisory check untuk bentrok jadwal saat mahasiswa pilih kelas
  - Pure frontend, zero backend changes. Cek pairwise sesi (hari sama + waktu overlap)
    saat klik Checkout di TambahMatkulPage.
  - Scope: kelas baru yang dipilih + kelas yang sudah di FRS (dari router state). Dedup by kelas_id.
  - Dialog `JadwalBentrokDialog` baru dengan tombol "Kembali" (tutup dialog, tidak navigate keluar).
  - Spec: `docs/superpowers/specs/2026-05-08-frontend-jadwal-bentrok-advisory-design.md`
- [ ] Standardize error handling
  - [x] Priority 2: audit controller yang expose `err.message` internal
  - [x] Priority 2: friendly response untuk PostgreSQL constraint errors umum (`23505`, `23503`, `23502`, `23514`)
  - [x] Priority 2: `PUT /periode/:id` rename ke nama duplikat return 409 friendly, bukan raw duplicate key
- [ ] Tambahkan request validation
- [ ] Tambahkan logging dasar
- [ ] Tambahkan test untuk service / endpoint penting
- [ ] Tambahkan protection untuk edge case periode
- [ ] Tambahkan protection untuk edge case ownership
- [ ] Audit response agar tetap sinkron dengan `api-spec-sistem-perwalian.md`
- [ ] Audit migration + seed untuk setup ulang dari nol
- [ ] Siapkan `.env.example`
- [ ] Siapkan dokumentasi run lokal backend

### Hotfix saat testing M10

- [x] **Rencana studi state machine — APPROVED edit → DRAFT** (sebelumnya SUBMITTED).
  - Bug user: setelah dosen approve, mahasiswa reset & submit ulang → ditolak "FRS tidak bisa di-submit dari status SUBMITTED".
  - Root cause: `nextStatusOnEdit` di `rencana-studi.service.js` flip APPROVED → SUBMITTED tiap kali delete/add item, sehingga loop reset bikin status auto-SUBMITTED tanpa user klik Submit.
  - Fix: APPROVED → DRAFT (bukan SUBMITTED). Mahasiswa wajib submit ulang manual setelah edit FRS yang sudah di-decided dosen. Catatan_dosen lama dibiarkan (dibersihkan saat submit ulang via existing logic).
  - Regression test ditambah di `backend/scripts/test-m6.js` step 14 + 14b.

### Deliverable

- [ ] Backend cukup stabil untuk demo penuh tanpa mock utama

---

## Status Tracking

| Backend Milestone | Status | Started | Completed |
|---|---|---|---|
| 1. Foundation & Auth | ✅ Done | 2026-04-30 | 2026-04-30 |
| 2. Database Schema & Seeds | ✅ Done | 2026-04-30 | 2026-04-30 |
| 3. User Management | ✅ Done | 2026-04-30 | 2026-04-30 |
| 4. Periode | ✅ Done | 2026-04-30 | 2026-04-30 |
| 5. Kelas & Upload Jadwal Excel | ✅ Done | 2026-04-30 | 2026-04-30 |
| 6. Core Rencana Studi Flow | ✅ Done | 2026-05-01 | 2026-05-01 |
| 7. Akademik & Pohon Kurikulum | ✅ Done | 2026-05-01 | 2026-05-01 |
| 8. Riwayat Nilai / DPS | ✅ Done | 2026-05-04 | 2026-05-04 |
| 9. Integrasi Frontend | ✅ Done | 2026-05-04 | 2026-05-07 |
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
