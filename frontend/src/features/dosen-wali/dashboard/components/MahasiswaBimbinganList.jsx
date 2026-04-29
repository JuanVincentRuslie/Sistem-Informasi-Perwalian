import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import MahasiswaBimbinganRow from './MahasiswaBimbinganRow.jsx';

function MahasiswaBimbinganList({ items }) {
  if (items.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary">
          Tidak ada mahasiswa yang cocok dengan pencarian atau filter.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'grid', gap: 2 }}>
        {items.map((item) => (
          <MahasiswaBimbinganRow key={item.mahasiswa.id} item={item} />
        ))}
      </Box>
    </Paper>
  );
}

export default MahasiswaBimbinganList;
