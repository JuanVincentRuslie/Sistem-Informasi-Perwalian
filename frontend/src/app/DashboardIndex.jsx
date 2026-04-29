import { useAuth } from '../contexts/AuthContext.jsx';
import DashboardPage from '../features/mahasiswa/dashboard/DashboardPage.jsx';
import DosenDashboardPage from '../features/dosen-wali/dashboard/DosenDashboardPage.jsx';
import KaprodiDashboardPage from '../features/kaprodi/dashboard/KaprodiDashboardPage.jsx';

function DashboardIndex() {
  // useAuth: ambil role user untuk menentukan dashboard mana yang dirender.
  // Setiap role punya tampilan dashboard yang berbeda.
  const { user } = useAuth();

  if (user?.role === 'mahasiswa') return <DashboardPage />;
  if (user?.role === 'dosen_wali') return <DosenDashboardPage />;
  if (user?.role === 'kaprodi') return <KaprodiDashboardPage />;
  return null;
}

export default DashboardIndex;
