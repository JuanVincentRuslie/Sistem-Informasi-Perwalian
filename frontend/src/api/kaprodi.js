// Service layer untuk kaprodi dashboard.
// Backend belum punya endpoint khusus dashboard, jadi compose dari beberapa
// endpoint terpisah dan agregat di sini.
import { apiClient } from './client.js';
import { getPeriodeAktif } from './periode.js';

const LIST_LIMIT = 100;

/**
 * Get overview kaprodi dashboard: summary jumlah dosen/mahasiswa,
 * periode aktif, dan status overview.
 */
export async function getKaprodiDashboard() {
  const [periodeAktifResp, dosenResp, mahasiswaResp, periodeListResp] = await Promise.all([
    getPeriodeAktif(),
    apiClient.get('/dosen-wali', { limit: LIST_LIMIT }),
    apiClient.get('/mahasiswa', { limit: LIST_LIMIT }),
    apiClient.get('/periode'),
  ]);

  const periodeAktif = periodeAktifResp.data;
  const totalDosenWali = dosenResp.pagination?.total ?? dosenResp.data.length;
  const mahasiswaList = mahasiswaResp.data ?? [];
  const totalMahasiswa = mahasiswaResp.pagination?.total ?? mahasiswaList.length;
  const mahasiswaTanpa = mahasiswaList.filter((m) => !m.dosen_wali?.id).length;
  const totalPeriode = (periodeListResp.data ?? []).length;

  return {
    success: true,
    data: {
      summary: {
        total_dosen_wali: totalDosenWali,
        total_mahasiswa: totalMahasiswa,
        mahasiswa_dengan_dosen_wali: totalMahasiswa - mahasiswaTanpa,
        mahasiswa_tanpa_dosen_wali: mahasiswaTanpa,
      },
      periode_aktif: periodeAktif,
      overview: {
        status_label: periodeAktif ? 'Periode aktif berjalan' : 'Belum ada periode aktif',
        status_deskripsi: periodeAktif
          ? 'Mahasiswa dapat mengisi FRS dan dosen wali dapat melakukan review.'
          : 'Kaprodi perlu membuat atau mengaktifkan periode baru agar proses perwalian dapat berjalan.',
        total_periode: totalPeriode,
      },
    },
    message: 'OK',
  };
}
