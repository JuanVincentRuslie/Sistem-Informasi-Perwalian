import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { Link as RouterLink } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageErrorState from '../../../shared/components/PageErrorState.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import useFetch from '../../../hooks/useFetch.js';
import { getPohonKurikulum } from '../../../api/akademik.js';
import PohonKurikulumFlow from './components/PohonKurikulumFlow.jsx';

function PohonKurikulumPage() {
  // useContext via custom hook: dapet user yang lagi login (butuh user.id untuk fetch)
  const { user } = useAuth();

  // custom hook kita sendiri: handle fetch state otomatis (loading/error/data)
  // fetcher di-wrap lambda supaya getPohonKurikulum dipanggil ulang saat user.id berubah.
  const { data, loading, error, refetch } = useFetch(
    () => getPohonKurikulum(user.id),
    [user.id],
  );

  const summary = data?.summary ?? {};
  const hasDpsData = summary.ipk != null
    || summary.ips_terakhir != null
    || Number(summary.total_sks_lulus ?? 0) > 0;

  if (loading && !data) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer>
        <PageErrorState message={error.message} onRetry={refetch} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Pohon Kurikulum"
        subtitle="Visualisasi mata kuliah dan prasyarat"
      />

      {!hasDpsData && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={(
            <Button component={RouterLink} to="/dashboard" color="inherit" size="small">
              Ke Dashboard
            </Button>
          )}
        >
          Data riwayat nilai belum tersedia. Upload DPS di Dashboard agar IPK, IPS, dan warna progres mata kuliah muncul.
        </Alert>
      )}

      <PohonKurikulumFlow data={data} />
    </PageContainer>
  );
}

export default PohonKurikulumPage;
