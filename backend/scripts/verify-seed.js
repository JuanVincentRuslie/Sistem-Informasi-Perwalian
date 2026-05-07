/**
 * One-off: verify isi DB setelah seed:all (M10 audit task).
 * Usage: node scripts/verify-seed.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { pool } = require('../src/db/pool');

(async () => {
  try {
    const users = await pool.query('SELECT email, role, nama FROM users ORDER BY role, nama');
    console.log('=== USERS (' + users.rows.length + ' total) ===');
    console.table(users.rows);

    const counts = await pool.query(`
      SELECT 'master_matkul' AS tabel, COUNT(*)::int AS jumlah FROM master_matkul
      UNION ALL SELECT 'master_matkul_edge', COUNT(*)::int FROM master_matkul_edge
      UNION ALL SELECT 'periode', COUNT(*)::int FROM periode
      UNION ALL SELECT 'profile_dosen', COUNT(*)::int FROM profile_dosen
      UNION ALL SELECT 'profile_mahasiswa', COUNT(*)::int FROM profile_mahasiswa
      UNION ALL SELECT 'kelas', COUNT(*)::int FROM kelas
      UNION ALL SELECT 'sesi_kelas', COUNT(*)::int FROM sesi_kelas
      UNION ALL SELECT 'rencana_studi', COUNT(*)::int FROM rencana_studi
      UNION ALL SELECT 'rencana_studi_item', COUNT(*)::int FROM rencana_studi_item
      UNION ALL SELECT 'riwayat_nilai', COUNT(*)::int FROM riwayat_nilai
    `);
    console.log('\n=== COUNTS ===');
    console.table(counts.rows);

    const assignment = await pool.query(`
      SELECT pm.nim, u.nama AS mahasiswa, COALESCE(dw.nama, '(unassigned)') AS dosen_wali
      FROM profile_mahasiswa pm
      JOIN users u ON u.id = pm.user_id
      LEFT JOIN users dw ON dw.id = pm.dosen_wali_id
      ORDER BY pm.nim
    `);
    console.log('\n=== MAHASISWA ASSIGNMENT ===');
    console.table(assignment.rows);
  } catch (err) {
    console.error('verify-seed error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
