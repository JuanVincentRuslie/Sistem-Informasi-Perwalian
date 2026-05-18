// Service layer untuk domain periode (kaprodi).
// Component panggil function di sini, tidak boleh panggil apiClient langsung.
//
// Backend `GET /periode` return flat array dengan status bahasa Indonesia
// (aktif/nonaktif/berakhir). Layer ini transform jadi shape yang component
// harapkan: { periode_aktif, histori, summary } + status EN (active/inactive/expired).
import { apiClient } from './client.js';

const STATUS_BACKEND_TO_UI = {
  aktif: 'active',
  nonaktif: 'inactive',
  berakhir: 'expired',
};

const JENIS_LABELS = {
  ganjil: 'Ganjil',
  genap: 'Genap',
  pendek: 'Semester Pendek',
};

function mapPeriode(row) {
  const status = STATUS_BACKEND_TO_UI[row.status] ?? 'inactive';
  const totalKelas = row.total_kelas ?? 0;
  return {
    id: row.id,
    nama: row.nama,
    tahun_mulai: row.tahun_mulai,
    jenis: row.jenis,
    tanggal_mulai: row.tanggal_mulai,
    tanggal_selesai: row.tanggal_selesai,
    is_active: row.is_active,
    status,
    upload_jadwal: totalKelas > 0 ? { total_kelas: totalKelas } : null,
  };
}

function buildNamaPeriode(tahunMulai, jenis) {
  const tahunAkhir = Number(tahunMulai) + 1;
  const jenisLabel = JENIS_LABELS[jenis] ?? 'Ganjil';
  return `${jenisLabel} ${tahunMulai}/${tahunAkhir}`;
}

/**
 * Get periode aktif (helper untuk role apa saja). Return null kalau tidak ada
 * periode aktif (backend response 404). Component tinggal cek `data.data === null`.
 */
export async function getPeriodeAktif() {
  try {
    const response = await apiClient.get('/periode/aktif');
    return { ...response, data: response.data ? mapPeriode(response.data) : null };
  } catch {
    return { success: true, data: null, message: 'Tidak ada periode aktif' };
  }
}

/**
 * Get data manajemen periode untuk halaman kaprodi.
 * Aggregate flat array dari backend jadi { periode_aktif, histori, summary }.
 */
export async function getPeriodeManagement() {
  const response = await apiClient.get('/periode');
  const histori = (response.data ?? []).map(mapPeriode);
  const periodeAktif = histori.find((periode) => periode.status === 'active') ?? null;

  const summary = {
    total_periode: histori.length,
    total_periode_aktif: histori.filter((periode) => periode.status === 'active').length,
    total_periode_berakhir: histori.filter((periode) => periode.status === 'expired').length,
  };

  return {
    success: true,
    data: { periode_aktif: periodeAktif, histori, summary },
    message: response.message ?? 'OK',
  };
}

/**
 * Tambah periode baru dan langsung jadikan periode aktif.
 * Nama dibuat otomatis di sini supaya UI tetap minimalis (cukup tahun + jenis).
 */
export async function createPeriode(payload) {
  const nama = buildNamaPeriode(payload.tahun_mulai, payload.jenis);
  const response = await apiClient.post('/periode', { ...payload, nama });
  return {
    ...response,
    data: response.data ? mapPeriode(response.data) : null,
  };
}

export async function activatePeriode(periodeId) {
  const response = await apiClient.patch(`/periode/${periodeId}/aktivasi`);
  return {
    ...response,
    data: response.data ? mapPeriode(response.data) : null,
  };
}

/**
 * Update periode existing — dipakai kaprodi kalau salah input tanggal.
 * Nama di-regenerate dari tahun_mulai + jenis (sama seperti create).
 */
export async function updatePeriode(periodeId, payload) {
  const nama = buildNamaPeriode(payload.tahun_mulai, payload.jenis);
  const response = await apiClient.put(`/periode/${periodeId}`, { ...payload, nama });
  return {
    ...response,
    data: response.data ? mapPeriode(response.data) : null,
  };
}

export async function deletePeriode(periodeId) {
  return apiClient.del(`/periode/${periodeId}`);
}

/**
 * Preview upload Excel jadwal kelas — multipart/form-data.
 */
export async function previewUploadJadwalKelas({ file, periode_id }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('periode_id', String(periode_id));
  return apiClient.upload('/kelas/upload', formData);
}

export async function confirmUploadJadwalKelas({ upload_token, mode }) {
  return apiClient.post('/kelas/upload/confirm', { upload_token, mode });
}
