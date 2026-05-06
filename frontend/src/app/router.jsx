import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage.jsx';
import AuthCallbackPage from '../features/auth/AuthCallbackPage.jsx';
import DashboardLayout from '../shared/layouts/DashboardLayout.jsx';
import DashboardIndex from './DashboardIndex.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

// Mahasiswa
import PohonKurikulumPage from '../features/mahasiswa/pohon-kurikulum/PohonKurikulumPage.jsx';
import PerwalianPage from '../features/mahasiswa/perwalian/PerwalianPage.jsx';
import TambahMatkulPage from '../features/mahasiswa/perwalian/TambahMatkulPage.jsx';
import JadwalPage from '../features/mahasiswa/perwalian/JadwalPage.jsx';

// Dosen Wali
import DetailMahasiswaPage from '../features/dosen-wali/detail-mahasiswa/DetailMahasiswaPage.jsx';
import JadwalPerwalianPage from '../features/dosen-wali/jadwal-perwalian/JadwalPerwalianPage.jsx';

// Kaprodi
import DosenWaliPage from '../features/kaprodi/dosen-wali/DosenWaliPage.jsx';
import DosenWaliDetailPage from '../features/kaprodi/dosen-wali/DosenWaliDetailPage.jsx';
import DosenWaliAssignPage from '../features/kaprodi/dosen-wali/DosenWaliAssignPage.jsx';
import MahasiswaPage from '../features/kaprodi/mahasiswa/MahasiswaPage.jsx';
import KaprodiMahasiswaDetailPage from '../features/kaprodi/mahasiswa/KaprodiMahasiswaDetailPage.jsx';
import PeriodePage from '../features/kaprodi/periode/PeriodePage.jsx';

function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          // index: dirender di <Outlet /> saat path persis "/dashboard"
          { index: true, element: <DashboardIndex /> },

          // Mahasiswa routes
          { path: 'pohon-kurikulum', element: <PohonKurikulumPage /> },
          { path: 'perwalian', element: <PerwalianPage /> },
          { path: 'perwalian/tambah', element: <TambahMatkulPage /> },
          { path: 'perwalian/jadwal', element: <JadwalPage /> },

          // Dosen Wali routes
          { path: 'mahasiswa-bimbingan/:mahasiswaId', element: <DetailMahasiswaPage /> },
          { path: 'jadwal-perwalian', element: <JadwalPerwalianPage /> },

          // Kaprodi routes
          { path: 'dosen-wali', element: <DosenWaliPage /> },
          { path: 'dosen-wali/:dosenWaliId', element: <DosenWaliDetailPage /> },
          { path: 'dosen-wali/:dosenWaliId/assign', element: <DosenWaliAssignPage /> },
          { path: 'mahasiswa', element: <MahasiswaPage /> },
          { path: 'mahasiswa/:mahasiswaId', element: <KaprodiMahasiswaDetailPage /> },
          { path: 'periode', element: <PeriodePage /> },
        ],
      },
    ],
  },
]);

export default router;
