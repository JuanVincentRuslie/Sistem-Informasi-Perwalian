import GroupIcon from '@mui/icons-material/Group';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SchoolIcon from '@mui/icons-material/School';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const SUMMARY_ITEMS = [
  {
    key: 'total_mahasiswa',
    label: 'Total Mahasiswa',
    icon: SchoolIcon,
    color: 'primary.main',
  },
  {
    key: 'mahasiswa_dengan_dosen_wali',
    label: 'Sudah Punya Dosen Wali',
    icon: GroupIcon,
    color: 'success.main',
  },
  {
    key: 'mahasiswa_tanpa_dosen_wali',
    label: 'Belum Punya Dosen Wali',
    icon: PersonOffIcon,
    color: 'warning.main',
  },
];

function KaprodiMahasiswaSummaryCards({ summary }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        gap: 2,
        mb: 4,
      }}
    >
      {SUMMARY_ITEMS.map(({ key, label, icon: Icon, color }) => (
        <Paper
          key={key}
          variant="outlined"
          sx={{
            p: 2.5,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              bgcolor: color,
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <Icon />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" component="p">
              {summary?.[key] ?? 0}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default KaprodiMahasiswaSummaryCards;
