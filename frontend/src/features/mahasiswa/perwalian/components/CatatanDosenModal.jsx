import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/**
 * Modal overlay yang menampilkan catatan dari dosen wali.
 * Muncul saat user klik tombol "Catatan" di PerwalianPage.
 * @param {boolean} open
 * @param {string|null} catatan
 * @param {Function} onClose
 */
function CatatanDosenModal({ open, catatan, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 520,
          outline: 'none',
        }}
      >
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography fontWeight="bold" gutterBottom>Catatan Dosen :</Typography>
          <Paper variant="outlined" sx={{ p: 2, minHeight: 160, mb: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" color={catatan ? 'text.primary' : 'text.secondary'}>
              {catatan ?? 'Tidak ada catatan dari dosen wali.'}
            </Typography>
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={onClose}>Kembali</Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  );
}

export default CatatanDosenModal;
