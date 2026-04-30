import DateRangeIcon from '@mui/icons-material/DateRange';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

const ACTION_ITEMS = [
  {
    label: 'Kelola Periode',
    description: 'Atur periode aktif dan siapkan upload data akademik.',
    path: '/dashboard/periode',
    icon: DateRangeIcon,
  },
  {
    label: 'Data Dosen Wali',
    description: 'Lihat daftar dosen wali dan distribusi bimbingan.',
    path: '/dashboard/dosen-wali',
    icon: GroupIcon,
  },
  {
    label: 'Data Mahasiswa',
    description: 'Pantau mahasiswa dan kebutuhan penugasan dosen wali.',
    path: '/dashboard/mahasiswa',
    icon: PersonIcon,
  },
];

function KaprodiQuickActions() {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Area Kerja Kaprodi
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {ACTION_ITEMS.map(({ label, description, path, icon: Icon }) => (
          <Paper
            key={label}
            variant="outlined"
            sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              minHeight: 176,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon fontSize="small" />
            </Box>

            <Typography variant="h6" component="h3">
              {label}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
              {description}
            </Typography>

            <Button
              component={RouterLink}
              to={path}
              variant="text"
              endIcon={<ArrowForwardIcon />}
              sx={{ alignSelf: 'flex-start', px: 0 }}
            >
              Buka
            </Button>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}

export default KaprodiQuickActions;
