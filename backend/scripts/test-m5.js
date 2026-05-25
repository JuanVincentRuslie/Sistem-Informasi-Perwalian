/**
 * Test script Milestone 5 — jalankan saat server sudah jalan.
 * Usage: node scripts/test-m5.js
 *
 * Memakai fetch + FormData built-in (Node 18+).
 */
const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const jwt = require('jsonwebtoken');

const BASE = 'http://localhost:4000';
const TEMPLATE_XLSX = path.resolve(
  __dirname,
  '../../parser_for_backend/Jadwal_excel_parser/Template_jadwal_kelas.xlsx',
);

const tokenKaprodi = jwt.sign(
  { id: 1, email: 'kaprodi@unpar.ac.id', role: 'kaprodi' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' },
);

const tokenMhs = jwt.sign(
  { id: 99, email: 'test@student.unpar.ac.id', role: 'mahasiswa' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' },
);

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

async function run() {
  console.log('\n=== Milestone 5 — Kelas & Upload Jadwal Excel ===\n');

  // 1. Buat periode untuk test
  const ts = Date.now();
  console.log('Setup: buat periode test');
  const createPer = await api('POST', '/api/v1/periode', {
    body: {
      nama: `Test M5 ${ts}`,
      tahun_mulai: 2025,
      jenis: 'ganjil',
      tanggal_mulai: '2025-09-01',
      tanggal_selesai: '2099-12-31',
    },
    token: tokenKaprodi,
  });
  check('periode dibuat', createPer.status === 201, `status: ${createPer.status}`);
  const periodeId = createPer.data?.data?.id;

  // 2. POST /upload dengan Excel template
  console.log('\nPOST /api/v1/kelas/upload (Excel template)');
  const fileBuf = await fs.readFile(TEMPLATE_XLSX);
  const blob = new Blob([fileBuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const form = new FormData();
  form.append('file', blob, 'template.xlsx');
  form.append('periode_id', String(periodeId));

  const upload = await api('POST', '/api/v1/kelas/upload', { body: form, token: tokenKaprodi, isForm: true });
  check('status 200', upload.status === 200, `status: ${upload.status} — ${JSON.stringify(upload.data?.message)}`);
  check('ada upload_token', !!upload.data?.data?.upload_token);
  check('ada preview array', Array.isArray(upload.data?.data?.preview));
  check('summary punya total_kelas', typeof upload.data?.data?.summary?.total_kelas === 'number');
  const uploadToken = upload.data?.data?.upload_token;
  const totalKelas = upload.data?.data?.summary?.valid_kelas;
  console.log(`  → preview: ${upload.data?.data?.preview?.length} item, valid_kelas: ${totalKelas}`);

  // 3. POST /upload/confirm
  console.log('\nPOST /api/v1/kelas/upload/confirm');
  const confirm = await api('POST', '/api/v1/kelas/upload/confirm', {
    body: { upload_token: uploadToken, mode: 'replace' },
    token: tokenKaprodi,
  });
  check('status 200', confirm.status === 200, `status: ${confirm.status} — ${JSON.stringify(confirm.data?.message)}`);
  check('inserted_kelas cocok', confirm.data?.data?.inserted_kelas === totalKelas,
    `inserted: ${confirm.data?.data?.inserted_kelas}, expected: ${totalKelas}`);
  check('inserted_sesi > 0', confirm.data?.data?.inserted_sesi > 0);

  // 4. GET /kelas?periode_id=X
  console.log(`\nGET /api/v1/kelas?periode_id=${periodeId}`);
  const list = await api('GET', `/api/v1/kelas?periode_id=${periodeId}`, { token: tokenKaprodi });
  check('status 200', list.status === 200);
  check('data adalah array', Array.isArray(list.data?.data));
  check('jumlah kelas cocok', list.data?.data?.length === totalKelas,
    `count: ${list.data?.data?.length}, expected: ${totalKelas}`);
  check('kelas pertama punya sesi', Array.isArray(list.data?.data?.[0]?.sesi) && list.data.data[0].sesi.length > 0);
  check('sesi pertama punya jam_mulai HH:MM', /^\d{2}:\d{2}$/.test(list.data?.data?.[0]?.sesi?.[0]?.jam_mulai ?? ''));
  check('kelas pertama punya periode object', !!list.data?.data?.[0]?.periode?.id);
  const firstKelasId = list.data?.data?.[0]?.id;

  // 5. GET /kelas/:id
  console.log(`\nGET /api/v1/kelas/${firstKelasId}`);
  const detail = await api('GET', `/api/v1/kelas/${firstKelasId}`, { token: tokenKaprodi });
  check('status 200', detail.status === 200);
  check('detail punya sesi', Array.isArray(detail.data?.data?.sesi));

  // 6. Confirm token sama → 410 (sudah dipakai/dihapus)
  console.log('\nPOST /upload/confirm dengan token yang sudah dipakai → 410');
  const confirmAgain = await api('POST', '/api/v1/kelas/upload/confirm', {
    body: { upload_token: uploadToken, mode: 'replace' },
    token: tokenKaprodi,
  });
  check('status 410', confirmAgain.status === 410, `status: ${confirmAgain.status}`);

  // 7. 403 mahasiswa coba upload
  console.log('\nPOST /upload (mahasiswa → 403)');
  const form2 = new FormData();
  form2.append('file', new Blob([fileBuf]), 'template.xlsx');
  form2.append('periode_id', String(periodeId));
  const forbid = await api('POST', '/api/v1/kelas/upload', { body: form2, token: tokenMhs, isForm: true });
  check('status 403', forbid.status === 403, `status: ${forbid.status}`);

  // 8. Test replace mode benar-benar mengganti — upload kedua kali
  console.log('\nPOST /upload kedua → confirm → cek replace');
  const blob2 = new Blob([fileBuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const form3 = new FormData();
  form3.append('file', blob2, 'template.xlsx');
  form3.append('periode_id', String(periodeId));
  const upload2 = await api('POST', '/api/v1/kelas/upload', { body: form3, token: tokenKaprodi, isForm: true });
  check('upload kedua status 200', upload2.status === 200);
  const token2 = upload2.data?.data?.upload_token;
  await api('POST', '/api/v1/kelas/upload/confirm', {
    body: { upload_token: token2, mode: 'replace' },
    token: tokenKaprodi,
  });
  const listAfterReplace = await api('GET', `/api/v1/kelas?periode_id=${periodeId}`, { token: tokenKaprodi });
  check('jumlah kelas tetap (replace, bukan append)',
    listAfterReplace.data?.data?.length === totalKelas,
    `count: ${listAfterReplace.data?.data?.length}, expected: ${totalKelas}`);

  // 9. Cleanup periode
  console.log('\nCleanup: hapus periode test');
  // Hapus dulu kelas-nya supaya tidak FK violation
  // (kelas pakai ON DELETE RESTRICT ke periode)
  // Actually delete periode dulu dengan reasoning kelas ada → 409
  const delPer = await api('DELETE', `/api/v1/periode/${periodeId}`, { token: tokenKaprodi });
  check('delete periode dengan kelas → 409', delPer.status === 409, `status: ${delPer.status}`);

  console.log(`\n${process.exitCode ? '❌ Ada test yang gagal' : '✅ Semua test lulus'}\n`);
}

run().catch((err) => {
  console.error('Test error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
