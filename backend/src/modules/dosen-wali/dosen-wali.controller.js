const service = require('./dosen-wali.service');
const { ok, created, fail, failFromError, withPagination } = require('../../utils/respond');
const { parsePagination, buildMeta } = require('../../utils/paginate');

async function list(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { search } = req.query;
    const { data, total } = await service.listDosenWali({ page, limit, offset, search });
    return withPagination(res, data, buildMeta(page, limit, total));
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil data dosen wali');
  }
}

async function detail(req, res) {
  try {
    const dosen = await service.getDosenWaliById(req.params.id);
    if (!dosen) return fail(res, 'Dosen wali tidak ditemukan', 404);
    return ok(res, dosen);
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil data dosen wali');
  }
}

async function create(req, res) {
  const { nama, email, nip, jadwal_perwalian } = req.body;

  if (!nama || !email || !nip) {
    return fail(res, 'Field nama, email, dan nip wajib diisi');
  }

  try {
    const dosen = await service.createDosenWali({ nama, email, nip, jadwal_perwalian });
    return created(res, dosen, 'Dosen wali berhasil ditambahkan');
  } catch (err) {
    return failFromError(res, err, 'Gagal menambahkan dosen wali');
  }
}

async function update(req, res) {
  const { nama, email, nip, jadwal_perwalian } = req.body;

  try {
    const dosen = await service.updateDosenWali(req.params.id, { nama, email, nip, jadwal_perwalian });
    return ok(res, dosen, 'Data dosen wali berhasil diupdate');
  } catch (err) {
    return failFromError(res, err, 'Gagal mengupdate data dosen wali');
  }
}

async function updateMe(req, res) {
  const { jadwal_perwalian } = req.body;

  if (!jadwal_perwalian) {
    return fail(res, 'Field jadwal_perwalian wajib diisi');
  }

  try {
    await service.updateJadwalPerwalian(req.user.id, jadwal_perwalian);
    return ok(res, null, 'Jadwal perwalian berhasil diupdate');
  } catch (err) {
    return failFromError(res, err, 'Gagal update jadwal');
  }
}

async function remove(req, res) {
  try {
    await service.deleteDosenWali(req.params.id);
    return ok(res, null, 'Dosen wali berhasil dihapus');
  } catch (err) {
    return failFromError(res, err, 'Gagal menghapus dosen wali');
  }
}

module.exports = { list, detail, create, update, updateMe, remove };
