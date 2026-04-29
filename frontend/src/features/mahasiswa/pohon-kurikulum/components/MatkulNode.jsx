import { Handle, Position } from 'reactflow';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

// Warna background & border node berdasarkan status nilai.
// Disimpan di luar component supaya tidak di-recreate tiap render.
const COLOR_BY_STATUS = {
  LULUS: { background: '#c8e6c9', border: '#66bb6a' },
  TIDAK_LULUS: { background: '#ffcdd2', border: '#ef9a9a' },
  default: { background: '#ffffff', border: '#cccccc' },
};

function getColors(match) {
  if (!match) return COLOR_BY_STATUS.default;
  return COLOR_BY_STATUS[match.status] ?? COLOR_BY_STATUS.default;
}

/**
 * Custom node untuk pohon kurikulum.
 * Background color berubah sesuai status nilai mahasiswa.
 *
 * @param {object} props
 * @param {object} props.data - data matkul, di-inject otomatis oleh React Flow
 * @param {string} props.data.kode_aktif
 * @param {string} props.data.nama
 * @param {number} props.data.sks
 * @param {object|null} props.data.match - { status, nilai_huruf, nilai_angka }
 */
function MatkulNode({ data }) {
  // React Flow inject props ke custom node secara otomatis:
  // `data` berisi field yang kita taruh di nodes[i].data saat setup React Flow.
  // Component ini adalah component React biasa — bedanya hanya React Flow
  // yang mengurus posisi dan renderingnya di canvas.
  const { kode_aktif, nama, sks, match } = data;
  const { background, border } = getColors(match);

  return (
    <>
      {/* Handle target (input): titik koneksi di atas node.
          Artinya: edge dari node prasyarat masuk dari atas.
          Pohon kurikulum mengalir atas→bawah (semester awal→akhir). */}
      <Handle type="target" position={Position.Top} />

      <Paper
        elevation={2}
        sx={{
          width: 240,
          p: '12px',
          background,
          border: `2px solid ${border}`,
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block"
         sx={{ fontSize: '1.2rem' }}>
          {kode_aktif}
        </Typography>
        <Typography variant="body2" fontWeight="bold" sx={{ mt: 0.25,fontSize: '1.2rem' }}>
          {nama}
        </Typography>

        {/* Conditional rendering: section nilai hanya muncul kalau match ada.
            Kalau match=null (belum diambil), section ini tidak dirender sama sekali. */}
        {match && (
          <>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption">
                Nilai: <strong>{match.nilai_huruf}</strong>
              </Typography>
              <Typography variant="caption">
                SKS: <strong>{sks}</strong>
              </Typography>
            </Box>
          </>
        )}

        {/* Tampil SKS juga kalau belum ada nilai (match=null) */}
        {!match && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            {sks} SKS
          </Typography>
        )}
      </Paper>

      {/* Handle source (output): titik koneksi di bawah node.
          Artinya: edge ke node berikutnya keluar dari bawah. */}
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

export default MatkulNode;
