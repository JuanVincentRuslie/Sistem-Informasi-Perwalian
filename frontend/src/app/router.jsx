import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage.jsx';
import DashboardLayout from '../shared/layouts/DashboardLayout.jsx';
import DashboardIndex from './DashboardIndex.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

// Mahasiswa
import ReportPage from '../features/mahasiswa/report/ReportPage.jsx';
import PohonKurikulumPage from '../features/mahasiswa/pohon-kurikulum/PohonKurikulumPage.jsx';
import PerwalianPage from '../features/mahasiswa/perwalian/PerwalianPage.jsx';

// Dosen Wali
import JadwalPerwalianPage from '../features/dosen-wali/jadwal-perwalian/JadwalPerwalianPage.jsx';

// Kaprodi
import DosenWaliPage from '../features/kaprodi/dosen-wali/DosenWaliPage.jsx';
import MahasiswaPage from '../features/kaprodi/mahasiswa/MahasiswaPage.jsx';
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
          { path: 'report', element: <ReportPage /> },
          { path: 'pohon-kurikulum', element: <PohonKurikulumPage /> },
          { path: 'perwalian', element: <PerwalianPage /> },

          // Dosen Wali routes
          { path: 'jadwal-perwalian', element: <JadwalPerwalianPage /> },

          // Kaprodi routes
          { path: 'dosen-wali', element: <DosenWaliPage /> },
          { path: 'mahasiswa', element: <MahasiswaPage /> },
          { path: 'periode', element: <PeriodePage /> },
        ],
      },
    ],
  },
]);

export default router;
