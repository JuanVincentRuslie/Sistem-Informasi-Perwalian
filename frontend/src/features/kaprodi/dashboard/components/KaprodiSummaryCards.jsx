import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SchoolIcon from '@mui/icons-material/School';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

const SUMMARY_ITEMS = [
  {
    key: 'total_dosen_wali',
    label: 'Total Dosen Wali',
    icon: PeopleAltIcon,
    accent: 'primary.main',
  },
  {
    key: 'total_mahasiswa',
    label: 'Mahasiswa Terdaftar',
    icon: SchoolIcon,
    accent: 'success.main',
  },
  {
    key: 'mahasiswa_tanpa_dosen_wali',
    label: 'Mahasiswa tanpa Dosen Wali',
    icon: PersonSearchIcon,
    accent: 'warning.main',
  },
];

function KaprodiSummaryCards({ summary }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        gap: 2,
      }}
    >
      {SUMMARY_ITEMS.map(({ key, label, icon: Icon, accent }) => (
        <Paper
          key={key}
          variant="outlined"
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            minHeight: 122,
          }}
        >
          <Box
            sx={(theme) => ({
              width: 52,
              height: 52,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              color: accent,
              bgcolor: alpha(theme.palette[accent.split('.')[0]].main, 0.12),
              flexShrink: 0,
            })}
          >
            <Icon />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h4" component="p" fontWeight={700}>
              {summary?.[key] ?? 0}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

export default KaprodiSummaryCards;
