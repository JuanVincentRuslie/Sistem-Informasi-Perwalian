// Service layer untuk domain rencana studi (FRS).
// Component panggil function di sini, tidak boleh panggil apiClient langsung.
//
// Backend `GET /rencana-studi/dosen/bimbingan` return summary sebagai sidecar
// di luar `data`. Layer ini wrap jadi `data: { items, summary }` supaya
// useFetch bisa langsung consume tanpa special-case.
import { apiClient } from './client.js';

/**
 * Get detail FRS mahasiswa yang login untuk periode tertentu atau periode aktif.
 * @param {{ periode_id?: number }} params
 */
export async function getRencanaStudiSaya(params = {}) {
  const query = params.periode_id ? { periode_id: params.periode_id } : undefined;
  return apiClient.get('/rencana-studi/saya', query);
}

/**
 * Get riwayat FRS mahasiswa yang login untuk selector periode.
 */
export async function getRiwayatRencanaStudiSaya() {
  return apiClient.get('/rencana-studi/saya/riwayat');
}

/**
 * Get list FRS mahasiswa bimbingan dosen wali yang login.
 * Backend return summary sidecar: `{success, data, summary, message}`.
 * Service layer wrap jadi `{success, data: {items, summary}, message}` supaya
 * useFetch + component bisa consume seperti mock dulu.
 *
 * @param {{ periode_id?: number, status?: string }} params
 */
export async function getRencanaStudiDosenBimbingan(params = {}) {
  const query = {};
  if (params.periode_id) query.periode_id = params.periode_id;
  if (params.status) query.status = params.status;

  const response = await apiClient.get('/rencana-studi/dosen/bimbingan', query);
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
 */
export async function getMahasiswaBimbinganProfile(mahasiswaId) {
  return apiClient.get(`/rencana-studi/dosen/mahasiswa/${mahasiswaId}/profil`);
}

/**
 * Get riwayat FRS mahasiswa bimbingan untuk tab Rencana Studi dosen wali.
 */
export async function getRencanaStudiDosenRiwayatMahasiswa(mahasiswaId) {
  return apiClient.get(`/rencana-studi/dosen/mahasiswa/${mahasiswaId}/riwayat`);
}

/**
 * Get detail FRS by id (multi-role: mahasiswa sendiri / dosen wali bimbingan / kaprodi).
 */
export async function getRencanaStudiDetail(rencanaStudiId) {
  return apiClient.get(`/rencana-studi/${rencanaStudiId}`);
}

/**
 * Get kelas yang ditawarkan pada periode tertentu.
 * @param {{ periode_id?: number, search?: string, kode_matkul?: string }} params
 */
export async function getKelas(params = {}) {
  const query = {};
  if (params.periode_id) query.periode_id = params.periode_id;
  if (params.search) query.search = params.search;
  if (params.kode_matkul) query.kode_matkul = params.kode_matkul;
  return apiClient.get('/kelas', query);
}

/**
 * Create FRS baru untuk periode aktif.
 * @param {{ periode_id: number }} payload
 */
export async function createRencanaStudi(payload = {}) {
  return apiClient.post('/rencana-studi', { periode_id: payload.periode_id });
}

/**
 * Tambah kelas ke FRS. Backend auto-change status APPROVED → SUBMITTED kalau perlu.
 */
export async function addRencanaStudiItem(rencanaStudiId, payload) {
  return apiClient.post(`/rencana-studi/${rencanaStudiId}/items`, {
    kelas_id: payload.kelas_id,
  });
}

/**
 * Hapus kelas dari FRS.
 */
export async function deleteRencanaStudiItem(rencanaStudiId, itemId) {
  return apiClient.del(`/rencana-studi/${rencanaStudiId}/items/${itemId}`);
}

/**
 * Submit FRS untuk review dosen wali. Hanya valid dari DRAFT/REJECTED.
 */
export async function submitRencanaStudi(rencanaStudiId) {
  return apiClient.post(`/rencana-studi/${rencanaStudiId}/submit`);
}

/**
 * Setujui FRS mahasiswa bimbingan. Hanya valid dari status SUBMITTED.
 */
export async function setujuiRencanaStudi(rencanaStudiId, payload = {}) {
  return apiClient.post(`/rencana-studi/${rencanaStudiId}/setujui`, {
    catatan: payload.catatan,
  });
}

/**
 * Kembalikan FRS mahasiswa bimbingan untuk revisi (catatan wajib).
 */
export async function revisiRencanaStudi(rencanaStudiId, payload = {}) {
  return apiClient.post(`/rencana-studi/${rencanaStudiId}/revisi`, {
    catatan: payload.catatan,
  });
}
