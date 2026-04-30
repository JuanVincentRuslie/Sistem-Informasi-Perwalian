exports.up = (pgm) => {
  pgm.createTable('profile_dosen', {
    user_id: {
      type: 'bigint',
      primaryKey: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    nip: { type: 'varchar(30)', notNull: true, unique: true },
    jadwal_perwalian: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('profile_dosen');
};
