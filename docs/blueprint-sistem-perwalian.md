# Sistem Informasi Perwalian — Blueprint

> Dokumen ringkasan keputusan brainstorming. Jadikan single source of truth selama development.

## 📋 Overview

**Project**: Tugas Akhir / Skripsi — Sistem Informasi Perwalian Mahasiswa  
**Scope**: Single program studi  
**Filosofi**: Sistem minimal, trust dosen wali untuk verifikasi manual  

### Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React (Vite) + Material UI |
| Backend | Node.js (HTTP native, bisa migrate ke Express) |
| Database | PostgreSQL |
| Komunikasi | REST API |

---

## 👥 Aktor & Role

| Role | Cara akun dibuat | Jumlah |
|---|---|---|
| **Kaprodi** | Seed via SQL (super admin) | 1 |
| **Dosen Wali** | CRUD by Kaprodi | Many |
| **Mahasiswa** | CRUD by Kaprodi | Many |

**Login flow**: 1 halaman login untuk semua role. Backend deteksi role → auto-redirect ke dashboard sesuai role.

---

## 🔄 State Machine FRS

### States (4 state)
- `DRAFT` — Mahasiswa belum submit
- `SUBMITTED` — Menunggu persetujuan dosen
- `APPROVED` — Disetujui dosen
- `REJECTED` — Perlu revisi (dengan catatan dari dosen)

### Transitions
```
DRAFT ──[mahasiswa submit]──→ SUBMITTED
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                                ▼
               APPROVED                       REJECTED
                  │                                │
                  │ [mahasiswa edit]               │ [mahasiswa revisi]
                  ▼                                ▼
              SUBMITTED                          DRAFT
                                                   │
                                          [submit lagi]
                                                   │
                                                   ▼
                                              SUBMITTED
```

### Behavior Rules
- **Granularity**: Per FRS (whole package), bukan per matkul
- **Catatan dosen**: Opsional, bisa dikasih bareng Setuju atau Revisi
- **Edit dari APPROVED**: Langsung bisa edit, status auto change ke SUBMITTED (tanpa modal konfirmasi)
- **Edit dari REJECTED**: Otomatis jadi DRAFT pas mahasiswa edit, terus submit lagi

---

## 🎨 Visualization (Color Mapping)

### Status FRS — 3 warna per role

| State (Backend) | Warna Mahasiswa | Warna Dosen |
|---|---|---|
| `DRAFT` | ⚪ Putih | 🔴 Merah |
| `SUBMITTED` | ⚪ Putih | 🟡 Kuning |
| `APPROVED` | 🟢 Hijau | 🟢 Hijau |
| `REJECTED` | 🟡 Kuning | 🟡 Kuning |

**Catatan**: Mahasiswa lihat status detail via banner/text (bukan cuma warna).

---

## 📅 Periode Perwalian

### Dikelola Kaprodi
- Set tanggal mulai - selesai
- Aktivasi periode (toggle on/off)
- Upload Excel jadwal kelas (gabung dalam 1 flow)
- Upload Excel catalog mata kuliah (gabung dalam 1 flow)

### Behavior pas periode AKTIF
- Mahasiswa bisa: isi/edit/submit FRS
- Dosen bisa: approve/revisi FRS

### Behavior pas periode TIDAK AKTIF
- **Full read-only** untuk semua aktor
- Mahasiswa & Dosen tetap bisa lihat history (read-only)
- FRS yang masih `SUBMITTED` pas periode tutup → **dibiarkan ngegantung** (no special handling)

---

## 📦 Data Master & Upload Strategy

| Entity | Handling | Format |
|---|---|---|
| **Periode** | CRUD by Kaprodi | Form |
| **Mata Kuliah catalog** | Upload by Kaprodi | Excel |
| **Kelas + Jadwal** | Upload by Kaprodi | Excel |
| **Riwayat Nilai (DPS)** | Upload by Mahasiswa | PDF + Auto-extract (parser dosen, ditunda) + manual edit fallback |
| **User (Dosen Wali, Mahasiswa)** | CRUD by Kaprodi | Form |

### Upload Strategy (semua upload)
- **Replace mode dengan konfirmasi** ("Periode ini sudah ada X data. Replace semua?")
- **Template download** disediakan untuk Excel
- **Validation step**: tampilin preview data yg diparsing → user konfirmasi → simpan
- **Manual edit row** sebagai fallback kalau parser salah baca

### Format Excel — Jadwal Kelas (Kaprodi)
| kode_matkul | nama_matkul | sks | kelas | hari | jam_mulai | jam_selesai | ruang | dosen_pengampu |
|---|---|---|---|---|---|---|---|---|
| IF301 | Pemrograman Web | 3 | A | Senin | 14:00 | 16:00 | R201 | Dr. Budi |

> **Note**: 1 kelas dengan multiple slot waktu = multiple baris

### Format Excel — Catalog Mata Kuliah (Kaprodi)
| kode_matkul | nama_matkul | sks | semester_wajib | tipe (wajib/pilihan) | prasyarat |
|---|---|---|---|---|---|
| IF101 | Algoritma Dasar | 3 | 1 | wajib | - |

### Format DPS Mahasiswa (PDF)
- Format spesifik kampus user (parser akan disesuaikan)
- Parser baseline ada dari dosen, butuh modifikasi
- **Phase implementasi**: parser ditunda; sistem awal pakai data seed/manual input

---

## 🛡️ Validasi (Filosofi: Minimal, Trust Dosen)

### Yang TIDAK divalidasi sistem
- ❌ Total SKS maksimum (misal 24 SKS)
- ❌ Prasyarat matkul
- ❌ Bentrok jadwal
- ❌ IPK threshold

### Tapi sistem WAJIB nampilin info pendukung
Halaman detail FRS dari sisi dosen wali harus rich information:
- ✅ Total SKS yang diambil
- ✅ IPK + IPS terakhir
- ✅ Histori matkul (yg sudah/belum lulus)
- ✅ Jadwal mingguan dari kelas yg dipilih (visual)
- ✅ Tag visual: "🔄 Mengulang", "📚 Wajib", "⭐ Pilihan"

> **Alasan filosofis**: Sistem gak validasi, tapi dosen wali punya semua konteks untuk decide manual.

---

## 🖥️ Pages & Screens

### Mahasiswa
| Page | Konten | Action |
|---|---|---|
| Login | Form login | Submit |
| Dashboard | Info akademik (SKS, IPK, IPS), total SKS lulus, periode aktif, jadwal dosen wali | - |
| Pohon Kurikulum | Tab 1: visualisasi pohon kurikulum per semester; Tab 2: Upload DPS (PDF + preview + confirm) | Upload, Confirm |
| Perwalian Saya | List per semester (tab) + form FRS baru | Edit, Submit |
| Pilih Matkul (checkout) | Pilih matkul + kelas | Add to FRS |

### Dosen Wali
| Page | Konten | Action |
|---|---|---|
| Login | Form login | Submit |
| Dashboard | List mahasiswa bimbingan + status (3 warna) | Filter, Search |
| Detail Mahasiswa | Tab Report + Progress + Perwalian (mirip view mahasiswa) | Approve, Revisi, Catatan |
| Jadwal Perwalian | Set jadwal perwalian pribadi (display only, non-booking) | Edit |

### Kaprodi
| Page | Konten | Action |
|---|---|---|
| Login | Form login | Submit |
| Dashboard | Overview ringkasan: jumlah dosen aktif, total mahasiswa, status periode | - |
| Periode | CRUD periode (set tanggal, aktifkan/nonaktifkan) + upload Excel jadwal kelas + upload Excel master matkul | CRUD, Upload |
| List Dosen Wali | List semua dosen wali | Tambah, Edit, Hapus |
| Detail Dosen Wali | List mahasiswa bimbingan + status | Reassign mahasiswa |
| List Mahasiswa | List semua mahasiswa | Tambah, Edit, Hapus |

---

## 📝 Decisions Log

| Decision | Pilihan | Catatan |
|---|---|---|
| Granularity approval | Per FRS | Bukan per matkul |
| State machine | 4 state | DRAFT, SUBMITTED, APPROVED, REJECTED |
| Edit dari APPROVED | Bisa, status auto-change | Tanpa modal konfirmasi |
| Periode tutup | Full read-only | FRS pending = ngegantung |
| Validasi otomatis | Tidak ada | Trust dosen wali |
| User management | Mode 2 (CRUD by Kaprodi) | Bukan self-register |
| Single/multi prodi | Single | 1 prodi proof of concept |
| Catalog matkul | Upload Excel | Konsisten dengan upload-pattern |
| Jadwal kelas | Upload Excel | Bareng flow periode Kaprodi |
| DPS mahasiswa | PDF + auto-extract | Parser dosen (ditunda implementasinya) |
| Upload mode | Replace + konfirmasi | - |
| Validation flow | Preview + manual edit row | Wajib |
| Login | 1 halaman, multi role | Backend deteksi role |

---

## ❓ Open Questions (belum diputuskan)

1. **Halaman jadwal mingguan mahasiswa** — accordion atau visual mingguan? (Low-fi belum ada)
2. **Cold start scenarios** — empty state untuk:
   - Mahasiswa belum ada dosen wali
   - Belum ada periode aktif
   - Dosen wali belum ada bimbingan
3. **Jadwal perwalian dosen** — cuma display info atau ada booking system? (Saran: display only)
4. **Detail format DPS** — perlu sample PDF dari kampus untuk parser planning
5. **Notifikasi** — perlu notifikasi in-app antar aktor? (misal mahasiswa submit → dosen dapet info)

---

## 🚀 Next Steps

1. ✅ **Konsolidasi** — done (dokumen ini)
2. 🔜 **ERD / Data Model** — bikin diagram entity-relationship database
3. 🔜 **Struktur API** — endpoint design (REST)
4. 🔜 **Implementasi**:
   - Phase 1: Foundation (auth, CRUD basic, seed data)
   - Phase 2: Core FRS flow (mahasiswa submit, dosen approve)
   - Phase 3: Upload features (Excel jadwal/catalog)
   - Phase 4: Progress studi & pohon kurikulum
   - Phase 5: Parser PDF DPS (integrasi dengan parser dosen)
   - Phase 6: Polish, empty states, edge cases

---

*Dokumen hidup — update jika ada keputusan baru*
