const service = require('./periode.service');
const { ok, created, fail, failFromError } = require('../../utils/respond');

const JENIS_PERIODE = ['ganjil', 'genap', 'pendek'];
const JENIS_PERIODE_MESSAGE = 'Field jenis harus "ganjil", "genap", atau "pendek"';

async function list(req, res) {
  try {
    const { is_active } = req.query;
    let isActive;
    if (is_active === 'true') isActive = true;
    else if (is_active === 'false') isActive = false;

    const data = await service.listPeriode({ isActive });
    return ok(res, data);
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil data periode');
  }
}

async function getAktif(req, res) {
  try {
    const periode = await service.getPeriodeAktif();
    if (!periode) return fail(res, 'Tidak ada periode aktif', 404);
    return ok(res, periode);
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil periode aktif');
  }
}

async function create(req, res) {
  const { nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai } = req.body;

  if (!nama || !tahun_mulai || !jenis || !tanggal_mulai || !tanggal_selesai) {
    return fail(res, 'Field nama, tahun_mulai, jenis, tanggal_mulai, dan tanggal_selesai wajib diisi');
  }

  if (!JENIS_PERIODE.includes(jenis)) {
    return fail(res, JENIS_PERIODE_MESSAGE);
  }

  try {
    const periode = await service.createPeriode({ nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai });
    return created(res, periode, 'Periode berhasil dibuat dan diaktifkan');
  } catch (err) {
    return failFromError(res, err, 'Gagal membuat periode');
  }
}

async function update(req, res) {
  const { nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai } = req.body;

  if (jenis && !JENIS_PERIODE.includes(jenis)) {
    return fail(res, JENIS_PERIODE_MESSAGE);
  }

  try {
    const periode = await service.updatePeriode(req.params.id, { nama, tahun_mulai, jenis, tanggal_mulai, tanggal_selesai });
    return ok(res, periode, 'Periode berhasil diupdate');
  } catch (err) {
    return failFromError(res, err, 'Gagal mengupdate periode');
  }
}

async function aktivasi(req, res) {
  try {
    const periode = await service.aktivasiPeriode(req.params.id);
    return ok(res, periode, 'Periode berhasil diaktifkan');
  } catch (err) {
    return failFromError(res, err, 'Gagal mengaktifkan periode');
  }
}

async function remove(req, res) {
  try {
    await service.deletePeriode(req.params.id);
    return ok(res, null, 'Periode berhasil dihapus');
  } catch (err) {
    return failFromError(res, err, 'Gagal menghapus periode');
  }
}

module.exports = { list, getAktif, create, update, aktivasi, remove };
