const { query } = require('../../db/pool');

async function listDosenWali({ page, limit, offset, search }) {
  const searchParam = search ? `%${search}%` : '%';

  const countResult = await query(
    `SELECT COUNT(*) AS total
     FROM users u
     JOIN profile_dosen pd ON pd.user_id = u.id
     WHERE u.is_active = true
       AND (u.nama ILIKE $1 OR u.email ILIKE $1)`,
    [searchParam],
  );

  // Tambah count FRS bimbingan per dosen di periode aktif:
  // - total_menunggu_review: status SUBMITTED atau REJECTED (dosen perlu lihat)
  // - total_disetujui: status APPROVED
  // Pola JOIN periode aktif + rencana_studi sama dengan rencana-studi.service.listBimbinganFrs.
  const rows = await query(
    `SELECT
       u.id, u.nama, u.email,
       pd.nip, pd.jadwal_perwalian,
       COUNT(DISTINCT pm.user_id)::int AS jumlah_bimbingan,
       COUNT(*) FILTER (WHERE COALESCE(rs.status, 'DRAFT') IN ('SUBMITTED', 'REJECTED'))::int AS total_menunggu_review,
       COUNT(*) FILTER (WHERE rs.status = 'APPROVED')::int AS total_disetujui
     FROM users u
     JOIN profile_dosen pd ON pd.user_id = u.id
     LEFT JOIN profile_mahasiswa pm ON pm.dosen_wali_id = u.id
     LEFT JOIN periode pa ON pa.is_active = TRUE AND pa.tanggal_selesai >= CURRENT_DATE
     LEFT JOIN rencana_studi rs ON rs.mahasiswa_id = pm.user_id AND rs.periode_id = pa.id
     WHERE u.is_active = true
       AND (u.nama ILIKE $1 OR u.email ILIKE $1)
     GROUP BY u.id, pd.user_id, pd.nip, pd.jadwal_perwalian
     ORDER BY u.nama
     LIMIT $2 OFFSET $3`,
    [searchParam, limit, offset],
  );

  return { data: rows.rows, total: Number(countResult.rows[0].total) };
}

async function getDosenWaliById(id) {
  const dosenResult = await query(
    `SELECT u.id, u.nama, u.email, pd.nip, pd.jadwal_perwalian
     FROM users u
     JOIN profile_dosen pd ON pd.user_id = u.id
     WHERE u.id = $1 AND u.is_active = true`,
    [id],
  );
  if (!dosenResult.rows[0]) return null;

  // Mahasiswa bimbingan + status FRS periode aktif + total_sks dari item kelas.
  // Pakai pattern listBimbinganFrs dari rencana-studi service.
  const bimbinganResult = await query(
    `SELECT
       u.id, pm.nim, u.nama, pm.ipk,
       rs.id AS rs_id,
       COALESCE(rs.status, 'DRAFT') AS rencana_studi_status,
       rs.submitted_at,
       COALESCE(SUM(k.sks), 0)::int AS total_sks
     FROM profile_mahasiswa pm
     JOIN users u ON u.id = pm.user_id
     LEFT JOIN periode p ON p.is_active = TRUE AND p.tanggal_selesai >= CURRENT_DATE
     LEFT JOIN rencana_studi rs ON rs.mahasiswa_id = pm.user_id AND rs.periode_id = p.id
     LEFT JOIN rencana_studi_item rsi ON rsi.rencana_studi_id = rs.id
     LEFT JOIN kelas k ON k.id = rsi.kelas_id
     WHERE pm.dosen_wali_id = $1
     GROUP BY u.id, pm.nim, pm.ipk, rs.id
     ORDER BY u.nama`,
    [id],
  );

  return { ...dosenResult.rows[0], mahasiswa_bimbingan: bimbinganResult.rows };
}

async function createDosenWali({ nama, email, nip, jadwal_perwalian }) {
  // Cek email dan NIP belum dipakai
  const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (emailCheck.rows.length > 0) {
    const err = new Error('Email sudah terdaftar');
    err.statusCode = 409;
    throw err;
  }

  const nipCheck = await query('SELECT user_id FROM profile_dosen WHERE nip = $1', [nip]);
  if (nipCheck.rows.length > 0) {
    const err = new Error('NIP sudah terdaftar');
    err.statusCode = 409;
    throw err;
  }

  const userResult = await query(
    'INSERT INTO users (email, nama, role, is_active) VALUES ($1, $2, $3, true) RETURNING id',
    [email, nama, 'dosen_wali'],
  );
  const userId = userResult.rows[0].id;

  await query(
    'INSERT INTO profile_dosen (user_id, nip, jadwal_perwalian) VALUES ($1, $2, $3)',
    [userId, nip, jadwal_perwalian ?? null],
  );

  return getDosenWaliById(userId);
}

async function updateDosenWali(id, { nama, email, nip, jadwal_perwalian }) {
  const dosen = await query('SELECT id FROM users WHERE id = $1 AND is_active = true', [id]);
  if (!dosen.rows[0]) {
    const err = new Error('Dosen wali tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  // Cek email unik (kecuali milik sendiri)
  if (email) {
    const emailCheck = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    if (emailCheck.rows.length > 0) {
      const err = new Error('Email sudah digunakan');
      err.statusCode = 409;
      throw err;
    }
  }

  await query(
    'UPDATE users SET nama = COALESCE($1, nama), email = COALESCE($2, email), updated_at = NOW() WHERE id = $3',
    [nama ?? null, email ?? null, id],
  );

  await query(
    'UPDATE profile_dosen SET nip = COALESCE($1, nip), jadwal_perwalian = COALESCE($2, jadwal_perwalian), updated_at = NOW() WHERE user_id = $3',
    [nip ?? null, jadwal_perwalian ?? null, id],
  );

  return getDosenWaliById(id);
}

async function updateJadwalPerwalian(userId, jadwal_perwalian) {
  await query(
    'UPDATE profile_dosen SET jadwal_perwalian = $1, updated_at = NOW() WHERE user_id = $2',
    [jadwal_perwalian, userId],
  );
}

async function deleteDosenWali(id) {
  const bimbinganCheck = await query(
    'SELECT COUNT(*) AS count FROM profile_mahasiswa WHERE dosen_wali_id = $1',
    [id],
  );
  if (Number(bimbinganCheck.rows[0].count) > 0) {
    const err = new Error('Dosen wali masih punya mahasiswa bimbingan. Unassign dulu sebelum hapus.');
    err.statusCode = 409;
    throw err;
  }

  const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) {
    const err = new Error('Dosen wali tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
}

module.exports = {
  listDosenWali,
  getDosenWaliById,
  createDosenWali,
  updateDosenWali,
  updateJadwalPerwalian,
  deleteDosenWali,
};
