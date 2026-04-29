import Typography from '@mui/material/Typography';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';

function PerwalianPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Perwalian Saya"
        subtitle="Daftar rencana studi per periode perwalian"
      />
      <Typography color="text.secondary">
        Konten perwalian akan diisi di milestone 4.
      </Typography>
    </PageContainer>
  );
}

export default PerwalianPage;
