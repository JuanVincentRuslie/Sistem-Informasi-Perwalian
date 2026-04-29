import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Tabel jadwal kuliah dari semua kelas FRS.
 * Setiap baris: nama matkul | hari | jam mulai - jam selesai.
 * @param {{ id, kelas: { nama_matkul, sesi: object[] } }[]} items
 */
function JadwalFrsList({ items }) {
  // Flatten semua sesi dari semua kelas menjadi baris tabel jadwal
  const rows = items.flatMap((item) =>
    (item.kelas.sesi ?? []).map((sesi) => ({
      nama: item.kelas.nama_matkul,
      hari: capitalize(sesi.hari),
      jam: `${sesi.jam_mulai} - ${sesi.jam_selesai}`,
    }))
  );

  return (
    <Box>
      <Typography fontWeight="bold" sx={{ mb: 1 }}>Jadwal :</Typography>
      <Box sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1, minHeight: 100 }}>
        {rows.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">Belum ada jadwal.</Typography>
          </Box>
        ) : (
          rows.map((row, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1.5,
                bgcolor: idx % 2 === 0 ? 'grey.100' : 'white',
              }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>{row.nama}</Typography>
              <Typography variant="body2" sx={{ flex: 1 }}>{row.hari}</Typography>
              <Typography variant="body2">{row.jam}</Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

export default JadwalFrsList;
