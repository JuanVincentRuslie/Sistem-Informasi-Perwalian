/**
 * Seed: 5 dosen wali awal.
 * Dijalankan setelah migration 002 (profile_dosen) sudah jalan.
 * Usage: node src/seeds/seed-dosen-wali.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../db/pool');

const DOSEN_DATA = [
  { nama: 'Dr. Husnul Hakim, S.Kom., M.T.', email: 'husnul.hakim@unpar.ac.id', nip: '198201152010011001' },
  { nama: 'Yosef Ardi, S.Kom., M.T.', email: 'yosef.ardi@unpar.ac.id', nip: '198412102011011002' },
  { nama: 'Dr. Maria Lestari', email: 'maria.lestari@unpar.ac.id', nip: '197909182009012003' },
  { nama: 'Anita Wulandari, S.T., M.T.', email: 'anita.wulandari@unpar.ac.id', nip: '198806232014042004' },
  { nama: 'Dr. I Made Putra', email: 'made.putra@unpar.ac.id', nip: '197705092007011005' },
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
