# Backend Integration Notes

Catatan ini untuk memindahkan parser Excel jadwal ke backend JavaScript.

## File yang Perlu Dipindah

Pindahkan:

```text
parse-jadwal.js
```

Ke backend, misalnya:

```text
backend/src/services/jadwalExcelParser.js
```

File ini sudah bisa dipakai sebagai module:

```js
const { parseJadwal } = require("./services/jadwalExcelParser");
```

## Dependency yang Perlu Diinstall

Di folder backend:

```bash
npm install exceljs
```

Kalau backend menerima upload file dari React, install juga salah satu middleware upload. Untuk Express:

```bash
npm install multer
```

## Cara Pakai di Backend

Contoh pemakaian service:

```js
const { parseJadwal } = require("../services/jadwalExcelParser");

const result = await parseJadwal({
  input: uploadedFilePath,
  output: "jadwal.json",
  sheet: "Template",
  periodeId: 1,
});

console.log(result.kelas);
```

Untuk backend sungguhan, `output` boleh diarahkan ke file sementara, atau parser bisa dimodifikasi agar tidak menulis JSON dan langsung return `result`.

## Flow yang Disarankan

```text
React upload Excel
Backend simpan file sementara
Backend parse Excel pakai parseJadwal()
Backend validasi warnings
Backend tampilkan preview ke React atau insert ke DB
Backend hapus file sementara
```

## Mapping ke DB

Data utama ada di:

```js
result.kelas
```

Mapping tabel `kelas`:

```text
periode_id   <- kelas.periode_id
kode_matkul  <- kelas.kode_matkul
nama_matkul  <- kelas.nama_matkul
sks          <- kelas.sks
nama_kelas   <- kelas.nama_kelas
tipe         <- kelas.tipe
```

Mapping tabel `sesi_kelas`:

```text
kelas_id              <- id dari insert/find kelas
nomor_sesi            <- sesi.nomor_sesi
hari                  <- sesi.hari
jam_mulai             <- sesi.jam_mulai
jam_selesai           <- sesi.jam_selesai
bentuk_pembelajaran   <- sesi.bentuk_pembelajaran
dosen_utama           <- sesi.dosen_utama
ruangan               <- sesi.ruangan
```

## Hal yang Harus Diperhatikan

`periodeId` tidak berasal langsung dari Excel. Backend harus menerima `periodeId` dari request atau mencari ID periode berdasarkan `TA` dan `Semester`.

Beberapa sesi bisa punya lebih dari satu dosen. Karena tabel `sesi_kelas` hanya punya `dosen_utama`, parser memilih satu dosen utama dan menyimpan semua dosen di field tambahan:

```js
sesi.dosen
```

Kalau semua dosen harus masuk DB, buat tabel relasi tambahan seperti `sesi_kelas_dosen`.

## Prompt untuk AI Lain

```text
Tolong integrasikan parser Excel jadwal ke backend JavaScript.

File parser ada di parse-jadwal.js dan sudah export function parseJadwal().
Install dependency: exceljs.
Kalau backend Express menerima upload Excel dari React, install multer.

Target:
1. Pindahkan parse-jadwal.js ke backend/src/services/jadwalExcelParser.js.
2. Buat endpoint upload Excel, misalnya POST /jadwal/import-preview.
3. Endpoint menerima file Excel dan periodeId.
4. Panggil parseJadwal({ input: file.path, sheet: "Template", periodeId }).
5. Return result ke frontend untuk preview.
6. Jangan insert DB dulu kecuali diminta.
7. Perhatikan warnings, terutama multiple_dosen_in_session.
8. Nanti insert DB pakai result.kelas untuk tabel kelas dan setiap kelas.sesi untuk tabel sesi_kelas.
```
