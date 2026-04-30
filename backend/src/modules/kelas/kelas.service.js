const { query, withTransaction } = require('../../db/pool');
const { parseJadwal } = require('../../services/jadwalExcelParser');
const staging = require('./upload-staging');

async function listKelas({ periode_id, kode_matkul, search }) {
  const params = [];
  const whereParts = [];

  if (periode_id) {
    params.push(periode_id);
    whereParts.push(`k.periode_id = $${params.length}`);
  }
  if (kode_matkul) {
    params.push(kode_matkul);
    whereParts.push(`k.kode_matkul = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    whereParts.push(`(k.nama_matkul ILIKE $${params.length} OR k.kode_matkul ILIKE $${params.length})`);
  }
  const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  const kelasResult = await query(
    `SELECT k.id, k.kode_matkul, k.nama_matkul, k.sks, k.nama_kelas, k.tipe,
            p.id AS periode_id, p.nama AS periode_nama
     FROM kelas k
     JOIN periode p ON p.id = k.periode_id
     ${whereClause}
     ORDER BY k.kode_matkul, k.nama_kelas`,
    params,
  );

  if (kelasResult.rows.length === 0) return [];

  const kelasIds = kelasResult.rows.map((r) => r.id);
  const sesiResult = await query(
    `SELECT id, kelas_id, nomor_sesi, hari,
            TO_CHAR(jam_mulai, 'HH24:MI') AS jam_mulai,
            TO_CHAR(jam_selesai, 'HH24:MI') AS jam_selesai,
            bentuk_pembelajaran, dosen_utama, ruangan
     FROM sesi_kelas
     WHERE kelas_id = ANY($1::bigint[])
     ORDER BY kelas_id, nomor_sesi, hari`,
    [kelasIds],
  );

  const sesiByKelas = new Map();
  for (const s of sesiResult.rows) {
    if (!sesiByKelas.has(s.kelas_id)) sesiByKelas.set(s.kelas_id, []);
    sesiByKelas.get(s.kelas_id).push({
      id: s.id,
      nomor_sesi: s.nomor_sesi,
      hari: s.hari,
      jam_mulai: s.jam_mulai,
      jam_selesai: s.jam_selesai,
      bentuk_pembelajaran: s.bentuk_pembelajaran,
      dosen_utama: s.dosen_utama,
      ruangan: s.ruangan,
    });
  }

  return kelasResult.rows.map((k) => ({
    id: k.id,
    kode_matkul: k.kode_matkul,
    nama_matkul: k.nama_matkul,
    sks: k.sks,
    nama_kelas: k.nama_kelas,
    tipe: k.tipe,
    periode: { id: k.periode_id, nama: k.periode_nama },
    sesi: sesiByKelas.get(k.id) ?? [],
  }));
}

async function getKelasById(id) {
  const kelasResult = await query(
    `SELECT k.id, k.kode_matkul, k.nama_matkul, k.sks, k.nama_kelas, k.tipe,
            p.id AS periode_id, p.nama AS periode_nama
     FROM kelas k
     JOIN periode p ON p.id = k.periode_id
     WHERE k.id = $1`,
    [id],
  );
  if (!kelasResult.rows[0]) return null;

  const sesiResult = await query(
    `SELECT id, nomor_sesi, hari,
            TO_CHAR(jam_mulai, 'HH24:MI') AS jam_mulai,
            TO_CHAR(jam_selesai, 'HH24:MI') AS jam_selesai,
            bentuk_pembelajaran, dosen_utama, ruangan
     FROM sesi_kelas
     WHERE kelas_id = $1
     ORDER BY nomor_sesi, hari`,
    [id],
  );

  const k = kelasResult.rows[0];
  return {
    id: k.id,
    kode_matkul: k.kode_matkul,
    nama_matkul: k.nama_matkul,
    sks: k.sks,
    nama_kelas: k.nama_kelas,
    tipe: k.tipe,
    periode: { id: k.periode_id, nama: k.periode_nama },
    sesi: sesiResult.rows,
  };
}

async function uploadPreview({ buffer, periodeId }) {
  // Validasi periode harus exist
  const periodeRes = await query(
    'SELECT id, nama FROM periode WHERE id = $1',
    [periodeId],
  );
  if (!periodeRes.rows[0]) {
    const err = new Error('Periode tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  let parsed;
  try {
    parsed = await parseJadwal({ buffer, periodeId });
  } catch (parseErr) {
    const err = new Error(`Gagal parse Excel: ${parseErr.message}`);
    err.statusCode = 422;
    throw err;
  }

  // Build preview ringkas (per kelas) sesuai api-spec
  const preview = parsed.kelas.map((k) => ({
    row_excel: k._rowExcel ?? null,
    kode_matkul: k.kode_matkul,
    nama_matkul: k.nama_matkul,
    sks: k.sks,
    nama_kelas: k.nama_kelas,
    sesi_count: k.sesi.length,
    valid: true,
  }));

  // Kalau ada warnings skipped_row, tambahkan ke preview sebagai invalid
  for (const w of parsed.warnings) {
    if (w.type === 'skipped_row') {
      preview.push({
        row_excel: w.row,
        valid: false,
        errors: [w.message],
      });
    }
  }

  const validCount = parsed.kelas.length;
  const invalidCount = parsed.warnings.filter((w) => w.type === 'skipped_row').length;
  const summary = {
    total_rows: parsed.metadata.parsed_rows + parsed.metadata.skipped_rows,
    total_kelas: validCount + invalidCount,
    valid_kelas: validCount,
    invalid_kelas: invalidCount,
  };

  // Simpan hasil parse mentah agar confirm tinggal pakai
  const upload_token = staging.put({
    periodeId,
    periode: periodeRes.rows[0],
    parsed,
  });

  return {
    preview,
    summary,
    warnings: parsed.warnings,
    upload_token,
  };
}

async function uploadConfirm({ upload_token, mode }) {
  const stagedRaw = staging.get(upload_token);
  if (!stagedRaw) {
    const err = new Error('upload_token tidak ditemukan atau sudah expired. Silakan upload ulang.');
    err.statusCode = 410;
    throw err;
  }

  if (mode !== 'replace') {
    const err = new Error("Mode harus 'replace'");
    err.statusCode = 400;
    throw err;
  }

  const { periodeId, parsed } = stagedRaw;

  // Replace mode: hapus semua kelas+sesi periode itu, insert ulang.
  // sesi_kelas pakai ON DELETE CASCADE jadi cukup hapus kelas.
  await withTransaction(async (client) => {
    await client.query('DELETE FROM kelas WHERE periode_id = $1', [periodeId]);

    for (const k of parsed.kelas) {
      const insertKelas = await client.query(
        `INSERT INTO kelas (periode_id, kode_matkul, nama_matkul, sks, nama_kelas, tipe)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [periodeId, k.kode_matkul, k.nama_matkul, k.sks, k.nama_kelas, k.tipe],
      );
      const kelasId = insertKelas.rows[0].id;

      for (const s of k.sesi) {
        await client.query(
          `INSERT INTO sesi_kelas
            (kelas_id, nomor_sesi, hari, jam_mulai, jam_selesai,
             bentuk_pembelajaran, dosen_utama, ruangan)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            kelasId, s.nomor_sesi, s.hari, s.jam_mulai, s.jam_selesai,
            s.bentuk_pembelajaran, s.dosen_utama, s.ruangan,
          ],
        );
      }
    }
  });

  staging.remove(upload_token);

  return {
    periode_id: periodeId,
    inserted_kelas: parsed.kelas.length,
    inserted_sesi: parsed.kelas.reduce((acc, k) => acc + k.sesi.length, 0),
  };
}

module.exports = {
  listKelas,
  getKelasById,
  uploadPreview,
  uploadConfirm,
};
