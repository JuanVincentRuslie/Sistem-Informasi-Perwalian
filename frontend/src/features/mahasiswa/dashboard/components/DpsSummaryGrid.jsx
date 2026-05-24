import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

function SummaryItem({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        minHeight: 72,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="h6" component="p" fontWeight={700}>
        {value}
      </Typography>
    </Box>
  );
}

function DpsSummaryGrid({ previewData }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SummaryItem label="Periode Terdeteksi" value={previewData.periode_terdeteksi.nama} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <SummaryItem label="Total Baris" value={previewData.summary.total_rows} />
      </Grid>
    </Grid>
  );
}

export default DpsSummaryGrid;
