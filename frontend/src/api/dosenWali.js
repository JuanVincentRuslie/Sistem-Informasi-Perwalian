import {
  mockGetJadwalPerwalianSaya,
  mockUpdateJadwalPerwalianSaya,
} from './_mock/dosenWali.js';

/**
 * Get periode aktif dan profil dosen wali yang sedang login untuk halaman jadwal perwalian.
 * Di backend asli nanti ini bisa diganti dengan kombinasi /auth/me dan /periode/aktif.
 * @returns {Promise<{success: boolean, data: {periode_aktif: object, dosen_wali: object}, message: string}>}
 */
export async function getJadwalPerwalianSaya() {
  // TODO: replace with real API call when backend ready
  return mockGetJadwalPerwalianSaya();
}

/**
 * Update jadwal perwalian milik dosen wali yang sedang login.
 * Payload tetap mengikuti kontrak API formal: 1 field text jadwal_perwalian.
 * @param {{ jadwal_perwalian: string | null }} payload
 * @returns {Promise<{success: boolean, data: {periode_aktif: object, dosen_wali: object}, message: string}>}
 */
export async function updateJadwalPerwalianSaya(payload) {
  // TODO: replace with real API call when backend ready:
  // return await fetch('/api/v1/dosen-wali/me', {
  //   method: 'PATCH',
  //   body: JSON.stringify(payload),
  // }).then((res) => res.json());
  return mockUpdateJadwalPerwalianSaya(payload);
}
