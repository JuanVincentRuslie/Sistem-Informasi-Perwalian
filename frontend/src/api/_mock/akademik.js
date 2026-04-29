import { kurikulum2023Nodes } from './pohon-kurikulum/kurikulum2023Nodes.js';
import { kurikulum2023Edges } from './pohon-kurikulum/kurikulum2023Edges.js';

// Dummy match mensimulasikan data riwayat_nilai mahasiswa.
// Dipakai untuk test visualisasi warna node SEBELUM fitur upload DPS dibuat.
// Nanti di backend, match dihitung dari JOIN riwayat_nilai + master_matkul.
function getDummyMatch(nodeId, semester) {
  if (semester === 1) {
    // Semester 1: semua sudah lulus (hijau semua)
    return { status: 'LULUS', nilai_huruf: 'A', nilai_angka: 90 };
  }
  if (semester === 2) {
    // Semester 2: mayoritas lulus, satu tidak lulus (mix hijau + merah)
    if (nodeId === 12) return { status: 'TIDAK_LULUS', nilai_huruf: 'E', nilai_angka: 30 };
    return { status: 'LULUS', nilai_huruf: 'B+', nilai_angka: 78 };
  }
  if (semester === 3) {
    // Semester 3: hanya 2 node lulus, sisanya belum diambil (mix hijau + putih)
    if (nodeId === 13 || nodeId === 14) return { status: 'LULUS', nilai_huruf: 'B', nilai_angka: 75 };
    return null;
  }
  // Semester 4 ke atas: belum diambil semua (putih)
  return null;
}

export async function mockGetPohonKurikulum(mahasiswaId) {
  // Simulate network latency supaya loading state di component bisa ditest
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Transform node: field di master data (kurikulum2023Nodes) pakai camelCase dan
  // code sebagai array, sedangkan api-spec response butuh snake_case dan kode_aktif.
  // code[0] adalah kode_aktif; code[1+] adalah kode_alias (versi kurikulum lama).
  const nodes = kurikulum2023Nodes.map((node) => ({
    id: node.id,
    kode_aktif: node.code[0],
    nama: node.label,
    sks: node.sks,
    semester: node.semester,
    kolom: node.kolom,
    tipe: node.tipe,
    match: getDummyMatch(node.id, node.semester),
  }));

  // Transform edge: sama, rename camelCase → snake_case sesuai api-spec.
  // sourceId/targetId di master data sudah numeric dan sesuai node.id di atas.
  const edges = kurikulum2023Edges.map((edge) => ({
    id: edge.id,
    source_id: edge.sourceId,
    target_id: edge.targetId,
    relation_type: edge.relationType,
  }));

  // Hitung total_sks_lulus dinamis dari nodes yang match.status === LULUS
  const total_sks_lulus = nodes
    .filter((n) => n.match?.status === 'LULUS')
    .reduce((sum, n) => sum + n.sks, 0);

  return {
    success: true,
    data: {
      nodes,
      edges,
      summary: {
        total_sks_lulus,
        ipk: 3.42,
        ips_terakhir: 3.55,
      },
    },
    message: 'OK',
  };
}
