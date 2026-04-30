/**
 * Test script Milestone 4 — jalankan saat server sudah jalan.
 * Usage: node scripts/test-m4.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const http = require('node:http');
const jwt = require('jsonwebtoken');

const BASE = 'http://localhost:4000';

const tokenKaprodi = jwt.sign(
  { id: 1, email: 'kaprodi@unpar.ac.id', role: 'kaprodi' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' },
);

const tokenMhs = jwt.sign(
  { id: 3, email: 'test@student.unpar.ac.id', role: 'mahasiswa' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' },
);

function request(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(bodyStr ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = http.request(`${BASE}${url}`, options, (res) => {
      let b = '';
      res.on('data', (c) => { b += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, data: b }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function check(label, condition, detail = '') {
  const icon = condition ? '✓' : '✗';
  console.log(`  ${icon} ${label}${detail ? ' — ' + detail : ''}`);
  if (!condition) process.exitCode = 1;
}

async function run() {
  console.log('\n=== Milestone 4 — Periode Test ===\n');

  // GET /periode (list kosong awal — atau ada dari seed)
  console.log('GET /api/v1/periode');
  const list1 = await request('GET', '/api/v1/periode', null, tokenKaprodi);
  check('status 200', list1.status === 200);
  check('success true', list1.data.success);
  check('data adalah array', Array.isArray(list1.data.data));

  // GET /periode/aktif — mungkin 404 kalau belum ada periode
  console.log('\nGET /api/v1/periode/aktif (mungkin 404 kalau belum ada)');
  const aktif0 = await request('GET', '/api/v1/periode/aktif', null, tokenKaprodi);
  check('status 200 atau 404', aktif0.status === 200 || aktif0.status === 404);

  // POST /periode — buat periode pertama
  console.log('\nPOST /api/v1/periode (buat periode 1)');
  const create1 = await request('POST', '/api/v1/periode', {
    nama: 'Ganjil 2024/2025',
    tahun_mulai: 2024,
    jenis: 'ganjil',
    tanggal_mulai: '2024-09-01',
    tanggal_selesai: '2025-01-31',
  }, tokenKaprodi);
  check('status 201', create1.status === 201, `status: ${create1.status}`);
  check('is_active true', create1.data.data?.is_active === true);
  check('status aktif atau berakhir', ['aktif', 'berakhir'].includes(create1.data.data?.status));
  const id1 = create1.data.data?.id;

  // POST /periode — buat periode kedua, periode pertama harus nonaktif
  console.log('\nPOST /api/v1/periode (buat periode 2, auto-deactivate periode 1)');
  const create2 = await request('POST', '/api/v1/periode', {
    nama: 'Genap 2024/2025',
    tahun_mulai: 2024,
    jenis: 'genap',
    tanggal_mulai: '2025-02-01',
    tanggal_selesai: '2099-06-30',
  }, tokenKaprodi);
  check('status 201', create2.status === 201);
  check('periode 2 aktif', create2.data.data?.is_active === true);
  const id2 = create2.data.data?.id;

  // GET /periode/aktif — harus dapat periode 2
  console.log('\nGET /api/v1/periode/aktif (harus periode 2)');
  const aktif1 = await request('GET', '/api/v1/periode/aktif', null, tokenKaprodi);
  check('status 200', aktif1.status === 200);
  check('dapat periode yang benar', aktif1.data.data?.id === id2, `id: ${aktif1.data.data?.id}, expected: ${id2}`);
  check('status aktif', aktif1.data.data?.status === 'aktif');

  // GET /periode — cek periode 1 sudah nonaktif
  console.log('\nGET /api/v1/periode (cek periode 1 tidak lagi aktif)');
  const listAll = await request('GET', '/api/v1/periode', null, tokenKaprodi);
  const p1 = listAll.data.data?.find((p) => p.id === id1);
  check('periode 1 is_active false', p1?.is_active === false, `is_active: ${p1?.is_active}`);

  // PATCH /periode/:id/aktivasi — coba aktifkan periode 1 (sudah berakhir → 422)
  console.log(`\nPATCH /api/v1/periode/${id1}/aktivasi (periode berakhir → 422)`);
  const aktifP1 = await request('PATCH', `/api/v1/periode/${id1}/aktivasi`, {}, tokenKaprodi);
  check('status 422', aktifP1.status === 422, `status: ${aktifP1.status}`);

  // PUT /periode/:id — update nama
  console.log(`\nPUT /api/v1/periode/${id2} (update nama)`);
  const upd = await request('PUT', `/api/v1/periode/${id2}`, {
    nama: 'Genap 2024/2025 (updated)',
  }, tokenKaprodi);
  check('status 200', upd.status === 200);
  check('nama terupdate', upd.data.data?.nama === 'Genap 2024/2025 (updated)');

  // 403 mahasiswa coba POST /periode
  console.log('\nPOST /api/v1/periode (mahasiswa → 403)');
  const forbid = await request('POST', '/api/v1/periode', {
    nama: 'X', tahun_mulai: 2025, jenis: 'ganjil',
    tanggal_mulai: '2025-09-01', tanggal_selesai: '2025-12-31',
  }, tokenMhs);
  check('status 403', forbid.status === 403);

  // DELETE /periode/:id1 (periode lama sudah berakhir, tidak ada FK → boleh hapus)
  console.log(`\nDELETE /api/v1/periode/${id1}`);
  const del = await request('DELETE', `/api/v1/periode/${id1}`, null, tokenKaprodi);
  check('status 200', del.status === 200, `status: ${del.status}`);

  // Verifikasi sudah terhapus
  const listAfterDel = await request('GET', '/api/v1/periode', null, tokenKaprodi);
  const stillExists = listAfterDel.data.data?.find((p) => p.id === id1);
  check('periode 1 sudah terhapus', !stillExists);

  console.log(`\n${process.exitCode ? '❌ Ada test yang gagal' : '✅ Semua test lulus'}\n`);
}

run().catch((err) => {
  console.error('Test error:', err.message);
  process.exit(1);
});
