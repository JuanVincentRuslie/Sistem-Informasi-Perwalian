import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageErrorState from '../../../shared/components/PageErrorState.jsx';
import useFetch from '../../../hooks/useFetch.js';
import { getRingkasanAkademik } from '../../../api/akademik.js';
import DpsUploadPanel from './components/DpsUploadPanel.jsx';
import IpkCard from './components/IpkCard.jsx';
import PeriodePerwalianCard from './components/PeriodePerwalianCard.jsx';
import SksMetricRow from './components/SksMetricRow.jsx';

function DashboardPage() {
  // useFetch: panggil getRingkasanAkademik sekali saat komponen mount.
  // [] sebagai deps = tidak re-fetch kecuali component unmount+remount.
  // useFetch otomatis unwrap response.data, jadi `data` langsung berisi payload-nya.
  const { data, loading, error, refetch } = useFetch(() => getRingkasanAkademik(), []);

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
      <SksMetricRow
        totalLulus={data.total_sks_lulus}
        totalWajib={data.total_sks_wajib_lulus}
        totalPilihan={data.total_sks_pilihan_lulus}
      />
      <IpkCard ipk={data.ipk} />
      <PeriodePerwalianCard
        periodeAktif={data.periode_aktif}
        dosenWali={data.dosen_wali}
      />
      {/* Panel upload DPS: setelah confirm, refetch ringkasan supaya IPK & SKS langsung ter-update. */}
      <DpsUploadPanel onConfirmed={refetch} />
    </PageContainer>
  );
}

export default DashboardPage;
