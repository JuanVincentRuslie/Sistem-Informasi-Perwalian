import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';

function KaprodiDosenWaliDirectoryList({ items, onSelect }) {
  if (items.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Tidak ada dosen wali yang cocok dengan pencarian.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2}>
      {items.map((item) => (
        <ButtonBase
          key={item.id}
          onClick={() => onSelect(item)}
          sx={{
            width: '100%',
            textAlign: 'left',
            borderRadius: 2,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              width: '100%',
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              transition: 'border-color 120ms ease, box-shadow 120ms ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: 1,
              },
            }}
          >
            <Stack spacing={1} sx={{ minWidth: 0 }}>
              <Typography variant="h6" component="p">
                {item.nama}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.nip}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={`${item.total_mahasiswa} mahasiswa`} />
                <Chip size="small" color="warning" variant="outlined" label={`${item.total_menunggu_review} perlu perhatian`} />
                <Chip size="small" color="success" variant="outlined" label={`${item.total_disetujui} disetujui`} />
              </Stack>
            </Stack>

            <ChevronRightIcon color="action" />
          </Paper>
        </ButtonBase>
      ))}
    </Stack>
  );
}

export default KaprodiDosenWaliDirectoryList;
