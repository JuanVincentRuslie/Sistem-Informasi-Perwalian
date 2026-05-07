/**
 * Seed: 2 user kaprodi awal.
 * Dijalankan setelah migration: node src/seeds/seed-kaprodi.js
 *
 * - Mariskha (kaprodi sebenarnya, untuk login dev/staf)
 * - Kaprodi Testing (akun Google milik user, untuk demo Google OAuth)
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../db/pool');

const KAPRODI_DATA = [
  { email: 'mariskha@unpar.ac.id', nama: 'Mariskha Tri Adithia, S.Si' },
  { email: 'ruslie.vincent@gmail.com', nama: 'Kaprodi Testing' },
];

async function seedKaprodi() {
  let inserted = 0;
  let skipped = 0;

  for (const kaprodi of KAPRODI_DATA) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [kaprodi.email]);

    if (existing.rows.length > 0) {
      console.log(`  skip: ${kaprodi.email} sudah ada`);
      skipped++;
      continue;
    }

    await query(
      'INSERT INTO users (email, nama, role, is_active) VALUES ($1, $2, $3, $4)',
      [kaprodi.email, kaprodi.nama, 'kaprodi', true],
    );

    console.log(`  ✓ ${kaprodi.nama} <${kaprodi.email}>`);
    inserted++;
  }

  console.log(`\nKaprodi: ${inserted} inserted, ${skipped} skipped.`);
  await pool.end();
}

seedKaprodi().catch((err) => {
  console.error('Seed gagal:', err.message);
  process.exit(1);
});
