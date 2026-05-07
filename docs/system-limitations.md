# Batasan & Keputusan Teknis Sistem

> Dokumen ini mencatat batasan-batasan sistem yang disengaja atau muncul
> sebagai konsekuensi dari keputusan desain. Berguna sebagai referensi saat
> menulis bab "Analisis Kekurangan Sistem" di skripsi.

---

## 1. Range Nilai Huruf di `riwayat_nilai`

### Konteks

Tabel `riwayat_nilai` punya CHECK constraint pada kolom `nilai_huruf`:

```sql
CHECK (nilai_huruf IN ('A','A-','B+','B','B-','C+','C','C-','D','E','P','F'))
```

### Versi awal (M8) vs versi sekarang (M10 hotfix)

| Versi | Allowed grade | Catatan |
|---|---|---|
| M8 awal | A, A-, B+, B, B-, C+, C, D, E | Mengikuti tabel nilai resmi UNPAR FOI Informatika |
| M10 (saat ini) | + C-, P, F | Diperluas defensive supaya parser DPS dari sumber lain tidak ditolak |

### Kenapa diperluas

Tabel nilai resmi UNPAR FOI Informatika **tidak punya** C-, P, F:
- A (80-100), A- (77-79), B+ (73-76), B (67-72), C+ (63-66), C (60-62), D (50-59), E (0-49)

Tapi parser DPS (di `backend/src/services/dpsPdfParser.js`) sudah dipersiapkan untuk handle:
- **C-**: tidak dipakai prodi Informatika, tapi mungkin dipakai prodi lain di UNPAR
- **P** ("Pass"): grade lulus tanpa nilai angka — biasa untuk MK seminar/PKM
- **F** ("Fail"): grade gagal — kompatibilitas legacy / luar prodi

Kalau ada DPS mahasiswa transfer atau ambil MK lintas prodi yang punya grade ini,
upload DPS akan gagal kalau CHECK constraint dipertahankan ketat.

### Konsekuensi

- Status `LULUS / TIDAK_LULUS` ditentukan via fungsi `statusFromHuruf` di
  `riwayat-nilai.service.js`. Mapping: E dan F → TIDAK_LULUS, sisanya → LULUS.
- IPK calculation tetap dari `nilai_angka` (kalau ada), bukan dari huruf.
  Grade P (tidak ada `nilai_angka`) tidak ikut dihitung di IPK.

### Kaitan dengan skripsi

Ini bisa ditulis sebagai contoh **trade-off antara strict validation vs fleksibilitas
data dari sistem eksternal**. Backend pilih relaxation supaya tetap menerima data
dari kasus minoritas (transfer kredit, MK lintas prodi).

---

## 2. Periode Dummy "Riwayat DPS"

### Konteks

Tabel `riwayat_nilai` punya foreign key wajib (`NOT NULL`) ke tabel `periode`:

```sql
periode_id: { type: 'bigint', notNull: true, references: 'periode(id)' }
```

Tujuan desain awal: setiap baris nilai bisa di-track di **semester mana** mahasiswa
mendapatkannya, sehingga sistem bisa menghitung IPS per semester langsung dari
`riwayat_nilai`.

### Realita

Parser DPS PDF tidak konsisten kasih informasi semester per baris matkul.
Parser hanya bisa parse:
- Daftar matkul + nilai akhir (final grade saja, snapshot kumulatif)
- Total IPK dan IPS dari halaman ringkasan akademik

Jadi backend tidak punya cara reliable mapping setiap row hasil DPS ke periode
aktual yang ada di tabel `periode`.

### Workaround: 1 periode dummy

Solusi yang dipakai (M8): bikin **1 row periode dummy** dengan:
- `nama = 'Riwayat DPS'`
- `is_active = false`
- `tanggal_mulai = 2000-01-01`, `tanggal_selesai = 2000-12-31`

Semua row hasil upload DPS PDF disimpan dengan `periode_id` = id periode dummy ini,
terlepas dari semester aslinya.

### Konsekuensi

- Kolom `periode_id` di `riwayat_nilai` **tidak terpakai** untuk hitungan IPS per
  semester. Data IPS resmi diambil langsung dari snapshot parser
  (`academic.ips.nilai`) saat upload DPS, bukan recalculated dari `riwayat_nilai`.
- IPS per semester historis (semester 1, 2, 3, dst.) **tidak tersedia** di sistem.
  Hanya IPS terakhir yang ada di kolom cache `profile_mahasiswa.ips_terakhir`.
- Pohon kurikulum match by `kode_matkul`, jadi kolom `periode_id` di-bypass.

### Defensive measure (M10)

- Periode dummy di-**hide dari UI kaprodi** (`GET /periode` filter
  `WHERE nama != 'Riwayat DPS'`) supaya tidak terpencet hapus.
- Backend `getPeriodeDummyId` di `riwayat-nilai.service.js` **auto-create** kalau
  periode dummy tidak ada (defensive against accidental DB direct deletion).

### Cara perbaiki ke depan (di luar scope skripsi)

Ada beberapa opsi kalau mau dirapikan:

1. **Drop FK ke periode**: ubah `riwayat_nilai.periode_id` jadi nullable, atau hapus
   kolomnya samasekali. Tabel cukup unique by `(mahasiswa_id, kode_matkul)`.
   - Pro: schema lebih bersih, tidak butuh dummy.
   - Kontra: migration breaking, perlu update semua endpoint yang baca periode.
2. **Ganti parser yang track per-semester**: reverse-engineer format DPS lebih dalam,
   atau pindah ke source data lain (mis. ekspor langsung dari SI kampus).
   - Pro: data semester historis akurat, IPS per semester bisa dihitung dari lokal.
   - Kontra: scope besar, butuh akses ke source data yang mungkin tidak ada.
3. **Tetap dummy tapi rename**: rename ke `__internal_riwayat_dps__` atau pakai
   flag `is_system` boolean column. Tidak nyentuh logika bisnis tapi lebih
   self-explanatory.

### Kaitan dengan skripsi

Ini bisa ditulis sebagai **batasan integrasi data eksternal**. Sistem dirancang
untuk fleksibel terhadap data DPS yang tidak ideal: trade-off antara akurasi
historis (IPS per semester) vs kemudahan bagi mahasiswa untuk upload DPS PDF
yang sudah ada (tidak perlu input manual per semester).

---

## Riwayat update dokumen ini

- **2026-05-08** (M10): file dibuat. Mendokumentasikan 2 batasan utama: range
  nilai huruf di `riwayat_nilai` dan periode dummy "Riwayat DPS".
