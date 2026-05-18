# API Spec — Sistem Informasi Perwalian (Final)

> RESTful API endpoints untuk backend Node.js, **selaras dengan ERD final**.  
> Companion dokumen untuk `blueprint-sistem-perwalian.md` & `erd-sistem-perwalian.md`.

---

## 📜 Changelog dari Versi Sebelumnya

| Endpoint Group | Sebelum | Sekarang |
|---|---|---|
| FRS | `/api/v1/frs/*` | `/api/v1/rencana-studi/*` |
| Mata Kuliah catalog | `/api/v1/mata-kuliah` | Hapus, diganti dengan `master-matkul` (pohon) + `kelas` (FRS) |
| Master Matkul (pohon) | tidak ada | `/api/v1/master-matkul/*` + `/edges` |
| Pohon kurikulum endpoint | tidak ada | `/api/v1/akademik/.../pohon-kurikulum` |
| Kelas | FK ke matkul | Standalone, dari Excel upload |
| DPS upload | snapshot snapshot | Trigger cache update profile_mahasiswa |

---

## 📋 Conventions

| Aspect | Rule |
|---|---|
| **Base URL** | `/api/v1` |
| **Naming** | `kebab-case`, Bahasa Indonesia untuk domain |
| **Auth** | Google OAuth SSO + JWT (Bearer token) |
| **Response format** | Wrapped: `{ success, data, message, errors }` |
| **Pagination** | Offset-based: `?page=1&limit=20` |
| **Filter/Sort** | Query params: `?status=SUBMITTED&sort=created_at:desc` |
| **Error codes** | HTTP standard (200/201/400/401/403/404/422/500) |
| **Timestamps** | ISO 8601 UTC: `2026-04-29T07:30:00Z` |

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operasi berhasil"
}
```

**Pagination:**
```json
{
  "success": true,
  "data": [ /* array */ ],
  "pagination": {
    "page": 1, "limit": 20, "total": 145, "total_pages": 8
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": { "email": ["Email harus berdomain @kampus.ac.id"] }
}
```

---

## 🔐 Authentication

### Google OAuth Flow

1. Frontend redirect ke `https://accounts.google.com/o/oauth2/v2/auth?...`
2. User authorize → Google return dengan `code`
3. Frontend kirim `code` ke backend → backend exchange → return JWT internal

### Email Domain Whitelist
- `@kampus.ac.id` — dosen & kaprodi
- `@student.kampus.ac.id` — mahasiswa
- *(placeholder, ganti dengan domain aktual)*

---

### `POST /api/v1/auth/google`

Exchange Google auth code dengan JWT internal.

**Request:**
```json
{ "code": "4/0AY0e-g7..." }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "budi@student.kampus.ac.id",
      "nama": "Budi Santoso",
      "role": "mahasiswa",
      "avatar_url": "https://lh3.googleusercontent.com/..."
    }
  }
}
```

**Error 403** — email tidak pre-registered:
```json
{
  "success": false,
  "message": "Email tidak terdaftar di sistem. Hubungi Kaprodi."
}
```

---

### `POST /api/v1/auth/logout`

**Headers:** `Authorization: Bearer <token>`

---

### `GET /api/v1/auth/me`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "budi@student.kampus.ac.id",
    "nama": "Budi Santoso",
    "role": "mahasiswa",
    "avatar_url": "https://...",
    "profile": {
      "nim": "10120001",
      "angkatan": 2020,
      "ipk": 3.42,
      "ips_terakhir": 3.55,
      "total_sks_lulus": 87,
      "dosen_wali": {
        "id": 5,
        "nama": "Dr. Sari",
        "jadwal_perwalian": "Senin 14-16"
      }
    }
  }
}
```

> Untuk role `dosen_wali`: profile berisi `nip` + `jadwal_perwalian`.  
> Untuk role `kaprodi`: profile minimal.

---

## 👥 User Management

### `GET /api/v1/dosen-wali`

**Auth:** kaprodi  
**Query params:** `?page=1&limit=20&search=budi`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "nama": "Dr. Sari Wijaya",
      "email": "sari@kampus.ac.id",
      "nip": "198001012005012001",
      "jumlah_bimbingan": 12,
      "jadwal_perwalian": "Senin 14-16, Rabu 10-12"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 8, "total_pages": 1 }
}
```

### `POST /api/v1/dosen-wali`

**Auth:** kaprodi

**Request:**
```json
{
  "nama": "Dr. Sari Wijaya",
  "email": "sari@kampus.ac.id",
  "nip": "198001012005012001",
  "jadwal_perwalian": "Senin 14-16"
}
```

### `GET /api/v1/dosen-wali/:id`

Detail + list mahasiswa bimbingan.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "nama": "Dr. Sari Wijaya",
    "email": "sari@kampus.ac.id",
    "nip": "198001012005012001",
    "jadwal_perwalian": "Senin 14-16",
    "mahasiswa_bimbingan": [
      {
        "id": 12,
        "nim": "10120001",
        "nama": "Budi Santoso",
        "ipk": 3.42,
        "rencana_studi_status": "SUBMITTED"
      }
    ]
  }
}
```

### `PUT /api/v1/dosen-wali/:id`

**Auth:** kaprodi

### `PATCH /api/v1/dosen-wali/me`

Update jadwal perwalian sendiri. **Auth:** dosen_wali

**Request:**
```json
{ "jadwal_perwalian": "Senin 14-16, Rabu 10-12" }
```

### `DELETE /api/v1/dosen-wali/:id`

**Auth:** kaprodi  
⚠️ Tolak jika masih punya bimbingan (return 409).

---

### `GET /api/v1/mahasiswa`

**Auth:** kaprodi (semua), dosen_wali (cuma bimbingannya)  
**Query params:** `?page=1&limit=20&search=budi&dosen_wali_id=5&angkatan=2020`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "nim": "10120001",
      "nama": "Budi Santoso",
      "email": "budi@student.kampus.ac.id",
      "angkatan": 2020,
      "ipk": 3.42,
      "total_sks_lulus": 87,
      "dosen_wali": { "id": 5, "nama": "Dr. Sari" }
    }
  ]
}
```

### `POST /api/v1/mahasiswa`

**Auth:** kaprodi

**Request:**
```json
{
  "nama": "Budi Santoso",
  "email": "budi@student.kampus.ac.id",
  "nim": "10120001",
  "angkatan": 2020,
  "dosen_wali_id": 5
}
```

### `GET /api/v1/mahasiswa/:id`

**Auth:** kaprodi (all), dosen_wali (bimbingannya), mahasiswa (dirinya)

### `PUT /api/v1/mahasiswa/:id`

**Auth:** kaprodi

### `PATCH /api/v1/mahasiswa/:id/dosen-wali`

Reassign. **Auth:** kaprodi

**Request:**
```json
{ "dosen_wali_id": 7 }
```

### `DELETE /api/v1/mahasiswa/:id`

**Auth:** kaprodi

---

## 📅 Periode

### `GET /api/v1/periode`

**Query params:** `?is_active=true&page=1&limit=20`

### `GET /api/v1/periode/aktif`

Get periode aktif saat ini (helper endpoint). Jika semua periode yang pernah dibuat sudah lewat tanggal selesai, endpoint ini mengembalikan `404`.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "nama": "Ganjil 2025/2026",
    "tahun_mulai": 2025,
    "jenis": "ganjil",
    "tanggal_mulai": "2025-09-01",
    "tanggal_selesai": "2026-01-31",
    "is_active": true
  }
}
```

**Response 404:** belum ada periode aktif.

### `POST /api/v1/periode`

**Auth:** kaprodi

Membuat periode baru sekaligus menjadikannya periode aktif. Backend harus otomatis menonaktifkan periode aktif sebelumnya.

**Nilai `jenis`:** `ganjil`, `genap`, atau `pendek` (Semester Pendek).

**Request:**
```json
{
  "nama": "Ganjil 2025/2026",
  "tahun_mulai": 2025,
  "jenis": "ganjil",
  "tanggal_mulai": "2025-09-01",
  "tanggal_selesai": "2026-01-31"
}
```

### `PUT /api/v1/periode/:id`

**Auth:** kaprodi

### `PATCH /api/v1/periode/:id/aktivasi`

**Auth:** kaprodi  
⚠️ Backend enforce: max 1 periode aktif (auto-deactivate periode lain). Endpoint ini hanya bisa dipakai untuk periode yang belum lewat tanggal selesai.

**Request:**
```json
{ "is_active": true }
```

### `DELETE /api/v1/periode/:id`

**Auth:** kaprodi  
Dipakai untuk koreksi input kaprodi. Jika periode yang dihapus sedang aktif, maka setelah delete sistem bisa berada pada kondisi tanpa periode aktif sampai kaprodi membuat atau mengaktifkan periode lain.

---

## 🌳 Master Matkul (Pohon Kurikulum)

> Tabel ini **terpisah** dari `kelas` (FRS). Hanya untuk visualisasi pohon kurikulum.

### `GET /api/v1/master-matkul`

List semua matkul untuk pohon.

**Query params:** `?semester=3&search=algoritma`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode_aktif": "AIF231103",
      "kode_alias": ["AIF181103"],
      "nama": "Dasar Pemrograman",
      "sks": 4,
      "semester": 1,
      "kolom": 4,
      "tipe": "wajib"
    }
  ]
}
```

### `GET /api/v1/master-matkul/:id`

Detail + edge prerequisites.

### `POST /api/v1/master-matkul`

**Auth:** kaprodi

**Request:**
```json
{
  "kode_aktif": "AIF231103",
  "kode_alias": ["AIF181103"],
  "nama": "Dasar Pemrograman",
  "sks": 4,
  "semester": 1,
  "kolom": 4,
  "tipe": "wajib"
}
```

### `PUT /api/v1/master-matkul/:id`
### `DELETE /api/v1/master-matkul/:id`

**Auth:** kaprodi

---

### `GET /api/v1/master-matkul/edges`

List semua edge (prerequisites).

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "source": { "id": 1, "kode_aktif": "AIF231103", "nama": "Dasar Pemrograman" },
      "target": { "id": 5, "kode_aktif": "AIF233401", "nama": "Pengantar Data Science" },
      "relation_type": "prasyarat_lulus"
    }
  ]
}
```

### `POST /api/v1/master-matkul/edges`

**Auth:** kaprodi

**Request:**
```json
{
  "source_id": 1,
  "target_id": 5,
  "relation_type": "prasyarat_lulus"
}
```

`relation_type` enum: `prasyarat_lulus` | `prasyarat_tempuh` | `prasyarat_tempuh_atau_tempuh_bersama` | `prasyarat_lulus_atau_tempuh_bersama`

### `DELETE /api/v1/master-matkul/edges/:id`

**Auth:** kaprodi

---

## 🏫 Kelas & Sesi (Dari Excel Upload)

> Sumber data utama untuk halaman pemilihan matkul mahasiswa.

### `GET /api/v1/kelas`

List kelas yang ditawarkan di periode tertentu.

**Query params:** `?periode_id=3&kode_matkul=AIF231103&search=algoritma`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "kode_matkul": "AIF231103",
      "nama_matkul": "Dasar Pemrograman",
      "sks": 4,
      "nama_kelas": "A",
      "tipe": "wajib",
      "periode": { "id": 3, "nama": "Ganjil 2025/2026" },
      "sesi": [
        {
          "id": 50,
          "nomor_sesi": 1,
          "hari": "senin",
          "jam_mulai": "10:00",
          "jam_selesai": "12:00",
          "bentuk_pembelajaran": "Kuliah",
          "dosen_utama": "Husnul Hakim S.Kom., M.T.",
          "ruangan": "R201"
        },
        {
          "id": 51,
          "nomor_sesi": 2,
          "hari": "rabu",
          "jam_mulai": "08:00",
          "jam_selesai": "10:00",
          "bentuk_pembelajaran": "Praktikum",
          "dosen_utama": "Husnul Hakim S.Kom., M.T.",
          "ruangan": "Lab IF 9016"
        }
      ]
    }
  ]
}
```

### `GET /api/v1/kelas/:id`

Detail kelas + sesi.

### `POST /api/v1/kelas/upload`

Upload Excel jadwal kelas. **Auth:** kaprodi

**Request:** `multipart/form-data`
- `file`: Excel file (.xlsx)
- `periode_id`: ID periode target

**Response 200 — preview:**
```json
{
  "success": true,
  "data": {
    "preview": [
      {
        "kode_matkul": "AIF231103",
        "nama_matkul": "Dasar Pemrograman",
        "sks": 4,
        "nama_kelas": "A",
        "sesi_count": 3,
        "valid": true
      },
      {
        "row_excel": 5,
        "kode_matkul": "",
        "valid": false,
        "errors": ["Kode matkul kosong"]
      }
    ],
    "summary": {
      "total_rows": 250,
      "total_kelas": 45,
      "valid_kelas": 44,
      "invalid_kelas": 1
    },
    "upload_token": "abc123"
  }
}
```

### `POST /api/v1/kelas/upload/confirm`

**Request:**
```json
{
  "upload_token": "abc123",
  "mode": "replace"
}
```

> **Replace mode**: hapus semua kelas + sesi periode_id, terus insert ulang.

### `GET /api/v1/kelas/template`

Download Excel template.

---

## 📝 Rencana Studi (Core FRS Flow)

### `GET /api/v1/rencana-studi/saya`

Get FRS milik mahasiswa yang login (current periode aktif).

**Auth:** mahasiswa  
**Query params:** `?periode_id=3` (optional, default ke periode aktif)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "periode": { "id": 3, "nama": "Ganjil 2025/2026" },
    "status": "SUBMITTED",
    "total_sks": 18,
    "catatan_dosen": null,
    "submitted_at": "2025-08-15T10:30:00Z",
    "reviewed_at": null,
    "items": [
      {
        "id": 100,
        "kelas": {
          "id": 10,
          "kode_matkul": "AIF231103",
          "nama_matkul": "Dasar Pemrograman",
          "sks": 4,
          "nama_kelas": "A",
          "sesi": [ /* ... */ ]
        }
      }
    ]
  }
}
```

**Response 404:** belum ada FRS — frontend tampilkan tombol "Buat FRS Baru".

### `GET /api/v1/rencana-studi/saya/riwayat`

List semua FRS mahasiswa per periode (untuk tab di halaman Perwalian Saya).

**Auth:** mahasiswa

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "periode": { "id": 3, "nama": "Ganjil 2025/2026", "is_active": true },
      "status": "SUBMITTED",
      "total_sks": 18,
      "submitted_at": "2025-08-15T10:30:00Z"
    },
    {
      "id": 22,
      "periode": { "id": 2, "nama": "Genap 2024/2025", "is_active": false },
      "status": "APPROVED",
      "total_sks": 21
    }
  ]
}
```

### `POST /api/v1/rencana-studi`

Create FRS baru (status DRAFT).

**Auth:** mahasiswa  
**Pre-condition:** belum ada FRS untuk periode aktif.

**Request:**
```json
{ "periode_id": 3 }
```

### `POST /api/v1/rencana-studi/:id/items`

Tambah kelas ke FRS.

**Auth:** mahasiswa (FRS sendiri)

**Request:**
```json
{ "kelas_id": 10 }
```

⚠️ **Side effect**: kalau status FRS `APPROVED`, auto-change ke `SUBMITTED`.  
⚠️ **Constraint**: tidak boleh tambah `kelas_id` yang sudah ada (UNIQUE constraint, return 409).

### `DELETE /api/v1/rencana-studi/:id/items/:item_id`

**Auth:** mahasiswa (FRS sendiri)

### `POST /api/v1/rencana-studi/:id/submit`

Submit FRS untuk review dosen wali.

**Auth:** mahasiswa  
**Pre-conditions:**
- Status = `DRAFT` atau `REJECTED`
- Periode aktif
- Minimal 1 item

**Response 200:**
```json
{
  "success": true,
  "data": { "id": 25, "status": "SUBMITTED", "submitted_at": "..." }
}
```

---

### `GET /api/v1/rencana-studi/dosen/bimbingan`

List FRS mahasiswa bimbingan dosen yang login (untuk dashboard dosen).

**Auth:** dosen_wali  
**Query params:** `?periode_id=3&status=SUBMITTED`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "mahasiswa": {
        "id": 12,
        "nim": "10120001",
        "nama": "Budi Santoso",
        "ipk": 3.42
      },
      "periode": { "id": 3, "nama": "Ganjil 2025/2026" },
      "status": "SUBMITTED",
      "total_sks": 18,
      "submitted_at": "2025-08-15T10:30:00Z"
    }
  ],
  "summary": {
    "total": 12,
    "approved": 4,
    "submitted": 5,
    "rejected": 1,
    "draft_or_empty": 2
  }
}
```

### `GET /api/v1/rencana-studi/dosen/mahasiswa/:mahasiswa_id/profil`

Profil akademik mahasiswa bimbingan untuk halaman detail dosen wali.

**Auth:** dosen_wali (mahasiswa bimbingannya)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "mahasiswa": {
      "id": 12,
      "nim": "10120001",
      "nama": "Budi Santoso",
      "angkatan": 2020,
      "ipk": 3.42,
      "ips_terakhir": 3.55,
      "total_sks_lulus": 87,
      "total_sks_wajib_lulus": 70,
      "total_sks_pilihan_lulus": 17
    },
    "periode_aktif": { "id": 3, "nama": "Ganjil 2025/2026" }
  }
}
```

### `GET /api/v1/rencana-studi/dosen/mahasiswa/:mahasiswa_id/riwayat`

List histori FRS mahasiswa bimbingan untuk tab Rencana Studi di halaman detail dosen wali.

**Auth:** dosen_wali (mahasiswa bimbingannya)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 25,
      "periode": { "id": 3, "nama": "Ganjil 2025/2026" },
      "status": "SUBMITTED",
      "total_sks": 18,
      "submitted_at": "2025-08-15T10:30:00Z",
      "mahasiswa": {
        "id": 12,
        "nim": "10120001",
        "nama": "Budi Santoso"
      }
    }
  ]
}
```

### `GET /api/v1/rencana-studi/:id`

Detail FRS — rich info untuk dosen wali review.

**Auth:** mahasiswa (sendiri), dosen_wali (bimbingannya), kaprodi (semua)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "mahasiswa": {
      "id": 12,
      "nim": "10120001",
      "nama": "Budi Santoso",
      "angkatan": 2020,
      "ipk": 3.42,
      "ips_terakhir": 3.55,
      "total_sks_lulus": 87,
      "total_sks_wajib_lulus": 70,
      "total_sks_pilihan_lulus": 17
    },
    "periode": { "id": 3, "nama": "Ganjil 2025/2026" },
    "status": "SUBMITTED",
    "total_sks": 18,
    "catatan_dosen": null,
    "submitted_at": "2025-08-15T10:30:00Z",
    "reviewed_at": null,
    "items": [
      {
        "id": 100,
        "kelas": {
          "id": 10,
          "kode_matkul": "AIF231103",
          "nama_matkul": "Dasar Pemrograman",
          "sks": 4,
          "nama_kelas": "A",
          "tipe": "wajib",
          "sesi": [ /* ... */ ]
        },
        "is_mengulang": false,
        "tags": ["wajib"]
      }
    ]
  }
}
```

> `is_mengulang` dihitung dari riwayat_nilai (cek apakah ada record `kode_matkul` yang sama dengan status `TIDAK_LULUS`).

### `POST /api/v1/rencana-studi/:id/setujui`

**Auth:** dosen_wali (FRS bimbingannya)  
**Pre-condition:** status = `SUBMITTED`

**Request:**
```json
{ "catatan": "Semester depan kurangi SKS-nya ya" }
```
(catatan opsional)

### `POST /api/v1/rencana-studi/:id/revisi`

**Auth:** dosen_wali (FRS bimbingannya)  
**Pre-condition:** status = `SUBMITTED`

**Request:**
```json
{ "catatan": "Tolong ganti matkul X karena belum lulus prasyarat" }
```

---

## 📊 Riwayat Nilai

### `GET /api/v1/riwayat-nilai/saya`

**Auth:** mahasiswa  
**Query params:** `?periode_id=3` (optional)

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode_matkul": "AIF231103",
      "nama_matkul": "Dasar Pemrograman",
      "sks": 4,
      "periode": { "id": 1, "nama": "Ganjil 2023/2024" },
      "nilai_huruf": "A",
      "nilai_angka": 90,
      "status": "LULUS"
    }
  ]
}
```

### `GET /api/v1/riwayat-nilai/mahasiswa/:id`

**Auth:** dosen_wali (bimbingannya), kaprodi (semua)

### `POST /api/v1/riwayat-nilai/upload-dps`

Upload PDF DPS.

**Auth:** mahasiswa  
**Request:** `multipart/form-data`
- `file`: PDF file

**Response 200 — preview (parser hasil):**
```json
{
  "success": true,
  "data": {
    "periode_terdeteksi": { "nama": "Ganjil 2023/2024", "id": 1 },
    "preview": [
      {
        "kode_matkul": "AIF231103",
        "nama_matkul": "Dasar Pemrograman",
        "sks": 4,
        "nilai_huruf": "A",
        "nilai_angka": 90,
        "status": "LULUS",
        "valid": true
      }
    ],
    "summary": {
      "total_rows": 6,
      "valid_rows": 6,
      "ipk_terhitung": 3.42
    },
    "upload_token": "xyz789"
  }
}
```

### `POST /api/v1/riwayat-nilai/upload-dps/confirm`

Konfirmasi (mahasiswa boleh edit row sebelum simpan).

**Request:**
```json
{
  "upload_token": "xyz789",
  "mode": "replace",
  "items": [
    {
      "kode_matkul": "AIF231103",
      "nama_matkul": "Dasar Pemrograman",
      "sks": 4,
      "periode_id": 1,
      "nilai_huruf": "A",
      "nilai_angka": 90,
      "status": "LULUS"
    }
  ]
}
```

**Side effect**: 
- Replace `riwayat_nilai` untuk periode tersebut
- Recalculate cache di `profile_mahasiswa` (ipk, ips_terakhir, total_sks_*)

### `POST /api/v1/riwayat-nilai/manual`

Input manual (fallback kalau parser fail). **Auth:** mahasiswa

**Request:**
```json
{
  "items": [
    {
      "kode_matkul": "AIF231103",
      "nama_matkul": "Dasar Pemrograman",
      "sks": 4,
      "periode_id": 1,
      "nilai_huruf": "A",
      "status": "LULUS"
    }
  ]
}
```

---

## 📈 Akademik (Dashboard, Pohon Kurikulum, Progress)

### `GET /api/v1/akademik/saya/ringkasan`

Get ringkasan akademik untuk dashboard mahasiswa.

**Auth:** mahasiswa

**Response 200:**
```json
{
  "success": true,
  "data": {
    "ipk": 3.42,
    "ips_terakhir": 3.55,
    "total_sks_lulus": 87,
    "total_sks_wajib_lulus": 70,
    "total_sks_pilihan_lulus": 17,
    "periode_aktif": {
      "id": 3,
      "nama": "Ganjil 2025/2026",
      "tanggal_mulai": "2025-09-01",
      "tanggal_selesai": "2026-01-31"
    },
    "dosen_wali": {
      "id": 5,
      "nama": "Dr. Sari",
      "email": "sari@kampus.ac.id",
      "jadwal_perwalian": "Senin 14-16"
    },
    "rencana_studi_status": "APPROVED"
  }
}
```

---

### `GET /api/v1/akademik/saya/pohon-kurikulum`

Get data pohon kurikulum (nodes + edges + match status untuk render React Flow).

**Auth:** mahasiswa

**Response 200:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": 1,
        "kode_aktif": "AIF231103",
        "nama": "Dasar Pemrograman",
        "sks": 4,
        "semester": 1,
        "kolom": 4,
        "tipe": "wajib",
        "match": {
          "status": "LULUS",
          "nilai_huruf": "A",
          "nilai_angka": 90
        }
      },
      {
        "id": 5,
        "kode_aktif": "AIF233401",
        "nama": "Pengantar Data Science",
        "sks": 3,
        "semester": 5,
        "kolom": 5,
        "tipe": "wajib",
        "match": null
      },
      {
        "id": 8,
        "kode_aktif": "AIF233101",
        "nama": "Rekayasa Perangkat Lunak",
        "sks": 4,
        "semester": 5,
        "kolom": 4,
        "tipe": "wajib",
        "match": {
          "status": "TIDAK_LULUS",
          "nilai_huruf": "E",
          "nilai_angka": 30
        }
      }
    ],
    "edges": [
      {
        "id": 100,
        "source_id": 1,
        "target_id": 5,
        "relation_type": "prasyarat_lulus"
      }
    ],
    "summary": {
      "total_sks_lulus": 27,
      "ipk": 3.0,
      "ips_terakhir": 3.0
    }
  }
}
```

> **Match logic** (di backend):
> ```
> for each node in master_matkul:
>   nilai = SELECT * FROM riwayat_nilai 
>           WHERE mahasiswa_id = X 
>             AND (kode_matkul = node.kode_aktif OR kode_matkul = ANY(node.kode_alias))
>   if nilai exists: node.match = { status, nilai_huruf, nilai_angka }
>   else: node.match = null
> ```

> **Mapping warna di frontend**:
> - `match = null` → putih
> - `match.status = LULUS` → hijau
> - `match.status = TIDAK_LULUS` → merah

> **Note — Render node dengan multi-kode**: frontend tidak membuat node terpisah untuk `kode_alias`.  
> Endpoint pohon kurikulum selalu mengembalikan 1 node per row `master_matkul`.  
> Jika nilai DPS mahasiswa cocok dengan `kode_aktif` atau salah satu `kode_alias`, backend mengisi `node.match`, lalu frontend cukup mewarnai node tersebut dan menampilkan nilai yang cocok.

---

### `GET /api/v1/akademik/mahasiswa/:id/ringkasan`
### `GET /api/v1/akademik/mahasiswa/:id/pohon-kurikulum`

Same dengan endpoint atas, tapi untuk mahasiswa lain.

**Auth:** dosen_wali (bimbingannya), kaprodi (semua)

---

## 🔒 Authorization Matrix

| Resource | Action | Mahasiswa | Dosen Wali | Kaprodi |
|---|---|:---:|:---:|:---:|
| Auth | Login, logout, /me | ✅ | ✅ | ✅ |
| Dosen Wali | List, Get, Create, Update, Delete | ❌ | ❌ | ✅ |
| Dosen Wali | Update jadwal sendiri | ❌ | ✅ | ✅ |
| Mahasiswa | List | ❌ | Bimbingannya | ✅ |
| Mahasiswa | Get detail | Diri sendiri | Bimbingannya | ✅ |
| Mahasiswa | Create, Update, Delete, Reassign | ❌ | ❌ | ✅ |
| Periode | List, Get aktif | ✅ | ✅ | ✅ |
| Periode | Create, Update, Delete, Aktivasi | ❌ | ❌ | ✅ |
| Master Matkul | List, Get | ✅ | ✅ | ✅ |
| Master Matkul | Create, Update, Delete, Edges | ❌ | ❌ | ✅ |
| Kelas | List, Get | ✅ | ✅ | ✅ |
| Kelas | Upload | ❌ | ❌ | ✅ |
| Rencana Studi | Get sendiri | ✅ | - | - |
| Rencana Studi | Submit, Edit, Items | Diri sendiri | ❌ | ❌ |
| Rencana Studi | List bimbingan, Setujui, Revisi | ❌ | Bimbingannya | ❌ |
| Rencana Studi | Get detail | Diri sendiri | Bimbingannya | ✅ |
| Riwayat Nilai | Get sendiri | ✅ | - | - |
| Riwayat Nilai | Upload DPS, Manual input | Diri sendiri | ❌ | ❌ |
| Riwayat Nilai | Get mahasiswa lain | ❌ | Bimbingannya | ✅ |
| Akademik (ringkasan, pohon) | Sendiri | ✅ | - | - |
| Akademik (mahasiswa lain) | - | ❌ | Bimbingannya | ✅ |

---

## 🛡️ Backend Validations

### Hard validations (enforce di backend)
- ✅ Authentication (JWT valid)
- ✅ Authorization (role-based + ownership)
- ✅ Email domain whitelist saat OAuth
- ✅ Periode aktif untuk action FRS (submit, approve, reject)
- ✅ Status transitions FRS (e.g. SUBMITTED → APPROVED)
- ✅ FRS unique per (mahasiswa, periode)
- ✅ Item unique (kelas tidak boleh duplicate dalam 1 FRS)
- ✅ Hanya 1 periode aktif (DB constraint via partial unique index)
- ✅ Pas periode tidak aktif → semua write action tolak (read-only)

### Soft validations (sesuai filosofi minimal)
- ⚠️ TIDAK ada cek SKS maksimum
- ⚠️ TIDAK ada cek prasyarat matkul
- ⚠️ TIDAK ada cek bentrok jadwal
- ⚠️ TIDAK ada cek matkul Excel ada di master_matkul (independent systems)

---

## 🚀 Implementation Phases

```
Phase 1 — Auth & Foundation
├─ Google OAuth flow + JWT
├─ Seed Kaprodi via SQL
└─ Middleware JWT + role check

Phase 2 — User Management
├─ CRUD Dosen Wali
└─ CRUD Mahasiswa

Phase 3 — Periode
├─ CRUD periode
└─ Aktivasi logic

Phase 4 — Master Matkul (Pohon Kurikulum)
├─ Seed master_matkul + edges
├─ GET endpoints untuk render pohon
└─ (CRUD opsional)

Phase 5 — Kelas (Excel Upload)
├─ POST upload jadwal Excel (preview + confirm)
├─ Parser Excel (xlsx library)
└─ GET kelas + sesi untuk halaman pemilihan

Phase 6 — Core Rencana Studi Flow
├─ Mahasiswa: GET saya, POST, items add/remove, submit
├─ Dosen wali: GET bimbingan, GET detail (rich), setujui, revisi
└─ State machine enforcement

Phase 7 — Akademik & Pohon Kurikulum
├─ Ringkasan akademik (cache profile_mahasiswa)
├─ Pohon kurikulum endpoint (match logic)
└─ Manual input riwayat nilai (untuk awal sebelum parser)

Phase 8 — DPS PDF Upload (Parser)
├─ Integrate parser dosen
├─ Preview & manual edit flow
├─ Confirm & save → trigger cache update
└─ Recalculate IPK & total SKS

Phase 9 — Polish
├─ Empty states
├─ Error messages friendly
└─ Edge cases
```

---

## ✅ Out of Scope

- ❌ Notifikasi
- ❌ Real-time (WebSocket / SSE)
- ❌ Multi prodi
- ❌ Versioning kurikulum lengkap
- ❌ Reset password (pakai SSO)
- ❌ Refresh token rotation

---

*Dokumen final — siap digunakan sebagai kontrak FE-BE selama development.*
