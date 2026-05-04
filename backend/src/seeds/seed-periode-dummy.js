/**
 * Seed: periode dummy "Riwayat DPS" untuk semua row riwayat_nilai dari upload DPS.
 * Lihat docs/blueprint-sistem-perwalian.md (section "Periode Dummy") untuk konteks.
 *
 * Idempotent: kalau periode "Riwayat DPS" sudah ada, skip (tidak duplikasi).
 * Usage: node src/seeds/seed-periode-dummy.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../db/pool');

const PERIODE_DUMMY = {
  nama: 'Riwayat DPS',
  tahun_mulai: 2000,
  jenis: 'ganjil',
  tanggal_mulai: '2000-01-01',
  tanggal_selesai: '2000-12-31',
  is_active: false,
};

async function seedPeriodeDummy() {
  const existing = await query(
    'SELECT id FROM periode WHERE nama = $1',
    [PERIODE_DUMMY.nama],
  );

  if (existing.rows.length > 0) {
    console.log(`  skip: periode "${PERIODE_DUMMY.nama}" sudah ada (id: ${existing.rows[0].id})`);
    return existing.rows[0].id;
  }

  const result = await query(
    `INSERT INTO periode
       (nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      PERIODE_DUMMY.nama,
      PERIODE_DUMMY.tahun_mulai,
      PERIODE_DUMMY.jenis,
      PERIODE_DUMMY.tanggal_mulai,
      PERIODE_DUMMY.tanggal_selesai,
      PERIODE_DUMMY.is_active,
    ],
  );

  console.log(`  ✓ periode "${PERIODE_DUMMY.nama}" dibuat (id: ${result.rows[0].id})`);
  return result.rows[0].id;
}

if (require.main === module) {
  seedPeriodeDummy()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Seed gagal:', err.message);
      process.exit(1);
    });
}

module.exports = { seedPeriodeDummy, PERIODE_DUMMY_NAMA: PERIODE_DUMMY.nama };
