const { query } = require('../../db/pool');

async function listMasterMatkul({ semester, search }) {
  const params = [];
  const conditions = [];

  if (semester !== null && semester !== undefined) {
    params.push(semester);
    conditions.push(`semester = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(nama ILIKE $${params.length} OR kode_aktif ILIKE $${params.length})`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const res = await query(
    `SELECT id, kode_aktif, kode_alias, nama, sks, semester, kolom, tipe
     FROM master_matkul
     ${whereClause}
     ORDER BY semester, kolom, nama`,
    params,
  );
  return res.rows;
}

async function getMasterMatkulById(id) {
  const matkulRes = await query(
    `SELECT id, kode_aktif, kode_alias, nama, sks, semester, kolom, tipe
     FROM master_matkul WHERE id = $1`,
    [id],
  );
  if (!matkulRes.rows[0]) return null;

  // Edges yang masuk (prasyarat) dan keluar (matkul lanjutan)
  const edgesRes = await query(
    `SELECT e.id, e.source_id, e.target_id, e.relation_type,
            src.kode_aktif AS source_kode, src.nama AS source_nama,
            tgt.kode_aktif AS target_kode, tgt.nama AS target_nama
     FROM master_matkul_edge e
     JOIN master_matkul src ON src.id = e.source_id
     JOIN master_matkul tgt ON tgt.id = e.target_id
     WHERE e.source_id = $1 OR e.target_id = $1`,
    [id],
  );

  const prasyarat = []; // matkul lain → matkul ini
  const matkulLanjutan = []; // matkul ini → matkul lain
  for (const e of edgesRes.rows) {
    if (e.target_id === matkulRes.rows[0].id) {
      prasyarat.push({
        id: e.id,
        relation_type: e.relation_type,
        matkul: { id: e.source_id, kode_aktif: e.source_kode, nama: e.source_nama },
      });
    } else {
      matkulLanjutan.push({
        id: e.id,
        relation_type: e.relation_type,
        matkul: { id: e.target_id, kode_aktif: e.target_kode, nama: e.target_nama },
      });
    }
  }

  return { ...matkulRes.rows[0], prasyarat, matkul_lanjutan: matkulLanjutan };
}

async function listEdges() {
  const res = await query(
    `SELECT e.id, e.relation_type,
            src.id AS source_id, src.kode_aktif AS source_kode, src.nama AS source_nama,
            tgt.id AS target_id, tgt.kode_aktif AS target_kode, tgt.nama AS target_nama
     FROM master_matkul_edge e
     JOIN master_matkul src ON src.id = e.source_id
     JOIN master_matkul tgt ON tgt.id = e.target_id
     ORDER BY e.id`,
  );
  return res.rows.map((e) => ({
    id: e.id,
    source: { id: e.source_id, kode_aktif: e.source_kode, nama: e.source_nama },
    target: { id: e.target_id, kode_aktif: e.target_kode, nama: e.target_nama },
    relation_type: e.relation_type,
  }));
}

module.exports = { listMasterMatkul, getMasterMatkulById, listEdges };
