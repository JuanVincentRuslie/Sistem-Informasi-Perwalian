import { mockGetKaprodiDashboard } from './_mock/kaprodi.js';

/**
 * Get overview dashboard untuk kaprodi.
 * Endpoint ini nanti bisa diganti ke kombinasi API periode, dosen wali, dan mahasiswa.
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function getKaprodiDashboard() {
  // TODO: replace with real API call when backend ready
  return mockGetKaprodiDashboard();
}
