import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { getPohonKurikulum } from '../../../../api/akademik.js';
import useFetch from '../../../../hooks/useFetch.js';
import PohonKurikulumFlow from '../../../mahasiswa/pohon-kurikulum/components/PohonKurikulumFlow.jsx';

function DetailMahasiswaPohonTab({ mahasiswa }) {
  // useFetch: dosen melihat pohon kurikulum mahasiswa terpilih lewat service akademik.
  // Kalau backend nanti sudah ada, service ini tinggal diarahkan ke endpoint dosen.
  const { data, loading, error } = useFetch(
    () => getPohonKurikulum(mahasiswa.id),
    [mahasiswa.id],
  );

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !data) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h6" component="h2" sx={{ mb: 2, textAlign: 'center' }}>
        {mahasiswa.nama} - {mahasiswa.nim}
      </Typography>
      <PohonKurikulumFlow data={data} />
    </Box>
  );
}

export default DetailMahasiswaPohonTab;
