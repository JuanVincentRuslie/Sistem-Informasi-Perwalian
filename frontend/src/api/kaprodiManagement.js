// Service layer untuk halaman manajemen kaprodi (dosen wali + mahasiswa + assignment).
// Backend belum kasih endpoint aggregate khusus kaprodi — semua di-compose di sini
// dari endpoint generic /dosen-wali dan /mahasiswa.
import { apiClient } from './client.js';
import { getPeriodeAktif } from './periode.js';

const LIST_LIMIT = 100;

function toMahasiswaItem(m) {
  return {
    id: m.id,
    nim: m.nim,
    nama: m.nama,
    angkatan: m.angkatan,
    ipk: m.ipk == null ? null : Number(m.ipk),
    status_frs: m.status_frs ?? 'DRAFT',
    dosen_wali: m.dosen_wali?.id
      ? { id: m.dosen_wali.id, nama: m.dosen_wali.nama }
      : null,
  };
}

function buildSummaryFromLists(dosenList, mahasiswaList, totals) {
  const totalMahasiswa = totals?.totalMahasiswa ?? mahasiswaList.length;
  const totalDosenWali = totals?.totalDosenWali ?? dosenList.length;
  const tanpaDosen = mahasiswaList.filter((m) => !m.dosen_wali?.id).length;

  return {
    total_dosen_wali: totalDosenWali,
    total_mahasiswa: totalMahasiswa,
    mahasiswa_dengan_dosen_wali: totalMahasiswa - tanpaDosen,
    mahasiswa_tanpa_dosen_wali: tanpaDosen,
  };
}

/**
 * List dosen wali untuk halaman daftar kaprodi.
 * Items diperkaya dengan total_menunggu_review dan total_disetujui dari backend.
 */
export async function getKaprodiDosenWaliList() {
  const [dosenResp, mahasiswaResp] = await Promise.all([
    apiClient.get('/dosen-wali', { limit: LIST_LIMIT }),
    apiClient.get('/mahasiswa', { limit: LIST_LIMIT }),
  ]);

  const items = (dosenResp.data ?? []).map((d) => ({
    id: d.id,
    nama: d.nama,
    email: d.email,
    nip: d.nip,
    jadwal_perwalian: d.jadwal_perwalian,
    total_mahasiswa: d.jumlah_bimbingan ?? 0,
    total_menunggu_review: d.total_menunggu_review ?? 0,
    total_disetujui: d.total_disetujui ?? 0,
  }));

  const summary = buildSummaryFromLists(dosenResp.data ?? [], mahasiswaResp.data ?? [], {
    totalDosenWali: dosenResp.pagination?.total ?? items.length,
    totalMahasiswa: mahasiswaResp.pagination?.total ?? mahasiswaResp.data?.length,
  });

  return {
    success: true,
    data: { summary, items },
    message: 'OK',
  };
}

/**
 * Detail dosen wali kaprodi: profil + daftar FRS bimbingan dengan summary.
 * Items mengikuti shape dashboard dosen wali (re-use komponen yang sama).
 */
export async function getKaprodiDosenWaliDetail(dosenWaliId) {
  const [detailResp, periodeAktifResp] = await Promise.all([
    apiClient.get(`/dosen-wali/${dosenWaliId}`),
    getPeriodeAktif(),
  ]);

  const dosen = detailResp.data;
  const periodeAktif = periodeAktifResp.data;
  const bimbingan = dosen?.mahasiswa_bimbingan ?? [];

  const items = bimbingan.map((m) => ({
    id: m.rs_id ?? null,
    mahasiswa: {
      id: m.id,
      nim: m.nim,
      nama: m.nama,
      ipk: m.ipk == null ? null : Number(m.ipk),
    },
    periode: periodeAktif ? { id: periodeAktif.id, nama: periodeAktif.nama } : null,
    status: m.rencana_studi_status ?? 'DRAFT',
    total_sks: m.total_sks ?? 0,
    submitted_at: m.submitted_at ?? null,
  }));

  const summary = {
    total: items.length,
    approved: items.filter((i) => i.status === 'APPROVED').length,
    submitted: items.filter((i) => i.status === 'SUBMITTED').length,
    rejected: items.filter((i) => i.status === 'REJECTED').length,
    draft_or_empty: items.filter((i) => i.status === 'DRAFT').length,
  };

  return {
    success: true,
    data: {
      dosen_wali: {
        id: dosen.id,
        nama: dosen.nama,
        email: dosen.email,
        nip: dosen.nip,
      },
      periode_aktif: periodeAktif,
      summary,
      items,
    },
    message: 'OK',
  };
}

/**
 * List seluruh mahasiswa untuk halaman kaprodi.
 */
export async function getKaprodiMahasiswaList() {
  const [mahasiswaResp, dosenResp] = await Promise.all([
    apiClient.get('/mahasiswa', { limit: LIST_LIMIT }),
    apiClient.get('/dosen-wali', { limit: LIST_LIMIT }),
  ]);

  const items = (mahasiswaResp.data ?? []).map(toMahasiswaItem);
  const summary = buildSummaryFromLists(dosenResp.data ?? [], mahasiswaResp.data ?? [], {
    totalDosenWali: dosenResp.pagination?.total ?? dosenResp.data?.length,
    totalMahasiswa: mahasiswaResp.pagination?.total ?? items.length,
  });

  return {
    success: true,
    data: { summary, items },
    message: 'OK',
  };
}

/**
 * Get state assign/unassign mahasiswa untuk dosen wali terpilih.
 * Dipakai di halaman Edit Penugasan: dua kolom (sudah / belum punya dosen wali).
 */
export async function getKaprodiDosenWaliAssignment(dosenWaliId) {
  const [dosenResp, assignedResp, unassignedResp] = await Promise.all([
    apiClient.get(`/dosen-wali/${dosenWaliId}`),
    apiClient.get('/mahasiswa', { dosen_wali_id: dosenWaliId, limit: LIST_LIMIT }),
    apiClient.get('/mahasiswa', { dosen_wali_id: 'null', limit: LIST_LIMIT }),
  ]);

  const dosen = dosenResp.data;
  const assignedItems = (assignedResp.data ?? []).map(toMahasiswaItem);
  const availableItems = (unassignedResp.data ?? []).map(toMahasiswaItem);

  return {
    success: true,
    data: {
      dosen_wali: {
        id: dosen.id,
        nama: dosen.nama,
        email: dosen.email,
        nip: dosen.nip,
      },
      assigned_items: assignedItems,
      available_items: availableItems,
      summary: {
        total_assigned: assignedItems.length,
        total_available: availableItems.length,
      },
    },
    message: 'OK',
  };
}

/**
 * Simpan penugasan mahasiswa untuk dosen wali.
 * Backend hanya punya PATCH per-mahasiswa, jadi compute diff lalu loop PATCH paralel.
 */
export async function saveKaprodiDosenWaliAssignment(dosenWaliId, payload) {
  const dosenIdNum = Number(dosenWaliId);
  const newAssignedIds = new Set((payload?.mahasiswa_ids ?? []).map(Number));

  // Snapshot kondisi saat ini supaya bisa hitung diff.
  const currentResp = await apiClient.get('/mahasiswa', {
    dosen_wali_id: dosenWaliId,
    limit: LIST_LIMIT,
  });
  const currentAssignedIds = new Set((currentResp.data ?? []).map((m) => m.id));

  const toAssign = [...newAssignedIds].filter((id) => !currentAssignedIds.has(id));
  const toUnassign = [...currentAssignedIds].filter((id) => !newAssignedIds.has(id));

  await Promise.all([
    ...toAssign.map((id) => apiClient.patch(`/mahasiswa/${id}/dosen-wali`, { dosen_wali_id: dosenIdNum })),
    ...toUnassign.map((id) => apiClient.patch(`/mahasiswa/${id}/dosen-wali`, { dosen_wali_id: null })),
  ]);

  return {
    success: true,
    data: { dosen_wali_id: dosenIdNum, assigned_count: newAssignedIds.size },
    message: 'Penugasan mahasiswa untuk dosen wali berhasil disimpan.',
  };
}
