# M9 Plan 1 — Foundation Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup HTTP client + auth foundation so frontend bisa login dev dan akses semua endpoint backend dengan JWT 6h.

**Architecture:**
- Backend: tambah `POST /api/v1/auth/dev-login` (gated `NODE_ENV !== 'production'`) yang return same response format as `/auth/google`. Ubah JWT TTL 7d → 6h.
- Frontend: bikin `apiClient` method-based (get/post/put/del/upload), refactor AuthContext simpan `{user, token}`, refactor LoginPage panggil dev-login endpoint.

**Tech Stack:** Node.js + Express + PostgreSQL (backend), React + Vite + MUI + JS (frontend), `jsonwebtoken` for JWT, `axios` for backend test scripts.

**Reference spec:** [docs/superpowers/specs/2026-05-04-frontend-integration-m9-design.md](../specs/2026-05-04-frontend-integration-m9-design.md) Sections 1-3.

**Email mapping (for LoginPage dev buttons)** — sesuai seed existing:
- mahasiswa → `6180000001@student.unpar.ac.id`
- dosen_wali → `husnul.hakim@unpar.ac.id`
- kaprodi → `kaprodi@unpar.ac.id`

---

## Task 1: Backend JWT TTL change (7d → 6h)

**Files:**
- Modify: `backend/src/modules/auth/auth.service.js:64`

- [ ] **Step 1: Edit auth.service.js**

Ubah satu line:

```js
function signJwt(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '6h' },  // ← was '7d'
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/modules/auth/auth.service.js
git commit -m "feat(auth): JWT TTL 7d -> 6h for M9 integration"
```

---

## Task 2: Backend dev-login test script (TDD red)

**Files:**
- Create: `backend/scripts/test-dev-login.js`

- [ ] **Step 1: Create test script**

```js
/**
 * Test script untuk POST /api/v1/auth/dev-login.
 * Pre-requisites:
 * - Backend running di http://localhost:3000
 * - Seed users sudah jalan (mahasiswa, dosen_wali, kaprodi)
 * - NODE_ENV !== 'production'
 *
 * Usage: node scripts/test-dev-login.js
 */
const axios = require('axios');

const BASE = 'http://localhost:3000/api/v1';

const SEEDS = {
  mahasiswa: '6180000001@student.unpar.ac.id',
  dosen_wali: 'husnul.hakim@unpar.ac.id',
  kaprodi: 'kaprodi@unpar.ac.id',
};

async function expectOk(label, fn) {
  try {
    const result = await fn();
    console.log(`  ✓ ${label}`);
    return result;
  } catch (err) {
    console.log(`  ✗ ${label}`);
    console.log(`    ${err.response?.status} ${JSON.stringify(err.response?.data)}`);
    throw err;
  }
}

async function expectFail(label, fn, expectedStatus) {
  try {
    await fn();
    console.log(`  ✗ ${label} — expected fail but succeeded`);
    throw new Error('expected fail');
  } catch (err) {
    if (err.response?.status === expectedStatus) {
      console.log(`  ✓ ${label} (status ${expectedStatus})`);
    } else {
      console.log(`  ✗ ${label} — expected ${expectedStatus} but got ${err.response?.status}`);
      throw err;
    }
  }
}

async function run() {
  console.log('Test 1: Login mahasiswa berhasil');
  const mhsRes = await expectOk('login mahasiswa', () =>
    axios.post(`${BASE}/auth/dev-login`, { email: SEEDS.mahasiswa })
  );
  if (!mhsRes.data?.success) throw new Error('success flag missing');
  if (!mhsRes.data?.data?.token) throw new Error('token missing');
  if (mhsRes.data?.data?.user?.role !== 'mahasiswa') throw new Error('role mismatch');
  console.log(`    token length: ${mhsRes.data.data.token.length}, user.id: ${mhsRes.data.data.user.id}`);

  console.log('\nTest 2: Login dosen wali berhasil');
  const dosenRes = await expectOk('login dosen_wali', () =>
    axios.post(`${BASE}/auth/dev-login`, { email: SEEDS.dosen_wali })
  );
  if (dosenRes.data?.data?.user?.role !== 'dosen_wali') throw new Error('role mismatch');

  console.log('\nTest 3: Login kaprodi berhasil');
  const kaprodiRes = await expectOk('login kaprodi', () =>
    axios.post(`${BASE}/auth/dev-login`, { email: SEEDS.kaprodi })
  );
  if (kaprodiRes.data?.data?.user?.role !== 'kaprodi') throw new Error('role mismatch');

  console.log('\nTest 4: Email tidak terdaftar -> 404');
  await expectFail(
    'unknown email',
    () => axios.post(`${BASE}/auth/dev-login`, { email: 'nonexistent@kampus.ac.id' }),
    404,
  );

  console.log('\nTest 5: Body tanpa email -> 400');
  await expectFail(
    'missing email',
    () => axios.post(`${BASE}/auth/dev-login`, {}),
    400,
  );

  console.log('\nTest 6: Token bisa dipakai akses /auth/me');
  const meRes = await expectOk('GET /auth/me dengan token mahasiswa', () =>
    axios.get(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${mhsRes.data.data.token}` },
    })
  );
  if (meRes.data?.data?.email !== SEEDS.mahasiswa) throw new Error('me email mismatch');

  console.log('\n✅ Semua test lulus');
}

run().catch((err) => {
  console.error('\n❌ Test gagal:', err.message);
  process.exit(1);
});
```

- [ ] **Step 2: Pastikan backend running**

Buka terminal kedua. Jalankan:
```bash
cd backend
npm run dev
```

Pastikan log `Server listening on http://localhost:3000` muncul.

- [ ] **Step 3: Run test untuk verify FAIL**

```bash
cd backend
node scripts/test-dev-login.js
```

Expected: Test 1 langsung gagal dengan status 404 (endpoint belum ada). Pesan: `Cannot POST /api/v1/auth/dev-login` atau `Endpoint tidak ditemukan` dari fallback handler di app.js.

---

## Task 3: Backend dev-login endpoint (TDD green)

**Files:**
- Modify: `backend/src/modules/auth/auth.controller.js`
- Modify: `backend/src/modules/auth/auth.router.js`

- [ ] **Step 1: Tambah handler `devLogin` di auth.controller.js**

Tambah function baru di file (di bawah `getMe`, sebelum `module.exports`):

```js
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
```

Update line module.exports terakhir:
```js
module.exports = { googleLogin, getMe, devLogin };
```

- [ ] **Step 2: Tambah route di auth.router.js**

Tambah route baru sebelum `module.exports`:
```js
router.post('/dev-login', authController.devLogin);
```

File final:
```js
const { Router } = require('express');
const { authenticate } = require('../../middleware/authenticate');
const authController = require('./auth.controller');

const router = Router();

router.post('/google', authController.googleLogin);
router.post('/dev-login', authController.devLogin);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
```

- [ ] **Step 3: Restart backend dev server**

Backend pakai nodemon (kalau belum, restart manual via Ctrl+C lalu `npm run dev`).

- [ ] **Step 4: Run test untuk verify PASS**

```bash
cd backend
node scripts/test-dev-login.js
```

Expected output:
```
Test 1: Login mahasiswa berhasil
  ✓ login mahasiswa
    token length: ..., user.id: ...
Test 2: Login dosen wali berhasil
  ✓ login dosen_wali
Test 3: Login kaprodi berhasil
  ✓ login kaprodi
Test 4: Email tidak terdaftar -> 404
  ✓ unknown email (status 404)
Test 5: Body tanpa email -> 400
  ✓ missing email (status 400)
Test 6: Token bisa dipakai akses /auth/me
  ✓ GET /auth/me dengan token mahasiswa

✅ Semua test lulus
```

Kalau ada test yang fail, fix bug di handler/router, restart backend, run lagi.

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/auth/auth.controller.js backend/src/modules/auth/auth.router.js backend/scripts/test-dev-login.js
git commit -m "feat(auth): add POST /auth/dev-login endpoint for M9 frontend integration"
```

---

## Task 4: Frontend env files

**Files:**
- Create: `frontend/.env`
- Create: `frontend/.env.example`
- Modify: `frontend/.gitignore`

- [ ] **Step 1: Create .env.example**

File `frontend/.env.example`:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

- [ ] **Step 2: Create .env**

File `frontend/.env` (sama isi dengan .env.example untuk start):
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

- [ ] **Step 3: Tambah .env ke .gitignore**

Edit `frontend/.gitignore`. Tambah di section akhir:
```
# Local env (jangan commit)
.env
.env.local
```

- [ ] **Step 4: Verify .env tidak ke-track git**

Run:
```bash
git status frontend/.env
```

Expected: `.env` tidak muncul di "Untracked files" maupun di "modified". Yang ke-track cuma `.env.example` dan `.gitignore`.

Kalau `.env` masih muncul di git status, pastikan `.gitignore` di-save dengan path yang benar.

- [ ] **Step 5: Commit**

```bash
git add frontend/.env.example frontend/.gitignore
git commit -m "chore(frontend): add VITE_API_BASE_URL env config for M9 integration"
```

---

## Task 5: Frontend HTTP client (`apiClient`)

**Files:**
- Create: `frontend/src/api/client.js`

- [ ] **Step 1: Create client.js**

File `frontend/src/api/client.js`:

```js
// HTTP client terpusat untuk seluruh frontend.
// Tanggung jawab:
// - Inject Authorization: Bearer <token> dari localStorage
// - Parse JSON response, throw error kalau success: false
// - Handle 401: clear localStorage + redirect /login
// - Handle 5xx: throw error dengan message backend
// - Handle network error: throw error generic

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

async function request(method, path, { body, query, isFormData } = {}) {
  let url = BASE_URL + path;
  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
    const qs = params.toString();
    if (qs) url += '?' + qs;
  }

  const headers = {};
  const token = localStorage.getItem('auth_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  } catch (err) {
    throw new Error('Backend tidak bisa dihubungi. Cek koneksi atau hubungi admin.');
  }

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Sesi habis, silakan login ulang');
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Server error');
  }

  if (res.status >= 500) {
    throw new Error(json?.message ?? 'Server error');
  }

  if (!json.success) {
    throw new Error(json.message ?? 'Request gagal');
  }

  return json;
}

export const apiClient = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  del: (path) => request('DELETE', path),
  upload: (path, formData) => request('POST', path, { body: formData, isFormData: true }),
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/client.js
git commit -m "feat(frontend): add apiClient HTTP wrapper with JWT injection + 401 redirect"
```

---

## Task 6: Frontend auth API helper

**Files:**
- Create: `frontend/src/api/auth.js`

- [ ] **Step 1: Create auth.js**

File `frontend/src/api/auth.js`:

```js
// Service layer untuk domain auth.
// Component TIDAK boleh panggil apiClient untuk auth langsung — harus lewat file ini.
import { apiClient } from './client.js';

/**
 * Login dev mode: kirim email saja (no password).
 * Backend gated NODE_ENV !== 'production'.
 * @param {string} email
 * @returns {Promise<{success, data: { token, user }, message}>}
 */
export const login = (email) => apiClient.post('/auth/dev-login', { email });

/**
 * Get current user dari token di localStorage.
 * @returns {Promise<{success, data: { id, email, nama, role, avatar_url }, message}>}
 */
export const getMe = () => apiClient.get('/auth/me');

/**
 * Logout: clear localStorage. JWT stateless, no backend call needed.
 */
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/auth.js
git commit -m "feat(frontend): add api/auth.js with login/getMe/logout helpers"
```

---

## Task 7: Frontend AuthContext refactor

**Files:**
- Modify: `frontend/src/contexts/AuthContext.jsx`

- [ ] **Step 1: Replace AuthContext.jsx with new version**

Full replace file `frontend/src/contexts/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState } from 'react';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // useState initializer: baca token + user dari localStorage saat first mount.
  // Pattern existing — sekali baca, state ini yang dipakai sampai login/logout berikutnya.
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  // Terima { token, user } dari response login (dev-login atau google).
  // Simpan di localStorage + state.
  const login = ({ token: newToken, user: newUser }) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: Verify no linter / build error**

```bash
cd frontend
npm run build
```

Expected: build succeeds tanpa error.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/contexts/AuthContext.jsx
git commit -m "refactor(auth): AuthContext stores {user, token}, persist both to localStorage"
```

---

## Task 8: Frontend LoginPage refactor

**Files:**
- Modify: `frontend/src/features/auth/LoginPage.jsx`

- [ ] **Step 1: Replace LoginPage.jsx with new version**

Full replace file `frontend/src/features/auth/LoginPage.jsx`:

```jsx
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import * as authApi from '../../api/auth.js';

// Email seed yang match dengan backend/src/seeds/seed-*.js.
// Kalau seed berubah, update mapping ini.
const DEV_EMAILS = {
  mahasiswa: '6180000001@student.unpar.ac.id',
  dosen_wali: 'husnul.hakim@unpar.ac.id',
  kaprodi: 'kaprodi@unpar.ac.id',
};

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // useState: simpan loading state per-tombol (biar tombol lain gak ke-disable saat 1 ditekan).
  // Pattern: hanya 1 login yang aktif sekali, jadi cukup track role yang sedang loading.
  const [loadingRole, setLoadingRole] = useState(null);

  // useState: error message dari backend kalau login gagal.
  const [error, setError] = useState(null);

  const handleLogin = async (role) => {
    setError(null);
    setLoadingRole(role);
    try {
      const res = await authApi.login(DEV_EMAILS[role]);
      // res.data = { token, user } — pass langsung ke AuthContext.login
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message ?? 'Login gagal');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      <Typography variant="h4" component="h1" fontWeight="bold">
        Login
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Sistem Informasi Perwalian (Dev Mode)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ width: 280 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2} sx={{ width: 280 }}>
        <Button
          variant="contained"
          size="large"
          disabled={loadingRole !== null}
          onClick={() => handleLogin('mahasiswa')}
          startIcon={loadingRole === 'mahasiswa' ? <CircularProgress size={16} /> : null}
        >
          Login sebagai Mahasiswa
        </Button>
        <Button
          variant="contained"
          size="large"
          disabled={loadingRole !== null}
          onClick={() => handleLogin('dosen_wali')}
          startIcon={loadingRole === 'dosen_wali' ? <CircularProgress size={16} /> : null}
        >
          Login sebagai Dosen Wali
        </Button>
        <Button
          variant="contained"
          size="large"
          disabled={loadingRole !== null}
          onClick={() => handleLogin('kaprodi')}
          startIcon={loadingRole === 'kaprodi' ? <CircularProgress size={16} /> : null}
        >
          Login sebagai Kaprodi
        </Button>
      </Stack>
    </Box>
  );
}

export default LoginPage;
```

- [ ] **Step 2: Verify build**

```bash
cd frontend
npm run build
```

Expected: build succeeds tanpa error.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/auth/LoginPage.jsx
git commit -m "refactor(auth): LoginPage calls /auth/dev-login backend instead of dummy"
```

---

## Task 9: End-to-end smoke test

**Files:** (no code change, manual verification only)

- [ ] **Step 1: Start backend**

Terminal 1:
```bash
cd backend
npm run dev
```

Pastikan log `Server listening on http://localhost:3000` muncul.

- [ ] **Step 2: Start frontend**

Terminal 2:
```bash
cd frontend
npm run dev
```

Pastikan log `Local: http://localhost:5173/` muncul.

- [ ] **Step 3: Smoke test login flow di browser**

Buka browser ke `http://localhost:5173/login`.

Lakukan checklist berikut **per role**:

**A. Login mahasiswa:**
1. Click tombol "Login sebagai Mahasiswa"
2. Tombol show loading spinner sebentar
3. Browser navigate ke `/dashboard`
4. Buka DevTools → Application → Local Storage → `http://localhost:5173`
5. Verify ada key `auth_token` (value JWT, mulai dengan `eyJ...`)
6. Verify ada key `auth_user` (value JSON dengan `id`, `email`, `nama`, `role: "mahasiswa"`)
7. (Dashboard mungkin error karena fetch belum di-swap — itu OK untuk Plan 1)

**B. Logout (manual via DevTools):**
1. DevTools → Application → Local Storage → klik kanan kedua key → delete
2. Refresh browser
3. Verify auto-redirect (atau tetap di route, tergantung router setup) — minimal kalau navigate ke route protected harus kena redirect

**C. Login dosen_wali:**
1. Login lagi pakai tombol "Login sebagai Dosen Wali"
2. Verify localStorage `auth_user.role === "dosen_wali"`
3. Verify `auth_user.email === "husnul.hakim@unpar.ac.id"`

**D. Login kaprodi:**
1. Verify localStorage `auth_user.role === "kaprodi"`
2. Verify `auth_user.email === "kaprodi@unpar.ac.id"`

**E. Error handling test:**
1. Stop backend (Ctrl+C di terminal 1)
2. Click tombol login
3. Verify Alert merah muncul dengan message "Backend tidak bisa dihubungi..."
4. Restart backend, login lagi → harus berhasil

- [ ] **Step 4: Log hasil test**

Tulis di chat hasil checklist (semua passed atau ada yang fail). Kalau fail, debug dulu sebelum lanjut.

- [ ] **Step 5: No commit needed (manual test)**

Tidak ada perubahan kode di task ini. Skip commit.

---

## Task 10: Update MILESTONES-BACKEND.md

**Files:**
- Modify: `docs/MILESTONES-BACKEND.md`

- [ ] **Step 1: Update task checklist M9**

Centang task yang sudah selesai di M9:

```markdown
### Tasks

- [x] Buat API client backend nyata di frontend (`client.js` + auth helper)
- [x] Implement `POST /auth/dev-login` di backend (sementara, gated `NODE_ENV !== 'production'`)
- [x] Replace mock auth frontend (LoginPage panggil dev-login, AuthContext simpan token)
- [ ] Replace mock periode
- [ ] Replace mock kaprodi management
- [ ] Replace mock rencana studi mahasiswa
- [ ] Replace mock dosen wali review
- [ ] Replace mock akademik
- [ ] Replace mock riwayat nilai
- [ ] Rapikan loading / error state setelah integrasi
- [ ] Implement Google OAuth real (akhir M9, setelah `.env` Google dilengkapi)
```

- [ ] **Step 2: Update Status Tracking table**

Update row M9:
```markdown
| 9. Integrasi Frontend | 🚧 In Progress | 2026-05-04 | - |
```

- [ ] **Step 3: Commit**

```bash
git add docs/MILESTONES-BACKEND.md
git commit -m "docs(m9): mark Plan 1 (Foundation) tasks done"
```

---

## End of Plan 1

**Deliverable:** Login dev (3 role) bekerja end-to-end. JWT 6h tersimpan di localStorage. apiClient siap dipakai feature lain. Tidak ada page integrasi backend yang lain (itu Plan 2+).

**Next plan:** Plan 2 — Mahasiswa Side Integration. Akan ditulis setelah Plan 1 selesai dan smoke test passed, supaya bisa benefit dari learning Plan 1 (e.g., kalau ada quirk di apiClient, bisa di-update sebelum mahasiswa-side mulai).

**Out of scope reminder:**
- Periode/akademik/rencana-studi/riwayat-nilai page integration → Plan 2-4
- Mock removal → setelah file API masing-masing di-refactor
- Google OAuth → Plan 5
- Backend hardening → M10
