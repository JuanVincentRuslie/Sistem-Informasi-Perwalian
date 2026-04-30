const service = require('./kelas.service');
const { ok, fail } = require('../../utils/respond');

async function list(req, res) {
  try {
    const { periode_id, kode_matkul, search } = req.query;
    const data = await service.listKelas({ periode_id, kode_matkul, search });
    return ok(res, data);
  } catch (err) {
    return fail(res, 'Gagal mengambil data kelas', 500, { detail: err.message });
  }
}

async function detail(req, res) {
  try {
    const kelas = await service.getKelasById(req.params.id);
    if (!kelas) return fail(res, 'Kelas tidak ditemukan', 404);
    return ok(res, kelas);
  } catch (err) {
    return fail(res, 'Gagal mengambil data kelas', 500, { detail: err.message });
  }
}

async function uploadPreview(req, res) {
  if (!req.file) {
    return fail(res, 'File Excel wajib diupload (field name: file)');
  }

  const periodeIdRaw = req.body.periode_id;
  const periodeId = Number(periodeIdRaw);
  if (!Number.isInteger(periodeId) || periodeId <= 0) {
    return fail(res, 'Field periode_id wajib diisi dan berupa angka positif');
  }

  try {
    const result = await service.uploadPreview({
      buffer: req.file.buffer,
      periodeId,
    });
    return ok(res, result, 'Preview berhasil dibuat. Lakukan confirm untuk simpan.');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

async function uploadConfirm(req, res) {
  const { upload_token, mode } = req.body;

  if (!upload_token) return fail(res, 'Field upload_token wajib diisi');
  if (!mode) return fail(res, 'Field mode wajib diisi');

  try {
    const result = await service.uploadConfirm({ upload_token, mode });
    return ok(res, result, 'Data kelas berhasil disimpan');
  } catch (err) {
    return fail(res, err.message, err.statusCode ?? 500);
  }
}

module.exports = { list, detail, uploadPreview, uploadConfirm };
