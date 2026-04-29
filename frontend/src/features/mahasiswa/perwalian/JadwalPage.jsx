import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import PageContainer from '../../../shared/components/PageContainer.jsx';
import JadwalFrsList from './components/JadwalFrsList.jsx';

function JadwalPage() {
  // useLocation: ambil data frs yang diteruskan dari PerwalianPage via navigate state.
  // Dipakai supaya tidak perlu fetch ulang data yang sudah ada di page sebelumnya.
  const { state } = useLocation();
  const navigate = useNavigate();
  const { frs } = state ?? {};

  if (!frs) {
    return (
      <PageContainer>
        <Alert severity="error">Data jadwal tidak tersedia.</Alert>
        <Box sx={{ mt: 2 }}>
          <Button onClick={() => navigate('/dashboard/perwalian')}>Kembali</Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Jadwal Semester {frs.periode.nama}
      </Typography>
      <JadwalFrsList items={frs.items} />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={() => navigate('/dashboard/perwalian')}>
          Kembali
        </Button>
      </Box>
    </PageContainer>
  );
}

export default JadwalPage;
