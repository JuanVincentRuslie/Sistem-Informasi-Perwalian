export const NILAI_HURUF_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E'];
export const STATUS_OPTIONS = ['LULUS', 'TIDAK_LULUS'];

const NILAI_BOBOT = {
  A: 4,
  'A-': 3.7,
  'B+': 3.5,
  B: 3,
  'B-': 2.7,
  'C+': 2.5,
  C: 2,
  D: 1,
  E: 0,
};

export function validatePreviewRow(row) {
  const nextRow = {
    ...row,
    kode_matkul: String(row.kode_matkul ?? '').toUpperCase(),
  };
  const errors = [];
  const sksNumber = Number(nextRow.sks);

  if (!nextRow.kode_matkul.trim()) errors.push('Kode kosong');
  if (!String(nextRow.nama_matkul ?? '').trim()) errors.push('Nama kosong');
  if (!Number.isFinite(sksNumber) || sksNumber <= 0) errors.push('SKS tidak valid');
  if (!Object.hasOwn(NILAI_BOBOT, nextRow.nilai_huruf)) errors.push('Nilai tidak valid');
  if (!STATUS_OPTIONS.includes(nextRow.status)) errors.push('Status tidak valid');

  return {
    ...nextRow,
    valid: errors.length === 0,
    errors,
  };
}

export function calculatePreviewSummary(rows) {
  const validRows = rows.filter((row) => row.valid);
  const totalSks = validRows.reduce((sum, row) => sum + Number(row.sks), 0);
  const totalBobot = validRows.reduce((sum, row) => (
    sum + (NILAI_BOBOT[row.nilai_huruf] ?? 0) * Number(row.sks)
  ), 0);

  return {
    total_rows: rows.length,
    valid_rows: validRows.length,
    ipk_terhitung: totalSks === 0 ? 0 : Number((totalBobot / totalSks).toFixed(2)),
  };
}

export function toConfirmItems(previewData) {
  const periodeId = previewData.periode_terdeteksi.id;

  return previewData.preview.map((row) => ({
    kode_matkul: row.kode_matkul.trim().toUpperCase(),
    nama_matkul: row.nama_matkul.trim(),
    sks: Number(row.sks),
    periode_id: periodeId,
    nilai_huruf: row.nilai_huruf,
    nilai_angka: row.nilai_angka === '' || row.nilai_angka === null ? null : Number(row.nilai_angka),
    status: row.status,
  }));
}
