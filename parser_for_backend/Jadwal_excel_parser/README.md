# Excel Jadwal Parser

Parser Node.js untuk membaca file Excel jadwal kelas + jadwal ujian, menghasilkan JSON yang siap dipetakan ke tabel `kelas`, `sesi_kelas`, dan `jadwal_ujian`.

CLI ini adalah thin wrapper di atas `backend/src/services/jadwalExcelParser.js` (single source of truth).

## Format file Excel

Template TA (custom) — **3 sheet wajib**:

1. **`Jadwal Kelas`** — kolom: `Kode Mata Kuliah`, `sks`, `Nama Mata Kuliah`, `Kelas`, `Sesi Kelas`, `Hari`, `Jam Mulai`, `Jam Selesai`, `Bentuk Pembelajaran`, `Dosen Koordinator`, opsional `Ruangan (khusus untuk Praktikum)`. 1 sesi = 1 dosen.
2. **`Jadwal UTS`** — kolom: `Kode Mata Kuliah`, `Nama Mata Kuliah`, `Tanggal`, `Jam Mulai`, `Jam Selesai`, opsional `shift` (default 1).
3. **`Jadwal UAS`** — sama dengan UTS.

Format cell:
- Tanggal: tipe Date Excel native, display `yyyy-mm-dd`.
- Jam: tipe Time Excel native, display `hh:mm` (24-jam).

## Install

```bash
cmd /c npm install
```

## Jalankan

```bash
node parse-jadwal.js --input Template_jadwal_kelas.xlsx --output jadwal.json --periode-id 1
```

## Output

```json
{
  "metadata": {
    "source_file": "...",
    "periode_id": 1,
    "parsed_rows": 108,
    "ignored_rows": 0,
    "skipped_rows": 0,
    "total_kelas": 69,
    "total_sesi": 105,
    "total_ujian": 78
  },
  "kelas": [
    {
      "periode_id": 1,
      "kode_matkul": "AIF231101",
      "nama_matkul": "Matematika Dasar",
      "sks": 4,
      "nama_kelas": "A",
      "tipe": null,
      "sesi": [
        {
          "nomor_sesi": 1,
          "hari": "selasa",
          "jam_mulai": "13:00",
          "jam_selesai": "15:00",
          "bentuk_pembelajaran": "Kuliah",
          "dosen_utama": "Luciana Abednego S.Kom., M.T.",
          "ruangan": null
        }
      ]
    }
  ],
  "ujian": [
    {
      "kode_matkul": "AIF232105",
      "jenis": "UTS",
      "shift": 1,
      "tanggal": "2025-10-20",
      "jam_mulai": "08:00",
      "jam_selesai": "10:00"
    }
  ],
  "warnings": [
    { "sheet": "Jadwal UTS", "row": 41, "type": "orphan_ujian", "kode_matkul": "AIF232111", "message": "..." }
  ]
}
```

## Tipe warning

- `skipped_row` — baris dilewati karena ada field wajib kosong/tidak valid.
- `missing_jadwal_kelas` — kode_matkul di sheet UTS/UAS tidak ditemukan di sheet Jadwal Kelas; baris ujian dilewati.
- `duplicate_ujian` — kode_matkul+shift duplikat dalam sheet ujian yang sama; baris kedua dst dilewati.
- `sheet_missing` — sheet UTS atau UAS tidak ada di workbook; tetap parse sheet yang ada.
