// Service layer untuk dosen wali side: kelola jadwal perwalian sendiri.
// Backend tidak punya `GET /dosen-wali/me`, jadi compose dari /auth/me
// (sudah include profile.nip + profile.jadwal_perwalian per role) dan /periode/aktif.
import { apiClient } from './client.js';
import { getPeriodeAktif } from './periode.js';

/**
 * Get periode aktif + profil dosen wali yang sedang login.
 */
export async function getJadwalPerwalianSaya() {
  const [meResp, periodeAktifResp] = await Promise.all([
    apiClient.get('/auth/me'),
    getPeriodeAktif(),
  ]);

  const me = meResp.data ?? {};
  const profile = me.profile ?? {};

  return {
    success: true,
    data: {
      periode_aktif: periodeAktifResp.data,
      dosen_wali: {
        id: me.id,
        nama: me.nama,
        email: me.email,
        nip: profile.nip ?? null,
        jadwal_perwalian: profile.jadwal_perwalian ?? null,
      },
    },
    message: 'OK',
  };
}

/**
 * Update jadwal perwalian sendiri (PATCH /dosen-wali/me) lalu re-fetch supaya
 * UI dapat data terbaru.
 */
export async function updateJadwalPerwalianSaya(payload) {
  await apiClient.patch('/dosen-wali/me', {
    jadwal_perwalian: payload.jadwal_perwalian,
  });
  return getJadwalPerwalianSaya();
}
