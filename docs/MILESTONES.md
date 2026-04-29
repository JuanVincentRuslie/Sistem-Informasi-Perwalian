# Milestones — Sistem Informasi Perwalian Frontend

> Task tracker untuk development. Update checkbox `[ ]` jadi `[x]` setiap sub-task selesai.  
> **Aturan**: jangan loncat milestone. Selesain dulu yang current sebelum lanjut.

---

## 🎯 Milestone 1: Hello World Foundation

**Goal**: `npm run dev` jalan, buka browser, lihat halaman login kosong dengan tema MUI.

### Tasks

- [x] Init Vite project (template `react`, JavaScript, NOT TypeScript)
  ```bash
  npm create vite@latest . -- --template react
  npm install
  ```
- [x] Install dependencies dasar:
  ```bash
  npm install @mui/material @emotion/react @emotion/styled
  npm install @mui/icons-material
  npm install react-router-dom
  ```
- [x] Bikin folder structure sesuai `CLAUDE.md`:
  - [x] `src/app/`
  - [x] `src/api/_mock/`
  - [x] `src/hooks/`
  - [x] `src/contexts/`
  - [x] `src/shared/components/`
  - [x] `src/shared/layouts/`
  - [x] `src/features/auth/`
  - [x] `src/features/mahasiswa/`
  - [x] `src/features/dosen-wali/`
  - [x] `src/features/kaprodi/`
  - [x] `src/utils/`
- [x] Setup MUI theme dasar di `src/app/theme.js`:
  - [x] Primary color (boleh default biru MUI dulu)
  - [x] Font family default (Roboto)
  - [x] Export sebagai `theme`
- [x] Setup `src/main.jsx`:
  - [x] `<ThemeProvider>` wrap App
  - [x] `<CssBaseline />` untuk reset CSS
- [x] Bikin `src/features/auth/LoginPage.jsx`:
  - [x] Component placeholder dengan judul "Login"
  - [x] Center text "Sistem Informasi Perwalian"
  - [x] Tombol MUI "Login dengan Google" (belum berfungsi, click → console.log)
- [x] Update `src/app/App.jsx`:
  - [x] Render `<LoginPage />`
- [x] Run `npm run dev`, verify halaman muncul di browser

### Deliverable
✅ Buka `localhost:5173`, lihat halaman login dengan judul + tombol "Login dengan Google".

### Commit message saran
```
feat: setup vite + MUI + placeholder login page (milestone 1)
```

---

## 🎯 Milestone 2: Routing & Layout

**Goal**: Mock login (pilih role) → masuk ke dashboard layout sesuai role. Sidebar navigasi berbeda per role.

### Tasks

#### 2.1 — Auth Context & Mock Login
- [ ] `src/contexts/AuthContext.jsx`:
  - [ ] `AuthProvider` dengan state `{ user, login, logout }`
  - [ ] `useAuth()` custom hook
  - [ ] User shape: `{ id, nama, email, role, avatar_url }` (sesuai api-spec)
  - [ ] Persist ke localStorage (key: `auth_user`)
- [ ] Update `LoginPage.jsx`:
  - [ ] Sementara: ganti tombol Google jadi 3 tombol: "Login as Mahasiswa", "Login as Dosen Wali", "Login as Kaprodi"
  - [ ] Click → `login()` dengan dummy user data sesuai role → redirect ke `/dashboard`

#### 2.2 — Routing
- [ ] `src/app/router.jsx`:
  - [ ] Route `/` → redirect ke `/login` atau `/dashboard` (cek auth)
  - [ ] Route `/login` → `LoginPage`
  - [ ] Route `/dashboard` → `DashboardLayout` (protected)
  - [ ] Sub-routes per role di-handle dynamic (lihat 2.3)
- [ ] Update `App.jsx` pakai `<RouterProvider>`

#### 2.3 — DashboardLayout dengan Sidebar Role-Based
- [ ] `src/shared/layouts/DashboardLayout.jsx`:
  - [ ] AppBar (header) dengan: judul aplikasi, nama user, avatar, menu logout
  - [ ] Drawer (sidebar permanent) dengan menu sesuai role:
    - **Mahasiswa**: Dashboard, Report, Perwalian Saya, Pohon Kurikulum
    - **Dosen Wali**: Dashboard, (jadwal Perwalian)
    - **Kaprodi**: Dashboard, Dosen Wali, Mahasiswa, Periode
  - [ ] Main content area pakai `<Outlet />` dari React Router
- [ ] Logic: `useAuth()` untuk dapetin role → render menu sesuai

#### 2.4 — Empty Pages
- [ ] Bikin placeholder page (cuma `<Typography>Halaman X</Typography>`) untuk:
  - [ ] `MahasiswaDashboard.jsx`
  - [ ] `MahasiswaReport.jsx`
  - [ ] `MahasiswaPerwalian.jsx`
  - [ ] `MahasiswaPohonKurikulum.jsx`
  - [ ] `DosenDashboard.jsx`
  - [ ] `KaprodiDashboard.jsx`
  - [ ] `KaprodiDosenWali.jsx`
  - [ ] `KaprodiMahasiswa.jsx`
  - [ ] `KaprodiPeriode.jsx`

### Deliverable
✅ Login as Mahasiswa → masuk dashboard mahasiswa, sidebar menampilkan menu mahasiswa, klik menu = navigate ke halaman placeholder. Sama untuk dosen & kaprodi.

### Commit message saran
```
feat: add routing & dashboard layout with role-based sidebar (milestone 2)
```

---

## 🎯 Milestone 3: 1 Feature End-to-End — Pohon Kurikulum

**Goal**: Halaman pohon kurikulum mahasiswa fungsional. Render React Flow dengan data dari mock API.

### Tasks

#### 3.1 — Mock Data
- [ ] `src/api/_mock/akademik.js`:
  - [ ] Function `mockGetPohonKurikulum(mahasiswaId)`:
    - [ ] Return shape sesuai `api-spec.md` endpoint `GET /api/v1/akademik/saya/pohon-kurikulum`
    - [ ] Data nodes dari `kurikulum2023Nodes.js` (file user yang udah ada)
    - [ ] Data edges dari `kurikulum2023Edges.js`
    - [ ] Tambah field `match` di beberapa node (simulate ada nilai)
    - [ ] Sleep 300ms simulate network

#### 3.2 — API Service Layer
- [ ] `src/api/akademik.js`:
  - [ ] Import mock function
  - [ ] Export `getPohonKurikulum(mahasiswaId)` yang call mock (untuk sekarang)
  - [ ] Tambah TODO comment: `// TODO: replace with real API`

#### 3.3 — Custom Hook
- [ ] `src/hooks/useFetch.js`:
  - [ ] Generic hook: `useFetch(fetcher, deps)` return `{ data, loading, error }`
  - [ ] Handle cleanup (cancelled flag biar gak setState pas unmount)

#### 3.4 — Halaman Pohon Kurikulum
- [ ] Install React Flow:
  ```bash
  npm install reactflow
  ```
- [ ] `src/features/mahasiswa/pohon-kurikulum/PohonKurikulumPage.jsx`:
  - [ ] Pakai `useFetch` panggil `getPohonKurikulum`
  - [ ] Loading state: `<CircularProgress />`
  - [ ] Error state: `<Alert severity="error">`
  - [ ] Success state: render React Flow dengan nodes & edges dari data
- [ ] `src/features/mahasiswa/pohon-kurikulum/components/MatkulNode.jsx`:
  - [ ] Custom node component
  - [ ] Background warna sesuai `match.status`:
    - `null` (belum ambil) → putih
    - `LULUS` → hijau
    - `TIDAK_LULUS` → merah
  - [ ] Tampil: kode, nama, sks, nilai (kalau ada)
- [ ] Layout positioning pakai field `kolom` & `semester`:
  - [ ] `x = kolom * 200`
  - [ ] `y = (semester - 1) * 150`
- [ ] Edge style berbeda per `relation_type` (boleh sederhana: warna beda aja)

### Deliverable
✅ Login as Mahasiswa → klik menu "Pohon Kurikulum" → lihat pohon dengan node berwarna sesuai status nilai dummy.

### Commit message saran
```
feat: implement pohon kurikulum with react flow (milestone 3)
```

---

## 🎯 Milestone 4: Replicate Pattern ke Feature Lain

**Goal**: Apply pattern dari Milestone 3 ke feature lain. Semua halaman fungsional dengan mock data.

### Tasks (per feature, ulangi pattern Milestone 3)

#### 4.1 — Mahasiswa
- [ ] Dashboard (ringkasan akademik)
- [ ] Report (total SKS, IPK, IPS)
- [ ] Perwalian Saya (list FRS per periode + detail)
- [ ] Tambah/Edit Rencana Studi (pilih kelas, checkout)
- [ ] Upload DPS (form upload PDF — pakai mock parsing)

#### 4.2 — Dosen Wali
- [ ] Dashboard (list mahasiswa bimbingan + status warna)
- [ ] Detail Mahasiswa (Report + Progress + Perwalian — tab)
- [ ] Approve/Revisi Rencana Studi mahasiswa
- [ ] Set Jadwal Perwalian Pribadi

#### 4.3 — Kaprodi
- [ ] Dashboard (set & aktifkan periode)
- [ ] Upload Excel jadwal kelas (preview + confirm)
- [ ] Upload Excel master matkul (preview + confirm)
- [ ] List Dosen Wali (CRUD)
- [ ] Detail Dosen Wali (lihat bimbingan + reassign)
- [ ] List Mahasiswa (CRUD)

### Deliverable
✅ Semua flow di blueprint udah bisa di-demo dengan dummy data.  
✅ Frontend siap untuk integrate ke real backend (tinggal swap mock → fetch).

### Commit message saran
```
feat: complete all feature pages with mock data (milestone 4)
```

---

## 📊 Setelah Milestone 4

**Next Phase**: Backend development.

Beberapa hal yang bakal dikerjakan setelah milestone 4 selesai:
- Setup backend Node.js (Express atau native HTTP)
- Database PostgreSQL setup + migrations
- Implement Phase 1-9 dari `api-spec.md`
- Replace mock di frontend dengan real API call
- Google OAuth integration

---

## 🚦 Status Tracking

| Milestone | Status | Started | Completed |
|---|---|---|---|
| 1. Hello World | ✅ Done | 2026-04-29 | 2026-04-29 |
| 2. Routing & Layout | ⏳ Not started | - | - |
| 3. Pohon Kurikulum | ⏳ Not started | - | - |
| 4. Replicate Pattern | ⏳ Not started | - | - |

> Update kolom Status: `⏳ Not started` → `🚧 In Progress` → `✅ Done`
