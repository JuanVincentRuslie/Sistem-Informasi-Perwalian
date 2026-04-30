const DOSEN_WALI_STORAGE_KEY = 'mock_profile_dosen_wali';

const DEFAULT_DOSEN_WALI_PROFILE = {
  id: 5,
  nama: 'Dr. Sari Wijaya',
  email: 'sari@kampus.ac.id',
  nip: '198001012005012001',
  jadwal_perwalian: 'Senin 1 September 2025 14:00 - 16:00',
};

const PERIODE_AKTIF = {
  id: 3,
  nama: 'Ganjil 2025/2026',
  tahun_mulai: 2025,
  jenis: 'ganjil',
  tanggal_mulai: '2025-09-01',
  tanggal_selesai: '2026-01-31',
  is_active: true,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function readStoredProfile() {
  try {
    const storedValue = localStorage.getItem(DOSEN_WALI_STORAGE_KEY);

    if (!storedValue) {
      return clone(DEFAULT_DOSEN_WALI_PROFILE);
    }

    return {
      ...clone(DEFAULT_DOSEN_WALI_PROFILE),
      ...JSON.parse(storedValue),
    };
  } catch {
    return clone(DEFAULT_DOSEN_WALI_PROFILE);
  }
}

function persistProfile(profile) {
  localStorage.setItem(DOSEN_WALI_STORAGE_KEY, JSON.stringify(profile));
}

export function getMockDosenWaliProfile() {
  return readStoredProfile();
}

export function getMockPeriodeAktif() {
  return clone(PERIODE_AKTIF);
}

export async function mockGetJadwalPerwalianSaya() {
  await sleep(300);

  return wrap({
    periode_aktif: getMockPeriodeAktif(),
    dosen_wali: getMockDosenWaliProfile(),
  });
}

export async function mockUpdateJadwalPerwalianSaya(payload = {}) {
  await sleep(200);

  const currentProfile = readStoredProfile();
  const nextProfile = {
    ...currentProfile,
    jadwal_perwalian: payload.jadwal_perwalian?.trim() || null,
  };

  persistProfile(nextProfile);

  return wrap(
    {
      periode_aktif: getMockPeriodeAktif(),
      dosen_wali: nextProfile,
    },
    'Jadwal perwalian berhasil disimpan.',
  );
}
