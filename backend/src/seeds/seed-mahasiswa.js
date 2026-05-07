/**
 * Seed: 9 mahasiswa awal + assign ke dosen wali.
 * Dijalankan SETELAH seed-dosen-wali.js karena butuh ID dosen wali.
 * Usage: node src/seeds/seed-mahasiswa.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../db/pool');

// Mapping email dosen wali → dipakai untuk lookup ID saat assign.
// Match dengan seed-dosen-wali.js urutan dan email-nya.
const DOSEN_EMAIL = {
  DW01: 'cheni@unpar.ac.id',
  DW02: 'lionov@unpar.ac.id',
  DW03: 'luciana@unpar.ac.id',
  DW04: 'rosad5@unpar.ac.id',
  DW05: 'husnulhakim@unpar.ac.id',
};

// Mahasiswa 1-9: dosen wali sengaja null untuk demo flow assign kaprodi saat UAT.
// Mahasiswa 10 (Juan Vincent / NIM riil user): pakai akun Google asli, di-assign ke DW04 (Rosa).
// IPK tidak di-seed (akan terisi dari upload DPS — schema default = 0).
const MAHASISWA_DATA = [
  { nim: '6180000001', nama: 'Zefandion Benaya Teja',  angkatan: 2021, dosenKey: null },
  { nim: '6180000002', nama: 'Christian Hadinata',     angkatan: 2021, dosenKey: null },
  { nim: '6180000003', nama: 'Renggana Santika',       angkatan: 2022, dosenKey: null },
  { nim: '6180000004', nama: 'Fauzah Rhamzy',          angkatan: 2021, dosenKey: null },
  { nim: '6180000005', nama: 'Kris Bermul',            angkatan: 2021, dosenKey: null },
  { nim: '6180000006', nama: 'Troy Andrew',            angkatan: 2020, dosenKey: null },
  { nim: '6180000007', nama: 'Michael Khe Huang',      angkatan: 2022, dosenKey: null },
  { nim: '6180000008', nama: 'Oliver Benjamin You',    angkatan: 2020, dosenKey: null },
  { nim: '6180000009', nama: 'Axel Dharmaputra',       angkatan: 2021, dosenKey: null },
  { nim: '6182201039', nama: 'Juan Vincent Ruslie',    angkatan: 2022, dosenKey: 'DW04' },
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
         (user_id, nim, angkatan, dosen_wali_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, mhs.nim, mhs.angkatan, dosenWaliId],
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
