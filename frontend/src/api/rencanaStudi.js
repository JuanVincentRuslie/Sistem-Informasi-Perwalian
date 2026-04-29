// Service layer untuk domain rencana studi.
// Component hanya import dari file ini supaya mock API mudah diganti backend asli nanti.
import {
  mockAddRencanaStudiItem,
  mockCreateRencanaStudi,
  mockDeleteRencanaStudiItem,
  mockGetKelas,
  mockGetMahasiswaBimbinganProfile,
  mockGetRencanaStudiDetail,
  mockGetRencanaStudiSaya,
  mockGetRencanaStudiDosenBimbingan,
  mockGetRencanaStudiDosenRiwayatMahasiswa,
  mockGetRiwayatRencanaStudiSaya,
  mockRevisiRencanaStudi,
  mockSetujuiRencanaStudi,
  mockSubmitRencanaStudi,
} from './_mock/rencanaStudi.js';

/**
 * Get detail FRS mahasiswa yang login untuk periode tertentu atau periode aktif.
 * @param {{ periode_id?: number }} params
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getRencanaStudiSaya(params = {}) {
  // TODO: replace with real API call when backend ready:
  // return await fetch(`/api/v1/rencana-studi/saya?periode_id=${params.periode_id}`)
  //   .then(res => res.json());
  return mockGetRencanaStudiSaya(params);
}

/**
 * Get riwayat FRS mahasiswa yang login untuk selector periode.
 * @returns {Promise<{success: boolean, data: object[], message: string}>}
 */
export async function getRiwayatRencanaStudiSaya() {
  // TODO: replace with real API call when backend ready
  // return await fetch('/api/v1/rencana-studi/saya/riwayat').then(res => res.json());
  return mockGetRiwayatRencanaStudiSaya();
}

/**
 * Get list FRS mahasiswa bimbingan dosen wali yang login.
 * Service menormalisasi summary sidecar API supaya mudah dipakai useFetch.
 * @param {{ periode_id?: number, status?: string }} params
 * @returns {Promise<{success: boolean, data: {items: object[], summary: object}, message: string}>}
 */
export async function getRencanaStudiDosenBimbingan(params = {}) {
  // TODO: replace with real API call when backend ready:
  // const query = new URLSearchParams(params).toString();
  // const response = await fetch(`/api/v1/rencana-studi/dosen/bimbingan?${query}`)
  //   .then(res => res.json());
  // return { success: response.success, data: { items: response.data, summary: response.summary }, message: response.message };
  const response = await mockGetRencanaStudiDosenBimbingan(params);
  return {
    success: response.success,
    data: {
      items: response.data,
      summary: response.summary,
    },
    message: response.message,
  };
}

/**
 * Get profil akademik mahasiswa bimbingan untuk halaman detail dosen wali.
 * @param {number} mahasiswaId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getMahasiswaBimbinganProfile(mahasiswaId) {
  // TODO: replace with real API call:
  // return await fetch(`/api/v1/rencana-studi/dosen/mahasiswa/${mahasiswaId}/profil`)
  //   .then(res => res.json());
  return mockGetMahasiswaBimbinganProfile(mahasiswaId);
}

/**
 * Get riwayat FRS mahasiswa bimbingan untuk tab Rencana Studi dosen wali.
 * @param {number} mahasiswaId
 * @returns {Promise<{success: boolean, data: object[], message: string}>}
 */
export async function getRencanaStudiDosenRiwayatMahasiswa(mahasiswaId) {
  // TODO: replace with real API call:
  // return await fetch(`/api/v1/rencana-studi/dosen/mahasiswa/${mahasiswaId}/riwayat`)
  //   .then(res => res.json());
  return mockGetRencanaStudiDosenRiwayatMahasiswa(mahasiswaId);
}

/**
 * Get detail FRS berdasarkan ID.
 * @param {number} rencanaStudiId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getRencanaStudiDetail(rencanaStudiId) {
  // TODO: replace with real API call:
  // return await fetch(`/api/v1/rencana-studi/${rencanaStudiId}`).then(res => res.json());
  return mockGetRencanaStudiDetail(rencanaStudiId);
}

/**
 * Get kelas yang ditawarkan pada periode tertentu.
 * @param {{ periode_id?: number, search?: string, kode_matkul?: string }} params
 * @returns {Promise<{success: boolean, data: object[], message: string}>}
 */
export async function getKelas(params = {}) {
  // TODO: replace with real API call when backend ready
  // return await fetch(`/api/v1/kelas?periode_id=${params.periode_id}`).then(res => res.json());
  return mockGetKelas(params);
}

/**
 * Create FRS baru untuk periode aktif.
 * @param {{ periode_id?: number }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function createRencanaStudi(payload = {}) {
  // TODO: replace with real API call when backend ready
  // return await fetch('/api/v1/rencana-studi', { method: 'POST', body: JSON.stringify(payload) })
  //   .then(res => res.json());
  return mockCreateRencanaStudi(payload);
}

/**
 * Tambah kelas ke FRS.
 * @param {number} rencanaStudiId
 * @param {{ kelas_id: number }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function addRencanaStudiItem(rencanaStudiId, payload) {
  // TODO: replace with real API call when backend ready
  // return await fetch(`/api/v1/rencana-studi/${rencanaStudiId}/items`, {
  //   method: 'POST',
  //   body: JSON.stringify(payload),
  // }).then(res => res.json());
  return mockAddRencanaStudiItem(rencanaStudiId, payload);
}

/**
 * Hapus kelas dari FRS.
 * @param {number} rencanaStudiId
 * @param {number} itemId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function deleteRencanaStudiItem(rencanaStudiId, itemId) {
  // TODO: replace with real API call when backend ready
  // return await fetch(`/api/v1/rencana-studi/${rencanaStudiId}/items/${itemId}`, {
  //   method: 'DELETE',
  // }).then(res => res.json());
  return mockDeleteRencanaStudiItem(rencanaStudiId, itemId);
}

/**
 * Submit FRS untuk review dosen wali.
 * @param {number} rencanaStudiId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function submitRencanaStudi(rencanaStudiId) {
  // TODO: replace with real API call when backend ready
  // return await fetch(`/api/v1/rencana-studi/${rencanaStudiId}/submit`, {
  //   method: 'POST',
  // }).then(res => res.json());
  return mockSubmitRencanaStudi(rencanaStudiId);
}

/**
 * Setujui FRS mahasiswa bimbingan.
 * @param {number} rencanaStudiId
 * @param {{ catatan?: string }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function setujuiRencanaStudi(rencanaStudiId, payload = {}) {
  // TODO: replace with real API call:
  // return await fetch(`/api/v1/rencana-studi/${rencanaStudiId}/setujui`, {
  //   method: 'POST',
  //   body: JSON.stringify(payload),
  // }).then(res => res.json());
  return mockSetujuiRencanaStudi(rencanaStudiId, payload);
}

/**
 * Kembalikan FRS mahasiswa bimbingan untuk revisi.
 * @param {number} rencanaStudiId
 * @param {{ catatan: string }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function revisiRencanaStudi(rencanaStudiId, payload = {}) {
  // TODO: replace with real API call:
  // return await fetch(`/api/v1/rencana-studi/${rencanaStudiId}/revisi`, {
  //   method: 'POST',
  //   body: JSON.stringify(payload),
  // }).then(res => res.json());
  return mockRevisiRencanaStudi(rencanaStudiId, payload);
}
