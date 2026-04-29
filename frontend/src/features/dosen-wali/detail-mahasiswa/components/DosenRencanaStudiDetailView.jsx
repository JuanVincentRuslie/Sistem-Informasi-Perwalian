import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FrsStatusBar from '../../../mahasiswa/perwalian/components/FrsStatusBar.jsx';
import JadwalFrsList from '../../../mahasiswa/perwalian/components/JadwalFrsList.jsx';
import TotalSksCard from '../../../mahasiswa/perwalian/components/TotalSksCard.jsx';
import DosenRencanaStudiMatkulList from './DosenRencanaStudiMatkulList.jsx';
import DosenRencanaStudiReviewPanel from './DosenRencanaStudiReviewPanel.jsx';

function DosenRencanaStudiDetailView({ rencanaStudi, onReview }) {
  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h5" component="h2">
          Rencana FRS Semester {rencanaStudi.periode.nama}
        </Typography>
        <TotalSksCard totalSks={rencanaStudi.total_sks} />
      </Box>

      {rencanaStudi.catatan_dosen && (
        <Alert severity={rencanaStudi.status === 'REJECTED' ? 'warning' : 'info'}>
          {rencanaStudi.catatan_dosen}
        </Alert>
      )}

      <DosenRencanaStudiMatkulList items={rencanaStudi.items} />
      <JadwalFrsList items={rencanaStudi.items} />
      <FrsStatusBar status={rencanaStudi.status} />
      <DosenRencanaStudiReviewPanel rencanaStudi={rencanaStudi} onReview={onReview} />
    </Stack>
  );
}

export default DosenRencanaStudiDetailView;
