// Helpers untuk DpsUploadPanel preview & confirm payload.
// Sks tidak divalidasi/dihitung di sini — backend yang lookup dari master_matkul
// saat confirm. Frontend cuma validasi field yang bisa diedit user.

export const NILAI_HURUF_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'E'];
export const STATUS_OPTIONS = ['LULUS', 'TIDAK_LULUS'];

const NILAI_HURUF_SET = new Set(NILAI_HURUF_OPTIONS);

export function validatePreviewRow(row) {
  const nextRow = {
    ...row,
    kode_matkul: String(row.kode_matkul ?? '').toUpperCase(),
  };
  const errors = [];

  if (!nextRow.kode_matkul.trim()) errors.push('Kode kosong');
  if (!String(nextRow.nama_matkul ?? '').trim()) errors.push('Nama kosong');
  if (!NILAI_HURUF_SET.has(nextRow.nilai_huruf)) errors.push('Nilai tidak valid');
  if (!STATUS_OPTIONS.includes(nextRow.status)) errors.push('Status tidak valid');

  return {
    ...nextRow,
    valid: errors.length === 0,
    errors,
  };
}

export function calculatePreviewSummary(rows) {
  const validRows = rows.filter((row) => row.valid);

  return {
    total_rows: rows.length,
    valid_rows: validRows.length,
  };
}

export function toConfirmItems(previewData) {
  return previewData.preview.map((row) => ({
    kode_matkul: row.kode_matkul.trim().toUpperCase(),
    nama_matkul: row.nama_matkul.trim(),
    nilai_huruf: row.nilai_huruf,
    nilai_angka: row.nilai_angka === '' || row.nilai_angka == null ? null : Number(row.nilai_angka),
    status: row.status,
  }));
}
