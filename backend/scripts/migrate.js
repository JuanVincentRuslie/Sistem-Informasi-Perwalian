/**
 * Wrapper migrate yang load .env dulu sebelum jalankan node-pg-migrate.
 * Pakai process.execPath + args array (bukan shell) agar path spasi tidak pecah di Windows.
 * Usage: node scripts/migrate.js [up|down]
 */
const path = require('node:path');
const { spawnSync } = require('node:child_process');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const direction = process.argv[2] || 'up';
const migrationsDir = path.resolve(__dirname, '../migrations');
const binFile = path.resolve(__dirname, '../node_modules/node-pg-migrate/bin/node-pg-migrate.js');

// Gunakan process.execPath (path ke node.exe) dan pass args sebagai array —
// tidak lewat shell, jadi path dengan spasi tidak perlu di-quote.
const result = spawnSync(
  process.execPath,
  [binFile, direction, '--migrations-dir', migrationsDir],
  { stdio: 'inherit', env: process.env },
);

process.exit(result.status ?? 1);
