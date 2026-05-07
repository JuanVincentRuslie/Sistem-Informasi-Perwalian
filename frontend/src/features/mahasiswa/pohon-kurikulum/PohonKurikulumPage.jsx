import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageErrorState from '../../../shared/components/PageErrorState.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import useFetch from '../../../hooks/useFetch.js';
import { getPohonKurikulum } from '../../../api/akademik.js';
import DpsUploadPanel from './components/DpsUploadPanel.jsx';
import PohonKurikulumFlow from './components/PohonKurikulumFlow.jsx';

function PohonKurikulumPage() {
  // useContext via custom hook: dapet user yang lagi login (butuh user.id untuk fetch)
  const { user } = useAuth();

  // useState [activeTab]: simpan tab aktif supaya user bisa pindah antara
  // visualisasi pohon dan upload DPS tanpa pindah route.
  const [activeTab, setActiveTab] = useState(0);

  // custom hook kita sendiri: handle fetch state otomatis (loading/error/data)
  // fetcher di-wrap lambda supaya getPohonKurikulum dipanggil ulang saat user.id berubah.
  const { data, loading, error, refetch } = useFetch(
    () => getPohonKurikulum(user.id),
    [user.id],
  );

  function handleTabChange(_event, nextTab) {
    setActiveTab(nextTab);
  }

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
        subtitle="Visualisasi mata kuliah, prasyarat, dan upload DPS"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Tab pohon kurikulum">
          <Tab label="Pohon Kurikulum" />
          <Tab label="Upload DPS" />
        </Tabs>
      </Box>

      {!hasDpsData && activeTab === 0 && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={(
            <Button color="inherit" size="small" onClick={() => setActiveTab(1)}>
              Upload DPS
            </Button>
          )}
        >
          Data riwayat nilai belum tersedia. Upload DPS agar IPK, IPS, dan warna progres mata kuliah muncul.
        </Alert>
      )}

      {activeTab === 0 ? <PohonKurikulumFlow data={data} /> : null}
      {activeTab === 1 ? <DpsUploadPanel onConfirmed={refetch} /> : null}
    </PageContainer>
  );
}

export default PohonKurikulumPage;
