exports.up = (pgm) => {
  pgm.createTable('rencana_studi', {
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
    status: {
      type: 'varchar(15)',
      notNull: true,
      default: "'DRAFT'",
      check: "status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')",
    },
    catatan_dosen: { type: 'text' },
    reviewed_by: { type: 'bigint', references: '"users"(id)', onDelete: 'SET NULL' },
    submitted_at: { type: 'timestamptz' },
    reviewed_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // 1 FRS per mahasiswa per periode
  pgm.addConstraint('rencana_studi', 'uq_rs_mahasiswa_periode', 'UNIQUE (mahasiswa_id, periode_id)');

  pgm.createIndex('rencana_studi', 'status', { name: 'idx_rs_status' });
  pgm.createIndex('rencana_studi', 'mahasiswa_id', { name: 'idx_rs_mahasiswa' });
  pgm.createIndex('rencana_studi', 'periode_id', { name: 'idx_rs_periode' });
};

exports.down = (pgm) => {
  pgm.dropTable('rencana_studi');
};
