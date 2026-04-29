import Typography from '@mui/material/Typography';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';

function PeriodePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Manajemen Periode"
        subtitle="Kelola periode perwalian aktif"
      />
      <Typography color="text.secondary">
        Konten manajemen periode akan diisi di milestone 4.
      </Typography>
    </PageContainer>
  );
}

export default PeriodePage;
