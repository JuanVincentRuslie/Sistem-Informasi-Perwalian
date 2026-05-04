# Parser Integration Notes

> Dokumen ini menjelaskan parser yang sudah ada di repo dan bagaimana parser tersebut dipakai oleh backend.

Harus sinkron dengan:
- `docs/MILESTONES-BACKEND.md`
- `docs/api-spec-sistem-perwalian.md`
- `docs/erd-sistem-perwalian.md`
- `docs/blueprint-sistem-perwalian.md`

---

## Tujuan

Parser di project ini bukan fitur mandiri, tetapi komponen internal backend untuk:
- membaca file upload
- mengubah file mentah menjadi data terstruktur
- mengembalikan **preview**
- baru menyimpan ke database setelah user melakukan **confirm**

Jadi prinsip umumnya:

```text
upload file -> parser jalan -> backend validasi -> backend kirim preview -> user confirm -> backend simpan
```

---

## Parser yang Sudah Ada

### 1. Parser Jadwal Excel

Lokasi:
- `parser_for_backend/Jadwal_excel_parser/parse-jadwal.js`
- `parser_for_backend/Jadwal_excel_parser/README.md`
- `parser_for_backend/Jadwal_excel_parser/BACKEND_INTEGRATION.md`
- `parser_for_backend/Jadwal_excel_parser/Template_Jadwal Ganjil 2025-2026-Prodi Informatika.xlsx`

Fungsi utama:
- membaca Excel jadwal kelas
- membentuk data `kelas`
- membentuk data `sesi_kelas`

Dipakai untuk:
- `POST /api/v1/kelas/upload`
- `POST /api/v1/kelas/upload/confirm`

Flow backend:

```text
Kaprodi upload Excel jadwal
Backend simpan file sementara
Backend panggil parser jadwal
Backend validasi hasil parse
Backend return preview
Kaprodi confirm replace
Backend replace data kelas + sesi_kelas pada periode target
Backend hapus file sementara
```

Catatan penting:
- `periode_id` berasal dari request backend, bukan dari file Excel semata
- parser ini adalah internal service, bukan endpoint terpisah

---

### 2. Parser DPS PDF

Lokasi:
- `parser_for_backend/Dps_parser/index.js`
- `parser_for_backend/Dps_parser/DPS_6182201039.pdf`
- `parser_for_backend/Dps_parser/DPS_6182201039.json`
- `parser_for_backend/Dps_parser/note.txt`

Catatan:
- `index.js` adalah parser aktif
- `tmp.js` adalah parser lama yang masih menyimpan logic backend lama

Fungsi utama:
- extract text dari PDF DPS
- parse profil mahasiswa
- parse data akademik ringkas
- parse daftar mata kuliah
- memilih nilai terbaik saat satu kode mata kuliah muncul lebih dari sekali
- menghasilkan struktur siap preview dan siap dipetakan ke `riwayat_nilai`

Export yang tersedia dari parser:
- `parseDpsFile(filePath)`
- `extractPdfText(filePath)`
- `parseDps(rawText)`
- `saveParsedJson(filePath, parsed)`
- `getJsonOutputPath(filePath)`

Contoh output penting dari parser:
- `profile`
- `academic`
- `stats`
- `courses`
- `transcript`
- `unparsedCourseLines`

Makna field output:
- `courses`: semua mata kuliah hasil parse, termasuk yang belum punya nilai
- `transcript`: hasil yang sudah disaring untuk nilai terbaik per kode mata kuliah
- `unparsedCourseLines`: baris yang gagal dibaca parser dan perlu perhatian manual
- `academic`: ringkasan IPK, IPS, dan SKS

Dipakai untuk:
- `POST /api/v1/riwayat-nilai/upload-dps`
- `POST /api/v1/riwayat-nilai/upload-dps/confirm`

Flow backend:

```text
Mahasiswa upload PDF DPS
Backend simpan file sementara
Backend panggil parser DPS
Backend validasi hasil parse
Backend return preview
Mahasiswa edit manual jika ada row yang perlu diperbaiki
Mahasiswa confirm replace
Backend replace data riwayat_nilai pada periode terkait
Backend recalculate cache profile_mahasiswa
Backend hapus file sementara
```

---

## Mapping Parser DPS ke Domain API

Parser DPS saat ini menghasilkan data yang lebih kaya daripada kontrak API, jadi backend perlu memetakan.

### Sumber preview

Untuk preview frontend mahasiswa:
- gunakan `courses` sebagai bahan tabel preview
- tampilkan `unparsedCourseLines` sebagai warning tambahan bila ada
- tampilkan `academic` sebagai konteks hasil parse

### Sumber simpan ke database

Untuk penyimpanan `riwayat_nilai`:
- utamakan `transcript` sebagai daftar nilai final per kode mata kuliah
- setiap item kemudian dipetakan ke shape API / DB

Mapping minimum (M8 — keputusan akhir):

```text
mahasiswa_id  <- req.user.id (dari JWT, abaikan profile.npm dari PDF)
kode_matkul   <- transcript.kode
nama_matkul   <- transcript.nama
sks           <- lookup dari master_matkul (cek kode_aktif & kode_alias). Default 0 jika tidak match.
nilai_huruf   <- transcript.nilai
nilai_angka   <- NULL (tidak dipakai di UI; field tetap nullable di DB)
periode_id    <- ID periode dummy "Riwayat DPS" (lihat catatan di bawah)
status        <- "TIDAK_LULUS" jika nilai_huruf = "E", selain itu "LULUS"
sumber        <- "dps_upload"
```

**Penting — Periode Dummy untuk Riwayat DPS**:

> Backend menyediakan satu periode khusus dengan `is_active=FALSE` dan nama "Riwayat DPS". Semua row hasil upload DPS pakai `periode_id` periode dummy ini, terlepas dari `tahunSemester` di parser.
>
> Alasan: 1 file DPS berisi nilai dari banyak periode, dan UI tidak butuh granularitas per periode. IPK/IPS/total SKS langsung diambil dari `academic.*` parser, bukan dihitung per periode.
>
> Konsekuensi: backend **tidak** memetakan `transcript[].tahunSemester` ke periode database. Field tersebut diabaikan.

**IPK / IPS / total SKS langsung dari parser**:

```text
profile_mahasiswa.ipk                  <- academic.ipk.nilai
profile_mahasiswa.ips_terakhir         <- academic.ips.nilai
profile_mahasiswa.total_sks_lulus      <- academic.sks.totalLulus
profile_mahasiswa.total_sks_wajib_lulus <- academic.sks.lulusWajib
profile_mahasiswa.total_sks_pilihan_lulus <- academic.sks.lulusPilihan
```

Function `applyAcademicSnapshot(mahasiswaId, academicData)` di `backend/src/modules/akademik/akademik.service.js` menangani ini saat upload DPS confirm.

---

## Mapping Parser Jadwal ke Domain API

Untuk parser jadwal Excel:

Mapping tabel `kelas`:

```text
periode_id   <- request.periode_id
kode_matkul  <- kelas.kode_matkul
nama_matkul  <- kelas.nama_matkul
sks          <- kelas.sks
nama_kelas   <- kelas.nama_kelas
tipe         <- kelas.tipe
```

Mapping tabel `sesi_kelas`:

```text
kelas_id              <- hasil insert kelas
nomor_sesi            <- sesi.nomor_sesi
hari                  <- sesi.hari
jam_mulai             <- sesi.jam_mulai
jam_selesai           <- sesi.jam_selesai
bentuk_pembelajaran   <- sesi.bentuk_pembelajaran
dosen_utama           <- sesi.dosen_utama
ruangan               <- sesi.ruangan
```

---

## Prinsip Integrasi Backend

Semua parser sebaiknya mengikuti pola backend yang sama:

1. parser dipanggil dari **service layer backend**
2. hasil parser jangan langsung insert DB
3. backend selalu return preview dulu
4. confirm endpoint yang melakukan write final
5. file upload sementara dibersihkan setelah proses selesai
6. error parser harus dibungkus ke format response API project

---

## Rekomendasi Struktur Backend

Contoh struktur penempatan parser saat backend mulai dibangun:

```text
backend/
  src/
    services/
      parsers/
        jadwalExcelParser.js
        dpsPdfParser.js
    modules/
      kelas/
      riwayat-nilai/
```

Kalau belum ingin memindahkan file parser langsung, backend boleh mulai dengan wrapper yang memanggil file di `parser_for_backend/` terlebih dahulu, lalu dirapikan belakangan.

---

## Checklist Integrasi Nyata

### Jadwal Excel

- [ ] parser jadwal dipanggil dari service backend
- [ ] hasil parse bisa dipreview
- [ ] confirm replace menyimpan `kelas` + `sesi_kelas`
- [ ] file sementara dibersihkan

### DPS PDF

- [ ] parser DPS dipanggil dari service backend
- [ ] hasil `courses` tampil di preview frontend
- [ ] hasil `transcript` dipakai untuk save final
- [ ] `unparsedCourseLines` ikut ditampilkan sebagai warning
- [ ] cache `profile_mahasiswa` di-update setelah confirm
- [ ] file sementara dibersihkan

---

## Referensi

- `parser_for_backend/Jadwal_excel_parser/BACKEND_INTEGRATION.md`
- `parser_for_backend/Jadwal_excel_parser/parse-jadwal.js`
- `parser_for_backend/Dps_parser/index.js`
- `parser_for_backend/Dps_parser/DPS_6182201039.json`
- `docs/MILESTONES-BACKEND.md`
- `docs/api-spec-sistem-perwalian.md`
- `docs/erd-sistem-perwalian.md`

---

*Dokumen hidup - update saat parser berubah atau saat kontrak backend berubah*
