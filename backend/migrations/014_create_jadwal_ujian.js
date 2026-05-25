exports.up = (pgm) => {
  pgm.createTable('jadwal_ujian', {
    id: { type: 'bigserial', primaryKey: true },
    periode_id: {
      type: 'bigint',
      notNull: true,
      references: '"periode"(id)',
      onDelete: 'RESTRICT',
    },
    // Soft ref ke matkul (sama seperti kelas — tanpa FK ke master_matkul)
    kode_matkul: { type: 'varchar(20)', notNull: true },
    jenis: {
      type: 'varchar(5)',
      notNull: true,
      check: "jenis IN ('UTS','UAS')",
    },
    shift: { type: 'smallint', notNull: true, default: 1 },
    tanggal: { type: 'date', notNull: true },
    jam_mulai: { type: 'time', notNull: true },
    jam_selesai: { type: 'time', notNull: true },
  });

  pgm.addConstraint(
    'jadwal_ujian',
    'uq_jadwal_ujian_periode_matkul_jenis_shift',
    'UNIQUE (periode_id, kode_matkul, jenis, shift)',
  );
  pgm.addConstraint('jadwal_ujian', 'chk_jadwal_ujian_jam', 'CHECK (jam_selesai > jam_mulai)');

  pgm.createIndex('jadwal_ujian', ['periode_id', 'kode_matkul'], {
    name: 'idx_jadwal_ujian_periode_kode',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('jadwal_ujian');
};
