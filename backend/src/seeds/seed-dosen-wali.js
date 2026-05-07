/**
 * Seed: 5 dosen wali awal.
 * Dijalankan setelah migration 002 (profile_dosen) sudah jalan.
 * Usage: node src/seeds/seed-dosen-wali.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../db/pool');

// Data dosen sebenarnya (FOI Informatika UNPAR). NIP placeholder 001-005 untuk demo UAT.
const DOSEN_DATA = [
  { nama: 'Dr.rer.nat. Cecilia Esti Nugraheni, S.T', email: 'cheni@unpar.ac.id', nip: '001' },
  { nama: 'Lionov, Ph.D.', email: 'lionov@unpar.ac.id', nip: '002' },
  { nama: 'Luciana Abednego, S.Kom', email: 'luciana@unpar.ac.id', nip: '003' },
  { nama: 'Dra. Rosa de Lima Endang Padmowati, M.T', email: 'rosad5@unpar.ac.id', nip: '004' },
  { nama: 'Husnul Hakim, S.Kom', email: 'husnulhakim@unpar.ac.id', nip: '005' },
];

async function seedDosenWali() {
  let inserted = 0;
  let skipped = 0;

  for (const dosen of DOSEN_DATA) {
    // Cek apakah sudah ada berdasarkan email
    const existing = await query('SELECT id FROM users WHERE email = $1', [dosen.email]);

    if (existing.rows.length > 0) {
      console.log(`  skip: ${dosen.email} sudah ada`);
      skipped++;
      continue;
    }

    // Insert ke tabel users dulu, ambil id-nya
    const userResult = await query(
      'INSERT INTO users (email, nama, role, is_active) VALUES ($1, $2, $3, $4) RETURNING id',
      [dosen.email, dosen.nama, 'dosen_wali', true],
    );
    const userId = userResult.rows[0].id;

    // Insert ke profile_dosen
    await query(
      'INSERT INTO profile_dosen (user_id, nip) VALUES ($1, $2)',
      [userId, dosen.nip],
    );

    console.log(`  ✓ ${dosen.nama} <${dosen.email}>`);
    inserted++;
  }

  console.log(`\nDosen wali: ${inserted} inserted, ${skipped} skipped.`);
  await pool.end();
}

seedDosenWali().catch((err) => {
  console.error('Seed gagal:', err.message);
  process.exit(1);
});
