import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Table jadwal untuk satu kelas di dalam MatkulAccordionItem.
 * Header: "Kelas X", rows: bentuk pembelajaran | hari | jam, tombol Pilih di bawah.
 * @param {{ id, nama_kelas, sesi: object[] }} kelas
 * @param {boolean} isSelected - true kalau kelas ini yang dipilih mahasiswa
 * @param {Function} onPilih - toggle pilih/batal
 * @param {boolean} [readonly] - kalau true, sembunyikan tombol Pilih (mode lihat-saja)
 */
function KelasJadwalTable({ kelas, isSelected, pending = false, onPilih, readonly = false }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ px: 2, py: 1, bgcolor: 'grey.100' }}>
        <Typography fontWeight="bold" variant="body2">Kelas {kelas.nama_kelas}</Typography>
      </Box>

      {(kelas.sesi ?? []).map((sesi, idx) => (
        <Box
          key={sesi.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            bgcolor: idx % 2 === 0 ? 'grey.50' : 'white',
          }}
        >
          <Typography variant="body2" sx={{ flex: 1 }}>{sesi.bentuk_pembelajaran}</Typography>
          <Typography variant="body2" sx={{ flex: 1 }}>{capitalize(sesi.hari)}</Typography>
          <Typography variant="body2">{sesi.jam_mulai} - {sesi.jam_selesai}</Typography>
        </Box>
      ))}

      {!readonly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 1 }}>
          <Button
            variant={isSelected ? 'contained' : 'outlined'}
            size="small"
            startIcon={pending ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
            onClick={onPilih}
            disabled={pending}
          >
            {pending ? 'Memproses...' : 'Pilih'}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default KelasJadwalTable;
