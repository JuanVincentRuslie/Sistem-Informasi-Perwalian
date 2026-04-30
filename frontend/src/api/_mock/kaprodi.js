const kaprodiDashboardData = {
  summary: {
    total_dosen_wali: 18,
    total_mahasiswa: 286,
    mahasiswa_tanpa_dosen_wali: 7,
  },
  periode_aktif: {
    id: 3,
    nama: 'Ganjil 2025/2026',
    tahun_mulai: 2025,
    jenis: 'ganjil',
    tanggal_mulai: '2025-09-01',
    tanggal_selesai: '2026-01-31',
    is_active: true,
  },
  overview: {
    total_periode: 6,
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
  return wrap(kaprodiDashboardData);
}
