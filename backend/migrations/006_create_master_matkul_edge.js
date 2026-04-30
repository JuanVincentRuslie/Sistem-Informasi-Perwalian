exports.up = (pgm) => {
  pgm.createTable('master_matkul_edge', {
    id: { type: 'bigserial', primaryKey: true },
    source_id: {
      type: 'bigint',
      notNull: true,
      references: '"master_matkul"(id)',
      onDelete: 'CASCADE',
    },
    target_id: {
      type: 'bigint',
      notNull: true,
      references: '"master_matkul"(id)',
      onDelete: 'CASCADE',
    },
    relation_type: {
      type: 'varchar(50)',
      notNull: true,
      check: `relation_type IN (
        'prasyarat_lulus',
        'prasyarat_tempuh',
        'prasyarat_tempuh_atau_tempuh_bersama',
        'prasyarat_lulus_atau_tempuh_bersama'
      )`,
    },
  });

  pgm.addConstraint(
    'master_matkul_edge',
    'uq_edge_source_target_type',
    'UNIQUE (source_id, target_id, relation_type)',
  );
  pgm.addConstraint(
    'master_matkul_edge',
    'chk_edge_no_self_loop',
    'CHECK (source_id != target_id)',
  );

  pgm.createIndex('master_matkul_edge', 'source_id', { name: 'idx_edge_source' });
  pgm.createIndex('master_matkul_edge', 'target_id', { name: 'idx_edge_target' });
};

exports.down = (pgm) => {
  pgm.dropTable('master_matkul_edge');
};
