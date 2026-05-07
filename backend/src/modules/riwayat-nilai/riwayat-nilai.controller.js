const service = require('./riwayat-nilai.service');
const { ok, fail, failFromError } = require('../../utils/respond');

async function getSaya(req, res) {
  let periodeId = null;
  if (req.query.periode_id !== undefined) {
    periodeId = Number(req.query.periode_id);
    if (!Number.isInteger(periodeId) || periodeId <= 0) {
      return fail(res, 'periode_id harus berupa angka positif');
    }
  }
  try {
    const data = await service.listSaya({ mahasiswaId: req.user.id, periodeId });
    return ok(res, data);
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil riwayat nilai');
  }
}

async function getMahasiswa(req, res) {
  const mahasiswaId = Number(req.params.id);
  if (!Number.isInteger(mahasiswaId) || mahasiswaId <= 0) {
    return fail(res, 'id mahasiswa tidak valid');
  }
  let periodeId = null;
  if (req.query.periode_id !== undefined) {
    periodeId = Number(req.query.periode_id);
    if (!Number.isInteger(periodeId) || periodeId <= 0) {
      return fail(res, 'periode_id harus berupa angka positif');
    }
  }
  try {
    const data = await service.listMahasiswaForCaller({
      callerRole: req.user.role,
      callerId: req.user.id,
      mahasiswaId,
      periodeId,
    });
    return ok(res, data);
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil riwayat nilai mahasiswa');
  }
}

async function uploadDps(req, res) {
  if (!req.file) {
    return fail(res, 'File PDF DPS wajib diupload (field name: file)');
  }
  try {
    const data = await service.uploadDpsPreview({
      mahasiswaId: req.user.id,
      buffer: req.file.buffer,
    });
    return ok(res, data, 'Preview berhasil dibuat. Lakukan confirm untuk simpan.');
  } catch (err) {
    return failFromError(res, err, 'Gagal membuat preview DPS');
  }
}

async function uploadDpsConfirm(req, res) {
  const { upload_token, mode, items } = req.body ?? {};
  if (!upload_token) return fail(res, 'Field upload_token wajib diisi');
  if (!mode) return fail(res, 'Field mode wajib diisi');
  try {
    const data = await service.uploadDpsConfirm({
      mahasiswaId: req.user.id,
      upload_token,
      mode,
      items,
    });
    return ok(res, data, 'Riwayat nilai berhasil disimpan');
  } catch (err) {
    // DEBUG: log error lengkap untuk investigasi M10. Hapus setelah issue selesai.
    console.error('[uploadDpsConfirm] error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      constraint: err.constraint,
      table: err.table,
      column: err.column,
      statusCode: err.statusCode,
      stack: err.stack?.split('\n').slice(0, 5).join('\n'),
    });
    return failFromError(res, err, 'Gagal menyimpan riwayat nilai');
  }
}

async function manualEntry(req, res) {
  const { items } = req.body ?? {};
  try {
    const data = await service.manualEntry({ mahasiswaId: req.user.id, items });
    return ok(res, data, 'Riwayat nilai berhasil disimpan (manual)');
  } catch (err) {
    return failFromError(res, err, 'Gagal menyimpan riwayat nilai manual');
  }
}

module.exports = { getSaya, getMahasiswa, uploadDps, uploadDpsConfirm, manualEntry };
