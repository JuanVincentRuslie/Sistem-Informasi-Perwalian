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
- [x] `src/contexts/AuthContext.jsx`:
  - [x] `AuthProvider` dengan state `{ user, login, logout }`
  - [x] `useAuth()` custom hook
  - [x] User shape: `{ id, nama, email, role, avatar_url }` (sesuai api-spec)
  - [x] Persist ke localStorage (key: `auth_user`)
- [x] Update `LoginPage.jsx`:
  - [x] Sementara: ganti tombol Google jadi 3 tombol: "Login as Mahasiswa", "Login as Dosen Wali", "Login as Kaprodi"
  - [x] Click → `login()` dengan dummy user data sesuai role → redirect ke `/dashboard` *(redirect deferred ke section 2.2)*

#### 2.2 — Routing
- [x] `src/app/router.jsx`:
  - [x] Route `/` → redirect ke `/login` atau `/dashboard` (cek auth)
  - [x] Route `/login` → `LoginPage`
  - [x] Route `/dashboard` → `DashboardLayout` (protected) *(placeholder dulu, layout di section 2.3)*
  - [ ] Sub-routes per role di-handle dynamic (lihat 2.3)
- [x] Update `App.jsx` pakai `<RouterProvider>`

#### 2.3 — DashboardLayout dengan Sidebar Role-Based
- [x] `src/shared/layouts/DashboardLayout.jsx`:
  - [x] AppBar (header) dengan: judul aplikasi, nama user, avatar, menu logout
  - [x] Drawer (sidebar permanent) dengan menu sesuai role:
    - **Mahasiswa**: Dashboard, Report, Perwalian Saya, Pohon Kurikulum
    - **Dosen Wali**: Dashboard, Jadwal Perwalian
    - **Kaprodi**: Dashboard, Dosen Wali, Mahasiswa, Periode
  - [x] Main content area pakai `<Outlet />` dari React Router
- [x] Logic: `useAuth()` untuk dapetin role → render menu sesuai
- [x] Menu config di `src/shared/layouts/menuConfig.js` (icon import langsung)

#### 2.4 — Empty Pages
- [x] Shared components: `PageContainer.jsx`, `PageHeader.jsx`
- [x] Bikin placeholder page dengan pattern `PageContainer + PageHeader` untuk:
  - [x] `mahasiswa/dashboard/DashboardPage.jsx`
  - [x] `mahasiswa/report/ReportPage.jsx`
  - [x] `mahasiswa/perwalian/PerwalianPage.jsx`
  - [x] `mahasiswa/pohon-kurikulum/PohonKurikulumPage.jsx`
  - [x] `dosen-wali/dashboard/DosenDashboardPage.jsx`
  - [x] `dosen-wali/jadwal-perwalian/JadwalPerwalianPage.jsx`
  - [x] `kaprodi/dashboard/KaprodiDashboardPage.jsx`
  - [x] `kaprodi/dosen-wali/DosenWaliPage.jsx`
  - [x] `kaprodi/mahasiswa/MahasiswaPage.jsx`
  - [x] `kaprodi/periode/PeriodePage.jsx`
- [x] `src/app/DashboardIndex.jsx` — role-based index route switcher
- [x] Router diupdate dengan semua child routes

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
- [x] `src/api/_mock/akademik.js`:
  - [x] Function `mockGetPohonKurikulum(mahasiswaId)`:
    - [x] Return shape sesuai `api-spec.md` endpoint `GET /api/v1/akademik/saya/pohon-kurikulum`
    - [x] Data nodes dari `kurikulum2023Nodes.js` (file user yang udah ada)
    - [x] Data edges dari `kurikulum2023Edges.js`
    - [x] Tambah field `match` di beberapa node (simulate ada nilai)
    - [x] Sleep 300ms simulate network

#### 3.2 — API Service Layer
- [x] `src/api/akademik.js`:
  - [x] Import mock function
  - [x] Export `getPohonKurikulum(mahasiswaId)` yang call mock (untuk sekarang)
  - [x] Tambah TODO comment: `// TODO: replace with real API`

#### 3.3 — Custom Hook
- [x] `src/hooks/useFetch.js`:
  - [x] Generic hook: `useFetch(fetcher, deps)` return `{ data, loading, error, refetch }`
  - [x] Handle cleanup (cancelled flag biar gak setState pas unmount)
  - [x] refetch via trigger counter + useCallback untuk stable reference

#### 3.4 — Install React Flow + MatkulNode Component
- [x] Install React Flow (`reactflow@^11.11.4`)
- [x] `src/features/mahasiswa/pohon-kurikulum/components/MatkulNode.jsx`:
  - [x] Custom node component
  - [x] Background warna sesuai `match.status`:
    - `null` (belum ambil) → putih
    - `LULUS` → hijau
    - `TIDAK_LULUS` → merah
  - [x] Handle source (bottom) + target (top)
  - [x] Tampil kode, nama, SKS, nilai kalau match ada

#### 3.5 — Halaman Pohon Kurikulum (Final Compose)
- [x] `src/features/mahasiswa/pohon-kurikulum/PohonKurikulumPage.jsx`
  - [x] Pakai `useFetch` panggil `getPohonKurikulum`
  - [x] Loading state: `<CircularProgress />`
  - [x] Error state: `<Alert severity="error">`
  - [x] Success state: render React Flow
- [x] Register MatkulNode di nodeTypes (pakai useMemo)
- [x] Layout positioning: x = kolom * 200, y = (semester - 1) * 150
- [x] Edge style berbeda per `relation_type` (4 warna)
- [x] Background pakai React Flow Background component
- [x] Controls (zoom, pan) pakai React Flow Controls component
- [x] Summary: total_sks_lulus, ipk, ips_terakhir
- [x] `reactflow/dist/style.css` di-import di `main.jsx` (global)

### Deliverable
✅ Login as Mahasiswa → klik menu "Pohon Kurikulum" → lihat pohon dengan node berwarna sesuai status nilai dummy.

### Commit message saran
```
feat: implement pohon kurikulum with react flow (milestone 3)
```

---

## 🎯 Milestone 4.A: Mahasiswa Features

**Goal**: Semua halaman mahasiswa fungsional dengan mock data.

### Tasks

#### 4.A.1 — Dashboard
- [ ] Dashboard (ringkasan akademik: SKS, IPK, IPS, periode aktif, jadwal dosen wali)

#### 4.A.2 — Perwalian Saya
- [ ] Perwalian Saya (list FRS per periode + detail)
- [ ] Tambah/Edit Rencana Studi (pilih kelas, checkout)

#### 4.A.3 — Pohon Kurikulum (Extended)
- [ ] Tab Upload DPS dalam Pohon Kurikulum (upload PDF + preview + confirm flow)

### Deliverable
✅ Semua halaman mahasiswa sudah bisa di-demo dengan dummy data.

### Commit message saran
```
feat: complete mahasiswa feature pages (milestone 4.A)
```

---

## 🎯 Milestone 4.B: Dosen Wali Features

**Goal**: Semua halaman dosen wali fungsional dengan mock data.

### Tasks

#### 4.B.1 — Dashboard
- [ ] Dashboard (list mahasiswa bimbingan + status warna)

#### 4.B.2 — Detail Mahasiswa
- [ ] Detail Mahasiswa (Report + Progress + Perwalian — tab)
- [ ] Approve/Revisi Rencana Studi mahasiswa

#### 4.B.3 — Jadwal Perwalian
- [ ] Set Jadwal Perwalian Pribadi

### Deliverable
✅ Semua halaman dosen wali sudah bisa di-demo dengan dummy data.

### Commit message saran
```
feat: complete dosen wali feature pages (milestone 4.B)
```

---

## 🎯 Milestone 4.C: Kaprodi Features

**Goal**: Semua halaman kaprodi fungsional dengan mock data.

### Tasks

#### 4.C.1 — Dashboard Kaprodi
- [ ] Dashboard Kaprodi (overview: jumlah dosen aktif, mahasiswa, status periode)

#### 4.C.2 — Periode
- [ ] Periode (CRUD: tambah, edit, aktifkan/nonaktifkan)
- [ ] Upload Excel jadwal kelas (preview + confirm) — dalam halaman Periode
- [ ] Upload Excel master matkul (preview + confirm) — dalam halaman Periode

#### 4.C.3 — Dosen Wali
- [ ] List Dosen Wali (CRUD)
- [ ] Detail Dosen Wali (lihat bimbingan + reassign)

#### 4.C.4 — Mahasiswa
- [ ] List Mahasiswa (CRUD)

### Deliverable
✅ Semua halaman kaprodi sudah bisa di-demo dengan dummy data.  
✅ Frontend siap untuk integrate ke real backend (tinggal swap mock → fetch).

### Commit message saran
```
feat: complete kaprodi feature pages (milestone 4.C)
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
| 2. Routing & Layout | ✅ Done | 2026-04-29 | 2026-04-29 |
| 3. Pohon Kurikulum | ✅ Done | 2026-04-29 | 2026-04-29 |
| 4.A. Mahasiswa Features | ⏳ Not started | - | - |
| 4.B. Dosen Wali Features | ⏳ Not started | - | - |
| 4.C. Kaprodi Features | ⏳ Not started | - | - |

> Update kolom Status: `⏳ Not started` → `🚧 In Progress` → `✅ Done`
