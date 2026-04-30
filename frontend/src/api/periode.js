import {
  mockActivatePeriode,
  mockConfirmUploadJadwalKelas,
  mockCreatePeriode,
  mockDeletePeriode,
  mockGetPeriodeManagement,
  mockPreviewUploadJadwalKelas,
} from './_mock/periode.js';

/**
 * Get data manajemen periode untuk halaman kaprodi.
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getPeriodeManagement() {
  // TODO: replace with real API call when backend ready
  return mockGetPeriodeManagement();
}

/**
 * Tambah periode baru dan langsung jadikan periode aktif.
 * @param {{ tahun_mulai: number, jenis: string, tanggal_mulai: string, tanggal_selesai: string }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function createPeriode(payload) {
  // TODO: replace with real API call when backend ready
  return mockCreatePeriode(payload);
}

/**
 * Aktivasi periode target dan nonaktifkan periode aktif sebelumnya.
 * @param {number} periodeId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function activatePeriode(periodeId) {
  // TODO: replace with real API call when backend ready
  return mockActivatePeriode(periodeId);
}

/**
 * Hapus periode untuk koreksi input kaprodi.
 * @param {number} periodeId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function deletePeriode(periodeId) {
  // TODO: replace with real API call when backend ready
  return mockDeletePeriode(periodeId);
}

/**
 * Preview upload Excel jadwal kelas.
 * @param {{ file: File, periode_id: number }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function previewUploadJadwalKelas(payload) {
  // TODO: replace with real API call when backend ready
  return mockPreviewUploadJadwalKelas(payload);
}

/**
 * Konfirmasi replace jadwal kelas untuk periode target.
 * @param {{ upload_token: string, mode: string }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function confirmUploadJadwalKelas(payload) {
  // TODO: replace with real API call when backend ready
  return mockConfirmUploadJadwalKelas(payload);
}
