// Service layer untuk domain akademik.
// Component panggil function di sini, tidak boleh panggil apiClient langsung.
//
// Backend punya 2 endpoint pasangan: /saya/* (mahasiswa only) dan
// /mahasiswa/:id/* (dosen_wali / kaprodi only). Layer ini auto-route
// berdasarkan role user yang sedang login — supaya component tidak perlu
// tahu detail otorisasi backend.
//
// Untuk role mahasiswa, parameter mahasiswaId di-ignore (selalu pakai endpoint
// /saya/) karena mahasiswa hanya boleh akses datanya sendiri.
import { apiClient } from './client.js';

function getCurrentRole() {
  try {
    const stored = localStorage.getItem('auth_user');
    if (!stored) return null;
    return JSON.parse(stored)?.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Get ringkasan akademik (IPK, SKS, periode aktif, info dosen wali).
 * Mahasiswa: lihat data sendiri (mahasiswaId di-ignore).
 * Dosen wali / kaprodi: lihat data mahasiswa target (mahasiswaId wajib).
 */
export async function getRingkasanAkademik(mahasiswaId) {
  const role = getCurrentRole();
  if (role === 'mahasiswa') {
    return apiClient.get('/akademik/saya/ringkasan');
  }
  return apiClient.get(`/akademik/mahasiswa/${mahasiswaId}/ringkasan`);
}

/**
 * Get data pohon kurikulum (nodes + edges + match status untuk render React Flow).
 * Mahasiswa: lihat data sendiri (mahasiswaId di-ignore).
 * Dosen wali / kaprodi: lihat data mahasiswa target (mahasiswaId wajib).
 */
export async function getPohonKurikulum(mahasiswaId) {
  const role = getCurrentRole();
  if (role === 'mahasiswa') {
    return apiClient.get('/akademik/saya/pohon-kurikulum');
  }
  return apiClient.get(`/akademik/mahasiswa/${mahasiswaId}/pohon-kurikulum`);
}
