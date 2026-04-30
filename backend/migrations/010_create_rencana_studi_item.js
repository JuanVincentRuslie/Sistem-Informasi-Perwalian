exports.up = (pgm) => {
  pgm.createTable('rencana_studi_item', {
    id: { type: 'bigserial', primaryKey: true },
    rencana_studi_id: {
      type: 'bigint',
      notNull: true,
      references: '"rencana_studi"(id)',
      onDelete: 'CASCADE',
    },
    kelas_id: {
      type: 'bigint',
      notNull: true,
      references: '"kelas"(id)',
      onDelete: 'RESTRICT',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.addConstraint(
    'rencana_studi_item',
    'uq_rsi_rs_kelas',
    'UNIQUE (rencana_studi_id, kelas_id)',
  );

  pgm.createIndex('rencana_studi_item', 'rencana_studi_id', { name: 'idx_rsi_rs' });
};

exports.down = (pgm) => {
  pgm.dropTable('rencana_studi_item');
};
