# Excel Jadwal Parser

Parser Node.js untuk membaca file Excel jadwal dan menghasilkan JSON yang siap dipetakan ke tabel `kelas` dan `sesi_kelas`.

## Install

Karena PowerShell di Windows kadang menolak `npm.ps1`, pakai:

```bash
cmd /c npm install
```

## Jalankan

```bash
cmd /c npm run parse:sample
```

Atau manual:

```bash
node parse-jadwal.js --input "Template_Jadwal Ganjil 2025-2026-Prodi Informatika.xlsx" --output jadwal.json --periode-id 1
```

## Output

Output utama ada di `jadwal.json`.

Strukturnya:

```json
{
  "metadata": {},
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
          "dosen_utama": "Nama Dosen",
          "ruangan": null,
          "dosen": []
        }
      ]
    }
  ],
  "warnings": []
}
```

Kolom `dosen` disimpan sebagai tambahan supaya data dosen lain tidak hilang saat satu sesi punya lebih dari satu dosen. Untuk insert ke tabel `sesi_kelas`, pakai `dosen_utama`.
