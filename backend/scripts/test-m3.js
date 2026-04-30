/**
 * Test script Milestone 3 — jalankan saat server sudah jalan.
 * Usage: node scripts/test-m3.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const http = require('node:http');
const jwt = require('jsonwebtoken');

const BASE = 'http://localhost:4000';

// Generate token kaprodi untuk test
const tokenKaprodi = jwt.sign(
  { id: 1, email: 'kaprodi@unpar.ac.id', role: 'kaprodi' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' },
);

function get(url, token) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
    http.get(`${BASE}${url}`, options, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    }).on('error', reject);
  });
}

function check(label, condition, detail = '') {
  const icon = condition ? '✓' : '✗';
  console.log(`  ${icon} ${label}${detail ? ' — ' + detail : ''}`);
  if (!condition) process.exitCode = 1;
}

async function run() {
  console.log('\n=== Milestone 3 — User Management Test ===\n');

  // GET /dosen-wali
  console.log('GET /api/v1/dosen-wali');
  const dw = await get('/api/v1/dosen-wali', tokenKaprodi);
  check('status 200', dw.status === 200);
  check('success true', dw.data.success);
  check('ada 5 dosen', dw.data.pagination?.total === 5, `total: ${dw.data.pagination?.total}`);
  check('ada jumlah_bimbingan', dw.data.data?.[0]?.jumlah_bimbingan !== undefined);

  // GET /dosen-wali?search=husnul
  console.log('\nGET /api/v1/dosen-wali?search=husnul');
  const dwSearch = await get('/api/v1/dosen-wali?search=husnul', tokenKaprodi);
  check('status 200', dwSearch.status === 200);
  check('ketemu 1 hasil', dwSearch.data.data?.length === 1, `count: ${dwSearch.data.data?.length}`);

  // GET /dosen-wali/:id (detail + bimbingan)
  const dosenId = dw.data.data?.[0]?.id;
  console.log(`\nGET /api/v1/dosen-wali/${dosenId}`);
  const dwDetail = await get(`/api/v1/dosen-wali/${dosenId}`, tokenKaprodi);
  check('status 200', dwDetail.status === 200);
  check('ada mahasiswa_bimbingan', Array.isArray(dwDetail.data.data?.mahasiswa_bimbingan));

  // GET /mahasiswa (semua)
  console.log('\nGET /api/v1/mahasiswa');
  const mhs = await get('/api/v1/mahasiswa', tokenKaprodi);
  check('status 200', mhs.status === 200);
  check('ada 9 mahasiswa', mhs.data.pagination?.total === 9, `total: ${mhs.data.pagination?.total}`);

  // GET /mahasiswa?dosen_wali_id=null (belum assign)
  console.log('\nGET /api/v1/mahasiswa?dosen_wali_id=null');
  const mhsUnassigned = await get('/api/v1/mahasiswa?dosen_wali_id=null', tokenKaprodi);
  check('status 200', mhsUnassigned.status === 200);
  check('2 mahasiswa belum assign', mhsUnassigned.data.data?.length === 2, `count: ${mhsUnassigned.data.data?.length}`);

  // GET /mahasiswa/:id
  const mhsId = mhs.data.data?.[0]?.id;
  console.log(`\nGET /api/v1/mahasiswa/${mhsId}`);
  const mhsDetail = await get(`/api/v1/mahasiswa/${mhsId}`, tokenKaprodi);
  check('status 200', mhsDetail.status === 200);
  check('ada nim', !!mhsDetail.data.data?.nim);

  // 401 tanpa token
  console.log('\nGET /api/v1/mahasiswa (tanpa token)');
  const noToken = await get('/api/v1/mahasiswa');
  check('status 401', noToken.status === 401);
  check('success false', !noToken.data.success);

  // 403 role salah (kaprodi akses PATCH /me dosen wali)
  console.log('\nPATCH /api/v1/dosen-wali/me (role kaprodi → 403)');
  const wrongRole = await new Promise((resolve) => {
    const body = JSON.stringify({ jadwal_perwalian: 'Senin 10-12' });
    const req = http.request(`${BASE}/api/v1/dosen-wali/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenKaprodi}`, 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let b = '';
      res.on('data', (c) => { b += c; });
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(b) }));
    });
    req.write(body);
    req.end();
  });
  check('status 403', wrongRole.status === 403);

  console.log(`\n${process.exitCode ? '❌ Ada test yang gagal' : '✅ Semua test lulus'}\n`);
}

run().catch((err) => {
  console.error('Test error:', err.message);
  process.exit(1);
});
