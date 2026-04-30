import { kurikulum2023Nodes } from './pohon-kurikulum/kurikulum2023Nodes.js';
import { kurikulum2023Edges } from './pohon-kurikulum/kurikulum2023Edges.js';
import { getMockDosenWaliProfile, getMockPeriodeAktif } from './dosenWali.js';
import { getRiwayatNilaiSummary, getSavedRiwayatNilai } from './riwayatNilai.js';

function findNilaiForNode(node, riwayatNilai) {
  const kodeMatkulSet = new Set(node.code.map((kode) => kode.toUpperCase()));

  // Reverse find: kalau ada kode duplicate dari upload DPS, item terakhir
  // dianggap sebagai nilai aktif untuk simulasi mock backend.
  return [...riwayatNilai]
    .reverse()
    .find((nilai) => kodeMatkulSet.has(nilai.kode_matkul.toUpperCase()));
}

function toNodeMatch(nilai) {
  if (!nilai) return null;

  return {
    status: nilai.status,
    nilai_huruf: nilai.nilai_huruf,
    nilai_angka: nilai.nilai_angka,
  };
}

export async function mockGetRingkasanAkademik() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const summary = getRiwayatNilaiSummary();
  const periodeAktif = getMockPeriodeAktif();
  const dosenWali = getMockDosenWaliProfile();

  return {
    success: true,
    data: {
      ipk: summary.ipk,
      ips_terakhir: summary.ips_terakhir,
      total_sks_lulus: summary.total_sks_lulus,
      total_sks_wajib_lulus: 70,
      total_sks_pilihan_lulus: 17,
      periode_aktif: periodeAktif,
      dosen_wali: dosenWali,
      rencana_studi_status: 'APPROVED',
    },
    message: 'OK',
  };
}

export async function mockGetPohonKurikulum() {
  // Simulate network latency supaya loading state di component bisa ditest
  await new Promise((resolve) => setTimeout(resolve, 300));
  const riwayatNilai = getSavedRiwayatNilai();
  const summary = getRiwayatNilaiSummary();

  // Transform node: field di master data (kurikulum2023Nodes) pakai camelCase dan
  // code sebagai array, sedangkan api-spec response butuh snake_case dan kode_aktif.
  // code[0] adalah kode_aktif; code[1+] adalah kode_alias (versi kurikulum lama).
  const nodes = kurikulum2023Nodes.map((node) => {
    const nilai = findNilaiForNode(node, riwayatNilai);

    return {
      id: node.id,
      kode_aktif: node.code[0],
      nama: node.label,
      sks: node.sks,
      semester: node.semester,
      kolom: node.kolom,
      tipe: node.tipe,
      match: toNodeMatch(nilai),
    };
  });

  // Transform edge: sama, rename camelCase → snake_case sesuai api-spec.
  // sourceId/targetId di master data sudah numeric dan sesuai node.id di atas.
  const edges = kurikulum2023Edges.map((edge) => ({
    id: edge.id,
    source_id: edge.sourceId,
    target_id: edge.targetId,
    relation_type: edge.relationType,
  }));

  return {
    success: true,
    data: {
      nodes,
      edges,
      summary: {
        total_sks_lulus: summary.total_sks_lulus,
        ipk: summary.ipk,
        ips_terakhir: summary.ips_terakhir,
      },
    },
    message: 'OK',
  };
}
