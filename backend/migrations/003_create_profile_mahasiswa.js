exports.up = (pgm) => {
  pgm.createTable('profile_mahasiswa', {
    user_id: {
      type: 'bigint',
      primaryKey: true,
      references: '"users"(id)',
      onDelete: 'CASCADE',
    },
    nim: { type: 'varchar(20)', notNull: true, unique: true },
    angkatan: { type: 'smallint', notNull: true },
    // dosen_wali_id → users(id), bukan ke profile_dosen langsung
    dosen_wali_id: { type: 'bigint', references: '"users"(id)', onDelete: 'SET NULL' },
    // Cache fields — di-update saat DPS upload
    ipk: { type: 'decimal(4,2)', default: 0 },
    ips_terakhir: { type: 'decimal(4,2)' },
    total_sks_lulus: { type: 'smallint', default: 0 },
    total_sks_wajib_lulus: { type: 'smallint', default: 0 },
    total_sks_pilihan_lulus: { type: 'smallint', default: 0 },
    cache_updated_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('profile_mahasiswa', 'dosen_wali_id', { name: 'idx_mahasiswa_dosen_wali' });
  pgm.createIndex('profile_mahasiswa', 'angkatan', { name: 'idx_mahasiswa_angkatan' });
};

exports.down = (pgm) => {
  pgm.dropTable('profile_mahasiswa');
};
