const authService = require('./auth.service');
const { query } = require('../../db/pool');
const { fail, failFromError } = require('../../utils/respond');

async function googleLogin(req, res) {
  const { code } = req.body;

  if (!code) {
    return fail(res, 'Field "code" wajib diisi');
  }

  try {
    const googleUser = await authService.getGoogleUser(code);
    const user = await authService.findUserByEmail(googleUser.email);

    if (!user) {
      return fail(res, 'Email tidak terdaftar di sistem. Hubungi Kaprodi.', 403);
    }

    if (!user.is_active) {
      return fail(res, 'Akun tidak aktif.', 403);
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
    return failFromError(res, err, 'Login gagal');
  }
}

/**
 * GET /api/v1/auth/me
 * Kembalikan data user yang sedang login + profile per role:
 *  - dosen_wali: { nip, jadwal_perwalian }
 *  - mahasiswa : { nim, angkatan, ipk, ips_terakhir, total_sks_lulus, dosen_wali }
 *  - kaprodi   : null (tidak ada profil tambahan)
 */
async function getMe(req, res) {
  try {
    const userResult = await query(
      'SELECT id, email, nama, role, avatar_url, last_login_at FROM users WHERE id = $1',
      [req.user.id],
    );
    const user = userResult.rows[0];

    if (!user) {
      return fail(res, 'User tidak ditemukan', 404);
    }

    let profile = null;
    if (user.role === 'dosen_wali') {
      const r = await query(
        'SELECT nip, jadwal_perwalian FROM profile_dosen WHERE user_id = $1',
        [user.id],
      );
      profile = r.rows[0] ?? null;
    } else if (user.role === 'mahasiswa') {
      const r = await query(
        `SELECT pm.nim, pm.angkatan, pm.ipk, pm.ips_terakhir, pm.total_sks_lulus,
                json_build_object('id', dw.id, 'nama', dw.nama, 'jadwal_perwalian', pd.jadwal_perwalian) AS dosen_wali
         FROM profile_mahasiswa pm
         LEFT JOIN users dw ON dw.id = pm.dosen_wali_id
         LEFT JOIN profile_dosen pd ON pd.user_id = dw.id
         WHERE pm.user_id = $1`,
        [user.id],
      );
      profile = r.rows[0] ?? null;
    }

    return res.json({ success: true, data: { ...user, profile }, message: 'OK' });
  } catch (err) {
    return failFromError(res, err, 'Gagal mengambil data user');
  }
}

/**
 * POST /api/v1/auth/dev-login
 * Dev-only login: terima { email }, balas JWT + user data sama format dengan /auth/google.
 * Gated NODE_ENV !== 'production'.
 */
async function devLogin(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return fail(res, 'Endpoint tidak ditemukan', 404);
  }

  const { email } = req.body ?? {};
  if (!email) {
    return fail(res, 'Field "email" wajib diisi');
  }

  try {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return fail(res, 'Email tidak terdaftar di sistem', 404);
    }
    if (!user.is_active) {
      return fail(res, 'Akun tidak aktif', 403);
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
    return failFromError(res, err, 'Login gagal');
  }
}

module.exports = { googleLogin, getMe, devLogin };
