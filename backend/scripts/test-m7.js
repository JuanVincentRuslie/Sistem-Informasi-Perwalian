/**
 * Test script Milestone 7 — Akademik & Pohon Kurikulum.
 * Usage: node scripts/test-m7.js
 *
 * Prereq:
 *  - Server jalan di port 4000
 *  - Seed: kaprodi, dosen wali, mahasiswa, master_matkul
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const jwt = require('jsonwebtoken');
const { pool } = require('../src/db/pool');
const { recalculateProfileCache } = require('../src/modules/akademik/akademik.service');

const BASE = 'http://localhost:4000';

function signToken(p) {
  return jwt.sign(p, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function api(method, url, { body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload = body;
  if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${url}`, { method, headers, body: payload });
  let data;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

function check(label, condition, detail = '') {
  const icon = condition ? '✓' : '✗';
  console.log(`  ${icon} ${label}${detail ? ' — ' + detail : ''}`);
  if (!condition) process.exitCode = 1;
}

async function getUser(email) {
  const res = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  return res.rows[0]?.id ?? null;
}

async function run() {
  console.log('\n=== Milestone 7 — Akademik & Pohon Kurikulum ===\n');

  // === Setup user IDs ===
  const kaprodiId = await getUser('kaprodi@unpar.ac.id');
  const dw01Id = await getUser('husnul.hakim@unpar.ac.id'); // dosen wali Mhs A
  const dw02Id = await getUser('yosef.ardi@unpar.ac.id');   // dosen wali lain
  const mhsAId = await getUser('6180000001@student.unpar.ac.id'); // bimbingan DW01
  if (!kaprodiId || !dw01Id || !dw02Id || !mhsAId) {
    console.error('Seed user belum lengkap. Jalankan seed:all dulu.');
    process.exit(1);
  }

  const tokenKaprodi = signToken({ id: kaprodiId, email: 'kaprodi@unpar.ac.id', role: 'kaprodi' });
  const tokenDW01 = signToken({ id: dw01Id, email: 'husnul.hakim@unpar.ac.id', role: 'dosen_wali' });
  const tokenDW02 = signToken({ id: dw02Id, email: 'yosef.ardi@unpar.ac.id', role: 'dosen_wali' });
  const tokenMhsA = signToken({ id: mhsAId, email: '6180000001@student.unpar.ac.id', role: 'mahasiswa' });

  // Periode untuk attach riwayat_nilai (boleh non-aktif, kita pakai existing yg lama)
  const ts = Date.now();
  const cp = await api('POST', '/api/v1/periode', {
    body: {
      nama: `M7 Riwayat ${ts}`,
      tahun_mulai: 2024, jenis: 'ganjil',
      tanggal_mulai: '2024-09-01', tanggal_selesai: '2025-01-31',
    },
    token: tokenKaprodi,
  });
  check('periode setup ok', cp.status === 201);
  const periodeId = cp.data?.data?.id;

  // === MASTER MATKUL ===
  console.log('\nGET /api/v1/master-matkul');
  const mlist = await api('GET', '/api/v1/master-matkul', { token: tokenMhsA });
  check('status 200', mlist.status === 200);
  check('data array', Array.isArray(mlist.data?.data));
  check('jumlah matkul ≥ 40', mlist.data?.data?.length >= 40, `count: ${mlist.data?.data?.length}`);
  const sampleMatkul = mlist.data.data.find((m) => m.kode_alias?.length > 0);
  check('sampel punya kode_alias', !!sampleMatkul, `sample: ${sampleMatkul?.kode_aktif}`);

  // Filter ?semester=1
  console.log('\nGET /api/v1/master-matkul?semester=1');
  const mlistSem1 = await api('GET', '/api/v1/master-matkul?semester=1', { token: tokenMhsA });
  check('status 200', mlistSem1.status === 200);
  check('semua semester=1', mlistSem1.data?.data?.every((m) => m.semester === 1));

  // GET /:id detail
  const matkulId = mlist.data.data[0].id;
  console.log(`\nGET /api/v1/master-matkul/${matkulId}`);
  const mdetail = await api('GET', `/api/v1/master-matkul/${matkulId}`, { token: tokenMhsA });
  check('status 200', mdetail.status === 200);
  check('punya prasyarat array', Array.isArray(mdetail.data?.data?.prasyarat));
  check('punya matkul_lanjutan array', Array.isArray(mdetail.data?.data?.matkul_lanjutan));

  // GET /edges
  console.log('\nGET /api/v1/master-matkul/edges');
  const medges = await api('GET', '/api/v1/master-matkul/edges', { token: tokenMhsA });
  check('status 200', medges.status === 200);
  check('edges ≥ 20', medges.data?.data?.length >= 20, `count: ${medges.data?.data?.length}`);
  if (medges.data?.data?.[0]) {
    check('edge punya source/target object', !!medges.data.data[0].source && !!medges.data.data[0].target);
    check('relation_type ada', !!medges.data.data[0].relation_type);
  }

  // === AKADEMIK SAYA (sebelum ada riwayat) ===

  console.log('\nGET /api/v1/akademik/saya/ringkasan');
  const ringkasan = await api('GET', '/api/v1/akademik/saya/ringkasan', { token: tokenMhsA });
  check('status 200', ringkasan.status === 200);
  check('field ipk ada', 'ipk' in (ringkasan.data?.data ?? {}));
  check('field periode_aktif ada', 'periode_aktif' in (ringkasan.data?.data ?? {}));

  console.log('\nGET /api/v1/akademik/saya/pohon-kurikulum (riwayat kosong)');
  const pohonKosong = await api('GET', '/api/v1/akademik/saya/pohon-kurikulum', { token: tokenMhsA });
  check('status 200', pohonKosong.status === 200,
    `status: ${pohonKosong.status} — body: ${JSON.stringify(pohonKosong.data).slice(0, 300)}`);
  if (pohonKosong.status !== 200) {
    console.error('STOP: pohon kurikulum gagal, lihat detail di atas');
    await pool.end(); process.exit(1);
  }
  check('punya nodes', Array.isArray(pohonKosong.data?.data?.nodes));
  check('punya edges', Array.isArray(pohonKosong.data?.data?.edges));
  check('semua node match=null', pohonKosong.data.data.nodes.every((n) => n.match === null));

  // === Insert dummy riwayat_nilai ===

  console.log('\nSetup: insert dummy riwayat_nilai untuk Mahasiswa A');
  // Bersihkan dulu kalau ada residue dari run sebelumnya
  await pool.query('DELETE FROM riwayat_nilai WHERE mahasiswa_id = $1', [mhsAId]);

  // 1. AIF231103 (kode_aktif) — LULUS 90
  // 2. AIF181107 (kode_alias dari AIF231105) — LULUS 85 (test alias match)
  // 3. AIF231101 (kode_aktif) — TIDAK_LULUS 50 (mengulang)
  // 4. AIF231101 (kode_aktif) — LULUS 80 (mengulang, harus pilih ini karena nilai_angka tertinggi)
  await pool.query(
    `INSERT INTO riwayat_nilai
       (mahasiswa_id, periode_id, kode_matkul, nama_matkul, sks, nilai_huruf, nilai_angka, status, sumber)
     VALUES
       ($1, $2, 'AIF231103', 'Dasar Pemrograman', 4, 'A', 90, 'LULUS', 'manual_input'),
       ($1, $2, 'AIF181107', 'Matematika Diskret', 4, 'A-', 85, 'LULUS', 'manual_input'),
       ($1, $2, 'AIF231101', 'Matematika Dasar', 4, 'E', 50, 'TIDAK_LULUS', 'manual_input')`,
    [mhsAId, periodeId],
  );
  // Mengulang AIF231101 di periode lain — buat periode kedua singkat
  const cp2 = await api('POST', '/api/v1/periode', {
    body: {
      nama: `M7 Riwayat 2 ${ts}`,
      tahun_mulai: 2025, jenis: 'genap',
      tanggal_mulai: '2025-02-01', tanggal_selesai: '2025-06-30',
    },
    token: tokenKaprodi,
  });
  const periode2Id = cp2.data?.data?.id;
  await pool.query(
    `INSERT INTO riwayat_nilai
       (mahasiswa_id, periode_id, kode_matkul, nama_matkul, sks, nilai_huruf, nilai_angka, status, sumber)
     VALUES ($1, $2, 'AIF231101', 'Matematika Dasar', 4, 'B', 80, 'LULUS', 'manual_input')`,
    [mhsAId, periode2Id],
  );

  // === GET /pohon dengan riwayat ===
  console.log('\nGET /api/v1/akademik/saya/pohon-kurikulum (dengan riwayat)');
  const pohon = await api('GET', '/api/v1/akademik/saya/pohon-kurikulum', { token: tokenMhsA });
  check('status 200', pohon.status === 200);

  const nodeAIF231103 = pohon.data.data.nodes.find((n) => n.kode_aktif === 'AIF231103');
  const nodeAIF231105 = pohon.data.data.nodes.find((n) => n.kode_aktif === 'AIF231105'); // alias matching
  const nodeAIF231101 = pohon.data.data.nodes.find((n) => n.kode_aktif === 'AIF231101'); // mengulang

  check('AIF231103 match LULUS', nodeAIF231103?.match?.status === 'LULUS');
  check('AIF231103 nilai_angka 90', Number(nodeAIF231103?.match?.nilai_angka) === 90);
  check('AIF231105 match via kode_alias (AIF181107)', nodeAIF231105?.match?.status === 'LULUS',
    `match: ${JSON.stringify(nodeAIF231105?.match)}`);
  check('AIF231101 (mengulang) ambil nilai TERTINGGI 80',
    Number(nodeAIF231101?.match?.nilai_angka) === 80,
    `nilai: ${nodeAIF231101?.match?.nilai_angka}`);
  check('AIF231101 status LULUS (bukan TIDAK_LULUS)',
    nodeAIF231101?.match?.status === 'LULUS');

  // === Recalculate cache ===
  console.log('\nrecalculateProfileCache(mahasiswaA)');
  const cache = await recalculateProfileCache(mhsAId);
  console.log('  → result:', cache);
  check('total_sks_lulus 12 (4+4+4)', cache.total_sks_lulus === 12, `got: ${cache.total_sks_lulus}`);
  check('total_sks_wajib_lulus 12 (semua wajib)', cache.total_sks_wajib_lulus === 12);
  check('ipk > 0', cache.ipk > 0);
  check('ipk dalam skala 4', cache.ipk <= 4);

  // GET /ringkasan setelah recalc → harusnya angka match
  const ringkasanAfter = await api('GET', '/api/v1/akademik/saya/ringkasan', { token: tokenMhsA });
  check('ringkasan.total_sks_lulus terupdate', ringkasanAfter.data?.data?.total_sks_lulus === 12);
  check('ringkasan.ipk terupdate', Number(ringkasanAfter.data?.data?.ipk) === Number(cache.ipk));

  // === AKSES DOSEN WALI / KAPRODI ===

  console.log(`\nGET /api/v1/akademik/mahasiswa/${mhsAId}/ringkasan (DW01)`);
  const ringkasanDW01 = await api('GET', `/api/v1/akademik/mahasiswa/${mhsAId}/ringkasan`, { token: tokenDW01 });
  check('status 200', ringkasanDW01.status === 200);
  check('ipk match dengan recalc', Number(ringkasanDW01.data?.data?.ipk) === Number(cache.ipk));

  console.log('GET ... (DW02 yang bukan walinya → 403)');
  const ringkasanDW02 = await api('GET', `/api/v1/akademik/mahasiswa/${mhsAId}/ringkasan`, { token: tokenDW02 });
  check('status 403', ringkasanDW02.status === 403);

  console.log('GET ... (kaprodi → 200)');
  const ringkasanKaprodi = await api('GET', `/api/v1/akademik/mahasiswa/${mhsAId}/ringkasan`, { token: tokenKaprodi });
  check('status 200', ringkasanKaprodi.status === 200);

  console.log(`\nGET /api/v1/akademik/mahasiswa/${mhsAId}/pohon-kurikulum (DW01)`);
  const pohonDW01 = await api('GET', `/api/v1/akademik/mahasiswa/${mhsAId}/pohon-kurikulum`, { token: tokenDW01 });
  check('status 200', pohonDW01.status === 200);
  check('node match konsisten dengan request mahasiswa',
    pohonDW01.data.data.nodes.find((n) => n.kode_aktif === 'AIF231103')?.match?.nilai_angka == 90);

  // Mahasiswa coba akses /mahasiswa/:id/... → 403 (bukan rolenya)
  console.log('\nGET /mahasiswa/:id/... sebagai mahasiswa → 403');
  const mhsCoba = await api('GET', `/api/v1/akademik/mahasiswa/${mhsAId}/ringkasan`, { token: tokenMhsA });
  check('status 403', mhsCoba.status === 403);

  // === CLEANUP ===
  console.log('\nCleanup');
  await pool.query('DELETE FROM riwayat_nilai WHERE mahasiswa_id = $1', [mhsAId]);
  await pool.query(
    `UPDATE profile_mahasiswa
     SET ipk = 3.31, ips_terakhir = NULL,
         total_sks_lulus = 0, total_sks_wajib_lulus = 0, total_sks_pilihan_lulus = 0,
         cache_updated_at = NULL
     WHERE user_id = $1`,
    [mhsAId],
  );
  await pool.query('DELETE FROM periode WHERE id IN ($1, $2)', [periodeId, periode2Id]);

  console.log(`\n${process.exitCode ? '❌ Ada test yang gagal' : '✅ Semua test lulus'}\n`);
  await pool.end();
}

run().catch(async (err) => {
  console.error('Test error:', err.message);
  console.error(err.stack);
  await pool.end().catch(() => {});
  process.exit(1);
});
