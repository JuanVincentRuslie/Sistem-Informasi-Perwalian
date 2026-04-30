/**
 * Seed: master_matkul (42 node) + master_matkul_edge (31 edge).
 * Digabung dalam satu file karena edge bergantung pada ID matkul yang baru diinsert.
 * Usage: node src/seeds/seed-master-matkul.js
 */
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { query, pool } = require('../db/pool');

// Data dari frontend/src/api/_mock/pohon-kurikulum/kurikulum2023Nodes.js
// code[0] = kode_aktif, code[1..] = kode_alias
const MATKUL_DATA = [
  // Semester 1
  { id: 1, code: ['AIF231101'], label: 'Matematika Dasar', sks: 4, semester: 1, kolom: 4, tipe: 'wajib' },
  { id: 2, code: ['AIF231103', 'AIF181101'], label: 'Dasar Pemrograman', sks: 4, semester: 1, kolom: 7, tipe: 'wajib' },
  { id: 3, code: ['AIF231105', 'AIF181107'], label: 'Matematika Diskret', sks: 4, semester: 1, kolom: 5, tipe: 'wajib' },
  { id: 4, code: ['MKU230110'], label: 'Pendidikan Kewarganegaraan', sks: 2, semester: 1, kolom: 1, tipe: 'wajib' },
  { id: 5, code: ['MKU230120'], label: 'Bahasa Indonesia', sks: 2, semester: 1, kolom: 3, tipe: 'wajib' },
  { id: 6, code: ['MKU230130'], label: 'Logika', sks: 2, semester: 1, kolom: 2, tipe: 'wajib' },
  // Semester 2
  { id: 7, code: ['AIF231104'], label: 'Algoritma dan Pemrograman', sks: 4, semester: 2, kolom: 11, tipe: 'wajib' },
  { id: 8, code: ['AIF231106'], label: 'Logika Informatika', sks: 3, semester: 2, kolom: 4, tipe: 'wajib' },
  { id: 9, code: ['AIF231202'], label: 'Arsitektur dan Organisasi Komputer', sks: 4, semester: 2, kolom: 6, tipe: 'wajib' },
  { id: 10, code: ['AIF231402'], label: 'Statistika untuk Komputasi', sks: 3, semester: 2, kolom: 8, tipe: 'wajib' },
  { id: 11, code: ['MKU230140'], label: 'Pendidikan Pancasila', sks: 2, semester: 2, kolom: 2, tipe: 'wajib' },
  { id: 12, code: ['MKU230150'], label: 'Etika Dasar', sks: 2, semester: 2, kolom: 1, tipe: 'wajib' },
  // Semester 3
  { id: 13, code: ['AIF232101', 'AIF181106'], label: 'Matriks dan Ruang Vektor', sks: 2, semester: 3, kolom: 2, tipe: 'wajib' },
  { id: 14, code: ['AIF232103'], label: 'Pemrograman Berorientasi Objek', sks: 4, semester: 3, kolom: 11, tipe: 'wajib' },
  { id: 15, code: ['AIF232105'], label: 'Struktur Diskret', sks: 3, semester: 3, kolom: 5, tipe: 'wajib' },
  { id: 16, code: ['AIF232107'], label: 'Algoritma dan Struktur Data', sks: 4, semester: 3, kolom: 9, tipe: 'wajib' },
  { id: 17, code: ['AIF232201'], label: 'Sistem Operasi', sks: 3, semester: 3, kolom: 6, tipe: 'wajib' },
  { id: 18, code: ['MKU230180'], label: 'Estetika', sks: 2, semester: 3, kolom: 1, tipe: 'wajib' },
  // Semester 4
  { id: 19, code: ['AIF232002'], label: 'Teknik Presentasi', sks: 2, semester: 4, kolom: 1, tipe: 'wajib' },
  { id: 20, code: ['AIF232102'], label: 'Analisis dan Desain Perangkat Lunak', sks: 2, semester: 4, kolom: 12, tipe: 'wajib' },
  { id: 21, code: ['AIF232104'], label: 'Desain dan Analisis Algoritma', sks: 4, semester: 4, kolom: 5, tipe: 'wajib' },
  { id: 22, code: ['AIF232202'], label: 'Jaringan Komputer', sks: 4, semester: 4, kolom: 6, tipe: 'wajib' },
  { id: 23, code: ['AIF232301'], label: 'Manajemen Informasi dan Basis Data', sks: 4, semester: 4, kolom: 10, tipe: 'wajib' },
  { id: 24, code: ['MKU230160'], label: 'Pendidikan Agama Katolik', sks: 2, semester: 4, kolom: 2, tipe: 'wajib' },
  { id: 25, code: ['MKU230170'], label: 'Fenomenologi Agama', sks: 2, semester: 4, kolom: 3, tipe: 'wajib' },
  // Semester 5
  { id: 26, code: ['AIF233101'], label: 'Rekayasa Perangkat Lunak', sks: 4, semester: 5, kolom: 15, tipe: 'wajib' },
  { id: 27, code: ['AIF233401'], label: 'Pengantar dan Aplikasi Data Science', sks: 3, semester: 5, kolom: 7, tipe: 'wajib' },
  { id: 28, code: ['AIF182308'], label: 'Pengantar Sistem Informasi', sks: 3, semester: 5, kolom: 11, tipe: 'wajib' },
  { id: 29, code: ['AIF233103'], label: 'Keamanan Informasi', sks: 3, semester: 5, kolom: 9, tipe: 'wajib' },
  { id: 30, code: ['AIF233105'], label: 'Artificial Intelligence', sks: 4, semester: 5, kolom: 4, tipe: 'wajib' },
  { id: 31, code: ['AIF233107'], label: 'Desain Antarmuka Grafis', sks: 2, semester: 5, kolom: 14, tipe: 'wajib' },
  { id: 32, code: ['AIF233201'], label: 'Pemrograman Berbasis Web', sks: 3, semester: 5, kolom: 10, tipe: 'wajib' },
  { id: 33, code: ['AIF233301'], label: 'Manajemen Proyek', sks: 2, semester: 5, kolom: 13, tipe: 'wajib' },
  // Semester 6
  { id: 34, code: ['AIF233002'], label: 'Sosioinformatika dan Profesionalisme', sks: 3, semester: 6, kolom: 1, tipe: 'wajib' },
  { id: 35, code: ['AIF233102'], label: 'Machine Learning', sks: 3, semester: 6, kolom: 4, tipe: 'wajib' },
  { id: 36, code: ['AIF183310'], label: 'Proyek Data Science 1', sks: 3, semester: 6, kolom: 7, tipe: 'wajib' },
  { id: 37, code: ['AIF183308'], label: 'Proyek Sistem Informasi 1', sks: 3, semester: 6, kolom: 16, tipe: 'wajib' },
  // Semester 7
  { id: 38, code: ['AIF234001'], label: 'Tugas Akhir 1', sks: 3, semester: 7, kolom: 1, tipe: 'wajib' },
  { id: 39, code: ['AIF234101'], label: 'Proyek Informatika', sks: 3, semester: 7, kolom: 14, tipe: 'wajib' },
  { id: 40, code: ['AIF184303'], label: 'Proyek Sistem Informasi 2', sks: 3, semester: 7, kolom: 11, tipe: 'wajib' },
  { id: 41, code: ['AIF234401'], label: 'Proyek Data Science 2', sks: 3, semester: 7, kolom: 7, tipe: 'wajib' },
  // Semester 8
  { id: 42, code: ['AIF234002'], label: 'Tugas Akhir 2', sks: 6, semester: 8, kolom: 1, tipe: 'wajib' },
];

// Data dari frontend/src/api/_mock/pohon-kurikulum/kurikulum2023Edges.js
// sourceId/targetId merujuk ke MATKUL_DATA[].id (frontend id), bukan DB id
const EDGE_DATA = [
  { sourceId: 2, targetId: 27, relationType: 'prasyarat_lulus' },
  { sourceId: 10, targetId: 27, relationType: 'prasyarat_tempuh' },
  { sourceId: 7, targetId: 14, relationType: 'prasyarat_tempuh' },
  { sourceId: 7, targetId: 16, relationType: 'prasyarat_tempuh' },
  { sourceId: 9, targetId: 17, relationType: 'prasyarat_lulus' },
  { sourceId: 14, targetId: 20, relationType: 'prasyarat_tempuh' },
  { sourceId: 14, targetId: 23, relationType: 'prasyarat_tempuh' },
  { sourceId: 14, targetId: 28, relationType: 'prasyarat_tempuh' },
  { sourceId: 16, targetId: 17, relationType: 'prasyarat_tempuh_atau_tempuh_bersama' },
  { sourceId: 16, targetId: 23, relationType: 'prasyarat_tempuh' },
  { sourceId: 16, targetId: 29, relationType: 'prasyarat_tempuh' },
  { sourceId: 16, targetId: 21, relationType: 'prasyarat_lulus' },
  { sourceId: 17, targetId: 22, relationType: 'prasyarat_lulus' },
  { sourceId: 15, targetId: 21, relationType: 'prasyarat_lulus' },
  { sourceId: 19, targetId: 38, relationType: 'prasyarat_lulus' },
  { sourceId: 20, targetId: 33, relationType: 'prasyarat_tempuh' },
  { sourceId: 20, targetId: 31, relationType: 'prasyarat_tempuh' },
  { sourceId: 20, targetId: 26, relationType: 'prasyarat_tempuh' },
  { sourceId: 23, targetId: 32, relationType: 'prasyarat_tempuh' },
  { sourceId: 23, targetId: 28, relationType: 'prasyarat_tempuh' },
  { sourceId: 33, targetId: 39, relationType: 'prasyarat_tempuh' },
  { sourceId: 26, targetId: 37, relationType: 'prasyarat_tempuh' },
  { sourceId: 26, targetId: 39, relationType: 'prasyarat_tempuh' },
  { sourceId: 27, targetId: 36, relationType: 'prasyarat_tempuh' },
  { sourceId: 28, targetId: 40, relationType: 'prasyarat_tempuh_atau_tempuh_bersama' },
  { sourceId: 30, targetId: 35, relationType: 'prasyarat_tempuh' },
  { sourceId: 36, targetId: 41, relationType: 'prasyarat_lulus' },
  { sourceId: 37, targetId: 40, relationType: 'prasyarat_lulus' },
  { sourceId: 38, targetId: 42, relationType: 'prasyarat_lulus_atau_tempuh_bersama' },
  { sourceId: 8, targetId: 30, relationType: 'prasyarat_lulus_atau_tempuh_bersama' },
  { sourceId: 21, targetId: 30, relationType: 'prasyarat_lulus_atau_tempuh_bersama' },
];

async function seedMasterMatkul() {
  // Cek apakah sudah ada data
  const existing = await query('SELECT COUNT(*) AS count FROM master_matkul');
  if (Number(existing.rows[0].count) > 0) {
    console.log('master_matkul sudah ada data. Skip.');
    await pool.end();
    return;
  }

  // Insert semua matkul, simpan mapping frontendId → dbId
  const frontendIdToDbId = {};

  for (const m of MATKUL_DATA) {
    const kodeAktif = m.code[0];
    const kodeAlias = m.code.slice(1); // bisa kosong []

    const result = await query(
      `INSERT INTO master_matkul (kode_aktif, kode_alias, nama, sks, semester, kolom, tipe)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [kodeAktif, kodeAlias, m.label, m.sks, m.semester, m.kolom, m.tipe],
    );

    frontendIdToDbId[m.id] = result.rows[0].id;
  }

  console.log(`✓ ${MATKUL_DATA.length} master_matkul inserted.`);

  // Insert edges menggunakan DB id hasil lookup di atas
  for (const edge of EDGE_DATA) {
    const sourceDbId = frontendIdToDbId[edge.sourceId];
    const targetDbId = frontendIdToDbId[edge.targetId];

    if (!sourceDbId || !targetDbId) {
      console.warn(`  WARN: edge ${edge.sourceId}→${edge.targetId} tidak bisa di-resolve, skip`);
      continue;
    }

    await query(
      'INSERT INTO master_matkul_edge (source_id, target_id, relation_type) VALUES ($1, $2, $3)',
      [sourceDbId, targetDbId, edge.relationType],
    );
  }

  console.log(`✓ ${EDGE_DATA.length} master_matkul_edge inserted.`);
  await pool.end();
}

seedMasterMatkul().catch((err) => {
  console.error('Seed gagal:', err.message);
  process.exit(1);
});
