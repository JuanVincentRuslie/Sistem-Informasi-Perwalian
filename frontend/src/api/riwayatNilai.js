// Service layer untuk domain riwayat nilai (DPS upload mahasiswa).
// Component panggil function di sini, tidak boleh panggil apiClient langsung.
//
// Backend response `periode_terdeteksi` shape: { kode } (string dari parser).
// Layer ini transform jadi { kode, nama: kode } supaya component yang baca
// `.nama` tidak crash; kalau parser gagal deteksi, nama fallback ke "Riwayat DPS".
import { apiClient } from './client.js';

/**
 * Get riwayat nilai mahasiswa yang login.
 */
export async function getRiwayatNilaiSaya() {
  return apiClient.get('/riwayat-nilai/saya');
}

/**
 * Upload PDF DPS untuk preview parser.
 * @param {File} file
 */
export async function uploadDps(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.upload('/riwayat-nilai/upload-dps', formData);

  const periodeKode = response.data?.periode_terdeteksi?.kode;
  return {
    ...response,
    data: {
      ...response.data,
      periode_terdeteksi: {
        kode: periodeKode ?? null,
        nama: periodeKode ?? 'Riwayat DPS',
      },
    },
  };
}

/**
 * Konfirmasi preview DPS supaya disimpan sebagai riwayat nilai.
 * Backend akan re-lookup sks dari master_matkul, frontend tidak kirim sks.
 */
export async function confirmUploadDps(payload) {
  return apiClient.post('/riwayat-nilai/upload-dps/confirm', payload);
}
