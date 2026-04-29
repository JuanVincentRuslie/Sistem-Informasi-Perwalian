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

function hitungTotalSks(record) {
  return record.items.reduce((total, item) => {
    const kelasItem = findKelasById(item.kelas_id);
    return total + (kelasItem?.sks ?? 0);
  }, 0);
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

function getTargetPeriodeId(params = {}) {
  return Number(params.periode_id ?? params.periodeId ?? periodeAktif.id);
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

  if (record.status === 'SUBMITTED') {
    throw createMockError(422, 'FRS yang sudah disubmit tidak bisa diubah.');
  }

  if (record.items.some((item) => item.kelas_id === kelasItem.id)) {
    throw createMockError(409, 'Kelas sudah ada di FRS.');
  }

  if (record.status === 'APPROVED') {
    record.status = 'SUBMITTED';
    record.submitted_at = new Date().toISOString();
    record.reviewed_at = null;
  }

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

  if (record.status === 'SUBMITTED' || record.status === 'APPROVED') {
    throw createMockError(422, 'FRS yang sedang/selesai direview tidak bisa diubah.');
  }

  const itemIndex = record.items.findIndex((item) => item.id === Number(itemId));

  if (itemIndex < 0) {
    throw createMockError(404, 'Item FRS tidak ditemukan.');
  }

  record.items.splice(itemIndex, 1);

  return wrap(toRencanaStudiDetail(record), 'Kelas berhasil dihapus dari FRS.');
}

export async function mockSubmitRencanaStudi(rencanaStudiId) {
  await sleep(NETWORK_DELAY_MS.mutation);

  const record = getRencanaStudiById(rencanaStudiId);

  if (record.status !== 'DRAFT' && record.status !== 'REJECTED') {
    throw createMockError(422, 'Hanya FRS draft atau revisi yang bisa disubmit.');
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
