import {
  mockGetKaprodiDosenWaliAssignment,
  mockGetKaprodiDosenWaliDetail,
  mockGetKaprodiDosenWaliList,
  mockGetKaprodiMahasiswaList,
  mockSaveKaprodiDosenWaliAssignment,
} from './_mock/kaprodiManagement.js';

/**
 * Get daftar dosen wali untuk area kaprodi.
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getKaprodiDosenWaliList() {
  // TODO: replace with real API call when backend ready
  return mockGetKaprodiDosenWaliList();
}

/**
 * Get detail dosen wali terpilih beserta mahasiswa bimbingan aktifnya.
 * @param {number|string} dosenWaliId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getKaprodiDosenWaliDetail(dosenWaliId) {
  // TODO: replace with real API call when backend ready
  return mockGetKaprodiDosenWaliDetail(dosenWaliId);
}

/**
 * Get daftar seluruh mahasiswa untuk area kaprodi.
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getKaprodiMahasiswaList() {
  // TODO: replace with real API call when backend ready
  return mockGetKaprodiMahasiswaList();
}

/**
 * Get state assign/unassign mahasiswa untuk dosen wali terpilih.
 * @param {number|string} dosenWaliId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getKaprodiDosenWaliAssignment(dosenWaliId) {
  // TODO: replace with real API call when backend ready
  return mockGetKaprodiDosenWaliAssignment(dosenWaliId);
}

/**
 * Simpan penugasan mahasiswa untuk dosen wali terpilih.
 * @param {number|string} dosenWaliId
 * @param {{ mahasiswa_ids: number[] }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function saveKaprodiDosenWaliAssignment(dosenWaliId, payload) {
  // TODO: replace with real API call when backend ready
  return mockSaveKaprodiDosenWaliAssignment(dosenWaliId, payload);
}
