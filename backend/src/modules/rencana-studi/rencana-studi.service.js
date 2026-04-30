const { query, withTransaction } = require('../../db/pool');

/* ============================================================
 * Internal helpers
 * ============================================================ */

// Ambil data periode minimal beserta status aktif-realnya
async function getPeriodeWithStatus(periodeId) {
  const res = await query(
    `SELECT id, nama, is_active, tanggal_selesai,
            (is_active = TRUE AND tanggal_selesai >= CURRENT_DATE) AS is_aktif_real
     FROM periode WHERE id = $1`,
    [periodeId],
  );
  return res.rows[0] ?? null;
}

// Throw kalau periode tidak aktif (untuk gating write actions)
async function assertPeriodeAktif(periodeId) {
  const p = await getPeriodeWithStatus(periodeId);
  if (!p) {
    const err = new Error('Periode tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (!p.is_aktif_real) {
    const err = new Error('Periode tidak aktif. Aksi tulis hanya boleh saat periode aktif.');
    err.statusCode = 422;
    throw err;
  }
  return p;
}

// Cari periode aktif global (atau null kalau tidak ada)
async function findPeriodeAktif() {
  const res = await query(
    `SELECT id, nama, is_active, tanggal_mulai, tanggal_selesai
     FROM periode
     WHERE is_active = TRUE AND tanggal_selesai >= CURRENT_DATE
     LIMIT 1`,
  );
  return res.rows[0] ?? null;
}

// Ambil row rencana_studi mentah (tanpa items)
async function findRencanaStudiCore(id) {
  const res = await query(
    `SELECT rs.id, rs.mahasiswa_id, rs.status, rs.catatan_dosen,
            rs.submitted_at, rs.reviewed_at, rs.reviewed_by,
            p.id AS periode_id, p.nama AS periode_nama, p.is_active AS periode_is_active,
            p.tanggal_selesai
     FROM rencana_studi rs
     JOIN periode p ON p.id = rs.periode_id
     WHERE rs.id = $1`,
    [id],
  );
  return res.rows[0] ?? null;
}

// Load items + kelas + sesi untuk satu FRS
async function loadItems(rsId) {
  const itemsRes = await query(
    `SELECT rsi.id AS item_id,
            k.id AS kelas_id, k.kode_matkul, k.nama_matkul, k.sks, k.nama_kelas, k.tipe
     FROM rencana_studi_item rsi
     JOIN kelas k ON k.id = rsi.kelas_id
     WHERE rsi.rencana_studi_id = $1
     ORDER BY rsi.id`,
    [rsId],
  );

  if (itemsRes.rows.length === 0) return [];

  const kelasIds = itemsRes.rows.map((r) => r.kelas_id);
  const sesiRes = await query(
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
  for (const s of sesiRes.rows) {
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

  return itemsRes.rows.map((r) => ({
    id: r.item_id,
    kelas: {
      id: r.kelas_id,
      kode_matkul: r.kode_matkul,
      nama_matkul: r.nama_matkul,
      sks: r.sks,
      nama_kelas: r.nama_kelas,
      tipe: r.tipe,
      sesi: sesiByKelas.get(r.kelas_id) ?? [],
    },
    // Placeholder per keputusan M6 (Opsi B) - fitur tidak dipakai saat ini
    is_mengulang: false,
    tags: [],
  }));
}

// Hitung total SKS dari item
async function getTotalSks(rsId) {
  const res = await query(
    `SELECT COALESCE(SUM(k.sks), 0)::int AS total_sks
     FROM rencana_studi_item rsi
     JOIN kelas k ON k.id = rsi.kelas_id
     WHERE rsi.rencana_studi_id = $1`,
    [rsId],
  );
  return Number(res.rows[0].total_sks);
}

// Ambil profil akademik mahasiswa (dipakai di detail FRS dan profil dosen view)
async function getMahasiswaProfile(userId) {
  const res = await query(
    `SELECT u.id, u.nama,
            pm.nim, pm.angkatan,
            pm.ipk, pm.ips_terakhir,
            pm.total_sks_lulus, pm.total_sks_wajib_lulus, pm.total_sks_pilihan_lulus
     FROM users u
     JOIN profile_mahasiswa pm ON pm.user_id = u.id
     WHERE u.id = $1 AND u.is_active = TRUE`,
    [userId],
  );
  return res.rows[0] ?? null;
}

async function isMahasiswaBimbinganDosen(dosenId, mahasiswaId) {
  const res = await query(
    `SELECT user_id FROM profile_mahasiswa
     WHERE user_id = $1 AND dosen_wali_id = $2`,
    [mahasiswaId, dosenId],
  );
  return res.rows.length > 0;
}

// Auto-change status saat mahasiswa edit composition (add/delete item)
function nextStatusOnEdit(currentStatus) {
  if (currentStatus === 'APPROVED') return 'SUBMITTED';
  if (currentStatus === 'REJECTED') return 'DRAFT';
  return currentStatus; // DRAFT/SUBMITTED tetap
}

/* ============================================================
 * MAHASISWA-SIDE
 * ============================================================ */

async function getRencanaStudiSaya({ mahasiswaId, periodeId }) {
  let targetPeriodeId = periodeId;

  if (!targetPeriodeId) {
    const aktif = await findPeriodeAktif();
    if (!aktif) {
      const err = new Error('Tidak ada periode aktif');
      err.statusCode = 404;
      throw err;
    }
    targetPeriodeId = aktif.id;
  }

  const rsRes = await query(
    `SELECT rs.id FROM rencana_studi rs
     WHERE rs.mahasiswa_id = $1 AND rs.periode_id = $2`,
    [mahasiswaId, targetPeriodeId],
  );
  if (!rsRes.rows[0]) {
    const err = new Error('FRS belum dibuat untuk periode ini');
    err.statusCode = 404;
    throw err;
  }

  return getRencanaStudiDetail(rsRes.rows[0].id);
}

async function listRiwayatSaya(mahasiswaId) {
  const res = await query(
    `SELECT rs.id, rs.status, rs.submitted_at, rs.reviewed_at,
            rs.catatan_dosen,
            p.id AS periode_id, p.nama AS periode_nama, p.is_active AS periode_is_active,
            COALESCE(SUM(k.sks), 0)::int AS total_sks
     FROM rencana_studi rs
     JOIN periode p ON p.id = rs.periode_id
     LEFT JOIN rencana_studi_item rsi ON rsi.rencana_studi_id = rs.id
     LEFT JOIN kelas k ON k.id = rsi.kelas_id
     WHERE rs.mahasiswa_id = $1
     GROUP BY rs.id, p.id
     ORDER BY p.tanggal_mulai DESC`,
    [mahasiswaId],
  );

  return res.rows.map((r) => ({
    id: r.id,
    periode: {
      id: r.periode_id,
      nama: r.periode_nama,
      is_active: r.periode_is_active,
    },
    status: r.status,
    total_sks: r.total_sks,
    submitted_at: r.submitted_at,
    reviewed_at: r.reviewed_at,
    catatan_dosen: r.catatan_dosen,
  }));
}

async function createRencanaStudi({ mahasiswaId, periodeId }) {
  await assertPeriodeAktif(periodeId);

  // Cek belum ada FRS untuk periode ini
  const existing = await query(
    `SELECT id FROM rencana_studi WHERE mahasiswa_id = $1 AND periode_id = $2`,
    [mahasiswaId, periodeId],
  );
  if (existing.rows[0]) {
    const err = new Error('FRS untuk periode ini sudah ada');
    err.statusCode = 409;
    throw err;
  }

  const insertRes = await query(
    `INSERT INTO rencana_studi (mahasiswa_id, periode_id, status)
     VALUES ($1, $2, 'DRAFT') RETURNING id`,
    [mahasiswaId, periodeId],
  );

  return getRencanaStudiDetail(insertRes.rows[0].id);
}

async function addItem({ rsId, kelasId, mahasiswaId }) {
  const rs = await findRencanaStudiCore(rsId);
  if (!rs) {
    const err = new Error('FRS tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (rs.mahasiswa_id !== mahasiswaId) {
    const err = new Error('Anda tidak punya akses ke FRS ini');
    err.statusCode = 403;
    throw err;
  }

  await assertPeriodeAktif(rs.periode_id);

  // Cek kelas exist & periodenya cocok
  const kelasRes = await query(
    `SELECT id, periode_id FROM kelas WHERE id = $1`,
    [kelasId],
  );
  if (!kelasRes.rows[0]) {
    const err = new Error('Kelas tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (kelasRes.rows[0].periode_id !== rs.periode_id) {
    const err = new Error('Kelas tidak berada di periode FRS ini');
    err.statusCode = 422;
    throw err;
  }

  await withTransaction(async (client) => {
    try {
      await client.query(
        `INSERT INTO rencana_studi_item (rencana_studi_id, kelas_id) VALUES ($1, $2)`,
        [rsId, kelasId],
      );
    } catch (dbErr) {
      if (dbErr.code === '23505') {
        const err = new Error('Kelas ini sudah ada di FRS');
        err.statusCode = 409;
        throw err;
      }
      throw dbErr;
    }

    const newStatus = nextStatusOnEdit(rs.status);
    if (newStatus !== rs.status) {
      await client.query(
        `UPDATE rencana_studi SET status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, rsId],
      );
    }
  });

  return getRencanaStudiDetail(rsId);
}

async function removeItem({ rsId, itemId, mahasiswaId }) {
  const rs = await findRencanaStudiCore(rsId);
  if (!rs) {
    const err = new Error('FRS tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (rs.mahasiswa_id !== mahasiswaId) {
    const err = new Error('Anda tidak punya akses ke FRS ini');
    err.statusCode = 403;
    throw err;
  }

  await assertPeriodeAktif(rs.periode_id);

  await withTransaction(async (client) => {
    const delRes = await client.query(
      `DELETE FROM rencana_studi_item
       WHERE id = $1 AND rencana_studi_id = $2 RETURNING id`,
      [itemId, rsId],
    );
    if (!delRes.rows[0]) {
      const err = new Error('Item tidak ditemukan di FRS ini');
      err.statusCode = 404;
      throw err;
    }

    const newStatus = nextStatusOnEdit(rs.status);
    if (newStatus !== rs.status) {
      await client.query(
        `UPDATE rencana_studi SET status = $1, updated_at = NOW() WHERE id = $2`,
        [newStatus, rsId],
      );
    }
  });

  return getRencanaStudiDetail(rsId);
}

async function submitRencanaStudi({ rsId, mahasiswaId }) {
  const rs = await findRencanaStudiCore(rsId);
  if (!rs) {
    const err = new Error('FRS tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (rs.mahasiswa_id !== mahasiswaId) {
    const err = new Error('Anda tidak punya akses ke FRS ini');
    err.statusCode = 403;
    throw err;
  }

  await assertPeriodeAktif(rs.periode_id);

  if (!['DRAFT', 'REJECTED'].includes(rs.status)) {
    const err = new Error(`FRS tidak bisa di-submit dari status ${rs.status}`);
    err.statusCode = 422;
    throw err;
  }

  // Minimal 1 item
  const itemCount = await query(
    `SELECT COUNT(*)::int AS c FROM rencana_studi_item WHERE rencana_studi_id = $1`,
    [rsId],
  );
  if (itemCount.rows[0].c === 0) {
    const err = new Error('FRS minimal harus berisi 1 kelas sebelum di-submit');
    err.statusCode = 422;
    throw err;
  }

  await query(
    `UPDATE rencana_studi
     SET status = 'SUBMITTED', submitted_at = NOW(), updated_at = NOW(),
         reviewed_at = NULL, reviewed_by = NULL, catatan_dosen = NULL
     WHERE id = $1`,
    [rsId],
  );

  return getRencanaStudiDetail(rsId);
}

/* ============================================================
 * DOSEN-WALI SIDE
 * ============================================================ */

async function listBimbinganFrs({ dosenId, periodeId, status }) {
  const params = [dosenId];
  const conditions = ['pm.dosen_wali_id = $1'];

  // Default ke periode aktif kalau tidak diset
  let targetPeriodeId = periodeId;
  if (!targetPeriodeId) {
    const aktif = await findPeriodeAktif();
    if (!aktif) {
      // Tidak ada periode aktif → tidak bisa filter FRS, kembalikan kosong saja
      return { data: [], summary: { total: 0, approved: 0, submitted: 0, rejected: 0, draft_or_empty: 0 } };
    }
    targetPeriodeId = aktif.id;
  }

  params.push(targetPeriodeId);
  conditions.push(`p.id = $${params.length}`);

  if (status) {
    params.push(status);
    conditions.push(`COALESCE(rs.status, 'DRAFT') = $${params.length}`);
  }

  // LEFT JOIN agar mahasiswa yang belum bikin FRS pun ikut muncul (status DRAFT/empty)
  const res = await query(
    `SELECT
       u.id AS mahasiswa_user_id, u.nama AS mahasiswa_nama,
       pm.nim, pm.ipk,
       p.id AS periode_id, p.nama AS periode_nama,
       rs.id AS rs_id,
       COALESCE(rs.status, 'DRAFT') AS status,
       rs.submitted_at,
       COALESCE(SUM(k.sks), 0)::int AS total_sks
     FROM profile_mahasiswa pm
     JOIN users u ON u.id = pm.user_id AND u.is_active = TRUE
     CROSS JOIN periode p
     LEFT JOIN rencana_studi rs ON rs.mahasiswa_id = pm.user_id AND rs.periode_id = p.id
     LEFT JOIN rencana_studi_item rsi ON rsi.rencana_studi_id = rs.id
     LEFT JOIN kelas k ON k.id = rsi.kelas_id
     WHERE ${conditions.join(' AND ')}
     GROUP BY u.id, pm.nim, pm.ipk, p.id, rs.id
     ORDER BY u.nama`,
    params,
  );

  const data = res.rows.map((r) => ({
    id: r.rs_id, // bisa null kalau belum bikin FRS
    mahasiswa: {
      id: r.mahasiswa_user_id,
      nim: r.nim,
      nama: r.mahasiswa_nama,
      ipk: r.ipk == null ? null : Number(r.ipk),
    },
    periode: { id: r.periode_id, nama: r.periode_nama },
    status: r.status,
    total_sks: r.total_sks,
    submitted_at: r.submitted_at,
  }));

  // Hitung summary
  const summary = {
    total: data.length,
    approved: data.filter((d) => d.status === 'APPROVED').length,
    submitted: data.filter((d) => d.status === 'SUBMITTED').length,
    rejected: data.filter((d) => d.status === 'REJECTED').length,
    draft_or_empty: data.filter((d) => d.status === 'DRAFT').length,
  };

  return { data, summary };
}

async function getProfilMahasiswaBimbingan({ dosenId, mahasiswaId }) {
  if (!(await isMahasiswaBimbinganDosen(dosenId, mahasiswaId))) {
    const err = new Error('Anda bukan dosen wali mahasiswa ini');
    err.statusCode = 403;
    throw err;
  }

  const profile = await getMahasiswaProfile(mahasiswaId);
  if (!profile) {
    const err = new Error('Mahasiswa tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const periodeAktif = await findPeriodeAktif();
  return {
    mahasiswa: {
      id: profile.id,
      nim: profile.nim,
      nama: profile.nama,
      angkatan: profile.angkatan,
      ipk: profile.ipk == null ? null : Number(profile.ipk),
      ips_terakhir: profile.ips_terakhir == null ? null : Number(profile.ips_terakhir),
      total_sks_lulus: profile.total_sks_lulus,
      total_sks_wajib_lulus: profile.total_sks_wajib_lulus,
      total_sks_pilihan_lulus: profile.total_sks_pilihan_lulus,
    },
    periode_aktif: periodeAktif
      ? { id: periodeAktif.id, nama: periodeAktif.nama }
      : null,
  };
}

async function listRiwayatMahasiswaBimbingan({ dosenId, mahasiswaId }) {
  if (!(await isMahasiswaBimbinganDosen(dosenId, mahasiswaId))) {
    const err = new Error('Anda bukan dosen wali mahasiswa ini');
    err.statusCode = 403;
    throw err;
  }

  const res = await query(
    `SELECT rs.id, rs.status, rs.submitted_at, rs.reviewed_at,
            p.id AS periode_id, p.nama AS periode_nama, p.is_active AS periode_is_active,
            u.id AS mahasiswa_user_id, u.nama AS mahasiswa_nama, pm.nim,
            COALESCE(SUM(k.sks), 0)::int AS total_sks
     FROM rencana_studi rs
     JOIN periode p ON p.id = rs.periode_id
     JOIN users u ON u.id = rs.mahasiswa_id
     JOIN profile_mahasiswa pm ON pm.user_id = u.id
     LEFT JOIN rencana_studi_item rsi ON rsi.rencana_studi_id = rs.id
     LEFT JOIN kelas k ON k.id = rsi.kelas_id
     WHERE rs.mahasiswa_id = $1
     GROUP BY rs.id, p.id, u.id, pm.nim
     ORDER BY p.tanggal_mulai DESC`,
    [mahasiswaId],
  );

  return res.rows.map((r) => ({
    id: r.id,
    periode: {
      id: r.periode_id, nama: r.periode_nama, is_active: r.periode_is_active,
    },
    status: r.status,
    total_sks: r.total_sks,
    submitted_at: r.submitted_at,
    reviewed_at: r.reviewed_at,
    mahasiswa: {
      id: r.mahasiswa_user_id, nim: r.nim, nama: r.mahasiswa_nama,
    },
  }));
}

async function setujuiRencanaStudi({ rsId, dosenId, catatan }) {
  const rs = await findRencanaStudiCore(rsId);
  if (!rs) {
    const err = new Error('FRS tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (!(await isMahasiswaBimbinganDosen(dosenId, rs.mahasiswa_id))) {
    const err = new Error('Anda bukan dosen wali untuk FRS ini');
    err.statusCode = 403;
    throw err;
  }

  await assertPeriodeAktif(rs.periode_id);

  if (rs.status !== 'SUBMITTED') {
    const err = new Error(`FRS tidak bisa disetujui dari status ${rs.status}`);
    err.statusCode = 422;
    throw err;
  }

  await query(
    `UPDATE rencana_studi
     SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = $1,
         catatan_dosen = $2, updated_at = NOW()
     WHERE id = $3`,
    [dosenId, catatan ?? null, rsId],
  );

  return getRencanaStudiDetail(rsId);
}

async function revisiRencanaStudi({ rsId, dosenId, catatan }) {
  if (!catatan || !catatan.trim()) {
    const err = new Error('Catatan wajib diisi saat meminta revisi');
    err.statusCode = 400;
    throw err;
  }

  const rs = await findRencanaStudiCore(rsId);
  if (!rs) {
    const err = new Error('FRS tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  if (!(await isMahasiswaBimbinganDosen(dosenId, rs.mahasiswa_id))) {
    const err = new Error('Anda bukan dosen wali untuk FRS ini');
    err.statusCode = 403;
    throw err;
  }

  await assertPeriodeAktif(rs.periode_id);

  if (rs.status !== 'SUBMITTED') {
    const err = new Error(`FRS tidak bisa direvisi dari status ${rs.status}`);
    err.statusCode = 422;
    throw err;
  }

  await query(
    `UPDATE rencana_studi
     SET status = 'REJECTED', reviewed_at = NOW(), reviewed_by = $1,
         catatan_dosen = $2, updated_at = NOW()
     WHERE id = $3`,
    [dosenId, catatan, rsId],
  );

  return getRencanaStudiDetail(rsId);
}

/* ============================================================
 * MULTI-ROLE
 * ============================================================ */

// Detail FRS dengan items (dipakai oleh semua role yang berhak)
async function getRencanaStudiDetail(id) {
  const rs = await findRencanaStudiCore(id);
  if (!rs) return null;

  const [items, totalSks, mahasiswa] = await Promise.all([
    loadItems(id),
    getTotalSks(id),
    getMahasiswaProfile(rs.mahasiswa_id),
  ]);

  return {
    id: rs.id,
    mahasiswa: mahasiswa
      ? {
          id: mahasiswa.id,
          nim: mahasiswa.nim,
          nama: mahasiswa.nama,
          angkatan: mahasiswa.angkatan,
          ipk: mahasiswa.ipk == null ? null : Number(mahasiswa.ipk),
          ips_terakhir: mahasiswa.ips_terakhir == null ? null : Number(mahasiswa.ips_terakhir),
          total_sks_lulus: mahasiswa.total_sks_lulus,
          total_sks_wajib_lulus: mahasiswa.total_sks_wajib_lulus,
          total_sks_pilihan_lulus: mahasiswa.total_sks_pilihan_lulus,
        }
      : null,
    periode: { id: rs.periode_id, nama: rs.periode_nama },
    status: rs.status,
    total_sks: totalSks,
    catatan_dosen: rs.catatan_dosen,
    submitted_at: rs.submitted_at,
    reviewed_at: rs.reviewed_at,
    items,
  };
}

// Akses-aware getter untuk endpoint GET /:id
async function getRencanaStudiByIdForCaller(id, { callerRole, callerId }) {
  const rs = await findRencanaStudiCore(id);
  if (!rs) {
    const err = new Error('FRS tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  if (callerRole === 'mahasiswa') {
    if (rs.mahasiswa_id !== callerId) {
      const err = new Error('Anda tidak punya akses ke FRS ini');
      err.statusCode = 403;
      throw err;
    }
  } else if (callerRole === 'dosen_wali') {
    if (!(await isMahasiswaBimbinganDosen(callerId, rs.mahasiswa_id))) {
      const err = new Error('Anda bukan dosen wali untuk FRS ini');
      err.statusCode = 403;
      throw err;
    }
  }
  // kaprodi: boleh semua

  return getRencanaStudiDetail(id);
}

module.exports = {
  // mahasiswa
  getRencanaStudiSaya,
  listRiwayatSaya,
  createRencanaStudi,
  addItem,
  removeItem,
  submitRencanaStudi,
  // dosen
  listBimbinganFrs,
  getProfilMahasiswaBimbingan,
  listRiwayatMahasiswaBimbingan,
  setujuiRencanaStudi,
  revisiRencanaStudi,
  // multi-role
  getRencanaStudiByIdForCaller,
};
