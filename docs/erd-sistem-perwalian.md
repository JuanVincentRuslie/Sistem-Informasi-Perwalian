# ERD Sistem Informasi Perwalian (Final)

> Dokumen ini merupakan **versi final** setelah serangkaian diskusi.  
> Detail data model & schema untuk PostgreSQL.

---

## 📜 Changelog dari Versi Sebelumnya

| Perubahan | Sebelum | Sekarang |
|---|---|---|
| Catalog matkul | `mata_kuliah` (catalog FRS + tree) | `master_matkul` (**hanya untuk pohon kurikulum**) |
| Sumber data FRS | `kelas` (FK ke `mata_kuliah`) | `kelas` (dari Excel, **independent dari master_matkul**) |
| Multi kode kurikulum | tidak di-handle | `kode_alias TEXT[]` untuk handle 2 kode dari kurikulum berbeda |
| Prerequisites | `mata_kuliah_prasyarat` (simple M:N) | `master_matkul_edge` dengan **4 jenis enum** (PRASYARAT_LULUS, dll) |
| Tabel jadwal | `kelas` + `jadwal_kelas` (FK chain) | `kelas` + `sesi_kelas` (no FK ke master_matkul) |
| Tabel FRS | `frs` + `frs_item` | `rencana_studi` + `rencana_studi_item` |
| Riwayat nilai | FK ke `mata_kuliah` | Soft match via `kode_matkul` string |
| Auth | password_hash | Google OAuth SSO (no password) |

---

## 🎯 Filosofi Desain

1. **Two parallel systems** — Pohon kurikulum (visual) dan FRS (transaksional) **terpisah total**, tidak ada FK antar keduanya. Match via string `kode_matkul`.
2. **Trust, don't validate** — Sistem tidak hard-validate prasyarat, SKS max, bentrok jadwal. Dosen wali yang verifikasi manual.
3. **Excel as source of truth** — Jadwal & catalog matkul (untuk FRS) datang dari Excel upload Kaprodi, bukan CRUD form.
4. **Denormalized cache** — IPK & total SKS di-cache di `profile_mahasiswa` untuk performance dashboard, di-update saat upload DPS.

---

## 🏗️ Convention & Standards

| Aspect | Choice |
|---|---|
| Primary Key | `BIGSERIAL` |
| Timestamps | `TIMESTAMPTZ` (timezone-aware) |
| Enum | `VARCHAR + CHECK constraint` |
| Naming | `snake_case`, English untuk teknis, Indonesia untuk domain |
| Soft delete | Tidak digunakan (skripsi MVP) |

---

## 📊 ERD Diagram Lengkap

```mermaid
erDiagram
    USERS ||--o| PROFILE_MAHASISWA : "is"
    USERS ||--o| PROFILE_DOSEN : "is"
    PROFILE_DOSEN ||--o{ PROFILE_MAHASISWA : "supervises"

    USERS ||--o{ RENCANA_STUDI : "owns (mahasiswa)"
    USERS ||--o{ RENCANA_STUDI : "reviews (dosen)"
    PERIODE ||--o{ RENCANA_STUDI : "applies in"
    RENCANA_STUDI ||--o{ RENCANA_STUDI_ITEM : "contains"
    KELAS ||--o{ RENCANA_STUDI_ITEM : "selected as"

    PERIODE ||--o{ KELAS : "in period"
    KELAS ||--|{ SESI_KELAS : "scheduled at"

    USERS ||--o{ RIWAYAT_NILAI : "earns"
    PERIODE ||--o{ RIWAYAT_NILAI : "in period"

    MASTER_MATKUL ||--o{ MASTER_MATKUL_EDGE : "is source of"
    MASTER_MATKUL ||--o{ MASTER_MATKUL_EDGE : "is target of"

    USERS {
        bigserial id PK
        varchar email UK
        varchar nama
        varchar role "kaprodi/dosen_wali/mahasiswa"
        varchar google_id UK
        varchar avatar_url
        timestamptz last_login_at
        boolean is_active
    }

    PROFILE_MAHASISWA {
        bigint user_id PK_FK
        varchar nim UK
        smallint angkatan
        bigint dosen_wali_id FK
        decimal ipk "cached"
        decimal ips_terakhir "cached"
        smallint total_sks_lulus "cached"
        smallint total_sks_wajib_lulus "cached"
        smallint total_sks_pilihan_lulus "cached"
        timestamptz cache_updated_at
    }

    PROFILE_DOSEN {
        bigint user_id PK_FK
        varchar nip UK
        text jadwal_perwalian
    }

    PERIODE {
        bigserial id PK
        varchar nama UK
        smallint tahun_mulai
        varchar jenis "ganjil/genap"
        date tanggal_mulai
        date tanggal_selesai
        boolean is_active
    }

    MASTER_MATKUL {
        bigserial id PK
        varchar kode_aktif UK
        text_array kode_alias
        varchar nama
        smallint sks
        smallint semester
        smallint kolom "React Flow positioning"
        varchar tipe "wajib/pilihan"
    }

    MASTER_MATKUL_EDGE {
        bigserial id PK
        bigint source_id FK
        bigint target_id FK
        varchar relation_type "4 enum"
    }

    KELAS {
        bigserial id PK
        bigint periode_id FK
        varchar kode_matkul "soft ref, NO FK"
        varchar nama_matkul
        smallint sks
        varchar nama_kelas
        varchar tipe
    }

    SESI_KELAS {
        bigserial id PK
        bigint kelas_id FK
        smallint nomor_sesi
        varchar hari
        time jam_mulai
        time jam_selesai
        varchar bentuk_pembelajaran
        varchar dosen_utama "string"
        varchar ruangan
    }

    RENCANA_STUDI {
        bigserial id PK
        bigint mahasiswa_id FK
        bigint periode_id FK
        varchar status
        text catatan_dosen
        bigint reviewed_by FK
        timestamptz submitted_at
        timestamptz reviewed_at
    }

    RENCANA_STUDI_ITEM {
        bigserial id PK
        bigint rencana_studi_id FK
        bigint kelas_id FK
    }

    RIWAYAT_NILAI {
        bigserial id PK
        bigint mahasiswa_id FK
        bigint periode_id FK
        varchar kode_matkul "soft ref, NO FK"
        varchar nama_matkul
        smallint sks
        varchar nilai_huruf
        decimal nilai_angka
        varchar status
        varchar sumber
    }
```

---

## 🗂️ Schema Lengkap per Tabel

### Domain 1 — User & Authentication

#### `users`

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nama VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('kaprodi', 'dosen_wali', 'mahasiswa')),
    
    -- Google OAuth
    google_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_google_id ON users(google_id);
```

#### `profile_mahasiswa`

```sql
CREATE TABLE profile_mahasiswa (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nim VARCHAR(20) NOT NULL UNIQUE,
    angkatan SMALLINT NOT NULL,
    dosen_wali_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    
    -- Denormalized cache (di-update saat DPS upload)
    ipk DECIMAL(4,2) DEFAULT 0,
    ips_terakhir DECIMAL(4,2),
    total_sks_lulus SMALLINT DEFAULT 0,
    total_sks_wajib_lulus SMALLINT DEFAULT 0,
    total_sks_pilihan_lulus SMALLINT DEFAULT 0,
    cache_updated_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mahasiswa_dosen_wali ON profile_mahasiswa(dosen_wali_id);
CREATE INDEX idx_mahasiswa_angkatan ON profile_mahasiswa(angkatan);
```

> Cache IPK/SKS di-recalculate setiap DPS upload via application logic.

#### `profile_dosen`

```sql
CREATE TABLE profile_dosen (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    nip VARCHAR(30) NOT NULL UNIQUE,
    jadwal_perwalian TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### Domain 2 — Periode

```sql
CREATE TABLE periode (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(50) NOT NULL UNIQUE,
    tahun_mulai SMALLINT NOT NULL,
    jenis VARCHAR(10) NOT NULL CHECK (jenis IN ('ganjil', 'genap')),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CHECK (tanggal_selesai >= tanggal_mulai)
);

-- Enforce: max 1 periode aktif
CREATE UNIQUE INDEX idx_periode_only_one_active 
ON periode((TRUE)) WHERE is_active = TRUE;
```

---

### Domain 3 — Master Matkul (Khusus Pohon Kurikulum)

> ⚠️ **PENTING**: Tabel ini **HANYA** untuk visualisasi pohon kurikulum.  
> Tabel `kelas` dan `riwayat_nilai` **TIDAK** punya FK ke sini — match via string `kode_matkul`.

#### `master_matkul`

```sql
CREATE TABLE master_matkul (
    id BIGSERIAL PRIMARY KEY,
    
    kode_aktif VARCHAR(20) NOT NULL UNIQUE,
    kode_alias TEXT[] DEFAULT '{}',
    
    nama VARCHAR(255) NOT NULL,
    sks SMALLINT NOT NULL,
    semester SMALLINT NOT NULL,
    kolom SMALLINT,
    tipe VARCHAR(10) CHECK (tipe IN ('wajib', 'pilihan')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matkul_kode_aktif ON master_matkul(kode_aktif);
CREATE INDEX idx_matkul_kode_alias ON master_matkul USING GIN(kode_alias);
CREATE INDEX idx_matkul_semester ON master_matkul(semester);
```

> **Lookup pattern**:
> ```sql
> SELECT * FROM master_matkul 
> WHERE kode_aktif = 'AIF231103' OR 'AIF231103' = ANY(kode_alias);
> ```

#### `master_matkul_edge`

```sql
CREATE TABLE master_matkul_edge (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT NOT NULL REFERENCES master_matkul(id) ON DELETE CASCADE,
    target_id BIGINT NOT NULL REFERENCES master_matkul(id) ON DELETE CASCADE,
    
    relation_type VARCHAR(50) NOT NULL CHECK (relation_type IN (
        'prasyarat_lulus',
        'prasyarat_tempuh',
        'prasyarat_tempuh_atau_tempuh_bersama',
        'prasyarat_lulus_atau_tempuh_bersama'
    )),
    
    UNIQUE (source_id, target_id, relation_type),
    CHECK (source_id != target_id)
);

CREATE INDEX idx_edge_source ON master_matkul_edge(source_id);
CREATE INDEX idx_edge_target ON master_matkul_edge(target_id);
```

> Mapping ke React Flow: setiap row = 1 edge. `source_id` = matkul prasyarat, `target_id` = matkul yang butuh prasyarat.

---

### Domain 4 — Jadwal Kelas (Dari Excel Upload)

> ⚠️ **PENTING**: Tabel ini **completely independent** dari `master_matkul`.  
> Hanya nyambung ke `rencana_studi_item`.

#### `kelas`

```sql
CREATE TABLE kelas (
    id BIGSERIAL PRIMARY KEY,
    periode_id BIGINT NOT NULL REFERENCES periode(id) ON DELETE RESTRICT,
    
    -- Dari Excel, denormalized (no FK ke master_matkul)
    kode_matkul VARCHAR(20) NOT NULL,
    nama_matkul VARCHAR(255) NOT NULL,
    sks SMALLINT NOT NULL,                       -- "sks" Excel kolom 4 (BUKAN "Beban sks")
    
    nama_kelas VARCHAR(5) NOT NULL,
    tipe VARCHAR(10),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (periode_id, kode_matkul, nama_kelas)
);

CREATE INDEX idx_kelas_periode_kode ON kelas(periode_id, kode_matkul);
CREATE INDEX idx_kelas_periode ON kelas(periode_id);
```

#### `sesi_kelas`

```sql
CREATE TABLE sesi_kelas (
    id BIGSERIAL PRIMARY KEY,
    kelas_id BIGINT NOT NULL REFERENCES kelas(id) ON DELETE CASCADE,
    
    nomor_sesi SMALLINT NOT NULL,
    hari VARCHAR(10) NOT NULL CHECK (hari IN ('senin','selasa','rabu','kamis','jumat','sabtu')),
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    bentuk_pembelajaran VARCHAR(30),
    dosen_utama VARCHAR(255),
    ruangan VARCHAR(50),
    
    UNIQUE (kelas_id, nomor_sesi, hari, jam_mulai),
    CHECK (jam_selesai > jam_mulai)
);

CREATE INDEX idx_sesi_kelas ON sesi_kelas(kelas_id);
```

---

### Domain 5 — Rencana Studi (FRS)

#### `rencana_studi`

```sql
CREATE TABLE rencana_studi (
    id BIGSERIAL PRIMARY KEY,
    mahasiswa_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    periode_id BIGINT NOT NULL REFERENCES periode(id) ON DELETE RESTRICT,
    
    status VARCHAR(15) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    catatan_dosen TEXT,
    reviewed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (mahasiswa_id, periode_id)
);

CREATE INDEX idx_rs_status ON rencana_studi(status);
CREATE INDEX idx_rs_mahasiswa ON rencana_studi(mahasiswa_id);
CREATE INDEX idx_rs_periode ON rencana_studi(periode_id);
```

#### `rencana_studi_item`

```sql
CREATE TABLE rencana_studi_item (
    id BIGSERIAL PRIMARY KEY,
    rencana_studi_id BIGINT NOT NULL REFERENCES rencana_studi(id) ON DELETE CASCADE,
    kelas_id BIGINT NOT NULL REFERENCES kelas(id) ON DELETE RESTRICT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (rencana_studi_id, kelas_id)
);

CREATE INDEX idx_rsi_rs ON rencana_studi_item(rencana_studi_id);
```

---

### Domain 6 — Riwayat Nilai

```sql
CREATE TABLE riwayat_nilai (
    id BIGSERIAL PRIMARY KEY,
    mahasiswa_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    periode_id BIGINT NOT NULL REFERENCES periode(id) ON DELETE RESTRICT,
    
    -- Snapshot data, no FK ke master_matkul
    kode_matkul VARCHAR(20) NOT NULL,
    nama_matkul VARCHAR(255) NOT NULL,
    sks SMALLINT NOT NULL,
    
    nilai_huruf VARCHAR(2) NOT NULL 
        CHECK (nilai_huruf IN ('A','A-','B+','B','B-','C+','C','D','E')),
    nilai_angka DECIMAL(5,2),
    status VARCHAR(15) NOT NULL CHECK (status IN ('LULUS', 'TIDAK_LULUS')),
    
    sumber VARCHAR(20) NOT NULL DEFAULT 'manual_input' 
        CHECK (sumber IN ('dps_upload', 'manual_input', 'seed')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE (mahasiswa_id, kode_matkul, periode_id)
);

CREATE INDEX idx_rn_mahasiswa ON riwayat_nilai(mahasiswa_id);
CREATE INDEX idx_rn_kode ON riwayat_nilai(kode_matkul);
```

> Mengulang matkul = insert row baru dengan `periode_id` berbeda.

---

## 🔗 Strategi Matching (Soft Reference)

### Pattern 1 — Render Pohon Kurikulum

```sql
-- Render pohon kurikulum mahasiswa X
SELECT 
    mm.id, mm.kode_aktif, mm.nama, mm.sks, mm.semester, mm.kolom,
    rn.nilai_huruf, rn.status
FROM master_matkul mm
LEFT JOIN riwayat_nilai rn ON (
    rn.mahasiswa_id = $1 AND (
        rn.kode_matkul = mm.kode_aktif OR 
        rn.kode_matkul = ANY(mm.kode_alias)
    )
);
```

### Pattern 2 — Tag "Mengulang" di FRS

```sql
SELECT 
    rsi.id,
    k.kode_matkul, k.nama_matkul, k.sks,
    EXISTS (
        SELECT 1 FROM riwayat_nilai rn
        WHERE rn.mahasiswa_id = $mahasiswa_id 
          AND rn.kode_matkul = k.kode_matkul
          AND rn.status = 'TIDAK_LULUS'
    ) AS is_mengulang
FROM rencana_studi_item rsi
JOIN kelas k ON k.id = rsi.kelas_id
WHERE rsi.rencana_studi_id = $rs_id;
```

### Pattern 3 — Total SKS di Checkout

```sql
SELECT COALESCE(SUM(k.sks), 0) AS total_sks
FROM rencana_studi_item rsi
JOIN kelas k ON k.id = rsi.kelas_id
WHERE rsi.rencana_studi_id = $rs_id;
```

### Pattern 4 — Hitung IPK (untuk update cache)

```sql
SELECT 
    SUM(rn.sks * 
        CASE rn.nilai_huruf 
            WHEN 'A' THEN 4.0 WHEN 'A-' THEN 3.7 
            WHEN 'B+' THEN 3.3 WHEN 'B' THEN 3.0 WHEN 'B-' THEN 2.7
            WHEN 'C+' THEN 2.3 WHEN 'C' THEN 2.0
            WHEN 'D' THEN 1.0 ELSE 0.0
        END
    ) / NULLIF(SUM(rn.sks), 0) AS ipk
FROM riwayat_nilai rn
WHERE rn.mahasiswa_id = $1;
```

### Pattern 5 — Dashboard Mahasiswa Bimbingan Dosen

```sql
SELECT 
    u.id, u.nama, pm.nim,
    COALESCE(rs.status, 'DRAFT') AS frs_status
FROM profile_mahasiswa pm
JOIN users u ON u.id = pm.user_id
LEFT JOIN periode p ON p.is_active = TRUE
LEFT JOIN rencana_studi rs ON rs.mahasiswa_id = pm.user_id AND rs.periode_id = p.id
WHERE pm.dosen_wali_id = $dosen_id;
```

---

## 🔁 Relationship Cardinality

| From → To | Cardinality | FK? | Catatan |
|---|---|---|---|
| User → Profile Mahasiswa | 1:1 | ✅ | Optional, hanya jika role=mahasiswa |
| User → Profile Dosen | 1:1 | ✅ | Optional, hanya jika role=dosen_wali |
| Dosen → Mahasiswa (wali) | 1:N | ✅ | via `profile_mahasiswa.dosen_wali_id` |
| Mahasiswa → Rencana Studi | 1:N | ✅ | 1 FRS per periode (UNIQUE) |
| Periode → Rencana Studi | 1:N | ✅ | |
| Rencana Studi → Item | 1:N | ✅ | Cascade delete |
| Kelas → Item | 1:N | ✅ | Restrict delete |
| Periode → Kelas | 1:N | ✅ | |
| Kelas → Sesi Kelas | 1:N | ✅ | Cascade delete |
| Master Matkul ↔ Edge | M:N | ✅ | Self-reference |
| **Master Matkul ↔ Kelas** | - | ❌ | **No FK**, soft match `kode_matkul` |
| **Master Matkul ↔ Riwayat Nilai** | - | ❌ | **No FK**, soft match `kode_matkul` |
| Mahasiswa → Riwayat Nilai | 1:N | ✅ | |

---

## ⚙️ Migration Order

```
1.  users
2.  profile_dosen          (depends users)
3.  profile_mahasiswa      (depends users + profile_dosen)
4.  periode
5.  master_matkul
6.  master_matkul_edge     (depends master_matkul)
7.  kelas                  (depends periode)
8.  sesi_kelas             (depends kelas)
9.  rencana_studi          (depends users + periode)
10. rencana_studi_item     (depends rencana_studi + kelas)
11. riwayat_nilai          (depends users + periode)
```

**Tooling rekomendasi**: `node-pg-migrate` atau `knex` untuk versioning.

---

## 🔄 Update Flow (DPS Upload)

```
1. Parse PDF → extract array { kode_matkul, nama_matkul, sks, nilai_huruf, status, periode }
2. Mahasiswa konfirmasi/edit data preview
3. Backend execute:
   a. DELETE riwayat_nilai WHERE mahasiswa_id = X AND periode_id = Y (replace mode)
   b. INSERT new rows
   c. RECALCULATE profile_mahasiswa cache:
      - ipk
      - ips_terakhir (dari periode terakhir)
      - total_sks_lulus
      - total_sks_wajib_lulus  
      - total_sks_pilihan_lulus
   d. UPDATE cache_updated_at = NOW()
4. Return success → frontend re-render pohon kurikulum
```

---

## ✅ Out of Scope

- ❌ Notifikasi
- ❌ Multi prodi
- ❌ Versioning kurikulum lengkap (hanya support 2 kode via alias)
- ❌ Hard validation (SKS max, prasyarat, bentrok jadwal)
- ❌ Audit log lengkap
- ❌ Real-time (WebSocket)
- ❌ Reset password (pakai SSO)

---

## 📌 TODO / Open Questions

1. **Domain whitelist OAuth** — placeholder, ganti dengan domain kampus aktual
2. **Format DPS spesifik** — parser dosen, ditunda
3. **Cache invalidation** — saat DPS upload + manual edit riwayat nilai

---

*Dokumen final — siap digunakan sebagai referensi development.*
