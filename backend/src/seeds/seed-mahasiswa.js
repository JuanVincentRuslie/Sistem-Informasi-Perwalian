/**
 * Seed: 9 mahasiswa awal + assign ke dosen wali.
 * Dijalankan SETELAH seed-dosen-wali.js karena butuh ID dosen wali.
 * Usage: node src/seeds/seed-mahasiswa.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../db/pool');

// Mapping email dosen wali → dipakai untuk lookup ID saat assign
const DOSEN_EMAIL = {
  DW01: 'husnul.hakim@unpar.ac.id',
  DW02: 'yosef.ardi@unpar.ac.id',
  DW03: 'maria.lestari@unpar.ac.id',
  DW04: 'anita.wulandari@unpar.ac.id',
  DW05: 'made.putra@unpar.ac.id',
};

const MAHASISWA_DATA = [
  { nim: '6180000001', nama: 'Mahasiswa A', angkatan: 2021, ipk: 3.31, dosenKey: 'DW01' },
  { nim: '6180000002', nama: 'Mahasiswa B', angkatan: 2021, ipk: 3.05, dosenKey: 'DW04' },
  { nim: '6180000003', nama: 'Mahasiswa C', angkatan: 2022, ipk: 3.18, dosenKey: null },
  { nim: '6180000004', nama: 'Mahasiswa D', angkatan: 2021, ipk: 3.72, dosenKey: 'DW01' },
  { nim: '6180000005', nama: 'Mahasiswa E', angkatan: 2021, ipk: 3.44, dosenKey: 'DW01' },
  { nim: '6180000006', nama: 'Mahasiswa F', angkatan: 2020, ipk: 3.67, dosenKey: 'DW02' },
  { nim: '6180000007', nama: 'Mahasiswa G', angkatan: 2022, ipk: 2.91, dosenKey: null },
  { nim: '6180000008', nama: 'Mahasiswa H', angkatan: 2020, ipk: 3.51, dosenKey: 'DW02' },
  { nim: '6180000009', nama: 'Mahasiswa I', angkatan: 2021, ipk: 3.22, dosenKey: 'DW03' },
];

async function seedMahasiswa() {
  // Bangun mapping email dosen → DB id terlebih dulu
  const dosenIdMap = {};
  for (const [key, email] of Object.entries(DOSEN_EMAIL)) {
    const result = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      dosenIdMap[key] = result.rows[0].id;
    } else {
      console.warn(`  WARN: dosen ${email} tidak ditemukan, assign null`);
      dosenIdMap[key] = null;
    }
  }

  let inserted = 0;
  let skipped = 0;

  for (const mhs of MAHASISWA_DATA) {
    const email = `${mhs.nim}@student.unpar.ac.id`;
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      console.log(`  skip: ${email} sudah ada`);
      skipped++;
      continue;
    }

    const userResult = await query(
      'INSERT INTO users (email, nama, role, is_active) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, mhs.nama, 'mahasiswa', true],
    );
    const userId = userResult.rows[0].id;

    const dosenWaliId = mhs.dosenKey ? (dosenIdMap[mhs.dosenKey] ?? null) : null;

    await query(
      `INSERT INTO profile_mahasiswa
         (user_id, nim, angkatan, dosen_wali_id, ipk)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, mhs.nim, mhs.angkatan, dosenWaliId, mhs.ipk],
    );

    console.log(`  ✓ ${mhs.nama} (${mhs.nim}) → dosen: ${mhs.dosenKey ?? 'unassigned'}`);
    inserted++;
  }

  console.log(`\nMahasiswa: ${inserted} inserted, ${skipped} skipped.`);
  await pool.end();
}

seedMahasiswa().catch((err) => {
  console.error('Seed gagal:', err.message);
  process.exit(1);
});
