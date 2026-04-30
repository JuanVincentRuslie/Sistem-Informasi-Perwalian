const PERIODE_STORAGE_KEY = 'mock_periode_management_state';

const defaultPeriods = [
  {
    id: 1,
    nama: 'Ganjil 2024/2025',
    tahun_mulai: 2024,
    jenis: 'ganjil',
    tanggal_mulai: '2024-08-12',
    tanggal_selesai: '2024-12-20',
    is_active: false,
  },
  {
    id: 2,
    nama: 'Genap 2024/2025',
    tahun_mulai: 2024,
    jenis: 'genap',
    tanggal_mulai: '2025-01-20',
    tanggal_selesai: '2025-05-30',
    is_active: false,
  },
  {
    id: 3,
    nama: 'Ganjil 2025/2026',
    tahun_mulai: 2025,
    jenis: 'ganjil',
    tanggal_mulai: '2025-09-01',
    tanggal_selesai: '2026-01-31',
    is_active: true,
  },
];

const defaultUploadsByPeriode = {
  3: {
    nama_file: 'jadwal-kelas-ganjil-2025.xlsx',
    uploaded_at: '2026-04-30T02:15:00Z',
    total_rows: 36,
    total_kelas: 14,
    valid_kelas: 14,
    invalid_kelas: 0,
  },
};

const previewStore = new Map();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
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

function readState() {
  try {
    const storedValue = localStorage.getItem(PERIODE_STORAGE_KEY);

    if (!storedValue) {
      return {
        periods: clone(defaultPeriods),
        uploadsByPeriode: clone(defaultUploadsByPeriode),
        nextPeriodeId: 4,
      };
    }

    const parsed = JSON.parse(storedValue);
    return {
      periods: parsed.periods ?? clone(defaultPeriods),
      uploadsByPeriode: parsed.uploadsByPeriode ?? clone(defaultUploadsByPeriode),
      nextPeriodeId: parsed.nextPeriodeId ?? 4,
    };
  } catch {
    return {
      periods: clone(defaultPeriods),
      uploadsByPeriode: clone(defaultUploadsByPeriode),
      nextPeriodeId: 4,
    };
  }
}

function persistState(state) {
  localStorage.setItem(PERIODE_STORAGE_KEY, JSON.stringify(state));
}

function isPeriodeExpired(periode, today = getTodayIso()) {
  return periode.tanggal_selesai < today;
}

function normalizePeriods(periods) {
  let activeAssigned = false;

  return periods.map((periode) => {
    const expired = isPeriodeExpired(periode);
    const canStayActive = !expired && periode.is_active && !activeAssigned;

    if (canStayActive) {
      activeAssigned = true;
    }

    return {
      ...periode,
      is_active: canStayActive,
      status: expired ? 'expired' : (canStayActive ? 'active' : 'inactive'),
    };
  });
}

function sortPeriodsDesc(periods) {
  return [...periods].sort((left, right) => (
    right.tanggal_mulai.localeCompare(left.tanggal_mulai)
  ));
}

function getUploadSummaryForPeriod(uploadsByPeriode, periodeId) {
  return uploadsByPeriode[String(periodeId)] ?? null;
}

function buildPeriodeResponse(state) {
  const normalizedPeriods = normalizePeriods(state.periods);
  const periods = sortPeriodsDesc(normalizedPeriods).map((periode) => ({
    ...periode,
    upload_jadwal: getUploadSummaryForPeriod(state.uploadsByPeriode, periode.id),
  }));

  return {
    periode_aktif: periods.find((periode) => periode.status === 'active') ?? null,
    histori: periods,
    summary: {
      total_periode: periods.length,
      total_periode_aktif: periods.filter((periode) => periode.status === 'active').length,
      total_periode_berakhir: periods.filter((periode) => periode.status === 'expired').length,
    },
  };
}

function buildNamaPeriode(tahunMulai, jenis) {
  const tahunAkhir = Number(tahunMulai) + 1;
  const jenisLabel = jenis === 'genap' ? 'Genap' : 'Ganjil';
  return `${jenisLabel} ${tahunMulai}/${tahunAkhir}`;
}

function buildPreviewRows() {
  return [
    {
      kode_matkul: 'AIF231103',
      nama_matkul: 'Dasar Pemrograman',
      sks: 4,
      nama_kelas: 'A',
      sesi_count: 2,
      valid: true,
    },
    {
      kode_matkul: 'AIF232101',
      nama_matkul: 'Struktur Data',
      sks: 4,
      nama_kelas: 'B',
      sesi_count: 2,
      valid: true,
    },
    {
      kode_matkul: 'AIF233105',
      nama_matkul: 'Basis Data',
      sks: 3,
      nama_kelas: 'A',
      sesi_count: 1,
      valid: true,
    },
    {
      kode_matkul: 'AIF235301',
      nama_matkul: 'Rekayasa Perangkat Lunak',
      sks: 3,
      nama_kelas: 'A',
      sesi_count: 1,
      valid: true,
    },
  ];
}

export function getMockPeriodeAktif() {
  const state = readState();
  const normalizedPeriods = normalizePeriods(state.periods);
  return clone(normalizedPeriods.find((periode) => periode.status === 'active') ?? null);
}

export async function mockGetPeriodeManagement() {
  await sleep(300);
  const state = readState();
  return wrap(buildPeriodeResponse(state));
}

export async function mockCreatePeriode(payload = {}) {
  await sleep(200);

  const tahunMulai = Number(payload.tahun_mulai);
  const jenis = payload.jenis?.trim()?.toLowerCase();
  const tanggalMulai = payload.tanggal_mulai;
  const tanggalSelesai = payload.tanggal_selesai;
  const today = getTodayIso();

  if (!tahunMulai || !jenis || !tanggalMulai || !tanggalSelesai) {
    throw createMockError(422, 'Lengkapi semua field periode.');
  }

  if (tanggalSelesai < tanggalMulai) {
    throw createMockError(422, 'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
  }

  if (tanggalSelesai < today) {
    throw createMockError(422, 'Periode baru tidak boleh langsung berstatus lewat waktu.');
  }

  const state = readState();
  const nama = buildNamaPeriode(tahunMulai, jenis);
  const duplicated = state.periods.some((periode) => periode.nama === nama);

  if (duplicated) {
    throw createMockError(409, 'Periode dengan nama tersebut sudah ada.');
  }

  const created = {
    id: state.nextPeriodeId,
    nama,
    tahun_mulai: tahunMulai,
    jenis,
    tanggal_mulai: tanggalMulai,
    tanggal_selesai: tanggalSelesai,
    is_active: true,
  };

  state.periods = state.periods.map((periode) => ({
    ...periode,
    is_active: false,
  }));
  state.periods.push(created);
  state.nextPeriodeId += 1;
  persistState(state);

  return wrap(created, 'Periode baru berhasil ditambahkan dan langsung diaktifkan.');
}

export async function mockActivatePeriode(periodeId) {
  await sleep(200);

  const state = readState();
  const targetId = Number(periodeId);
  const target = state.periods.find((periode) => periode.id === targetId);

  if (!target) {
    throw createMockError(404, 'Periode tidak ditemukan.');
  }

  if (isPeriodeExpired(target)) {
    throw createMockError(422, 'Periode yang sudah lewat waktu tidak bisa diaktifkan kembali.');
  }

  state.periods = state.periods.map((periode) => ({
    ...periode,
    is_active: periode.id === targetId,
  }));
  persistState(state);

  return wrap(
    state.periods.find((periode) => periode.id === targetId),
    'Periode berhasil diaktifkan.',
  );
}

export async function mockDeletePeriode(periodeId) {
  await sleep(200);

  const state = readState();
  const targetId = Number(periodeId);
  const target = state.periods.find((periode) => periode.id === targetId);

  if (!target) {
    throw createMockError(404, 'Periode tidak ditemukan.');
  }

  state.periods = state.periods.filter((periode) => periode.id !== targetId);
  delete state.uploadsByPeriode[String(targetId)];
  persistState(state);

  return wrap(
    { id: targetId },
    target.is_active
      ? 'Periode aktif berhasil dihapus. Saat ini belum ada periode aktif.'
      : 'Periode berhasil dihapus.',
  );
}

export async function mockPreviewUploadJadwalKelas(payload = {}) {
  await sleep(300);

  const periodeId = Number(payload.periode_id);
  const file = payload.file;
  const state = readState();
  const periode = state.periods.find((item) => item.id === periodeId);

  if (!periode) {
    throw createMockError(404, 'Periode target tidak ditemukan.');
  }

  if (!file) {
    throw createMockError(422, 'Pilih file Excel jadwal kelas terlebih dahulu.');
  }

  const preview = buildPreviewRows();
  const summary = {
    total_rows: preview.length,
    total_kelas: preview.length,
    valid_kelas: preview.filter((row) => row.valid).length,
    invalid_kelas: preview.filter((row) => !row.valid).length,
  };
  const upload_token = `mock-jadwal-kelas-${Date.now()}`;

  previewStore.set(upload_token, {
    periode_id: periodeId,
    nama_file: file.name,
    preview,
    summary,
  });

  return wrap(
    {
      preview,
      summary,
      upload_token,
    },
    'Preview jadwal kelas berhasil dibuat.',
  );
}

export async function mockConfirmUploadJadwalKelas(payload = {}) {
  await sleep(200);

  const previewPayload = previewStore.get(payload.upload_token);

  if (!previewPayload) {
    throw createMockError(404, 'Preview upload tidak ditemukan atau sudah kedaluwarsa.');
  }

  if ((payload.mode ?? 'replace') !== 'replace') {
    throw createMockError(422, 'Mode upload yang didukung saat ini hanya replace.');
  }

  const state = readState();
  state.uploadsByPeriode[String(previewPayload.periode_id)] = {
    nama_file: previewPayload.nama_file,
    uploaded_at: new Date().toISOString(),
    ...previewPayload.summary,
  };
  persistState(state);
  previewStore.delete(payload.upload_token);

  return wrap(
    {
      periode_id: previewPayload.periode_id,
      ...state.uploadsByPeriode[String(previewPayload.periode_id)],
    },
    'Jadwal kelas berhasil disimpan untuk periode tersebut.',
  );
}
