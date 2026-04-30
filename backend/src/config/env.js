const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  return value === 'true';
}

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  pgssl: parseBoolean(process.env.PGSSL, false),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  // Google OAuth — optional saat startup, wajib hanya saat endpoint /auth/google dipanggil
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? '',
  googleAllowedStaffDomain: process.env.GOOGLE_ALLOWED_STAFF_DOMAIN ?? '',
  googleAllowedStudentDomain: process.env.GOOGLE_ALLOWED_STUDENT_DOMAIN ?? '',
};

module.exports = {
  env,
};
