import Typography from '@mui/material/Typography';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';

function KaprodiDashboardPage() {
  // useAuth: ambil data user dari context global.
  // Component ini re-render otomatis kalau user berubah (misal setelah logout).
  const { user } = useAuth();

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard Kaprodi"
        subtitle={`Halo, ${user?.nama}`}
      />
      <Typography color="text.secondary">
        Konten dashboard kaprodi akan diisi di milestone 4.
      </Typography>
    </PageContainer>
  );
}

export default KaprodiDashboardPage;
