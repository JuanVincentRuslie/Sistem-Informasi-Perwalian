import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function getTagLabel(tag) {
  if (tag === 'pilihan') return 'Pilihan';
  if (tag === 'wajib') return 'Wajib';
  return tag;
}

function DosenRencanaStudiMatkulList({ items }) {
  return (
    <Box>
      <Typography fontWeight="bold" sx={{ mb: 1 }}>
        Mata Kuliah :
      </Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Belum ada mata kuliah di FRS ini.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {items.map((item) => (
              <Box
                key={item.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography fontWeight="bold">{item.kelas.nama_matkul}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                    <Chip label={item.kelas.kode_matkul} size="small" />
                    <Chip label={`Kelas ${item.kelas.nama_kelas}`} size="small" variant="outlined" />
                    {(item.tags ?? []).map((tag) => (
                      <Chip key={tag} label={getTagLabel(tag)} size="small" variant="outlined" />
                    ))}
                    {item.is_mengulang && <Chip label="Mengulang" size="small" color="warning" />}
                  </Stack>
                </Box>
                <Typography fontWeight="bold" sx={{ flexShrink: 0 }}>
                  SKS : {item.kelas.sks}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

export default DosenRencanaStudiMatkulList;
