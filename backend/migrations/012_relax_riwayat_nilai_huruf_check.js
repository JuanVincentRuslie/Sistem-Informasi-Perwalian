/**
 * Relax CHECK constraint nilai_huruf di riwayat_nilai supaya bisa terima
 * grade C-, P (pass tanpa nilai), dan F (fail) — yang dihasilkan parser DPS.
 *
 * Sebelum: allowed = {A, A-, B+, B, B-, C+, C, D, E}
 * Sesudah: allowed = {A, A-, B+, B, B-, C+, C, C-, D, E, P, F}
 *
 * Tanpa migrasi ini, INSERT riwayat_nilai dari DPS upload akan gagal kalau ada
 * matkul dengan grade C-/P/F.
 */
exports.up = (pgm) => {
  pgm.dropConstraint('riwayat_nilai', 'riwayat_nilai_nilai_huruf_check', { ifExists: true });
  pgm.addConstraint('riwayat_nilai', 'riwayat_nilai_nilai_huruf_check', {
    check: "nilai_huruf IN ('A','A-','B+','B','B-','C+','C','C-','D','E','P','F')",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('riwayat_nilai', 'riwayat_nilai_nilai_huruf_check', { ifExists: true });
  pgm.addConstraint('riwayat_nilai', 'riwayat_nilai_nilai_huruf_check', {
    check: "nilai_huruf IN ('A','A-','B+','B','B-','C+','C','D','E')",
  });
};
