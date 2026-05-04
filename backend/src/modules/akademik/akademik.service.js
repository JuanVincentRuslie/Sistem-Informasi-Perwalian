const { query } = require('../../db/pool');

/* ============================================================
 * Internal helpers
 * ============================================================ */

async function findPeriodeAktif() {
  const res = await query(
    `SELECT id, nama, tanggal_mulai, tanggal_selesai
     FROM periode
     WHERE is_active = TRUE AND tanggal_selesai >= CURRENT_DATE
     LIMIT 1`,
  );
  return res.rows[0] ?? null;
}

async function getMahasiswaProfil(userId) {
  const res = await query(
    `SELECT u.id, u.nama, u.email,
            pm.nim, pm.angkatan,
            pm.ipk, pm.ips_terakhir,
            pm.total_sks_lulus, pm.total_sks_wajib_lulus, pm.total_sks_pilihan_lulus,
            pm.dosen_wali_id
     FROM users u
     JOIN profile_mahasiswa pm ON pm.user_id = u.id
     WHERE u.id = $1 AND u.is_active = TRUE`,
    [userId],
  );
  return res.rows[0] ?? null;
}

async function getDosenWaliBrief(dosenId) {
  if (!dosenId) return null;
  const res = await query(
    `SELECT u.id, u.nama, u.email, pd.jadwal_perwalian
     FROM users u
     JOIN profile_dosen pd ON pd.user_id = u.id
     WHERE u.id = $1`,
    [dosenId],
  );
  return res.rows[0] ?? null;
}

async function isMahasiswaBimbinganDosen(dosenId, mahasiswaId) {
  const res = await query(
    `SELECT user_id FROM profile_mahasiswa WHERE user_id = $1 AND dosen_wali_id = $2`,
    [mahasiswaId, dosenId],
  );
  return res.rows.length > 0;
}

async function getRencanaStudiStatusForActivePeriod(mahasiswaId, periodeAktifId) {
  if (!periodeAktifId) return null;
  const res = await query(
    `SELECT status FROM rencana_studi WHERE mahasiswa_id = $1 AND periode_id = $2`,
    [mahasiswaId, periodeAktifId],
  );
  return res.rows[0]?.status ?? null;
}

/* ============================================================
 * Public: Ringkasan akademik (dashboard data)
 * ============================================================ */

async function getRingkasanAkademik(mahasiswaId) {
  const profile = await getMahasiswaProfil(mahasiswaId);
  if (!profile) {
    const err = new Error('Mahasiswa tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const periodeAktif = await findPeriodeAktif();
  const dosenWali = await getDosenWaliBrief(profile.dosen_wali_id);
  const rencanaStudiStatus = await getRencanaStudiStatusForActivePeriod(mahasiswaId, periodeAktif?.id);

  return {
    ipk: profile.ipk == null ? null : Number(profile.ipk),
    ips_terakhir: profile.ips_terakhir == null ? null : Number(profile.ips_terakhir),
    total_sks_lulus: profile.total_sks_lulus,
    total_sks_wajib_lulus: profile.total_sks_wajib_lulus,
    total_sks_pilihan_lulus: profile.total_sks_pilihan_lulus,
    periode_aktif: periodeAktif
      ? {
          id: periodeAktif.id,
          nama: periodeAktif.nama,
          tanggal_mulai: periodeAktif.tanggal_mulai,
          tanggal_selesai: periodeAktif.tanggal_selesai,
        }
      : null,
    dosen_wali: dosenWali,
    rencana_studi_status: rencanaStudiStatus,
  };
}

/* ============================================================
 * Public: Pohon kurikulum
 * ============================================================
 * Algoritma matching:
 *   1. Ambil semua master_matkul (= node)
 *   2. Ambil semua riwayat_nilai mahasiswa (sumber match)
 *   3. Untuk tiap node:
 *      - Cari riwayat_nilai yang kode_matkul-nya match ke kode_aktif
 *        ATAU salah satu kode_alias
 *      - Kalau ada beberapa match (mahasiswa mengulang), pilih yang
 *        nilai_angka tertinggi (per Q1 — aturan prodi)
 *      - Build node.match dari nilai terpilih
 *      - Kalau tidak ada match → node.match = null
 */
async function getPohonKurikulum(mahasiswaId) {
  // Pastikan mahasiswa ada
  const profile = await getMahasiswaProfil(mahasiswaId);
  if (!profile) {
    const err = new Error('Mahasiswa tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const [matkulRes, nilaiRes, edgeRes] = await Promise.all([
    query(`SELECT id, kode_aktif, kode_alias, nama, sks, semester, kolom, tipe FROM master_matkul`),
    query(
      `SELECT kode_matkul, nilai_huruf, nilai_angka, status
       FROM riwayat_nilai
       WHERE mahasiswa_id = $1`,
      [mahasiswaId],
    ),
    query(`SELECT id, source_id, target_id, relation_type FROM master_matkul_edge`),
  ]);

  // Index riwayat_nilai by kode_matkul untuk lookup cepat (case-insensitive)
  const nilaiByKode = new Map();
  for (const n of nilaiRes.rows) {
    const kode = n.kode_matkul.toUpperCase();
    if (!nilaiByKode.has(kode)) nilaiByKode.set(kode, []);
    nilaiByKode.get(kode).push(n);
  }

  function pickBestMatch(node) {
    const candidateKodes = [node.kode_aktif, ...(node.kode_alias ?? [])]
      .filter(Boolean)
      .map((k) => k.toUpperCase());

    let allMatches = [];
    for (const kode of candidateKodes) {
      const list = nilaiByKode.get(kode);
      if (list) allMatches = allMatches.concat(list);
    }

    if (allMatches.length === 0) return null;

    // Per Q1: pilih nilai_angka tertinggi
    const best = allMatches.reduce((acc, cur) => {
      const accVal = acc.nilai_angka == null ? -Infinity : Number(acc.nilai_angka);
      const curVal = cur.nilai_angka == null ? -Infinity : Number(cur.nilai_angka);
      return curVal > accVal ? cur : acc;
    });

    return {
      status: best.status,
      nilai_huruf: best.nilai_huruf,
      nilai_angka: best.nilai_angka == null ? null : Number(best.nilai_angka),
    };
  }

  const nodes = matkulRes.rows.map((m) => ({
    id: m.id,
    kode_aktif: m.kode_aktif,
    kode_alias: m.kode_alias ?? [],
    nama: m.nama,
    sks: m.sks,
    semester: m.semester,
    kolom: m.kolom,
    tipe: m.tipe,
    match: pickBestMatch(m),
  }));

  const edges = edgeRes.rows.map((e) => ({
    id: e.id,
    source_id: e.source_id,
    target_id: e.target_id,
    relation_type: e.relation_type,
  }));

  return {
    nodes,
    edges,
    summary: {
      total_sks_lulus: profile.total_sks_lulus,
      ipk: profile.ipk == null ? null : Number(profile.ipk),
      ips_terakhir: profile.ips_terakhir == null ? null : Number(profile.ips_terakhir),
    },
  };
}

/* ============================================================
 * Akses-aware wrappers untuk endpoint dosen wali / kaprodi
 * ============================================================ */

async function assertCanAccessMahasiswa({ callerRole, callerId, mahasiswaId }) {
  if (callerRole === 'kaprodi') return; // boleh semua
  if (callerRole === 'dosen_wali') {
    if (!(await isMahasiswaBimbinganDosen(callerId, mahasiswaId))) {
      const err = new Error('Anda bukan dosen wali mahasiswa ini');
      err.statusCode = 403;
      throw err;
    }
    return;
  }
  if (callerRole === 'mahasiswa') {
    if (callerId !== mahasiswaId && String(callerId) !== String(mahasiswaId)) {
      const err = new Error('Anda tidak punya akses ke data mahasiswa lain');
      err.statusCode = 403;
      throw err;
    }
    return;
  }
  const err = new Error('Akses ditolak');
  err.statusCode = 403;
  throw err;
}

async function getRingkasanForCaller({ callerRole, callerId, mahasiswaId }) {
  await assertCanAccessMahasiswa({ callerRole, callerId, mahasiswaId });
  return getRingkasanAkademik(mahasiswaId);
}

async function getPohonForCaller({ callerRole, callerId, mahasiswaId }) {
  await assertCanAccessMahasiswa({ callerRole, callerId, mahasiswaId });
  return getPohonKurikulum(mahasiswaId);
}

/* ============================================================
 * Recalculate cache profile_mahasiswa
 * ============================================================
 * Dipanggil dari M8 (DPS upload / manual edit nilai) untuk
 * update kolom denormalized di profile_mahasiswa.
 *
 * Strategi:
 *   - total_sks_lulus           = SUM(rn.sks) WHERE status=LULUS
 *   - total_sks_wajib_lulus     = SUM via match ke master_matkul WHERE tipe=wajib
 *   - total_sks_pilihan_lulus   = SUM via match ke master_matkul WHERE tipe=pilihan
 *   - ipk                       = SUM(nilai_angka * sks) / SUM(sks)
 *                                 untuk SEMUA matkul (lulus + tidak lulus, pilih nilai_angka tertinggi per kode)
 *   - ips_terakhir              = IPK dari periode terakhir mahasiswa upload nilai
 *
 * Catatan: implementasi GPA pakai nilai_angka langsung (asumsi 0-100,
 * lalu dikonversi ke skala 4 dengan /25). Saat ada bobot resmi prodi,
 * tinggal ubah formula di sini.
 */
async function recalculateProfileCache(mahasiswaId) {
  // Ambil semua riwayat nilai + tipe matkul (via master_matkul match)
  const nilaiRes = await query(
    `SELECT rn.kode_matkul, rn.nama_matkul, rn.sks, rn.nilai_angka, rn.status,
            rn.periode_id, p.tanggal_mulai AS periode_tanggal_mulai,
            mm.tipe AS matkul_tipe
     FROM riwayat_nilai rn
     LEFT JOIN periode p ON p.id = rn.periode_id
     LEFT JOIN master_matkul mm
       ON mm.kode_aktif = rn.kode_matkul OR rn.kode_matkul = ANY(mm.kode_alias)
     WHERE rn.mahasiswa_id = $1`,
    [mahasiswaId],
  );

  const rows = nilaiRes.rows;

  // Dedup per kode_matkul: ambil nilai_angka tertinggi (Q1)
  const bestByKode = new Map();
  for (const r of rows) {
    const k = r.kode_matkul.toUpperCase();
    const cur = bestByKode.get(k);
    const curVal = cur?.nilai_angka == null ? -Infinity : Number(cur.nilai_angka);
    const newVal = r.nilai_angka == null ? -Infinity : Number(r.nilai_angka);
    if (!cur || newVal > curVal) bestByKode.set(k, r);
  }
  const bestRows = [...bestByKode.values()];

  // Total SKS lulus (pakai nilai terbaik)
  const lulusRows = bestRows.filter((r) => r.status === 'LULUS');
  const totalSksLulus = lulusRows.reduce((acc, r) => acc + Number(r.sks ?? 0), 0);
  const totalSksWajibLulus = lulusRows
    .filter((r) => r.matkul_tipe === 'wajib')
    .reduce((acc, r) => acc + Number(r.sks ?? 0), 0);
  const totalSksPilihanLulus = lulusRows
    .filter((r) => r.matkul_tipe === 'pilihan')
    .reduce((acc, r) => acc + Number(r.sks ?? 0), 0);

  // IPK: weighted average dari nilai terbaik (skala 4 dari nilai_angka/25)
  let ipk = null;
  const sksDenom = bestRows.reduce((acc, r) => acc + Number(r.sks ?? 0), 0);
  if (sksDenom > 0) {
    const gpaWeighted = bestRows.reduce(
      (acc, r) => acc + (Number(r.nilai_angka ?? 0) / 25) * Number(r.sks ?? 0),
      0,
    );
    ipk = Number((gpaWeighted / sksDenom).toFixed(2));
  }

  // IPS terakhir: IPK untuk periode dengan tanggal_mulai terbaru
  let ipsTerakhir = null;
  if (rows.length > 0) {
    const periodeTerakhirIds = rows
      .filter((r) => r.periode_tanggal_mulai)
      .sort((a, b) => new Date(b.periode_tanggal_mulai) - new Date(a.periode_tanggal_mulai));
    const periodeTerakhir = periodeTerakhirIds[0]?.periode_id;

    if (periodeTerakhir) {
      const periodRows = rows.filter((r) => r.periode_id === periodeTerakhir);
      const sksDenomP = periodRows.reduce((acc, r) => acc + Number(r.sks ?? 0), 0);
      if (sksDenomP > 0) {
        const gpaP = periodRows.reduce(
          (acc, r) => acc + (Number(r.nilai_angka ?? 0) / 25) * Number(r.sks ?? 0),
          0,
        );
        ipsTerakhir = Number((gpaP / sksDenomP).toFixed(2));
      }
    }
  }

  await query(
    `UPDATE profile_mahasiswa
     SET ipk = $1, ips_terakhir = $2,
         total_sks_lulus = $3, total_sks_wajib_lulus = $4, total_sks_pilihan_lulus = $5,
         cache_updated_at = NOW(), updated_at = NOW()
     WHERE user_id = $6`,
    [ipk, ipsTerakhir, totalSksLulus, totalSksWajibLulus, totalSksPilihanLulus, mahasiswaId],
  );

  return {
    ipk, ips_terakhir: ipsTerakhir,
    total_sks_lulus: totalSksLulus,
    total_sks_wajib_lulus: totalSksWajibLulus,
    total_sks_pilihan_lulus: totalSksPilihanLulus,
  };
}

/* ============================================================
 * Apply academic snapshot dari parser DPS
 * ============================================================
 * Dipanggil dari M8 saat upload DPS confirm. Tidak hitung dari
 * riwayat_nilai — langsung overwrite cache profile_mahasiswa
 * dengan angka yang sudah dihitung kampus (parser.academic.*).
 *
 * Param `academic` shape:
 *   { ipk: { nilai }, ips: { nilai }, sks: { totalLulus, lulusWajib, lulusPilihan } }
 * Field yang null/missing → biarkan kolom DB tidak terupdate.
 */
async function applyAcademicSnapshot(mahasiswaId, academic) {
  if (!academic || typeof academic !== 'object') {
    throw new Error('applyAcademicSnapshot: academic data wajib');
  }

  const ipk = academic.ipk?.nilai != null ? Number(academic.ipk.nilai) : null;
  const ips = academic.ips?.nilai != null ? Number(academic.ips.nilai) : null;
  const totalLulus = academic.sks?.totalLulus != null ? Number(academic.sks.totalLulus) : null;
  const wajibLulus = academic.sks?.lulusWajib != null ? Number(academic.sks.lulusWajib) : null;
  const pilihanLulus = academic.sks?.lulusPilihan != null ? Number(academic.sks.lulusPilihan) : null;

  await query(
    `UPDATE profile_mahasiswa
     SET ipk = COALESCE($1, ipk),
         ips_terakhir = COALESCE($2, ips_terakhir),
         total_sks_lulus = COALESCE($3, total_sks_lulus),
         total_sks_wajib_lulus = COALESCE($4, total_sks_wajib_lulus),
         total_sks_pilihan_lulus = COALESCE($5, total_sks_pilihan_lulus),
         cache_updated_at = NOW(),
         updated_at = NOW()
     WHERE user_id = $6`,
    [ipk, ips, totalLulus, wajibLulus, pilihanLulus, mahasiswaId],
  );

  return {
    ipk, ips_terakhir: ips,
    total_sks_lulus: totalLulus,
    total_sks_wajib_lulus: wajibLulus,
    total_sks_pilihan_lulus: pilihanLulus,
  };
}

module.exports = {
  // dashboard / pohon untuk mahasiswa sendiri
  getRingkasanAkademik,
  getPohonKurikulum,
  // akses-aware
  getRingkasanForCaller,
  getPohonForCaller,
  // dipakai dari M8 — manual entry / fallback compute dari riwayat_nilai
  recalculateProfileCache,
  // dipakai dari M8 — DPS upload confirm (snapshot dari parser)
  applyAcademicSnapshot,
};
