# Sistem Informasi Perwalian — Project Guide

> File ini WAJIB dibaca Claude Code di awal setiap session.

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
│   ├── client.js         # base config (placeholder, kosong dulu)
│   ├── auth.js
│   ├── akademik.js
│   ├── rencanaStudi.js
│   └── _mock/            # mock data per domain
│       ├── auth.js
│       ├── akademik.js
│       └── rencanaStudi.js
│
├── hooks/
│   └── useFetch.js       # generic hook untuk handle fetch state
│
├── contexts/
│   └── AuthContext.jsx   # current user + role
│
├── shared/               # reusable across features
│   ├── components/
│   └── layouts/
│
├── features/             # per-feature pages
│   ├── auth/
│   ├── mahasiswa/
│   ├── dosen-wali/
│   └── kaprodi/
│
├── utils/
├── main.jsx
└── index.css
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

### 4. Component size limit
Component file > 200 baris = signal untuk pecah jadi sub-components.  
Pecah ke folder `components/` di feature yang sama.

### 5. Tidak ada premature abstraction
JANGAN bikin "generic component library" sebelum ada 3+ use case yang sama.  
Duplikasi kecil di awal LEBIH BAIK daripada abstraction yang salah.

---

## 🎯 Current Milestone Tracker

Lihat `docs/MILESTONES.md` untuk detail task per milestone.

**Aktif sekarang**: Milestone 1 — Setup foundation

---

## 💡 Tips untuk Claude Code

1. **Selalu konfirmasi task scope** sebelum mulai. Jangan langsung generate banyak file.
2. **Tanya kalau ada ambiguity** dengan dokumen di `docs/`. Lebih baik tanya daripada salah asumsi.
3. **Update `docs/MILESTONES.md`** setiap kali selesai sub-task — checkbox `[ ]` jadi `[x]`.
4. **Jangan refactor file yang gak diminta**. Stay in scope.
5. **Run aplikasi setelah setiap perubahan signifikan** untuk verify gak breaking. Pakai `npm run dev`.

---

## 🔗 Konteks tambahan dari user

- User adalah mahasiswa skripsi. Kasih penjelasan yang clear, jangan asumsikan dia tahu pattern advanced.
- Project ini sebelumnya pernah dibikin tapi "kacau" karena scope creep — itulah kenapa sekarang ada CLAUDE.md & MILESTONES.md.
- Refactor gagal karena scope terlalu besar sekaligus → **prioritaskan small wins** dan jalan dulu, baru rapi.
