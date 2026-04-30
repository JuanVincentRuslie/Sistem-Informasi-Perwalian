exports.up = (pgm) => {
  pgm.createTable('riwayat_nilai', {
    id: { type: 'bigserial', primaryKey: true },
    mahasiswa_id: {
      type: 'bigint',
      notNull: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    periode_id: {
      type: 'bigint',
      notNull: true,
      references: '"periode"(id)',
      onDelete: 'RESTRICT',
    },
    // Snapshot — tidak ada FK ke master_matkul (soft ref via string)
    kode_matkul: { type: 'varchar(20)', notNull: true },
    nama_matkul: { type: 'varchar(255)', notNull: true },
    sks: { type: 'smallint', notNull: true },
    nilai_huruf: {
      type: 'varchar(2)',
      notNull: true,
      check: "nilai_huruf IN ('A','A-','B+','B','B-','C+','C','D','E')",
    },
    nilai_angka: { type: 'decimal(5,2)' },
    status: {
      type: 'varchar(15)',
      notNull: true,
      check: "status IN ('LULUS', 'TIDAK_LULUS')",
    },
    sumber: {
      type: 'varchar(20)',
      notNull: true,
      default: "'manual_input'",
      check: "sumber IN ('dps_upload', 'manual_input', 'seed')",
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // 1 nilai per mahasiswa per mata kuliah per periode
  pgm.addConstraint(
    'riwayat_nilai',
    'uq_nilai_mahasiswa_kode_periode',
    'UNIQUE (mahasiswa_id, kode_matkul, periode_id)',
  );

  pgm.createIndex('riwayat_nilai', 'mahasiswa_id', { name: 'idx_rn_mahasiswa' });
  pgm.createIndex('riwayat_nilai', 'kode_matkul', { name: 'idx_rn_kode' });
};

exports.down = (pgm) => {
  pgm.dropTable('riwayat_nilai');
};
