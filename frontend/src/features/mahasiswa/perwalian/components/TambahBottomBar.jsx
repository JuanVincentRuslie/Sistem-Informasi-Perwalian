import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// DRAWER_WIDTH harus sama dengan nilai di DashboardLayout.jsx
const DRAWER_WIDTH = 240;

/**
 * Bottom bar sticky di TambahMatkulPage.
 * Menampilkan jumlah matkul terpilih + total SKS + tombol Checkout.
 * @param {number} count - Jumlah matkul terpilih
 * @param {number} totalSks - Total SKS dari matkul terpilih
 * @param {Function} onCheckout
 * @param {boolean} disabled
 */
function TambahBottomBar({ count, totalSks, onCheckout, disabled }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: DRAWER_WIDTH,
        right: 0,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
      }}
    >
      <Typography>
        Matakuliah Terpilih : {count} ( {totalSks} SKS )
      </Typography>
      <Button variant="contained" onClick={onCheckout} disabled={disabled}>
        Checkout
      </Button>
    </Box>
  );
}

export default TambahBottomBar;
