const NETWORK_DELAY_MS = {
  get: 300,
  mutation: 200,
};

const periodeAktif = {
  id: 3,
  nama: 'Ganjil 2025/2026',
  is_active: true,
};

const periodeSebelumnya = [
  {
    id: 2,
    nama: 'Genap 2024/2025',
    is_active: false,
  },
  {
    id: 1,
    nama: 'Ganjil 2024/2025',
    is_active: false,
  },
];

const kelas = [
  {
    id: 10,
    kode_matkul: 'AIF231103',
    nama_matkul: 'Dasar Pemrograman',
    sks: 4,
    nama_kelas: 'A',
    tipe: 'wajib',
    periode: periodeAktif,
    sesi: [
      {
        id: 50,
        nomor_sesi: 1,
        hari: 'senin',
        jam_mulai: '10:00',
        jam_selesai: '12:00',
        bentuk_pembelajaran: 'Kuliah',
        dosen_utama: 'Husnul Hakim S.Kom., M.T.',
        ruangan: 'R201',
      },
      {
        id: 51,
        nomor_sesi: 2,
        hari: 'rabu',
        jam_mulai: '08:00',
        jam_selesai: '10:00',
        bentuk_pembelajaran: 'Praktikum',
        dosen_utama: 'Husnul Hakim S.Kom., M.T.',
        ruangan: 'Lab IF 9016',
      },
    ],
  },
  {
    id: 11,
    kode_matkul: 'AIF232101',
    nama_matkul: 'Struktur Data',
    sks: 4,
    nama_kelas: 'B',
    tipe: 'wajib',
    periode: periodeAktif,
    sesi: [
      {
        id: 52,
        nomor_sesi: 1,
        hari: 'selasa',
        jam_mulai: '08:00',
        jam_selesai: '10:00',
        bentuk_pembelajaran: 'Kuliah',
        dosen_utama: 'Yosef Ardi S.Kom., M.T.',
        ruangan: 'R203',
      },
      {
        id: 53,
        nomor_sesi: 2,
        hari: 'kamis',
        jam_mulai: '13:00',
        jam_selesai: '15:00',
        bentuk_pembelajaran: 'Praktikum',
        dosen_utama: 'Yosef Ardi S.Kom., M.T.',
        ruangan: 'Lab IF 9017',
      },
    ],
  },
  {
    id: 12,
    kode_matkul: 'AIF233105',
    nama_matkul: 'Basis Data',
    sks: 3,
    nama_kelas: 'A',
    tipe: 'wajib',
    periode: periodeAktif,
    sesi: [
      {
        id: 54,
        nomor_sesi: 1,
        hari: 'senin',
        jam_mulai: '13:00',
        jam_selesai: '15:00',
        bentuk_pembelajaran: 'Kuliah',
        dosen_utama: 'Dr. Maria Lestari',
        ruangan: 'R302',
      },
    ],
  },
  {
    id: 13,
    kode_matkul: 'AIF234209',
    nama_matkul: 'Interaksi Manusia dan Komputer',
    sks: 3,
    nama_kelas: 'C',
    tipe: 'pilihan',
    periode: periodeAktif,
    sesi: [
      {
        id: 55,
        nomor_sesi: 1,
        hari: 'jumat',
        jam_mulai: '09:00',
        jam_selesai: '11:00',
        bentuk_pembelajaran: 'Kuliah',
        dosen_utama: 'Anita Wulandari S.T., M.T.',
        ruangan: 'R305',
      },
    ],
  },
  {
    id: 14,
    kode_matkul: 'AIF235301',
    nama_matkul: 'Rekayasa Perangkat Lunak',
    sks: 3,
    nama_kelas: 'A',
    tipe: 'wajib',
    periode: periodeAktif,
    sesi: [
      {
        id: 56,
        nomor_sesi: 1,
        hari: 'rabu',
        jam_mulai: '13:00',
        jam_selesai: '15:00',
        bentuk_pembelajaran: 'Kuliah',
        dosen_utama: 'Dr. I Made Putra',
        ruangan: 'R401',
      },
    ],
  },
  {
    id: 21,
    kode_matkul: 'AIF222104',
    nama_matkul: 'Matematika Diskrit',
    sks: 3,
    nama_kelas: 'A',
    tipe: 'wajib',
    periode: periodeSebelumnya[0],
    sesi: [
      {
        id: 60,
        nomor_sesi: 1,
        hari: 'selasa',
        jam_mulai: '10:00',
        jam_selesai: '12:00',
        bentuk_pembelajaran: 'Kuliah',
        dosen_utama: 'Dr. Ahmad Surya',
        ruangan: 'R202',
      },
    ],
  },
  {
    id: 22,
    kode_matkul: 'AIF222205',
    nama_matkul: 'Pemrograman Berorientasi Objek',
    sks: 4,
    nama_kelas: 'B',
    tipe: 'wajib',
    periode: periodeSebelumnya[0],
    sesi: [
      {
        id: 61,
        nomor_sesi: 1,
        hari: 'rabu',
        jam_mulai: '10:00',
        jam_selesai: '12:00',
        bentuk_pembelajaran: 'Kuliah',
        dosen_utama: 'Yosef Ardi S.Kom., M.T.',
        ruangan: 'R203',
      },
      {
        id: 62,
        nomor_sesi: 2,
        hari: 'jumat',
        jam_mulai: '13:00',
        jam_selesai: '15:00',
        bentuk_pembelajaran: 'Praktikum',
        dosen_utama: 'Yosef Ardi S.Kom., M.T.',
        ruangan: 'Lab IF 9017',
      },
    ],
  },
  {
    id: 31,
    kode_matkul: 'AIF211101',
    nama_matkul: 'Pengantar Informatika',
    sks: 2,
    nama_kelas: 'A',
    tipe: 'wajib',
    periode: periodeSebelumnya[1],
    sesi: [
      {
        id: 70,
        nomor_sesi: 1,
        hari: 'senin',
        jam_mulai: '08:00',
        jam_selesai: '10:00',
        bentuk_pembelajaran: 'Kuliah',
        dosen_utama: 'Dr. Sari Wijaya',
        ruangan: 'R101',
      },
    ],
  },
];

let nextRencanaStudiId = 26;
let nextItemId = 105;

const rencanaStudi = [
  {
    id: 25,
    periode: periodeAktif,
    status: 'REJECTED',
    catatan_dosen: 'Mohon ganti salah satu kelas karena jadwal praktikum bentrok dengan kegiatan perwalian.',
    submitted_at: '2025-08-15T10:30:00Z',
    reviewed_at: '2025-08-16T08:00:00Z',
    items: [
      { id: 100, kelas_id: 10 },
      { id: 101, kelas_id: 12 },
    ],
  },
  {
    id: 22,
    periode: periodeSebelumnya[0],
    status: 'APPROVED',
    catatan_dosen: 'Rencana studi sudah sesuai progres kurikulum.',
    submitted_at: '2025-02-03T09:30:00Z',
    reviewed_at: '2025-02-04T02:10:00Z',
    items: [
      { id: 102, kelas_id: 21 },
      { id: 103, kelas_id: 22 },
    ],
  },
  {
    id: 18,
    periode: periodeSebelumnya[1],
    status: 'APPROVED',
    catatan_dosen: null,
    submitted_at: '2024-08-12T07:00:00Z',
    reviewed_at: '2024-08-13T03:45:00Z',
    items: [
      { id: 104, kelas_id: 31 },
    ],
  },
];

const dosenBimbinganRencanaStudi = [
  {
    id: 101,
    mahasiswa: { id: 201, nim: '6180000001', nama: 'Mahasiswa A', ipk: 3.31 },
    periode: periodeAktif,
    status: 'SUBMITTED',
    total_sks: 20,
    submitted_at: '2025-08-15T10:30:00Z',
  },
  {
    id: null,
    mahasiswa: { id: 202, nim: '6180000002', nama: 'Mahasiswa B', ipk: 3.05 },
    periode: periodeAktif,
    status: 'DRAFT',
    total_sks: 0,
    submitted_at: null,
  },
  {
    id: null,
    mahasiswa: { id: 203, nim: '6180000003', nama: 'Mahasiswa C', ipk: 3.18 },
    periode: periodeAktif,
    status: 'DRAFT',
    total_sks: 0,
    submitted_at: null,
  },
  {
    id: 104,
    mahasiswa: { id: 204, nim: '6180000004', nama: 'Mahasiswa D', ipk: 3.72 },
    periode: periodeAktif,
    status: 'APPROVED',
    total_sks: 18,
    submitted_at: '2025-08-13T08:30:00Z',
  },
  {
    id: 105,
    mahasiswa: { id: 205, nim: '6180000005', nama: 'Mahasiswa E', ipk: 3.44 },
    periode: periodeAktif,
    status: 'APPROVED',
    total_sks: 21,
    submitted_at: '2025-08-12T07:00:00Z',
  },
  {
    id: 106,
    mahasiswa: { id: 206, nim: '6180000006', nama: 'Mahasiswa F', ipk: 3.67 },
    periode: periodeAktif,
    status: 'APPROVED',
    total_sks: 20,
    submitted_at: '2025-08-11T09:00:00Z',
  },
  {
    id: null,
    mahasiswa: { id: 207, nim: '6180000007', nama: 'Mahasiswa G', ipk: 2.91 },
    periode: periodeAktif,
    status: 'DRAFT',
    total_sks: 0,
    submitted_at: null,
  },
  {
    id: 108,
    mahasiswa: { id: 208, nim: '6180000008', nama: 'Mahasiswa H', ipk: 3.51 },
    periode: periodeAktif,
    status: 'APPROVED',
    total_sks: 19,
    submitted_at: '2025-08-10T11:15:00Z',
  },
  {
    id: 109,
    mahasiswa: { id: 209, nim: '6180000009', nama: 'Mahasiswa I', ipk: 3.22 },
    periode: periodeAktif,
    status: 'REJECTED',
    total_sks: 18,
    submitted_at: '2025-08-14T13:20:00Z',
  },
];

const mahasiswaBimbinganAkademik = {
  201: {
    angkatan: 2021,
    ips_terakhir: 3.18,
    total_sks_lulus: 100,
    total_sks_wajib_lulus: 80,
    total_sks_pilihan_lulus: 20,
  },
  202: {
    angkatan: 2021,
    ips_terakhir: 2.95,
    total_sks_lulus: 76,
    total_sks_wajib_lulus: 64,
    total_sks_pilihan_lulus: 12,
  },
  203: {
    angkatan: 2022,
    ips_terakhir: 3.04,
    total_sks_lulus: 70,
    total_sks_wajib_lulus: 61,
    total_sks_pilihan_lulus: 9,
  },
  204: {
    angkatan: 2021,
    ips_terakhir: 3.65,
    total_sks_lulus: 108,
    total_sks_wajib_lulus: 84,
    total_sks_pilihan_lulus: 24,
  },
  205: {
    angkatan: 2021,
    ips_terakhir: 3.36,
    total_sks_lulus: 96,
    total_sks_wajib_lulus: 78,
    total_sks_pilihan_lulus: 18,
  },
  206: {
    angkatan: 2020,
    ips_terakhir: 3.59,
    total_sks_lulus: 118,
    total_sks_wajib_lulus: 92,
    total_sks_pilihan_lulus: 26,
  },
  207: {
    angkatan: 2022,
    ips_terakhir: 2.88,
    total_sks_lulus: 64,
    total_sks_wajib_lulus: 58,
    total_sks_pilihan_lulus: 6,
  },
  208: {
    angkatan: 2020,
    ips_terakhir: 3.42,
    total_sks_lulus: 112,
    total_sks_wajib_lulus: 88,
    total_sks_pilihan_lulus: 24,
  },
  209: {
    angkatan: 2021,
    ips_terakhir: 3.11,
    total_sks_lulus: 92,
    total_sks_wajib_lulus: 74,
    total_sks_pilihan_lulus: 18,
  },
};

const dosenDetailRencanaStudi = [
  {
    id: 101,
    mahasiswa_id: 201,
    periode: periodeAktif,
    status: 'SUBMITTED',
    catatan_dosen: null,
    submitted_at: '2025-08-15T10:30:00Z',
    reviewed_at: null,
    items: [
      { id: 1001, kelas_id: 10 },
      { id: 1002, kelas_id: 12 },
      { id: 1003, kelas_id: 13 },
    ],
  },
  {
    id: 10001,
    mahasiswa_id: 201,
    periode: periodeSebelumnya[0],
    status: 'APPROVED',
    catatan_dosen: 'Rencana studi semester lalu sudah sesuai.',
    submitted_at: '2025-02-03T09:30:00Z',
    reviewed_at: '2025-02-04T02:10:00Z',
    items: [
      { id: 1004, kelas_id: 21 },
      { id: 1005, kelas_id: 22 },
    ],
  },
  {
    id: 10002,
    mahasiswa_id: 201,
    periode: periodeSebelumnya[1],
    status: 'APPROVED',
    catatan_dosen: null,
    submitted_at: '2024-08-12T07:00:00Z',
    reviewed_at: '2024-08-13T03:45:00Z',
    items: [
      { id: 1006, kelas_id: 31 },
    ],
  },
  {
    id: 104,
    mahasiswa_id: 204,
    periode: periodeAktif,
    status: 'APPROVED',
    catatan_dosen: 'Silakan lanjut, komposisi wajib dan pilihan sudah seimbang.',
    submitted_at: '2025-08-13T08:30:00Z',
    reviewed_at: '2025-08-13T10:30:00Z',
    items: [
      { id: 1007, kelas_id: 10 },
      { id: 1008, kelas_id: 11 },
      { id: 1009, kelas_id: 14 },
    ],
  },
  {
    id: 105,
    mahasiswa_id: 205,
    periode: periodeAktif,
    status: 'APPROVED',
    catatan_dosen: null,
    submitted_at: '2025-08-12T07:00:00Z',
    reviewed_at: '2025-08-12T09:00:00Z',
    items: [
      { id: 1010, kelas_id: 10 },
      { id: 1011, kelas_id: 12 },
      { id: 1012, kelas_id: 14 },
    ],
  },
  {
    id: 106,
    mahasiswa_id: 206,
    periode: periodeAktif,
    status: 'APPROVED',
    catatan_dosen: 'Perhatikan beban praktikum mingguannya.',
    submitted_at: '2025-08-11T09:00:00Z',
    reviewed_at: '2025-08-11T11:30:00Z',
    items: [
      { id: 1013, kelas_id: 11 },
      { id: 1014, kelas_id: 12 },
      { id: 1015, kelas_id: 13 },
      { id: 1016, kelas_id: 14 },
    ],
  },
  {
    id: 108,
    mahasiswa_id: 208,
    periode: periodeAktif,
    status: 'APPROVED',
    catatan_dosen: null,
    submitted_at: '2025-08-10T11:15:00Z',
    reviewed_at: '2025-08-10T14:00:00Z',
    items: [
      { id: 1017, kelas_id: 10 },
      { id: 1018, kelas_id: 11 },
      { id: 1019, kelas_id: 13 },
    ],
  },
  {
    id: 109,
    mahasiswa_id: 209,
    periode: periodeAktif,
    status: 'REJECTED',
    catatan_dosen: 'Tolong ganti kelas karena jadwalnya bentrok dengan praktikum.',
    submitted_at: '2025-08-14T13:20:00Z',
    reviewed_at: '2025-08-14T15:00:00Z',
    items: [
      { id: 1020, kelas_id: 10 },
      { id: 1021, kelas_id: 12 },
      { id: 1022, kelas_id: 14 },
    ],
  },
];

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function wrap(data, message = 'OK') {
  return {
    success: true,
    data: clone(data),
    message,
  };
}

function createMockError(status, message, data = null) {
  const error = new Error(message);
  error.status = status;
  error.response = {
    success: false,
    data,
    message,
  };
  return error;
}

function findKelasById(kelasId) {
  return kelas.find((item) => item.id === Number(kelasId));
}

function findPeriodeById(periodeId) {
  if (Number(periodeId) === periodeAktif.id) return periodeAktif;
  return periodeSebelumnya.find((periode) => periode.id === Number(periodeId));
}

function getRencanaStudiById(rencanaStudiId) {
  const found = rencanaStudi.find((item) => item.id === Number(rencanaStudiId));

  if (!found) {
    throw createMockError(404, 'Rencana studi tidak ditemukan.');
  }

  return found;
}

function getDosenBimbinganByMahasiswaId(mahasiswaId) {
  const found = dosenBimbinganRencanaStudi.find(
    (item) => item.mahasiswa.id === Number(mahasiswaId)
  );

  if (!found) {
    throw createMockError(404, 'Mahasiswa bimbingan tidak ditemukan.');
  }

  return found;
}

function getDosenRencanaStudiById(rencanaStudiId) {
  const found = dosenDetailRencanaStudi.find((item) => item.id === Number(rencanaStudiId));

  if (!found) {
    throw createMockError(404, 'Rencana studi mahasiswa bimbingan tidak ditemukan.');
  }

  return found;
}

function hitungTotalSks(record) {
  return record.items.reduce((total, item) => {
    const kelasItem = findKelasById(item.kelas_id);
    return total + (kelasItem?.sks ?? 0);
  }, 0);
}

function toMahasiswaBimbinganProfile(mahasiswaId) {
  const bimbingan = getDosenBimbinganByMahasiswaId(mahasiswaId);
  const akademik = mahasiswaBimbinganAkademik[bimbingan.mahasiswa.id] ?? {};

  return {
    ...bimbingan.mahasiswa,
    angkatan: akademik.angkatan ?? 2021,
    ips_terakhir: akademik.ips_terakhir ?? 0,
    total_sks_lulus: akademik.total_sks_lulus ?? 0,
    total_sks_wajib_lulus: akademik.total_sks_wajib_lulus ?? 0,
    total_sks_pilihan_lulus: akademik.total_sks_pilihan_lulus ?? 0,
  };
}

function toRencanaStudiDetail(record) {
  return {
    id: record.id,
    periode: record.periode,
    status: record.status,
    total_sks: hitungTotalSks(record),
    catatan_dosen: record.catatan_dosen,
    submitted_at: record.submitted_at,
    reviewed_at: record.reviewed_at,
    items: record.items.map((item) => ({
      id: item.id,
      kelas: findKelasById(item.kelas_id),
    })),
  };
}

function toRencanaStudiSummary(record) {
  return {
    id: record.id,
    periode: record.periode,
    status: record.status,
    total_sks: hitungTotalSks(record),
    submitted_at: record.submitted_at,
  };
}

function toDosenRencanaStudiSummary(record) {
  return {
    ...toRencanaStudiSummary(record),
    mahasiswa: toMahasiswaBimbinganProfile(record.mahasiswa_id),
  };
}

function toDosenRencanaStudiDetail(record) {
  return {
    ...toRencanaStudiDetail(record),
    mahasiswa: toMahasiswaBimbinganProfile(record.mahasiswa_id),
    items: record.items.map((item) => {
      const kelasItem = findKelasById(item.kelas_id);

      return {
        id: item.id,
        kelas: kelasItem,
        is_mengulang: kelasItem?.kode_matkul === 'AIF231103' && record.mahasiswa_id === 209,
        tags: [kelasItem?.tipe ?? 'wajib'],
      };
    }),
  };
}

function syncDosenBimbinganFromRencanaStudi(record) {
  if (record.periode.id !== periodeAktif.id) return;

  const current = dosenBimbinganRencanaStudi.find(
    (item) => item.mahasiswa.id === record.mahasiswa_id
  );

  if (!current) return;

  current.id = record.id;
  current.status = record.status;
  current.total_sks = hitungTotalSks(record);
  current.submitted_at = record.submitted_at;
}

function buildDosenBimbinganSummary(items) {
  return {
    total: items.length,
    approved: items.filter((item) => item.status === 'APPROVED').length,
    submitted: items.filter((item) => item.status === 'SUBMITTED').length,
    rejected: items.filter((item) => item.status === 'REJECTED').length,
    draft_or_empty: items.filter((item) => !item.id || item.status === 'DRAFT').length,
  };
}

function getTargetPeriodeId(params = {}) {
  return Number(params.periode_id ?? params.periodeId ?? periodeAktif.id);
}

function markRencanaStudiEdited(record) {
  if (record.status === 'APPROVED') {
    record.status = 'SUBMITTED';
    record.submitted_at = new Date().toISOString();
    record.reviewed_at = null;
  }

  if (record.status === 'REJECTED') {
    record.status = 'DRAFT';
    record.reviewed_at = null;
  }
}

export async function mockGetRencanaStudiSaya(params = {}) {
  await sleep(NETWORK_DELAY_MS.get);

  const periodeId = getTargetPeriodeId(params);
  const found = rencanaStudi.find((record) => record.periode.id === periodeId);

  if (!found) {
    const periode = findPeriodeById(periodeId) ?? periodeAktif;
    throw createMockError(404, 'Belum ada FRS untuk periode ini.', { periode });
  }

  return wrap(toRencanaStudiDetail(found));
}

export async function mockGetRiwayatRencanaStudiSaya() {
  await sleep(NETWORK_DELAY_MS.get);

  return wrap(rencanaStudi.map(toRencanaStudiSummary));
}

export async function mockGetRencanaStudiDosenBimbingan(params = {}) {
  await sleep(NETWORK_DELAY_MS.get);

  const periodeId = getTargetPeriodeId(params);
  const status = params.status?.trim()?.toUpperCase();
  const filtered = dosenBimbinganRencanaStudi.filter((item) => {
    if (item.periode.id !== periodeId) return false;
    if (status && item.status !== status) return false;
    return true;
  });

  return {
    success: true,
    data: clone(filtered),
    summary: buildDosenBimbinganSummary(filtered),
    message: 'OK',
  };
}

export async function mockGetMahasiswaBimbinganProfile(mahasiswaId) {
  await sleep(NETWORK_DELAY_MS.get);

  return wrap({
    mahasiswa: toMahasiswaBimbinganProfile(mahasiswaId),
    periode_aktif: periodeAktif,
  });
}

export async function mockGetRencanaStudiDosenRiwayatMahasiswa(mahasiswaId) {
  await sleep(NETWORK_DELAY_MS.get);

  const riwayat = dosenDetailRencanaStudi
    .filter((record) => record.mahasiswa_id === Number(mahasiswaId))
    .map(toDosenRencanaStudiSummary);

  return wrap(riwayat);
}

export async function mockGetRencanaStudiDetail(rencanaStudiId) {
  await sleep(NETWORK_DELAY_MS.get);

  const dosenRecord = dosenDetailRencanaStudi.find(
    (record) => record.id === Number(rencanaStudiId)
  );

  if (dosenRecord) {
    return wrap(toDosenRencanaStudiDetail(dosenRecord));
  }

  return wrap(toRencanaStudiDetail(getRencanaStudiById(rencanaStudiId)));
}

export async function mockSetujuiRencanaStudi(rencanaStudiId, payload = {}) {
  await sleep(NETWORK_DELAY_MS.mutation);

  const record = getDosenRencanaStudiById(rencanaStudiId);
  if (record.status !== 'SUBMITTED') {
    throw createMockError(422, 'Hanya FRS menunggu persetujuan yang bisa disetujui.');
  }

  record.status = 'APPROVED';
  record.catatan_dosen = payload.catatan?.trim() || null;
  record.reviewed_at = new Date().toISOString();
  syncDosenBimbinganFromRencanaStudi(record);

  return wrap(
    {
      id: record.id,
      status: record.status,
      catatan_dosen: record.catatan_dosen,
      reviewed_at: record.reviewed_at,
    },
    'FRS berhasil disetujui.',
  );
}

export async function mockRevisiRencanaStudi(rencanaStudiId, payload = {}) {
  await sleep(NETWORK_DELAY_MS.mutation);

  const record = getDosenRencanaStudiById(rencanaStudiId);
  const catatan = payload.catatan?.trim();

  if (record.status !== 'SUBMITTED') {
    throw createMockError(422, 'Hanya FRS menunggu persetujuan yang bisa direvisi.');
  }

  if (!catatan) {
    throw createMockError(422, 'Catatan revisi wajib diisi.');
  }

  record.status = 'REJECTED';
  record.catatan_dosen = catatan;
  record.reviewed_at = new Date().toISOString();
  syncDosenBimbinganFromRencanaStudi(record);

  return wrap(
    {
      id: record.id,
      status: record.status,
      catatan_dosen: record.catatan_dosen,
      reviewed_at: record.reviewed_at,
    },
    'FRS berhasil dikembalikan untuk revisi.',
  );
}

export async function mockGetKelas(params = {}) {
  await sleep(NETWORK_DELAY_MS.get);

  const periodeId = getTargetPeriodeId(params);
  const search = params.search?.trim()?.toLowerCase();
  const kodeMatkul = params.kode_matkul?.trim()?.toLowerCase();

  const filtered = kelas.filter((item) => {
    if (item.periode.id !== periodeId) return false;
    if (kodeMatkul && item.kode_matkul.toLowerCase() !== kodeMatkul) return false;

    if (!search) return true;

    const searchable = [
      item.kode_matkul,
      item.nama_matkul,
      item.nama_kelas,
      item.tipe,
    ].join(' ').toLowerCase();

    return searchable.includes(search);
  });

  return wrap(filtered);
}

export async function mockCreateRencanaStudi(payload = {}) {
  await sleep(NETWORK_DELAY_MS.mutation);

  const periodeId = getTargetPeriodeId(payload);
  const periode = findPeriodeById(periodeId);

  if (!periode?.is_active) {
    throw createMockError(422, 'FRS baru hanya bisa dibuat pada periode aktif.');
  }

  const existing = rencanaStudi.find((record) => record.periode.id === periodeId);

  if (existing) {
    throw createMockError(409, 'FRS periode aktif sudah ada.', toRencanaStudiDetail(existing));
  }

  const created = {
    id: nextRencanaStudiId,
    periode,
    status: 'DRAFT',
    catatan_dosen: null,
    submitted_at: null,
    reviewed_at: null,
    items: [],
  };

  nextRencanaStudiId += 1;
  rencanaStudi.unshift(created);

  return wrap(toRencanaStudiDetail(created), 'FRS baru berhasil dibuat.');
}

export async function mockAddRencanaStudiItem(rencanaStudiId, payload = {}) {
  await sleep(NETWORK_DELAY_MS.mutation);

  const record = getRencanaStudiById(rencanaStudiId);
  const kelasItem = findKelasById(payload.kelas_id);

  if (!kelasItem) {
    throw createMockError(404, 'Kelas tidak ditemukan.');
  }

  if (record.items.some((item) => item.kelas_id === kelasItem.id)) {
    throw createMockError(409, 'Kelas sudah ada di FRS.');
  }

  markRencanaStudiEdited(record);
  record.items.push({
    id: nextItemId,
    kelas_id: kelasItem.id,
  });
  nextItemId += 1;

  return wrap(toRencanaStudiDetail(record), 'Kelas berhasil ditambahkan.');
}

export async function mockDeleteRencanaStudiItem(rencanaStudiId, itemId) {
  await sleep(NETWORK_DELAY_MS.mutation);

  const record = getRencanaStudiById(rencanaStudiId);

  const itemIndex = record.items.findIndex((item) => item.id === Number(itemId));

  if (itemIndex < 0) {
    throw createMockError(404, 'Item FRS tidak ditemukan.');
  }

  markRencanaStudiEdited(record);
  record.items.splice(itemIndex, 1);

  return wrap(toRencanaStudiDetail(record), 'Kelas berhasil dihapus dari FRS.');
}

export async function mockSubmitRencanaStudi(rencanaStudiId) {
  await sleep(NETWORK_DELAY_MS.mutation);

  const record = getRencanaStudiById(rencanaStudiId);

  if (record.status !== 'DRAFT' && record.status !== 'REJECTED' && record.status !== 'SUBMITTED') {
    throw createMockError(422, 'Hanya FRS draft, revisi, atau menunggu persetujuan yang bisa disubmit ulang.');
  }

  if (!record.periode.is_active) {
    throw createMockError(422, 'FRS hanya bisa disubmit pada periode aktif.');
  }

  if (record.items.length === 0) {
    throw createMockError(422, 'Tambahkan minimal satu kelas sebelum submit.');
  }

  record.status = 'SUBMITTED';
  record.submitted_at = new Date().toISOString();
  record.reviewed_at = null;

  return wrap(
    {
      id: record.id,
      status: record.status,
      submitted_at: record.submitted_at,
    },
    'FRS berhasil dikirim ke dosen wali.',
  );
}
