import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
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

function RencanaStudiItems({
  items,
  editable,
  removingItemId,
  onRemoveItem,
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
        Daftar Kelas
      </Typography>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Belum ada kelas di FRS ini.
        </Typography>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={2}>
          {items.map((item) => (
            <Box key={item.id}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <Typography variant="subtitle1" component="p" fontWeight={700}>
                      {item.kelas.kode_matkul}
                    </Typography>
                    <Chip label={`${item.kelas.sks} SKS`} size="small" />
                    <Chip label={`Kelas ${item.kelas.nama_kelas}`} size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.kelas.nama_matkul}
                  </Typography>
                </Box>

                {editable && (
                  <Tooltip title="Hapus kelas dari FRS">
                    <span>
                      <IconButton
                        color="error"
                        disabled={removingItemId === item.id}
                        onClick={() => onRemoveItem(item.id)}
                        aria-label={`Hapus ${item.kelas.nama_matkul}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Stack>

              <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                {item.kelas.sesi.map((sesi) => (
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
          ))}
        </Stack>
      )}
    </Paper>
  );
}

export default RencanaStudiItems;
