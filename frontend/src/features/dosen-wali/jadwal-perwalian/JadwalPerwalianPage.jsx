import Typography from '@mui/material/Typography';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import PageHeader from '../../../shared/components/PageHeader.jsx';

function JadwalPerwalianPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Jadwal Perwalian"
        subtitle="Atur jadwal perwalian kamu dengan mahasiswa bimbingan"
      />
      <Typography color="text.secondary">
        Konten jadwal perwalian akan diisi di milestone 4.
      </Typography>
    </PageContainer>
  );
}

export default JadwalPerwalianPage;
