/**
 * Helper untuk format response agar konsisten dengan API spec:
 * { success, data, message } atau { success, message, errors }
 */

function ok(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

function created(res, data, message = 'Berhasil dibuat') {
  return res.status(201).json({ success: true, data, message });
}

function fail(res, message, statusCode = 400, errors = undefined) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

function getPgErrorResponse(err) {
  if (!err?.code) return null;

  if (err.code === '23505') {
    return {
      statusCode: 409,
      message: 'Data sudah digunakan. Periksa kembali field yang harus unik.',
    };
  }

  if (err.code === '23503') {
    return {
      statusCode: 409,
      message: 'Data tidak bisa diubah atau dihapus karena masih dipakai data lain.',
    };
  }

  if (err.code === '23502') {
    return {
      statusCode: 400,
      message: 'Data wajib belum lengkap.',
    };
  }

  if (err.code === '23514') {
    return {
      statusCode: 400,
      message: 'Data tidak sesuai aturan validasi.',
    };
  }

  return null;
}

function failFromError(res, err, fallbackMessage = 'Terjadi kesalahan server') {
  const pgError = getPgErrorResponse(err);
  if (pgError) {
    return fail(res, pgError.message, pgError.statusCode);
  }

  const statusCode = err?.statusCode ?? 500;
  if (statusCode < 500 && err?.message) {
    return fail(res, err.message, statusCode);
  }

  return fail(res, fallbackMessage, statusCode);
}

function withPagination(res, data, pagination, message = 'OK') {
  return res.json({ success: true, data, pagination, message });
}

module.exports = { ok, created, fail, failFromError, withPagination };
