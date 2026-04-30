const service = require('./periode.service');
const { ok, created, fail } = require('../../utils/respond');

async function list(req, res) {
  try {
    const { is_active } = req.query;
    let isActive;
    if (is_active === 'true') isActive = true;
    else if (is_active === 'false') isActive = false;

    const data = await service.listPeriode({ isActive });
    return ok(res, data);
  } catch (err) {
    return fail(res, 'Gagal mengambil data periode', 500, { detail: err.message });
  }
}

async function getAktif(req, res) {
  try {
    const periode = await service.getPeriodeAktif();
    if (!periode) return fail(res, 'Tidak ada periode aktif', 404);
    return ok(res, periode);
  } catch (err) {
    return fail(res, 'Gagal mengambil periode aktif', 500, { detail: err.message });
  }
}

async function create(req, res) {
  const { nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai } = req.body;

  if (!nama || !tahun_mulai || !jenis || !tanggal_mulai || !tanggal_selesai) {
    return fail(res, 'Field nama, tahun_mulai, jenis, tanggal_mulai, dan tanggal_selesai wajib diisi');
  }

  if (!['ganjil', 'genap'].includes(jenis)) {
    return fail(res, 'Field jenis harus "ganjil" atau "genap"');
  }

  try {
    const periode = await service.createPeriode({ nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai });
    return created(res, periode, 'Periode berhasil dibuat dan diaktifkan');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function update(req, res) {
  const { nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai } = req.body;

  if (jenis && !['ganjil', 'genap'].includes(jenis)) {
    return fail(res, 'Field jenis harus "ganjil" atau "genap"');
  }

  try {
    const periode = await service.updatePeriode(req.params.id, { nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai });
    return ok(res, periode, 'Periode berhasil diupdate');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function aktivasi(req, res) {
  try {
    const periode = await service.aktivasiPeriode(req.params.id);
    return ok(res, periode, 'Periode berhasil diaktifkan');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function remove(req, res) {
  try {
    await service.deletePeriode(req.params.id);
    return ok(res, null, 'Periode berhasil dihapus');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

module.exports = { list, getAktif, create, update, aktivasi, remove };
