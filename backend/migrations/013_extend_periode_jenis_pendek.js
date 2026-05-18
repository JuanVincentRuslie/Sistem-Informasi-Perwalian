exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE periode
    DROP CONSTRAINT IF EXISTS periode_jenis_check;

    ALTER TABLE periode
    ADD CONSTRAINT periode_jenis_check
    CHECK (jenis IN ('ganjil', 'genap', 'pendek'));
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE periode
    DROP CONSTRAINT IF EXISTS periode_jenis_check;

    ALTER TABLE periode
    ADD CONSTRAINT periode_jenis_check
    CHECK (jenis IN ('ganjil', 'genap'));
  `);
};
