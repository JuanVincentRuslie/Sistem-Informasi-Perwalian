const service = require('./master-matkul.service');
const { ok, fail, failFromError } = require('../../utils/respond');

async function list(req, res) {
  let semester = null;
  if (req.query.semester !== undefined) {
    semester = Number(req.query.semester);
    if (!Number.isInteger(semester) || semester <= 0) {
      return fail(res, 'semester harus berupa angka positif');
    }
  }
  const search = req.query.search ?? null;

  try {
    const data = await service.listMasterMatkul({ semester, search });
    return ok(res, data);
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil master matkul');
  }
}

async function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return fail(res, 'id tidak valid');
  try {
    const data = await service.getMasterMatkulById(id);
    if (!data) return fail(res, 'Master matkul tidak ditemukan', 404);
    return ok(res, data);
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil master matkul');
  }
}

async function listEdges(_req, res) {
  try {
    const data = await service.listEdges();
    return ok(res, data);
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil edges');
  }
}

module.exports = { list, detail, listEdges };
