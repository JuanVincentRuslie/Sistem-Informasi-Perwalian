exports.up = (pgm) => {
  pgm.createTable('master_matkul', {
    id: { type: 'bigserial', primaryKey: true },
    kode_aktif: { type: 'varchar(20)', notNull: true, unique: true },
    // Array kode lama — untuk match riwayat_nilai yang punya kode berbeda
    kode_alias: { type: 'text[]', default: pgm.func("'{}'") },
    nama: { type: 'varchar(255)', notNull: true },
    sks: { type: 'smallint', notNull: true },
    semester: { type: 'smallint', notNull: true },
    kolom: { type: 'smallint' },
    tipe: { type: 'varchar(10)', check: "tipe IN ('wajib', 'pilihan')" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('master_matkul', 'kode_aktif', { name: 'idx_matkul_kode_aktif' });
  pgm.createIndex('master_matkul', 'semester', { name: 'idx_matkul_semester' });
  // GIN index untuk pencarian di dalam array kode_alias
  pgm.sql(`CREATE INDEX idx_matkul_kode_alias ON master_matkul USING GIN(kode_alias)`);
};

exports.down = (pgm) => {
  pgm.dropTable('master_matkul');
};
