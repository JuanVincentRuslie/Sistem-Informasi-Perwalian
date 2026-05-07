const { fail } = require('../utils/respond');

/**
 * Middleware: cek role user setelah authenticate.
 * Usage: authorize('kaprodi') atau authorize('kaprodi', 'dosen_wali')
 *
 * Harus dipasang SETELAH middleware authenticate agar req.user sudah ada.
 */
function authorize(...roles) {
  const allowed = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return fail(res, 'Unauthorized', 401);
    }
    if (!allowed.includes(req.user.role)) {
      return fail(res, 'Akses ditolak', 403);
    }
    return next();
  };
}

module.exports = { authorize };
