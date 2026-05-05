const { query, withTransaction } = require('../../db/pool');
const { parseDpsBuffer } = require('../../services/dpsPdfParser');
const akademikService = require('../akademik/akademik.service');
const staging = require('./upload-staging');

const PERIODE_DUMMY_NAMA = 'Riwayat DPS';

/* ============================================================
 * Internal helpers
 * ============================================================ */

// Cari id periode dummy "Riwayat DPS" (di-seed via seed:periode-dummy)
async function getPeriodeDummyId() {
  const res = await query('SELECT id FROM periode WHERE nama = $1', [PERIODE_DUMMY_NAMA]);
  if (!res.rows[0]) {
    const err = new Error(
      `Periode dummy "${PERIODE_DUMMY_NAMA}" tidak ditemukan. Jalankan: npm run seed:periode-dummy`,
    );
    err.statusCode = 500;
    throw err;
  }
  return res.rows[0].id;
}

// Lookup sks per kode_matkul dari master_matkul (cek kode_aktif & kode_alias)
async function lookupSksMap(kodeList) {
  if (kodeList.length === 0) return new Map();
  const upper = kodeList.map((k) => k.toUpperCase());
  const res = await query(
    `SELECT kode_aktif, kode_alias, sks FROM master_matkul
     WHERE UPPER(kode_aktif) = ANY($1::text[])
        OR EXISTS (
             SELECT 1 FROM unnest(kode_alias) AS al
             WHERE UPPER(al) = ANY($1::text[])
           )`,
    [upper],
  );

  const map = new Map();
  for (const row of res.rows) {
    map.set(row.kode_aktif.toUpperCase(), row.sks);
    for (const alias of row.kode_alias ?? []) {
      map.set(alias.toUpperCase(), row.sks);
    }
  }
  return map;
}

function statusFromHuruf(huruf) {
  return huruf === 'E' ? 'TIDAK_LULUS' : 'LULUS';
}

async function isMahasiswaBimbinganDosen(dosenId, mahasiswaId) {
  const res = await query(
    'SELECT user_id FROM profile_mahasiswa WHERE user_id = $1 AND dosen_wali_id = $2',
    [mahasiswaId, dosenId],
  );
  return res.rows.length > 0;
}

/* ============================================================
 * Read endpoints
 * ============================================================ */

async function listSaya({ mahasiswaId, periodeId }) {
  const params = [mahasiswaId];
  let whereExtra = '';
  if (periodeId) {
    params.push(periodeId);
    whereExtra = `AND rn.periode_id = $${params.length}`;
  }

  const res = await query(
    `SELECT rn.id, rn.kode_matkul, rn.nama_matkul, rn.sks,
            rn.nilai_huruf, rn.nilai_angka, rn.status, rn.sumber,
            p.id AS periode_id, p.nama AS periode_nama
     FROM riwayat_nilai rn
     JOIN periode p ON p.id = rn.periode_id
     WHERE rn.mahasiswa_id = $1 ${whereExtra}
     ORDER BY rn.kode_matkul`,
    params,
  );

  return res.rows.map((r) => ({
    id: r.id,
    kode_matkul: r.kode_matkul,
    nama_matkul: r.nama_matkul,
    sks: r.sks,
    periode: { id: r.periode_id, nama: r.periode_nama },
    nilai_huruf: r.nilai_huruf,
    nilai_angka: r.nilai_angka == null ? null : Number(r.nilai_angka),
    status: r.status,
    sumber: r.sumber,
  }));
}

async function listMahasiswaForCaller({ callerRole, callerId, mahasiswaId, periodeId }) {
  if (callerRole === 'dosen_wali') {
    if (!(await isMahasiswaBimbinganDosen(callerId, mahasiswaId))) {
      const err = new Error('Anda bukan dosen wali mahasiswa ini');
      err.statusCode = 403;
      throw err;
    }
  }
  // kaprodi: boleh semua
  return listSaya({ mahasiswaId, periodeId });
}

/* ============================================================
 * Upload DPS — preview
 * ============================================================ */

async function uploadDpsPreview({ mahasiswaId, buffer }) {
  let parsed;
  try {
    parsed = await parseDpsBuffer(buffer);
  } catch (parseErr) {
    const err = new Error(`Gagal parse PDF DPS: ${parseErr.message}`);
    err.statusCode = 422;
    throw err;
  }

  // Build preview items dari transcript (sudah dedup nilai terbaik per kode)
  const transcript = parsed.transcript ?? [];
  const kodeList = transcript.map((t) => t.kode);
  const sksMap = await lookupSksMap(kodeList);

  const preview = transcript.map((t) => {
    const sks = sksMap.get(t.kode.toUpperCase()) ?? 0;
    return {
      kode_matkul: t.kode,
      nama_matkul: t.nama,
      sks,
      nilai_huruf: t.nilai,
      status: statusFromHuruf(t.nilai),
      // Warning kalau sks tidak ketemu — frontend bisa highlight
      sks_from_master: sks > 0,
      valid: !!t.kode && !!t.nilai,
    };
  });

  const summary = {
    total_rows: parsed.stats?.totalCourses ?? 0,
    valid_rows: preview.filter((p) => p.valid).length,
    invalid_rows: preview.filter((p) => !p.valid).length,
    sks_missing_count: preview.filter((p) => !p.sks_from_master).length,
    ipk_terhitung: parsed.academic?.ipk?.nilai ?? null, // dari parser, bukan compute lokal
  };

  // Periode terdeteksi: periode IPK yang dilaporkan parser
  const periodeTerdeteksi = parsed.academic?.ipk?.periode
    ? { kode: parsed.academic.ipk.periode }
    : null;

  const upload_token = staging.put({
    mahasiswaId,
    parsed,
  });

  return {
    profile: parsed.profile,
    academic: parsed.academic,
    periode_terdeteksi: periodeTerdeteksi,
    preview,
    summary,
    unparsed_lines: parsed.unparsedCourseLines ?? [],
    upload_token,
  };
}

/* ============================================================
 * Upload DPS — confirm (full replace + apply academic snapshot)
 * ============================================================ */

async function uploadDpsConfirm({ mahasiswaId, upload_token, mode, items }) {
  const staged = staging.get(upload_token);
  if (!staged) {
    const err = new Error('upload_token tidak ditemukan atau sudah expired. Silakan upload ulang.');
    err.statusCode = 410;
    throw err;
  }

  // Defensive: token harus milik mahasiswa yang sama
  if (String(staged.mahasiswaId) !== String(mahasiswaId)) {
    const err = new Error('Token upload bukan milik Anda');
    err.statusCode = 403;
    throw err;
  }

  if (mode !== 'replace') {
    const err = new Error("Mode harus 'replace'");
    err.statusCode = 400;
    throw err;
  }

  // Items dari body adalah final data (mahasiswa boleh edit di preview).
  // Kalau body tidak kasih items → fallback ke preview hasil parse.
  let finalItems = Array.isArray(items) && items.length > 0
    ? items
    : null;

  if (!finalItems) {
    // Build dari parsed transcript
    const transcript = staged.parsed.transcript ?? [];
    finalItems = transcript.map((t) => ({
      kode_matkul: t.kode,
      nama_matkul: t.nama,
      nilai_huruf: t.nilai,
      status: statusFromHuruf(t.nilai),
    }));
  }

  // Validasi setiap item
  for (const it of finalItems) {
    if (!it.kode_matkul || !it.nama_matkul || !it.nilai_huruf) {
      const err = new Error('Setiap item wajib punya kode_matkul, nama_matkul, dan nilai_huruf');
      err.statusCode = 400;
      throw err;
    }
  }

  // Sks selalu di-lookup dari master_matkul di sini. Frontend tidak kirim sks
  // (per keputusan M9 Issue 2), supaya mahasiswa tidak bisa override sks.
  const kodeListAll = finalItems.map((it) => it.kode_matkul);
  const sksMap = await lookupSksMap(kodeListAll);

  const periodeDummyId = await getPeriodeDummyId();

  // Full replace per mahasiswa: DELETE all + INSERT.
  // Lalu apply academic snapshot dari parser ke profile_mahasiswa.
  await withTransaction(async (client) => {
    await client.query('DELETE FROM riwayat_nilai WHERE mahasiswa_id = $1', [mahasiswaId]);

    for (const it of finalItems) {
      const sks = sksMap.get(it.kode_matkul.toUpperCase()) ?? 0;
      await client.query(
        `INSERT INTO riwayat_nilai
           (mahasiswa_id, periode_id, kode_matkul, nama_matkul, sks,
            nilai_huruf, nilai_angka, status, sumber)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'dps_upload')`,
        [
          mahasiswaId, periodeDummyId,
          it.kode_matkul, it.nama_matkul, sks,
          it.nilai_huruf,
          it.nilai_angka != null ? Number(it.nilai_angka) : null,
          it.status ?? statusFromHuruf(it.nilai_huruf),
        ],
      );
    }
  });

  // Apply snapshot IPK / IPS / total SKS dari parser (di luar transaction —
  // ini operasi UPDATE single row, gagal pun riwayat sudah masuk DB)
  const cache = await akademikService.applyAcademicSnapshot(
    mahasiswaId,
    staged.parsed.academic ?? {},
  );

  staging.remove(upload_token);

  return {
    inserted_count: finalItems.length,
    cache,
  };
}

/* ============================================================
 * Manual entry (fallback) — upsert per (kode, periode)
 * ============================================================ */

async function manualEntry({ mahasiswaId, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('items wajib berupa array dan tidak kosong');
    err.statusCode = 400;
    throw err;
  }

  for (const it of items) {
    if (!it.kode_matkul || !it.nama_matkul || !it.nilai_huruf || !it.periode_id) {
      const err = new Error(
        'Setiap item wajib punya kode_matkul, nama_matkul, nilai_huruf, periode_id',
      );
      err.statusCode = 400;
      throw err;
    }
  }

  // Lookup sks dari master_matkul
  const kodeList = items.map((it) => it.kode_matkul);
  const sksMap = await lookupSksMap(kodeList);

  await withTransaction(async (client) => {
    for (const it of items) {
      const sks = it.sks != null
        ? Number(it.sks)
        : (sksMap.get(it.kode_matkul.toUpperCase()) ?? 0);

      await client.query(
        `INSERT INTO riwayat_nilai
           (mahasiswa_id, periode_id, kode_matkul, nama_matkul, sks,
            nilai_huruf, nilai_angka, status, sumber)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'manual_input')
         ON CONFLICT (mahasiswa_id, kode_matkul, periode_id)
         DO UPDATE SET
           nama_matkul = EXCLUDED.nama_matkul,
           sks = EXCLUDED.sks,
           nilai_huruf = EXCLUDED.nilai_huruf,
           nilai_angka = EXCLUDED.nilai_angka,
           status = EXCLUDED.status,
           updated_at = NOW()`,
        [
          mahasiswaId, it.periode_id,
          it.kode_matkul, it.nama_matkul, sks,
          it.nilai_huruf,
          it.nilai_angka != null ? Number(it.nilai_angka) : null,
          it.status ?? statusFromHuruf(it.nilai_huruf),
        ],
      );
    }
  });

  // Manual entry: tidak ada parser snapshot. Pakai recalculate dari riwayat_nilai.
  const cache = await akademikService.recalculateProfileCache(mahasiswaId);

  return { upserted_count: items.length, cache };
}

module.exports = {
  listSaya,
  listMahasiswaForCaller,
  uploadDpsPreview,
  uploadDpsConfirm,
  manualEntry,
};
