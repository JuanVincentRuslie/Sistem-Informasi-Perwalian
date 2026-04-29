import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

function getInitial(nama) {
  return nama?.trim()?.charAt(0)?.toUpperCase() ?? '?';
}

function DosenWaliCard({ dosenWali }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Dosen Wali Saya
      </Typography>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {getInitial(dosenWali?.nama)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {dosenWali?.nama ?? '-'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dosenWali?.email ?? '-'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {dosenWali?.jadwal_perwalian ?? 'Jadwal belum tersedia'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default DosenWaliCard;
