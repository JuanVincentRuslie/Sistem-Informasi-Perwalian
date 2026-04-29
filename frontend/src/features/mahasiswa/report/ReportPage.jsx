import Typography from '@mui/material/Typography';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';

function ReportPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Report Akademik"
        subtitle="Ringkasan total SKS, IPK, dan IPS kamu"
      />
      <Typography color="text.secondary">
        Konten report akademik akan diisi di milestone 4.
      </Typography>
    </PageContainer>
  );
}

export default ReportPage;
