const sleep = () => new Promise((resolve) => setTimeout(resolve, 300));

const NILAI_BOBOT = {
  A: 4,
  'B+': 3.5,
  B: 3,
  'C+': 2.5,
  C: 2,
  D: 1,
  E: 0,
};

const BASE_PREVIEW_ROWS = [
  {
    kode_matkul: 'AIF231103',
    nama_matkul: 'Dasar Pemrograman',
    sks: 4,
    nilai_huruf: 'A',
    nilai_angka: 90,
    status: 'LULUS',
    valid: true,
    errors: [],
  },
  {
    kode_matkul: 'AIF231104',
    nama_matkul: 'Matematika Diskrit',
    sks: 3,
    nilai_huruf: 'B+',
    nilai_angka: 78,
    status: 'LULUS',
    valid: true,
    errors: [],
  },
  {
    kode_matkul: 'AIF231105',
    nama_matkul: 'Dasar Sistem Digital',
    sks: 3,
    nilai_huruf: 'B',
    nilai_angka: 74,
    status: 'LULUS',
    valid: true,
    errors: [],
  },
  {
    kode_matkul: 'AIF231203',
    nama_matkul: 'Struktur Data',
    sks: 4,
    nilai_huruf: 'B+',
    nilai_angka: 80,
    status: 'LULUS',
    valid: true,
    errors: [],
  },
  {
    kode_matkul: 'AIF231204',
    nama_matkul: 'Basis Data',
    sks: 3,
    nilai_huruf: 'A',
    nilai_angka: 88,
    status: 'LULUS',
    valid: true,
    errors: [],
  },
  {
    kode_matkul: 'AIF231205',
    nama_matkul: 'Aljabar Linear',
    sks: 3,
    nilai_huruf: 'C+',
    nilai_angka: 68,
    status: 'LULUS',
    valid: true,
    errors: [],
  },
];

const previewStore = new Map();

function toRiwayatNilaiItem(row, index, periode) {
  return {
    id: index + 1,
    kode_matkul: row.kode_matkul,
    nama_matkul: row.nama_matkul,
    sks: row.sks,
    periode,
    nilai_huruf: row.nilai_huruf,
    nilai_angka: row.nilai_angka,
    status: row.status,
  };
}

let savedRiwayatNilai = BASE_PREVIEW_ROWS.map((row, index) => (
  toRiwayatNilaiItem(row, index, { id: 2, nama: 'Genap 2023/2024' })
));

function buildRowsForFile(file) {
  const rows = BASE_PREVIEW_ROWS.map((row) => ({ ...row, errors: [...row.errors] }));
  const filename = file?.name?.toLowerCase() ?? '';

  if (filename.includes('invalid') || filename.includes('error')) {
    rows.push({
      kode_matkul: 'AIF999999',
      nama_matkul: 'Kode Tidak Dikenali',
      sks: 0,
      nilai_huruf: '-',
      nilai_angka: null,
      status: 'PERLU_CEK',
      valid: false,
      errors: ['Kode mata kuliah tidak ditemukan di master kurikulum'],
    });
  }

  return rows;
}

function calculateSummary(rows) {
  const validRows = rows.filter((row) => row.valid);
  const totalBobot = validRows.reduce((sum, row) => {
    const bobot = NILAI_BOBOT[row.nilai_huruf] ?? 0;
    return sum + bobot * row.sks;
  }, 0);
  const totalSks = validRows.reduce((sum, row) => sum + row.sks, 0);

  return {
    total_rows: rows.length,
    valid_rows: validRows.length,
    ipk_terhitung: totalSks === 0 ? 0 : Number((totalBobot / totalSks).toFixed(2)),
  };
}

export async function mockGetRiwayatNilaiSaya() {
  await sleep();

  return {
    success: true,
    data: savedRiwayatNilai,
    message: 'OK',
  };
}

export async function mockUploadDps(file) {
  await sleep();

  const preview = buildRowsForFile(file);
  const summary = calculateSummary(preview);
  const periode_terdeteksi = { id: 3, nama: 'Ganjil 2025/2026' };
  const upload_token = `mock-dps-${Date.now()}`;

  previewStore.set(upload_token, {
    preview,
    summary,
    periode_terdeteksi,
  });

  return {
    success: true,
    data: {
      periode_terdeteksi,
      preview,
      summary,
      upload_token,
    },
    message: 'Preview DPS berhasil dibuat',
  };
}

export async function mockConfirmUploadDps({ upload_token, mode = 'replace', items = [] }) {
  await sleep();

  const previewPayload = previewStore.get(upload_token);

  if (!previewPayload) {
    return {
      success: false,
      data: null,
      message: 'Upload token tidak ditemukan atau sudah kedaluwarsa',
    };
  }

  const invalidRows = items.filter((item) => item.valid === false);

  if (invalidRows.length > 0) {
    return {
      success: false,
      data: null,
      message: 'Masih ada baris DPS yang belum valid',
    };
  }

  savedRiwayatNilai = items.map((item, index) => (
    toRiwayatNilaiItem(item, index, previewPayload.periode_terdeteksi)
  ));

  previewStore.delete(upload_token);

  return {
    success: true,
    data: {
      mode,
      periode: previewPayload.periode_terdeteksi,
      saved_rows: savedRiwayatNilai.length,
      summary: {
        ...calculateSummary(items),
        total_sks_lulus: items
          .filter((item) => item.status === 'LULUS')
          .reduce((sum, item) => sum + item.sks, 0),
      },
      cache_updated: true,
    },
    message: 'Riwayat nilai berhasil diperbarui',
  };
}
