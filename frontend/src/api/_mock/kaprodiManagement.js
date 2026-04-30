import { getMockPeriodeAktif } from './periode.js';

const STORAGE_KEY = 'kaprodi_management_state_v1';
const NETWORK_DELAY_MS = {
  get: 250,
  mutation: 220,
};

const initialState = {
  dosen_wali: [
    {
      id: 301,
      nama: 'Dr. Husnul Hakim, S.Kom., M.T.',
      nip: '198201152010011001',
      email: 'husnul.hakim@univ.example',
      dosen_wali_kode: 'DW-01',
    },
    {
      id: 302,
      nama: 'Yosef Ardi, S.Kom., M.T.',
      nip: '198412102011011002',
      email: 'yosef.ardi@univ.example',
      dosen_wali_kode: 'DW-02',
    },
    {
      id: 303,
      nama: 'Dr. Maria Lestari',
      nip: '197909182009012003',
      email: 'maria.lestari@univ.example',
      dosen_wali_kode: 'DW-03',
    },
    {
      id: 304,
      nama: 'Anita Wulandari, S.T., M.T.',
      nip: '198806232014042004',
      email: 'anita.wulandari@univ.example',
      dosen_wali_kode: 'DW-04',
    },
    {
      id: 305,
      nama: 'Dr. I Made Putra',
      nip: '197705092007011005',
      email: 'made.putra@univ.example',
      dosen_wali_kode: 'DW-05',
    },
  ],
  mahasiswa: [
    {
      id: 201,
      nim: '6180000001',
      nama: 'Mahasiswa A',
      angkatan: 2021,
      ipk: 3.31,
      status_frs: 'SUBMITTED',
      total_sks: 20,
      submitted_at: '2025-08-15T10:30:00Z',
      dosen_wali_id: 301,
    },
    {
      id: 202,
      nim: '6180000002',
      nama: 'Mahasiswa B',
      angkatan: 2021,
      ipk: 3.05,
      status_frs: 'DRAFT',
      total_sks: 0,
      submitted_at: null,
      dosen_wali_id: 304,
    },
    {
      id: 203,
      nim: '6180000003',
      nama: 'Mahasiswa C',
      angkatan: 2022,
      ipk: 3.18,
      status_frs: 'DRAFT',
      total_sks: 0,
      submitted_at: null,
      dosen_wali_id: null,
    },
    {
      id: 204,
      nim: '6180000004',
      nama: 'Mahasiswa D',
      angkatan: 2021,
      ipk: 3.72,
      status_frs: 'APPROVED',
      total_sks: 18,
      submitted_at: '2025-08-13T08:30:00Z',
      dosen_wali_id: 301,
    },
    {
      id: 205,
      nim: '6180000005',
      nama: 'Mahasiswa E',
      angkatan: 2021,
      ipk: 3.44,
      status_frs: 'APPROVED',
      total_sks: 21,
      submitted_at: '2025-08-12T07:00:00Z',
      dosen_wali_id: 301,
    },
    {
      id: 206,
      nim: '6180000006',
      nama: 'Mahasiswa F',
      angkatan: 2020,
      ipk: 3.67,
      status_frs: 'APPROVED',
      total_sks: 20,
      submitted_at: '2025-08-11T09:00:00Z',
      dosen_wali_id: 302,
    },
    {
      id: 207,
      nim: '6180000007',
      nama: 'Mahasiswa G',
      angkatan: 2022,
      ipk: 2.91,
      status_frs: 'DRAFT',
      total_sks: 0,
      submitted_at: null,
      dosen_wali_id: null,
    },
    {
      id: 208,
      nim: '6180000008',
      nama: 'Mahasiswa H',
      angkatan: 2020,
      ipk: 3.51,
      status_frs: 'APPROVED',
      total_sks: 19,
      submitted_at: '2025-08-10T11:15:00Z',
      dosen_wali_id: 302,
    },
    {
      id: 209,
      nim: '6180000009',
      nama: 'Mahasiswa I',
      angkatan: 2021,
      ipk: 3.22,
      status_frs: 'REJECTED',
      total_sks: 18,
      submitted_at: '2025-08-14T13:20:00Z',
      dosen_wali_id: 303,
    },
  ],
};

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

function readState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : clone(initialState);
  } catch {
    return clone(initialState);
  }
}

function writeState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sortByNama(left, right) {
  return left.nama.localeCompare(right.nama, 'id');
}

function getDosenById(state, dosenWaliId) {
  const dosen = state.dosen_wali.find((item) => item.id === Number(dosenWaliId));

  if (!dosen) {
    throw createMockError(404, 'Dosen wali tidak ditemukan.');
  }

  return dosen;
}

function getMahasiswaWithDosen(state, mahasiswa) {
  const dosenWali = mahasiswa.dosen_wali_id
    ? state.dosen_wali.find((item) => item.id === mahasiswa.dosen_wali_id) ?? null
    : null;

  return {
    ...mahasiswa,
    dosen_wali: dosenWali
      ? {
          id: dosenWali.id,
          nama: dosenWali.nama,
          nip: dosenWali.nip,
        }
      : null,
  };
}

function getAssignedMahasiswa(state, dosenWaliId) {
  return state.mahasiswa
    .filter((item) => item.dosen_wali_id === Number(dosenWaliId))
    .sort(sortByNama);
}

function getUnassignedMahasiswa(state) {
  return state.mahasiswa
    .filter((item) => item.dosen_wali_id === null)
    .sort(sortByNama);
}

function buildDosenSummary(items) {
  return items.reduce(
    (summary, item) => {
      if (item.status_frs === 'APPROVED') summary.approved += 1;
      else if (item.status_frs === 'SUBMITTED') summary.submitted += 1;
      else if (item.status_frs === 'REJECTED') summary.rejected += 1;
      else summary.draft_or_empty += 1;

      return summary;
    },
    {
      approved: 0,
      submitted: 0,
      rejected: 0,
      draft_or_empty: 0,
    },
  );
}

function toDashboardMahasiswaItem(mahasiswa) {
  return {
    id: mahasiswa.id,
    mahasiswa: {
      id: mahasiswa.id,
      nim: mahasiswa.nim,
      nama: mahasiswa.nama,
      ipk: mahasiswa.ipk,
    },
    periode: getMockPeriodeAktif(),
    status: mahasiswa.status_frs,
    total_sks: mahasiswa.total_sks,
    submitted_at: mahasiswa.submitted_at,
  };
}

function toDosenListItem(state, dosenWali) {
  const mahasiswaBimbingan = getAssignedMahasiswa(state, dosenWali.id);
  const summary = buildDosenSummary(mahasiswaBimbingan);

  return {
    ...dosenWali,
    total_mahasiswa: mahasiswaBimbingan.length,
    total_menunggu_review: summary.submitted + summary.rejected,
    total_belum_mengisi: summary.draft_or_empty,
    total_disetujui: summary.approved,
  };
}

function toMahasiswaListItem(state, mahasiswa) {
  const withDosen = getMahasiswaWithDosen(state, mahasiswa);

  return {
    id: withDosen.id,
    nim: withDosen.nim,
    nama: withDosen.nama,
    angkatan: withDosen.angkatan,
    ipk: withDosen.ipk,
    status_frs: withDosen.status_frs,
    total_sks: withDosen.total_sks,
    dosen_wali: withDosen.dosen_wali,
  };
}

export function getKaprodiManagementSnapshot() {
  const state = readState();
  const totalMahasiswaTanpaDosenWali = state.mahasiswa.filter((item) => item.dosen_wali_id === null).length;

  return {
    dosen_wali: state.dosen_wali.map((item) => toDosenListItem(state, item)),
    mahasiswa: state.mahasiswa.map((item) => toMahasiswaListItem(state, item)),
    summary: {
      total_dosen_wali: state.dosen_wali.length,
      total_mahasiswa: state.mahasiswa.length,
      mahasiswa_tanpa_dosen_wali: totalMahasiswaTanpaDosenWali,
      mahasiswa_dengan_dosen_wali: state.mahasiswa.length - totalMahasiswaTanpaDosenWali,
    },
  };
}

export async function mockGetKaprodiDosenWaliList() {
  await sleep(NETWORK_DELAY_MS.get);
  const snapshot = getKaprodiManagementSnapshot();

  return wrap({
    summary: snapshot.summary,
    items: snapshot.dosen_wali.sort(sortByNama),
  });
}

export async function mockGetKaprodiDosenWaliDetail(dosenWaliId) {
  await sleep(NETWORK_DELAY_MS.get);
  const state = readState();
  const dosenWali = getDosenById(state, dosenWaliId);
  const mahasiswaBimbingan = getAssignedMahasiswa(state, dosenWali.id);

  return wrap({
    dosen_wali: dosenWali,
    periode_aktif: getMockPeriodeAktif(),
    summary: buildDosenSummary(mahasiswaBimbingan),
    items: mahasiswaBimbingan.map(toDashboardMahasiswaItem),
  });
}

export async function mockGetKaprodiMahasiswaList() {
  await sleep(NETWORK_DELAY_MS.get);
  const snapshot = getKaprodiManagementSnapshot();

  return wrap({
    summary: snapshot.summary,
    items: snapshot.mahasiswa.sort(sortByNama),
  });
}

export async function mockGetKaprodiDosenWaliAssignment(dosenWaliId) {
  await sleep(NETWORK_DELAY_MS.get);
  const state = readState();
  const dosenWali = getDosenById(state, dosenWaliId);
  const assigned = getAssignedMahasiswa(state, dosenWali.id).map((item) => toMahasiswaListItem(state, item));
  const unassigned = getUnassignedMahasiswa(state).map((item) => toMahasiswaListItem(state, item));

  return wrap({
    dosen_wali: dosenWali,
    assigned_items: assigned,
    available_items: unassigned,
    summary: {
      total_assigned: assigned.length,
      total_available: unassigned.length,
    },
  });
}

export async function mockSaveKaprodiDosenWaliAssignment(dosenWaliId, payload) {
  await sleep(NETWORK_DELAY_MS.mutation);

  if (!Array.isArray(payload?.mahasiswa_ids)) {
    throw createMockError(422, 'Daftar mahasiswa untuk penugasan tidak valid.');
  }

  const state = readState();
  const dosenWali = getDosenById(state, dosenWaliId);
  const assignedBefore = getAssignedMahasiswa(state, dosenWali.id);
  const unassignedBefore = getUnassignedMahasiswa(state);
  const allowedIds = new Set([...assignedBefore, ...unassignedBefore].map((item) => item.id));
  const nextAssignedIds = new Set(payload.mahasiswa_ids.map(Number));

  for (const mahasiswaId of nextAssignedIds) {
    if (!allowedIds.has(mahasiswaId)) {
      throw createMockError(422, 'Mahasiswa yang dipilih tidak tersedia untuk dosen wali ini.');
    }
  }

  state.mahasiswa = state.mahasiswa.map((item) => {
    if (!allowedIds.has(item.id)) return item;

    return {
      ...item,
      dosen_wali_id: nextAssignedIds.has(item.id) ? dosenWali.id : null,
    };
  });

  writeState(state);

  const assignedAfter = getAssignedMahasiswa(state, dosenWali.id);

  return wrap(
    {
      dosen_wali: dosenWali,
      assigned_items: assignedAfter.map((item) => toMahasiswaListItem(state, item)),
    },
    'Penugasan mahasiswa untuk dosen wali berhasil disimpan.',
  );
}
