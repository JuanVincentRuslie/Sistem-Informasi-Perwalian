exports.up = (pgm) => {
  pgm.createTable('sesi_kelas', {
    id: { type: 'bigserial', primaryKey: true },
    kelas_id: {
      type: 'bigint',
      notNull: true,
      references: '"kelas"(id)',
      onDelete: 'CASCADE',
    },
    nomor_sesi: { type: 'smallint', notNull: true },
    hari: {
      type: 'varchar(10)',
      notNull: true,
      check: "hari IN ('senin','selasa','rabu','kamis','jumat','sabtu')",
    },
    jam_mulai: { type: 'time', notNull: true },
    jam_selesai: { type: 'time', notNull: true },
    bentuk_pembelajaran: { type: 'varchar(30)' },
    dosen_utama: { type: 'varchar(255)' },
    ruangan: { type: 'varchar(50)' },
  });

  pgm.addConstraint(
    'sesi_kelas',
    'uq_sesi_kelas_kelas_nomor_hari_jam',
    'UNIQUE (kelas_id, nomor_sesi, hari, jam_mulai)',
  );
  pgm.addConstraint('sesi_kelas', 'chk_sesi_jam', 'CHECK (jam_selesai > jam_mulai)');

  pgm.createIndex('sesi_kelas', 'kelas_id', { name: 'idx_sesi_kelas' });
};

exports.down = (pgm) => {
  pgm.dropTable('sesi_kelas');
};
