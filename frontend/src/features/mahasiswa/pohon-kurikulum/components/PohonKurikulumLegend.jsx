import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const NODE_STATUSES = [
  { color: '#c8e6c9', border: '#66bb6a', label: 'Lulus' },
  { color: '#ffcdd2', border: '#ef9a9a', label: 'Tidak Lulus' },
  { color: '#ffffff', border: '#cccccc', label: 'Belum Diambil' },
];

const EDGE_TYPES = [
  { color: '#1976d2', label: 'Prasyarat Lulus' },
  { color: '#9c27b0', label: 'Prasyarat Tempuh' },
  { color: '#ff9800', label: 'Prasyarat Tempuh atau Tempuh Bersama' },
  { color: '#4caf50', label: 'Prasyarat Lulus atau Tempuh Bersama' },
];

/**
 * Legend untuk pohon kurikulum.
 * Menjelaskan arti warna node dan jenis garis edge.
 * Static content, gak butuh props.
 */
function PohonKurikulumLegend() {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        Keterangan
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {/* Kolom kiri: warna node */}
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Status Nilai
          </Typography>
          <Stack spacing={1}>
            {NODE_STATUSES.map(({ color, border, label }) => (
              <Stack key={label} direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    background: color,
                    border: `2px solid ${border}`,
                    borderRadius: '3px',
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption">{label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Kolom kanan: warna edge */}
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Jenis Prasyarat
          </Typography>
          <Stack spacing={1}>
            {EDGE_TYPES.map(({ color, label }) => {
              // id unik per warna supaya SVG marker tidak saling override
              const markerId = `legend-arrow-${color.replace('#', '')}`;
              return (
                <Stack key={label} direction="row" alignItems="center" spacing={1}>
                  <svg width="40" height="12" style={{ flexShrink: 0 }}>
                    <defs>
                      <marker
                        id={markerId}
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                      </marker>
                    </defs>
                    <line
                      x1="0"
                      y1="6"
                      x2="38"
                      y2="6"
                      stroke={color}
                      strokeWidth="2"
                      markerEnd={`url(#${markerId})`}
                    />
                  </svg>
                  <Typography variant="caption">{label}</Typography>
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default PohonKurikulumLegend;
