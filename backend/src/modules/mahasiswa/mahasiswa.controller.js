const service = require('./mahasiswa.service');
const { ok, created, fail, withPagination } = require('../../utils/respond');
const { parsePagination, buildMeta } = require('../../utils/paginate');

async function list(req, res) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { search, dosen_wali_id, angkatan } = req.query;

    const { data, total } = await service.listMahasiswa({
      page, limit, offset, search,
      dosenWaliId: dosen_wali_id,
      angkatan,
      callerRole: req.user.role,
      callerId: req.user.id,
    });

    return withPagination(res, data, buildMeta(page, limit, total));
  } catch (err) {
    return fail(res, 'Gagal mengambil data mahasiswa', 500, { detail: err.message });
  }
}

async function detail(req, res) {
  try {
    const { id } = req.params;
    const { role, id: callerId } = req.user;

    // Mahasiswa hanya bisa lihat dirinya sendiri
    if (role === 'mahasiswa' && String(id) !== String(callerId)) {
      return fail(res, 'Akses ditolak', 403);
    }

    // Dosen wali hanya bisa lihat bimbingannya
    if (role === 'dosen_wali') {
      const isBimbingan = await service.isBimbingan(callerId, id);
      if (!isBimbingan) return fail(res, 'Akses ditolak', 403);
    }

    const mhs = await service.getMahasiswaById(id);
    if (!mhs) return fail(res, 'Mahasiswa tidak ditemukan', 404);

    return ok(res, mhs);
  } catch (err) {
    return fail(res, 'Gagal mengambil data mahasiswa', 500, { detail: err.message });
  }
}

async function create(req, res) {
  const { nama, email, nim, angkatan, dosen_wali_id } = req.body;

  if (!nama || !email || !nim || !angkatan) {
    return fail(res, 'Field nama, email, nim, dan angkatan wajib diisi');
  }

  try {
    const mhs = await service.createMahasiswa({ nama, email, nim, angkatan, dosen_wali_id });
    return created(res, mhs, 'Mahasiswa berhasil ditambahkan');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function update(req, res) {
  const { nama, email, nim, angkatan } = req.body;

  try {
    const mhs = await service.updateMahasiswa(req.params.id, { nama, email, nim, angkatan });
    return ok(res, mhs, 'Data mahasiswa berhasil diupdate');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function assignDosenWali(req, res) {
  // dosen_wali_id: null = unassign
  const dosenWaliId = req.body.dosen_wali_id ?? null;

  try {
    await service.assignDosenWali(req.params.id, dosenWaliId);
    const action = dosenWaliId ? 'Dosen wali berhasil di-assign' : 'Dosen wali berhasil di-unassign';
    return ok(res, null, action);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function remove(req, res) {
  try {
    await service.deleteMahasiswa(req.params.id);
    return ok(res, null, 'Mahasiswa berhasil dihapus');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

module.exports = { list, detail, create, update, assignDosenWali, remove };
