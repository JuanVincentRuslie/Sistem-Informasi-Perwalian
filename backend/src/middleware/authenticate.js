const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { fail } = require('../utils/respond');

/**
 * Middleware: verifikasi JWT dari header Authorization: Bearer <token>.
 * Kalau valid, set req.user = { id, email, role } untuk dipakai handler berikutnya.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return fail(res, 'Token tidak ditemukan', 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    // Simpan minimal info di req.user — jangan simpan semua payload JWT
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    return next();
  } catch {
    return fail(res, 'Token tidak valid atau sudah expired', 401);
  }
}

module.exports = { authenticate };
