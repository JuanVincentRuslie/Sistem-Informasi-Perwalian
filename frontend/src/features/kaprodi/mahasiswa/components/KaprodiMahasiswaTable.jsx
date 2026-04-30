import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

function getStatusLabel(status) {
  if (status === 'APPROVED') return { label: 'Disetujui', color: 'success' };
  if (status === 'SUBMITTED') return { label: 'Menunggu', color: 'warning' };
  if (status === 'REJECTED') return { label: 'Perlu revisi', color: 'warning' };
  return { label: 'Draft / kosong', color: 'default' };
}

function KaprodiMahasiswaTable({ items, onSelect }) {
  if (items.length === 0) {
    return (
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">
                  Tidak ada mahasiswa yang cocok dengan filter saat ini.
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Table aria-label="Daftar mahasiswa">
        <TableHead>
          <TableRow>
            <TableCell>NIM</TableCell>
            <TableCell>Nama</TableCell>
            <TableCell>Angkatan</TableCell>
            <TableCell>IPK</TableCell>
            <TableCell>Dosen Wali</TableCell>
            <TableCell>Status FRS</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const status = getStatusLabel(item.status_frs);

            return (
              <TableRow
                key={item.id}
                hover
                onClick={() => onSelect(item)}
                sx={{
                  cursor: 'pointer',
                }}
              >
                <TableCell>{item.nim}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.angkatan}</TableCell>
                <TableCell>{item.ipk.toFixed(2)}</TableCell>
                <TableCell>
                  {item.dosen_wali?.nama ?? (
                    <Typography variant="body2" color="text.secondary">
                      Belum ada
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={status.label} color={status.color} variant={status.color === 'default' ? 'outlined' : 'filled'} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default KaprodiMahasiswaTable;
