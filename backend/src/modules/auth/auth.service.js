const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { query } = require('../../db/pool');
const { env } = require('../../config/env');

// OAuth2Client diinisialisasi sekali — reuse untuk semua request
const oauthClient = new OAuth2Client(
  env.googleClientId,
  env.googleClientSecret,
  env.googleRedirectUri,
);

/**
 * Tukar Google authorization code dengan data user dari Google.
 * Menggunakan id_token dari response Google — tidak perlu request tambahan.
 */
async function getGoogleUser(code) {
  const { tokens } = await oauthClient.getToken(code);
  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();
  return {
    googleId: payload.sub,
    email: payload.email,
    nama: payload.name,
    avatarUrl: payload.picture,
  };
}

/**
 * Cari user by email. Return null kalau tidak ada.
 * Auth model kita: user WAJIB pre-registered oleh kaprodi — tidak ada auto-create.
 */
async function findUserByEmail(email) {
  const result = await query(
    'SELECT id, email, nama, role, is_active FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0] ?? null;
}

/**
 * Update last_login_at, google_id, dan avatar setiap login berhasil.
 */
async function updateLastLogin(userId, googleId, avatarUrl) {
  await query(
    `UPDATE users
     SET last_login_at = NOW(), google_id = $2, avatar_url = $3, updated_at = NOW()
     WHERE id = $1`,
    [userId, googleId, avatarUrl],
  );
}

/**
 * Sign JWT internal. Payload minimal: id, email, role.
 * Expire 6 jam — cukup untuk sesi demo penuh.
 */
function signJwt(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '6h' },
  );
}

module.exports = { getGoogleUser, findUserByEmail, updateLastLogin, signJwt };
