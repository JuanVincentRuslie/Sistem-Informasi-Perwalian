// Helpers untuk DpsUploadPanel. Mahasiswa tidak boleh edit hasil parser DPS,
// jadi frontend hanya menampilkan apa adanya dan meneruskan ke endpoint confirm.

export function calculatePreviewSummary(rows) {
  return { total_rows: rows.length };
}

export function toConfirmItems(previewData) {
  return previewData.preview.map((row) => ({
    kode_matkul: row.kode_matkul,
    nama_matkul: row.nama_matkul,
    nilai_huruf: row.nilai_huruf,
    nilai_angka: row.nilai_angka ?? null,
    status: row.status,
  }));
}
