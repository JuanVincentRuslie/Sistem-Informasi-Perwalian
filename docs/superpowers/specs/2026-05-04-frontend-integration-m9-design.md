# M9 — Frontend Integration Design

> **Status**: brainstorming approved, awaiting user review of spec
> **Date**: 2026-05-04
> **Goal**: Frontend berhenti pakai mock untuk semua flow utama; semua page panggil backend nyata via JWT auth.

---

## 1. Overview & Scope

### In scope
- Bikin `client.js` (HTTP wrapper method-based)
- Tambah `POST /auth/dev-login` di backend (gated `NODE_ENV !== 'production'`) + JWT TTL 6 jam
- Replace mock di 8 file API frontend, urutan: **auth → mahasiswa → dosen-wali → kaprodi**
- Hapus folder `_mock/` setelah swap selesai
- Inline-fix Issue 1 & 2 saat task riwayat-nilai (DPS upload)
- Implement Google OAuth real (task **terakhir** M9, setelah `.env` Google dilengkapi user)

### Out of scope (defer ke M10)
- Standardize error handling backend
- Request validation middleware backend
- Logging dasar
- Test coverage backend
- Frontend role-based route guard (mahasiswa akses URL kaprodi)
- Fallback offline mode
- Multi-tab logout sync (storage event listener)

### Success criteria
- Login dev (3 tombol role) panggil backend dapet JWT, simpan localStorage, redirect dashboard
- Setiap halaman utama (8 file API) ambil data dari backend, bukan mock
- 401 dari backend → frontend auto-redirect ke `/login`
- 5xx dari backend → throw error dengan message backend (atau "Server error" generic)
- Mock files terhapus dari repo
- Google OAuth real berfungsi end-to-end

### Critical assumption
- Seed users di [backend/src/seeds/seed-users.js] punya minimal 1 email per role (mahasiswa, dosen_wali, kaprodi). Email harus match dengan mapping `DEV_EMAILS` di LoginPage. Verifikasi sebelum coding LoginPage.

---

## 2. API Client (`frontend/src/api/client.js`)

**File baru**: [frontend/src/api/client.js](../../../frontend/src/api/client.js)

### Tanggung jawab
- Single source untuk fetch backend
- Ambil base URL dari `import.meta.env.VITE_API_BASE_URL`
- Inject `Authorization: Bearer <token>` header dari localStorage
- Parse JSON response
- Throw error kalau `success === false` atau status 5xx
- Handle 401: clear localStorage + force redirect ke `/login`

### API yang di-expose (method-based)
- `apiClient.get(path, query?)` — GET, optional query string params
- `apiClient.post(path, body)` — POST JSON
- `apiClient.put(path, body)` — PUT JSON
- `apiClient.del(path)` — DELETE
- `apiClient.upload(path, formData)` — POST multipart/form-data (Excel & PDF). **Tidak set Content-Type** — biar browser auto-set boundary

### Internal helper `request(method, path, options)`

```js
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

async function request(method, path, { body, query, isFormData } = {}) {
  const url = BASE_URL + path + (query ? '?' + new URLSearchParams(query) : '');
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
    window.location.href = '/login';
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

### Env file
- [frontend/.env](../../../frontend/.env) berisi `VITE_API_BASE_URL=http://localhost:3000/api/v1`
- [frontend/.env.example](../../../frontend/.env.example) untuk reference (commit ke git)
- Tambah `frontend/.env` ke `.gitignore` kalau belum

### Pattern usage di api files
```js
// frontend/src/api/periode.js (after refactor)
import { apiClient } from './client.js';

export const getPeriodeManagement = () => apiClient.get('/periode/management');
export const createPeriode = (payload) => apiClient.post('/periode', payload);
export const activatePeriode = (id) => apiClient.put(`/periode/${id}/aktivasi`);
export const deletePeriode = (id) => apiClient.del(`/periode/${id}`);
export const previewUploadJadwalKelas = ({ file, periode_id }) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('periode_id', String(periode_id));
  return apiClient.upload('/kelas/upload-jadwal', fd);
};
```

---

## 3. Auth Flow

### 3.1 Backend — JWT TTL
[backend/src/modules/auth/auth.service.js:64](../../../backend/src/modules/auth/auth.service.js#L64): `expiresIn: '7d'` → `expiresIn: '6h'`. Satu line.

### 3.2 Backend — Endpoint baru `POST /api/v1/auth/dev-login`

- File: [backend/src/modules/auth/auth.controller.js](../../../backend/src/modules/auth/auth.controller.js) tambah `devLogin` handler
- Router [auth.router.js] tambah route `POST /dev-login` (tanpa middleware authenticate)
- Handler:
  - Cek `if (process.env.NODE_ENV === 'production') return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' })`
  - Body: `{ email }` (no password)
  - Call `findUserByEmail(email)` — kalau null → 404 "Email tidak terdaftar"
  - Cek `is_active` — kalau false → 403 "Akun tidak aktif"
  - Sign JWT (TTL sudah 6h)
  - Response **persis sama format dengan `/auth/google`**:
    ```json
    {
      "success": true,
      "data": {
        "token": "...",
        "user": { "id": 1, "email": "...", "nama": "...", "role": "mahasiswa", "avatar_url": null }
      },
      "message": "Login berhasil (dev mode)"
    }
    ```

### 3.3 Frontend — `frontend/src/api/auth.js` (file baru)
```js
import { apiClient } from './client.js';

export const login = (email) => apiClient.post('/auth/dev-login', { email });
export const getMe = () => apiClient.get('/auth/me');
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};
```

### 3.4 Frontend — Refactor [contexts/AuthContext.jsx](../../../frontend/src/contexts/AuthContext.jsx)

- Storage keys: `auth_token` + `auth_user`
- State: `{ user, token }`
- `login(loginResponseData)` — terima `{ token, user }`, simpan ke localStorage + state
- `logout()` — hapus dari localStorage + state, navigate `/login`
- `useState` initializer baca dari localStorage saat mount (sama pattern existing)
- **Tidak ada validasi token expiry sendiri** — biar backend yang reject 401, apiClient yang handle redirect

### 3.5 Frontend — Refactor [LoginPage.jsx](../../../frontend/src/features/auth/LoginPage.jsx)

```js
const DEV_EMAILS = {
  mahasiswa: 'mahasiswa@kampus.ac.id',
  dosen_wali: 'dosen@kampus.ac.id',
  kaprodi: 'kaprodi@kampus.ac.id',
};

async function handleLogin(role) {
  try {
    const res = await api.auth.login(DEV_EMAILS[role]);
    auth.login(res.data); // {token, user}
    navigate('/dashboard');
  } catch (err) {
    setError(err.message);
  }
}
```

- Tampilkan error state (Alert MUI) kalau login gagal
- **Email harus match seed backend** — verifikasi dulu, update `seed-users.js` kalau perlu

### 3.6 Google OAuth Real (task terakhir M9)

- File baru `AuthCallbackPage.jsx` — route `/auth/callback?code=...`, panggil `apiClient.post('/auth/google', { code })`, lalu `auth.login(res.data)` + navigate dashboard
- LoginPage refactor: tombol "Login dengan Google" → `window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?...'`
- Tombol dev (3 role) di-hide kalau `import.meta.env.PROD === true`
- Backend `.env` user lengkapi: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

### 3.7 Edge case yang sudah di-handle
- 401 dari backend (token expired) → apiClient redirect /login
- User refresh page → AuthContext baca dari localStorage, tetap login sampai token expired
- User open tab kedua → share token via localStorage (sama login state)
- User logout di tab lain → tab ini natural flow: aksi berikutnya → 401 → redirect (tidak ada storage event sync)
- App bootstrap: trust localStorage, tidak preflight `/auth/me` (flicker minor diterima)

---

## 4. Per-Role Integration Plan

Urutan: **Auth → Mahasiswa → Dosen-Wali → Kaprodi**. Tiap fase = beberapa task kecil, masing-masing di-test sebelum lanjut. Commit per page (diff kecil, gampang revert).

### 4.0 Foundation (sebelum role apapun)
- `client.js` jadi (Section 2)
- `api/auth.js` + dev-login backend + AuthContext refactor + LoginPage refactor (Section 3)
- Login dev sebagai mahasiswa berhasil → dashboard tampil (mungkin error karena fetch belum di-swap, itu OK)
- Verifikasi seed users [backend/src/seeds/seed-users.js] match dengan email mapping LoginPage

### 4.1 Mahasiswa side

File API di-touch: `akademik.js`, `rencanaStudi.js`, `riwayatNilai.js`, `kelas.js` (baru kalau belum ada)

Page sequence (test per page selesai sebelum lanjut):

1. **Dashboard mahasiswa** ([DashboardPage.jsx](../../../frontend/src/features/mahasiswa/dashboard/DashboardPage.jsx))
   - `api/akademik.js#getRingkasanAkademik` → `apiClient.get('/akademik/saya/ringkasan')`
   - Test: card IPK, SKS, periode aktif, dosen wali tampil

2. **Pohon Kurikulum** ([PohonKurikulumPage.jsx](../../../frontend/src/features/mahasiswa/pohon-kurikulum/PohonKurikulumPage.jsx))
   - `api/akademik.js#getPohonKurikulum` → `apiClient.get('/akademik/saya/pohon-kurikulum')`
   - Test: nodes + edges + warna match status backend

3. **DPS Upload Panel** ([DpsUploadPanel.jsx](../../../frontend/src/features/mahasiswa/pohon-kurikulum/components/DpsUploadPanel.jsx))
   - Refactor `api/riwayatNilai.js`:
     - `uploadDps(file)` → `apiClient.upload('/riwayat-nilai/upload-dps', formData)`
     - `confirmUploadDps({upload_token, mode, items})` → `apiClient.post('/riwayat-nilai/upload-dps/confirm', payload)`
     - `manualEntry(items)` → `apiClient.post('/riwayat-nilai/manual', { items })`
     - `getRiwayatSaya()` → `apiClient.get('/riwayat-nilai/saya')`
   - **Inline-fix Issue 1**: hapus kalkulasi IPK lokal (Section 6)
   - **Inline-fix Issue 2**: hapus kolom SKS + Angka dari preview table (Section 6)

4. **Perwalian** ([PerwalianPage.jsx](../../../frontend/src/features/mahasiswa/perwalian/PerwalianPage.jsx))
   - `api/rencanaStudi.js`:
     - `getRencanaStudiSaya(periode_id?)` → `apiClient.get('/rencana-studi/saya', { periode_id })`
     - `submitRencanaStudi()` → `apiClient.post('/rencana-studi/saya/submit')` (no id — `/saya` resolves dari JWT)
   - Test: status FRS, list matkul, total SKS, action button conditional state

5. **Tambah Matkul** ([TambahMatkulPage.jsx](../../../frontend/src/features/mahasiswa/perwalian/TambahMatkulPage.jsx))
   - `api/rencanaStudi.js`: `addItem`, `removeItem` → `POST /rencana-studi/saya/items`, `DELETE /rencana-studi/saya/items/:id`
   - File baru `api/kelas.js` kalau belum ada → `getKelas({ periode_id })` → `apiClient.get('/kelas', { periode_id })`
   - Test: cari kelas, add ke FRS, hapus dari FRS

**Demo checkpoint mahasiswa**: end-to-end flow login → dashboard → upload DPS → buka perwalian → tambah matkul → submit FRS.

### 4.2 Dosen-Wali side

File API di-touch: `dosenWali.js`, extend `akademik.js`, extend `riwayatNilai.js`, extend `rencanaStudi.js`

**Pre-step**: endpoint inventory. List API call yang frontend butuh vs apa yang backend punya. Kalau gap, **lapor ke user dan bikin endpoint backend bareng** (jangan defer, jangan mock fallback).

Page sequence:
1. **Dashboard Dosen Wali** ([DosenDashboardPage.jsx](../../../frontend/src/features/dosen-wali/dashboard/DosenDashboardPage.jsx))
   - Endpoint kemungkinan: `GET /rencana-studi/dosen/list?status=`. Kalau perlu summary kartu, mungkin endpoint dedicated `GET /dosen-wali/dashboard` — verifikasi dulu, kalau gap → bikin

2. **Detail Mahasiswa** ([DetailMahasiswaPage.jsx](../../../frontend/src/features/dosen-wali/detail-mahasiswa/DetailMahasiswaPage.jsx))
   - Tab Dashboard: `apiClient.get('/akademik/mahasiswa/:id/ringkasan')`
   - Tab Pohon: `apiClient.get('/akademik/mahasiswa/:id/pohon-kurikulum')`
   - Tab Rencana Studi: `apiClient.get('/rencana-studi/dosen/list?mahasiswa_id=:id')` atau `apiClient.get('/rencana-studi/:id')`
   - Approve action: `apiClient.post('/rencana-studi/dosen/:id/approve')`
   - Revisi action: `apiClient.post('/rencana-studi/dosen/:id/revisi', { catatan })`

3. **Jadwal Perwalian** ([JadwalPerwalianPage.jsx](../../../frontend/src/features/dosen-wali/jadwal-perwalian/JadwalPerwalianPage.jsx))
   - Endpoint kemungkinan belum ada di backend → endpoint inventory dulu, lapor user, bikin bareng kalau gap

**Demo checkpoint dosen-wali**: dosen wali login → dashboard → detail mahasiswa → review FRS → approve/revisi → terlihat di mahasiswa side.

### 4.3 Kaprodi side

File API di-touch: `periode.js`, `kaprodi.js`, `kaprodiManagement.js`

**Pre-step**: endpoint inventory (sama pattern 4.2).

Page sequence:
1. **Dashboard Kaprodi** ([KaprodiDashboardPage.jsx](../../../frontend/src/features/kaprodi/dashboard/KaprodiDashboardPage.jsx))
   - Endpoint: cek backend, kalau gap → bikin

2. **Periode Management** ([PeriodePage.jsx](../../../frontend/src/features/kaprodi/periode/PeriodePage.jsx))
   - Refactor `api/periode.js` semua function (list, create, activate, delete, upload preview, upload confirm)
   - Endpoint M4 + M5 sudah ready: `/periode/*`, `/kelas/upload-jadwal`, `/kelas/upload-jadwal/confirm`
   - Test: bikin periode, aktivasi, upload Excel jadwal, delete

3. **Dosen Wali Management** ([DosenWaliPage.jsx](../../../frontend/src/features/kaprodi/dosen-wali/DosenWaliPage.jsx))
   - List + assign + detail
   - Endpoint kaprodi user management — kemungkinan gap, bikin bareng

4. **Mahasiswa Management** ([MahasiswaPage.jsx](../../../frontend/src/features/kaprodi/mahasiswa/MahasiswaPage.jsx))
   - List + detail
   - Endpoint kemungkinan gap, bikin bareng

**Demo checkpoint kaprodi**: kaprodi login → bikin periode → aktivasi → upload Excel jadwal → assign dosen wali → buka detail mahasiswa.

### 4.4 Cleanup & Google OAuth
- Hapus folder `frontend/src/api/_mock/` (Section 5)
- Implement Google OAuth real (Section 3.6) sebagai task terakhir
- Update [MILESTONES-BACKEND.md] checklist M9 — semua centang

---

## 5. Mock Removal Strategy

### Pattern per file API
1. Selesai refactor `api/<feature>.js` ke `apiClient`
2. Verifikasi semua page yang import dari file itu jalan dengan backend (test manual)
3. Hapus `frontend/src/api/_mock/<feature>.js` di commit yang sama dengan refactor

### Folder structure final
```
frontend/src/api/
├── client.js           ← baru
├── auth.js             ← baru
├── kelas.js            ← baru (kalau belum ada)
├── akademik.js         ← refactored
├── dosenWali.js
├── kaprodi.js
├── kaprodiManagement.js
├── periode.js
├── rencanaStudi.js
├── riwayatNilai.js
└── _mock/              ← FOLDER DIHAPUS
```

### Pengecualian — `_mock/pohon-kurikulum/`
File [edgeRelationTypes.js](../../../frontend/src/api/_mock/pohon-kurikulum/edgeRelationTypes.js), [kurikulum2023Edges.js](../../../frontend/src/api/_mock/pohon-kurikulum/kurikulum2023Edges.js), [kurikulum2023Nodes.js](../../../frontend/src/api/_mock/pohon-kurikulum/kurikulum2023Nodes.js) — perlu cek dulu sebelum hapus:
- Grep `import.*pohon-kurikulum` di `frontend/src/`
- Kalau dipakai langsung di component (selain mock akademik) → pindah ke `frontend/src/data/`
- Kalau cuma untuk mock akademik → ikut hapus

---

## 6. Issue 1 & 2 Inline-Fix Detail

Saat task **4.1 step 3 (DPS Upload Panel)**.

### Issue 1 — Hapus kalkulasi IPK lokal
**File**: [DpsUploadPanel.jsx](../../../frontend/src/features/mahasiswa/pohon-kurikulum/components/DpsUploadPanel.jsx) (atau child yang render kartu IPK Terhitung — verify saat coding)

**Perubahan**:
- Hapus logic `Σ(angka × sks) / Σsks` lokal
- Setelah `apiClient.upload('/riwayat-nilai/upload-dps', formData)`, ambil `response.data.academic.ipk.nilai`
- Tampilkan langsung di card "IPK Terhitung"
- Hapus state/import yang sudah gak dipakai

**Verify**: response preview backend M8 sudah berisi `data.academic`. Kalau ternyata belum, balik ke `riwayat-nilai.service.js#uploadDpsPreview` dan tambahin di response.

### Issue 2 — Hapus kolom SKS + Angka dari preview table
**File**: [DpsPreviewTable.jsx](../../../frontend/src/features/mahasiswa/pohon-kurikulum/components/DpsPreviewTable.jsx)

**Perubahan**:
- Hapus `<TableCell>SKS</TableCell>` di `<TableHead>` + body row
- Hapus `<TableCell>Angka</TableCell>` di `<TableHead>` + body row (`nilai_angka` tidak dipakai di UI per keputusan M8)
- Kolom yang tersisa: kode, nama matkul, nilai huruf, status (LULUS/TIDAK_LULUS)
- Hapus state/prop `sks` dan `nilai_angka` per row kalau cuma dipakai di table
- **Backend behavior tetap**: confirm endpoint lookup sks dari `master_matkul` saat insert (sudah di M8)

### Update checklist
Setelah dua fix selesai, centang di [MILESTONES-BACKEND.md M9 Deliverable]:
- `[x] Issue 1 (IPK Terhitung dari frontend lokal) sudah fix`
- `[x] Issue 2 (kolom SKS di preview) sudah dihapus`

---

## 7. Risk & Open Questions (Resolved)

### R1 — Backend endpoint gap (medium severity)
**Decision**: kalau gap ditemukan, **lapor user langsung dan bikin endpoint baru bareng**. Jangan defer, jangan fallback ke mock.
- Pre-step di fase 4.2 dan 4.3: endpoint inventory sebelum mulai swap
- Kandidat gap: `/dosen-wali/dashboard`, `/dosen-wali/saya/jadwal-perwalian`, `/kaprodi/dashboard`, `/users?role=mahasiswa`, `/users?role=dosen_wali`

### R2 — Seed users email mismatch (low severity)
**Mitigasi**: cek [seed-users.js](../../../backend/src/seeds/seed-users.js) sebelum coding LoginPage. Update salah satu sisi biar match. Idealnya seed punya minimal 1 user per role dengan email predictable (`mahasiswa@kampus.ac.id`, `dosen@kampus.ac.id`, `kaprodi@kampus.ac.id`).

### R3 — Response shape divergence (low severity)
**Mitigasi**: testing manual per page setelah swap. Kalau divergence ditemukan, prioritaskan **adapt frontend** kecuali field penting hilang dari backend.

### R4 — Pohon-kurikulum mock files (medium severity, blocker untuk hapus mock)
**Mitigasi**: grep `import.*pohon-kurikulum` di frontend. Kalau dipakai langsung di component, pindah ke `frontend/src/data/`. Kalau cuma untuk mock akademik, ikut hapus.

### R5 — JWT TTL terlalu pendek untuk demo
**Decision**: TTL = **6 jam** (cukup untuk satu sesi demo skripsi penuh).

### Q1 — `/auth/me` di app bootstrap?
**Decision**: **A** — trust localStorage. Bypass ke dashboard, terus 401 dari first API call → redirect login. Flicker minor diterima.

### Q2 — Backend down handling (network error / 5xx)
**Decision**: 
- Network error (fetch throw) → `throw new Error('Backend tidak bisa dihubungi. Cek koneksi atau hubungi admin.')`
- 5xx response → `throw new Error(json.message ?? 'Server error')`
- Caller component tampilkan error state via `useFetch` pattern existing

### Q3 — Multi-tab logout sync
**Decision**: tidak ada storage event listener. Natural flow: tab lain pas aksi → 401 → redirect via apiClient. Behavior web umumnya.

### Hal yang **bukan** risk (sudah ter-mitigate)
- Token expired mid-session → apiClient redirect /login
- User refresh page → AuthContext baca localStorage
- File upload Content-Type → apiClient.upload skip Content-Type, browser handle
- Google OAuth setup blocking M9 → di-defer ke task terakhir

---

## Appendix: File Inventory M9

### File baru
- `frontend/src/api/client.js`
- `frontend/src/api/auth.js`
- `frontend/src/api/kelas.js` (kalau belum ada)
- `frontend/.env`
- `frontend/.env.example`
- `frontend/src/features/auth/AuthCallbackPage.jsx` (saat task terakhir Google OAuth)

### File diubah backend
- `backend/src/modules/auth/auth.service.js` — JWT TTL 7d → 6h
- `backend/src/modules/auth/auth.controller.js` — tambah `devLogin` handler
- `backend/src/modules/auth/auth.router.js` — tambah `POST /dev-login`
- `backend/src/seeds/seed-users.js` — verify/update email seed

### File diubah frontend
- `frontend/src/contexts/AuthContext.jsx` — store token + user
- `frontend/src/features/auth/LoginPage.jsx` — panggil dev-login backend
- `frontend/src/api/akademik.js` — refactor ke apiClient
- `frontend/src/api/dosenWali.js`
- `frontend/src/api/kaprodi.js`
- `frontend/src/api/kaprodiManagement.js`
- `frontend/src/api/periode.js`
- `frontend/src/api/rencanaStudi.js`
- `frontend/src/api/riwayatNilai.js`
- `frontend/src/features/mahasiswa/pohon-kurikulum/components/DpsUploadPanel.jsx` — Issue 1 fix
- `frontend/src/features/mahasiswa/pohon-kurikulum/components/DpsPreviewTable.jsx` — Issue 2 fix
- `.gitignore` — tambah `frontend/.env`

### File dihapus
- `frontend/src/api/_mock/` (whole folder, kecuali `pohon-kurikulum/` perlu verify)
