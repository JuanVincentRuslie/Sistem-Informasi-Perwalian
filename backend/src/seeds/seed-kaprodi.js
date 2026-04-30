/**
 * Seed: 1 user kaprodi awal.
 * Jalankan setelah migration: node src/seeds/seed-kaprodi.js
 *
 * Email bisa di-override via env KAPRODI_EMAIL dan KAPRODI_NAMA.
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../db/pool');

async function seedKaprodi() {
  const email = process.env.KAPRODI_EMAIL || 'kaprodi@unpar.ac.id';
  const nama = process.env.KAPRODI_NAMA || 'Kaprodi Informatika';

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);

  if (existing.rows.length > 0) {
    console.log(`Kaprodi dengan email "${email}" sudah ada. Skip.`);
    await pool.end();
    return;
  }

  await query(
    'INSERT INTO users (email, nama, role, is_active) VALUES ($1, $2, $3, $4)',
    [email, nama, 'kaprodi', true],
  );

  console.log(`✓ Kaprodi "${nama}" <${email}> berhasil di-seed.`);
  await pool.end();
}

seedKaprodi().catch((err) => {
  console.error('Seed gagal:', err.message);
  process.exit(1);
});
