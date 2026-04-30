exports.up = (pgm) => {
  pgm.createTable('periode', {
    id: { type: 'bigserial', primaryKey: true },
    nama: { type: 'varchar(50)', notNull: true, unique: true },
    tahun_mulai: { type: 'smallint', notNull: true },
    jenis: {
      type: 'varchar(10)',
      notNull: true,
      check: "jenis IN ('ganjil', 'genap')",
    },
    tanggal_mulai: { type: 'date', notNull: true },
    tanggal_selesai: { type: 'date', notNull: true },
    is_active: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // Constraint: tanggal_selesai >= tanggal_mulai
  pgm.addConstraint('periode', 'chk_periode_tanggal', 'CHECK (tanggal_selesai >= tanggal_mulai)');

  // Partial unique index: maksimal 1 periode aktif di seluruh sistem
  pgm.sql(`
    CREATE UNIQUE INDEX idx_periode_only_one_active
    ON periode((TRUE))
    WHERE is_active = TRUE
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('periode');
};
