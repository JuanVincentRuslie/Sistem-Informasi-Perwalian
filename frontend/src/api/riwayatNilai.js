// Service layer untuk domain riwayat nilai.
// Component cukup memanggil function di file ini; saat backend siap,
// implementasi mock bisa diganti fetch asli tanpa mengubah UI.
import {
  mockConfirmUploadDps,
  mockGetRiwayatNilaiSaya,
  mockUploadDps,
} from './_mock/riwayatNilai.js';

/**
 * Get riwayat nilai mahasiswa login.
 * @returns {Promise<{success: boolean, data: Array, message: string}>}
 */
export async function getRiwayatNilaiSaya() {
  // TODO: replace with real API call when backend ready
  // return await fetch('/api/v1/riwayat-nilai/saya').then((res) => res.json());
  return mockGetRiwayatNilaiSaya();
}

/**
 * Upload PDF DPS untuk preview parser.
 * @param {File} file
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function uploadDps(file) {
  // TODO: replace with real API call when backend ready
  // const formData = new FormData();
  // formData.append('file', file);
  // return await fetch('/api/v1/riwayat-nilai/upload-dps', {
  //   method: 'POST',
  //   body: formData,
  // }).then((res) => res.json());
  return mockUploadDps(file);
}

/**
 * Konfirmasi preview DPS supaya disimpan sebagai riwayat nilai.
 * @param {{ upload_token: string, mode: string, items: Array }} payload
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function confirmUploadDps(payload) {
  // TODO: replace with real API call when backend ready
  // return await fetch('/api/v1/riwayat-nilai/upload-dps/confirm', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // }).then((res) => res.json());
  return mockConfirmUploadDps(payload);
}
