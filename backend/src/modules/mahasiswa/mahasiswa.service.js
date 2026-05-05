const { query } = require('../../db/pool');

async function listMahasiswa({ page, limit, offset, search, dosenWaliId, angkatan, callerRole, callerId }) {
  const conditions = ['u.is_active = true', 'u.role = \'mahasiswa\''];
  const params = [];

  // Dosen wali hanya bisa lihat bimbingannya sendiri
  if (callerRole === 'dosen_wali') {
    params.push(callerId);
    conditions.push(`pm.dosen_wali_id = $${params.length}`);
  } else if (dosenWaliId) {
    // Kaprodi bisa filter by dosen_wali_id (termasuk null = belum assign)
    if (dosenWaliId === 'null' || dosenWaliId === '0') {
      conditions.push('pm.dosen_wali_id IS NULL');
    } else {
      params.push(dosenWaliId);
      conditions.push(`pm.dosen_wali_id = $${params.length}`);
    }
  }

  if (angkatan) {
    params.push(angkatan);
    conditions.push(`pm.angkatan = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(u.nama ILIKE $${params.length} OR pm.nim ILIKE $${params.length})`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const countResult = await query(
    `SELECT COUNT(*) AS total
     FROM users u JOIN profile_mahasiswa pm ON pm.user_id = u.id
     ${where}`,
    params,
  );

  const dataParams = [...params, limit, offset];
  // Tambah status_frs dari LEFT JOIN ke rencana_studi periode aktif.
  // Mahasiswa tanpa periode aktif / belum bikin FRS → status default 'DRAFT'.
  const rows = await query(
    `SELECT
       u.id, u.nama, u.email, u.avatar_url,
       pm.nim, pm.angkatan, pm.ipk, pm.total_sks_lulus,
       json_build_object('id', dw.id, 'nama', dw.nama) AS dosen_wali,
       COALESCE(rs.status, 'DRAFT') AS status_frs
     FROM users u
     JOIN profile_mahasiswa pm ON pm.user_id = u.id
     LEFT JOIN users dw ON dw.id = pm.dosen_wali_id
     LEFT JOIN periode pa ON pa.is_active = TRUE AND pa.tanggal_selesai >= CURRENT_DATE
     LEFT JOIN rencana_studi rs ON rs.mahasiswa_id = u.id AND rs.periode_id = pa.id
     ${where}
     ORDER BY u.nama
     LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams,
  );

  return { data: rows.rows, total: Number(countResult.rows[0].total) };
}

async function getMahasiswaById(id) {
  const result = await query(
    `SELECT
       u.id, u.nama, u.email, u.avatar_url,
       pm.nim, pm.angkatan, pm.ipk, pm.ips_terakhir,
       pm.total_sks_lulus, pm.total_sks_wajib_lulus, pm.total_sks_pilihan_lulus,
       pm.cache_updated_at,
       json_build_object(
         'id', dw.id,
         'nama', dw.nama,
         'jadwal_perwalian', pd.jadwal_perwalian
       ) AS dosen_wali
     FROM users u
     JOIN profile_mahasiswa pm ON pm.user_id = u.id
     LEFT JOIN users dw ON dw.id = pm.dosen_wali_id
     LEFT JOIN profile_dosen pd ON pd.user_id = dw.id
     WHERE u.id = $1 AND u.is_active = true`,
    [id],
  );
  return result.rows[0] ?? null;
}

async function createMahasiswa({ nama, email, nim, angkatan, dosen_wali_id }) {
  const emailCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (emailCheck.rows.length > 0) {
    const err = new Error('Email sudah terdaftar');
    err.statusCode = 409;
    throw err;
  }

  const nimCheck = await query('SELECT user_id FROM profile_mahasiswa WHERE nim = $1', [nim]);
  if (nimCheck.rows.length > 0) {
    const err = new Error('NIM sudah terdaftar');
    err.statusCode = 409;
    throw err;
  }

  const userResult = await query(
    'INSERT INTO users (email, nama, role, is_active) VALUES ($1, $2, $3, true) RETURNING id',
    [email, nama, 'mahasiswa'],
  );
  const userId = userResult.rows[0].id;

  await query(
    'INSERT INTO profile_mahasiswa (user_id, nim, angkatan, dosen_wali_id) VALUES ($1, $2, $3, $4)',
    [userId, nim, angkatan, dosen_wali_id ?? null],
  );

  return getMahasiswaById(userId);
}

async function updateMahasiswa(id, { nama, email, nim, angkatan }) {
  const mhs = await query('SELECT id FROM users WHERE id = $1 AND is_active = true', [id]);
  if (!mhs.rows[0]) {
    const err = new Error('Mahasiswa tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

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
    'UPDATE profile_mahasiswa SET nim = COALESCE($1, nim), angkatan = COALESCE($2, angkatan), updated_at = NOW() WHERE user_id = $3',
    [nim ?? null, angkatan ?? null, id],
  );

  return getMahasiswaById(id);
}

async function assignDosenWali(mahasiswaId, dosenWaliId) {
  // dosenWaliId null = unassign
  if (dosenWaliId !== null) {
    const dosenCheck = await query(
      'SELECT id FROM users WHERE id = $1 AND role = $2 AND is_active = true',
      [dosenWaliId, 'dosen_wali'],
    );
    if (!dosenCheck.rows[0]) {
      const err = new Error('Dosen wali tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
  }

  const result = await query(
    'UPDATE profile_mahasiswa SET dosen_wali_id = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id',
    [dosenWaliId, mahasiswaId],
  );

  if (!result.rows[0]) {
    const err = new Error('Mahasiswa tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
}

async function deleteMahasiswa(id) {
  const result = await query('DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id', [id, 'mahasiswa']);
  if (!result.rows[0]) {
    const err = new Error('Mahasiswa tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
}

// Cek apakah dosen wali berhak akses ke mahasiswa tertentu
async function isBimbingan(dosenId, mahasiswaId) {
  const result = await query(
    'SELECT user_id FROM profile_mahasiswa WHERE user_id = $1 AND dosen_wali_id = $2',
    [mahasiswaId, dosenId],
  );
  return result.rows.length > 0;
}

module.exports = {
  listMahasiswa,
  getMahasiswaById,
  createMahasiswa,
  updateMahasiswa,
  assignDosenWali,
  deleteMahasiswa,
  isBimbingan,
};
