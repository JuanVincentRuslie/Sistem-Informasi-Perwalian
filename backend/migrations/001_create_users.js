/**
 * Migration: users table
 * Tabel dasar auth — dibutuhkan Milestone 1 agar auth bisa jalan.
 * Tabel lain dibuat di Milestone 2.
 */
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'bigserial', primaryKey: true },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    nama: { type: 'varchar(255)', notNull: true },
    role: {
      type: 'varchar(20)',
      notNull: true,
      check: "role IN ('kaprodi', 'dosen_wali', 'mahasiswa')",
    },
    google_id: { type: 'varchar(255)', unique: true },
    avatar_url: { type: 'text' },
    last_login_at: { type: 'timestamptz' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createIndex('users', 'role', { name: 'idx_users_role' });
  pgm.createIndex('users', 'google_id', { name: 'idx_users_google_id' });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
