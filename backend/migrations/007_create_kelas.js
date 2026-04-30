exports.up = (pgm) => {
  pgm.createTable('kelas', {
    id: { type: 'bigserial', primaryKey: true },
    periode_id: {
      type: 'bigint',
      notNull: true,
      references: '"periode"(id)',
      onDelete: 'RESTRICT',
    },
    // Dari Excel — tidak ada FK ke master_matkul (soft ref via string)
    kode_matkul: { type: 'varchar(20)', notNull: true },
    nama_matkul: { type: 'varchar(255)', notNull: true },
    sks: { type: 'smallint', notNull: true },
    nama_kelas: { type: 'varchar(5)', notNull: true },
    tipe: { type: 'varchar(10)' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.addConstraint(
    'kelas',
    'uq_kelas_periode_kode_nama',
    'UNIQUE (periode_id, kode_matkul, nama_kelas)',
  );

  pgm.createIndex('kelas', ['periode_id', 'kode_matkul'], { name: 'idx_kelas_periode_kode' });
  pgm.createIndex('kelas', 'periode_id', { name: 'idx_kelas_periode' });
};

exports.down = (pgm) => {
  pgm.dropTable('kelas');
};
