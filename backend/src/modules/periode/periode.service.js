const { query, withTransaction } = require('../../db/pool');

// status dihitung dari DB: aktif | nonaktif | berakhir
const STATUS_SQL = `
  CASE
    WHEN p.tanggal_selesai < CURRENT_DATE THEN 'berakhir'
    WHEN p.is_active = TRUE THEN 'aktif'
    ELSE 'nonaktif'
  END AS status
`;

async function listPeriode({ isActive } = {}) {
  let whereClause = '';
  const params = [];

  if (isActive === true) {
    whereClause = 'WHERE p.is_active = TRUE AND p.tanggal_selesai >= CURRENT_DATE';
  } else if (isActive === false) {
    whereClause = 'WHERE NOT (p.is_active = TRUE AND p.tanggal_selesai >= CURRENT_DATE)';
  }

  const result = await query(
    `SELECT p.id, p.nama, p.tahun_mulai, p.jenis,
            p.tanggal_mulai, p.tanggal_selesai, p.is_active,
            ${STATUS_SQL}
     FROM periode p
     ${whereClause}
     ORDER BY p.tanggal_mulai DESC`,
    params,
  );

  return result.rows;
}

async function getPeriodeAktif() {
  const result = await query(
    `SELECT p.id, p.nama, p.tahun_mulai, p.jenis,
            p.tanggal_mulai, p.tanggal_selesai, p.is_active,
            ${STATUS_SQL}
     FROM periode p
     WHERE p.is_active = TRUE AND p.tanggal_selesai >= CURRENT_DATE
     LIMIT 1`,
  );
  return result.rows[0] ?? null;
}

async function getPeriodeById(id) {
  const result = await query(
    `SELECT p.id, p.nama, p.tahun_mulai, p.jenis,
            p.tanggal_mulai, p.tanggal_selesai, p.is_active,
            ${STATUS_SQL}
     FROM periode p
     WHERE p.id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

async function createPeriode({ nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai }) {
  return withTransaction(async (client) => {
    // Nonaktifkan periode aktif sebelumnya
    await client.query(
      'UPDATE periode SET is_active = FALSE, updated_at = NOW() WHERE is_active = TRUE',
    );

    const result = await client.query(
      `INSERT INTO periode (nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id`,
      [nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai],
    );

    return getPeriodeById(result.rows[0].id);
  });
}

async function updatePeriode(id, { nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai }) {
  const existing = await getPeriodeById(id);
  if (!existing) {
    const err = new Error('Periode tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  await query(
    `UPDATE periode
     SET nama = COALESCE($1, nama),
         tahun_mulai = COALESCE($2, tahun_mulai),
         jenis = COALESCE($3, jenis),
         tanggal_mulai = COALESCE($4, tanggal_mulai),
         tanggal_selesai = COALESCE($5, tanggal_selesai),
         updated_at = NOW()
     WHERE id = $6`,
    [nama ?? null, tahun_mulai ?? null, jenis ?? null, tanggal_mulai ?? null, tanggal_selesai ?? null, id],
  );

  return getPeriodeById(id);
}

async function aktivasiPeriode(id) {
  const target = await getPeriodeById(id);
  if (!target) {
    const err = new Error('Periode tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  // Tolak aktivasi periode yang sudah lewat tanggal_selesai
  if (target.status === 'berakhir') {
    const err = new Error('Periode yang sudah berakhir tidak bisa diaktifkan kembali');
    err.statusCode = 422;
    throw err;
  }

  if (target.status === 'aktif') {
    return target; // sudah aktif, no-op
  }

  return withTransaction(async (client) => {
    await client.query(
      'UPDATE periode SET is_active = FALSE, updated_at = NOW() WHERE is_active = TRUE',
    );
    await client.query(
      'UPDATE periode SET is_active = TRUE, updated_at = NOW() WHERE id = $1',
      [id],
    );
    return getPeriodeById(id);
  });
}

async function deletePeriode(id) {
  const existing = await getPeriodeById(id);
  if (!existing) {
    const err = new Error('Periode tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  try {
    await query('DELETE FROM periode WHERE id = $1', [id]);
  } catch (dbErr) {
    // FK violation dari kelas / rencana_studi / riwayat_nilai
    if (dbErr.code === '23503') {
      const err = new Error('Periode tidak bisa dihapus karena masih ada data terkait (kelas atau FRS)');
      err.statusCode = 409;
      throw err;
    }
    throw dbErr;
  }
}

module.exports = {
  listPeriode,
  getPeriodeAktif,
  getPeriodeById,
  createPeriode,
  updatePeriode,
  aktivasiPeriode,
  deletePeriode,
};
