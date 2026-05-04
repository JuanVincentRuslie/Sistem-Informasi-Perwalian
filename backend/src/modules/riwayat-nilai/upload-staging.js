const crypto = require('node:crypto');

// In-memory staging untuk hasil parse DPS sebelum mahasiswa confirm.
// TTL 10 menit. Single-instance only (sama strategi dengan kelas).
const TTL_MS = 10 * 60 * 1000;
const store = new Map();

function makeToken() {
  return crypto.randomBytes(16).toString('hex');
}

function put(payload) {
  const token = makeToken();
  store.set(token, { payload, expiresAt: Date.now() + TTL_MS });
  return token;
}

function get(token) {
  const entry = store.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(token);
    return null;
  }
  return entry.payload;
}

function remove(token) {
  store.delete(token);
}

setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of store.entries()) {
    if (entry.expiresAt < now) store.delete(token);
  }
}, 60 * 1000).unref();

module.exports = { put, get, remove };
