const service = require('./akademik.service');
const { ok, fail } = require('../../utils/respond');

/* ---------- mahasiswa-side: data sendiri ---------- */

async function getRingkasanSaya(req, res) {
  try {
    const data = await service.getRingkasanAkademik(req.user.id);
    return ok(res, data);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function getPohonSaya(req, res) {
  try {
    const data = await service.getPohonKurikulum(req.user.id);
    return ok(res, data);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

/* ---------- akses-aware: dosen wali / kaprodi lihat data mahasiswa ---------- */

async function getRingkasanMahasiswa(req, res) {
  const mahasiswaId = Number(req.params.id);
  if (!Number.isInteger(mahasiswaId) || mahasiswaId <= 0) {
    return fail(res, 'id mahasiswa tidak valid');
  }
  try {
    const data = await service.getRingkasanForCaller({
      callerRole: req.user.role,
      callerId: req.user.id,
      mahasiswaId,
    });
    return ok(res, data);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function getPohonMahasiswa(req, res) {
  const mahasiswaId = Number(req.params.id);
  if (!Number.isInteger(mahasiswaId) || mahasiswaId <= 0) {
    return fail(res, 'id mahasiswa tidak valid');
  }
  try {
    const data = await service.getPohonForCaller({
      callerRole: req.user.role,
      callerId: req.user.id,
      mahasiswaId,
    });
    return ok(res, data);
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

module.exports = {
  getRingkasanSaya,
  getPohonSaya,
  getRingkasanMahasiswa,
  getPohonMahasiswa,
};
