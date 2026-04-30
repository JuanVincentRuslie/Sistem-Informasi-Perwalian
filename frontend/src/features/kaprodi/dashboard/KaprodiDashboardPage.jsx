import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import { getKaprodiDashboard } from '../../../api/kaprodi.js';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import useFetch from '../../../hooks/useFetch.js';
import KaprodiPeriodeCard from './components/KaprodiPeriodeCard.jsx';
import KaprodiQuickActions from './components/KaprodiQuickActions.jsx';
import KaprodiSummaryCards from './components/KaprodiSummaryCards.jsx';

function KaprodiDashboardPage() {
  // useAuth: ambil data user dari context global.
  // Component ini re-render otomatis kalau user berubah (misal setelah logout).
  const { user } = useAuth();

  // useFetch: dashboard kaprodi ambil ringkasan dari service layer.
  // Ini menjaga page tetap tipis dan mudah diganti ke backend asli nanti.
  const { data, loading, error } = useFetch(() => getKaprodiDashboard(), []);

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">{error.message}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard Kaprodi"
        subtitle={`Halo, ${user?.nama}`}
      />

      <Box sx={{ display: 'grid', gap: 3 }}>
        <KaprodiSummaryCards summary={data?.summary} />
        <KaprodiPeriodeCard
          periodeAktif={data?.periode_aktif ?? null}
          overview={data?.overview ?? null}
        />
        <KaprodiQuickActions />
      </Box>
    </PageContainer>
  );
}

export default KaprodiDashboardPage;
