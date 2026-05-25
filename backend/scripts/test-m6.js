/**
 * Test script Milestone 6 — Core Rencana Studi Flow.
 * Usage: node scripts/test-m6.js
 *
 * Prereq:
 *  - Server jalan di port 4000
 *  - DB sudah ter-migrate dan ter-seed (kaprodi, dosen wali, mahasiswa, master_matkul)
 */
const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const jwt = require('jsonwebtoken');
const { pool } = require('../src/db/pool');

const BASE = 'http://localhost:4000';
const TEMPLATE_XLSX = path.resolve(
  __dirname,
  '../../parser_for_backend/Jadwal_excel_parser/Template_jadwal_kelas.xlsx',
);

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
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

async function getUserIdByEmail(email) {
  const res = await pool.query('SELECT id, role FROM users WHERE email = $1', [email]);
  return res.rows[0] ?? null;
}

async function run() {
  console.log('\n=== Milestone 6 — Core Rencana Studi Flow ===\n');

  // === Setup: cari user IDs dari seed ===
  const kaprodi = await getUserIdByEmail('kaprodi@unpar.ac.id');
  const dosenDW01 = await getUserIdByEmail('husnul.hakim@unpar.ac.id');
  const dosenDW02 = await getUserIdByEmail('yosef.ardi@unpar.ac.id');
  const mahasiswaA = await getUserIdByEmail('6180000001@student.unpar.ac.id'); // bimbingan DW01
  const mahasiswaC = await getUserIdByEmail('6180000003@student.unpar.ac.id'); // unassigned
  if (!kaprodi || !dosenDW01 || !dosenDW02 || !mahasiswaA) {
    console.error('Seed user tidak lengkap. Pastikan seed:all sudah dijalankan.');
    process.exit(1);
  }

  const tokenKaprodi = signToken({ id: kaprodi.id, email: 'kaprodi@unpar.ac.id', role: 'kaprodi' });
  const tokenDW01 = signToken({ id: dosenDW01.id, email: 'husnul.hakim@unpar.ac.id', role: 'dosen_wali' });
  const tokenDW02 = signToken({ id: dosenDW02.id, email: 'yosef.ardi@unpar.ac.id', role: 'dosen_wali' });
  const tokenMhsA = signToken({ id: mahasiswaA.id, email: '6180000001@student.unpar.ac.id', role: 'mahasiswa' });
  const tokenMhsC = mahasiswaC ? signToken({ id: mahasiswaC.id, email: '6180000003@student.unpar.ac.id', role: 'mahasiswa' }) : null;

  // === Setup: buat periode aktif + upload kelas ===
  const ts = Date.now();
  console.log('Setup: buat periode aktif baru');
  const cp = await api('POST', '/api/v1/periode', {
    body: {
      nama: `Test M6 ${ts}`,
      tahun_mulai: 2026, jenis: 'ganjil',
      tanggal_mulai: '2026-04-01', tanggal_selesai: '2099-12-31',
    },
    token: tokenKaprodi,
  });
  check('periode dibuat', cp.status === 201, `status: ${cp.status}`);
  const periodeId = cp.data?.data?.id;

  console.log('Setup: upload kelas dari template Excel');
  const fileBuf = await fs.readFile(TEMPLATE_XLSX);
  const form = new FormData();
  form.append('file', new Blob([fileBuf]), 'tpl.xlsx');
  form.append('periode_id', String(periodeId));
  const up = await api('POST', '/api/v1/kelas/upload', { body: form, token: tokenKaprodi, isForm: true });
  check('upload preview ok', up.status === 200);
  await api('POST', '/api/v1/kelas/upload/confirm', {
    body: { upload_token: up.data.data.upload_token, mode: 'replace' },
    token: tokenKaprodi,
  });
  const listKelas = await api('GET', `/api/v1/kelas?periode_id=${periodeId}`, { token: tokenKaprodi });
  const kelas1 = listKelas.data.data[0];
  const kelas2 = listKelas.data.data[1];
  const kelas3 = listKelas.data.data[2];
  check('ada minimal 3 kelas untuk test', !!kelas1 && !!kelas2 && !!kelas3,
    `count: ${listKelas.data?.data?.length}`);

  // ============ MAHASISWA-SIDE FLOW ============

  // 1. GET /saya sebelum FRS dibuat → 404
  console.log('\nGET /saya (sebelum FRS dibuat → 404)');
  const sayaBefore = await api('GET', '/api/v1/rencana-studi/saya', { token: tokenMhsA });
  check('status 404', sayaBefore.status === 404, `status: ${sayaBefore.status}`);

  // 2. POST / (create FRS)
  console.log('\nPOST /api/v1/rencana-studi (create FRS DRAFT)');
  const create1 = await api('POST', '/api/v1/rencana-studi', {
    body: { periode_id: periodeId },
    token: tokenMhsA,
  });
  check('status 201', create1.status === 201, `status: ${create1.status} — ${create1.data?.message}`);
  check('status DRAFT', create1.data?.data?.status === 'DRAFT');
  check('items kosong', create1.data?.data?.items?.length === 0);
  const rsId = create1.data?.data?.id;

  // 3. POST / lagi → 409 (sudah ada)
  console.log('\nPOST /api/v1/rencana-studi (duplikat → 409)');
  const dup = await api('POST', '/api/v1/rencana-studi', {
    body: { periode_id: periodeId },
    token: tokenMhsA,
  });
  check('status 409', dup.status === 409);

  // 4. POST /:id/submit dengan items kosong → 422
  console.log('\nPOST /:id/submit (items kosong → 422)');
  const submitEmpty = await api('POST', `/api/v1/rencana-studi/${rsId}/submit`, { token: tokenMhsA });
  check('status 422', submitEmpty.status === 422);

  // 5. POST /:id/items (tambah 2 kelas)
  console.log('\nPOST /:id/items (tambah kelas pertama)');
  const add1 = await api('POST', `/api/v1/rencana-studi/${rsId}/items`, {
    body: { kelas_id: kelas1.id }, token: tokenMhsA,
  });
  check('status 201', add1.status === 201);
  check('items length 1', add1.data?.data?.items?.length === 1);
  check('total_sks = sks kelas1', add1.data?.data?.total_sks === kelas1.sks);

  console.log('POST /:id/items (kelas kedua)');
  const add2 = await api('POST', `/api/v1/rencana-studi/${rsId}/items`, {
    body: { kelas_id: kelas2.id }, token: tokenMhsA,
  });
  check('status 201', add2.status === 201);
  check('items length 2', add2.data?.data?.items?.length === 2);

  // 6. POST /:id/items duplikat → 409
  console.log('\nPOST /:id/items (kelas yang sama → 409)');
  const addDup = await api('POST', `/api/v1/rencana-studi/${rsId}/items`, {
    body: { kelas_id: kelas1.id }, token: tokenMhsA,
  });
  check('status 409', addDup.status === 409);

  // 7. POST /:id/submit
  console.log('\nPOST /:id/submit');
  const submit1 = await api('POST', `/api/v1/rencana-studi/${rsId}/submit`, { token: tokenMhsA });
  check('status 200', submit1.status === 200);
  check('status SUBMITTED', submit1.data?.data?.status === 'SUBMITTED');
  check('submitted_at terisi', !!submit1.data?.data?.submitted_at);

  // 8. POST /:id/submit dari SUBMITTED → 422
  console.log('\nPOST /:id/submit (dari SUBMITTED → 422)');
  const submit2 = await api('POST', `/api/v1/rencana-studi/${rsId}/submit`, { token: tokenMhsA });
  check('status 422', submit2.status === 422);

  // ============ DOSEN-WALI SIDE FLOW ============

  // 9. GET /dosen/bimbingan
  console.log('\nGET /api/v1/rencana-studi/dosen/bimbingan');
  const bim = await api('GET', `/api/v1/rencana-studi/dosen/bimbingan?periode_id=${periodeId}`, { token: tokenDW01 });
  check('status 200', bim.status === 200);
  check('mahasiswa A muncul', bim.data?.data?.some((d) => d.mahasiswa.id === mahasiswaA.id));
  check('summary ada', !!bim.data?.summary);
  check('summary.submitted >= 1', bim.data?.summary?.submitted >= 1);

  // 10. GET /:id (detail dari dosen wali)
  console.log(`\nGET /api/v1/rencana-studi/${rsId} (sebagai dosen wali)`);
  const detailDosen = await api('GET', `/api/v1/rencana-studi/${rsId}`, { token: tokenDW01 });
  check('status 200', detailDosen.status === 200);
  check('items punya is_mengulang false', detailDosen.data?.data?.items?.[0]?.is_mengulang === false);
  check('items punya tags array', Array.isArray(detailDosen.data?.data?.items?.[0]?.tags));
  check('mahasiswa info ada', !!detailDosen.data?.data?.mahasiswa?.nim);

  // 11. GET /:id dari dosen LAIN → 403
  console.log(`\nGET /api/v1/rencana-studi/${rsId} (dosen lain → 403)`);
  const detailDosenLain = await api('GET', `/api/v1/rencana-studi/${rsId}`, { token: tokenDW02 });
  check('status 403', detailDosenLain.status === 403);

  // 12. POST /:id/setujui dari dosen lain → 403
  console.log('\nPOST /:id/setujui (dosen lain → 403)');
  const setujuiSalah = await api('POST', `/api/v1/rencana-studi/${rsId}/setujui`, {
    body: { catatan: 'OK' }, token: tokenDW02,
  });
  check('status 403', setujuiSalah.status === 403);

  // 13. POST /:id/setujui (sukses)
  console.log('\nPOST /:id/setujui (DW01 setujui)');
  const setujui = await api('POST', `/api/v1/rencana-studi/${rsId}/setujui`, {
    body: { catatan: 'Bagus, lanjutkan!' }, token: tokenDW01,
  });
  check('status 200', setujui.status === 200);
  check('status APPROVED', setujui.data?.data?.status === 'APPROVED');
  check('catatan tersimpan', setujui.data?.data?.catatan_dosen === 'Bagus, lanjutkan!');
  check('reviewed_at terisi', !!setujui.data?.data?.reviewed_at);

  // ============ AUTO-CHANGE STATUS ON EDIT ============

  // 14. Mahasiswa add item dari APPROVED → status auto DRAFT.
  // Keputusan: keputusan dosen di-reset, mahasiswa wajib submit ulang manual.
  // Catatan_dosen lama dibiarkan untuk reference (akan dibersihkan saat submit ulang).
  console.log('\nPOST /:id/items dari APPROVED → auto DRAFT');
  const editApproved = await api('POST', `/api/v1/rencana-studi/${rsId}/items`, {
    body: { kelas_id: kelas3.id }, token: tokenMhsA,
  });
  check('status 201', editApproved.status === 201);
  check('status auto DRAFT', editApproved.data?.data?.status === 'DRAFT');
  check('catatan_dosen lama tetap (biarkan)', editApproved.data?.data?.catatan_dosen === 'Bagus, lanjutkan!');

  // 14b. Regression: bug "FRS tidak bisa di-submit dari status SUBMITTED" setelah
  // mahasiswa reset/edit FRS yang sudah APPROVED. Submit ulang harus sukses.
  console.log('\nPOST /:id/submit (regression: dari DRAFT pasca APPROVED-edit)');
  const resubmitAfterApprovedEdit = await api('POST', `/api/v1/rencana-studi/${rsId}/submit`, { token: tokenMhsA });
  check('status 200', resubmitAfterApprovedEdit.status === 200,
    `status: ${resubmitAfterApprovedEdit.status} — ${resubmitAfterApprovedEdit.data?.message}`);
  check('status SUBMITTED', resubmitAfterApprovedEdit.data?.data?.status === 'SUBMITTED');
  check('catatan_dosen direset null setelah submit ulang',
    resubmitAfterApprovedEdit.data?.data?.catatan_dosen === null);

  // 15. Dosen revisi (catatan wajib)
  console.log('\nPOST /:id/revisi tanpa catatan → 400');
  const revisiKosong = await api('POST', `/api/v1/rencana-studi/${rsId}/revisi`, {
    body: {}, token: tokenDW01,
  });
  check('status 400', revisiKosong.status === 400);

  console.log('POST /:id/revisi (DW01)');
  const revisi = await api('POST', `/api/v1/rencana-studi/${rsId}/revisi`, {
    body: { catatan: 'Tolong ganti kelas X karena bentrok' }, token: tokenDW01,
  });
  check('status 200', revisi.status === 200);
  check('status REJECTED', revisi.data?.data?.status === 'REJECTED');
  check('catatan tersimpan', revisi.data?.data?.catatan_dosen?.includes('bentrok'));

  // 16. Mahasiswa delete item dari REJECTED → auto DRAFT
  console.log('\nDELETE /:id/items/:item_id dari REJECTED → auto DRAFT');
  const itemToDelete = revisi.data.data.items[0].id;
  const del = await api('DELETE', `/api/v1/rencana-studi/${rsId}/items/${itemToDelete}`, { token: tokenMhsA });
  check('status 200', del.status === 200);
  check('status auto DRAFT', del.data?.data?.status === 'DRAFT');

  // 17. Mahasiswa submit ulang
  console.log('\nPOST /:id/submit (resubmit dari DRAFT)');
  const resubmit = await api('POST', `/api/v1/rencana-studi/${rsId}/submit`, { token: tokenMhsA });
  check('status 200', resubmit.status === 200);
  check('status SUBMITTED', resubmit.data?.data?.status === 'SUBMITTED');
  check('catatan_dosen direset null', resubmit.data?.data?.catatan_dosen === null);

  // ============ READ ENDPOINTS ============

  // 18. GET /saya
  console.log('\nGET /saya');
  const saya = await api('GET', '/api/v1/rencana-studi/saya', { token: tokenMhsA });
  check('status 200', saya.status === 200);
  check('id cocok', saya.data?.data?.id === rsId);

  // 19. GET /saya/riwayat
  console.log('\nGET /saya/riwayat');
  const riwayat = await api('GET', '/api/v1/rencana-studi/saya/riwayat', { token: tokenMhsA });
  check('status 200', riwayat.status === 200);
  check('punya entry', riwayat.data?.data?.length >= 1);

  // 20. GET /dosen/mahasiswa/:id/profil (DW01 lihat mahasiswa A)
  console.log('\nGET /dosen/mahasiswa/:id/profil');
  const profil = await api('GET', `/api/v1/rencana-studi/dosen/mahasiswa/${mahasiswaA.id}/profil`, { token: tokenDW01 });
  check('status 200', profil.status === 200);
  check('nim ada', !!profil.data?.data?.mahasiswa?.nim);

  // 21. GET /dosen/mahasiswa/:id/profil dari dosen lain → 403
  const profilSalah = await api('GET', `/api/v1/rencana-studi/dosen/mahasiswa/${mahasiswaA.id}/profil`, { token: tokenDW02 });
  check('dosen lain → 403', profilSalah.status === 403);

  // 22. GET /dosen/mahasiswa/:id/riwayat
  console.log('\nGET /dosen/mahasiswa/:id/riwayat');
  const riwayatBim = await api('GET', `/api/v1/rencana-studi/dosen/mahasiswa/${mahasiswaA.id}/riwayat`, { token: tokenDW01 });
  check('status 200', riwayatBim.status === 200);
  check('punya entry', riwayatBim.data?.data?.length >= 1);

  // ============ ROLE / OWNERSHIP ============

  // 23. Mahasiswa lain coba akses FRS A → 403
  if (tokenMhsC) {
    console.log('\nGET /:id (mahasiswa lain → 403)');
    const otherMhs = await api('GET', `/api/v1/rencana-studi/${rsId}`, { token: tokenMhsC });
    check('status 403', otherMhs.status === 403);
  }

  // 24. Kaprodi GET /:id → 200 (boleh semua)
  console.log('\nGET /:id (kaprodi → 200)');
  const detailKaprodi = await api('GET', `/api/v1/rencana-studi/${rsId}`, { token: tokenKaprodi });
  check('status 200', detailKaprodi.status === 200);

  // ============ CLEANUP ============
  console.log('\nCleanup: hapus FRS test (lewat DB) lalu hapus periode test');
  await pool.query('DELETE FROM rencana_studi WHERE id = $1', [rsId]);
  await pool.query('DELETE FROM kelas WHERE periode_id = $1', [periodeId]);
  await pool.query('DELETE FROM periode WHERE id = $1', [periodeId]);

  console.log(`\n${process.exitCode ? '❌ Ada test yang gagal' : '✅ Semua test lulus'}\n`);
  await pool.end();
}

run().catch(async (err) => {
  console.error('Test error:', err.message);
  console.error(err.stack);
  await pool.end().catch(() => {});
  process.exit(1);
});
