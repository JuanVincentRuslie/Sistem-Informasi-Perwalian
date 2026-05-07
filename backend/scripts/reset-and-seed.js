/**
 * Reset DB ke state seed: TRUNCATE semua data + jalankan seed:all.
 * Schema migration tidak disentuh (pgmigrations preserved).
 *
 * Usage: node scripts/reset-and-seed.js
 *
 * Dipakai sebelum demo / UAT untuk memastikan DB fresh tanpa data tes.
 * AMAN dijalankan berulang — TRUNCATE + seed sama-sama idempotent.
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { spawnSync } = require('node:child_process');
const { pool } = require('../src/db/pool');

const TABLES_TO_TRUNCATE = [
  'users', 'profile_dosen', 'profile_mahasiswa',
  'periode', 'master_matkul', 'master_matkul_edge',
  'kelas', 'sesi_kelas',
  'rencana_studi', 'rencana_studi_item',
  'riwayat_nilai',
];

const SEED_FILES = [
  'src/seeds/seed-kaprodi.js',
  'src/seeds/seed-dosen-wali.js',
  'src/seeds/seed-mahasiswa.js',
  'src/seeds/seed-master-matkul.js',
  'src/seeds/seed-periode-dummy.js',
];

async function truncate() {
  console.log('⏳ TRUNCATE semua data tables...');
  await pool.query(
    `TRUNCATE ${TABLES_TO_TRUNCATE.join(', ')} RESTART IDENTITY CASCADE`,
  );
  console.log('✓ TRUNCATE selesai.\n');
  await pool.end();
}

function runSeed(file) {
  console.log(`⏳ Running ${file}...`);
  const result = spawnSync('node', [file], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`Seed gagal: ${file}`);
  }
  console.log('');
}

(async () => {
  try {
    await truncate();
    for (const file of SEED_FILES) runSeed(file);
    console.log('✅ Reset & seed selesai. DB ready.');
  } catch (err) {
    console.error('❌ Reset gagal:', err.message);
    process.exit(1);
  }
})();
