import { getMockPeriodeAktif, mockGetPeriodeManagement } from './periode.js';
import { getKaprodiManagementSnapshot } from './kaprodiManagement.js';

const kaprodiDashboardData = {
  overview: {
    status_label: 'Periode aktif berjalan',
    status_deskripsi: 'Mahasiswa dapat mengisi FRS dan dosen wali dapat melakukan review.',
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function wrap(data, message = 'OK') {
  return {
    success: true,
    data: clone(data),
    message,
  };
}

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export async function mockGetKaprodiDashboard() {
  await sleep(300);
  const periodeManagementResponse = await mockGetPeriodeManagement();
  const periodeAktif = getMockPeriodeAktif();
  const managementSnapshot = getKaprodiManagementSnapshot();

  return wrap({
    ...kaprodiDashboardData,
    summary: managementSnapshot.summary,
    periode_aktif: periodeAktif,
    overview: {
      ...kaprodiDashboardData.overview,
      status_label: periodeAktif ? 'Periode aktif berjalan' : 'Belum ada periode aktif',
      status_deskripsi: periodeAktif
        ? 'Mahasiswa dapat mengisi FRS dan dosen wali dapat melakukan review.'
        : 'Kaprodi perlu membuat atau mengaktifkan periode baru agar proses perwalian dapat berjalan.',
      total_periode: periodeManagementResponse.data.summary.total_periode,
    },
  });
}
