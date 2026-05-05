# Sistem Informasi Perwalian — Project Guide

> File ini WAJIB dibaca Codex di awal setiap session.

## 📌 Project Overview

Skripsi project: Sistem Informasi Perwalian Mahasiswa.  
3 aktor: **Mahasiswa**, **Dosen Wali**, **Kaprodi**.

**Current Phase**: Frontend-first development dengan dummy data (mock).  
Backend belum dibuild — akan dikerjakan SETELAH frontend stabil.

---

## 📚 Required Reading (READ THESE FIRST!)

Sebelum mulai task apapun, baca dokumen ini di folder `docs/`:

1. **`docs/blueprint-sistem-perwalian.md`** — keputusan high-level, flow per aktor, state machine FRS
2. **`docs/erd-sistem-perwalian.md`** — data model (untuk shape mock data)
3. **`docs/api-spec-sistem-perwalian.md`** — REST contract (untuk shape response mock)
4. **`docs/MILESTONES.md`** — task tracker, fase development

Kalau dokumen tersebut bertentangan dengan instruksi user, **tanya dulu**, jangan asumsikan.

---

## 🛠️ Tech Stack

| Layer | Tech | Catatan |
|---|---|---|
| Build tool | Vite | |
| Framework | React 18 | functional component + hooks |
| Language | **JavaScript** (no TypeScript) | |
| UI Library | **Material UI (MUI v5)** | sudah final, tidak ganti |
| Routing | React Router v6 | |
| State - Server | `useState + useEffect` (manual) | + custom hook `useFetch` |
| State - Auth | React Context | |
| Forms | controlled component (basic) | jangan install Formik/RHF dulu |
| HTTP | Native fetch | |
| Pohon kurikulum | React Flow | |

❌ **JANGAN install** tanpa konfirmasi user:
- TypeScript
- Tailwind / shadcn / styled-components (sudah pake MUI)
- Redux / Zustand / Jotai
- React Query / SWR
- Formik / React Hook Form

---

## 📂 Folder Structure

```
src/
├── app/                  # App-level config
│   ├── App.jsx
│   ├── router.jsx
│   └── theme.js          # MUI theme
│
├── api/                  # API client + mock layer
│   ├── client.js
│   ├── auth.js
│   ├── akademik.js
│   ├── rencanaStudi.js
│   └── _mock/
│       ├── auth.js
│       ├── akademik.js
│       └── rencanaStudi.js
│
├── hooks/
│   └── useFetch.js
│
├── contexts/
│   └── AuthContext.jsx
│
├── shared/               # reusable across features
│   ├── components/       # shared UI components (lihat aturan di bawah)
│   └── layouts/
│
├── features/             # per-feature pages
│   ├── auth/
│   ├── mahasiswa/
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   └── components/   # sub-components khusus dashboard
│   │   └── perwalian/
│   │       ├── PerwalianPage.jsx
│   │       └── components/
│   ├── dosen-wali/
│   └── kaprodi/
│
├── utils/
├── main.jsx
└── index.css
```

---

## 🎨 Component-Based Design Rules (PENTING UNTUK SKRIPSI!)

Salah satu **nilai jual utama React** adalah component composition. Karena ini skripsi, penguji akan tanya "kenapa React?" — jawaban kuat: **reusability + maintainability lewat komponen**.

### Rule 1 — Atomic Design Mindset

Pikirkan komponen dalam 3 level:

| Level | Lokasi | Contoh | Sifat |
|---|---|---|---|
| **Atoms** | `shared/components/atoms/` | Button (custom), StatusChip, Loading, EmptyState | Reusable di seluruh app, tidak tau context bisnis |
| **Molecules** | `shared/components/molecules/` | MetricCard, SearchBar, MahasiswaListItem | Gabungan atoms, masih reusable |
| **Page-specific components** | `features/.../components/` | RencanaStudiCard, PohonKurikulumNode | Hanya dipakai di feature itu |

> Untuk MVP awal, **Atoms** dan **Molecules** boleh ditaruh sama di `shared/components/` saja. Pisahin atomic level kalau folder mulai padat (>15 file).

### Rule 2 — Page = Composition, BUKAN Implementation

Halaman (file `*Page.jsx`) HARUS jadi **orchestrator komponen kecil**, bukan tempat semua logic & JSX ditumpuk.

❌ **JANGAN** seperti ini:
```jsx
// DashboardPage.jsx — 500 baris semua di sini
function DashboardPage() {
  return (
    <div>
      <div style={{...}}>... 100 baris header ...</div>
      <div style={{...}}>... 150 baris stat cards ...</div>
      <div style={{...}}>... 200 baris list mahasiswa ...</div>
    </div>
  );
}
```

✅ **HARUS** seperti ini:
```jsx
// DashboardPage.jsx — 30-50 baris, tinggal compose
function DashboardPage() {
  const { user } = useAuth();
  const { data, loading } = useFetch(() => getDashboardData(), []);
  
  if (loading) return <Loading />;
  
  return (
    <PageContainer>
      <PageHeader title="Dashboard" subtitle={`Halo, ${user.nama}`} />
      <StatCardGrid stats={data.stats} />
      <MahasiswaList items={data.mahasiswa} />
    </PageContainer>
  );
}
```

### Rule 3 — Component File Size Limits

| File type | Max baris | Action kalau lewat |
|---|---|---|
| Page (`*Page.jsx`) | 100 | Ekstrak section ke sub-component di `components/` |
| Sub-component | 200 | Pecah lagi atau evaluasi apa terlalu banyak responsibility |
| Atom/Molecule | 100 | Single-responsibility, harusnya pendek |

Kalau Codex generate page > 100 baris, **proaktif suruh refactor jadi sub-components**.

### Rule 4 — Naming yang Jelas

Komponen nama harus **deskriptif & spesifik**:

❌ Generic: `Card`, `List`, `Item`, `Container`, `Wrapper`  
✅ Spesifik: `MetricCard`, `MahasiswaListItem`, `RencanaStudiCard`, `PageContainer`

Generic name boleh **hanya untuk atoms paling dasar** (Button, Input). Sisanya wajib deskriptif.

### Rule 5 — Props yang Sehat

- Props maksimal **5-7**. Lebih dari itu = signal komponen perlu dipecah atau pakai `props spreading object`.
- **JANGAN** pass `style` props kalau bisa di-control via variant: `variant="primary"` lebih baik daripada `style={{color: 'red'}}`.
- Komentar JSDoc untuk komponen yang dipake banyak tempat:
  ```jsx
  /**
   * Card untuk display 1 metric (angka + label)
   * @param {string} label - Label di atas angka
   * @param {string|number} value - Angka utama
   * @param {string} [icon] - Optional icon name
   */
  function MetricCard({ label, value, icon }) { ... }
  ```

### Rule 6 — Reusability Check

Sebelum bikin komponen baru, **cek dulu** apakah:
1. Ada komponen mirip di `shared/components/`? → reuse / extend
2. Komponen ini bakal dipake > 1 tempat? → letakkan di `shared/components/`
3. Cuma untuk 1 page? → letakkan di `features/.../components/`

### Rule 7 — Komentar Edukatif untuk Hooks

User adalah pemula React Hooks. Setiap penggunaan hook **harus ada komentar 1-2 baris** yang menjelaskan WHY (bukan WHAT).

✅ Komentar bagus:
```jsx
// useState: simpan list mahasiswa yang udah di-filter. Re-render saat filter berubah.
const [filtered, setFiltered] = useState([]);

// useEffect dengan [searchQuery]: jalanin filter tiap kali user ngetik. Empty [] = sekali.
useEffect(() => { ... }, [searchQuery]);
```

❌ Komentar trivial:
```jsx
// set state
const [filtered, setFiltered] = useState([]);
```

---

## 🚨 Aturan Main (NON-NEGOTIABLE)

### 1. No fetch in components
Component HARUS panggil function dari `api/` atau hook dari `hooks/`.  
**JANGAN** ada `fetch()` langsung di component.

```jsx
// ❌ JANGAN
function MyPage() {
  useEffect(() => {
    fetch('/api/...').then(...);
  }, []);
}

// ✅ BENAR
function MyPage() {
  const { data, loading, error } = useFetch(() => api.getRencanaStudi(), []);
}
```

### 2. Mock data MUST match api-spec
Response shape di `api/_mock/*.js` HARUS persis sesuai `docs/api-spec-sistem-perwalian.md`.  
Wrapping `{success, data, message}` wajib.

```javascript
// ✅ BENAR — sesuai api-spec
export const mockGetRencanaStudi = async () => {
  await sleep(300);
  return {
    success: true,
    data: { id: 25, status: "SUBMITTED", ... },
    message: "OK"
  };
};
```

### 3. Naming convention
- Folder/file: `kebab-case` (kecuali React component file = `PascalCase.jsx`)
- Variable/function: `camelCase`
- Constant: `UPPER_SNAKE_CASE`
- Domain term: **bahasa Indonesia** (mahasiswa, dosen-wali, rencana-studi)
- Technical term: **bahasa Inggris** (api, hooks, utils)

### 4. Tidak ada premature abstraction
JANGAN bikin "generic component library" sebelum ada 3+ use case yang sama.  
Duplikasi kecil di awal LEBIH BAIK daripada abstraction yang salah.

**Cara aplikasi rule ini**:
- Bikin halaman dulu, lihat duplikasi yang muncul, baru ekstrak.
- Kalau sebuah komponen udah dipake 3+ tempat → ekstrak ke `shared/components/`.

---

## 🎯 Current Milestone Tracker

Lihat `docs/MILESTONES.md` untuk detail task per milestone.

---

## 💡 Tips untuk Codex

1. **Selalu konfirmasi task scope** sebelum mulai. Jangan langsung generate banyak file.
2. **Tanya kalau ada ambiguity** dengan dokumen di `docs/`. Lebih baik tanya daripada salah asumsi.
3. **Update `docs/MILESTONES.md`** setiap kali selesai sub-task.
4. **Jangan refactor file yang gak diminta**. Stay in scope.
5. **Run aplikasi setelah setiap perubahan signifikan** (`npm run dev`).
6. **Component-based design** — selalu pikirkan: "ini bisa dipecah jadi sub-component?". Page > 100 baris = signal pecah.
7. **Komentar edukatif untuk hooks** — user pemula, jelaskan WHY (bukan WHAT) di setiap hook usage.

---

## 🔗 Konteks tambahan

- User adalah mahasiswa skripsi yang **pemula React Hooks**. Kasih komentar edukatif di code.
- Project ini sebelumnya pernah dibikin tapi "kacau" karena scope creep.
- Component-based architecture adalah **value proposition utama** di skripsi — penguji akan tanya kenapa React, jawaban: reusability + composition.
- Refactor gagal karena scope terlalu besar sekaligus → **prioritaskan small wins**.
