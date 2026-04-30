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

function withPagination(res, data, pagination, message = 'OK') {
  return res.json({ success: true, data, pagination, message });
}

module.exports = { ok, created, fail, withPagination };
