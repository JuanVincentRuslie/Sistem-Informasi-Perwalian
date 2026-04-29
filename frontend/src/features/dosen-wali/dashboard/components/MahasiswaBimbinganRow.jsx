import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getDosenStatusCategory, getDosenStatusColor } from './statusConfig.js';

function MahasiswaBimbinganRow({ item }) {
  const category = getDosenStatusCategory(item.status);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '64px 1fr',
        minHeight: 72,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={(theme) => ({
          bgcolor: getDosenStatusColor(category, theme),
          borderRight: '1px solid',
          borderColor: 'divider',
        })}
      />
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h6" component="p">
          {item.mahasiswa.nama} - {item.mahasiswa.nim}
        </Typography>
      </Box>
    </Box>
  );
}

export default MahasiswaBimbinganRow;
