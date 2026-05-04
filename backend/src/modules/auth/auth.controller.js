const authService = require('./auth.service');
const { query } = require('../../db/pool');

async function googleLogin(req, res) {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Field "code" wajib diisi' });
  }

  try {
    const googleUser = await authService.getGoogleUser(code);
    const user = await authService.findUserByEmail(googleUser.email);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Email tidak terdaftar di sistem. Hubungi Kaprodi.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Akun tidak aktif.' });
    }

    await authService.updateLastLogin(user.id, googleUser.googleId, googleUser.avatarUrl);

    const token = authService.signJwt(user);

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
          avatar_url: googleUser.avatarUrl,
        },
      },
      message: 'Login berhasil',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Login gagal',
      errors: { detail: err.message },
    });
  }
}

/**
 * GET /api/v1/auth/me
 * Kembalikan data user yang sedang login.
 * Profile detail (IPK, NIM, dll) akan ditambahkan di Milestone 7.
 */
async function getMe(req, res) {
  try {
    const result = await query(
      'SELECT id, email, nama, role, avatar_url, last_login_at FROM users WHERE id = $1',
      [req.user.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    return res.json({ success: true, data: result.rows[0], message: 'OK' });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data user',
      errors: { detail: err.message },
    });
  }
}

/**
 * POST /api/v1/auth/dev-login
 * Dev-only login: terima { email }, balas JWT + user data sama format dengan /auth/google.
 * Gated NODE_ENV !== 'production'.
 */
async function devLogin(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
  }

  const { email } = req.body ?? {};
  if (!email) {
    return res.status(400).json({ success: false, message: 'Field "email" wajib diisi' });
  }

  try {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email tidak terdaftar di sistem' });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Akun tidak aktif' });
    }

    const token = authService.signJwt(user);

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          nama: user.nama,
          role: user.role,
          avatar_url: null,
        },
      },
      message: 'Login berhasil (dev mode)',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Login gagal',
      errors: { detail: err.message },
    });
  }
}

module.exports = { googleLogin, getMe, devLogin };
