// Service layer untuk domain akademik.
// Component TIDAK boleh import dari _mock/ langsung — semua harus lewat file ini.
// Tujuannya: kalau backend sudah ready, cukup ubah implementasi di sini,
// semua component yang pakai otomatis ikut tanpa perlu disentuh satu per satu.
import { mockGetPohonKurikulum } from './_mock/akademik.js';

/**
 * Get data pohon kurikulum mahasiswa (nodes + edges + match status).
 * @param {number} mahasiswaId
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getPohonKurikulum(mahasiswaId) {
  // TODO: replace with real API call when backend ready
  // return await fetch(`/api/v1/akademik/mahasiswa/${mahasiswaId}/pohon-kurikulum`)
  //   .then(res => res.json());
  return mockGetPohonKurikulum(mahasiswaId);
}
