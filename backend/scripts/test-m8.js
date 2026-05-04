/**
 * Test script Milestone 8 — Riwayat Nilai / DPS Upload.
 * Usage: node scripts/test-m8.js
 *
 * Prereq:
 *  - Server jalan di port 4000
 *  - Seed: kaprodi, dosen wali, mahasiswa, master_matkul, periode-dummy
 *  - File DPS sample ada di parser_for_backend/Dps_parser/DPS_6182201039.pdf
 */
const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const jwt = require('jsonwebtoken');
const { pool } = require('../src/db/pool');

const BASE = 'http://localhost:4000';
const SAMPLE_PDF = path.resolve(__dirname, '../../parser_for_backend/Dps_parser/DPS_6182201039.pdf');

function signToken(p) {
  return jwt.sign(p, process.env.JWT_SECRET, { expiresIn: '1h' });
}

async function api(method, url, { body, token, isForm } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload = body;
  if (body && !isForm) {
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
  console.log('\n=== Milestone 8 — Riwayat Nilai / DPS Upload ===\n');

  // Setup user IDs
  const dw01Id = await getUser('husnul.hakim@unpar.ac.id');
  const dw02Id = await getUser('yosef.ardi@unpar.ac.id');
  const mhsAId = await getUser('6180000001@student.unpar.ac.id');
  const kaprodiId = await getUser('kaprodi@unpar.ac.id');
  if (!dw01Id || !dw02Id || !mhsAId || !kaprodiId) {
    console.error('Seed user belum lengkap. Jalankan seed:all dulu.');
    process.exit(1);
  }

  const tokenMhsA = signToken({ id: mhsAId, email: '6180000001@student.unpar.ac.id', role: 'mahasiswa' });
  const tokenDW01 = signToken({ id: dw01Id, email: 'husnul.hakim@unpar.ac.id', role: 'dosen_wali' });
  const tokenDW02 = signToken({ id: dw02Id, email: 'yosef.ardi@unpar.ac.id', role: 'dosen_wali' });
  const tokenKaprodi = signToken({ id: kaprodiId, email: 'kaprodi@unpar.ac.id', role: 'kaprodi' });

  // Cek periode dummy ada
  const pd = await pool.query("SELECT id FROM periode WHERE nama = 'Riwayat DPS'");
  check('periode dummy "Riwayat DPS" ada', pd.rows.length > 0);
  if (pd.rows.length === 0) {
    console.error('STOP: jalankan dulu `npm run seed:periode-dummy`');
    await pool.end(); process.exit(1);
  }

  // Bersihkan dulu kalau ada residue
  await pool.query('DELETE FROM riwayat_nilai WHERE mahasiswa_id = $1', [mhsAId]);

  // === 1. GET /saya saat kosong ===
  console.log('\nGET /api/v1/riwayat-nilai/saya (kosong)');
  const empty = await api('GET', '/api/v1/riwayat-nilai/saya', { token: tokenMhsA });
  check('status 200', empty.status === 200);
  check('data kosong', Array.isArray(empty.data?.data) && empty.data.data.length === 0);

  // === 2. POST /upload-dps tanpa file ===
  console.log('\nPOST /upload-dps tanpa file → 400');
  const noFile = await api('POST', '/api/v1/riwayat-nilai/upload-dps', {
    body: new FormData(), token: tokenMhsA, isForm: true,
  });
  check('status 400', noFile.status === 400);

  // === 3. POST /upload-dps dengan PDF sample ===
  console.log('\nPOST /upload-dps (PDF sample)');
  const pdfBuf = await fs.readFile(SAMPLE_PDF);
  const form = new FormData();
  form.append('file', new Blob([pdfBuf], { type: 'application/pdf' }), 'DPS.pdf');
  const upload = await api('POST', '/api/v1/riwayat-nilai/upload-dps', {
    body: form, token: tokenMhsA, isForm: true,
  });
  check('status 200', upload.status === 200, `status: ${upload.status} — ${upload.data?.message}`);
  check('punya upload_token', !!upload.data?.data?.upload_token);
  check('punya preview array', Array.isArray(upload.data?.data?.preview));
  check('punya summary', !!upload.data?.data?.summary);
  check('punya academic dari parser', !!upload.data?.data?.academic);
  check('summary.ipk_terhitung dari parser (bukan compute lokal)',
    upload.data?.data?.summary?.ipk_terhitung != null);
  check('profile.npm dari PDF', !!upload.data?.data?.profile?.npm);
  const previewCount = upload.data?.data?.preview?.length;
  console.log(`  → preview: ${previewCount} matkul`);
  console.log(`  → academic.ipk: ${JSON.stringify(upload.data?.data?.academic?.ipk)}`);
  console.log(`  → academic.ips: ${JSON.stringify(upload.data?.data?.academic?.ips)}`);
  console.log(`  → academic.sks.totalLulus: ${upload.data?.data?.academic?.sks?.totalLulus}`);

  // Cek setidaknya beberapa preview punya sks dari master_matkul
  const sksMatched = upload.data?.data?.preview?.filter((p) => p.sks_from_master).length ?? 0;
  check('setidaknya beberapa sks lookup match', sksMatched > 0,
    `matched: ${sksMatched}/${previewCount}`);

  const uploadToken = upload.data?.data?.upload_token;

  // === 4. POST /upload-dps/confirm ===
  console.log('\nPOST /upload-dps/confirm');
  const confirm = await api('POST', '/api/v1/riwayat-nilai/upload-dps/confirm', {
    body: { upload_token: uploadToken, mode: 'replace' },
    token: tokenMhsA,
  });
  check('status 200', confirm.status === 200, `status: ${confirm.status} — ${confirm.data?.message}`);
  check('inserted_count > 0', confirm.data?.data?.inserted_count > 0);
  check('cache.ipk dari parser', confirm.data?.data?.cache?.ipk != null);
  check('cache.total_sks_lulus dari parser', confirm.data?.data?.cache?.total_sks_lulus != null);
  console.log(`  → inserted: ${confirm.data?.data?.inserted_count}`);
  console.log(`  → cache: ${JSON.stringify(confirm.data?.data?.cache)}`);

  // === 5. Verify riwayat_nilai tersimpan ===
  console.log('\nGET /saya (setelah confirm)');
  const after = await api('GET', '/api/v1/riwayat-nilai/saya', { token: tokenMhsA });
  check('status 200', after.status === 200);
  check('jumlah row sesuai inserted_count',
    after.data?.data?.length === confirm.data?.data?.inserted_count);

  // === 6. Verify ringkasan akademik ter-update ===
  console.log('\nGET /akademik/saya/ringkasan (cek cache ter-update)');
  const ringkasan = await api('GET', '/api/v1/akademik/saya/ringkasan', { token: tokenMhsA });
  check('ipk = parser ipk',
    Number(ringkasan.data?.data?.ipk) === Number(upload.data?.data?.academic?.ipk?.nilai));
  check('total_sks_lulus = parser totalLulus',
    ringkasan.data?.data?.total_sks_lulus === upload.data?.data?.academic?.sks?.totalLulus);

  // === 7. Verify pohon kurikulum punya warna ===
  console.log('\nGET /akademik/saya/pohon-kurikulum (cek warna)');
  const pohon = await api('GET', '/api/v1/akademik/saya/pohon-kurikulum', { token: tokenMhsA });
  const matched = pohon.data?.data?.nodes?.filter((n) => n.match !== null).length ?? 0;
  check('ada node yang match (warna)', matched > 0, `match: ${matched} nodes`);
  // Pastikan juga matching alias jalan — kode "AIF181107" di DPS = alias dari "AIF231105"
  const aif231105 = pohon.data?.data?.nodes?.find((n) => n.kode_aktif === 'AIF231105');
  check('AIF231105 match via alias AIF181107', aif231105?.match?.status === 'LULUS',
    `match: ${JSON.stringify(aif231105?.match)}`);

  // === 8. Confirm token ulang → 410 ===
  console.log('\nPOST /upload-dps/confirm pakai token bekas → 410');
  const dupConfirm = await api('POST', '/api/v1/riwayat-nilai/upload-dps/confirm', {
    body: { upload_token: uploadToken, mode: 'replace' },
    token: tokenMhsA,
  });
  check('status 410', dupConfirm.status === 410);

  // === 9. Akses dosen wali / kaprodi ===
  console.log(`\nGET /mahasiswa/${mhsAId} (DW01 → 200)`);
  const byDosen = await api('GET', `/api/v1/riwayat-nilai/mahasiswa/${mhsAId}`, { token: tokenDW01 });
  check('status 200', byDosen.status === 200);
  check('data ada', byDosen.data?.data?.length > 0);

  console.log(`GET /mahasiswa/${mhsAId} (DW02 bukan walinya → 403)`);
  const byDosenLain = await api('GET', `/api/v1/riwayat-nilai/mahasiswa/${mhsAId}`, { token: tokenDW02 });
  check('status 403', byDosenLain.status === 403);

  console.log(`GET /mahasiswa/${mhsAId} (kaprodi → 200)`);
  const byKaprodi = await api('GET', `/api/v1/riwayat-nilai/mahasiswa/${mhsAId}`, { token: tokenKaprodi });
  check('status 200', byKaprodi.status === 200);

  // === 10. Mahasiswa lain coba akses /mahasiswa/:id → 403 ===
  console.log('\nGET /mahasiswa/:id sebagai mahasiswa → 403');
  const mhsCoba = await api('GET', `/api/v1/riwayat-nilai/mahasiswa/${mhsAId}`, { token: tokenMhsA });
  check('status 403', mhsCoba.status === 403);

  // === 11. Manual entry endpoint ===
  console.log('\nPOST /manual (input manual)');
  // Buat periode test untuk manual entry
  const testPeriode = await pool.query(
    `INSERT INTO periode (nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai, is_active)
     VALUES ($1, 2020, 'ganjil', '2020-09-01', '2021-01-31', FALSE)
     RETURNING id`,
    [`M8 Manual ${Date.now()}`],
  );
  const manualPeriodeId = testPeriode.rows[0].id;
  const manual = await api('POST', '/api/v1/riwayat-nilai/manual', {
    body: {
      items: [
        {
          kode_matkul: 'TEST001',
          nama_matkul: 'Matkul Test Manual',
          sks: 3,
          periode_id: manualPeriodeId,
          nilai_huruf: 'A',
          status: 'LULUS',
        },
      ],
    },
    token: tokenMhsA,
  });
  check('status 200', manual.status === 200, `status: ${manual.status} — ${manual.data?.message}`);
  check('upserted_count = 1', manual.data?.data?.upserted_count === 1);

  // === Cleanup ===
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
  await pool.query('DELETE FROM periode WHERE id = $1', [manualPeriodeId]);

  console.log(`\n${process.exitCode ? '❌ Ada test yang gagal' : '✅ Semua test lulus'}\n`);
  await pool.end();
}

run().catch(async (err) => {
  console.error('Test error:', err.message);
  console.error(err.stack);
  await pool.end().catch(() => {});
  process.exit(1);
});
