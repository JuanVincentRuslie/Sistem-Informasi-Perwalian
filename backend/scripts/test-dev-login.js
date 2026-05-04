/**
 * Test script untuk POST /api/v1/auth/dev-login (M9 Plan 1).
 * Pre-requisites:
 * - Backend running di http://localhost:4000
 * - Seed users sudah jalan (mahasiswa, dosen_wali, kaprodi)
 * - NODE_ENV !== 'production'
 *
 * Usage: node scripts/test-dev-login.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const http = require('node:http');

const BASE = 'http://localhost:4000';

const SEEDS = {
  mahasiswa: '6180000001@student.unpar.ac.id',
  dosen_wali: 'husnul.hakim@unpar.ac.id',
  kaprodi: 'kaprodi@unpar.ac.id',
};

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
  console.log('\n=== M9 Plan 1 — Dev Login Test ===\n');

  console.log('Test 1: POST /auth/dev-login mahasiswa');
  const t1 = await request('POST', '/api/v1/auth/dev-login', { email: SEEDS.mahasiswa });
  check('status 200', t1.status === 200, `got ${t1.status} ${JSON.stringify(t1.data?.message)}`);
  check('success true', t1.data?.success === true);
  check('token ada', typeof t1.data?.data?.token === 'string' && t1.data.data.token.length > 0);
  check('user.role mahasiswa', t1.data?.data?.user?.role === 'mahasiswa');
  check('user.email match', t1.data?.data?.user?.email === SEEDS.mahasiswa);
  const tokenMhs = t1.data?.data?.token;

  console.log('\nTest 2: POST /auth/dev-login dosen_wali');
  const t2 = await request('POST', '/api/v1/auth/dev-login', { email: SEEDS.dosen_wali });
  check('status 200', t2.status === 200);
  check('user.role dosen_wali', t2.data?.data?.user?.role === 'dosen_wali');

  console.log('\nTest 3: POST /auth/dev-login kaprodi');
  const t3 = await request('POST', '/api/v1/auth/dev-login', { email: SEEDS.kaprodi });
  check('status 200', t3.status === 200);
  check('user.role kaprodi', t3.data?.data?.user?.role === 'kaprodi');

  console.log('\nTest 4: Email tidak terdaftar -> 404');
  const t4 = await request('POST', '/api/v1/auth/dev-login', { email: 'nonexistent@kampus.ac.id' });
  check('status 404', t4.status === 404, `got ${t4.status}`);
  check('success false', t4.data?.success === false);

  console.log('\nTest 5: Body tanpa email -> 400');
  const t5 = await request('POST', '/api/v1/auth/dev-login', {});
  check('status 400', t5.status === 400, `got ${t5.status}`);

  console.log('\nTest 6: GET /auth/me dengan token mahasiswa');
  const t6 = await request('GET', '/api/v1/auth/me', null, tokenMhs);
  check('status 200', t6.status === 200, `got ${t6.status}`);
  check('email match seed', t6.data?.data?.email === SEEDS.mahasiswa);

  if (process.exitCode === 1) {
    console.log('\n❌ Ada test yang gagal');
  } else {
    console.log('\n✅ Semua test lulus');
  }
}

run().catch((err) => {
  console.error('\n❌ Test crash:', err.message);
  process.exit(1);
});
