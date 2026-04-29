import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Daftar matakuliah yang sudah ditambahkan ke FRS.
 * Setiap baris: nama matkul (kiri) + jumlah SKS (kanan).
 * @param {{ id, kelas: { nama_matkul, sks } }[]} items
 */
function MatkulFrsList({ items }) {
  return (
    <Box>
      <Typography fontWeight="bold" sx={{ mb: 1 }}>Mata Kuliah :</Typography>
      <Box sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1, minHeight: 100 }}>
        {items.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Belum ada matakuliah ditambahkan.</Typography>
          </Box>
        ) : (
          items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                bgcolor: 'grey.100',
                borderBottom: '1px solid',
                borderColor: 'grey.200',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Typography fontWeight="bold">{item.kelas.nama_matkul}</Typography>
              <Typography fontWeight="bold">SKS : {item.kelas.sks}</Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

export default MatkulFrsList;
