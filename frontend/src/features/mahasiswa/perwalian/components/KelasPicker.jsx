import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const HARI_LABEL = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
  minggu: 'Minggu',
};

function formatSesi(sesi) {
  const hari = HARI_LABEL[sesi.hari] ?? sesi.hari;
  return `${hari}, ${sesi.jam_mulai}-${sesi.jam_selesai}`;
}

function KelasPicker({
  kelas,
  selectedKelasIds,
  loading,
  error,
  addingKelasId,
  onAddKelas,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" component="h3" gutterBottom>
        Tambah Kelas
      </Typography>

      {loading && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            Memuat kelas yang ditawarkan...
          </Typography>
        </Stack>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      {!loading && !error && kelas.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Belum ada kelas yang ditawarkan pada periode ini.
        </Typography>
      )}

      {!loading && !error && kelas.length > 0 && (
        <Stack divider={<Divider flexItem />} spacing={2}>
          {kelas.map((item) => {
            const alreadySelected = selectedKelasIds.includes(item.id);
            const adding = addingKelasId === item.id;

            return (
              <Box key={item.id}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
                >
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      <Typography variant="subtitle1" component="p" fontWeight={700}>
                        {item.kode_matkul}
                      </Typography>
                      <Chip label={`${item.sks} SKS`} size="small" />
                      <Chip label={`Kelas ${item.nama_kelas}`} size="small" variant="outlined" />
                      <Chip label={item.tipe} size="small" color="primary" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {item.nama_matkul}
                    </Typography>
                  </Box>

                  <Button
                    variant={alreadySelected ? 'outlined' : 'contained'}
                    size="small"
                    startIcon={<AddIcon fontSize="small" />}
                    disabled={alreadySelected || adding}
                    onClick={() => onAddKelas(item.id)}
                  >
                    {alreadySelected ? 'Sudah Dipilih' : adding ? 'Menambah...' : 'Tambah'}
                  </Button>
                </Stack>

                <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                  {item.sesi.map((sesi) => (
                    <Box key={sesi.id}>
                      <Typography variant="body2">
                        {formatSesi(sesi)} - {sesi.bentuk_pembelajaran}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sesi.dosen_utama} | {sesi.ruangan}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

export default KelasPicker;
