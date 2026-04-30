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
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }
    return next();
  };
}

module.exports = { authorize };
