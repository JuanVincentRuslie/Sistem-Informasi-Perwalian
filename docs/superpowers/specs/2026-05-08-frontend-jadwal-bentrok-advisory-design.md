# Frontend Advisory: Cek Jadwal Bentrok Saat Checkout

> Spec design — M10 task "Frontend advisory check untuk bentrok jadwal saat mahasiswa pilih kelas"

## Konteks

Permintaan dosen pembimbing skripsi: saat mahasiswa pencet **Checkout** di halaman Tambah Matkul, frontend cek apakah kelas yang dipilih (plus kelas yang sudah di FRS) ada bentrok hari + jam. Kalau ada, blokir checkout, tampilkan warning, biarkan user perbaiki pilihan.

## Scope

- **Cek**: kelas yang baru dipilih di session ini + kelas yang sudah ada di FRS mahasiswa.
- **Kapan**: hanya saat klik tombol Checkout (tidak realtime per pilih).
- **Lokasi check**: pure frontend, zero backend changes.
- **Tidak masuk scope**: edit mode penuh (toggle off existing items dari halaman ini), real-time visual cue, advisory di JadwalPage.

## Algoritma

```js
function findJadwalBentrok(kelasArr) {
  const bentrok = [];
  for (let i = 0; i < kelasArr.length; i++) {
    for (let j = i + 1; j < kelasArr.length; j++) {
      for (const sa of kelasArr[i].sesi ?? []) {
        for (const sb of kelasArr[j].sesi ?? []) {
          if (sa.hari === sb.hari
              && sa.jam_mulai < sb.jam_selesai
              && sb.jam_mulai < sa.jam_selesai) {
            bentrok.push({ a: kelasArr[i], sesiA: sa, b: kelasArr[j], sesiB: sb });
          }
        }
      }
    }
  }
  return bentrok;
}
```

`jam_*` aman dibandingkan sebagai string karena backend serialize via `TO_CHAR(jam_*, 'HH24:MI')` → format `"HH:MM"` zero-padded.

## Data Flow

1. PerwalianPage navigate ke TambahMatkulPage dengan `state: { frsId, periodeId, periodeNama, frs }` — `frs` ditambah (sebelumnya tidak di-pass).
2. TambahMatkulPage build `existing = frs.items.map(i => i.kelas)` saat handleCheckout.
3. Build `selected = ` kelas dari `selectedKelas` Map yang di-resolve ke object lengkap dari `kelasList`.
4. `combined = [...existing, ...selected]` lalu dedup by `kelas_id` (cegah false positive kalau user pilih kelas yang sudah di FRS).
5. `bentrok = findJadwalBentrok(combined)`.
6. Kalau `bentrok.length > 0` → buka `JadwalBentrokDialog`, tidak panggil API, tidak navigate.
7. Kalau kosong → existing behavior (loop addItem → navigate refreshed).

**Fallback**: kalau `state.frs` undefined (F5, direct URL), skip step 2, hanya cek antar pilihan baru. Tidak fatal, hanya kurang lengkap.

## UI

`JadwalBentrokDialog`:
- Title: "Jadwal Bentrok"
- Body: list bullet per item bentrok, format:
  ```
  • [Nama Matkul A] (Kelas X) — Senin 13:00–15:00
    ↔ [Nama Matkul B] (Kelas Y) — Senin 14:00–16:00
  ```
- 1 tombol: **Kembali** → tutup dialog, user balik ke layar pilih (tidak navigate keluar).

## File yang berubah

| File | Perubahan |
|---|---|
| `frontend/src/features/mahasiswa/perwalian/PerwalianPage.jsx` | `handleTambah`: tambah `frs` di router state |
| `frontend/src/features/mahasiswa/perwalian/TambahMatkulPage.jsx` | Tambah `findJadwalBentrok` helper, state `bentrokList`, modify `handleCheckout` |
| `frontend/src/features/mahasiswa/perwalian/components/JadwalBentrokDialog.jsx` (NEW) | Dialog component |

## Risiko

- **State hilang pada F5/direct URL**: degradasi tenang ke pure-new check (mitigasi: fallback). Tidak crash.
- **Sesi format inkonsisten** di backend: backend `TO_CHAR` sudah jamin format. Tidak ada risiko sebenarnya.
- **Kelas tanpa sesi**: loop dengan `?? []` tidak crash, just skip.

## Tidak ada test otomatis

Pure frontend logic + UI. Manual repro via browser cukup untuk skripsi-level verification.
