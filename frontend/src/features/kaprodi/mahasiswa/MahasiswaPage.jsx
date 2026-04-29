import Typography from '@mui/material/Typography';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';

function MahasiswaPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Manajemen Mahasiswa"
        subtitle="Kelola data mahasiswa yang terdaftar"
      />
      <Typography color="text.secondary">
        Konten manajemen mahasiswa akan diisi di milestone 4.
      </Typography>
    </PageContainer>
  );
}

export default MahasiswaPage;
