import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { getDosenStatusCategory, getDosenStatusColor } from './statusConfig.js';

function MahasiswaBimbinganRow({ item }) {
  const category = getDosenStatusCategory(item.status);
  // useNavigate: row dashboard dosen adalah pintu masuk ke detail mahasiswa.
  // Route pakai mahasiswa.id agar tetap bisa dibuka langsung via URL.
  const navigate = useNavigate();

  return (
    <ButtonBase
      onClick={() => navigate(`/dashboard/mahasiswa-bimbingan/${item.mahasiswa.id}`)}
      aria-label={`Buka detail ${item.mahasiswa.nama}`}
      sx={{
        borderRadius: 2,
        display: 'block',
        textAlign: 'left',
        width: '100%',
      }}
    >
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
          transition: 'border-color 120ms ease, box-shadow 120ms ease',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: 1,
          },
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
    </ButtonBase>
  );
}

export default MahasiswaBimbinganRow;
