const crypto = require('node:crypto');

// In-memory staging untuk hasil parse Excel sebelum kaprodi confirm.
// TTL 10 menit. Single-instance only.
const TTL_MS = 10 * 60 * 1000;
const store = new Map();

function makeToken() {
  return crypto.randomBytes(16).toString('hex');
}

function put(payload) {
  const token = makeToken();
  const expiresAt = Date.now() + TTL_MS;
  store.set(token, { payload, expiresAt });
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

// Cleanup periodik untuk entry expired (jaga supaya Map tidak bocor)
setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of store.entries()) {
    if (entry.expiresAt < now) store.delete(token);
  }
}, 60 * 1000).unref();

module.exports = { put, get, remove };
